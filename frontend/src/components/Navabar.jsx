import React from 'react'

const Navbar = () => {
  return (
    <nav className="p-5 text-[15px] font-medium bg-[#0B0B14] text-[#B8B8C7] h-20 flex justify-between items-center shadow-lg shadow-[#9D4EDD]/20">
      <h1 className="text-4xl font-bold cursor-pointer tracking-tight select-none">
        <span className="text-[#9D4EDD]">Movie</span>
        <span className="text-[#3EECAC] brightness-125">Sync</span>
      </h1>

      <ul className="hidden md:flex space-x-6">
        <li className="cursor-pointer hover:text-[#9D4EDD] transition-colors">Home</li>
        <li className="cursor-pointer hover:text-[#9D4EDD] transition-colors">Suggestion</li>
        <li className="cursor-pointer hover:text-[#9D4EDD] transition-colors">Connect</li>
        <li className="cursor-pointer hover:text-[#9D4EDD] transition-colors">Watch Party</li>
        <li className="cursor-pointer hover:text-[#9D4EDD] transition-colors">Momentz</li>
      </ul>

      <div className="flex items-center space-x-4">
        <div className="relative flex items-center">
          <input
            type="text"
            className="bg-[#1A1A2E] text-white placeholder-[#B8B8C7] outline-none px-4 pr-10 py-2 rounded-full focus:ring-2 focus:ring-[#9D4EDD] transition"
            placeholder="Search"
          />
          <i className="absolute right-3 text-[15px] text-[#B8B8C7] ri-search-ai-2-line"></i>
        </div>
        <button className="bg-gradient-to-r from-[#9D4EDD] to-[#3EECAC] text-[#0B0B14] px-5 py-2 rounded font-semibold hover:scale-105 transition-transform duration-200">
          Get AI Picks
        </button>
        <button className="border border-[#3EECAC]/50 text-white px-4 py-2 rounded hover:bg-[#3EECAC] hover:text-[#0B0B14] transition">
          Sign In
        </button>
      </div>
    </nav>
  )
}

export default Navbar