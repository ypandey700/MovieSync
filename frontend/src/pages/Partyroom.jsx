import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { io } from "socket.io-client";
import { Play, Pause, Volume2, Maximize2, Copy } from "lucide-react";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const socket = io("http://localhost:3000"); // 🔗 connect once

const PartyRoom = () => {
  const { id } = useParams(); // joinCode or movie ID
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantsNumber , setParticipantsNumber] = useState(); 
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const code = id;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  };

  // 🎬 Fetch movie data
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

  useEffect(() => {
    if (!user || !code) return;
    socket.emit("joinParty", { joinCode: code, user });


    socket.on("partyJoined", (party) => {
      setParticipants(party.participants || []);
      setChatMessages(party.chat_messages || []);
    });

    socket.on("participants_update", (data) => {
          setParticipantsNumber(data); 
  });

    socket.on("chatMessage", (msg) =>
      setChatMessages((prev) => [...prev, msg])
    );

    socket.on("videoControl", ({ action, time }) => {
      const video = videoRef.current;
      if (!video) return;
      if (action === "play") {
        video.currentTime = time;
        video.play();
        setIsPlaying(true);
      } else if (action === "pause") {
        video.currentTime = time;
        video.pause();
        setIsPlaying(false);
      }
    });

    socket.on("participantUpdate", (list) => setParticipants(list));

    return () => {
      socket.off("chatMessage");
      socket.off("videoControl");
      socket.off("partyJoined");
      socket.off("participantUpdate");
      socket.emit("leaveParty", { joinCode: code, userId: user._id });
    };
  }, [code, user]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = {
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatarUrl || "https://i.pravatar.cc/36?u=" + user._id,
      message,
      timestamp: new Date().toISOString(),
    };
    socket.emit("chatMessage", { joinCode: code, msg });
    setMessage("");
  };

  const handlePlay = () => {
    const video = videoRef.current;
    socket.emit("videoControl", {
      joinCode: code,
      action: "play",
      time: video.currentTime,
    });
  };

  const handlePause = () => {
    const video = videoRef.current;
    socket.emit("videoControl", {
      joinCode: code,
      action: "pause",
      time: video.currentTime,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0f1626]">
        Loading movie…
      </div>
    );

  if (!movie)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0f1626]">
        Movie not found.
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
            {/* Replace with actual video later */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src="/sample.mp4" // use your movie source
              onPlay={handlePlay}
              onPause={handlePause}
              controls
            />

            {/* Controls can stay or be hidden if using native */}
          </div>
        </div>

        {/* ========= Right: code + chat ========= */}
        <div className="w-full md:w-1/3 bg-[#1a1c35]/95 rounded-xl shadow-lg flex flex-col border border-[#2A2F4D]/50">
          <div className="p-5 border-b border-[#2A2F4D]/60">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <h3 className="text-base font-semibold text-[#5CFFED]">
                  Party Code
                </h3>
                <div className="flex items-center gap-2 bg-[#222b45] px-3 py-1.5 rounded-md">
                  <span className="font-mono tracking-widest text-[#9D4EDD] text-sm">
                    {code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-[#9D4EDD] transition"
                    title="Copy Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex -space-x-3">
                  {participants.map((p) => (
                    <img
                      key={p.userId}
                      src={p.avatarUrl || `https://i.pravatar.cc/36?u=${p.userId}`}
                      alt={p.displayName}
                      className="w-9 h-9 rounded-full border-2 border-[#9D4EDD]"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {participantsNumber || 0} participants online
                </p>
              </div>

              {copied && (
                <p className="text-xs text-green-400 text-right">
                  Code copied!
                </p>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 p-5 flex flex-col">
            <div className="flex-1 bg-[#222b45] rounded-lg p-4 mb-4 text-sm text-gray-200 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold text-[#9D4EDD]">
                    {msg.userName}:{" "}
                  </span>
                  {msg.message}
                </div>
              ))}
            </div>

            <div className="flex items-center bg-[#222b45] rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-3 py-2 text-gray-200 placeholder-gray-400 focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-[#9D4EDD] px-4 py-2 hover:brightness-110 transition"
              >
                ➤
              </button>
            </div>

            <button className="mt-4 bg-gradient-to-r from-red-600 to-[#EF4444] hover:brightness-110 py-2 rounded-md font-semibold">
              Leave Watch Party
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-gray-500 text-sm text-center tracking-wide">
        Stream • Sync • Chat • Laugh
      </p>
    </div>
  );
};

export default PartyRoom;
