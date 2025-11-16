/**
 * Recommendation API Routes
 * Handles recommendation requests with mood, context, and user preferences
 */

import express from 'express';
import RecommendationEngine from '../ML model/models/recommendation_engine.js';
import RecommendationMetrics from '../ML model/evaluation/metrics.js';
import ABTestFramework from '../ML model/ab_testing/ab_test_framework.js';
import User from '../models/User.js';
import Content from '../models/Content.js';

const router = express.Router();
const recommendationEngine = new RecommendationEngine();
const metrics = new RecommendationMetrics();
const abTestFramework = new ABTestFramework();

// Initialize default A/B test experiment
abTestFramework.createExperiment({
  experimentId: 'mood_recommendations_v1',
  name: 'Mood-Based Recommendations',
  variants: [
    { name: 'control', description: 'Baseline recommendations' },
    { name: 'variant', description: 'Enhanced mood-based recommendations' },
  ],
  trafficSplit: { control: 0.5, variant: 0.5 },
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
});

/**
 * GET /api/recommendations/:userId
 * Get personalized recommendations for a user
 * 
 * Query parameters:
 * - mood: Textual mood description (optional)
 * - intensity: Mood intensity 0-1 (optional)
 * - timeOfDay: Time of day (optional)
 * - device: Device type (optional)
 * - socialContext: Boolean for social context (optional)
 * - limit: Number of recommendations (default: 10)
 * - experimentId: A/B test experiment ID (optional)
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      mood,
      intensity,
      timeOfDay,
      device,
      socialContext,
      limit = 10,
      experimentId = 'mood_recommendations_v1',
    } = req.query;

    console.log(`[Recommendations] Request for user ${userId}, mood: ${mood || 'none'}`);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`[Recommendations] User ${userId} not found`);
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check content count
    const contentCount = await Content.countDocuments();
    console.log(`[Recommendations] Content in database: ${contentCount}`);

    // Assign user to A/B test variant
    const variant = abTestFramework.assignUser(userId, experimentId);

    // Build context object
    const context = {
      timeOfDay: timeOfDay || new Date().toISOString(),
      device: device || 'unknown',
      socialContext: socialContext === 'true',
      dayOfWeek: new Date().getDay(),
    };

    let recommendations = [];

    // If no content in database, use cold start or return helpful message
    if (contentCount === 0) {
      console.log('[Recommendations] No content in database, using cold start');
      recommendations = await recommendationEngine.getColdStartRecommendations({
        moodText: mood || '',
        limit: parseInt(limit),
      });
      
      // If cold start also returns empty, provide helpful message
      if (recommendations.length === 0) {
        return res.status(200).json({
          success: true,
          recommendations: [],
          message: 'No content available in database. Please add content to get recommendations.',
          variant,
          experimentId,
          count: 0,
        });
      }
    } else {
      // Get recommendations
      recommendations = await recommendationEngine.getRecommendations(userId, {
        moodText: mood || '',
        intensity: intensity ? parseFloat(intensity) : null,
        context,
        limit: parseInt(limit),
      });
    }

    console.log(`[Recommendations] Generated ${recommendations.length} recommendations`);

    // Record impression for A/B testing
    abTestFramework.recordImpression(userId, experimentId, variant, recommendations);

    res.status(200).json({
      success: true,
      recommendations,
      variant,
      experimentId,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('[Recommendations] Error:', error);
    console.error('[Recommendations] Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate recommendations',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * POST /api/recommendations/:userId/feedback
 * Record user feedback on recommendations (for evaluation)
 * 
 * Body:
 * - contentId: Content ID that was interacted with
 * - action: Type of action (click, watch, skip, etc.)
 * - rating: Optional rating (1-5)
 * - experimentId: A/B test experiment ID
 */
router.post('/:userId/feedback', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentId, action, rating, experimentId = 'mood_recommendations_v1' } = req.body;

    // Get user's assigned variant
    const userExperiments = abTestFramework.userAssignments.get(userId);
    const variant = userExperiments?.get(experimentId) || 'control';

    // Record click/interaction
    if (action === 'click' || action === 'watch') {
      abTestFramework.recordClick(userId, experimentId, variant, contentId);
    }

    // Record conversion
    if (action === 'watch') {
      abTestFramework.recordConversion(userId, experimentId, variant, 'watch_started');
    }

    // Record engagement (if rating provided)
    if (rating) {
      abTestFramework.recordEngagement(userId, experimentId, variant, 'rating', rating);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback recorded',
    });
  } catch (error) {
    console.error('Feedback recording error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record feedback',
    });
  }
});

/**
 * GET /api/recommendations/:userId/evaluate
 * Evaluate recommendation quality for a user (offline evaluation)
 * 
 * Query parameters:
 * - k: Number of top recommendations to evaluate (default: 10)
 */
router.get('/:userId/evaluate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { k = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recommendations
    const recommendations = await recommendationEngine.getRecommendations(userId, {
      limit: parseInt(k),
    });

    // Get ground truth (user's viewing history with ratings >= 4)
    const relevantItems = (user.viewing_history || [])
      .filter(item => item.rating >= 4)
      .map(item => item.contentId);

    // Get total content count
    const totalItems = await Content.countDocuments();

    // Calculate metrics
    const evaluationResults = metrics.evaluate(recommendations, relevantItems, {
      k: parseInt(k),
      totalItems,
    });

    res.status(200).json({
      success: true,
      evaluation: evaluationResults,
      recommendationsCount: recommendations.length,
      relevantItemsCount: relevantItems.length,
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate recommendations',
    });
  }
});

/**
 * GET /api/recommendations/ab-test/:experimentId
 * Get A/B test results
 */
router.get('/ab-test/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const results = abTestFramework.getResults(experimentId);

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('A/B test results error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get A/B test results',
    });
  }
});

/**
 * POST /api/recommendations/ab-test
 * Create a new A/B test experiment
 */
router.post('/ab-test', async (req, res) => {
  try {
    const config = req.body;
    abTestFramework.createExperiment(config);

    res.status(201).json({
      success: true,
      message: 'A/B test experiment created',
      experimentId: config.experimentId,
    });
  } catch (error) {
    console.error('A/B test creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create A/B test',
    });
  }
});

/**
 * GET /api/recommendations/cold-start
 * Get cold start recommendations (for new users)
 * 
 * Query parameters:
 * - mood: Textual mood description (optional)
 * - limit: Number of recommendations (default: 10)
 */
router.get('/cold-start', async (req, res) => {
  try {
    const { mood, limit = 10 } = req.query;

    const recommendations = await recommendationEngine.getColdStartRecommendations({
      moodText: mood || '',
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Cold start recommendation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate cold start recommendations',
    });
  }
});

export default router;

