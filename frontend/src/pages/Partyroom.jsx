import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Play, Pause, Volume2, Maximize2, Copy } from "lucide-react";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const PartyRoom = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const code = `MS-${id}`; // simple readable code derived from movie ID

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          { ...options, signal: controller.signal }
        );
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
    return () => controller.abort();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0f1626]">
        Loading movie…
      </div>
    );

  if (!movie)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0f1626]">
        Movie not found.
      </div>
    );

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";

  return (
    <div
      className="min-h-screen bg-[#0f1626] text-white flex flex-col items-center px-4 py-10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backdrop
          ? `linear-gradient(180deg, rgba(10,10,25,0.95), rgba(10,10,25,0.9)), url(${backdrop})`
          : "none",
      }}
    >
      <div className="w-full max-w-6xl bg-[#181a2f]/95 rounded-2xl shadow-2xl border border-[#2A2F4D]/50 backdrop-blur-sm p-6 flex flex-col md:flex-row gap-8">
        {/* ========= Left: video player ========= */}
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-[#9D4EDD]">
              {movie.title}
            </h2>
          </div>

          {/* Player box */}
          <div className="bg-black rounded-xl relative overflow-hidden shadow-lg h-[400px] flex items-center justify-center">
            <p className="text-gray-500 text-sm">🎬 Video Player Area</p>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/10 backdrop-blur-sm px-5 py-3 flex flex-col">
              {/* Progress line */}
              <div className="w-full h-[4px] bg-gray-600 rounded mb-3">
                <div className="h-full w-[30%] bg-[#9D4EDD] rounded"></div>
              </div>

              {/* Control buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button className="bg-[#9D4EDD] hover:brightness-110 p-2 rounded-md transition">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="bg-[#00B4D8] hover:brightness-110 p-2 rounded-md transition">
                    <Pause className="w-4 h-4" />
                  </button>
                  <button className="hover:text-[#9D4EDD] transition">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <button className="hover:text-[#9D4EDD] transition">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========= Right: code + chat ========= */}
        <div className="w-full md:w-1/3 bg-[#1a1c35]/95 rounded-xl shadow-lg flex flex-col border border-[#2A2F4D]/50">
          {/* ===== Party Code + Participants (compact header) ===== */}
          <div className="p-5 border-b border-[#2A2F4D]/60">
            <div className="flex flex-col gap-4">
              {/* Party Code row */}
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <h3 className="text-base font-semibold text-[#5CFFED]">
                  Party Code
                </h3>
                <div className="flex items-center gap-2 bg-[#222b45] px-3 py-1.5 rounded-md">
                  <span className="font-mono tracking-widest text-[#9D4EDD] text-sm">
                    {code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-[#9D4EDD] transition"
                    title="Copy Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Smaller participants line */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex -space-x-3">
                  <img
                    src="https://i.pravatar.cc/36?u=user1"
                    alt="User 1"
                    className="w-9 h-9 rounded-full border-2 border-[#9D4EDD]"
                  />
                  <img
                    src="https://i.pravatar.cc/36?u=user2"
                    alt="User 2"
                    className="w-9 h-9 rounded-full border-2 border-[#9D4EDD]"
                  />
                </div>
                <p className="text-xs text-gray-400">2 participants online</p>
              </div>

              {copied && (
                <p className="text-xs text-green-400 text-right">
                  Code copied!
                </p>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 p-5 flex flex-col">
            <div className="flex-1 bg-[#222b45] rounded-lg p-4 mb-4 text-sm text-gray-400 flex items-center justify-center">
              No messages yet. Say hi!
            </div>

            <div className="flex items-center bg-[#222b45] rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-3 py-2 text-gray-200 placeholder-gray-400 focus:outline-none"
              />
              <button className="bg-[#9D4EDD] px-4 py-2 hover:brightness-110 transition">
                ➤
              </button>
            </div>

            <button className="mt-4 bg-gradient-to-r from-red-600 to-[#EF4444] hover:brightness-110 py-2 rounded-md font-semibold">
              Leave Watch Party
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-gray-500 text-sm text-center tracking-wide">
        Stream • Sync • Chat • Laugh
      </p>
    </div>
  );
};

export default PartyRoom;