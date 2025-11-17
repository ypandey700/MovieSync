// src/pages/SoloWatch.jsx
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, SkipBack, SkipForward, X, RotateCcw, Info, GemIcon } from "lucide-react";
import sampleVideo from "../assets/sample.mp4";
import { GoogleGenAI } from "@google/genai";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;
const GEMINI_API_KEY =import.meta.env.VITE_GEMINI_API_KEY; 


const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SoloWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showResumeNotification, setShowResumeNotification] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false); // New state for summary modal
  const [summaryText, setSummaryText] = useState(""); // New state for summary text
  const [isSummaryLoading, setIsSummaryLoading] = useState(false); // New state for summary loading
  const [summaryError, setSummaryError] = useState(""); // New state for summary errors

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const progressBarRef = useRef(null);

  // Get resume data from location state OR localStorage
  const resumeTime = location.state?.resumeTime || 0;
  const savedDuration = location.state?.duration || 0;
  const isResuming = location.state?.isResuming || false;

  const [resumeData, setResumeData] = useState(null);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);

  useEffect(() => {
    if (!user?.userId) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch movie data
  useEffect(() => {
    const controller = new AbortController();
    const fetchMovie = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_TOKEN}`,
          },
          signal: controller.signal,
        });
        const data = await res.json();
        setMovie(data);

        // Check for existing watch progress
        const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
        const movieProgress = history.find((item) => item.movieId === parseInt(id));

        if (movieProgress && movieProgress.currentTime > 5) {
          setResumeData(movieProgress);
          setShowResumeDialog(true);
        } else if (isResuming && resumeTime > 0) {
          setResumeData({
            currentTime: resumeTime,
            duration: savedDuration,
            movieId: parseInt(id),
          });
          setShowResumeDialog(true);
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
    return () => controller.abort();
  }, [id, resumeTime, savedDuration, isResuming, navigate]);

  const saveWatchProgress = useCallback(() => {
    if (!videoRef.current || !movie?.id) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    if (!duration || currentTime < 5 || currentTime > duration - 10) return;

    const watchData = {
      movieId: movie.id,
      currentTime: currentTime,
      duration: duration,
      lastWatched: new Date().toISOString(),
    };

    try {
      const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
      const filtered = history.filter((item) => item.movieId !== movie.id);
      filtered.unshift(watchData);
      const limited = filtered.slice(0, 20);
      localStorage.setItem("watchHistory", JSON.stringify(limited));
    } catch (err) {
      console.error("Error saving watch history:", err);
    }
  }, [movie?.id]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (!showResumeDialog) {
        video.play().catch((err) => console.log("Auto-play prevented:", err));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      saveWatchProgress();
    };

    const handleVolumeChange = () => {
      setIsMuted(video.muted);
      if (!video.muted) {
        setVolume(video.volume * 100);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [showResumeDialog, saveWatchProgress]);

  // Save progress periodically while playing
  useEffect(() => {
    if (isPlaying && movie?.id) {
      saveWatchProgress();
      saveIntervalRef.current = setInterval(() => {
        saveWatchProgress();
      }, 10000);
    } else {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [isPlaying, movie?.id, saveWatchProgress]);

  // Save on unmount and visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveWatchProgress();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveWatchProgress();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      saveWatchProgress();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveWatchProgress]);

  const handlePlayPause = (e) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;

    if (v.paused || v.ended) {
      v.play().catch((error) => console.log("Play prevented:", error));
    } else {
      v.pause();
      saveWatchProgress();
    }
  };

  const handleResume = () => {
    setShowResumeDialog(false);
    if (videoRef.current && resumeData?.currentTime > 0) {
      videoRef.current.currentTime = resumeData.currentTime;
      setCurrentTime(resumeData.currentTime);
      setShowResumeNotification(true);
      setTimeout(() => setShowResumeNotification(false), 3000);
      videoRef.current.play().catch((err) => console.log("Play prevented:", err));
    }
  };

  const handleStartFromBeginning = () => {
    setShowResumeDialog(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().catch((err) => console.log("Play prevented:", err));
    }
  };

  const startOver = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().catch((err) => console.log("Play prevented:", err));
    }
  };

  const skipForward = (e) => {
    e?.stopPropagation();
    if (videoRef.current && videoRef.current.duration) {
      const newTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
      videoRef.current.currentTime = newTime;
    }
  };

  const skipBackward = (e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      if (newVolume > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressBarClick = (e) => {
    e.stopPropagation();
    const progressBar = progressBarRef.current;
    const video = videoRef.current;

    if (!progressBar || !video || !video.duration) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * video.duration;

    if (!isNaN(newTime) && newTime >= 0 && newTime <= video.duration) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setTimeout(() => saveWatchProgress(), 1000);
    }
  };

  const goBack = () => {
    saveWatchProgress();
    navigate(-1);
  };

  const exitPlayer = () => {
    saveWatchProgress();
    navigate("/");
  };

  // New: Handle summary request
  const handleShowSummary = async () => {
    if (!movie || !videoRef.current || !movie.runtime) {
      setSummaryError("Unable to generate summary: Movie data or video not loaded.");
      setShowSummaryModal(true);
      return;
    }

    setShowSummaryModal(true);
    setIsSummaryLoading(true);
    setSummaryText("");
    setSummaryError("");

    // Map sample video progress to movie runtime
    const videoDuration = videoRef.current.duration || duration;
    const videoCurrentTime = videoRef.current.currentTime || currentTime;
    const movieRuntimeSeconds = movie.runtime * 60; 
    const progressFraction = videoDuration > 0 ? videoCurrentTime / videoDuration : 0;
    const mappedTime = Math.round(progressFraction * movieRuntimeSeconds);


    
    // Construct prompt for Gemini
    const prompt = `The user was watching the movie titled "${movie.title}".
    Its description is: "${movie.overview || "No description available."}".
    The total duration of the movie is ${formatTime(movie.runtime * 60)}.
    The user stopped watching at the ${formatTime(resumeData.currentTime)} mark.
    Please provide a concise summary (100-150 words) of the plot that has likely occurred up to this point.
    Do not reveal major spoilers beyond this point. Focus on setting the scene for resumption.`;
    console.log(prompt); 


    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      setSummaryText(response.text);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryError("Failed to generate summary. Please try again later.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <span className="text-xl font-medium">Loading movie...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Movie not found.</div>
      </div>
    );
  }

  const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const resumeProgressPercent =
    resumeData?.currentTime > 0 && resumeData?.duration > 0
      ? (resumeData.currentTime / resumeData.duration) * 100
      : 0;

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Resume Dialog Modal */}
      {showResumeDialog && resumeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden">
            <button
              onClick={goBack}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors z-20 backdrop-blur-sm bg-black/20"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-2/5 h-80 lg:h-auto overflow-hidden">
                {movie.backdrop_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <Play size={80} className="text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-950/50 to-zinc-950 lg:block hidden"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent lg:hidden"></div>
              </div>

              <div className="flex-1 p-8 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-white">{movie.title}</h2>
                  <div className="flex items-center gap-4 text-zinc-400">
                    <span className="text-lg">{year}</span>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                    <span className="text-lg">{movie.runtime} min</span>
                    {movie.vote_average > 0 && (
                      <>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-lg">{movie.vote_average.toFixed(1)}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center">
                      <RotateCcw className="text-purple-400" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Continue Watching</h3>
                      <p className="text-sm text-zinc-400">Pick up where you left off</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
                        <span className="font-medium">Your Progress</span>
                        <span className="font-bold text-purple-400">
                          {Math.round(resumeProgressPercent)}% watched
                        </span>
                      </div>
                      <div className="w-full h-3 bg-zinc-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${resumeProgressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                    onClick={handleShowSummary}
                    className="p-2.5 hover:bg-white/10 rounded-lg transition-all hover:scale-110 font-bold hover:cursor-pointer"
                    title="Show Summary"
                  >
                    Summarise
                  </button>
                  </div>
                    <div className="flex items-center justify-between gap-4 bg-zinc-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Play size={18} className="text-purple-400" />
                        <div>
                          <p className="text-sm text-zinc-400">Resume at</p>
                          <p className="font-bold text-white text-lg">{formatTime(resumeData.currentTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-zinc-500">of</div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">Total duration</p>
                          <p className="font-bold text-white">{formatTime(resumeData.duration)}</p>
                        </div>
                      </div>
                    </div>

                    {resumeData.lastWatched && (
                      <div className="text-center text-xs text-zinc-500">
                        Last watched on{" "}
                        {new Date(resumeData.lastWatched).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleResume}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-400 rounded-xl font-semibold transition-all hover:scale-105 text-lg shadow-lg shadow-purple-500/20"
                  >
                    <Play size={22} fill="white" />
                    <span>Resume Watching</span>
                  </button>

                  <button
                    onClick={handleStartFromBeginning}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-xl font-semibold transition-all hover:scale-105 text-lg"
                  >
                    <RotateCcw size={20} />
                    <span>Start Over</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <button
              onClick={() => setShowSummaryModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Summary for {movie.title}</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Stopped at: {formatTime(movie.runtime * 60 * (currentTime / duration))}
            </p>
            {isSummaryLoading && (
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <span className="ml-2">Loading summary...</span>
              </div>
            )}
            {summaryError && <p className="text-red-400">{summaryError}</p>}
            {summaryText && <p className="text-sm text-zinc-200">{summaryText}</p>}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center">
            <h1 className="font-bold text-lg">{movie.title}</h1>
            <p className="text-xs text-zinc-400">
              {year} • {movie.runtime || "N/A"} min
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startOver}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
              title="Start Over"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={exitPlayer}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm bg-red-600/20 hover:bg-red-600/30"
            >
              <X size={24} className="text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Video Player Container */}
      <div className="flex-1 flex items-center justify-center bg-black p-4">
        <div
          ref={playerContainerRef}
          className="relative w-full max-w-6xl"
          style={{ aspectRatio: "16/9" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-full rounded-lg bg-black object-contain"
            src={sampleVideo}
          />

          {/* Overlay Controls */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 rounded-lg ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <button
                onClick={handlePlayPause}
                className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                {isPlaying ? (
                  <Pause size={32} className="text-white" />
                ) : (
                  <Play size={32} className="text-white ml-1" />
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
              {/* Progress Bar */}
              <div
                ref={progressBarRef}
                className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 group backdrop-blur-sm"
                onClick={handleProgressBarClick}
              >
                <div
                  className="absolute h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="absolute w-4 h-4 bg-white rounded-full -top-1 shadow-lg transition-all group-hover:scale-125"
                  style={{
                    left: `${progressPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2.5 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  <button
                    onClick={skipBackward}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                  >
                    <SkipBack size={20} />
                  </button>

                  <button
                    onClick={skipForward}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                  >
                    <SkipForward size={20} />
                  </button>

                  {/* New Summarize Button */}

                  <div className="flex items-center gap-2 group">
                    <button
                      onClick={toggleMute}
                      className="p-2.5 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                    >
                      {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover:w-24 transition-all duration-300 accent-purple-500"
                    />
                  </div>

                  <div className="text-sm font-medium text-white/90 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                >
                  <Maximize2 size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* Resume notification */}
          {showResumeNotification && resumeData && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-purple-500 px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl z-50">
              ▶ Resumed from {formatTime(resumeData.currentTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoloWatch;