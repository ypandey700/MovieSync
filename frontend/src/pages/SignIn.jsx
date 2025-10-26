import React, { useState } from "react";
import { useNavigate } from "react-router";
import banner from "../assets/background_banner.jpg";
import { BACKEND_URL } from "../lib/confg";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 md:px-8 py-5 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${banner})`,
      }}
    >
      <div className="max-w-[450px] w-full bg-[#1e1e1e]/90 rounded px-8 py-14 shadow-lg text-center">
        <h1 className="text-4xl font-extrabold mb-2">
          <span className="text-[#9D4EDD]">Movie</span>
          <span className="text-[#5CFFED]">Sync</span>
        </h1>

        <p className="text-gray-300 mb-7">
          Sign in to discover your next favorite show.
        </p>

        <form className="flex flex-col space-y-4 text-left" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[50px] bg-[#333] text-white rounded px-5 text-base 
                       focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[50px] bg-[#333] text-white rounded px-5 text-base 
                       focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] placeholder-gray-400"
          />

          {error && (
            <p className="text-red-500 text-sm text-center mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-[#9D4EDD]/60 cursor-not-allowed" : "bg-[#9D4EDD]"
            } text-white py-2 rounded text-base font-medium 
                       hover:scale-105 hover:brightness-110 transition-transform duration-200`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-10 text-[#a1a1a1] text-sm">
          <p>
            New to MovieSync?
            <span
              onClick={() => navigate("/signup")}
              className="text-[#9D4EDD] font-medium cursor-pointer ml-1 hover:underline"
            >
              Sign Up Now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
