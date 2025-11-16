import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * RecommendedMovies Component
 * Displays a grid of recommended movies
 * 
 * @param {Array} movieTitles - Array of movie titles or objects with movie data
 * @param {Function} onMovieClick - Optional callback when movie is clicked
 */
const RecommendedMovies = ({ movieTitles = [], onMovieClick }) => {
  const navigate = useNavigate();

  const handleMovieClick = (movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    } else {
      // Default: navigate to movie page if contentId exists
      if (movie.contentId) {
        navigate(`/movie/${movie.contentId}`);
      } else if (movie.id) {
        navigate(`/movie/${movie.id}`);
      }
    }
  };

  if (!movieTitles || movieTitles.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="ri-movie-line text-6xl text-slate-600 mb-4" aria-hidden="true"></i>
        <p className="text-slate-400 text-lg">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movieTitles.map((movie, index) => {
        // Handle both string titles and movie objects
        const movieData = typeof movie === 'string' 
          ? { title: movie, contentId: movie.toLowerCase().replace(/\s+/g, '-') }
          : movie;

        return (
          <div
            key={movieData.contentId || movieData.id || index}
            onClick={() => handleMovieClick(movieData)}
            className="group cursor-pointer bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20"
          >
            {/* Poster/Thumbnail */}
            <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
              {movieData.thumbnailUrl || movieData.poster_path ? (
                <img
                  src={movieData.thumbnailUrl || `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`}
                  alt={movieData.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <i className="ri-movie-line text-5xl text-slate-700"></i>
                </div>
              )}
              
              {/* Rank Badge */}
              {movieData.rank && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-black text-sm px-2 py-1 rounded-lg shadow-lg">
                  #{movieData.rank}
                </div>
              )}

              {/* Rating Badge */}
              {(movieData.rating || movieData.vote_average) && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <i className="ri-star-fill"></i>
                  {(movieData.rating || movieData.vote_average).toFixed(1)}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                {movieData.reason && (
                  <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                    {movieData.reason}
                  </p>
                )}
                {movieData.genres && movieData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {movieData.genres.slice(0, 2).map((genre, idx) => (
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

            {/* Movie Info */}
            <div className="p-4">
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                {movieData.title}
              </h3>
              
              {(movieData.year || movieData.release_date) && (
                <p className="text-slate-400 text-sm mb-2">
                  {movieData.year || new Date(movieData.release_date).getFullYear()}
                </p>
              )}

              {/* Reason (if available) */}
              {movieData.reason && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {movieData.reason}
                </p>
              )}

              {/* Platform */}
              {movieData.platform && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <i className="ri-tv-line"></i>
                  <span>{movieData.platform}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecommendedMovies;

