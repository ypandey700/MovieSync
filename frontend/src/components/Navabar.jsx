import { Cookie } from 'lucide-react';
import React from 'react'
import { Link, useNavigate } from "react-router";
import { BACKEND_URL } from "../lib/confg";

const Navbar = () => {

  const navigate = useNavigate(); 
  
  const Userdata = localStorage.getItem('user'); 
  if(!Userdata) {
      console.log("user Data no",Userdata)
     navigate('/signin')

  }
  const user = Userdata ? JSON.parse(Userdata) : null;

  
  const HandleLogout = async ()=> {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    try {
      const res = await fetch(`${BACKEND_URL}/users/logout`, {
        method: "POST", 
        credentials: 'include'
      })
    } catch(error) {
      console.error("Logout error:", error);
    }
    
    navigate('/signin'); 
  }
  
  return (
    <nav className="sticky top-0 z-50 px-8 py-4 bg-slate-900/95 backdrop-blur-xl text-slate-300 border-b border-orange-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to={"/"}>
          <h1 className="text-3xl font-black tracking-tight select-none transition-all duration-300 hover:scale-105 cursor-pointer">
            <span className="text-orange-500">Movie</span>
            <span className="text-cyan-400">Sync</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center space-x-8">
          <Link to={"/"}>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
              Home
            </li>
          </Link>
          <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
            Suggestion
          </li>
          {/* <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
            Connect
          </li> */}
          <Link to={'/watchparty'}>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
              Watch Party
            </li>
          </Link>
          {/* <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
            Momentz
          </li> */}
        </ul>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden lg:flex items-center">
            <input
              type="text"
              className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none px-4 pr-10 py-2 rounded-lg focus:border-orange-500 transition-colors duration-200 w-52"
              placeholder="Search movies..."
            />
            <i className="absolute right-3 text-base text-slate-500 ri-search-line"></i>
          </div>

          {/* AI Picks Button */}
          <button className="hidden md:block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg shadow-orange-500/20">
            Get AI Picks
          </button>
            
          {/* User Section */}
          {!user ? (
            <Link to={"/signin"}> 
              <button className="border-2 border-cyan-500/50 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all duration-200 font-semibold text-sm">
                Sign In
              </button>
            </Link>
          ) : (
            <div className='flex items-center gap-3'> 
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer">
                {user.name[0].toUpperCase()}
              </div>
              <button 
                className="border-2 border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 font-semibold text-sm" 
                onClick={HandleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar