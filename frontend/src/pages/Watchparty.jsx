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
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 md:py-20 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(10,10,25,0.85), rgba(10,10,25,0.9)), url(${banner})`,
      }}
    >
      <div className="max-w-3xl w-full bg-[#161a2b]/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 text-center border border-[#2A2F4D]/60">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
          <span className="text-[#9D4EDD]">Ready&nbsp;</span>
          <span className="text-white">to Watch Together?</span>
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          The ultimate way to experience movies with friends — real-time sync,
          live chat, and plenty of laughs, no matter where you are.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => setShowCreateInfo(true)}
            className="flex items-center justify-center gap-2 bg-[#9D4EDD] text-white px-8 py-3 rounded-md font-semibold text-lg shadow-md hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            🎬 Create a Watch Party
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center gap-2 bg-[#222b45] text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-[#2C355C] border border-[#363E66]/50 transition-colors duration-200"
          >
            🤝 Join Friend’s Party
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-10 tracking-wide">
          Stream • Sync • Chat • Laugh
        </p>
      </div>

      {showCreateInfo && (
        <>
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20"
            onClick={() => setShowCreateInfo(false)}
          ></div>
          <div className="absolute z-30 bg-[#1E1E2F] border border-[#9D4EDD]/50 shadow-2xl rounded-3xl p-10 md:p-14 w-[90%] max-w-2xl text-center mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              How to Create a Watch Party
            </h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              To create a Watch Party, go to the{" "}
              <span className="text-[#9D4EDD] font-semibold">Home Page</span> and
              open any <strong>Movie Details</strong> page. Then click 
              <span className="text-[#9D4EDD] font-semibold">
                “Create Watch Party.”
              </span>
            </p>
            <button
              onClick={() => {
                setShowCreateInfo(false);
                navigate("/");
              }}
              className="bg-[#9D4EDD] hover:bg-[#7E22CE] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 text-lg"
            >
              🏠 Go to Home
            </button>
          </div>
        </>
      )}

      {showJoinModal && (
        <>
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20"
            onClick={() => setShowJoinModal(false)}
          ></div>
          <div className="absolute z-30 bg-[#1F1F30] border border-[#9D4EDD]/50 shadow-2xl rounded-3xl p-10 md:p-14 w-[90%] max-w-2xl text-white text-center mx-auto">
            <div className="relative mb-8">
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute right-0 top-0 text-gray-400 hover:text-white text-3xl font-bold"
              >
                ×
              </button>
              <h2 className="text-4xl font-extrabold text-white tracking-wide">
                Join Movie
              </h2>
            </div>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              Enter the code shared by your friend to join their Movie Matcher
              session.
            </p>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Join Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g., ABC123"
                className="w-full px-4 py-3 rounded-md bg-[#2A2F4D] text-white border border-[#41497B] focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/70 mb-8"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleJoinSession}
                disabled={loading}
                className="bg-[#9D4EDD] hover:bg-[#7E22CE] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 text-lg"
              >
                {loading ? "Joining..." : "Join Session"}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="bg-[#333956] hover:bg-[#2C355C] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Watchparty;
