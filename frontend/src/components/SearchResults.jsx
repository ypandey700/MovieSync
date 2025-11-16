// SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      fetchSearchResults(query, currentPage);
    }
  }, [query, currentPage]);

  const fetchSearchResults = async (searchQuery, page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setResults(data.results || []);
      setTotalPages(data.total_pages || 0);
      setTotalResults(data.total_results || 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          {!loading && totalResults > 0 && (
            <p className="text-slate-400">
              Found {totalResults} movies
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <i className="ri-loader-4-line text-4xl animate-spin text-orange-500"></i>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-lg bg-slate-800">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-auto group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-[300px] bg-slate-800 flex items-center justify-center">
                        <i className="ri-film-line text-6xl text-slate-600"></i>
                      </div>
                    )}
                    
                    {/* Overlay with rating */}
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-500 text-sm"></i>
                      <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <h3 className="mt-2 font-semibold group-hover:text-orange-500 transition-colors line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            )}
          </>
        )}
        
        {!loading && results.length === 0 && (
          <div className="text-center text-slate-400 mt-20">
            <i className="ri-movie-2-line text-6xl mb-4"></i>
            <p className="text-xl">No movies found for "{query}"</p>
            <p className="text-sm mt-2">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;