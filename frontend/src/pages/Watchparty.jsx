import React from "react";
import { useNavigate } from "react-router";
import banner from "../assets/Watch_party.jpg";

const Watchparty = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 md:py-20"
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
          The ultimate way to experience movies with friends — real‑time sync,
          live chat, and plenty of laughs, no matter where you are. Choose how you
          want to start the show!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => navigate("/createparty")}
            className="flex items-center justify-center gap-2 bg-[#9D4EDD] 
                       text-white px-8 py-3 rounded-md font-semibold text-lg shadow-md 
                       hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            🎬 Create a Watch Party
          </button>

          <button
            onClick={() => navigate("/joinparty")}
            className="flex items-center justify-center gap-2 bg-[#222b45] text-white px-8 py-3 
                       rounded-md font-semibold text-lg hover:bg-[#2C355C] border border-[#363E66]/50 
                       transition-colors duration-200"
          >
            🤝 Join Friend’s Party
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-10 tracking-wide">
          Stream • Sync • Chat • Laugh
        </p>
      </div>
    </div>
  );
};

export default Watchparty;