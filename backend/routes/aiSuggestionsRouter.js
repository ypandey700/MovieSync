/**
 * AI Suggestions Router
 * Handles AI-powered movie suggestions based on genre, year, and user preferences
 */

import express from 'express';
import RecommendationEngine from '../ML model/models/recommendation_engine.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * POST /api/ai/suggestions
 * Get AI-powered movie suggestions based on filters
 * 
 * Body:
 * - prompt: AI prompt string (optional, for direct prompt-based recommendations)
 * - genre: Preferred genre (Action, Drama, Comedy, Romance, Horror, Sci-Fi, Animation)
 * - mood: Mood preference (Excited, Relaxed, Thoughtful, Scared, Inspired, Romantic)
 * - decade: Decade preference (2020s, 2010s, 2000s, 1990s, Older, Any)
 * - language: Language preference (English, Korean, Spanish, French, Other, Any)
 * - length: Length preference (short, standard, long, any)
 * - year: Release year (number or range like "2010-2020") - legacy support
 * - surpriseMe: Boolean to ignore strict filters
 * - userId: Current user ID (optional)
 */
router.post('/suggestions', async (req, res) => {
  try {
    const { prompt, genre, mood, decade, language, length, year, surpriseMe = false, userId } = req.body;

    console.log('[AI Suggestions] Request:', { prompt, genre, mood, decade, language, length, year, surpriseMe, userId });

    // Build query filters
    const query = {};

    // Genre filter (if not "Surprise me")
    if (!surpriseMe && genre) {
      query.genre = { $in: [genre] }; // genre is an array in Content model
    }

    // Decade filter (convert to year range)
    if (!surpriseMe && decade && decade !== 'Any') {
      let startYear, endYear;
      switch (decade) {
        case '2020s':
          startYear = 2020;
          endYear = 2029;
          break;
        case '2010s':
          startYear = 2010;
          endYear = 2019;
          break;
        case '2000s':
          startYear = 2000;
          endYear = 2009;
          break;
        case '1990s':
          startYear = 1990;
          endYear = 1999;
          break;
        case 'Older':
          startYear = 0;
          endYear = 1989;
          break;
      }
      if (startYear !== undefined && endYear !== undefined) {
        query.year = { $gte: startYear, $lte: endYear };
      }
    }

    // Year filter (legacy support, if not "Surprise me" and no decade specified)
    if (!surpriseMe && year && !decade) {
      if (typeof year === 'string' && year.includes('-')) {
        // Range format: "2010-2020"
        const [startYear, endYear] = year.split('-').map(y => parseInt(y.trim()));
        if (!isNaN(startYear) && !isNaN(endYear)) {
          query.year = { $gte: startYear, $lte: endYear };
        }
      } else {
        // Single year
        const yearNum = parseInt(year);
        if (!isNaN(yearNum)) {
          query.year = yearNum;
        }
      }
    }

    // Language filter (if Content model has language field)
    if (!surpriseMe && language && language !== 'Any') {
      // Note: Adjust this based on your Content model structure
      // query.language = language;
    }

    // Length filter (if Content model has duration field)
    if (!surpriseMe && length && length !== 'any') {
      // Note: Adjust this based on your Content model structure
      // if (length === 'short') query.duration = { $lt: 90 };
      // else if (length === 'standard') query.duration = { $gte: 90, $lte: 120 };
      // else if (length === 'long') query.duration = { $gt: 120 };
    }

    // Get content matching filters
    let content = await Content.find(query);

    // If no content found and surpriseMe is false, try without filters
    if (content.length === 0 && !surpriseMe) {
      console.log('[AI Suggestions] No matches with filters, trying without filters');
      content = await Content.find({});
    }

    // If database is empty, load from static dataset
    if (content.length === 0) {
      console.log('[AI Suggestions] Database empty, loading static movies dataset with mood filtering');
      try {
        const staticMoviesPath = join(__dirname, '../data/staticMovies.json');
        const staticMoviesData = readFileSync(staticMoviesPath, 'utf-8');
        const staticMovies = JSON.parse(staticMoviesData);
        
        // Apply filters to static movies if not "Surprise me"
        if (!surpriseMe) {
          content = staticMovies.filter(movie => {
            // Genre filter
            if (genre && (!movie.genre || !movie.genre.includes(genre))) {
              return false;
            }
            // Mood filter - check if movie's mood_tags match the requested mood
            if (mood) {
              const moodLower = mood.toLowerCase();
              const movieMoods = (movie.mood_tags || []).map(m => m.toLowerCase());
              if (!movieMoods.some(m => m.includes(moodLower) || moodLower.includes(m))) {
                // If mood doesn't match, still allow but with lower priority (will be scored lower)
                // This allows mood-based scoring to work
              }
            }
            // Decade filter
            if (decade && decade !== 'Any' && movie.year) {
              let matchesDecade = false;
              switch (decade) {
                case '2020s': matchesDecade = movie.year >= 2020 && movie.year <= 2029; break;
                case '2010s': matchesDecade = movie.year >= 2010 && movie.year <= 2019; break;
                case '2000s': matchesDecade = movie.year >= 2000 && movie.year <= 2009; break;
                case '1990s': matchesDecade = movie.year >= 1990 && movie.year <= 1999; break;
                case 'Older': matchesDecade = movie.year < 1990; break;
              }
              if (!matchesDecade) return false;
            }
            // Year filter (legacy)
            if (year && !decade && movie.year) {
              if (typeof year === 'string' && year.includes('-')) {
                const [startYear, endYear] = year.split('-').map(y => parseInt(y.trim()));
                if (movie.year < startYear || movie.year > endYear) return false;
              } else {
                const yearNum = parseInt(year);
                if (movie.year !== yearNum) return false;
              }
            }
            return true;
          });
        } else {
          content = staticMovies;
        }
        
        console.log(`[AI Suggestions] Loaded ${content.length} movies from static dataset (mood: ${mood || 'any'})`);
      } catch (error) {
        console.error('[AI Suggestions] Error loading static movies:', error);
        return res.status(200).json({
          success: true,
          recommendations: [],
          message: 'No movies found matching your criteria. Try adjusting your filters or enable "Surprise me".',
          count: 0,
        });
      }
    }

    if (content.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: 'No movies found matching your criteria. Try adjusting your filters or enable "Surprise me".',
        count: 0,
      });
    }

    // Score and rank content
    let user = null;
    if (userId) {
      try {
        user = await User.findById(userId);
      } catch (error) {
        console.error('[AI Suggestions] Error fetching user:', error);
      }
    }

    // Convert Mongoose documents to plain objects if needed (for static dataset compatibility)
    const contentArray = content.map(item => item.toObject ? item.toObject() : item);
    
    // Score content based on filters and user preferences (with mood-based scoring)
    let recommendations = await scoreContentForUser(contentArray, user, { genre, mood, decade, language, length, year }, surpriseMe);

    // Deduplicate by contentId
    const seen = new Set();
    recommendations = recommendations.filter(rec => {
      if (seen.has(rec.contentId)) {
        return false;
      }
      seen.add(rec.contentId);
      return true;
    });

    // Sort by score (already sorted, but ensure)
    recommendations.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Limit to 10
    recommendations = recommendations.slice(0, 10);

    // Format response
    const formatted = recommendations.map((rec, index) => ({
      rank: index + 1,
      contentId: rec.contentId,
      title: rec.title,
      year: rec.year,
      thumbnailUrl: rec.thumbnailUrl,
      rating: rec.rating,
      genres: rec.genres || [],
      platform: rec.platform,
      reason: rec.explanation || generateReason(rec, { genre, mood, decade, language, length, year }),
    }));

    res.status(200).json({
      success: true,
      recommendations: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('[AI Suggestions] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get AI suggestions',
    });
  }
});

