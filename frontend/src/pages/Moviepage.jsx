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
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl text-purple-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div
        className="relative h-[60vh] flex items-end"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center p-8 gap-8">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg shadow-lg w-48 hidden md:block"
          />

          <div className="flex flex-col justify-end">
            <h1 className="text-4xl font-bold mb-3">{movie.title}</h1>

            <div className="flex items-center gap-4 mb-3 text-gray-300 text-sm">
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date}</span>
              <span>{movie.runtime} min</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="max-w-2xl text-gray-200 mb-6">{movie.overview}</p>

            <div className="flex flex-wrap items-center gap-4">
              {trailerKey && (
                <Link
                  to={`https://www.youtube.com/watch?v=${trailerKey}`}
                  target="_blank"
                >
                  <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#7E22CE] px-6 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 min-w-[160px]">
                    <Play className="w-4 h-4" />
                    <span>Watch Now</span>
                  </button>
                </Link>
              )}

              <button
                onClick={createWatchParty}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#7E22CE] px-6 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 min-w-[160px]"
              >
                <i className="ri-group-2-line text-lg"></i>
                <span>Create Watch Party</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <ul className="text-gray-300 space-y-3">
              <li>
                <span className="font-semibold text-white">Status:</span>
                <span className="ml-2">{movie.status}</span>
              </li>
              <li>
                <span className="font-semibold text-white">Release Date:</span>
                <span className="ml-2">{movie.release_date}</span>
              </li>
              <li>
                <span className="font-semibold text-white">
                  Original Language:
                </span>
                <span className="ml-2">
                  {movie.original_language?.toUpperCase()}
                </span>
              </li>
              <li>
                <span className="font-semibold text-white">Budget:</span>
                <span className="ml-2">
                  {movie.budget
                    ? `$${movie.budget.toLocaleString()}`
                    : "N/A"}
                </span>
              </li>
              <li>
                <span className="font-semibold text-white">Revenue:</span>
                <span className="ml-2">
                  {movie.revenue
                    ? `$${movie.revenue.toLocaleString()}`
                    : "N/A"}
                </span>
              </li>
              <li>
                <span className="font-semibold text-white">
                  Production Companies:
                </span>
                <span className="ml-2">
                  {movie.production_companies?.length
                    ? movie.production_companies.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>
              <li>
                <span className="font-semibold text-white">Countries:</span>
                <span className="ml-2">
                  {movie.production_countries?.length
                    ? movie.production_countries.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>
              <li>
                <span className="font-semibold text-white">
                  Spoken Languages:
                </span>
                <span className="ml-2">
                  {movie.spoken_languages?.length
                    ? movie.spoken_languages
                        .map((l) => l.english_name)
                        .join(", ")
                    : "N/A"}
                </span>
              </li>
            </ul>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Tagline</h3>
            <p className="italic text-gray-400 mb-6">
              {movie.tagline || "No tagline available."}
            </p>
            <h3 className="font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-200">{movie.overview}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moviepage;
