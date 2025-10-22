import React from "react";
import { useNavigate } from "react-router";
import banner from "../assets/background_banner.jpg";

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 md:px-8 py-5"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${banner})`,
      }}
    >
      <div className="max-w-[450px] w-full bg-[#1e1e1e]/90 rounded px-8 py-14 mx-auto mt-8 shadow-lg text-center">
        
        <h1 className="text-4xl font-extrabold mb-2">
          <span className="text-[#9D4EDD]">Movie</span>
          <span className="text-[#5CFFED]">Sync</span>
        </h1>

        <p className="text-gray-300 mb-7">
          Sign Up to discover your next favorite show.
        </p>

        <form className="flex flex-col space-y-4 text-left">
          <input
            type="text"
            placeholder="Username"
            className="w-full h-[50px] bg-[#333] text-white rounded px-5 text-base 
                       focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] placeholder-gray-400"
          />
          <input
            type="email"
            placeholder="yogesh@gmail.com"
            className="w-full h-[50px] bg-[#333] text-white rounded px-5 text-base 
                       focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full h-[50px] bg-[#333] text-white rounded px-5 text-base 
                       focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] placeholder-gray-400"
          />

          <button
            type="button"
            className="w-full bg-[#9D4EDD] text-white py-2 rounded text-base font-medium 
                       hover:scale-105 hover:brightness-110 transition-transform duration-200"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-10 text-[#a1a1a1] text-sm">
          <p>
            Have an account
            <span
              onClick={() => navigate("/signin")}
              className="text-[#9D4EDD] font-medium cursor-pointer ml-1 hover:underline"
            >
              Sign In Now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;