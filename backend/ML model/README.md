# MovieSync ML-Powered Recommendation System

A comprehensive mood-aware recommendation system that provides personalized movie and content recommendations based on user mood, preferences, and contextual signals.

## Features

- **Mood-Based Recommendations**: Accepts textual mood descriptions and intensity levels
- **Hybrid Recommendation Engine**: Combines content-based, collaborative filtering, and mood-based approaches
- **Contextual Awareness**: Considers time of day, device type, and social context
- **Explainable AI**: Provides human-readable explanations for each recommendation
- **Diversity Optimization**: Ensures diverse recommendations across genres and platforms
- **Evaluation Metrics**: Implements precision@10, NDCG@10, and diversity metrics
- **A/B Testing Framework**: Built-in framework for online validation and experimentation

## Architecture

```
ML model/
├── models/
│   └── recommendation_engine.js    # Main recommendation engine
├── features/
│   └── feature_engineer.js         # Feature extraction and engineering
├── utils/
│   ├── mood_analyzer.js            # Mood analysis from text
│   └── explanation_generator.js    # Explanation generation
├── evaluation/
│   └── metrics.js                  # Evaluation metrics
└── ab_testing/
    └── ab_test_framework.js        # A/B testing framework
```

## Components

### 1. Mood Analyzer (`utils/mood_analyzer.js`)

Processes textual mood descriptions and maps them to content characteristics.

**Supported Moods:**
- happy, sad, excited, relaxed, stressed, bored
- romantic, adventurous, thoughtful, energetic
- melancholic, nostalgic, thrilled, peaceful, curious

**Features:**
- Intensity detection from text
- Mood-to-genre mapping
- Content mood compatibility scoring

### 2. Feature Engineer (`features/feature_engineer.js`)

Extracts and transforms features from user profiles and content data.

**User Features:**
- Genre preferences (normalized)
- Platform preferences
- Watch history statistics
- Preferred actors/directors
- Completion rates

**Content Features:**
- Genres, mood tags, cast, director
- Rating, year, duration
- Freshness score

**Contextual Features:**
- Time of day categorization
- Device type
- Social context

### 3. Recommendation Engine (`models/recommendation_engine.js`)

Hybrid recommendation system combining multiple approaches.

**Scoring Components:**
- Similarity Score (40%): Based on user preferences and content features
- Mood Score (30%): Compatibility with current mood
- Genre Boost (20%): Alignment with preferred genres
- Watched Penalty (10%): Reduces score for already watched content

**Diversity:**
- Applies diversity boost to avoid too similar recommendations
- Ensures genre and platform diversity

### 4. Explanation Generator (`utils/explanation_generator.js`)

Generates human-readable explanations for recommendations.

**Explanation Types:**
- Mood-based: "Perfect for your happy mood"
- Genre-based: "Features your favorite Comedy genre"
- Similarity-based: "Similar to content you've enjoyed"
- Rating-based: "Highly rated (8.5/10)"
- Freshness: "Recently released"

### 5. Evaluation Metrics (`evaluation/metrics.js`)

Implements standard recommendation evaluation metrics.

**Metrics:**
- **Precision@K**: Fraction of recommended items that are relevant
- **Recall@K**: Fraction of relevant items that are recommended
- **NDCG@K**: Normalized Discounted Cumulative Gain
- **Diversity**: Intra-list diversity measure
- **Genre Diversity**: Shannon entropy-based diversity
- **Coverage**: Percentage of catalog covered

### 6. A/B Testing Framework (`ab_testing/ab_test_framework.js`)

Framework for online validation and experimentation.

**Features:**
- Deterministic user assignment
- Traffic splitting
- Metric tracking (impressions, clicks, conversions, engagement)
- Statistical significance testing

## API Endpoints

### Get Recommendations

```
GET /api/recommendations/:userId
```

**Query Parameters:**
- `mood` (optional): Textual mood description
- `intensity` (optional): Mood intensity 0-1
- `timeOfDay` (optional): ISO timestamp
- `device` (optional): Device type
- `socialContext` (optional): Boolean
- `limit` (optional): Number of recommendations (default: 10)
- `experimentId` (optional): A/B test experiment ID

**Example:**
```bash
GET /api/recommendations/507f1f77bcf86cd799439011?mood=happy&intensity=0.8&limit=10
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "rank": 1,
      "contentId": "movie123",
      "title": "The Great Movie",
      "thumbnailUrl": "...",
      "platform": "Netflix",
      "rating": 8.5,
      "genres": ["Comedy", "Drama"],
      "score": 0.92,
      "explanation": "Perfect for your happy mood. Features your favorite Comedy genre.",
      "metadata": {
        "similarityScore": 0.85,
        "moodScore": 0.95,
        "genreBoost": 0.90
      }
    }
  ],
  "variant": "variant",
  "experimentId": "mood_recommendations_v1",
  "count": 10
}
```

