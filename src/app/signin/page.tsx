"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/providers/AuthProvider";

type FlowMode = "signin" | "forgot_username" | "forgot_otp" | "forgot_reset";

// Clean, flat error alert (No glass, no glow)
function FormErrorAlert({
  title,
  message,
}: {
  title?: string;
  message: string;
}) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-left my-3">
      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 text-rose-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-body-sm font-semibold text-rose-400 leading-tight">
          {title || "Sign In Failed"}
        </h4>
        <p className="text-caption text-rose-300/80 mt-0.5 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

// System-themed Success Toast Modal
function SuccessToast({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-6 py-4 rounded-2xl bg-[#141414] border border-neutral-800 text-white shadow-2xl animate-fade-in-up max-w-md w-[90%] select-none">
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white shadow-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-body-sm font-semibold text-white leading-tight">
          {title}
        </h4>
        <p className="text-caption text-neutral-400 mt-0.5 leading-snug">
          {message}
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();

  // Core flow state
  const [mode, setMode] = useState<FlowMode>("signin");

  // Sign in states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Forgot password flow states
  const [forgotUsername, setForgotUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP resend
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastTitle, setToastTitle] = useState("Success");

  // Redirect if already logged in (only on initial load when not in active success flow)
  useEffect(() => {
    if (user && mode === "signin" && !successMsg) {
      router.push("/dashboard");
    }
  }, [user, mode, router, successMsg]);

  // Listen for Supabase password recovery link click or session update
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setToastTitle("Email Verified");
        setSuccessMsg("Email link verified! Please set your new password.");
        setMode("forgot_reset");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Resend cooldown timer decrement
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Sign In submit handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!usernameInput.trim()) return setErrorMsg("Username is required.");
    if (!passwordInput) return setErrorMsg("Password is required.");

    setLoading(true);

    try {
      // 1. Call secure server-side signin endpoint
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput.trim().toLowerCase(),
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid username or password.");
      }

      // 2. Set the session on the client
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (setSessionError) {
        throw setSessionError;
      }

      setToastTitle("Signed In Successfully");
      setSuccessMsg("Welcome back! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setErrorMsg(err.message || "Invalid username or password. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 - Send OTP via server-side endpoint
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!forgotUsername.trim()) return setErrorMsg("Username or email address is required.");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: forgotUsername.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not request password recovery OTP.");
      }

      setToastTitle("Verification Code Sent");
      setSuccessMsg(data.message);
      setResendCooldown(60);

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

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: forgotUsername.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend verification code.");
      }

      setToastTitle("Code Resent");
      setSuccessMsg("A new 6-digit verification code has been sent to your email.");
      setResendCooldown(60);
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setErrorMsg(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP via server-side endpoint
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!otpCode.trim()) return setErrorMsg("OTP code is required.");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: forgotUsername.trim().toLowerCase(),
          token: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid or expired OTP code.");
      }

      // Set the session on the client
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (setSessionError) {
        throw setSessionError;
      }

      setToastTitle("OTP Verified");
      setSuccessMsg("OTP verified successfully! Set your new password now.");
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

    if (!newPassword) {
      return setErrorMsg("New password is required.");
    }

    if (newPassword !== confirmPassword) {
      return setErrorMsg("New password and confirm password do not match.");
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      return setErrorMsg("Password must be at least 8 characters long and contain both letters and numbers.");
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setToastTitle("Password Reset Successfully");
      setSuccessMsg("Your password has been updated! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
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
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-canvas relative overflow-hidden">
      {/* Success Popup Toast */}
      <SuccessToast title={toastTitle} message={successMsg} />

      {/* Background atmosphere glow aura */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-violet opacity-[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Left Part: Form (40% width) */}
      <div className="w-full md:w-[40%] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-between z-10 bg-canvas border-r border-hairline/60">
        {/* Top Header Logo */}
        <div>
          <Link
            href="/"
            className="text-headline text-ink font-semibold tracking-[-0.03em] inline-block hover:opacity-90 transition-opacity"
            data-cursor="link"
            data-cursor-text="GO"
          >
            SkillUni
          </Link>
        </div>

        <div className="my-auto w-full max-w-md mx-auto py-8">
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

              <form onSubmit={handleSignIn} className="space-y-5 w-full">
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
                    className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
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
                      className="text-micro text-ink-muted hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showSignInPassword ? "text" : "password"}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] pr-10 rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={showSignInPassword ? "Hide password" : "Show password"}
                    >
                      {showSignInPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274 4.057 5.064 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <FormErrorAlert title="Sign In Failed" message={errorMsg} />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-[180px] mx-auto h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <Link href="/signup" className="text-white underline underline-offset-4 hover:text-neutral-300 transition-colors" data-cursor="link">
                    Create free account
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* mode: FORGOT PASSWORD - STEP 1 (Username/Email Entry) */}
          {mode === "forgot_username" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
                  Forgot Password
                </h1>
                <p className="text-body-sm text-ink-muted">
                  Step 1: Enter your username or registered email address to receive a verification code.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5 w-full">
                <div>
                  <label htmlFor="recovery-username" className="block text-caption text-ink-muted mb-1.5 font-medium">
                    Username or Email
                  </label>
                  <input
                    id="recovery-username"
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="e.g. john_doe or john@example.com"
                    className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                  />
                </div>

                <FormErrorAlert title="Recovery Request Failed" message={errorMsg} />

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[220px] h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-[220px] h-11 rounded-[100px] bg-[#141414] text-white border border-hairline hover:border-white/40 text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
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
                  Verify Code
                </h1>
                <p className="text-body-sm text-ink-muted">
                  Step 2: Enter the verification code sent to your registered email address.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5 w-full">
                <div>
                  <label htmlFor="otp" className="block text-caption text-ink-muted mb-1.5 font-medium">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={16}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="w-full text-center bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors tracking-[0.15em] font-semibold text-lg placeholder:text-neutral-700 uppercase"
                  />
                </div>

                <div className="flex justify-between items-center text-caption px-1">
                  <span className="text-neutral-400">Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-white hover:underline disabled:text-neutral-500 disabled:no-underline cursor-pointer transition-colors font-medium"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>

                <FormErrorAlert title="Verification Failed" message={errorMsg} />

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[220px] h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-[220px] h-11 rounded-[100px] bg-[#141414] text-white border border-hairline hover:border-white/40 text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
                  >
                    Change Username / Email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* mode: FORGOT PASSWORD - STEP 3 (Password Reset & Confirm) */}
          {mode === "forgot_reset" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
                  Reset Password
                </h1>
                <p className="text-body-sm text-ink-muted">
                  Step 3: Choose a new secure password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4 w-full">
                <div>
                  <label htmlFor="new-password" className="block text-caption text-ink-muted mb-1.5 font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters (letters & numbers)"
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] pr-10 rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274 4.057 5.064 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-caption text-ink-muted mb-1.5 font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] pr-10 rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274 4.057 5.064 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-micro text-neutral-400 leading-normal">
                  Must be at least 8 characters, containing both letters and numbers.
                </p>

                <FormErrorAlert title="Reset Error" message={errorMsg} />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-[220px] mx-auto h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    "Set New Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Part: Violet Spotlight Gradient & Bold "SkillUni" Branding (60% width) */}
      <div 
        className="hidden md:flex md:w-[60%] min-h-screen flex-col items-center justify-center p-12 relative overflow-hidden select-none"
        style={{
          background: "linear-gradient(160deg, #8568ff 0%, #6a4cf5 35%, #4a2dd4 100%)",
        }}
      >
        {/* Fine Grid Overlay Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} 
        />

        {/* Ambient Glowing Spotlight Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-purple-300 opacity-25 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-900 opacity-30 rounded-full blur-[100px] pointer-events-none" />

        {/* Abstract Educational & Tech Background Icon Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.25] select-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradientSignin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Geometric Constellation Orbits & Node Connections */}
            <circle cx="400" cy="400" r="340" stroke="url(#iconGradientSignin)" strokeWidth="1.2" strokeDasharray="8 12" strokeOpacity="0.6" />
            <circle cx="400" cy="400" r="230" stroke="url(#iconGradientSignin)" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.5" />
            <circle cx="400" cy="400" r="130" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
            
            <line x1="100" y1="180" x2="700" y2="620" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.3" />
            <line x1="700" y1="180" x2="100" y2="620" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.3" />

            {/* 1. Polished Graduation Cap */}
            <g transform="translate(140, 120) rotate(-10) scale(1.6)">
              <path d="M12 2L1.5 7.5L12 13L22.5 7.5L12 2Z" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 9.5V15.5C5 15.5 8 18 12 18C16 18 19 15.5 19 15.5V9.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 8.5V17.5M20 17.5C20 18.3 19.3 19 18.5 19C17.7 19 17 18.3 17 17.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <g transform="translate(570, 560) rotate(12) scale(1.7)">
              <path d="M12 2L1.5 7.5L12 13L22.5 7.5L12 2Z" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 9.5V15.5C5 15.5 8 18 12 18C16 18 19 15.5 19 15.5V9.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 8.5V17.5M20 17.5C20 18.3 19.3 19 18.5 19C17.7 19 17 18.3 17 17.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* 2. Polished Computer / Laptop */}
            <g transform="translate(560, 120) rotate(8) scale(1.6)">
              <rect x="3" y="3" width="18" height="12" rx="2" fill="rgba(255,255,255,0.06)" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M1 18H23C23 18 22 15 20 15H4C2 15 1 18 1 18Z" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
              <line x1="7" y1="7" x2="13" y2="7" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="7" y1="10" x2="17" y2="10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
            </g>
            <g transform="translate(130, 560) rotate(-14) scale(1.6)">
              <rect x="3" y="3" width="18" height="12" rx="2" fill="rgba(255,255,255,0.06)" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M1 18H23C23 18 22 15 20 15H4C2 15 1 18 1 18Z" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
              <line x1="7" y1="7" x2="14" y2="7" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="7" y1="10" x2="12" y2="10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* 3. Polished Open Book */}
            <g transform="translate(70, 350) rotate(6) scale(1.7)">
              <path d="M12 4.5C10 3 6.5 3 3 4.5V19.5C6.5 18 10 18 12 19.5C14 18 17.5 18 21 19.5V4.5C17.5 3 14 3 12 4.5Z" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="12" y1="4.5" x2="12" y2="19.5" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M6 8H9.5M6 11.5H9.5M14.5 8H18M14.5 11.5H18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            </g>
            <g transform="translate(620, 350) rotate(-8) scale(1.7)">
              <path d="M12 4.5C10 3 6.5 3 3 4.5V19.5C6.5 18 10 18 12 19.5C14 18 17.5 18 21 19.5V4.5C17.5 3 14 3 12 4.5Z" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="12" y1="4.5" x2="12" y2="19.5" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M6 8H9.5M6 11.5H9.5M14.5 8H18M14.5 11.5H18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            </g>

            {/* 4. Code Angular Brackets */}
            <g transform="translate(365, 55) scale(1.7)">
              <path d="M7 6L2 12L7 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="14" y1="4" x2="10" y2="20" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
              <path d="M17 6L22 12L17 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g transform="translate(365, 635) scale(1.8)">
              <path d="M7 6L2 12L7 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="14" y1="4" x2="10" y2="20" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
              <path d="M17 6L22 12L17 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>

        {/* Centered Big & Bold "SkillUni" Text */}
        <div className="relative z-10 text-center animate-fade-in-up">
          <h1 className="text-white font-bold text-6xl md:text-7xl lg:text-8xl tracking-tight drop-shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
            SkillUni
          </h1>
          <p className="text-white/80 text-body-lg font-medium mt-4 tracking-wide">
            Master Tech. Build the Future.
          </p>
        </div>
      </div>
    </main>
  );
}