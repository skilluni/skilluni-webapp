"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/providers/AuthProvider";

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

  // Redirect if logged in and profile is complete
  useEffect(() => {
    if (!authLoading && user && profile && profile.name) {
      const needsStep3 =
        (profile.institution === "School" && (!profile.board_of_study || !profile.class || !profile.school_name)) ||
        (profile.institution === "University" && (!profile.course || !profile.university_name));
      
      if (!needsStep3) {
        router.push("/courses");
      }
    }
  }, [user, profile, authLoading, router]);

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

  // Step 1 Submit: Account creation
  const handleSignUpStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

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

    setFormLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            institution: "Independent", // Default temporary value
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        let session = data.session;

        // Auto sign-in if the session is null (due to GoTrue config),
        // utilizing the auto-confirmed email state created by our DB trigger.
        if (!session) {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (!signInError && signInData.session) {
              session = signInData.session;
            }
          } catch (signInErr) {
            console.error("Auto sign-in error:", signInErr);
          }
        }

        if (session) {
          setSuccessMsg("Account created! Let's complete your profile.");
          setTimeout(() => {
            setSuccessMsg("");
            setStep(2);
          }, 1000);
        } else {
          setSuccessMsg("Account created successfully! Please sign in to complete your profile.");
          setTimeout(() => {
            setSuccessMsg("");
            router.push("/signin");
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Signup Step 1 error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during signup.");
    } finally {
      setFormLoading(false);
    }
  };

  // Step 2 Submit: Profile Info
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) return setErrorMsg("Full name is required.");

    if (institution === "Independent") {
      setFormLoading(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: name.trim(),
            institution,
            board_of_study: null,
            class: null,
            school_name: null,
            university_name: null,
            course: null,
          })
          .eq("id", user?.id);

        if (error) throw error;

        await refreshProfile();
        setSuccessMsg("Profile completed successfully!");
        setTimeout(() => {
          router.push("/courses");
        }, 1000);
      } catch (err: any) {
        console.error("Step 2 Independent update error:", err);
        setErrorMsg(err.message || "Failed to update profile.");
      } finally {
        setFormLoading(false);
      }
    } else {
      setStep(3);
    }
  };

  // Step 3 Submit: Academic Details
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

    setFormLoading(true);
    try {
      const updateData: any = {
        name: name.trim(),
        institution,
      };

      if (institution === "School") {
        updateData.board_of_study = boardOfStudy;
        updateData.class = schoolClass;
        updateData.school_name = schoolName.trim();
        updateData.university_name = null;
        updateData.course = null;
      } else if (institution === "University") {
        updateData.board_of_study = null;
        updateData.class = null;
        updateData.school_name = null;
        updateData.university_name = universityName.trim();
        updateData.course = course.trim();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user?.id);

      if (error) throw error;

      await refreshProfile();
      setSuccessMsg("Profile complete! Redirecting...");
      setTimeout(() => {
        router.push("/courses");
      }, 1000);
    } catch (err: any) {
      console.error("Step 3 update error:", err);
      setErrorMsg(err.message || "Failed to complete profile.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center py-20 px-6 bg-canvas relative overflow-hidden">
      {/* Background atmosphere glow aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-violet opacity-[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 animate-fade-in-up">
        {/* Main Unified Card */}
        <div className="rounded-[24px] border border-hairline bg-surface-1 shadow-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[600px]">
          
          {/* Left Side: Form */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center">
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
                <form onSubmit={handleSignUpStep1} className="space-y-5">
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
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
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
                        className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700 pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameLoading && (
                          <svg className="animate-spin h-4 w-4 text-accent-blue" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {usernameStatus === "available" && (
                      <p className="text-micro text-success mt-1">Username is available.</p>
                    )}
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
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
                    />
                  </div>

                  {/* Status alerts */}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    data-cursor="link"
                  >
                    {formLoading ? (
                      <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2 FORM */}
              {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-6 animate-fade-in-up">
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
                      className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
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
                              ? "border-accent-blue bg-accent-blue/10 text-white shadow-[0_0_15px_rgba(0,153,255,0.15)]"
                              : "border-hairline bg-surface-2 text-ink-muted hover:border-neutral-700 hover:text-ink"
                          }`}
                        >
                          <div className="font-semibold text-body-sm text-ink">{item.label}</div>
                          <div className="text-micro text-ink-muted opacity-80 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status alerts */}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    data-cursor="link"
                  >
                    {formLoading ? (
                      <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : institution === "Independent" ? (
                      "Complete Profile"
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3 FORM */}
              {step === 3 && (
                <form onSubmit={handleStep3Submit} className="space-y-6 animate-fade-in-up">
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
                          className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors"
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
                          className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
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
                          className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
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
                          className="w-full bg-surface-2 text-ink text-body p-[10px_14px] rounded-md border border-hairline focus:outline-none focus:ring-1 focus:ring-accent-blue/30 focus:border-accent-blue transition-colors placeholder:text-neutral-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status alerts */}
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

                  {/* Nav Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 h-11 rounded-[100px] bg-[#141414] text-white border border-hairline text-button transition-all duration-200 active:scale-[0.97] hover:bg-[#1c1c1c] flex items-center justify-center cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 h-11 rounded-[100px] bg-white text-black font-semibold text-button transition-all duration-200 active:scale-[0.97] hover:bg-neutral-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <Link href="/signin" className="text-accent-blue hover:text-[#52b1ff] transition-colors" data-cursor="link">
                      Sign In
                    </Link>
                  </p>
                </div>
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

            {/* Glowing Atmosphere Spotlights */}
            <div className="absolute -top-20 -left-20 w-[200px] h-[200px] bg-gradient-violet rounded-full blur-[70px] opacity-[0.25]" />
            <div className="absolute -bottom-20 -right-20 w-[250px] h-[250px] bg-gradient-magenta rounded-full blur-[80px] opacity-[0.25]" />

            {/* Title branding inside illustration */}
            <div className="relative z-10">
              <span className="text-micro font-mono text-accent-blue tracking-widest uppercase mb-1.5 block">
                SKILLUNI PLATFORM
              </span>
              <h2 className="text-body-sm text-ink font-semibold tracking-[-0.02em] leading-snug">
                Online Portal
              </h2>
            </div>

            {/* SVG Tech Illustrative Pattern */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center my-6">
              <svg className="w-full max-w-[260px] h-[260px]" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Glowing Gradients for lines */}
                  <linearGradient id="signUpLineGrad" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#d44df0" />
                    <stop offset="1" stopColor="#0099ff" />
                  </linearGradient>
                </defs>

                {/* Animated CSS style inside SVG */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes signUpDash {
                    to { stroke-dashoffset: -20; }
                  }
                  @keyframes signUpSpinClockwise {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes signUpSpinCounter {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                  }
                  @keyframes signUpPulseRing {
                    0%, 100% { r: 6; opacity: 0.8; }
                    50% { r: 12; opacity: 0.3; }
                  }
                  .signup-data-line {
                    stroke-dasharray: 4, 6;
                    animation: signUpDash 1.5s linear infinite;
                  }
                  .signup-spin-outer {
                    animation: signUpSpinClockwise 25s linear infinite;
                    transform-origin: center;
                  }
                  .signup-spin-inner {
                    animation: signUpSpinCounter 15s linear infinite;
                    transform-origin: center;
                  }
                  .signup-pulse-ring {
                    animation: signUpPulseRing 2s infinite ease-in-out;
                    transform-box: fill-box;
                    transform-origin: center;
                  }
                `}} />

                {/* Concentric Grid Circles */}
                <circle cx="150" cy="150" r="110" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx="150" cy="150" r="80" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="30" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.2" />

                {/* Connecting Node Lines */}
                <line x1="150" y1="150" x2="60" y2="90" stroke="url(#signUpLineGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="150" y1="150" x2="240" y2="90" stroke="url(#signUpLineGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="150" y1="150" x2="150" y2="250" stroke="url(#signUpLineGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="150" y1="150" x2="50" y2="180" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="150" y1="150" x2="250" y2="180" stroke="var(--color-hairline)" strokeWidth="1" strokeOpacity="0.4" />

                {/* Animated Data Packets (Dashed Lines) */}
                <line x1="150" y1="150" x2="60" y2="90" stroke="#0099ff" strokeWidth="2" className="signup-data-line" />
                <line x1="150" y1="150" x2="240" y2="90" stroke="#d44df0" strokeWidth="2" className="signup-data-line" />
                <line x1="150" y1="150" x2="150" y2="250" stroke="#0099ff" strokeWidth="2" className="signup-data-line" />

                {/* Central Console */}
                <circle cx="150" cy="150" r="22" fill="#090909" stroke="url(#signUpLineGrad)" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="16" stroke="var(--color-hairline)" strokeWidth="1" strokeDasharray="4 2" className="signup-spin-inner" />
                <path d="M145,142 L158,150 L145,158 Z" fill="url(#signUpLineGrad)" />

                {/* Floating Node 1: AST */}
                <g transform="translate(60, 90)">
                  <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#141414" stroke="var(--color-hairline)" strokeWidth="1" />
                  <text x="0" y="4" fill="#0099ff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">AST</text>
                </g>

                {/* Floating Node 2: JVM */}
                <g transform="translate(240, 90)">
                  <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#141414" stroke="var(--color-hairline)" strokeWidth="1" />
                  <text x="0" y="4" fill="#d44df0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">JVM</text>
                </g>

                {/* Floating Node 3: Database / Object */}
                <g transform="translate(150, 250)">
                  <circle cx="0" cy="0" r="16" fill="#141414" stroke="var(--color-hairline)" strokeWidth="1" />
                  <path d="M-8 -6 H8 V-2 H-8 Z M-8 0 H8 V4 H-8 Z" fill="var(--color-ink-muted)" stroke="var(--color-hairline)" strokeWidth="1" />
                </g>

                {/* Floating Node 4: Logic / Condition */}
                <g transform="translate(50, 180)">
                  <circle cx="0" cy="0" r="8" fill="#141414" stroke="#0099ff" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="8" fill="#0099ff" fillOpacity="0.3" className="signup-pulse-ring" />
                </g>

                {/* Floating Node 5: Output */}
                <g transform="translate(250, 180)">
                  <circle cx="0" cy="0" r="8" fill="#141414" stroke="#d44df0" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="8" fill="#d44df0" fillOpacity="0.3" className="signup-pulse-ring" />
                </g>

                {/* Floating Tech Text Elements */}
                <text x="40" y="50" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">import java.util.*;</text>
                <text x="210" y="210" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">Parser.parse()</text>
                <text x="210" y="40" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">0xCAFEBABE</text>
                <text x="25" y="270" fill="var(--color-ink-muted)" stroke="none" fontSize="8" fontFamily="monospace" opacity="0.3">bytecode v55</text>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