### Record Feedback

```
POST /api/recommendations/:userId/feedback
```

**Body:**
```json
{
  "contentId": "movie123",
  "action": "click",
  "rating": 4,
  "experimentId": "mood_recommendations_v1"
}
```

### Evaluate Recommendations

```
GET /api/recommendations/:userId/evaluate?k=10
```

Returns offline evaluation metrics for a user's recommendations.

### A/B Test Results

```
GET /api/recommendations/ab-test/:experimentId
```

Returns A/B test experiment results and statistics.

### Cold Start Recommendations

```
GET /api/recommendations/cold-start?mood=happy&limit=10
```

Returns recommendations for new users without viewing history.

## Usage Examples

### Basic Recommendation Request

```javascript
// Get recommendations for a user
const response = await fetch(
  '/api/recommendations/user123?mood=excited&limit=10'
);
const data = await response.json();
console.log(data.recommendations);
```

### With Context

```javascript
const context = {
  mood: 'relaxed',
  intensity: 0.7,
  timeOfDay: new Date().toISOString(),
  device: 'mobile',
  socialContext: false
};

const response = await fetch(
  `/api/recommendations/user123?` +
  `mood=${context.mood}&` +
  `intensity=${context.intensity}&` +
  `timeOfDay=${context.timeOfDay}&` +
  `device=${context.device}&` +
  `socialContext=${context.socialContext}`
);
```

### Recording Feedback

```javascript
await fetch('/api/recommendations/user123/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentId: 'movie123',
    action: 'watch',
    rating: 5
  })
});
```

## Evaluation

### Offline Evaluation

The system supports offline evaluation using ground truth data (user viewing history with ratings).

```javascript
// Evaluate recommendations for a user
const response = await fetch('/api/recommendations/user123/evaluate?k=10');
const data = await response.json();

console.log('Precision@10:', data.evaluation.precision);
console.log('NDCG@10:', data.evaluation.ndcg);
console.log('Diversity:', data.evaluation.diversity);
```

### A/B Testing

Create and monitor A/B test experiments:

```javascript
// Create experiment
await fetch('/api/recommendations/ab-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentId: 'mood_v2',
    name: 'Enhanced Mood Recommendations',
    variants: [
      { name: 'control', description: 'Baseline' },
      { name: 'variant', description: 'Enhanced mood weighting' }
    ],
    trafficSplit: { control: 0.5, variant: 0.5 },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  })
});

// Get results
const results = await fetch('/api/recommendations/ab-test/mood_v2');
```

## A/B Testing Plan

### Experiment Design

1. **Hypothesis**: Enhanced mood-based recommendations improve user engagement
2. **Metrics**:
   - Click-through rate (CTR)
   - Watch start rate
   - Average watch time
   - User satisfaction (ratings)
3. **Traffic Split**: 50/50 between control and variant
4. **Duration**: 30 days minimum
5. **Sample Size**: Minimum 1000 users per variant

### Variants

- **Control**: Baseline recommendations (equal weight to all factors)
- **Variant**: Enhanced mood weighting (40% mood, 30% similarity, 20% genre, 10% other)

### Success Criteria

- Statistically significant improvement in CTR (p < 0.05)
- At least 10% increase in watch start rate
- No decrease in diversity metrics

## Configuration

### Mood-to-Genre Mapping

Customize mood mappings in `utils/mood_analyzer.js`:

```javascript
this.moodToGenres = {
  'happy': ['Comedy', 'Musical', 'Romance'],
  'sad': ['Drama', 'Romance', 'Melodrama'],
  // Add more mappings
};
```

### Scoring Weights

Adjust recommendation scoring weights in `models/recommendation_engine.js`:

```javascript
const finalScore = (
  similarityScore * 0.4 +  // Adjust these weights
  moodScore * 0.3 +
  genreBoost * 0.2 +
  (1 - watchedPenalty) * 0.1
);
```

## Dependencies

See `requirements.txt` for Python dependencies (if using Python components).

For Node.js, the system uses:
- Express.js (already in project)
- Mongoose (already in project)

## Future Enhancements

1. **Deep Learning Models**: Integrate neural collaborative filtering
2. **Real-time Learning**: Update recommendations based on real-time feedback
3. **Multi-modal Features**: Incorporate video thumbnails, descriptions
4. **Session-based Recommendations**: Consider current session context
5. **Explainable AI**: More detailed explanation generation
6. **Cold Start Improvements**: Better handling for new users and items

## Performance Considerations

- Recommendations are computed on-demand (consider caching for production)
- Feature extraction is lightweight and fast
- A/B testing framework is in-memory (consider persistence for production)
- Evaluation metrics can be computed offline

## License

Part of the MovieSync project.

