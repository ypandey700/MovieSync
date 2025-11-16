/**
 * Feature Engineering Module
 * Extracts and transforms features from user profiles and content data
 */

class FeatureEngineer {
  constructor() {
    // Genre weights based on user preferences
    this.genreWeights = {};
    // Actor/director preferences
    this.actorWeights = {};
    this.directorWeights = {};
    // Platform preferences
    this.platformWeights = {};
  }

  /**
   * Extract user features from user profile
   * @param {Object} user - User document from database
   * @returns {Object} User feature vector
   */
  extractUserFeatures(user) {
    const features = {
      // Genre preferences (normalized)
      genreVector: this._normalizeGenres(user.preferences?.genres || []),
      
      // Platform preferences
      platformVector: this._normalizePlatforms(user.preferences?.platforms || []),
      
      // Watch history statistics
      avgRating: this._calculateAvgRating(user.viewing_history || []),
      totalWatchTime: this._calculateTotalWatchTime(user.viewing_history || []),
      watchFrequency: user.viewing_history?.length || 0,
      
      // Content preferences from history
      preferredGenres: this._extractPreferredGenres(user.viewing_history || []),
      preferredActors: this._extractPreferredActors(user.viewing_history || []),
      preferredDirectors: this._extractPreferredDirectors(user.viewing_history || []),
      
      // Recency bias (prefer recent watches)
      recentWatchGenres: this._extractRecentGenres(user.viewing_history || [], 30), // last 30 days
      
      // Completion rate
      completionRate: this._calculateCompletionRate(user.viewing_history || []),
    };

    return features;
  }

  /**
   * Extract content features
   * @param {Object} content - Content document from database
   * @returns {Object} Content feature vector
   */
  extractContentFeatures(content) {
    const features = {
      genres: content.genre || [],
      moodTags: content.mood_tags || [],
      cast: content.cast || [],
      director: content.director || '',
      platform: content.platform || '',
      rating: content.rating || 0,
      year: content.year || new Date().getFullYear(),
      duration: content.duration || 0,
      
      // Derived features
      isRecent: this._isRecentContent(content.year),
      popularityScore: content.rating || 0,
      freshnessScore: this._calculateFreshness(content.year, content.timestamp),
    };

    return features;
  }

  /**
   * Calculate contextual features
   * @param {Object} context - Contextual signals (time, device, social)
   * @returns {Object} Contextual feature vector
   */
  extractContextFeatures(context) {
    const hour = context.timeOfDay ? new Date(context.timeOfDay).getHours() : new Date().getHours();
    
    return {
      timeOfDay: hour,
      timeCategory: this._categorizeTime(hour),
      device: context.device || 'unknown',
      isSocialContext: context.socialContext || false,
      dayOfWeek: context.dayOfWeek || new Date().getDay(),
    };
  }

