/**
 * Evaluation Metrics for Recommendation System
 * Implements precision@k, NDCG@k, and diversity metrics
 */

class RecommendationMetrics {
  /**
   * Calculate Precision@K
   * @param {Array} recommendations - Recommended items (top K)
   * @param {Array} relevantItems - Set of relevant items (ground truth)
   * @param {number} k - Number of top recommendations to consider
   * @returns {number} Precision@K score (0-1)
   */
  precisionAtK(recommendations, relevantItems, k = 10) {
    if (recommendations.length === 0) return 0;

    const topK = recommendations.slice(0, k);
    const relevantSet = new Set(relevantItems.map(item => 
      typeof item === 'string' ? item : item.contentId || item.id
    ));

    const relevantCount = topK.filter(rec => {
      const recId = typeof rec === 'string' ? rec : rec.contentId || rec.id;
      return relevantSet.has(recId);
    }).length;

    return relevantCount / Math.min(k, recommendations.length);
  }

  /**
   * Calculate Recall@K
   * @param {Array} recommendations - Recommended items
   * @param {Array} relevantItems - Set of all relevant items
   * @param {number} k - Number of top recommendations
   * @returns {number} Recall@K score (0-1)
   */
  recallAtK(recommendations, relevantItems, k = 10) {
    if (relevantItems.length === 0) return 0;

    const topK = recommendations.slice(0, k);
    const relevantSet = new Set(relevantItems.map(item => 
      typeof item === 'string' ? item : item.contentId || item.id
    ));

    const relevantCount = topK.filter(rec => {
      const recId = typeof rec === 'string' ? rec : rec.contentId || rec.id;
      return relevantSet.has(recId);
    }).length;

    return relevantCount / relevantItems.length;
  }

  /**
   * Calculate NDCG@K (Normalized Discounted Cumulative Gain)
   * @param {Array} recommendations - Recommended items with relevance scores
   * @param {Array} relevantItems - Ground truth relevant items with relevance scores
   * @param {number} k - Number of top recommendations
   * @returns {number} NDCG@K score (0-1)
   */
  ndcgAtK(recommendations, relevantItems, k = 10) {
    if (recommendations.length === 0) return 0;

    // Create relevance map
    const relevanceMap = new Map();
    relevantItems.forEach(item => {
      const id = typeof item === 'string' ? item : item.contentId || item.id;
      const relevance = typeof item === 'object' && item.relevance !== undefined 
        ? item.relevance 
        : 1; // Binary relevance if not specified
      relevanceMap.set(id, relevance);
    });

    // Calculate DCG
    let dcg = 0;
    const topK = recommendations.slice(0, k);
    
    topK.forEach((rec, index) => {
      const recId = typeof rec === 'string' ? rec : rec.contentId || rec.id;
      const relevance = relevanceMap.get(recId) || 0;
      const position = index + 1;
      dcg += relevance / Math.log2(position + 1);
    });

    // Calculate Ideal DCG (IDCG)
    const sortedRelevances = Array.from(relevanceMap.values())
      .sort((a, b) => b - a)
      .slice(0, k);

    let idcg = 0;
    sortedRelevances.forEach((relevance, index) => {
      const position = index + 1;
      idcg += relevance / Math.log2(position + 1);
    });

    // NDCG = DCG / IDCG
    return idcg > 0 ? dcg / idcg : 0;
  }

  /**
   * Calculate Diversity Metric (Intra-List Diversity)
   * Measures how different the recommended items are from each other
   * @param {Array} recommendations - Recommended items
   * @param {Function} similarityFn - Function to calculate similarity between two items
   * @param {number} k - Number of top recommendations
   * @returns {number} Diversity score (0-1, higher = more diverse)
   */
  diversityAtK(recommendations, similarityFn, k = 10) {
    if (recommendations.length < 2) return 1; // Single item is perfectly diverse

    const topK = recommendations.slice(0, k);
    let totalSimilarity = 0;
    let pairs = 0;

    // Calculate pairwise similarities
    for (let i = 0; i < topK.length; i++) {
      for (let j = i + 1; j < topK.length; j++) {
        const similarity = similarityFn(topK[i], topK[j]);
        totalSimilarity += similarity;
        pairs++;
      }
    }

    // Diversity = 1 - average similarity
    const avgSimilarity = pairs > 0 ? totalSimilarity / pairs : 0;
    return 1 - avgSimilarity;
  }

