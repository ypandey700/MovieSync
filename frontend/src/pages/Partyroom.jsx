import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, Volume2, Maximize2, Copy, LogOut } from "lucide-react";
import { socket } from "../lib/socket";
import sampleVideo from "../assets/sample.mp4";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const PartyRoom = () => {
  const { id } = useParams(); // joinCode
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantsNumber, setParticipantsNumber] = useState(0);

  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef();
  const chatEndRef = useRef();

const user = useMemo(
  () => JSON.parse(localStorage.getItem("user") || "{}"),
  []
);
  const joinCode = id;

  if(!user) navigate("/")

  /* ---------- Fetch Movie from TMDB ---------- */
  useEffect(() => {
    const controller = new AbortController();
    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_TOKEN}`,
            },
            signal: controller.signal,
          }
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

  /* ---------- Socket.IO Logic ---------- */
  useEffect(() => {
    if (!user?.userId || !joinCode) return;

    socket.on('connect',()=>{
      socket.emit("joinParty", { joinCode, user });
    })

    const handlers = {
      partyJoined: ({ participants, chat_messages }) => {
        setParticipants(participants ?? []);
        setChatMessages(chat_messages ?? []);
      },
      participants_update: (data) => {
        if (typeof data === "object" && data !== null) {
          setParticipantsNumber(data.count ?? 0);
          setParticipants(data.participants ?? []);
        } else {
          setParticipantsNumber(data);
        }
      },
      participantUpdate: (list) => setParticipants(list),
      chatMessage: (msg) => setChatMessages((prev) => [...prev, msg]),
      videoControl: ({ action, time }) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = time;
        if (action === "play") {
          v.play().catch(() => {});
          setIsPlaying(true);
        } else {
          v.pause();
          setIsPlaying(false);
        }
      },
    };

    Object.entries(handlers).forEach(([event, handler]) =>
      socket.on(event, handler)
    );

    return () => {
      Object.keys(handlers).forEach((event) =>
        socket.off(event, handlers[event])
      );
      socket.emit("leaveParty", { joinCode, userId: user.userId });
    };
  }, [user , joinCode]);

  /* ---------- Chat ---------- */
  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = {
      userId: user.userId,
      userName: user.name,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit("chatMessage", { joinCode, msg });
    setMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ---------- Video Controls ---------- */
  const handlePlay = () => {
    const v = videoRef.current;
    socket.emit("videoControl", {
      joinCode,
      action: "play",
      time: v.currentTime,
    });
  };

  const handlePause = () => {
    const v = videoRef.current;
    socket.emit("videoControl", {
      joinCode,
      action: "pause",
      time: v.currentTime,
    });
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveParty = () => {
    socket.emit("leaveParty", { joinCode, userId: user.userId });
    navigate("/");
  };

  /* ---------- Render ---------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1626] text-white">
        Loading movie…
      </div>
    );

  if (!movie)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1626] text-white">
        Movie not found.
      </div>
    );

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";

  return (
    <div
      className="min-h-screen bg-[#0f1626] text-white flex flex-col items-center px-4 py-8 bg-cover bg-center"
      style={{
        backgroundImage: backdrop
          ? `linear-gradient(180deg, rgba(10,10,25,.95), rgba(10,10,25,.9)), url(${backdrop})`
          : "none",
      }}
    >
      <div className="w-full max-w-7xl bg-[#181a2f]/95 rounded-2xl shadow-2xl border border-[#2A2F4D]/50 backdrop-blur-sm p-6 flex flex-col lg:flex-row gap-8">
        {/* ---------- VIDEO PLAYER ---------- */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-3xl font-bold text-[#9D4EDD] text-center mb-4">
            {movie.title}
          </h2>

          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              className="w-full h-full"
              src={sampleVideo}
              onPlay={handlePlay}
              onPause={handlePause}
              controls={false}
            />

            {/* Custom Controls */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-4">
              <button
                onClick={() => (isPlaying ? handlePause() : handlePlay())}
                className="text-white hover:text-[#9D4EDD] transition"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#9D4EDD] transition-all"
                  style={{
                    width: `${
                      videoRef.current
                        ? (videoRef.current.currentTime / videoRef.current.duration) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <button className="text-white hover:text-[#9D4EDD]" title="Volume">
                <Volume2 size={24} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#9D4EDD]"
                title="Fullscreen"
              >
                <Maximize2 size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT PANEL: Code + Chat ---------- */}
        <div className="w-full lg:w-96 bg-[#1a1c35]/95 rounded-xl shadow-lg flex flex-col border border-[#2A2F4D]/50">
          {/* Party Code & Participants */}
          <div className="p-5 border-b border-[#2A2F4D]/60">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#5CFFED]">
                  Party Code
                </h3>
                <div className="flex items-center gap-2 bg-[#222b45] px-3 py-1.5 rounded-md">
                  <span className="font-mono tracking-widest text-[#9D4EDD] text-sm">
                    {joinCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    title="Copy"
                    className="text-gray-400 hover:text-[#9D4EDD]"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {participants.slice(0, 5).map((p) => (
                    <img
                      key={p.userId}
                      src={
                        p.avatarUrl ||
                        `https://i.pravatar.cc/36?u=${p.userId}`
                      }
                      alt={p.name}
                      className="w-8 h-8 rounded-full border-2 border-[#9D4EDD]"
                      title={p.name}
                    />
                  ))}
                  {participants.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center text-xs">
                      +{participants.length - 5}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {participantsNumber} online
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
          <div className="flex-1 flex flex-col p-5">
            <div className="flex-1 bg-[#222b45] rounded-lg p-3 mb-3 overflow-y-auto max-h-96">
              {chatMessages.map((m, i) => (
                <div key={i} className="mb-2 text-sm">
                  <span className="font-semibold text-[#9D4EDD]">
                    {m.userName}:
                  </span>{" "}
                  {m.message}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-[#222b45] text-gray-200 placeholder-gray-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-[#9D4EDD] text-white px-4 rounded-lg hover:brightness-110 transition"
              >
                Send
              </button>
            </div>

            <button
              onClick={leaveParty}
              className="mt-4 w-full bg-gradient-to-r from-red-600 to-[#EF4444] hover:brightness-110 py-2 rounded-md font-semibold flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Leave Party
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-gray-500 text-sm text-center">
        Stream • Sync • Chat • Laugh
      </p>
    </div>
  );
};

export default PartyRoom;