/**
 * A/B Testing Framework for Recommendation System
 * Enables online validation and comparison of recommendation strategies
 */

class ABTestFramework {
  constructor() {
    this.experiments = new Map();
    this.userAssignments = new Map(); // userId -> experimentId -> variant
  }

  /**
   * Create a new A/B test experiment
   * @param {Object} config - Experiment configuration
   * @param {string} config.experimentId - Unique experiment identifier
   * @param {string} config.name - Experiment name
   * @param {Array} config.variants - Array of variant configurations
   * @param {Object} config.trafficSplit - Traffic split (e.g., { control: 0.5, variant: 0.5 })
   * @param {Date} config.startDate - Experiment start date
   * @param {Date} config.endDate - Experiment end date
   */
  createExperiment(config) {
    const {
      experimentId,
      name,
      variants,
      trafficSplit,
      startDate,
      endDate,
    } = config;

    // Validate traffic split sums to 1
    const totalSplit = Object.values(trafficSplit).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalSplit - 1.0) > 0.01) {
      throw new Error('Traffic split must sum to 1.0');
    }

    this.experiments.set(experimentId, {
      experimentId,
      name,
      variants: variants.map(v => ({ ...v, name: v.name || 'variant' })),
      trafficSplit,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'active',
      metrics: {
        impressions: {},
        clicks: {},
        conversions: {},
        engagement: {},
      },
    });
  }

  /**
   * Assign user to experiment variant
   * @param {string} userId - User ID
   * @param {string} experimentId - Experiment ID
   * @returns {string} Assigned variant name
   */
  assignUser(userId, experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Check if experiment is active
    const now = new Date();
    if (now < experiment.startDate || now > experiment.endDate) {
      return 'control'; // Default to control if experiment not active
    }

    // Check if user already assigned
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }

    const userExperiments = this.userAssignments.get(userId);
    if (userExperiments.has(experimentId)) {
      return userExperiments.get(experimentId);
    }

    // Assign based on traffic split (deterministic based on userId hash)
    const variant = this._deterministicAssign(userId, experiment.trafficSplit);
    userExperiments.set(experimentId, variant);

    return variant;
  }

  /**
   * Record impression (recommendation shown)
   * @param {string} userId - User ID
   * @param {string} experimentId - Experiment ID
   * @param {string} variant - Variant name
   * @param {Array} recommendations - Recommended items
   */
  recordImpression(userId, experimentId, variant, recommendations) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    if (!experiment.metrics.impressions[variant]) {
      experiment.metrics.impressions[variant] = {
        count: 0,
        users: new Set(),
        totalRecommendations: 0,
      };
    }

    experiment.metrics.impressions[variant].count++;
    experiment.metrics.impressions[variant].users.add(userId);
    experiment.metrics.impressions[variant].totalRecommendations += recommendations.length;
  }

  /**
   * Record click/interaction
   * @param {string} userId - User ID
   * @param {string} experimentId - Experiment ID
   * @param {string} variant - Variant name
   * @param {string} contentId - Content ID that was clicked
   */
  recordClick(userId, experimentId, variant, contentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    if (!experiment.metrics.clicks[variant]) {
      experiment.metrics.clicks[variant] = {
        count: 0,
        users: new Set(),
        contentIds: new Set(),
      };
    }

    experiment.metrics.clicks[variant].count++;
    experiment.metrics.clicks[variant].users.add(userId);
    experiment.metrics.clicks[variant].contentIds.add(contentId);
  }

  /**
   * Record conversion (watch started, completed, etc.)
   * @param {string} userId - User ID
   * @param {string} experimentId - Experiment ID
   * @param {string} variant - Variant name
   * @param {string} conversionType - Type of conversion
   */
  recordConversion(userId, experimentId, variant, conversionType) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    if (!experiment.metrics.conversions[variant]) {
      experiment.metrics.conversions[variant] = {};
    }

    if (!experiment.metrics.conversions[variant][conversionType]) {
      experiment.metrics.conversions[variant][conversionType] = {
        count: 0,
        users: new Set(),
      };
    }

    experiment.metrics.conversions[variant][conversionType].count++;
    experiment.metrics.conversions[variant][conversionType].users.add(userId);
  }

  /**
   * Record engagement metric
   * @param {string} userId - User ID
   * @param {string} experimentId - Experiment ID
   * @param {string} variant - Variant name
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   */
  recordEngagement(userId, experimentId, variant, metricName, value) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    if (!experiment.metrics.engagement[variant]) {
      experiment.metrics.engagement[variant] = {};
    }

    if (!experiment.metrics.engagement[variant][metricName]) {
      experiment.metrics.engagement[variant][metricName] = {
        sum: 0,
        count: 0,
        values: [],
      };
    }

    experiment.metrics.engagement[variant][metricName].sum += value;
    experiment.metrics.engagement[variant][metricName].count++;
    experiment.metrics.engagement[variant][metricName].values.push(value);
  }

  /**
   * Get experiment results
   * @param {string} experimentId - Experiment ID
   * @returns {Object} Experiment results and statistics
   */
  getResults(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const results = {
      experimentId: experiment.experimentId,
      name: experiment.name,
      status: experiment.status,
      variants: [],
    };

    // Calculate metrics for each variant
    experiment.variants.forEach(variant => {
      const variantName = variant.name;
      const impressions = experiment.metrics.impressions[variantName] || { count: 0, users: new Set() };
      const clicks = experiment.metrics.clicks[variantName] || { count: 0, users: new Set() };

      const clickThroughRate = impressions.count > 0 
        ? clicks.count / impressions.count 
        : 0;

      const uniqueUsers = impressions.users.size;
      const uniqueClickers = clicks.users.size;
      const conversionRate = uniqueUsers > 0 
        ? uniqueClickers / uniqueUsers 
        : 0;

      // Calculate engagement metrics
      const engagement = {};
      const variantEngagement = experiment.metrics.engagement[variantName] || {};
      Object.entries(variantEngagement).forEach(([metricName, data]) => {
        engagement[metricName] = {
          average: data.count > 0 ? data.sum / data.count : 0,
          total: data.sum,
          count: data.count,
        };
      });

      results.variants.push({
        name: variantName,
        config: variant,
        metrics: {
          impressions: impressions.count,
          uniqueUsers: uniqueUsers,
          clicks: clicks.count,
          clickThroughRate: clickThroughRate,
          conversionRate: conversionRate,
          engagement: engagement,
        },
      });
    });

    // Calculate statistical significance (simplified)
    if (results.variants.length >= 2) {
      results.significance = this._calculateSignificance(results.variants);
    }

    return results;
  }

  /**
   * Deterministic assignment based on userId hash
   */
  _deterministicAssign(userId, trafficSplit) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    const normalizedHash = Math.abs(hash) / 2147483647; // Normalize to 0-1

    let cumulative = 0;
    for (const [variant, split] of Object.entries(trafficSplit)) {
      cumulative += split;
      if (normalizedHash <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return Object.keys(trafficSplit)[0];
  }

  /**
   * Calculate statistical significance (simplified chi-square test)
   */
  _calculateSignificance(variants) {
    if (variants.length < 2) return null;

    // Compare first two variants
    const variant1 = variants[0];
    const variant2 = variants[1];

    const clicks1 = variant1.metrics.clicks;
    const impressions1 = variant1.metrics.impressions;
    const clicks2 = variant2.metrics.clicks;
    const impressions2 = variant2.metrics.impressions;

    const noClicks1 = impressions1 - clicks1;
    const noClicks2 = impressions2 - clicks2;

    // Chi-square test (simplified)
    const totalClicks = clicks1 + clicks2;
    const totalNoClicks = noClicks1 + noClicks2;
    const total = impressions1 + impressions2;

    const expectedClicks1 = (totalClicks * impressions1) / total;
    const expectedClicks2 = (totalClicks * impressions2) / total;
    const expectedNoClicks1 = (totalNoClicks * impressions1) / total;
    const expectedNoClicks2 = (totalNoClicks * impressions2) / total;

    const chiSquare = 
      Math.pow(clicks1 - expectedClicks1, 2) / expectedClicks1 +
      Math.pow(clicks2 - expectedClicks2, 2) / expectedClicks2 +
      Math.pow(noClicks1 - expectedNoClicks1, 2) / expectedNoClicks1 +
      Math.pow(noClicks2 - expectedNoClicks2, 2) / expectedNoClicks2;

    // For 1 degree of freedom, p < 0.05 if chi-square > 3.84
    const isSignificant = chiSquare > 3.84;

    return {
      chiSquare,
      isSignificant,
      pValue: isSignificant ? '< 0.05' : '>= 0.05',
    };
  }
}

export default ABTestFramework;

