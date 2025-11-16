/**
 * Hybrid Recommendation Engine
 * Combines content-based, collaborative filtering, and mood-based recommendations
 */

import FeatureEngineer from '../features/feature_engineer.js';
import MoodAnalyzer from '../utils/mood_analyzer.js';
import Content from '../../models/Content.js';
import User from '../../models/User.js';

class RecommendationEngine {
  constructor() {
    this.featureEngineer = new FeatureEngineer();
    this.moodAnalyzer = new MoodAnalyzer();
    this.diversityWeight = 0.2; // Weight for diversity in final ranking
  }

  /**
   * Get personalized recommendations
   * @param {string} userId - User ID
   * @param {Object} options - Recommendation options
   * @param {string} options.moodText - Textual mood description
   * @param {number} options.intensity - Mood intensity (0-1)
   * @param {Object} options.context - Contextual signals
   * @param {number} options.limit - Number of recommendations (default 10)
   * @returns {Promise<Array>} Ranked list of recommendations with explanations
   */
  async getRecommendations(userId, options = {}) {
    const {
      moodText = '',
      intensity = null,
      context = {},
      limit = 10,
    } = options;

    try {
      // Fetch user and content data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allContent = await Content.find({});
      if (allContent.length === 0) {
        return [];
      }

      // Analyze mood
      const moodAnalysis = this.moodAnalyzer.analyzeMood(moodText, intensity);

      // Extract features
      const userFeatures = this.featureEngineer.extractUserFeatures(user);
      const contextFeatures = this.featureEngineer.extractContextFeatures(context);

      // Score all content
      const scoredContent = await Promise.all(
        allContent.map(async (content) => {
          const contentFeatures = this.featureEngineer.extractContentFeatures(content);
          
          // Calculate base similarity score
          const similarityScore = this.featureEngineer.calculateSimilarity(
            userFeatures,
            contentFeatures,
            contextFeatures
          );

          // Calculate mood compatibility
          const moodScore = this.moodAnalyzer.getMoodCompatibility(
            contentFeatures.moodTags,
            moodAnalysis
          );

          // Check if already watched (penalty)
          const watchedPenalty = this._calculateWatchedPenalty(
            user.viewing_history || [],
            content.contentId
          );

          // Genre preference boost
          const genreBoost = this._calculateGenreBoost(
            userFeatures.genreVector,
            contentFeatures.genres,
            moodAnalysis.genres
          );

          // Final score (weighted combination)
          const finalScore = (
            similarityScore * 0.4 +
            moodScore * 0.3 +
            genreBoost * 0.2 +
            (1 - watchedPenalty) * 0.1
          );

          return {
            content: content.toObject(),
            score: finalScore,
            similarityScore,
            moodScore,
            genreBoost,
            watchedPenalty,
          };
        })
      );

      // Filter out already watched content (optional - can be configurable)
      const filteredContent = scoredContent.filter(
        item => item.watchedPenalty < 0.9 // Allow recently watched with low score
      );

      // Sort by score
      filteredContent.sort((a, b) => b.score - a.score);

      // Apply diversity boost
      const diversifiedContent = this._applyDiversityBoost(filteredContent, limit);

      // Generate explanations
      const recommendations = diversifiedContent.slice(0, limit).map((item, index) => {
        const explanation = this._generateExplanation(
          item,
          userFeatures,
          moodAnalysis,
          index
        );

        return {
          rank: index + 1,
          contentId: item.content.contentId,
          title: item.content.title,
          thumbnailUrl: item.content.thumbnailUrl,
          platform: item.content.platform,
          rating: item.content.rating,
          genres: item.content.genre,
          score: item.score,
          explanation: explanation,
          metadata: {
            similarityScore: item.similarityScore,
            moodScore: item.moodScore,
            genreBoost: item.genreBoost,
          },
        };
      });

      return recommendations;
    } catch (error) {
      console.error('Recommendation engine error:', error);
      throw error;
    }
  }

  /**
   * Calculate penalty for already watched content
   */
  _calculateWatchedPenalty(history, contentId) {
    const watchRecord = history.find(h => h.contentId === contentId);
    if (!watchRecord) return 0;

    // If completed, high penalty
    if (watchRecord.totalDuration && watchRecord.lastWatchPosition) {
      const completion = watchRecord.lastWatchPosition / watchRecord.totalDuration;
      if (completion >= 0.9) return 0.9; // High penalty for completed
      if (completion >= 0.5) return 0.5; // Medium penalty for partially watched
    }

    // If rated highly, lower penalty (might want to rewatch)
    if (watchRecord.rating >= 4) return 0.3;

    return 0.7; // Default penalty for watched
  }

