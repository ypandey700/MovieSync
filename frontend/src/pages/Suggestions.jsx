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
  const [activeTab, setActiveTab] = useState('quick');
  const [validationError, setValidationError] = useState('');
  
  const quickMoods = [
    { value: 'happy', emoji: '😊', color: 'from-yellow-500 to-orange-500' },
    { value: 'sad', emoji: '😢', color: 'from-blue-600 to-indigo-600' },
    { value: 'excited', emoji: '⚡', color: 'from-purple-500 to-pink-500' },
    { value: 'relaxed', emoji: '😌', color: 'from-green-500 to-teal-500' },
    { value: 'stressed', emoji: '😰', color: 'from-red-600 to-rose-600' },
    { value: 'romantic', emoji: '💕', color: 'from-pink-500 to-rose-500' },
    { value: 'adventurous', emoji: '🏔️', color: 'from-emerald-500 to-teal-600' },
    { value: 'thoughtful', emoji: '🤔', color: 'from-slate-500 to-slate-600' },
  ];

  const allMoods = [
    'happy', 'sad', 'excited', 'relaxed', 'stressed', 'bored', 
    'romantic', 'adventurous', 'thoughtful', 'energetic', 
    'melancholic', 'nostalgic', 'thrilled', 'peaceful', 'curious'
  ];

  // Mood-related keywords for validation
  const moodKeywords = [
    'happy', 'sad', 'excited', 'relaxed', 'stressed', 'bored', 'romantic', 
    'adventurous', 'thoughtful', 'energetic', 'melancholic', 'nostalgic', 
    'thrilled', 'peaceful', 'curious', 'angry', 'anxious', 'calm', 'cheerful',
    'content', 'depressed', 'disappointed', 'enthusiastic', 'frustrated',
    'grateful', 'hopeful', 'inspired', 'lonely', 'loved', 'motivated',
    'nervous', 'optimistic', 'overwhelmed', 'proud', 'relieved', 'satisfied',
    'scared', 'tired', 'worried', 'joyful', 'feeling', 'mood', 'emotion',
    'upbeat', 'down', 'chill', 'hyped', 'mellow', 'gloomy', 'ecstatic',
    'serene', 'restless', 'contemplative', 'playful', 'serious', 'silly',
    'cozy', 'lazy', 'productive', 'creative', 'social', 'antisocial',
    'confident', 'insecure', 'brave', 'fearful', 'passionate', 'indifferent'
  ];

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Validate if the input is mood-related
  const validateMoodInput = (input) => {
    if (!input || input.trim() === '') {
      return { isValid: false, error: 'Please enter a mood description' };
    }

    const lowercaseInput = input.toLowerCase();
    const words = lowercaseInput.split(/\s+/);
    
    // Check if any mood keyword is present in the input
    const containsMoodKeyword = words.some(word => 
      moodKeywords.some(keyword => 
        word.includes(keyword) || keyword.includes(word)
      )
    );

    // Also check for phrases that indicate mood/feeling
    const moodPhrases = [
      'feel', 'feeling', 'i am', "i'm", 'want to', 'need to', 
      'looking for', 'in the mood', 'like to'
    ];
    
    const containsMoodPhrase = moodPhrases.some(phrase => 
      lowercaseInput.includes(phrase)
    );

    if (!containsMoodKeyword && !containsMoodPhrase) {
      return { 
        isValid: false, 
        error: `"${input}" doesn't seem to be a mood. Try describing how you feel, e.g., "feeling happy", "very excited", "a bit sad"`
      };
    }

    return { isValid: true, error: null };
  };

  const handleGetRecommendations = async () => {
    if (!user) {
      setError('Please sign in to get recommendations');
      navigate('/signin');
      return;
    }

    const userId = user.userId || user._id;
    if (!userId) {
      setError('User ID not found. Please sign in again.');
      navigate('/signin');
      return;
    }

    // Validate custom mood if using custom tab
    if (activeTab === 'custom' && customMood) {
      const validation = validateMoodInput(customMood);
      if (!validation.isValid) {
        setValidationError(validation.error);
        return;
      }
    }

    setLoading(true);
    setError('');
    setValidationError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        limit: '12',
      });

      const moodToSend = activeTab === 'custom' ? customMood.trim() : mood.trim();
      
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
        if (data.message) {
          setError(data.message);
          setTimeout(() => setError(''), 8000);
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

  // Clear validation error when switching tabs or changing input
  const handleCustomMoodChange = (value) => {
    setCustomMood(value);
    setValidationError('');
    if (value) {
      setMood('');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setValidationError('');
    if (tab !== 'custom') {
      setCustomMood('');
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-3">Please Sign In</h2>
          <Link
            to="/signin"
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Get the current mood for display
  const currentMood = activeTab === 'custom' ? customMood : mood;
  const shouldShowIntensity = currentMood.trim() && !validationError;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-cyan-400/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full"></div>
            <h1 className="text-2xl font-bold text-white">
              AI <span className="bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent">Recommendations</span>
            </h1>
            <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-medium ml-auto">
              Beta
            </span>
          </div>
          <p className="text-slate-400 text-sm">Get personalized content based on your mood</p>
        </div>

        {/* Compact Mood Selection Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-xl p-4 mb-6">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTabChange('quick')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'quick' 
                  ? 'bg-gradient-to-r from-orange-500 to-cyan-500 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              Quick Select
            </button>
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-cyan-500 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              All Moods
            </button>
            <button
              onClick={() => handleTabChange('custom')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'custom' 
                  ? 'bg-gradient-to-r from-orange-500 to-cyan-500 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Quick Mood Pills */}
          {activeTab === 'quick' && (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {quickMoods.map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={() => {
                    setMood(moodOption.value);
                    setCustomMood('');
                    setValidationError('');
                  }}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    mood === moodOption.value
                      ? 'bg-gradient-to-r ' + moodOption.color + ' border-transparent shadow-lg scale-105'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{moodOption.emoji}</span>
                    <span className={`text-xs mt-1 ${
                      mood === moodOption.value ? 'text-white' : 'text-slate-400'
                    }`}>
                      {moodOption.value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* All Moods Dropdown */}
          {activeTab === 'all' && (
            <select
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                setCustomMood('');
                setValidationError('');
              }}
              className="w-full bg-slate-800/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
            >
              <option value="">Select a mood...</option>
              {allMoods.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          )}

          {/* Custom Input */}
          {activeTab === 'custom' && (
            <div>
              <input
                type="text"
                value={customMood}
                onChange={(e) => handleCustomMoodChange(e.target.value)}
                placeholder="Describe how you're feeling (e.g., 'feeling adventurous', 'very happy today')"
                className={`w-full bg-slate-800/50 border ${
                  validationError ? 'border-red-500' : 'border-slate-700'
                } text-white placeholder-slate-500 px-3 py-2 rounded-lg focus:border-cyan-500 focus:outline-none text-sm`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleGetRecommendations();
                  }
                }}
              />
              {validationError && (
                <p className="text-red-400 text-xs mt-2 flex items-start gap-1">
                  <i className="ri-error-warning-line mt-0.5"></i>
                  <span>{validationError}</span>
                </p>
              )}
              <p className="text-slate-500 text-xs mt-2">
                💡 Tip: Include mood-related words like happy, sad, excited, relaxed, etc.
              </p>
            </div>
          )}

          {/* Compact Intensity Slider */}
          {shouldShowIntensity && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-slate-400 text-xs">Intensity:</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <span className="text-cyan-400 text-xs font-bold min-w-[40px]">
                {Math.round(intensity * 100)}%
              </span>
            </div>
          )}

          {/* Compact Action Button */}
          <button
            onClick={handleGetRecommendations}
            disabled={loading || (activeTab === 'custom' && !customMood.trim()) || (activeTab !== 'custom' && !mood.trim())}
            className={`w-full mt-4 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              loading || (activeTab === 'custom' && !customMood.trim()) || (activeTab !== 'custom' && !mood.trim())
                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-400 hover:to-cyan-400 text-white shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-sparkles-line"></i>
                Get Recommendations
              </span>
            )}
          </button>
        </div>

        {/* Compact Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <i className="ri-error-warning-line"></i>
              {error}
            </p>
          </div>
        )}

        {/* Compact Recommendations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <i className="ri-loader-4-line text-4xl text-cyan-400 animate-spin mb-2"></i>
              <p className="text-slate-400 text-sm">Loading recommendations...</p>
            </div>
          </div>
        ) : hasSearched && recommendations.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-movie-line text-3xl text-slate-600 mb-2"></i>
            <p className="text-slate-400 text-sm">No recommendations found</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div>
            {/* Compact Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="ri-film-line text-orange-400"></i>
                Results
              </h2>
              <span className="px-2 py-1 bg-slate-800/50 rounded-lg text-orange-400 text-xs font-medium">
                {recommendations.length} items
              </span>
            </div>

            {/* Compact Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.contentId}
                  onClick={() => handleCardClick(rec.contentId)}
                  className="group cursor-pointer bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  {/* Compact Thumbnail */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
                    {rec.thumbnailUrl ? (
                      <img
                        src={rec.thumbnailUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-movie-line text-3xl text-slate-700"></i>
                      </div>
                    )}
                    
                    {/* Minimal Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-black/60 px-1.5 py-0.5 rounded text-white text-xs font-bold">
                            #{rec.rank}
                          </span>
                          {rec.rating && (
                            <span className="bg-yellow-500/90 px-1.5 py-0.5 rounded text-black text-xs font-bold">
                              ★ {rec.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Minimal Content Info */}
                  <div className="p-2">
                    <h3 className="text-white text-xs font-semibold line-clamp-2 mb-1 group-hover:text-cyan-400 transition-colors">
                      {rec.title}
                    </h3>
                    {rec.genres && rec.genres.length > 0 && (
                      <span className="text-slate-500 text-xs">
                        {rec.genres[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="ri-magic-line text-3xl text-slate-600 mb-2"></i>
            <p className="text-slate-400 text-sm">Select your mood to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;