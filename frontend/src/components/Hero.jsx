import React, { useEffect, useState } from 'react';
import banner from '../assets/hero-banner.jpg';

const TMDB_URL = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1';
const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN //use api key




const Hero = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMovies = async () => {
      try {
        const res = await fetch(TMDB_URL, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_TOKEN}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`TMDB error: ${res.status}`);

        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        if (results.length) {
          const withBackdrop = results.filter((m) => m.backdrop_path);
          const pool = withBackdrop.length ? withBackdrop : results;
          const picked = pool[Math.floor(Math.random() * pool.length)];
          setMovie(picked);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="relative w-[1200px] h-[500px] mx-auto overflow-hidden rounded-xl bg-slate-800/60 flex items-center justify-center text-white/80">
        Loading...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="relative w-[1200px] h-[500px] mx-auto overflow-hidden rounded-xl bg-slate-800/60 flex items-center justify-center text-white/80">
        No movie found.
      </div>
    );
  }

  const imgSrc = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
    : banner;

  return (
    <div className="relative w-[1400px] h-[500px] mx-auto overflow-hidden rounded-xl">
      {/* Background image */}
      <img
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={imgSrc}
        alt={movie.title || 'banner'}
      />

      {/* Gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

      {/* Content: only name + description + your buttons */}
      <div className="relative h-full px-8 lg:px-12 pb-10 pt-8 flex flex-col justify-end max-w-[65%]">
        <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight drop-shadow">
          {movie.title || movie.original_title}
        </h1>

        <p className="mt-4 text-white/90 leading-relaxed max-w-2xl">
          {movie.overview || 'No description available.'}
        </p>

        <div className="mt-6 flex items-center space-x-8">
          <button className="cursor-pointer px-4 py-2 bg-[#9D4EDD] brightness-100  text-[#ffffff] px-5 py-2 rounded font-[500] hover:scale-105 transition-transform duration-200">
            <i className="ri-play-large-line"></i> Watch
          </button>
          <button className="cursor-pointer px-4 py-2 bg-[#475569] brightness-100  text-[#ffffff] px-5 py-2 rounded font-[500] hover:scale-105 transition-transform duration-200">
            <i className="ri-information-line"></i> More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;