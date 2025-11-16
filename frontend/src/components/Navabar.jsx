import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BACKEND_URL } from "../lib/confg";
import AIPicksModal from "./AIPicksModal";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const Navabar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize user from localStorage once
  const [user, setUser] = useState(() => {
    try {
      const ud = localStorage.getItem("user");
      return ud ? JSON.parse(ud) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  });

  const [showAIPicks, setShowAIPicks] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Refs
  const didRedirectRef = useRef(false);
  const searchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    console.log(`[Navabar] ${new Date().toLocaleTimeString()} - pathname=${location.pathname} user=${user ? "present" : "null"}`);

    if (!user && location.pathname !== "/signin" && !didRedirectRef.current) {
      didRedirectRef.current = true;
      navigate("/signin");
    }

    if (user) didRedirectRef.current = false;
  }, [user, location.pathname, navigate]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function with debouncing
  const searchMovies = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
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
      setSearchResults(data.results?.slice(0, 8) || []); // Limit to 8 results
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchMovies(query);
    }, 300); // 300ms delay
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setShowSearchResults(false);
        setSearchQuery("");
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleMovieClick(searchResults[selectedIndex]);
        } else if (searchQuery.trim()) {
          // Navigate to search results page
          navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
          setShowSearchResults(false);
          setSearchQuery("");
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle movie selection
  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
    setShowSearchResults(false);
    setSearchQuery("");
    setSelectedIndex(-1);
  };

  const HandleLogout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    try {
      await fetch(`${BACKEND_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    navigate("/signin");
  };

  return (
    <nav className="sticky top-0 z-[55] px-8 py-4 bg-slate-900/95 backdrop-blur-xl text-slate-300 border-b border-orange-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to={"/"}>
          <h1 className="text-3xl font-black tracking-tight select-none transition-all duration-300 hover:scale-105 cursor-pointer">
            <span className="text-orange-500">Movie</span>
            <span className="text-cyan-400">Sync</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center space-x-8">
          <Link to={"/"}>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
              Home
            </li>
          </Link>
          <Link to={"/suggestions"}>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
              Suggestion
            </li>
          </Link>
          <Link to={"/watchparty"}>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
              Watch Party
            </li>
          </Link>
        </ul>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Bar with Results */}
          <div 
            ref={searchContainerRef}
            className="relative hidden lg:block"
          >
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && searchResults.length > 0 && setShowSearchResults(true)}
                className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none px-4 pr-10 py-2 rounded-lg focus:border-orange-500 transition-colors duration-200 w-52"
                placeholder="Search movies..."
              />
              {isSearching ? (
                <i className="absolute right-3 text-base text-slate-500 ri-loader-4-line animate-spin" />
              ) : (
                <i className="absolute right-3 text-base text-slate-500 ri-search-line" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
                {searchResults.length > 0 ? (
                  <>
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((movie, index) => (
                        <div
                          key={movie.id}
                          onClick={() => handleMovieClick(movie)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150 ${
                            index === selectedIndex 
                              ? 'bg-slate-700' 
                              : 'hover:bg-slate-700/50'
                          }`}
                        >
                          {/* Movie Poster */}
                          <div className="flex-shrink-0">
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                alt={movie.title}
                                className="w-12 h-18 object-cover rounded"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-18 bg-slate-700 rounded flex items-center justify-center">
                                <i className="ri-film-line text-slate-500"></i>
                              </div>
                            )}
                          </div>
                          
                          {/* Movie Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {movie.title}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            </p>
                          </div>

                          {/* Rating */}
                          {movie.vote_average > 0 && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <i className="ri-star-fill text-sm"></i>
                              <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* View All Results */}
                    <div 
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="p-3 text-center border-t border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                    >
                      <span className="text-orange-500 text-sm font-medium">
                        View all results for "{searchQuery}"
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Picks Button */}
          <button
            onClick={() => {
              if (!user) {
                navigate("/signin");
              } else {
                setShowAIPicks(true);
              }
            }}
            className="hidden md:flex bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg shadow-orange-500/20 hover:scale-105 transform items-center gap-2"
          >
            <i className="ri-magic-line"></i>
            Get AI Picks
          </button>

          {/* User Section */}
          {!user ? (
            <Link to={"/signin"}>
              <button className="border-2 border-cyan-500/50 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all duration-200 font-semibold text-sm">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <button
                className="border-2 border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 font-semibold text-sm"
                onClick={HandleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Picks Modal */}
      {user && (
        <AIPicksModal
          isOpen={showAIPicks}
          onClose={() => setShowAIPicks(false)}
          userId={user.userId || user._id}
        />
      )}
    </nav>
  );
};

export default Navabar;