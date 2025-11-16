/**
 * Mood Analyzer - Processes textual mood descriptions and extracts mood features
 * Supports intensity levels and maps moods to content characteristics
 */

class MoodAnalyzer {
  constructor() {
    // Mood to genre mapping
    this.moodToGenres = {
      'happy': ['Comedy', 'Musical', 'Romance', 'Family'],
      'sad': ['Drama', 'Romance', 'Melodrama'],
      'excited': ['Action', 'Adventure', 'Thriller', 'Sci-Fi'],
      'relaxed': ['Drama', 'Documentary', 'Nature', 'Meditation'],
      'stressed': ['Comedy', 'Light Drama', 'Romance'],
      'bored': ['Action', 'Thriller', 'Mystery', 'Horror'],
      'romantic': ['Romance', 'Romantic Comedy', 'Drama'],
      'adventurous': ['Adventure', 'Action', 'Thriller'],
      'thoughtful': ['Drama', 'Documentary', 'Biography', 'Historical'],
      'energetic': ['Action', 'Sports', 'Musical', 'Comedy'],
      'melancholic': ['Drama', 'Romance', 'Art House'],
      'nostalgic': ['Classic', 'Retro', 'Period Drama'],
      'thrilled': ['Thriller', 'Horror', 'Action', 'Mystery'],
      'peaceful': ['Documentary', 'Nature', 'Meditation', 'Drama'],
      'curious': ['Mystery', 'Documentary', 'Sci-Fi', 'Thriller'],
    };

    // Mood intensity modifiers
    this.intensityModifiers = {
      'very': 1.5,
      'extremely': 2.0,
      'quite': 1.2,
      'slightly': 0.8,
      'somewhat': 0.9,
      'a bit': 0.7,
    };

    // Common mood keywords
    this.moodKeywords = {
      'happy': ['happy', 'joyful', 'cheerful', 'upbeat', 'positive', 'good mood'],
      'sad': ['sad', 'down', 'depressed', 'melancholy', 'blue', 'low'],
      'excited': ['excited', 'pumped', 'energized', 'thrilled', 'hyped'],
      'relaxed': ['relaxed', 'calm', 'chill', 'peaceful', 'zen', 'mellow'],
      'stressed': ['stressed', 'anxious', 'worried', 'tense', 'overwhelmed'],
      'bored': ['bored', 'uninterested', 'tired', 'dull'],
      'romantic': ['romantic', 'loving', 'intimate', 'passionate'],
      'adventurous': ['adventurous', 'bold', 'daring', 'exploratory'],
      'thoughtful': ['thoughtful', 'contemplative', 'reflective', 'philosophical'],
      'energetic': ['energetic', 'active', 'vibrant', 'lively'],
      'melancholic': ['melancholic', 'somber', 'pensive', 'wistful'],
      'nostalgic': ['nostalgic', 'sentimental', 'reminiscent'],
      'thrilled': ['thrilled', 'excited', 'on edge', 'suspenseful'],
      'peaceful': ['peaceful', 'serene', 'tranquil', 'quiet'],
      'curious': ['curious', 'inquisitive', 'wondering', 'intrigued'],
    };
  }

  /**
   * Analyze mood from text description
   * @param {string} moodText - Textual mood description
   * @param {number} intensity - Optional intensity (0-1, default 0.5)
   * @returns {Object} Mood analysis with genres, tags, and intensity
   */
  analyzeMood(moodText, intensity = null) {
    if (!moodText || moodText.trim() === '') {
      return this.getDefaultMood();
    }

    const text = moodText.toLowerCase().trim();
    let detectedIntensity = intensity !== null ? intensity : 0.5;
    const detectedMoods = [];

    // Extract intensity from text if not provided
    if (intensity === null) {
      for (const [modifier, value] of Object.entries(this.intensityModifiers)) {
        if (text.includes(modifier)) {
          detectedIntensity = Math.min(value * 0.5, 1.0);
          break;
        }
      }
    }

    // Detect moods from keywords
    for (const [mood, keywords] of Object.entries(this.moodKeywords)) {
      const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
      if (matchCount > 0) {
        detectedMoods.push({
          mood,
          confidence: Math.min(matchCount / keywords.length, 1.0),
        });
      }
    }

    // If no mood detected, use default
    if (detectedMoods.length === 0) {
      return this.getDefaultMood();
    }

    // Sort by confidence and get top moods
    detectedMoods.sort((a, b) => b.confidence - a.confidence);
    const primaryMood = detectedMoods[0].mood;
    const secondaryMoods = detectedMoods.slice(1, 3).map(m => m.mood);

    // Get genre preferences for detected moods
    const genreSet = new Set();
    [primaryMood, ...secondaryMoods].forEach(mood => {
      if (this.moodToGenres[mood]) {
        this.moodToGenres[mood].forEach(genre => genreSet.add(genre));
      }
    });

    return {
      primaryMood,
      secondaryMoods,
      genres: Array.from(genreSet),
      intensity: detectedIntensity,
      confidence: detectedMoods[0].confidence,
      moodTags: [primaryMood, ...secondaryMoods],
    };
  }

  /**
   * Get default mood (neutral/balanced)
   */
  getDefaultMood() {
    return {
      primaryMood: 'relaxed',
      secondaryMoods: [],
      genres: ['Drama', 'Comedy', 'Action'],
      intensity: 0.5,
      confidence: 0.5,
      moodTags: ['relaxed'],
    };
  }

  /**
   * Get content mood compatibility score
   * @param {Object} contentMoodTags - Content's mood tags
   * @param {Object} userMoodAnalysis - User's mood analysis
   * @returns {number} Compatibility score (0-1)
   */
  getMoodCompatibility(contentMoodTags, userMoodAnalysis) {
    if (!contentMoodTags || contentMoodTags.length === 0) {
      return 0.5; // Neutral if no mood tags
    }

    const userMoods = new Set([
      userMoodAnalysis.primaryMood,
      ...userMoodAnalysis.secondaryMoods,
    ]);

    const contentMoods = new Set(contentMoodTags.map(tag => tag.toLowerCase()));

    // Calculate overlap
    const intersection = [...userMoods].filter(mood => contentMoods.has(mood));
    const union = new Set([...userMoods, ...contentMoods]);

    if (union.size === 0) return 0.5;

    // Jaccard similarity
    const jaccard = intersection.length / union.size;

    // Boost with intensity
    return Math.min(jaccard * (1 + userMoodAnalysis.intensity), 1.0);
  }
}

export default MoodAnalyzer;

