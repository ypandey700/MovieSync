// src/components/PreviouslyWatchedSection.jsx
import React, { useEffect, useState } from 'react';
import { Play, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const PreviouslyWatchedSection = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWatchHistory();
  }, []);

  const loadWatchHistory = async () => {
    try {
      const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      
      const moviesWithDetails = await Promise.all(
        history.map(async (item) => {
          try {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${item.movieId}?language=en-US`,
              {
                headers: {
                  accept: 'application/json',
                  Authorization: `Bearer ${TMDB_TOKEN}`,
                },
              }
            );
            const movieData = await res.json();
            return {
              ...item,
              movie: movieData,
            };
          } catch (err) {
            console.error('Error fetching movie:', err);
            return null;
          }
        })
      );

      const validMovies = moviesWithDetails
        .filter(Boolean)
        .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));

      setWatchHistory(validMovies);
    } catch (err) {
      console.error('Error loading watch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromHistory = (movieId) => {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const updated = history.filter(item => item.movieId !== movieId);
    localStorage.setItem('watchHistory', JSON.stringify(updated));
    loadWatchHistory();
  };

  const continueWatching = (item) => {
    navigate(`/watch/${item.movieId}`, { 
      state: { 
        resumeTime: item.currentTime,
        lastWatched: item.lastWatched
      } 
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (watchHistory.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900/30 backdrop-blur-sm rounded-2xl border border-zinc-800">
        <Clock size={48} className="mx-auto mb-4 text-zinc-600" />
        <p className="text-zinc-400 text-lg font-medium">No watch history yet</p>
        <p className="text-zinc-600 text-sm mt-2">Start watching movies to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {watchHistory.map((item) => {
        const progressPercent = (item.currentTime / item.duration) * 100 || 0;
        
        return (
          <div
            key={item.movieId}
            className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20"
          >
            {/* Movie Poster */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  item.movie.backdrop_path
                    ? `${TMDB_IMAGE_BASE}${item.movie.backdrop_path}`
                    : '/placeholder.jpg'
                }
                alt={item.movie.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => continueWatching(item)}
                  className="w-16 h-16 bg-purple-500/90 hover:bg-purple-500 rounded-full flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-all shadow-lg"
                >
                  <Play size={28} className="text-white ml-1" fill="white" />
                </button>
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg border border-zinc-700">
                <span className="text-xs font-bold text-white">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                {item.movie.title}
              </h3>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span>{formatTime(item.currentTime)}</span>
                  <span>{formatTime(item.duration)}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock size={14} />
                  <span>{formatDate(item.lastWatched)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => continueWatching(item)}
                    className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium transition-colors border border-purple-500/20"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => removeFromHistory(item.movieId)}
                    className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PreviouslyWatchedSection;    