/**
 * Example Usage of MovieSync Recommendation System
 * 
 * This file demonstrates how to use the recommendation system
 * in your application code.
 */

import RecommendationEngine from './models/recommendation_engine.js';
import RecommendationMetrics from './evaluation/metrics.js';
import ABTestFramework from './ab_testing/ab_test_framework.js';

// Example 1: Get recommendations for a user
async function exampleGetRecommendations() {
  const engine = new RecommendationEngine();
  const userId = '507f1f77bcf86cd799439011';

  const recommendations = await engine.getRecommendations(userId, {
    moodText: 'I feel happy and energetic today',
    intensity: 0.8,
    context: {
      timeOfDay: new Date().toISOString(),
      device: 'mobile',
      socialContext: false,
    },
    limit: 10,
  });

  console.log('Recommendations:', recommendations);
  recommendations.forEach(rec => {
    console.log(`${rec.rank}. ${rec.title} - ${rec.explanation}`);
  });
}

// Example 2: Cold start recommendations (for new users)
async function exampleColdStart() {
  const engine = new RecommendationEngine();

  const recommendations = await engine.getColdStartRecommendations({
    moodText: 'excited',
    limit: 10,
  });

  console.log('Cold Start Recommendations:', recommendations);
}

// Example 3: Evaluate recommendations
async function exampleEvaluate() {
  const metrics = new RecommendationMetrics();
  
  // Simulated recommendations
  const recommendations = [
    { contentId: 'movie1', genres: ['Action', 'Thriller'] },
    { contentId: 'movie2', genres: ['Comedy', 'Romance'] },
    { contentId: 'movie3', genres: ['Drama'] },
  ];

  // Ground truth (items user actually liked)
  const relevantItems = ['movie1', 'movie3'];

  const results = metrics.evaluate(recommendations, relevantItems, {
    k: 10,
    totalItems: 1000,
  });

  console.log('Evaluation Results:');
  console.log(`Precision@10: ${results.precision.toFixed(3)}`);
  console.log(`Recall@10: ${results.recall.toFixed(3)}`);
  console.log(`NDCG@10: ${results.ndcg.toFixed(3)}`);
  console.log(`Diversity: ${results.diversity.toFixed(3)}`);
  console.log(`Genre Diversity: ${results.genreDiversity.toFixed(3)}`);
}

// Example 4: A/B Testing
async function exampleABTesting() {
  const abTest = new ABTestFramework();

  // Create an experiment
  abTest.createExperiment({
    experimentId: 'mood_test_v1',
    name: 'Mood-Based Recommendations Test',
    variants: [
      { name: 'control', description: 'Baseline' },
      { name: 'variant', description: 'Enhanced mood weighting' },
    ],
    trafficSplit: { control: 0.5, variant: 0.5 },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Assign user to variant
  const userId = 'user123';
  const variant = abTest.assignUser(userId, 'mood_test_v1');
  console.log(`User ${userId} assigned to: ${variant}`);

  // Record impression
  const recommendations = [
    { contentId: 'movie1' },
    { contentId: 'movie2' },
  ];
  abTest.recordImpression(userId, 'mood_test_v1', variant, recommendations);

  // Record click
  abTest.recordClick(userId, 'mood_test_v1', variant, 'movie1');

  // Record conversion
  abTest.recordConversion(userId, 'mood_test_v1', variant, 'watch_started');

  // Get results
  const results = abTest.getResults('mood_test_v1');
  console.log('A/B Test Results:', JSON.stringify(results, null, 2));
}

// Example 5: API Usage (from frontend)
async function exampleAPIUsage() {
  const userId = 'user123';
  const baseUrl = 'http://localhost:3000/api';

  // Get recommendations
  const response = await fetch(
    `${baseUrl}/recommendations/${userId}?` +
    `mood=happy&intensity=0.8&limit=10`
  );
  const data = await response.json();
  console.log('API Recommendations:', data.recommendations);

  // Record feedback
  await fetch(`${baseUrl}/recommendations/${userId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId: 'movie123',
      action: 'click',
      rating: 5,
    }),
  });

  // Evaluate recommendations
  const evalResponse = await fetch(
    `${baseUrl}/recommendations/${userId}/evaluate?k=10`
  );
  const evalData = await evalResponse.json();
  console.log('Evaluation:', evalData.evaluation);
}

// Run examples (uncomment to test)
// exampleGetRecommendations();
// exampleColdStart();
// exampleEvaluate();
// exampleABTesting();
// exampleAPIUsage();

export {
  exampleGetRecommendations,
  exampleColdStart,
  exampleEvaluate,
  exampleABTesting,
  exampleAPIUsage,
};