/**
 * Score content for user (or general scoring)
 */
async function scoreContentForUser(content, user, filters, surpriseMe) {
  const { genre, mood, decade, language, length, year } = filters || {};
  const scored = content.map(item => {
    let score = item.rating ? item.rating / 10 : 0.5;

    // Boost if matches genre preference (user's favorite genres)
    if (user && user.preferences?.genres) {
      const userGenres = user.preferences.genres;
      const itemGenres = item.genre || [];
      const genreMatch = itemGenres.some(g => userGenres.includes(g));
      if (genreMatch) {
        score += 0.2;
      }
    }

    // Strong boost if matches specified genre filter
    if (!surpriseMe && genre && item.genre && item.genre.includes(genre)) {
      score += 0.4;
    }

    // Boost if matches mood (check metadata or tags)
    if (!surpriseMe && mood) {
      const moodLower = mood.toLowerCase();
      const itemMoodTags = item.metadata?.mood_tags || item.mood_tags || [];
      if (itemMoodTags.some(tag => tag.toLowerCase().includes(moodLower))) {
        score += 0.3;
      }
    }

    // Boost if matches decade filter
    if (!surpriseMe && decade && decade !== 'Any' && item.year) {
      let matchesDecade = false;
      switch (decade) {
        case '2020s':
          matchesDecade = item.year >= 2020 && item.year <= 2029;
          break;
        case '2010s':
          matchesDecade = item.year >= 2010 && item.year <= 2019;
          break;
        case '2000s':
          matchesDecade = item.year >= 2000 && item.year <= 2009;
          break;
        case '1990s':
          matchesDecade = item.year >= 1990 && item.year <= 1999;
          break;
        case 'Older':
          matchesDecade = item.year < 1990;
          break;
      }
      if (matchesDecade) {
        score += 0.2;
      }
    }

    // Boost if matches year filter (legacy)
    if (!surpriseMe && year && !decade && item.year) {
      if (typeof year === 'string' && year.includes('-')) {
        const [startYear, endYear] = year.split('-').map(y => parseInt(y.trim()));
        if (item.year >= startYear && item.year <= endYear) {
          score += 0.2;
        }
      } else {
        const yearNum = parseInt(year);
        if (item.year === yearNum) {
          score += 0.3;
        }
      }
    }

    // Boost if recent (within last 5 years)
    const currentYear = new Date().getFullYear();
    if (item.year && item.year >= currentYear - 5) {
      score += 0.1;
    }

    // Boost if high rating
    if (item.rating >= 8) {
      score += 0.2;
    } else if (item.rating >= 7) {
      score += 0.1;
    }

    return {
      contentId: item.contentId,
      title: item.title,
      year: item.year,
      thumbnailUrl: item.thumbnailUrl,
      rating: item.rating,
      genres: item.genre || [],
      platform: item.platform,
      score: Math.min(score, 1.0),
      explanation: generateReason(item, filters),
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Generate reason for recommendation
 */
function generateReason(item, filters) {
  const { genre, mood, decade, language, length, year } = filters || {};
  const reasons = [];

  if (genre && item.genre && item.genre.includes(genre)) {
    reasons.push(`Perfect ${genre} selection`);
  }

  if (mood) {
    reasons.push(`Great for ${mood.toLowerCase()} mood`);
  }

  if (item.rating >= 8) {
    reasons.push(`Highly rated (${item.rating}/10)`);
  } else if (item.rating >= 7) {
    reasons.push(`Well-reviewed`);
  }

  if (decade && decade !== 'Any' && item.year) {
    reasons.push(`From the ${decade}`);
  } else if (year && item.year) {
    if (typeof year === 'string' && year.includes('-')) {
      reasons.push(`Released in ${item.year}`);
    } else {
      reasons.push(`From ${item.year}`);
    }
  }

  if (reasons.length === 0) {
    reasons.push('Recommended for you');
  }

  return reasons.join(' • ');
}

export default router;

