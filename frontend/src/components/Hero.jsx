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
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : banner;

  // --- 4️⃣ final UI ---
  return (
    <div className="relative w-[1400px] h-[500px] mx-auto overflow-hidden rounded-xl">
      <img
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={imgSrc}
        alt={movie.title || "banner"}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

      <div className="relative h-full px-8 lg:px-12 pb-10 pt-8 flex flex-col justify-end max-w-[65%]">
        <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight drop-shadow">
          {movie.title || movie.original_title}
        </h1>

        <p className="mt-4 text-white/90 leading-relaxed max-w-2xl">
          {movie.overview || "No description available."}
        </p>

        <div className="mt-6 flex items-center space-x-8">
          {trailerKey && (
            <Link
              to={`https://www.youtube.com/watch?v=${trailerKey}`}
              target="_blank"
            >
              <button className="cursor-pointer px-5 py-2 bg-[#9D4EDD] text-[#ffffff] rounded font-[500] hover:scale-105 transition-transform duration-200">
                <i className="ri-play-large-line"></i> Watch
              </button>
            </Link>
          )}
          <Link to={`/movie/${movie.id}`}>
            <button className="cursor-pointer px-5 py-2 bg-[#475569] text-[#ffffff] rounded font-[500] hover:scale-105 transition-transform duration-200">
              <i className="ri-information-line"></i> More Info
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;