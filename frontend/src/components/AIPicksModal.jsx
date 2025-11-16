import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAIRecommendation } from '../lib/getAIRecommendation';
import RecommendedMovies from './RecommendedMovies';

const AIPicksModal = ({ isOpen, onClose, userId }) => {
  const navigate = useNavigate();
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [surpriseMe, setSurpriseMe] = useState(false);
  
  // Form data
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [decade, setDecade] = useState('');
  const [language, setLanguage] = useState('');
  const [length, setLength] = useState('');
  
  // Results
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 5;

  // Options for each step
  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Animation'];
  const moods = ['Excited', 'Relaxed', 'Thoughtful', 'Scared', 'Inspired', 'Romantic'];
  const decades = ['2020s', '2010s', '2000s', '1990s', 'Older', 'Any'];
  const languages = ['English', 'Korean', 'Spanish', 'French', 'Other', 'Any'];
  const lengths = [
    { label: 'Short (<90 min)', value: 'short' },
    { label: 'Standard (90–120 min)', value: 'standard' },
    { label: 'Long (>120 min)', value: 'long' },
    { label: 'Any', value: 'any' },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentStep(1);
      setGenre('');
      setMood('');
      setDecade('');
      setLanguage('');
      setLength('');
      setSurpriseMe(false);
      setRecommendations([]);
      setError('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      // Build prompt string for display/logging
      const promptParts = [];
      
      if (!surpriseMe) {
        if (genre) promptParts.push(`Genre: ${genre}`);
        if (mood) promptParts.push(`Mood: ${mood}`);
        if (decade && decade !== 'Any') promptParts.push(`Decade: ${decade}`);
        if (language && language !== 'Any') promptParts.push(`Language: ${language}`);
        if (length && length !== 'any') promptParts.push(`Length: ${length}`);
      }

      const promptString = surpriseMe
        ? 'Recommend diverse movies across different genres, moods, decades, languages, and lengths. Include 2-3 surprising picks that break the typical patterns.'
        : `Recommend movies with the following preferences: ${promptParts.join(', ')}. ${surpriseMe ? 'Include 2-3 surprising picks that break these patterns.' : ''}`;

      // Call getAIRecommendation with structured data
      const { BACKEND_URL } = await import('../lib/confg');
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const currentUserId = userId || user?.userId || user?._id;

      const response = await fetch(`${BACKEND_URL}/ai/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: promptString,
          genre: surpriseMe ? null : genre,
          mood: surpriseMe ? null : mood,
          decade: surpriseMe ? null : decade,
          language: surpriseMe ? null : language,
          length: surpriseMe ? null : length,
          surpriseMe,
          userId: currentUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      const results = data.success ? data.recommendations : [];

      if (results && results.length > 0) {
        setRecommendations(results);
        setCurrentStep(6); // Move to results step
      } else {
        setError('No recommendations found. Try adjusting your preferences.');
      }
    } catch (err) {
      console.error('AI Recommendation error:', err);
      setError(err.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return genre !== '' || surpriseMe;
      case 2:
        return mood !== '' || surpriseMe;
      case 3:
        return decade !== '' || surpriseMe;
      case 4:
        return language !== '' || surpriseMe;
      case 5:
        return length !== '' || surpriseMe;
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Choose Your Genre';
      case 2:
        return 'How Are You Feeling?';
      case 3:
        return 'Preferred Decade';
      case 4:
        return 'Language Preference';
      case 5:
        return 'Movie Length';
      case 6:
        return 'Your AI Picks';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-slate-400 text-center mb-6">
              What genre are you in the mood for?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    genre === g
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-slate-400 text-center mb-6">
              What's your current mood?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    mood === m
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-slate-400 text-center mb-6">
              Which decade do you prefer?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {decades.map((d) => (
                <button
                  key={d}
                  onClick={() => setDecade(d)}
                  className={`px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    decade === d
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-slate-400 text-center mb-6">
              What language do you prefer?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    language === l
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-slate-400 text-center mb-6">
              How long should the movie be?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lengths.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLength(l.value)}
                  className={`px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    length === l.value
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <i className="ri-loader-4-line text-6xl text-cyan-400 animate-spin mb-4" aria-hidden="true"></i>
                <p className="text-slate-400">Finding perfect movies for you...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 flex items-center gap-2">
                  <i className="ri-error-warning-line"></i>
                  {error}
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Start Over
                </button>
              </div>
            ) : recommendations.length > 0 ? (
              <div>
                <RecommendedMovies movieTitles={recommendations} />
              </div>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - positioned below navbar */}
      <div
        className="fixed inset-0 top-[80px] z-[60] bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Container */}
      <div 
        className="fixed inset-0 top-[80px] z-[65] flex items-start justify-center p-4 pt-8 animate-fadeIn pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-picks-title"
      >
        {/* Modal */}
        <div 
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[calc(100vh-120px)] overflow-hidden flex flex-col animate-scaleIn pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700 bg-gradient-to-r from-orange-500/20 to-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 id="ai-picks-title" className="text-2xl font-black text-white flex items-center gap-2">
                <i className="ri-magic-line text-orange-500"></i>
                AI Picks
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}: ${getStepTitle()}` : getStepTitle()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors p-2 hover:bg-red-500/20 rounded-lg ml-4 border border-slate-600 hover:border-red-500"
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <i className="ri-close-line text-2xl font-bold"></i>
            </button>
          </div>

          {/* Progress Bar */}
          {currentStep <= totalSteps && (
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
                      i + 1 < currentStep
                        ? 'bg-gradient-to-r from-orange-500 to-cyan-500'
                        : i + 1 === currentStep
                        ? 'bg-gradient-to-r from-orange-500 to-cyan-500'
                        : 'bg-slate-700'
                    }`}
                  ></div>
                ))}
              </div>
              <div className="text-xs text-slate-500 text-center">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Surprise Me Toggle */}
          {currentStep <= totalSteps && (
            <div className="mb-6 flex items-center justify-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                id="surpriseMe"
                checked={surpriseMe}
                onChange={(e) => setSurpriseMe(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="surpriseMe" className="text-white font-medium cursor-pointer flex items-center gap-2">
                <i className="ri-sparkling-line text-orange-500"></i>
                Surprise Me (Include 2-3 unexpected picks)
              </label>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[300px] flex items-center justify-center">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Navigation */}
        {currentStep <= totalSteps && (
          <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
            >
              <i className="ri-close-line"></i>
              Cancel
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  currentStep === 1
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <i className="ri-arrow-left-line"></i>
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    canProceed()
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Next
                  <i className="ri-arrow-right-line"></i>
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!canProceed() || loading}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    canProceed() && !loading
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-magic-line"></i>
                      Finish
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Footer */}
        {currentStep === 6 && recommendations.length > 0 && (
          <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentStep(1);
                setRecommendations([]);
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <i className="ri-refresh-line"></i>
              New Search
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Done
            </button>
          </div>
        )}
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AIPicksModal;
