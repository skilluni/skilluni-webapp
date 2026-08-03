"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/providers/AuthProvider";

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
          {title || "Registration Error"}
        </h4>
        <p className="text-caption text-rose-300/80 mt-0.5 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

// System-themed Success Toast Modal (Floating top center for 2 seconds)
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

export default function SignUp() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState<"School" | "University" | "Independent">("Independent");
  const [boardOfStudy, setBoardOfStudy] = useState("ICSE");
  const [course, setCourse] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolClass, setSchoolClass] = useState("Class 10");
  const [universityName, setUniversityName] = useState("");

  // UI / UX states
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "validating" | "available" | "taken" | "invalid">("idle");
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync step based on authentication and profile completeness
  useEffect(() => {
    if (user && profile) {
      if (!profile.name) {
        setStep(2);
      } else if (
        (profile.institution === "School" && (!profile.board_of_study || !profile.class || !profile.school_name)) ||
        (profile.institution === "University" && (!profile.course || !profile.university_name))
      ) {
        setStep(3);
      }
    }
  }, [user, profile]);

  // Redirect if logged in and profile is complete (only on initial load when not in active success flow)
  useEffect(() => {
    if (!authLoading && user && profile && profile.name && !successMsg) {
      const needsStep3 =
        (profile.institution === "School" && (!profile.board_of_study || !profile.class || !profile.school_name)) ||
        (profile.institution === "University" && (!profile.course || !profile.university_name));
      
      if (!needsStep3) {
        router.push("/dashboard");
      }
    }
  }, [user, profile, authLoading, router, successMsg]);

  // Debounce username uniqueness check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus("idle");
      return;
    }

    // Validate username format: 3-20 chars, alphanumeric or underscores
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!regex.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("validating");
    setUsernameLoading(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const { data: exists, error } = await supabase.rpc("check_username_exists", {
          username_input: username,
        });

        if (error) {
          console.error("Error checking username:", error.message);
          setUsernameStatus("idle");
        } else if (exists) {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("available");
        }
      } catch (err) {
        console.error("Failed to verify username uniqueness:", err);
        setUsernameStatus("idle");
      } finally {
        setUsernameLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  // Perform full registration with all collected 3-phase data via server API route
  const performFullSignUp = async () => {
    setFormLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        email: email.trim(),
        password,
        username: username.trim().toLowerCase(),
        name: name.trim(),
        institution,
        board_of_study: institution === "School" ? boardOfStudy : null,
        class: institution === "School" ? schoolClass : null,
        school_name: institution === "School" ? schoolName.trim() : null,
        university_name: institution === "University" ? universityName.trim() : null,
        course: institution === "University" ? course.trim() : null,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Failed to create account.");
      }

      // Establish client session
      if (resData.session) {
        await supabase.auth.setSession(resData.session);
      } else {
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      }

      await refreshProfile();
      setSuccessMsg("Account registered successfully! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Full signup error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during signup.");
    } finally {
      setFormLoading(false);
    }
  };

  // Phase 1 Submit: Account Info Validation
  const handleSignUpStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim()) return setErrorMsg("Username is required.");
    if (usernameStatus !== "available") {
      if (usernameStatus === "taken") return setErrorMsg("Username is already taken.");
      if (usernameStatus === "invalid") return setErrorMsg("Username must be 3-20 characters (letters, numbers, or underscores).");
      return setErrorMsg("Please wait for username validation.");
    }
    if (!email.trim()) return setErrorMsg("Email is required.");
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
      return setErrorMsg("Password must be at least 8 characters long and contain both letters and numbers.");
    }

    // Advance to Phase 2
    setStep(2);
  };

  // Phase 2 Submit: Profile Info
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) return setErrorMsg("Full name is required.");

    if (institution === "Independent") {
      await performFullSignUp();
    } else {
      setStep(3);
    }
  };

  // Phase 3 Submit: Academic Details
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (institution === "School") {
      if (!schoolName.trim()) return setErrorMsg("School name is required.");
    } else if (institution === "University") {
      if (!universityName.trim()) return setErrorMsg("University/College name is required.");
      if (!course.trim()) return setErrorMsg("Course/Major name is required.");
    }

    await performFullSignUp();
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-canvas relative overflow-hidden">
      {/* Success Popup Toast (2 seconds duration) */}
      <SuccessToast title="Account Created!" message={successMsg} />
      {/* Background atmosphere glow aura */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-orange opacity-[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Left Part: Form (2 parts = 40% width) */}
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
          <div className="text-center mb-8">
            <h1 className="text-display-md text-ink font-semibold tracking-[-0.03em] mb-2">
              {step === 1 && "Create an Account"}
              {step === 2 && "About You"}
              {step === 3 && "Academic Details"}
            </h1>
            <p className="text-body-sm text-ink-muted">
              {step === 1 && "Join SkillUni for free tech education. Forever."}
              {step === 2 && "Step 2 of 3: Tell us about yourself."}
              {step === 3 && "Step 3 of 3: Finalize your profile details."}
            </p>
          </div>

          {/* STEP 1 FORM */}
          {step === 1 && (
            <form onSubmit={handleSignUpStep1} className="space-y-5 w-full">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-caption text-ink-muted mb-1.5 font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-caption text-ink-muted mb-1.5 font-medium">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe12"
                    className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {usernameLoading && (
                      <svg className="animate-spin h-4 w-4 text-accent-blue" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {!usernameLoading && usernameStatus === "available" && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm animate-fade-in">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                {usernameStatus === "taken" && (
                  <p className="text-micro text-rose-500 mt-1">Username is already taken.</p>
                )}
                {usernameStatus === "invalid" && (
                  <p className="text-micro text-yellow-500 mt-1">
                    Use 3-20 characters (letters, numbers, or underscores).
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-caption text-ink-muted mb-1.5 font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>

              <FormErrorAlert title="Registration Error" message={errorMsg} />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-[180px] mx-auto h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                data-cursor="link"
              >
                {formLoading ? (
                  <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6 animate-fade-in-up w-full">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-caption text-ink-muted mb-1.5 font-medium">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>

              {/* Selective Chips */}
              <div className="space-y-3">
                <label className="block text-caption text-ink-muted mb-1.5 font-medium">
                  Select Your Category
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "School", label: "School Student", desc: "ICSE curriculum classes and school exam prep" },
                    { id: "University", label: "College / University Student", desc: "Advanced tech, programming, and college majors" },
                    { id: "Independent", label: "Independent Learner", desc: "Self-paced coding, projects & professional growth" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInstitution(item.id as any)}
                      className={`w-full text-left p-4 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                        institution === item.id
                          ? "border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                          : "border-hairline bg-surface-2 text-ink-muted hover:border-white/40 hover:text-ink"
                      }`}
                    >
                      <div className="font-semibold text-body-sm text-ink">{item.label}</div>
                      <div className="text-micro text-ink-muted opacity-80 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <FormErrorAlert title="Registration Error" message={errorMsg} />

              {/* Step 2 Nav Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-[140px] h-11 rounded-[100px] bg-[#141414] text-white border border-hairline hover:border-white/40 text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-[160px] h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  data-cursor="link"
                >
                  {formLoading ? (
                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : institution === "Independent" ? (
                    "Create Account"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 FORM */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6 animate-fade-in-up w-full">
              {/* School Student Form */}
              {institution === "School" && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="boardOfStudy" className="block text-caption text-ink-muted mb-1.5 font-medium">
                      Board of Education
                    </label>
                    <select
                      id="boardOfStudy"
                      value={boardOfStudy}
                      disabled
                      className="w-full bg-surface-2 text-ink/70 text-body p-[10px_14px] rounded-md border border-hairline cursor-not-allowed focus:outline-none"
                    >
                      <option value="ICSE">ICSE Board (Tailored courses only)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="schoolClass" className="block text-caption text-ink-muted mb-1.5 font-medium">
                      Class / Grade
                    </label>
                    <select
                      id="schoolClass"
                      value={schoolClass}
                      onChange={(e) => setSchoolClass(e.target.value)}
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="schoolName" className="block text-caption text-ink-muted mb-1.5 font-medium">
                      School Name
                    </label>
                    <input
                      id="schoolName"
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="St. Xavier's High School"
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                  </div>
                </div>
              )}

              {/* University Form */}
              {institution === "University" && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="universityName" className="block text-caption text-ink-muted mb-1.5 font-medium">
                      University / College Name
                    </label>
                    <input
                      id="universityName"
                      type="text"
                      required
                      value={universityName}
                      onChange={(e) => setUniversityName(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-caption text-ink-muted mb-1.5 font-medium">
                      Course Name
                    </label>
                    <input
                      id="course"
                      type="text"
                      required
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                  </div>
                </div>
              )}

              <FormErrorAlert title="Registration Error" message={errorMsg} />

              {/* Nav Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-[140px] h-11 rounded-[100px] bg-[#141414] text-white border border-hairline hover:border-white/40 text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-[140px] h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  data-cursor="link"
                >
                  {formLoading ? (
                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    "Finish Setup"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Redirect to Signin link (only shown in Step 1) */}
          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-body-sm text-ink-muted">
                Already have an account?{" "}
                <Link href="/signin" className="text-white underline underline-offset-4 hover:text-neutral-300 transition-colors" data-cursor="link">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Part: Orange Spotlight Gradient & Bold "SkillUni" Branding (3 parts = 60% width) */}
      <div 
        className="hidden md:flex md:w-[60%] min-h-screen flex-col items-center justify-center p-12 relative overflow-hidden select-none"
        style={{
          background: "linear-gradient(160deg, #ff9955 0%, #ff7a3d 35%, #e05a1a 100%)",
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
        <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-orange-200 opacity-25 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-amber-900 opacity-30 rounded-full blur-[100px] pointer-events-none" />

        {/* Abstract Educational & Tech Background Icon Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.25] select-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Geometric Constellation Orbits & Node Connections */}
            <circle cx="400" cy="400" r="340" stroke="url(#iconGradientSignup)" strokeWidth="1.2" strokeDasharray="8 12" strokeOpacity="0.6" />
            <circle cx="400" cy="400" r="230" stroke="url(#iconGradientSignup)" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.5" />
            <circle cx="400" cy="400" r="130" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
            
            <line x1="100" y1="180" x2="700" y2="620" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.3" />
            <line x1="700" y1="180" x2="100" y2="620" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.3" />

            {/* 1. Polished Graduation Cap (Top Left & Bottom Right) */}
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

            {/* 2. Polished Computer / Laptop (Top Right & Bottom Left) */}
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

            {/* 3. Polished Open Book (Center Left & Mid Right) */}
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

            {/* 4. Code Angular Brackets </> (Top Center & Bottom Center) */}
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