  /**
   * Calculate genre boost based on user preferences and mood
   */
  _calculateGenreBoost(userGenres, contentGenres, moodGenres) {
    let boost = 0.5; // Base score

    // User genre preference
    contentGenres.forEach(genre => {
      if (userGenres[genre]) {
        boost += userGenres[genre] * 0.3;
      }
    });

    // Mood genre matching
    const moodGenreSet = new Set(moodGenres);
    const contentGenreSet = new Set(contentGenres);
    const moodMatches = [...moodGenreSet].filter(g => contentGenreSet.has(g));
    if (moodMatches.length > 0) {
      boost += 0.2;
    }

    return Math.min(boost, 1.0);
  }

  /**
   * Apply diversity boost to avoid too similar recommendations
   */
  _applyDiversityBoost(scoredContent, limit) {
    if (scoredContent.length <= limit) return scoredContent;

    const diversified = [];
    const usedGenres = new Set();
    const usedPlatforms = new Set();

    for (const item of scoredContent) {
      if (diversified.length >= limit) break;

      const contentGenres = item.content.genre || [];
      const platform = item.content.platform || '';

      // Calculate diversity score
      const genreOverlap = contentGenres.filter(g => usedGenres.has(g)).length;
      const platformOverlap = usedPlatforms.has(platform) ? 1 : 0;

      // Boost score if diverse
      const diversityBonus = (1 - (genreOverlap / Math.max(contentGenres.length, 1))) * 0.1 +
                            (1 - platformOverlap) * 0.05;

      item.score += diversityBonus;

      // Add to used sets
      contentGenres.forEach(g => usedGenres.add(g));
      if (platform) usedPlatforms.add(platform);
    }

    // Re-sort with diversity boost
    scoredContent.sort((a, b) => b.score - a.score);

    return scoredContent;
  }

  /**
   * Generate human-readable explanation for recommendation
   */
  _generateExplanation(item, userFeatures, moodAnalysis, rank) {
    const reasons = [];

    // Mood-based explanation
    if (item.moodScore > 0.7) {
      reasons.push(`Perfect for your ${moodAnalysis.primaryMood} mood`);
    } else if (item.moodScore > 0.5) {
      reasons.push(`Matches your current mood`);
    }

    // Genre-based explanation
    if (item.genreBoost > 0.7) {
      const matchingGenres = item.content.genre.filter(g => 
        userFeatures.genreVector[g] || moodAnalysis.genres.includes(g)
      );
      if (matchingGenres.length > 0) {
        reasons.push(`Features your favorite ${matchingGenres[0]} genre`);
      }
    }

    // Similarity-based explanation
    if (item.similarityScore > 0.7) {
      reasons.push(`Similar to content you've enjoyed`);
    }

    // Rating-based explanation
    if (item.content.rating >= 8) {
      reasons.push(`Highly rated (${item.content.rating}/10)`);
    } else if (item.content.rating >= 7) {
      reasons.push(`Well-reviewed content`);
    }

    // Freshness explanation
    const currentYear = new Date().getFullYear();
    if (item.content.year >= currentYear - 1) {
      reasons.push(`Recently released`);
    }

    // Default explanation if no specific reasons
    if (reasons.length === 0) {
      reasons.push(`Recommended based on your viewing preferences`);
    }

    // Return top 1-2 reasons
    return reasons.slice(0, 2).join('. ') + '.';
  }

  /**
   * Get cold start recommendations (for new users)
   */
  async getColdStartRecommendations(options = {}) {
    const { moodText = '', limit = 10 } = options;

    try {
      const moodAnalysis = this.moodAnalyzer.analyzeMood(moodText);
      
      // Get popular content matching mood
      const allContent = await Content.find({})
        .sort({ rating: -1 })
        .limit(limit * 3);

      const scoredContent = allContent.map(content => {
        const contentFeatures = this.featureEngineer.extractContentFeatures(content);
        const moodScore = this.moodAnalyzer.getMoodCompatibility(
          contentFeatures.moodTags,
          moodAnalysis
        );

        // Combine popularity and mood
        const score = (content.rating / 10) * 0.6 + moodScore * 0.4;

        return {
          content: content.toObject(),
          score,
          moodScore,
        };
      });

      scoredContent.sort((a, b) => b.score - a.score);

      return scoredContent.slice(0, limit).map((item, index) => ({
        rank: index + 1,
        contentId: item.content.contentId,
        title: item.content.title,
        thumbnailUrl: item.content.thumbnailUrl,
        platform: item.content.platform,
        rating: item.content.rating,
        genres: item.content.genre,
        score: item.score,
        explanation: `Popular ${moodAnalysis.primaryMood} content with high ratings`,
      }));
    } catch (error) {
      console.error('Cold start recommendation error:', error);
      throw error;
    }
  }
}

export default RecommendationEngine;

