import React, { useState } from "react";
import { useNavigate } from "react-router";
import banner from "../assets/Watch_party.jpg";
import { BACKEND_URL } from "../lib/confg";

const Watchparty = () => {
  const navigate = useNavigate();
  const [showCreateInfo, setShowCreateInfo] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const data = localStorage.getItem('user'); 
  const user = JSON.parse(data); 
  if(!user) navigate('/signin')

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a join code!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/party/join/${joinCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId:user.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join party");
      navigate(`/watchparty/${joinCode}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setShowJoinModal(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 md:py-20 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92), rgba(15,23,42,0.95)), url(${banner})`,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 max-w-3xl w-full bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-2xl p-10 text-center border-2 border-slate-700/50 hover:border-orange-500/50 transition-all duration-500">
        
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-tr-full"></div>

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
            <i className="ri-movie-2-line text-3xl text-white"></i>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-5">
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Ready&nbsp;</span>
          <span className="text-white">to Watch</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Together?</span>
        </h1>

        {/* Description */}
        <p className="text-slate-300 text-base leading-relaxed max-w-xl mx-auto mb-8">
          The ultimate way to experience movies with friends — real-time sync,
          live chat, and plenty of laughs, no matter where you are.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={() => setShowCreateInfo(true)}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <i className="ri-movie-line text-xl group-hover:scale-110 transition-transform"></i>
            <span>Create Watch Party</span>
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="group flex items-center justify-center gap-2 bg-slate-800/80 backdrop-blur-sm border-2 border-cyan-400/50 hover:border-cyan-400 hover:bg-slate-700/80 text-white px-6 py-3 rounded-lg font-semibold text-base hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <i className="ri-group-line text-xl text-cyan-400 group-hover:scale-110 transition-transform"></i>
            <span>Join Friend's Party</span>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex flex-col items-center gap-1.5">
            <i className="ri-live-line text-2xl text-orange-500"></i>
            <span className="text-slate-400 text-xs font-medium">Live Sync</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <i className="ri-chat-3-line text-2xl text-cyan-400"></i>
            <span className="text-slate-400 text-xs font-medium">Real-time Chat</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <i className="ri-user-add-line text-2xl text-orange-500"></i>
            <span className="text-slate-400 text-xs font-medium">Invite Friends</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <i className="ri-emotion-laugh-line text-2xl text-cyan-400"></i>
            <span className="text-slate-400 text-xs font-medium">Share Laughs</span>
          </div>
        </div>
      </div>

      {/* Create Info Modal */}
      {showCreateInfo && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-all duration-300"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setShowCreateInfo(false)}
          ></div>
          <div 
            className="fixed z-50 bg-slate-800/95 backdrop-blur-xl border-2 border-orange-500/50 shadow-2xl rounded-2xl p-8 md:p-10 w-[90%] max-w-xl text-center"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'fadeBlurIn 0.4s ease-out'
            }}
          >
            
            {/* Close Button */}
            <button
              onClick={() => setShowCreateInfo(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white text-2xl font-bold transition-colors"
            >
              ×
            </button>

            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="ri-information-line text-2xl text-white"></i>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
              How to Create a Watch Party
            </h2>

            {/* Description */}
            <p className="text-slate-300 mb-6 text-base leading-relaxed">
              To create a Watch Party, go to the{" "}
              <span className="text-orange-400 font-semibold">Home Page</span> and
              open any <strong>Movie Details</strong> page. Then click{" "}
              <span className="text-orange-400 font-semibold">"Create Watch Party"</span>
            </p>

            {/* Steps */}
            <div className="bg-slate-900/50 rounded-lg p-5 mb-6 text-left space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                <span className="text-slate-300 text-sm">Go to Home Page</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                <span className="text-slate-300 text-sm">Select a Movie</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                <span className="text-slate-300 text-sm">Click "Create Watch Party"</span>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => {
                setShowCreateInfo(false);
                navigate("/");
              }}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold px-7 py-2.5 rounded-lg transition-all duration-300 text-base shadow-lg shadow-orange-500/30 hover:scale-105"
            >
              <i className="ri-home-4-line mr-2"></i>
              Go to Home
            </button>
          </div>
        </>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-all duration-300"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setShowJoinModal(false)}
          ></div>
          <div 
            className="fixed z-50 bg-slate-800/95 backdrop-blur-xl border-2 border-cyan-400/50 shadow-2xl rounded-2xl p-8 md:p-10 w-[90%] max-w-xl text-white text-center"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'fadeBlurIn 0.4s ease-out'
            }}
          >
            
            {/* Close Button */}
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white text-2xl font-bold transition-colors"
            >
              ×
            </button>

            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="ri-group-line text-2xl text-white"></i>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white tracking-wide mb-3">
              Join Watch Party
            </h2>

            {/* Description */}
            <p className="text-slate-300 mb-6 text-base leading-relaxed">
              Enter the code shared by your friend to join their watch party session.
            </p>

            {/* Input */}
            <div className="text-left mb-6">
              <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Join Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 text-white border-2 border-slate-700 focus:outline-none focus:border-cyan-400 transition-colors text-base font-mono tracking-wider"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleJoinSession}
                disabled={loading}
                className={`bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold px-7 py-2.5 rounded-lg transition-all duration-300 text-base shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !loading ? 'hover:scale-105 active:scale-95' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Joining...
                  </span>
                ) : (
                  "Join Session"
                )}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-7 py-2.5 rounded-lg transition-all duration-300 text-base hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
          }
          to { 
            opacity: 1; 
          }
        }
        
        @keyframes fadeBlurIn {
          from { 
            opacity: 0;
            filter: blur(10px);
            transform: translate(-50%, -50%) scale(0.95);
          }
          to { 
            opacity: 1;
            filter: blur(0);
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Watchparty;