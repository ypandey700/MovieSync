import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BACKEND_URL } from '../lib/confg';

const Suggestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState(location.state?.mood || '');
  const [customMood, setCustomMood] = useState('');
  const [intensity, setIntensity] = useState(0.5);
  
  const predefinedMoods = ['happy', 'sad', 'excited', 'relaxed', 'stressed', 'bored', 'romantic', 'adventurous', 'thoughtful', 'energetic', 'melancholic', 'nostalgic', 'thrilled', 'peaceful', 'curious'];
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleGetRecommendations = async () => {
    if (!user) {
      setError('Please sign in to get recommendations');
      navigate('/signin');
      return;
    }

    // Handle both userId and _id formats
    const userId = user.userId || user._id;
    if (!userId) {
      setError('User ID not found. Please sign in again.');
      navigate('/signin');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        limit: '10',
      });

      const moodToSend = mood.trim() || customMood.trim();
      if (moodToSend) {
        params.append('mood', moodToSend);
        params.append('intensity', intensity.toString());
      }

      const response = await fetch(
        `${BACKEND_URL}/recommendations/${userId}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      if (data.success) {
        setRecommendations(data.recommendations || []);
        // Show message if provided (e.g., no content in database)
        if (data.message) {
          setError(data.message);
          setTimeout(() => setError(''), 8000); // Clear after 8 seconds
        }
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err.message || 'Failed to load recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (contentId, action) => {
    if (!user) return;
    const userId = user.userId || user._id;
    if (!userId) return;

    try {
      await fetch(`${BACKEND_URL}/recommendations/${userId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contentId,
          action,
        }),
      });
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const handleCardClick = (contentId) => {
    handleFeedback(contentId, 'click');
    navigate(`/movie/${contentId}`);
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
          <Link
            to="/signin"
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-60 left-20 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full shadow-lg shadow-cyan-400/50"></div>
            <h1 className="text-4xl font-black text-white">
              AI-Powered <span className="bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent">Suggestions</span>
            </h1>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent ml-4"></div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Tell us how you're feeling and we'll recommend the perfect content for your mood
          </p>
        </div>

        {/* Mood Input Section */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="space-y-6">
            <div>
              <label htmlFor="mood-select" className="block text-white font-semibold mb-3 text-lg">
                How are you feeling? (Optional)
              </label>
              <select
                id="mood-select"
                value={predefinedMoods.includes(mood) ? mood : ''}
                onChange={(e) => {
                  setMood(e.target.value);
                  if (e.target.value) {
                    setCustomMood('');
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 text-white px-6 py-4 rounded-lg focus:border-cyan-500 transition-colors duration-200 text-lg focus:outline-none"
              >
                <option value="">Select a mood...</option>
                <option value="happy">😊 Happy</option>
                <option value="sad">😢 Sad</option>
                <option value="excited">⚡ Excited</option>
                <option value="relaxed">😌 Relaxed</option>
                <option value="stressed">😰 Stressed</option>
                <option value="bored">😑 Bored</option>
                <option value="romantic">💕 Romantic</option>
                <option value="adventurous">🏔️ Adventurous</option>
                <option value="thoughtful">🤔 Thoughtful</option>
                <option value="energetic">💪 Energetic</option>
                <option value="melancholic">🌙 Melancholic</option>
                <option value="nostalgic">📷 Nostalgic</option>
                <option value="thrilled">🎬 Thrilled</option>
                <option value="peaceful">🕊️ Peaceful</option>
                <option value="curious">🔍 Curious</option>
              </select>
              <p className="text-slate-500 text-sm mt-2">
                Or enter a custom mood description below
              </p>
              <input
                type="text"
                value={customMood}
                onChange={(e) => {
                  setCustomMood(e.target.value);
                  if (e.target.value) {
                    setMood(e.target.value);
                  }
                }}
                placeholder="Or type your mood: e.g., feeling adventurous today..."
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none px-6 py-4 rounded-lg focus:border-cyan-500 transition-colors duration-200 text-lg mt-3"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleGetRecommendations();
                  }
                }}
              />
            </div>

            {(mood.trim() || customMood.trim()) && (
              <div>
                <label className="block text-white font-semibold mb-3">
                  Intensity: <span className="text-cyan-400">{Math.round(intensity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGetRecommendations}
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg ${
                loading
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Getting Recommendations...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-magic-line"></i>
                  Get Personalized Recommendations
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-8">
            <p className="text-green-400 flex items-center gap-2">
              <i className="ri-checkbox-circle-line"></i>
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-400 flex items-center gap-2">
              <i className="ri-error-warning-line"></i>
              {error}
            </p>
          </div>
        )}


        {/* Recommendations Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <i className="ri-loader-4-line text-6xl text-cyan-400 animate-spin mb-4"></i>
              <p className="text-slate-400 text-lg">Analyzing your mood and preferences...</p>
            </div>
          </div>
        ) : hasSearched && recommendations.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-movie-line text-6xl text-slate-600 mb-4"></i>
            <p className="text-slate-400 text-lg">No recommendations found. Try adjusting your mood or preferences.</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/50"></div>
              <h2 className="text-3xl font-black text-white">
                Recommended <span className="text-orange-500">For You</span>
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-500/40 to-transparent ml-4"></div>
              <span className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border border-orange-500/40 rounded-full text-orange-400 text-sm font-bold">
                {recommendations.length} Results
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.contentId}
                  onClick={() => handleCardClick(rec.contentId)}
                  className="group cursor-pointer bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
                    {rec.thumbnailUrl ? (
                      <img
                        src={rec.thumbnailUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <i className="ri-movie-line text-6xl text-slate-700"></i>
                      </div>
                    )}
                    
                    {/* Rank Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-black text-lg px-3 py-1 rounded-lg shadow-lg">
                      #{rec.rank}
                    </div>

                    {/* Rating Badge */}
                    {rec.rating && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-black font-bold text-sm px-2 py-1 rounded-md flex items-center gap-1">
                        <i className="ri-star-fill"></i>
                        {rec.rating.toFixed(1)}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                        {rec.explanation}
                      </p>
                      {rec.genres && rec.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {rec.genres.slice(0, 2).map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {rec.title}
                    </h3>
                    
                    {/* Explanation */}
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {rec.explanation}
                    </p>

                    {/* Platform */}
                    {rec.platform && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <i className="ri-tv-line"></i>
                        <span>{rec.platform}</span>
                      </div>
                    )}

                    {/* Score (for debugging, can be hidden in production) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-slate-600">
                        Score: {rec.score?.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <i className="ri-magic-line text-6xl text-slate-600 mb-4"></i>
            <p className="text-slate-400 text-lg">Enter your mood above to get personalized recommendations!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;

