import React, { useState } from "react";
import { useNavigate } from "react-router";
import banner from "../assets/background_banner.jpg";
import { BACKEND_URL } from "../lib/confg";

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`${BACKEND_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name:username, email, password }),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) throw new Error(data.error || "Registration failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token || "authenticated");

      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 md:px-8 py-8 flex items-center justify-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.85)), url(${banner})`,
      }}
    >
      <div className="max-w-[420px] w-full bg-slate-800/40 backdrop-blur-md border-2 border-orange-500/30 rounded-2xl px-8 py-9 shadow-xl relative overflow-hidden">
        
        {/* Accent corner decoration - Different from signin */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/20 rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-cyan-500/20 rounded-tl-full"></div>
        
        {/* Logo */}
        <div className="text-center mb-6 relative">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-orange-500">Movie</span>
            <span className="text-cyan-400">Sync</span>
          </h1>
          <div className="mt-1 flex justify-center gap-1">
            <div className="w-8 h-1 bg-orange-500 rounded"></div>
            <div className="w-8 h-1 bg-cyan-400 rounded"></div>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="text-white text-lg font-bold mb-1">Join MovieSync</h2>
          <p className="text-slate-400 text-sm">
            Start your movie journey today
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSignUp}>
          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[50px] bg-slate-900/50 border border-slate-600 text-white rounded-lg px-4 text-sm
                         focus:outline-none focus:border-orange-500 placeholder-slate-500
                         transition-colors duration-200"
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] bg-slate-900/50 border border-slate-600 text-white rounded-lg px-4 text-sm
                         focus:outline-none focus:border-orange-500 placeholder-slate-500
                         transition-colors duration-200"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[50px] bg-slate-900/50 border border-slate-600 text-white rounded-lg px-4 text-sm
                         focus:outline-none focus:border-orange-500 placeholder-slate-500
                         transition-colors duration-200"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg px-3 py-2">
              <p className="text-green-400 text-xs">Account created successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-[50px] ${
              loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400"
            } text-white rounded-lg text-sm font-bold uppercase tracking-wide
                       transition-all duration-200 shadow-lg shadow-orange-500/20`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Terms */}
        <div className="mt-4 text-center">
          <p className="text-slate-500 text-xs">
            By signing up, you agree to our Terms & Privacy
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-600"></div>
          <span className="text-slate-500 text-xs">OR</span>
          <div className="flex-1 h-px bg-slate-600"></div>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-orange-500 font-semibold hover:text-orange-400"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;