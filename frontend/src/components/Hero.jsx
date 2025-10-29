import React, { useEffect, useState } from "react";
import banner from "../assets/hero-banner.jpg";
import { Link, useParams } from "react-router";

const TMDB_URL =
  "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const Hero = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  };

  // --- 1️⃣ fetch a movie (random or by id) ---
  useEffect(() => {
    const controller = new AbortController();

    const fetchMovies = async () => {
      try {
        if (id) {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
            { ...options, signal: controller.signal }
          );
          if (!res.ok) throw new Error(res.status);
          const data = await res.json();
          setMovie(data);
        } else {
          const res = await fetch(TMDB_URL, {
            ...options,
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(res.status);
          const data = await res.json();
          const results = Array.isArray(data.results) ? data.results : [];
          if (results.length) {
            const withBackdrop = results.filter((m) => m.backdrop_path);
            const pool = withBackdrop.length ? withBackdrop : results;
            const picked = pool[Math.floor(Math.random() * pool.length)];
            setMovie(picked);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
    return () => controller.abort();
  }, [id]);

  // --- 2️⃣ fetch trailer once movie is known ---
  useEffect(() => {
    if (!movie?.id) return;
    const controller = new AbortController();

    fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/videos?language=en-US`,
      { ...options, signal: controller.signal }
    )
      .then((res) => res.json())
      .then((res) => {
        const trailer = res.results?.find(
          (vid) => vid.site === "YouTube" && vid.type === "Trailer"
        );
        setTrailerKey(trailer?.key || null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, [movie]);

  // --- 3️⃣ render states ---
  if (loading) {
    return (
      <div className="relative w-[1200px] h-[500px] mx-auto overflow-hidden rounded-xl bg-slate-800/60 border border-orange-500/20 flex items-center justify-center text-white/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="relative w-[1200px] h-[500px] mx-auto overflow-hidden rounded-xl bg-slate-800/60 border border-orange-500/20 flex items-center justify-center text-white/80">
        No movie found.
      </div>
    );
  }

  const imgSrc = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : banner;

  // Extract year from release_date
  const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  
  // Get genres (limit to first 2)
  const genres = movie.genres?.slice(0, 2).map(g => g.name).join(', ') || 'N/A';
  
  // Get rating
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  // Truncate overview to ~150 characters
  const shortOverview = movie.overview 
    ? movie.overview.length > 200 
      ? movie.overview.substring(0, 200) + '...' 
      : movie.overview
    : "No description available.";

  // --- 4️⃣ final UI ---
  return (
    <div 
      className="relative w-[1400px] h-[500px] mx-auto overflow-hidden rounded-xl border-2 border-orange-500/20 shadow-xl shadow-orange-500/10 transition-all duration-500 hover:border-orange-500/50 hover:shadow-orange-500/30 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        src={imgSrc}
        alt={movie.title || "banner"}
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent transition-all duration-500 ${
        isHovered ? 'from-black/95 via-black/70' : ''
      }`} />

      {/* Animated Corner Accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full transition-all duration-500 group-hover:w-60 group-hover:h-60"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-tr-full transition-all duration-500 group-hover:w-48 group-hover:h-48"></div>

      <div className="relative h-full px-8 lg:px-12 pb-10 pt-8 flex flex-col justify-end max-w-[55%]">
        
        {/* Title */}
        <h1 className={`text-white text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg transition-all duration-500 ${
          isHovered ? 'scale-105 text-orange-400' : ''
        }`}>
          {movie.title || movie.original_title}
        </h1>

        {/* Meta Info: Year | Genre | Rating */}
        <div className={`mt-3 flex items-center gap-3 text-white/90 text-sm transition-all duration-500 ${
          isHovered ? 'gap-4 text-base' : ''
        }`}>
          <span className="font-semibold bg-slate-800/50 px-3 py-1 rounded-full backdrop-blur-sm">{year}</span>
          <span className="text-orange-500">|</span>
          <span className="bg-slate-800/50 px-3 py-1 rounded-full backdrop-blur-sm">{genres}</span>
          <span className="text-orange-500">|</span>
          <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full backdrop-blur-sm">
            <i className="ri-star-fill text-yellow-400"></i>
            {rating}
          </span>
        </div>

        {/* Short Description */}
        <p className={`mt-3 text-white/80 leading-relaxed text-sm max-w-xl transition-all duration-500 ${
          isHovered ? 'text-white/90 text-base' : ''
        }`}>
          {shortOverview}
        </p>

        {/* Buttons */}
        <div className={`mt-5 flex items-center gap-4 transition-all duration-500 ${
          isHovered ? 'gap-5 scale-105' : ''
        }`}>
          {trailerKey && (
            <Link
              to={`https://www.youtube.com/watch?v=${trailerKey}`}
              target="_blank"
            >
              <button className="group/btn cursor-pointer px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg font-semibold hover:scale-110 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/60 flex items-center gap-2">
                <i className="ri-play-large-fill group-hover/btn:scale-125 transition-transform duration-300"></i>
                <span>Watch</span>
              </button>
            </Link>
          )}
          <Link to={`/movie/${movie.id}`}>
            <button className="group/btn cursor-pointer px-6 py-2.5 bg-slate-800/80 backdrop-blur-sm border-2 border-cyan-400/40 hover:border-cyan-400/80 hover:bg-slate-700/80 text-white rounded-lg font-semibold hover:scale-110 transition-all duration-300 flex items-center gap-2">
              <i className="ri-information-line group-hover/btn:scale-125 transition-transform duration-300"></i>
              <span>More Info</span>
            </button>
          </Link>
        </div>

        {/* Hover Indicator */}
        {isHovered && (
          <div className="mt-6 flex items-center gap-2 text-orange-400 text-sm font-semibold animate-pulse">
            <i className="ri-arrow-right-line"></i>
            <span>Click for more details</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;