  /**
   * Calculate Genre Diversity
   * Measures diversity based on genre distribution
   * @param {Array} recommendations - Recommended items with genres
   * @param {number} k - Number of top recommendations
   * @returns {number} Genre diversity score (0-1)
   */
  genreDiversityAtK(recommendations, k = 10) {
    if (recommendations.length === 0) return 0;

    const topK = recommendations.slice(0, k);
    const genreCounts = new Map();

    // Count genre occurrences
    topK.forEach(rec => {
      const genres = rec.genres || rec.genre || [];
      genres.forEach(genre => {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      });
    });

    // Calculate entropy (Shannon diversity)
    const total = topK.length;
    let entropy = 0;

    genreCounts.forEach(count => {
      const probability = count / total;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    });

    // Normalize by maximum possible entropy (log2 of number of unique genres)
    const maxEntropy = Math.log2(genreCounts.size || 1);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  /**
   * Calculate Coverage
   * Measures what percentage of available items are recommended
   * @param {Array} recommendations - Recommended items
   * @param {number} totalItems - Total number of items in catalog
   * @returns {number} Coverage score (0-1)
   */
  coverage(recommendations, totalItems) {
    if (totalItems === 0) return 0;

    const uniqueRecommended = new Set(
      recommendations.map(rec => 
        typeof rec === 'string' ? rec : rec.contentId || rec.id
      )
    );

    return uniqueRecommended.size / totalItems;
  }

  /**
   * Calculate Mean Average Precision (MAP)
   * @param {Array<Array>} allRecommendations - Recommendations for multiple users
   * @param {Array<Array>} allRelevantItems - Relevant items for each user
   * @param {number} k - Number of top recommendations
   * @returns {number} MAP@K score
   */
  meanAveragePrecision(allRecommendations, allRelevantItems, k = 10) {
    if (allRecommendations.length === 0) return 0;

    const averagePrecisions = allRecommendations.map((recommendations, userIndex) => {
      const relevantItems = allRelevantItems[userIndex] || [];
      return this.averagePrecision(recommendations, relevantItems, k);
    });

    return averagePrecisions.reduce((sum, ap) => sum + ap, 0) / averagePrecisions.length;
  }

  /**
   * Calculate Average Precision for a single user
   */
  averagePrecision(recommendations, relevantItems, k = 10) {
    if (relevantItems.length === 0) return 0;

    const relevantSet = new Set(relevantItems.map(item => 
      typeof item === 'string' ? item : item.contentId || item.id
    ));

    const topK = recommendations.slice(0, k);
    let relevantCount = 0;
    let precisionSum = 0;

    topK.forEach((rec, index) => {
      const recId = typeof rec === 'string' ? rec : rec.contentId || rec.id;
      if (relevantSet.has(recId)) {
        relevantCount++;
        precisionSum += relevantCount / (index + 1);
      }
    });

    return relevantCount > 0 ? precisionSum / relevantItems.length : 0;
  }

  /**
   * Comprehensive evaluation
   * @param {Array} recommendations - Recommended items
   * @param {Array} relevantItems - Ground truth
   * @param {Object} options - Evaluation options
   * @returns {Object} Evaluation results
   */
  evaluate(recommendations, relevantItems, options = {}) {
    const k = options.k || 10;
    const similarityFn = options.similarityFn || this._defaultSimilarityFn;

    return {
      precision: this.precisionAtK(recommendations, relevantItems, k),
      recall: this.recallAtK(recommendations, relevantItems, k),
      ndcg: this.ndcgAtK(recommendations, relevantItems, k),
      diversity: this.diversityAtK(recommendations, similarityFn, k),
      genreDiversity: this.genreDiversityAtK(recommendations, k),
      coverage: options.totalItems 
        ? this.coverage(recommendations, options.totalItems)
        : null,
    };
  }

  /**
   * Default similarity function for diversity calculation
   */
  _defaultSimilarityFn(item1, item2) {
    // Genre-based similarity
    const genres1 = new Set(item1.genres || item1.genre || []);
    const genres2 = new Set(item2.genres || item2.genre || []);

    const intersection = [...genres1].filter(g => genres2.has(g));
    const union = new Set([...genres1, ...genres2]);

    return union.size > 0 ? intersection.length / union.size : 0;
  }
}

export default RecommendationMetrics;

