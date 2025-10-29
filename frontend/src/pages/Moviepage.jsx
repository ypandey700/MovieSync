import { Play } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { BACKEND_URL } from "../lib/confg";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const Moviepage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
      ...options,
      signal,
    })
      .then((res) => res.json())
      .then((res) => setMovie(res));

    fetch(
      `https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`,
      { ...options, signal }
    )
      .then((res) => res.json())
      .then((res) => setRecommendations(res.results || []));

    fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
      { ...options, signal }
    )
      .then((res) => res.json())
      .then((res) => {
        const trailer = res.results?.find(
          (vid) => vid.site === "YouTube" && vid.type === "Trailer"
        );
        setTrailerKey(trailer?.key || null);
      });

    return () => controller.abort();
  }, [id]);

  const data = localStorage.getItem('user')
  const user = JSON.parse(data); 

  const createWatchParty = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/party/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          contentId: id,
          content: movie,
        }),
      });
      const data = await res.json();
      console.log(data); 
      if (res.ok) navigate(`/watchparty/${data.watchParty.joinCode}`);
      else alert(data.message || "Failed to create watch party");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-lg text-slate-400 font-semibold">Loading movie...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <div
        className="relative h-[75vh] flex items-end overflow-hidden"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center p-10 gap-8 max-w-[1600px] mx-auto w-full pb-16">
          
          {/* Poster */}
          <div className="hidden md:block group">
            <img
              src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
              alt={movie.title}
              className="rounded-xl shadow-2xl w-60 border-2 border-orange-500/40 group-hover:border-orange-500/80 transition-all duration-300"
            />
          </div>

          {/* Movie Info */}
          <div className="flex flex-col justify-end flex-1 space-y-4">
            
            {/* Title */}
            <h1 className="text-5xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {movie.title}
              </span>
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <i className="ri-star-fill text-yellow-400 text-base"></i>
                <span className="font-semibold text-white">{movie.vote_average?.toFixed(1)}</span>
                <span className="text-yellow-400/80 text-xs">/10</span>
              </span>
              
              <span className="flex items-center gap-2 bg-slate-800/60 border border-orange-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <i className="ri-calendar-line text-orange-500"></i>
                <span className="text-slate-200">{movie.release_date?.split('-')[0]}</span>
              </span>
              
              <span className="flex items-center gap-2 bg-slate-800/60 border border-cyan-400/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <i className="ri-time-line text-cyan-400"></i>
                <span className="text-slate-200">{movie.runtime} min</span>
              </span>

              <span className="flex items-center gap-2 bg-slate-800/60 border border-slate-600/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <i className="ri-global-line text-slate-400"></i>
                <span className="text-slate-200">{movie.original_language?.toUpperCase()}</span>
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/40 px-4 py-1.5 rounded-full text-sm font-medium text-orange-300 hover:border-orange-500/80 transition-all duration-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="max-w-3xl text-slate-200 leading-relaxed text-base">
              {movie.overview}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {trailerKey && (
                <Link
                  to={`https://www.youtube.com/watch?v=${trailerKey}`}
                  target="_blank"
                >
                  <button className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-300">
                    <Play className="w-4 h-4" />
                    <span>Watch Trailer</span>
                  </button>
                </Link>
              )}

              <button
                onClick={createWatchParty}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800/90 backdrop-blur-sm border-2 border-cyan-400/50 hover:border-cyan-400 hover:bg-slate-700/90 px-6 py-3 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <i className="ri-group-2-line text-lg text-cyan-400"></i>
                <span>Create Watch Party</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-10 py-16 max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-cyan-400 rounded-full"></div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Movie Details
          </h2>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-10 shadow-xl">
          
          {/* Tagline */}
          {movie.tagline && (
            <div className="mb-8 pb-8 border-b border-slate-700/50">
              <div className="flex items-start gap-2">
                <i className="ri-double-quotes-l text-3xl text-orange-500/60"></i>
                <p className="text-xl text-orange-400 italic font-medium leading-relaxed">
                  {movie.tagline}
                </p>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Status */}
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-orange-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-film-line text-orange-500 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status</p>
              </div>
              <p className="text-white font-semibold text-base">{movie.status}</p>
            </div>

            {/* Release Date */}
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-orange-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-calendar-event-line text-orange-500 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Release Date</p>
              </div>
              <p className="text-white font-semibold text-base">{movie.release_date}</p>
            </div>

            {/* Runtime */}
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-timer-line text-cyan-400 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Runtime</p>
              </div>
              <p className="text-white font-semibold text-base">{movie.runtime} minutes</p>
            </div>

            {/* Language */}
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-translate-2 text-cyan-400 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Language</p>
              </div>
              <p className="text-white font-semibold text-base">{movie.original_language?.toUpperCase()}</p>
            </div>

            {/* Budget */}
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-money-dollar-circle-line text-green-500 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Budget</p>
              </div>
              <p className="text-white font-semibold text-base">
                {movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : "N/A"}
              </p>
            </div>

            {/* Revenue */}
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-wallet-3-line text-green-500 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Revenue</p>
              </div>
              <p className="text-white font-semibold text-base">
                {movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : "N/A"}
              </p>
            </div>

            {/* Production Companies */}
            <div className="lg:col-span-2 bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-orange-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-building-line text-orange-500 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Production Companies</p>
              </div>
              <p className="text-white font-semibold text-sm leading-relaxed">
                {movie.production_companies?.length
                  ? movie.production_companies.map((c) => c.name).join(", ")
                  : "N/A"}
              </p>
            </div>

            {/* Production Countries */}
            <div className="md:col-span-2 lg:col-span-2 bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-earth-line text-cyan-400 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Production Countries</p>
              </div>
              <p className="text-white font-semibold text-sm leading-relaxed">
                {movie.production_countries?.length
                  ? movie.production_countries.map((c) => c.name).join(", ")
                  : "N/A"}
              </p>
            </div>

            {/* Spoken Languages */}
            <div className="md:col-span-2 lg:col-span-2 bg-slate-900/50 rounded-lg p-5 border border-slate-700/30 hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-chat-3-line text-cyan-400 text-lg"></i>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Spoken Languages</p>
              </div>
              <p className="text-white font-semibold text-sm leading-relaxed">
                {movie.spoken_languages?.length
                  ? movie.spoken_languages.map((l) => l.english_name).join(", ")
                  : "N/A"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Moviepage;