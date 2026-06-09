"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/providers/AuthProvider";

type FlowMode = "signin" | "forgot_username" | "forgot_otp" | "forgot_reset";

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();

  // Core flow state
  const [mode, setMode] = useState<FlowMode>("signin");

  // Sign in states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Forgot password flow states
  const [forgotUsername, setForgotUsername] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && mode === "signin") {
      router.push("/courses");
    }
  }, [user, mode, router]);

  // Sign In submit handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!usernameInput.trim()) return setErrorMsg("Username is required.");
    if (!passwordInput) return setErrorMsg("Password is required.");

    setLoading(true);

    try {
      // 1. Resolve email address from username
      const { data: email, error: rpcError } = await supabase.rpc("get_email_by_username", {
        username_input: usernameInput.trim().toLowerCase(),
      });

      if (rpcError) {
        throw new Error("Failed to look up username.");
      }

      if (!email) {
        throw new Error("No account found with this username.");
      }

      // 2. Sign in with resolved email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

      if (signInError) {
        throw signInError;
      }

      setSuccessMsg("Welcome back! Signing in...");
      setTimeout(() => {
        router.push("/courses");
      }, 1500);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setErrorMsg(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 - Look up username and send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!forgotUsername.trim()) return setErrorMsg("Username is required.");

    setLoading(true);

    try {
      // 1. Look up email
      const { data: email, error: rpcError } = await supabase.rpc("get_email_by_username", {
        username_input: forgotUsername.trim().toLowerCase(),
      });

      if (rpcError || !email) {
        throw new Error("No user profile found matching this username.");
      }

      setResolvedEmail(email);

      // 2. Request OTP code via Supabase passwordless auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setSuccessMsg(`OTP sent successfully to your registered email!`);
      setTimeout(() => {
        setSuccessMsg("");
        setMode("forgot_otp");
      }, 1500);
    } catch (err: any) {
      console.error("Forgot password Send OTP error:", err);
      setErrorMsg(err.message || "Could not request password recovery OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!otpCode.trim()) return setErrorMsg("OTP code is required.");

    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: resolvedEmail,
        token: otpCode.trim(),
        type: "email",
      });

      if (verifyError) {
        throw verifyError;
      }

      setSuccessMsg("OTP Verified successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setMode("forgot_reset");
      }, 1500);
    } catch (err: any) {
      console.error("OTP Verification error:", err);
      setErrorMsg(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 3 - Reset / Update Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 6) return setErrorMsg("Password must be at least 6 characters.");

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMsg("Password reset successfully! Redirecting...");
      setTimeout(() => {
        router.push("/courses");
      }, 2000);
    } catch (err: any) {
      console.error("Password reset update error:", err);
      setErrorMsg(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setMode("signin");
    setErrorMsg("");
    setSuccessMsg("");
    setUsernameInput("");
    setPasswordInput("");
    setForgotUsername("");
    setResolvedEmail("");
    setOtpCode("");
    setNewPassword("");
  };

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center py-20 px-6 bg-canvas relative overflow-hidden">
      {/* Background atmosphere glow aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-magenta opacity-[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 animate-fade-in-up">
        {/* Main Unified Card */}
        <div className="rounded-[24px] border border-hairline bg-surface-1 shadow-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[550px]">
          
          {/* Left Side: Form */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center">
              {/* mode: SIGN IN */}
              {mode === "signin" && (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-body-sm text-ink-muted">
                      Log in to access your tech courses.
                    </p>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                      <label htmlFor="username" className="block text-caption text-ink-muted mb-1.5 font-medium">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="text-caption text-ink-muted font-medium">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot_username");
                            setErrorMsg("");
                            setSuccessMsg("");
                          }}
                          className="text-micro text-accent-blue hover:text-[#52b1ff] transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input
                        id="password"
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-body-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md text-center">
                        {errorMsg}
                      </div>
                    )}

                    {successMsg && (
                      <div className="text-body-sm text-success bg-success/10 border border-success/20 p-3 rounded-md text-center">
                        {successMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-body-sm text-ink-muted">
                      New to SkillUni?{" "}
                      <Link href="/signup" className="text-accent-blue hover:text-[#52b1ff] transition-colors" data-cursor="link">
                        Create free account
                      </Link>
                    </p>
                  </div>
                </>
              )}

              {/* mode: FORGOT PASSWORD - STEP 1 (Username Entry) */}
              {mode === "forgot_username" && (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
                      Recover Password
                    </h1>
                    <p className="text-body-sm text-ink-muted">
                      Step 1: Enter your username to receive a 6-digit verification code.
                    </p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label htmlFor="recovery-username" className="block text-caption text-ink-muted mb-1.5 font-medium">
                        Username
                      </label>
                      <input
                        id="recovery-username"
                        type="text"
                        required
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="Enter your registered username"
                        className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-body-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md text-center">
                        {errorMsg}
                      </div>
                    )}

                    {successMsg && (
                      <div className="text-body-sm text-success bg-success/10 border border-success/20 p-3 rounded-md text-center">
                        {successMsg}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          "Send Verification Code"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetFlow}
                        className="w-full h-11 rounded-[100px] bg-[#141414] text-white border border-hairline text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* mode: FORGOT PASSWORD - STEP 2 (OTP Verification) */}
              {mode === "forgot_otp" && (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
                      Verify OTP
                    </h1>
                    <p className="text-body-sm text-ink-muted">
                      Step 2: Enter the 6-digit code sent to your email.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div>
                      <label htmlFor="otp" className="block text-caption text-ink-muted mb-1.5 font-medium">
                        OTP Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full text-center bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors tracking-[0.2em] font-semibold text-lg placeholder:text-neutral-700"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-body-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md text-center">
                        {errorMsg}
                      </div>
                    )}

                    {successMsg && (
                      <div className="text-body-sm text-success bg-success/10 border border-success/20 p-3 rounded-md text-center">
                        {successMsg}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          "Verify Code"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot_username");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="w-full h-11 rounded-[100px] bg-[#141414] text-white border border-hairline text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
                      >
                        Change Username
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* mode: FORGOT PASSWORD - STEP 3 (Password Reset) */}
              {mode === "forgot_reset" && (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
                      New Password
                    </h1>
                    <p className="text-body-sm text-ink-muted">
                      Step 3: Enter your new password to complete recovery.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label htmlFor="new-password" className="block text-caption text-ink-muted mb-1.5 font-medium">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-body-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md text-center">
                        {errorMsg}
                      </div>
                    )}

                    {successMsg && (
                      <div className="text-body-sm text-success bg-success/10 border border-success/20 p-3 rounded-md text-center">
                        {successMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Back to Homepage Button */}
            <div className="text-center mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-caption text-ink-muted hover:text-ink transition-colors group cursor-pointer"
                data-cursor="link"
              >
                <svg
                  className="w-4 h-4 transform group-hover:-translate-x-1.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                </svg>
                Back to homepage
              </Link>
            </div>
          </div>

          {/* Right Side: Tech Illustrative Artboard */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 bg-[#090909] border-l border-hairline relative overflow-hidden select-none">
            {/* Fine Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{
                   backgroundImage: `radial-gradient(var(--color-hairline) 1px, transparent 1px)`,
                   backgroundSize: '16px 16px'
                 }} 
            />

            {/* Glowing Spotlight Gradients */}
            <div className="absolute -top-20 -left-20 w-[200px] h-[200px] bg-gradient-violet rounded-full blur-[70px] opacity-[0.25]" />
            <div className="absolute -bottom-20 -right-20 w-[250px] h-[250px] bg-gradient-magenta rounded-full blur-[80px] opacity-[0.25]" />

            {/* Title branding inside illustration */}
            <div className="relative z-10">
              <span className="text-micro font-mono text-accent-blue tracking-widest uppercase mb-1.5 block">
                SKILLUNI ENGINE
              </span>
              <h2 className="text-body-sm text-ink font-semibold tracking-[-0.02em] leading-snug">
                Interactive Learning
              </h2>
            </div>

            {/* SVG Tech Illustrative Pattern */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center my-6">
              <svg className="w-full max-w-[260px] h-[260px]" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Glowing Gradients for lines */}
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0099ff" />
                    <stop offset="1" stopColor="#d44df0" />
                  </linearGradient>
                </defs>

                {/* Animated CSS style inside SVG */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes dash {
                    to { stroke-dashoffset: -20; }
                  }
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes pulse {
                    0%, 100% { r: 6; opacity: 0.8; }
                    50% { r: 12; opacity: 0.3; }
                  }
                  .data-line {
                    stroke-dasharray: 4, 6;
                    animation: dash 1.5s linear infinite;
                  }
                  .spin-gear {
                    animation: spin 20s linear infinite;
                    transform-origin: center;
                  }
                  .pulse-ring {
                    animation: pulse 2s infinite ease-in-out;
                    transform-box: fill-box;
                    transform-origin: center;
                  }
                `}} />

                {/* Concentric circles (Grid helper) */}
                <circle cx="150" cy="150" r="110" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx="150" cy="150" r="70" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="30" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.2" />

                {/* Connecting Node Lines */}
                <line x1="150" y1="150" x2="60" y2="90" stroke="url(#lineGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="150" y1="150" x2="240" y2="90" stroke="url(#lineGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="150" y1="150" x2="150" y2="250" stroke="url(#lineGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="150" y1="150" x2="50" y2="180" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="150" y1="150" x2="250" y2="180" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.4" />

                {/* Animated Data Packets (Dashed Lines) */}
                <line x1="150" y1="150" x2="60" y2="90" stroke="#0099ff" strokeWidth="2" className="data-line" />
                <line x1="150" y1="150" x2="240" y2="90" stroke="#d44df0" strokeWidth="2" className="data-line" />
                <line x1="150" y1="150" x2="150" y2="250" stroke="#0099ff" strokeWidth="2" className="data-line" />

                {/* Central Glowing Gear / Hub */}
                <circle cx="150" cy="150" r="22" fill="#090909" stroke="url(#lineGrad)" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="16" stroke="var(--color-hairline)" strokeWidth="1" strokeDasharray="4 2" className="spin-gear" />
                <path d="M147 140 H153 V160 H147 Z M140 147 H160 V153 H140 Z" fill="var(--color-ink-muted)" opacity="0.6" />

                {/* Floating Node 1: Code Block representation */}
                <g transform="translate(60, 90)">
                  <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#141414" stroke="var(--color-hairline)" strokeWidth="1" />
                  <text x="0" y="4" fill="#0099ff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{"<>"}</text>
                </g>

                {/* Floating Node 2: Loop / Process */}
                <g transform="translate(240, 90)">
                  <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#141414" stroke="var(--color-hairline)" strokeWidth="1" />
                  <text x="0" y="4" fill="#d44df0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">for</text>
                </g>

                {/* Floating Node 3: Database / Object */}
                <g transform="translate(150, 250)">
                  <circle cx="0" cy="0" r="16" fill="#141414" stroke="var(--color-hairline)" strokeWidth="1" />
                  <path d="M-8 -6 H8 V-2 H-8 Z M-8 0 H8 V4 H-8 Z" fill="var(--color-ink-muted)" stroke="var(--color-hairline)" strokeWidth="1" />
                </g>

                {/* Floating Node 4: Logic / Condition */}
                <g transform="translate(50, 180)">
                  <circle cx="0" cy="0" r="8" fill="#141414" stroke="#0099ff" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="8" fill="#0099ff" fillOpacity="0.3" className="pulse-ring" />
                </g>

                {/* Floating Node 5: Output */}
                <g transform="translate(250, 180)">
                  <circle cx="0" cy="0" r="8" fill="#141414" stroke="#d44df0" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="8" fill="#d44df0" fillOpacity="0.3" className="pulse-ring" />
                </g>

                {/* Floating Tech Text Elements */}
                <text x="50" y="50" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">double x;</text>
                <text x="210" y="210" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">out.print()</text>
                <text x="220" y="40" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">class Main</text>
                <text x="35" y="270" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">if(arr != null)</text>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}