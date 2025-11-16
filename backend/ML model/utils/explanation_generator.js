

class ExplanationGenerator {
  constructor() {
    this.explanationTemplates = {
      mood: [
        "Perfect for your {mood} mood",
        "Matches your current {mood} vibe",
        "Ideal for when you're feeling {mood}",
        "Great choice for a {mood} evening",
      ],
      genre: [
        "Features your favorite {genre} genre",
        "A {genre} film you'll love",
        "Classic {genre} content",
        "Top-rated {genre} selection",
      ],
      similarity: [
        "Similar to content you've enjoyed",
        "Based on your viewing history",
        "Matches your preferences",
        "Recommended based on your past watches",
      ],
      rating: [
        "Highly rated ({rating}/10)",
        "Well-reviewed content",
        "Critically acclaimed",
        "Top-rated selection",
      ],
      freshness: [
        "Recently released",
        "New and trending",
        "Fresh content",
        "Latest release",
      ],
      actor: [
        "Starring {actor}",
        "Featuring {actor}",
        "With {actor} in the cast",
      ],
      director: [
        "Directed by {director}",
        "From director {director}",
      ],
      platform: [
        "Available on {platform}",
        "Streaming on {platform}",
      ],
    };
  }

  /**
   * Generate explanation from recommendation metadata
   * @param {Object} recommendation - Recommendation object with metadata
   * @param {Object} userFeatures - User feature vector
   * @param {Object} moodAnalysis - Mood analysis result
   * @returns {string} Human-readable explanation
   */
  generateExplanation(recommendation, userFeatures, moodAnalysis) {
    const reasons = [];
    const metadata = recommendation.metadata || {};

    // Mood-based (highest priority if strong)
    if (metadata.moodScore > 0.7) {
      reasons.push(this._getRandomTemplate('mood', { mood: moodAnalysis.primaryMood }));
    }

    // Genre-based
    if (metadata.genreBoost > 0.6) {
      const topGenre = this._getTopGenre(recommendation.genres, userFeatures, moodAnalysis);
      if (topGenre) {
        reasons.push(this._getRandomTemplate('genre', { genre: topGenre }));
      }
    }

    // Similarity-based
    if (metadata.similarityScore > 0.7) {
      reasons.push(this._getRandomTemplate('similarity'));
    }

    // Rating-based
    if (recommendation.rating >= 8) {
      reasons.push(this._getRandomTemplate('rating', { rating: recommendation.rating }));
    }

    // Freshness
    if (recommendation.year && this._isRecent(recommendation.year)) {
      reasons.push(this._getRandomTemplate('freshness'));
    }

    // Ensure at least one reason
    if (reasons.length === 0) {
      reasons.push("Recommended based on your preferences");
    }

    // Return 1-2 most relevant reasons
    return reasons.slice(0, 2).join('. ') + '.';
  }

  /**
   * Generate detailed explanation with multiple factors
   */
  generateDetailedExplanation(recommendation, userFeatures, moodAnalysis) {
    const factors = [];

    // Mood match
    if (recommendation.metadata?.moodScore > 0.5) {
      factors.push({
        type: 'mood',
        strength: recommendation.metadata.moodScore,
        text: `Strong match for ${moodAnalysis.primaryMood} mood (${Math.round(recommendation.metadata.moodScore * 100)}%)`,
      });
    }

    // Genre preference
    if (recommendation.metadata?.genreBoost > 0.5) {
      factors.push({
        type: 'genre',
        strength: recommendation.metadata.genreBoost,
        text: `Matches your genre preferences (${Math.round(recommendation.metadata.genreBoost * 100)}%)`,
      });
    }

    // Similarity
    if (recommendation.metadata?.similarityScore > 0.5) {
      factors.push({
        type: 'similarity',
        strength: recommendation.metadata.similarityScore,
        text: `Similar to your viewing history (${Math.round(recommendation.metadata.similarityScore * 100)}%)`,
      });
    }

    // Rating
    if (recommendation.rating >= 7) {
      factors.push({
        type: 'quality',
        strength: recommendation.rating / 10,
        text: `High rating: ${recommendation.rating}/10`,
      });
    }

    return factors;
  }

  // Private helper methods

  _getRandomTemplate(type, params = {}) {
    const templates = this.explanationTemplates[type] || [];
    if (templates.length === 0) return '';

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders
    let result = template;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }

    return result;
  }

  _getTopGenre(contentGenres, userFeatures, moodAnalysis) {
    // Check mood genres first
    for (const genre of moodAnalysis.genres) {
      if (contentGenres.includes(genre)) {
        return genre;
      }
    }

    // Then check user preferences
    const userGenreEntries = Object.entries(userFeatures.genreVector || {})
      .sort((a, b) => b[1] - a[1]);

    for (const [genre, weight] of userGenreEntries) {
      if (contentGenres.includes(genre)) {
        return genre;
      }
    }

    // Return first genre if no match
    return contentGenres[0] || null;
  }

  _isRecent(year) {
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 2;
  }
}

export default ExplanationGenerator;

