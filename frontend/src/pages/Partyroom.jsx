import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Play, Pause, Volume2, VolumeX, Maximize2, Copy, Users, Send, Film, Share2, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { socket } from "../lib/socket";
import sampleVideo from "../assets/sample.mp4";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

const PartyRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantsNumber, setParticipantsNumber] = useState(0);

  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  const videoRef = useRef();
  const chatEndRef = useRef();
  const controlsTimeoutRef = useRef();

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    []
  );
  const joinCode = id;

  if (!user) navigate("/");

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

  useEffect(() => {
    if (!user?.userId || !joinCode) return;

    socket.on("connect", () => {
      socket.emit("joinParty", { joinCode, user });
    });

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
  }, [user, joinCode]);

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

  const handlePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;

    if (isPlaying) {
      socket.emit("videoControl", {
        joinCode,
        action: "pause",
        time: v.currentTime,
      });
      v.pause();
      setIsPlaying(false);
    } else {
      socket.emit("videoControl", {
        joinCode,
        action: "play",
        time: v.currentTime,
      });
      v.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/watchparty/${joinCode}`;
    const shareText = `Join me to watch "${movie?.title}" on MovieSync! Room Code: ${joinCode}`;

    if (navigator.share) {
      navigator.share({
        title: "MovieSync Watch Party",
        text: shareText,
        url: shareUrl,
      }).catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  const leaveParty = () => {
    socket.emit("leaveParty", { joinCode, userId: user.userId });
    navigate("/");
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateTime);
    };
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      socket.emit("videoControl", {
        joinCode,
        action: isPlaying ? "play" : "pause",
        time: newTime,
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <span className="text-xl font-medium">Loading movie...</span>
        </div>
      </div>
    );

  if (!movie)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Movie not found.</div>
      </div>
    );

  const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <Film className="text-purple-500" size={20} />
            <div>
              <h1 className="font-semibold text-sm">{movie.title}</h1>
              <p className="text-xs text-zinc-400">
                {year} • {movie.runtime || "N/A"} min
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-400">LIVE</span>
          </div>

          {/* Room Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <span className="text-xs text-zinc-400">Room:</span>
            <span className="font-mono font-bold text-sm">{joinCode}</span>
            <Copy size={14} />
          </button>

          {/* Users Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
            <Users size={14} className="text-purple-400" />
            <span className="text-sm font-medium">
              {participantsNumber || participants.length}
            </span>
          </div>

          {/* Actions */}
          <button
            onClick={handleShare}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={leaveParty}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Container */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {/* Video Area - Fixed aspect ratio container */}
          <div className="flex-1 flex items-center justify-center bg-black">
            <div
              className="relative w-full max-w-7xl mx-auto"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              style={{ aspectRatio: "16/9", maxHeight: "75vh" }}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-contain bg-black"
                src={sampleVideo}
              />

              {/* Overlay Controls */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause size={24} className="text-white" />
                    ) : (
                      <Play size={24} className="text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Bottom Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {/* Progress Bar */}
                  <div
                    className="relative w-full h-1.5 bg-zinc-700 rounded-full cursor-pointer mb-3 group"
                    onClick={handleSeek}
                  >
                    <div
                      className="absolute h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${((currentTime / duration) * 100) || 0}%`,
                      }}
                    />
                    <div
                      className="absolute w-3 h-3 bg-purple-500 rounded-full -top-[3px] shadow-lg transition-all group-hover:scale-125"
                      style={{
                        left: `${((currentTime / duration) * 100) || 0}%`,
                        transform: "translateX(-50%)",
                      }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePlayPause}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>

                      <div className="flex items-center gap-2 group">
                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX size={20} />
                          ) : (
                            <Volume2 size={20} />
                          )}
                        </button>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover:w-20 transition-all duration-300 accent-purple-500"
                        />
                      </div>

                      <div className="text-xs text-zinc-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              {copied && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50">
                  ✓ Room code copied!
                </div>
              )}
            </div>
          </div>

          {/* Movie Info Bar */}
          <div className="px-6 py-3 bg-zinc-900/50 border-t border-zinc-800">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Rating:</span>
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    <span className="text-sm font-medium">{rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Genre:</span>
                  <span className="text-sm">
                    {movie.genres?.slice(0, 2).map((g) => g.name).join(", ") ||
                      "N/A"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Info size={14} />
                {showInfo ? "Hide" : "Show"} Details
              </button>
            </div>

            {/* Expandable Movie Details */}
            {showInfo && (
              <div className="mt-3 pt-3 border-t border-zinc-800 max-w-7xl mx-auto">
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {movie.overview || "No description available."}
                </p>
                {(movie.budget > 0 || movie.revenue > 0) && (
                  <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                    {movie.budget > 0 && (
                      <span>
                        Budget: ${(movie.budget / 1000000).toFixed(1)}M
                      </span>
                    )}
                    {movie.revenue > 0 && (
                      <span>
                        Revenue: ${(movie.revenue / 1000000).toFixed(1)}M
                      </span>
                    )}
                    <span>Status: {movie.status || "N/A"}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        <aside
          className={`${
            showChat ? "w-80" : "w-0"
          } transition-all duration-300 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden`}
        >
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Watch Party Chat</h2>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-1 hover:bg-zinc-800 rounded transition-colors"
              >
                <ChevronLeft
                  size={16}
                  className={`transition-transform ${
                    showChat ? "" : "rotate-180"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">
                Online ({participants.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full"
                >
                  <span className="text-xs">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8">
                <Send size={32} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-sm text-zinc-500">No messages yet</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Start the conversation!
                </p>
              </div>
            ) : (
              chatMessages.map((m, i) => (
                <div key={i} className="group">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-400">
                      {m.userName}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {new Date(m.timestamp).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="bg-zinc-800 rounded-lg px-3 py-2">
                    <p className="text-sm text-zinc-200">{m.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Toggle Chat Button (when hidden) */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed right-4 bottom-4 p-3 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <Send size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PartyRoom;