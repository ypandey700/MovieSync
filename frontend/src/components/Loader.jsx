// components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-bounce">
          <h1 className="text-7xl font-black tracking-tight">
            <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">Movie</span>
            <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">Sync</span>
          </h1>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div 
            className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" 
            style={{ animationDelay: '0s', animationDuration: '0.6s' }}
          ></div>
          <div 
            className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}
          ></div>
          <div 
            className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" 
            style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}
          ></div>
        </div>

        <p className="text-slate-400 text-lg tracking-widest animate-pulse">
          Loading your experience...
        </p>
      </div>
    </div>
  );
};

export default Loader;