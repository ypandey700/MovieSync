/**
 * Test Recommendations - Script to test recommendation system with different moods
 * Run this to verify recommendations work for all moods
 */

import express from 'express';
import RecommendationEngine from '../ML model/models/recommendation_engine.js';
import User from '../models/User.js';
import Content from '../models/Content.js';

const router = express.Router();

/**
 * GET /api/test/recommendations
 * Test recommendations for all moods
 */
router.get('/', async (req, res) => {
  try {
    // Get first user or create test user
    let user = await User.findOne({});
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No users found. Please create a user first.',
      });
    }

    const contentCount = await Content.countDocuments();
    if (contentCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found. Please seed content first using POST /api/content/seed',
      });
    }

    const recommendationEngine = new RecommendationEngine();
    const moods = [
      'happy',
      'sad',
      'excited',
      'relaxed',
      'stressed',
      'bored',
      'romantic',
      'adventurous',
      'thoughtful',
      'energetic',
      'melancholic',
      'nostalgic',
      'thrilled',
      'peaceful',
      'curious',
    ];

    const results = {};

    for (const mood of moods) {
      try {
        const recommendations = await recommendationEngine.getRecommendations(user._id.toString(), {
          moodText: mood,
          intensity: 0.8,
          context: {
            timeOfDay: new Date().toISOString(),
            device: 'desktop',
            socialContext: false,
          },
          limit: 5,
        });

        results[mood] = {
          success: true,
          count: recommendations.length,
          recommendations: recommendations.map(rec => ({
            title: rec.title,
            genres: rec.genres,
            explanation: rec.explanation,
            score: rec.score,
          })),
        };
      } catch (error) {
        results[mood] = {
          success: false,
          error: error.message,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: 'Recommendation testing completed',
      contentCount,
      userId: user._id.toString(),
      results,
    });
  } catch (error) {
    console.error('Test recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test recommendations',
    });
  }
});

export default router;