  /**
   * Calculate similarity between user and content
   * @param {Object} userFeatures - User feature vector
   * @param {Object} contentFeatures - Content feature vector
   * @param {Object} contextFeatures - Context feature vector
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(userFeatures, contentFeatures, contextFeatures = {}) {
    let score = 0;
    let weights = 0;

    // Genre matching (40% weight)
    const genreScore = this._genreSimilarity(
      userFeatures.genreVector,
      contentFeatures.genres,
      userFeatures.preferredGenres
    );
    score += genreScore * 0.4;
    weights += 0.4;

    // Platform preference (10% weight)
    const platformScore = userFeatures.platformVector[contentFeatures.platform] || 0;
    score += platformScore * 0.1;
    weights += 0.1;

    // Rating preference (20% weight)
    const ratingScore = this._ratingSimilarity(userFeatures.avgRating, contentFeatures.rating);
    score += ratingScore * 0.2;
    weights += 0.2;

    // Actor/director preference (15% weight)
    const castScore = this._castSimilarity(
      userFeatures.preferredActors,
      contentFeatures.cast,
      userFeatures.preferredDirectors,
      contentFeatures.director
    );
    score += castScore * 0.15;
    weights += 0.15;

    // Contextual factors (10% weight)
    const contextScore = this._contextSimilarity(contentFeatures, contextFeatures);
    score += contextScore * 0.1;
    weights += 0.1;

    // Freshness bonus (5% weight)
    const freshnessScore = contentFeatures.freshnessScore;
    score += freshnessScore * 0.05;
    weights += 0.05;

    return weights > 0 ? score / weights : 0;
  }

  // Private helper methods

  _normalizeGenres(genres) {
    const vector = {};
    if (genres.length === 0) return vector;
    const weight = 1.0 / genres.length;
    genres.forEach(genre => {
      vector[genre] = (vector[genre] || 0) + weight;
    });
    return vector;
  }

  _normalizePlatforms(platforms) {
    const vector = {};
    if (platforms.length === 0) return vector;
    const weight = 1.0 / platforms.length;
    platforms.forEach(platform => {
      vector[platform] = (vector[platform] || 0) + weight;
    });
    return vector;
  }

  _calculateAvgRating(history) {
    const ratings = history.filter(h => h.rating).map(h => h.rating);
    if (ratings.length === 0) return 5.0; // Default neutral rating
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  _calculateTotalWatchTime(history) {
    return history.reduce((sum, h) => sum + (h.watchTime || 0), 0);
  }

  _extractPreferredGenres(history) {
    const genreCounts = {};
    history.forEach(h => {
      // Assuming genre info might be in history or needs to be fetched
      // For now, we'll use a placeholder
    });
    return genreCounts;
  }

  _extractPreferredActors(history) {
    // Would need actor data in history or content lookup
    return {};
  }

  _extractPreferredDirectors(history) {
    // Would need director data in history or content lookup
    return {};
  }

  _extractRecentGenres(history, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = history.filter(h => new Date(h.timestamp) >= cutoff);
    // Extract genres from recent watches
    return {};
  }

  _calculateCompletionRate(history) {
    if (history.length === 0) return 0;
    const completed = history.filter(h => {
      if (h.totalDuration && h.lastWatchPosition) {
        return h.lastWatchPosition / h.totalDuration >= 0.9;
      }
      return false;
    });
    return completed.length / history.length;
  }

  _isRecentContent(year) {
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 2;
  }

  _calculateFreshness(year, timestamp) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    // Fresher content gets higher score (max 5 years old = 1.0, older = lower)
    return Math.max(0, 1 - age / 5);
  }

  _categorizeTime(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  _genreSimilarity(userGenres, contentGenres, preferredGenres) {
    if (contentGenres.length === 0) return 0.5;
    
    const userGenreSet = new Set(Object.keys(userGenres));
    const contentGenreSet = new Set(contentGenres);
    
    const intersection = [...userGenreSet].filter(g => contentGenreSet.has(g));
    const union = new Set([...userGenreSet, ...contentGenreSet]);
    
    if (union.size === 0) return 0.5;
    
    // Jaccard similarity
    return intersection.length / union.size;
  }

  _ratingSimilarity(userAvgRating, contentRating) {
    if (!contentRating) return 0.5;
    const diff = Math.abs(userAvgRating - contentRating);
    // Closer ratings = higher score
    return Math.max(0, 1 - diff / 5);
  }

  _castSimilarity(preferredActors, contentCast, preferredDirectors, contentDirector) {
    let score = 0;
    
    // Actor matching
    if (preferredActors && contentCast) {
      const actorMatches = contentCast.filter(actor => preferredActors[actor]);
      score += actorMatches.length / Math.max(contentCast.length, 1) * 0.7;
    }
    
    // Director matching
    if (preferredDirectors && contentDirector) {
      if (preferredDirectors[contentDirector]) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1.0);
  }

  _contextSimilarity(contentFeatures, contextFeatures) {
    let score = 0.5; // Default neutral
    
    // Time-based preferences (e.g., lighter content in morning, darker at night)
    if (contextFeatures.timeCategory === 'night' && contentFeatures.genres.includes('Horror')) {
      score += 0.2;
    }
    if (contextFeatures.timeCategory === 'morning' && contentFeatures.genres.includes('Comedy')) {
      score += 0.2;
    }
    
    // Duration preferences based on time
    if (contextFeatures.timeCategory === 'evening' && contentFeatures.duration > 90) {
      score += 0.1; // Prefer longer content in evening
    }
    
    return Math.min(score, 1.0);
  }
}

export default FeatureEngineer;

