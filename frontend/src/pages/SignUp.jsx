import React, { useState } from "react";
import { useNavigate } from "react-router";
import banner from "../assets/background_banner.jpg";
import { BACKEND_URL } from "../lib/confg";

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Country codes
  const countryCodes = [
    { code: "+1", country: "US/CA" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "IN" },
    { code: "+86", country: "CN" },
    { code: "+81", country: "JP" },
    { code: "+49", country: "DE" },
    { code: "+33", country: "FR" },
    { code: "+61", country: "AU" },
    { code: "+971", country: "AE" },
    { code: "+234", country: "NG" },
  ];

  // Password validation
  const validatePassword = (pass) => {
    const errors = [];
    if (pass.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pass)) errors.push("One uppercase letter");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass))
      errors.push("One special character");
    return errors;
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    setPasswordErrors(validatePassword(pass));
    
    // Check if confirm password matches
    if (confirmPassword) {
      setPasswordMatch(pass === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordMatch(password === confirmPass);
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${phoneNumber}` }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setOtpSent(true);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `${countryCode}${phoneNumber}`,
          otp: otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setOtpVerified(true);
      setSuccess(true);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    // Validate password
    if (passwordErrors.length > 0) {
      setError("Please fix password requirements");
      setLoading(false);
      return;
    }

    // Check password match
    if (!passwordMatch || password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Check OTP verification
    if (!otpVerified) {
      setError("Please verify your phone number first");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          email,
          password,
          phone: `${countryCode}${phoneNumber}`,
        }),
      });

      const data = await res.json();
      console.log(data);
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
        {/* Accent corner decoration */}
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
              onChange={handlePasswordChange}
              className={`w-full h-[50px] bg-slate-900/50 border ${
                password && passwordErrors.length > 0
                  ? "border-red-500"
                  : "border-slate-600"
              } text-white rounded-lg px-4 text-sm
                         focus:outline-none focus:border-orange-500 placeholder-slate-500
                         transition-colors duration-200`}
              required
            />
            {password && passwordErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((err, idx) => (
                  <p key={idx} className="text-red-400 text-xs flex items-center gap-1">
                    <span className="text-red-500">✗</span> {err}
                  </p>
                ))}
              </div>
            )}
            {password && passwordErrors.length === 0 && (
              <p className="mt-2 text-green-400 text-xs flex items-center gap-1">
                <span className="text-green-500">✓</span> Password is strong
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full h-[50px] bg-slate-900/50 border ${
                confirmPassword && !passwordMatch
                  ? "border-red-500"
                  : "border-slate-600"
              } text-white rounded-lg px-4 text-sm
                         focus:outline-none focus:border-orange-500 placeholder-slate-500
                         transition-colors duration-200`}
              required
            />
            {confirmPassword && !passwordMatch && (
              <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                <span className="text-red-500">✗</span> Passwords do not match
              </p>
            )}
            {confirmPassword && passwordMatch && confirmPassword.length > 0 && (
              <p className="mt-2 text-green-400 text-xs flex items-center gap-1">
                <span className="text-green-500">✓</span> Passwords match
              </p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="relative">
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-[50px] bg-slate-900/50 border border-slate-600 text-white rounded-lg px-3 text-sm
                           focus:outline-none focus:border-orange-500 transition-colors duration-200"
                disabled={otpVerified}
              >
                {countryCodes.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} ({item.country})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className="flex-1 h-[50px] bg-slate-900/50 border border-slate-600 text-white rounded-lg px-4 text-sm
                           focus:outline-none focus:border-orange-500 placeholder-slate-500
                           transition-colors duration-200"
                required
                disabled={otpVerified}
                maxLength={15}
              />
            </div>
            {otpVerified && (
              <p className="mt-2 text-green-400 text-xs flex items-center gap-1">
                <span className="text-green-500">✓</span> Phone number verified
              </p>
            )}
          </div>

          {/* Send OTP Button */}
          {!otpSent && !otpVerified && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading || !phoneNumber}
              className={`w-full h-[50px] ${
                loading || !phoneNumber
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400"
              } text-white rounded-lg text-sm font-bold uppercase tracking-wide
                         transition-all duration-200 shadow-lg shadow-cyan-500/20`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {/* OTP Input and Verify */}
          {otpSent && !otpVerified && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-[50px] bg-slate-900/50 border border-slate-600 text-white rounded-lg px-4 text-sm text-center tracking-widest
                             focus:outline-none focus:border-orange-500 placeholder-slate-500
                             transition-colors duration-200"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className={`flex-1 h-[50px] ${
                    loading || otp.length !== 6
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                  } text-white rounded-lg text-sm font-bold uppercase tracking-wide
                             transition-all duration-200 shadow-lg shadow-green-500/20`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="h-[50px] px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold
                             transition-all duration-200"
                >
                  Resend
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg px-3 py-2">
              <p className="text-green-400 text-xs">
                {otpVerified && !loading
                  ? "Phone verified! Complete registration below."
                  : otpSent
                  ? "OTP sent successfully!"
                  : "Account created successfully!"}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !otpVerified ||
              passwordErrors.length > 0 ||
              !passwordMatch ||
              !confirmPassword
            }
            className={`w-full h-[50px] ${
              loading ||
              !otpVerified ||
              passwordErrors.length > 0 ||
              !passwordMatch ||
              !confirmPassword
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