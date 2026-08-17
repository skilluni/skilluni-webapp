"use client";

import { useState, useEffect } from "react";
import type { DbCourse, DbChapter, DbLecture } from "../../lib/db";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [courses, setCourses] = useState<DbCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<DbCourse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<DbChapter | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<DbLecture | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"curriculum" | "testimonials">("curriculum");

  // Testimonials States
  const [ytComments, setYtComments] = useState<any[]>([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [ratingSelection, setRatingSelection] = useState<Record<string, number>>({});
  const [searchVideoUrl, setSearchVideoUrl] = useState("");
  const [commentsNextPageToken, setCommentsNextPageToken] = useState<string | null>(null);

  // Form toggles: 'course-add' | 'course-edit' | 'chapter-add' | 'chapter-edit' | 'lecture-add' | 'lecture-edit' | null
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form States
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    slug: "",
    description: "",
    level: "Beginner",
    thumbnail: "/images/courses/default.webp",
    isPremium: false,
    tags: "",
  });

  const [chapterFormData, setChapterFormData] = useState({
    title: "",
    description: "",
    order: 1,
  });

  const [lectureFormData, setLectureFormData] = useState({
    title: "",
    description: "",
    order: 1,
    slug: "",
    duration: "15 min",
    videoUrl: "",
    notesUrl: "",
    quizUrl: "",
    isLocked: false,
    codeFiles: "",
  });

  // Computed statistics
  const totalCourses = courses.length;
  const totalChapters = courses.reduce((acc, c) => acc + (c.chapters?.length || 0), 0);
  const totalLectures = courses.reduce(
    (acc, c) => acc + (c.chapters?.reduce((acc2, ch) => acc2 + (ch.lectures?.length || 0), 0) || 0),
    0
  );

  // Spotlight gradients for course covers
  const gradients = [
    "gradient-spotlight-violet",
    "gradient-spotlight-magenta",
    "gradient-spotlight-orange",
    "gradient-spotlight-coral"
  ];

  // Helper for dynamic colorful tag chips
  const getTagStyles = (tag: string) => {
    const hash = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: "bg-sky-500/10", border: "border-sky-500/25", text: "text-sky-400" },
      { bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-400" },
      { bg: "bg-pink-500/10", border: "border-pink-500/25", text: "text-pink-400" },
      { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-400" },
      { bg: "bg-amber-500/10", border: "border-amber-500/25", text: "text-amber-400" },
      { bg: "bg-rose-500/10", border: "border-rose-500/25", text: "text-rose-400" },
      { bg: "bg-teal-500/10", border: "border-teal-500/25", text: "text-teal-400" },
    ];
    return colors[hash % colors.length];
  };

  // Verify auth session on mount
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchCourses();
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error("Authentication check failed:", e);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    document.title = "SkillUni Admin";
    checkAuth();
  }, []);

  const fetchComments = async (isLoadMore = false) => {
    if (commentsLoading) return;
    setCommentsLoading(true);
    try {
      const pageTokenParam = isLoadMore && commentsNextPageToken ? `&pageToken=${commentsNextPageToken}` : "";
      const videoParam = searchVideoUrl.trim() ? `&videoId=${encodeURIComponent(searchVideoUrl.trim())}` : "";
      
      const res = await fetch(`/api/youtube-comments?${videoParam}${pageTokenParam}`);
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setYtComments((prev) => [...prev, ...data.comments]);
        } else {
          setYtComments(data.comments);
        }
        setCommentsNextPageToken(data.nextPageToken || null);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to fetch YouTube comments.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error fetching comments.", "error");
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchFeaturedTestimonials = async () => {
    setFeaturedLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setFeaturedTestimonials(data);
      } else {
        showToast("Failed to fetch featured testimonials.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error fetching testimonials.", "error");
    } finally {
      setFeaturedLoading(false);
    }
  };

  const handleFeatureComment = async (commentItem: any, rating: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve-testimonial",
          data: {
            id: commentItem.id,
            name: commentItem.name,
            avatarUrl: commentItem.avatarUrl,
            comment: commentItem.comment,
            rating,
          },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        showToast(result.message || "Featured successfully!", "success");
        await fetchFeaturedTestimonials();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to feature comment.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error sending request.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfeatureTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to remove this testimonial from the homepage?")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-testimonial",
          data: { id },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        showToast(result.message || "Testimonial removed.", "success");
        await fetchFeaturedTestimonials();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to remove testimonial.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error sending request.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch featured testimonials and comments when switching to testimonials tab
  useEffect(() => {
    if (activeTab === "testimonials" && isAuthenticated) {
      fetchComments();
      fetchFeaturedTestimonials();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch all courses
  const fetchCourses = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        
        // Sync selected references with updated data
        if (selectedCourse) {
          const updatedCourse = data.find((c: DbCourse) => c.id === selectedCourse.id);
          if (updatedCourse) {
            setSelectedCourse(updatedCourse);
            
            if (selectedChapter) {
              const updatedChapter = updatedCourse.chapters.find((ch: DbChapter) => ch.id === selectedChapter.id);
              setSelectedChapter(updatedChapter || null);
              
              if (selectedLecture && updatedChapter) {
                const updatedLecture = updatedChapter.lectures.find((l: DbLecture) => l.id === selectedLecture.id);
                setSelectedLecture(updatedLecture || null);
              } else {
                setSelectedLecture(null);
              }
            }
          } else {
            setSelectedCourse(null);
            setSelectedChapter(null);
            setSelectedLecture(null);
          }
        }
      } else {
        showToast("Failed to fetch courses.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error fetching courses.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchCourses();
      } else {
        setLoginError(data.error || "Access Denied. Incorrect Password.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to sign out of the developer workspace?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        setIsAuthenticated(false);
        setCourses([]);
        setSelectedCourse(null);
        setSelectedChapter(null);
        setSelectedLecture(null);
        setActiveForm(null);
        setPasswordInput("");
        showToast("Signed out successfully", "success");
      } else {
        showToast("Failed to sign out.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error signing out.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger status toasts
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch form action
  const handleActionClick = (formType: string | null, activeItem?: any) => {
    setActiveForm(formType);
    
    if (formType === "course-add") {
      setSelectedCourse(null);
      setCourseFormData({
        title: "",
        slug: "",
        description: "",
        level: "Beginner",
        thumbnail: "/images/courses/default.webp",
        isPremium: false,
        tags: "",
      });
    } else if (formType === "course-edit") {
      const course = activeItem || selectedCourse;
      if (course) {
        setSelectedCourse(course);
        setCourseFormData({
          title: course.title,
          slug: course.slug,
          description: course.description,
          level: course.level,
          thumbnail: course.thumbnail,
          isPremium: course.isPremium,
          tags: course.tags?.join(", ") || "",
        });
      }
    } else if (formType === "chapter-add") {
      setSelectedChapter(null);
      setChapterFormData({
        title: "",
        description: "",
        order: (selectedCourse?.chapters.length || 0) + 1,
      });
    } else if (formType === "chapter-edit") {
      const chapter = activeItem || selectedChapter;
      if (chapter) {
        setSelectedChapter(chapter);
        setChapterFormData({
          title: chapter.title,
          description: chapter.description,
          order: chapter.order,
        });
      }
    } else if (formType === "lecture-add") {
      setSelectedLecture(null);
      setLectureFormData({
        title: "",
        description: "",
        order: (selectedChapter?.lectures.length || 0) + 1,
        slug: "",
        duration: "15 min",
        videoUrl: "",
        notesUrl: "",
        quizUrl: "",
        isLocked: false,
        codeFiles: "",
      });
    } else if (formType === "lecture-edit") {
      const lecture = activeItem || selectedLecture;
      if (lecture) {
        setSelectedLecture(lecture);
        setLectureFormData({
          title: lecture.title,
          description: lecture.description,
          order: lecture.order,
          slug: lecture.slug,
          duration: lecture.duration,
          videoUrl: lecture.videoUrl,
          notesUrl: lecture.notesUrl,
          quizUrl: lecture.quizUrl || "",
          isLocked: lecture.isLocked,
          codeFiles: lecture.codeFiles?.join("\n") || "",
        });
      }
    }
  };

  // Submit CRUD Transactions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;

    setActionLoading(true);
    let payload = {};
    let endpointAction = "";

    try {
      if (activeForm === "course-add" || activeForm === "course-edit") {
        endpointAction = activeForm === "course-add" ? "add-course" : "edit-course";
        payload = {
          ...courseFormData,
          id: selectedCourse?.id,
          tags: courseFormData.tags
            ? courseFormData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        };
      } else if (activeForm === "chapter-add" || activeForm === "chapter-edit") {
        endpointAction = activeForm === "chapter-add" ? "add-chapter" : "edit-chapter";
        payload = {
          ...chapterFormData,
          id: selectedChapter?.id,
          courseId: selectedCourse?.id,
        };
      } else if (activeForm === "lecture-add" || activeForm === "lecture-edit") {
        endpointAction = activeForm === "lecture-add" ? "add-lecture" : "edit-lecture";
        payload = {
          ...lectureFormData,
          id: selectedLecture?.id,
          chapterId: selectedChapter?.id,
          courseId: selectedCourse?.id,
          codeFiles: lectureFormData.codeFiles
            ? lectureFormData.codeFiles.split("\n").map((l) => l.trim()).filter(Boolean)
            : [],
        };
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: endpointAction, data: payload }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast(result.message || "Operation successful!", "success");
        await fetchCourses(true);
        setActiveForm(null);
      } else {
        showToast(result.error || "Operation failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error submitting request.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async (type: "course" | "chapter" | "lecture", id: string) => {
    if (!confirm(`Are you absolutely sure you want to delete this ${type}? This cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    let endpointAction = `delete-${type}`;
    let payload = { id, courseId: selectedCourse?.id };

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: endpointAction, data: payload }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast(result.message || `${type} deleted.`, "success");
        
        // Update local selections
        if (type === "course") {
          setSelectedCourse(null);
          setSelectedChapter(null);
          setSelectedLecture(null);
        } else if (type === "chapter") {
          setSelectedChapter(null);
          setSelectedLecture(null);
        } else if (type === "lecture") {
          setSelectedLecture(null);
        }
        
        setActiveForm(null);
        await fetchCourses(true);
      } else {
        showToast(result.error || "Failed to delete.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error deleting item.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Order Reordering
  const handleReorder = async (type: "chapter" | "lecture", item: DbChapter | DbLecture, direction: "up" | "down") => {
    if (!selectedCourse) return;
    
    setActionLoading(true);
    try {
      let targetList: any[] = [];
      if (type === "chapter") {
        targetList = [...selectedCourse.chapters].sort((a, b) => a.order - b.order);
      } else if (type === "lecture" && selectedChapter) {
        targetList = [...selectedChapter.lectures].sort((a, b) => a.order - b.order);
      }

      const idx = targetList.findIndex((x) => x.id === item.id);
      if (idx === -1) return;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= targetList.length) {
        setActionLoading(false);
        return; // out of bounds
      }

      // Swap orders
      const tempOrder = targetList[idx].order;
      targetList[idx].order = targetList[swapIdx].order;
      targetList[swapIdx].order = tempOrder;

      // Save each swapped item via API
      for (const entry of [targetList[idx], targetList[swapIdx]]) {
        const action = type === "chapter" ? "edit-chapter" : "edit-lecture";
        const data = type === "chapter" 
          ? { id: entry.id, courseId: selectedCourse.id, order: entry.order, title: entry.title, description: entry.description }
          : { id: entry.id, courseId: selectedCourse.id, chapterId: selectedChapter?.id, order: entry.order, title: entry.title, slug: entry.slug, duration: entry.duration };

        await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, data }),
        });
      }

      showToast("Reordered successfully.", "success");
      await fetchCourses(true);
    } catch (e) {
      console.error(e);
      showToast("Failed to reorder items.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 1. LOADING SCREEN ON AUTH INITIALIZATION
  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090909] text-white">
        <div className="flex flex-col items-center gap-3 opacity-60">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Checking security gates...</span>
        </div>
      </main>
    );
  }

  // 2. PASSWORD GATEWAY LOCK SCREEN (NOT AUTHENTICATED)
  if (isAuthenticated === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090909] text-white p-6 relative overflow-hidden">
        {/* Dynamic Atmospheric Spotlight Aura behind browser frame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial-gradient from-[#0099ff]/10 to-transparent blur-3xl pointer-events-none select-none opacity-40 animate-pulse-glow" />

        <div className="w-full max-w-[420px] p-8 rounded-2xl border border-[#262626] bg-[#141414] shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#262626] bg-[#1c1c1c] text-[#0099ff] animate-bounce-slow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">
              SkillUni Workspace Lock
            </h1>
            <p className="text-xs text-[#999999]">
              Please enter the administrator password to unlock the Course management console.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#999999] font-bold">Admin Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-xl border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition font-mono"
                placeholder="••••••••••••"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-xs text-[#ff5577] bg-[#ff5577]/10 border border-[#ff5577]/20 py-2 px-3 rounded-lg flex items-center gap-2 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-full text-black bg-white hover:bg-neutral-200 font-semibold text-sm active:scale-[0.98] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              ) : (
                "Unlock Workspace"
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 3. SECURED WORKSPACE (AUTHENTICATED)
  // Filter courses by search query
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="flex-1 min-h-screen py-10 px-6 md:px-12 bg-[#090909] text-white">
      {/* Toast Alert */}
      {toast && (
        <div 
          className="fixed bottom-8 right-8 z-50 px-5 py-4 rounded-xl border border-white/10 bg-[#121212]/90 backdrop-blur-xl flex items-center gap-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in-up"
        >
          {toast.type === "success" ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-[#22c55e]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-[#ff5577]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          )}
          <span className="text-xs font-semibold text-neutral-200 tracking-wide">
            {toast.message}
          </span>
        </div>
      )}

      {/* Slide-out Drawer Panel for Forms */}
      {activeForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setActiveForm(null)}
          />
          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-[#0e0e0e] border-l border-white/10 h-full flex flex-col p-8 text-white shadow-2xl overflow-y-auto animate-scale-in">
            {/* Drawer Form Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#0099ff]">
                  {activeForm.includes("course") ? "Course Management" : activeForm.includes("chapter") ? "Chapter Management" : "Lecture Management"}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white capitalize">
                  {activeForm.replace("-", " ")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="text-neutral-400 hover:text-white transition font-bold text-sm bg-transparent border-0 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Actions Loader Overlay */}
            {actionLoading && (
              <div className="absolute inset-0 bg-[#090909]/75 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#0099ff] animate-spin" />
                <p className="text-sm font-semibold tracking-wide text-neutral-400">Saving changes...</p>
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* --- COURSE FORM --- */}
                {(activeForm === "course-add" || activeForm === "course-edit") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Course Title</label>
                      <input
                        type="text"
                        required
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. Computer Applications"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Course Slug (Unique URL)</label>
                      <input
                        type="text"
                        required
                        value={courseFormData.slug}
                        onChange={(e) => setCourseFormData({ ...courseFormData, slug: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. icse-java-class-9-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Course Difficulty Level</label>
                      <select
                        value={courseFormData.level}
                        onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Course Description</label>
                      <textarea
                        rows={3}
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition resize-none"
                        placeholder="Provide a detailed overview of what is learned in this class."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Thumbnail Image Path</label>
                      <input
                        type="text"
                        value={courseFormData.thumbnail}
                        onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. /images/courses/icse-java.webp"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        value={courseFormData.tags}
                        onChange={(e) => setCourseFormData({ ...courseFormData, tags: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. ICSE, Class 9, Java"
                      />
                    </div>
                  </div>
                )}

                {/* --- CHAPTER FORM --- */}
                {(activeForm === "chapter-add" || activeForm === "chapter-edit") && (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Chapter Title</label>
                        <input
                          type="text"
                          required
                          value={chapterFormData.title}
                          onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                          className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                          placeholder="e.g. Object Oriented Programming"
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-1">
                        <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Sort Order</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={chapterFormData.order}
                          onChange={(e) => setChapterFormData({ ...chapterFormData, order: Number(e.target.value) })}
                          className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Chapter Description</label>
                      <textarea
                        rows={3}
                        value={chapterFormData.description}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition resize-none"
                        placeholder="Provide a short synopsis of chapters curriculum topics."
                      />
                    </div>
                  </div>
                )}

                {/* --- LECTURE FORM --- */}
                {(activeForm === "lecture-add" || activeForm === "lecture-edit") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Lecture Title</label>
                      <input
                        type="text"
                        required
                        value={lectureFormData.title}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, title: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. Principles of Abstraction"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Lecture Slug (Unique URL)</label>
                      <input
                        type="text"
                        required
                        value={lectureFormData.slug}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, slug: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. principles-of-abstraction"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Duration</label>
                        <input
                          type="text"
                          required
                          value={lectureFormData.duration}
                          onChange={(e) => setLectureFormData({ ...lectureFormData, duration: e.target.value })}
                          className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                          placeholder="e.g. 15 min"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Sort Order</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={lectureFormData.order}
                          onChange={(e) => setLectureFormData({ ...lectureFormData, order: Number(e.target.value) })}
                          className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Lecture Description</label>
                      <textarea
                        rows={3}
                        value={lectureFormData.description}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, description: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition resize-none"
                        placeholder="Provide a detailed roadmap of learning targets covered."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">YouTube Video Link</label>
                      <input
                        type="url"
                        value={lectureFormData.videoUrl}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, videoUrl: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. https://www.youtube.com/watch?v=Bg_iLOzzxRU"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">PDF Notes Link</label>
                      <input
                        type="text"
                        value={lectureFormData.notesUrl}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, notesUrl: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. https://drive.google.com/... (or local path)"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Practice Quiz Link (Optional)</label>
                      <input
                        type="text"
                        value={lectureFormData.quizUrl}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, quizUrl: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                        placeholder="e.g. https://quizizz.com/..."
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs uppercase tracking-widest text-[#999999] font-medium">Code Files (Google Drive Links, one per line)</label>
                      <textarea
                        rows={3}
                        value={lectureFormData.codeFiles}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, codeFiles: e.target.value })}
                        className="w-full bg-[#1c1c1c] text-white px-4 py-3 rounded-lg border border-[#262626] text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition resize-none"
                        placeholder="e.g. https://drive.google.com/file/d/...&#10;https://drive.google.com/file/d/..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Footer Action Pill */}
              <div className="border-t border-white/10 pt-5 mt-8 flex items-center justify-end gap-3 shrink-0">
                {activeForm === "course-edit" && selectedCourse && (
                  <button
                    type="button"
                    onClick={() => handleDelete("course", selectedCourse.id)}
                    disabled={actionLoading}
                    className="mr-auto px-5 py-2.5 rounded-full text-xs font-semibold bg-[#ff5577]/10 border border-[#ff5577]/20 text-[#ff5577] hover:bg-[#ff5577]/20 transition cursor-pointer"
                  >
                    Delete Course
                  </button>
                )}
                {activeForm === "chapter-edit" && selectedChapter && (
                  <button
                    type="button"
                    onClick={() => handleDelete("chapter", selectedChapter.id)}
                    disabled={actionLoading}
                    className="mr-auto px-5 py-2.5 rounded-full text-xs font-semibold bg-[#ff5577]/10 border border-[#ff5577]/20 text-[#ff5577] hover:bg-[#ff5577]/20 transition cursor-pointer"
                  >
                    Delete Chapter
                  </button>
                )}
                {activeForm === "lecture-edit" && selectedLecture && (
                  <button
                    type="button"
                    onClick={() => handleDelete("lecture", selectedLecture.id)}
                    disabled={actionLoading}
                    className="mr-auto px-5 py-2.5 rounded-full text-xs font-semibold bg-[#ff5577]/10 border border-[#ff5577]/20 text-[#ff5577] hover:bg-[#ff5577]/20 transition cursor-pointer"
                  >
                    Delete Lecture
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#141414] text-white border border-white/10 hover:bg-[#1c1c1c] transition active:scale-[0.97] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition active:scale-[0.97] cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl flex flex-col gap-8 relative z-10">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <span className="text-caption uppercase tracking-[0.2em] font-medium text-[#999999]">
              Developer Workspace
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              SkillUni Admin
            </h1>
          </div>
          {/* Tab Selector */}
          <div className="flex items-center bg-[#141414] border border-white/5 rounded-full p-1 self-start md:self-auto shrink-0">
            <button
              onClick={() => { setActiveTab("curriculum"); setSelectedCourse(null); }}
              className={`px-5 py-2 rounded-full text-xs font-semibold select-none cursor-pointer transition ${
                activeTab === "curriculum" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              Curriculum Builder
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`px-5 py-2 rounded-full text-xs font-semibold select-none cursor-pointer transition ${
                activeTab === "testimonials" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              YouTube Testimonials
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-5 py-3 rounded-full text-white bg-[#141414] hover:bg-[#1c1c1c] border border-white/10 font-semibold text-sm active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              Sign Out
            </button>
            {activeTab === "curriculum" && (
              <button
                onClick={() => handleActionClick("course-add")}
                className="px-6 py-3 rounded-full text-black bg-white hover:bg-neutral-200 font-semibold text-sm active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add New Course
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Content restructuring */}
        
        {activeTab === "curriculum" && (
          <>
            {/* VIEW 1: Overview dashboard grid (no selectedCourse) */}
            {!selectedCourse && (
          <div className="space-y-10 animate-fade-in">
            {/* Real-time stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/40 hover:bg-[#141414]/70 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[#0099ff]/5 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500">Total Courses</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight font-sans text-white">{totalCourses}</span>
                  <span className="text-xs text-neutral-500 font-medium">courses initialized</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/40 hover:bg-[#141414]/70 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[#22c55e]/5 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500">Total Chapters</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight font-sans text-white">{totalChapters}</span>
                  <span className="text-xs text-neutral-500 font-medium">curriculum headers</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/40 hover:bg-[#141414]/70 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[#ff5577]/5 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500">Total Lectures</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight font-sans text-white">{totalLectures}</span>
                  <span className="text-xs text-neutral-500 font-medium">active streaming items</span>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 opacity-40 text-neutral-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1c1c1c]/50 text-white pl-10 pr-4 py-2.5 rounded-lg border border-white/5 text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/15 transition"
                  placeholder="Search courses by title, tags, description..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-40 hover:opacity-100 transition text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-xs font-semibold text-neutral-500">
                Showing {filteredCourses.length} of {courses.length} courses
              </div>
            </div>

            {/* Course Card Grid */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 opacity-50">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-sm font-semibold tracking-wider text-neutral-400">Loading dashboard workspace...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-24 px-8 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/10 bg-[#141414]/20">
                <div className="w-12 h-12 rounded-full bg-[#1c1c1c] flex items-center justify-center text-neutral-400 border border-white/5 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Courses Found</h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  {searchQuery ? "No matches found for your search query. Try typing something else or clear the input." : "Get started by adding your first educational course above."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                  <div 
                    key={course.id} 
                    className="group rounded-2xl border border-white/5 bg-[#141414]/30 hover:border-white/10 hover:bg-[#141414]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/50"
                  >
                    <div className={`h-44 relative overflow-hidden border-b border-white/5 flex items-center justify-center ${gradients[idx % gradients.length]}`}>
                      <div className="absolute inset-0 bg-black/45 group-hover:bg-transparent transition-colors duration-300" />
                      <span className="text-3xl font-extrabold tracking-tight opacity-20 font-sans select-none">{course.title.substring(0, 2).toUpperCase()}</span>
                      <div className="absolute top-4 left-4 flex gap-2">
                        {course.level === "Beginner" && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                            Beginner
                          </span>
                        )}
                        {course.level === "Intermediate" && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-amber-600 text-white shadow-sm">
                            Intermediate
                          </span>
                        )}
                        {course.level === "Advanced" && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-sm">
                            Advanced
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-[#0099ff] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {course.description || "No description provided."}
                        </p>
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {course.tags.map((tag) => {
                              const styles = getTagStyles(tag);
                              return (
                                <span 
                                  key={tag} 
                                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}
                                >
                                  #{tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1.5">
                        <div className="px-3.5 py-3 flex flex-col gap-0.5 rounded-xl border border-white/5 bg-[#1c1c1c]/30 hover:bg-[#1c1c1c]/60 transition-colors duration-200">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            Chapters
                          </span>
                          <span className="text-sm font-bold text-white leading-none">
                            {course.chapters?.length || 0}
                          </span>
                        </div>
                        <div className="px-3.5 py-3 flex flex-col gap-0.5 rounded-xl border border-white/5 bg-[#1c1c1c]/30 hover:bg-[#1c1c1c]/60 transition-colors duration-200">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            Lectures
                          </span>
                          <span className="text-sm font-bold text-white leading-none">
                            {course.chapters?.reduce((a, c) => a + (c.lectures?.length || 0), 0) || 0}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setSelectedChapter(null);
                          setSelectedLecture(null);
                        }}
                        className="w-full mt-2 py-3 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black font-semibold text-xs active:scale-[0.98] transition duration-200 cursor-pointer border border-white/5 text-center flex items-center justify-center gap-2"
                      >
                        Manage Curriculum & Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Selected Course Curriculum and Profile (if selectedCourse is not null) */}
        {selectedCourse && (
          <div className="space-y-6 animate-fade-in">
            {/* Back Navigation trigger */}
            <div className="flex items-center py-2">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#141414] hover:bg-[#1c1c1c] border border-white/5 transition flex items-center gap-1.5 cursor-pointer text-white shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Two column layout workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left sidebar: settings profile card */}
              <section className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/30 space-y-6">
                  <div className={`h-40 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center ${
                    gradients[courses.findIndex((c) => c.id === selectedCourse.id) !== -1 
                      ? courses.findIndex((c) => c.id === selectedCourse.id) % gradients.length 
                      : 0
                    ]
                  }`}>
                    <div className="absolute inset-0 bg-black/45" />
                    <span className="text-3xl font-extrabold tracking-tight opacity-20 font-sans select-none">
                      {selectedCourse.title.substring(0, 2).toUpperCase()}
                    </span>
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {selectedCourse.level === "Beginner" && (
                        <span className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                          Beginner
                        </span>
                      )}
                      {selectedCourse.level === "Intermediate" && (
                        <span className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-sm">
                          Intermediate
                        </span>
                      )}
                      {selectedCourse.level === "Advanced" && (
                        <span className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                          Advanced
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-white tracking-tight">{selectedCourse.title}</h2>
                      <p className="text-[10px] font-semibold text-[#0099ff] tracking-tight truncate">Slug: /{selectedCourse.slug}</p>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">{selectedCourse.description || "No description provided."}</p>
                    
                    {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCourse.tags.map((tag) => {
                          const styles = getTagStyles(tag);
                          return (
                            <span 
                              key={tag} 
                              className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}
                            >
                              #{tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1.5">
                    <div className="px-3.5 py-3 flex flex-col gap-0.5 rounded-xl border border-white/5 bg-[#1c1c1c]/30 hover:bg-[#1c1c1c]/60 transition-colors duration-200">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                        Chapters
                      </span>
                      <span className="text-sm font-bold text-white leading-none">
                        {selectedCourse.chapters?.length || 0}
                      </span>
                    </div>
                    <div className="px-3.5 py-3 flex flex-col gap-0.5 rounded-xl border border-white/5 bg-[#1c1c1c]/30 hover:bg-[#1c1c1c]/60 transition-colors duration-200">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                        Lectures
                      </span>
                      <span className="text-sm font-bold text-white leading-none">
                        {selectedCourse.chapters?.reduce((a, c) => a + (c.lectures?.length || 0), 0) || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleActionClick("course-edit", selectedCourse)}
                    className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs active:scale-[0.98] transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Edit Course Profile & Settings
                  </button>
                </div>
              </section>

              {/* Right column: Curriculum Builder Accordion list */}
              <section className="lg:col-span-8 flex flex-col gap-6">
                <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]/30 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="space-y-0.5">
                      <h2 className="text-caption uppercase tracking-[0.1em] font-semibold text-neutral-400">Course Curriculum</h2>
                      <p className="text-xs text-neutral-500">Manage structure, chapters, and streaming videos</p>
                    </div>
                    <button
                      onClick={() => handleActionClick("chapter-add")}
                      className="px-4 py-2 rounded-full text-black bg-white hover:bg-neutral-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      + Add Chapter
                    </button>
                  </div>

                  {selectedCourse.chapters?.length === 0 ? (
                    <div className="py-16 text-center space-y-3 border border-dashed border-white/10 rounded-xl">
                      <p className="text-xs italic text-neutral-500">No chapters added yet for this curriculum.</p>
                      <button
                        onClick={() => handleActionClick("chapter-add")}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1c1c1c] text-[#0099ff] border border-white/5 hover:underline cursor-pointer"
                      >
                        + Create First Chapter
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...selectedCourse.chapters].sort((a,b) => a.order - b.order).map((ch, chIdx, chArr) => {
                        const isChActive = selectedChapter?.id === ch.id;
                        return (
                          <div 
                            key={ch.id} 
                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                              isChActive 
                                ? "border-[#0099ff]/30 bg-[#1c1c1c]/15 shadow-lg shadow-[#0099ff]/2" 
                                : "border-white/5 bg-[#141414]/20 hover:border-white/10"
                            }`}
                          >
                            {/* Chapter accordion header */}
                            <div 
                              onClick={() => {
                                setSelectedChapter(isChActive ? null : ch);
                                setSelectedLecture(null);
                              }}
                              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5 text-neutral-400">
                                  CH {chIdx + 1}
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-bold text-white group-hover:text-[#0099ff] transition-colors truncate">
                                    {ch.title}
                                  </h3>
                                  <p className="text-[10px] text-neutral-500 truncate max-w-md">{ch.description || "No description provided."}</p>
                                </div>
                              </div>

                              {/* Chapter action controls */}
                              <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center border border-white/5 bg-[#1c1c1c]/30 rounded-lg p-0.5">
                                  <button 
                                    disabled={chIdx === 0 || actionLoading}
                                    onClick={() => handleReorder("chapter", ch, "up")}
                                    className="p-1.5 text-xs text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer bg-transparent border-0 flex items-center justify-center"
                                    title="Move Chapter Up"
                                  >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                      <path d="m18 15-6-6-6 6" />
                                    </svg>
                                  </button>
                                  <button 
                                    disabled={chIdx === chArr.length - 1 || actionLoading}
                                    onClick={() => handleReorder("chapter", ch, "down")}
                                    className="p-1.5 text-xs text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer bg-transparent border-0 flex items-center justify-center"
                                    title="Move Chapter Down"
                                  >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                      <path d="m6 9 6 6 6-6" />
                                    </svg>
                                  </button>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedChapter(ch);
                                    handleActionClick("lecture-add");
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#0099ff]/10 border border-[#0099ff]/20 text-[#0099ff] hover:bg-[#0099ff]/20 transition cursor-pointer"
                                >
                                  + Add Lecture
                                </button>

                                <button
                                  onClick={() => handleActionClick("chapter-edit", ch)}
                                  className="p-1.5 rounded border border-white/5 bg-[#1c1c1c]/30 hover:bg-[#262626] text-neutral-400 hover:text-white cursor-pointer"
                                  title="Edit Chapter Details"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Lectures list inside accordion */}
                            {isChActive && (
                              <div className="border-t border-white/5 bg-[#0a0a0a]/50 p-4 space-y-2 animate-fade-in">
                                {ch.lectures?.length === 0 ? (
                                  <p className="text-xs italic text-neutral-500 py-3 text-center">No lectures added yet to this chapter.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {[...ch.lectures].sort((a,b) => a.order - b.order).map((lec, lecIdx, lecArr) => (
                                      <div 
                                        key={lec.id}
                                        className="group flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border border-white/5 bg-[#141414]/30 hover:border-white/10 hover:bg-[#141414]/60 transition-all gap-4"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="text-[9px] font-semibold text-neutral-500 bg-[#1c1c1c] border border-white/5 w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                                            {lec.order}
                                          </span>
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-semibold text-white truncate">{lec.title}</h4>
                                            <div className="flex items-center gap-3 mt-0.5 text-[9px] text-neutral-500 font-medium">
                                              <span>Duration: {lec.duration}</span>
                                              <span>•</span>
                                              <span className="truncate max-w-[150px]">Slug: /{lec.slug}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
                                          {/* Reorder controls */}
                                          <div className="flex items-center border border-white/5 bg-[#1c1c1c]/40 rounded p-0.5">
                                            <button 
                                              disabled={lecIdx === 0 || actionLoading}
                                              onClick={() => handleReorder("lecture", lec, "up")}
                                              className="px-1.5 py-1 text-[10px] text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer bg-transparent border-0 flex items-center justify-center"
                                              title="Move Lecture Up"
                                            >
                                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                <path d="m18 15-6-6-6 6" />
                                              </svg>
                                            </button>
                                            <button 
                                              disabled={lecIdx === lecArr.length - 1 || actionLoading}
                                              onClick={() => handleReorder("lecture", lec, "down")}
                                              className="px-1.5 py-1 text-[10px] text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer bg-transparent border-0 flex items-center justify-center"
                                              title="Move Lecture Down"
                                            >
                                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                <path d="m6 9 6 6 6-6" />
                                              </svg>
                                            </button>
                                          </div>

                                          <button
                                            onClick={() => handleActionClick("lecture-edit", lec)}
                                            className="px-2.5 py-1 text-[9px] font-bold rounded border border-white/5 bg-[#1c1c1c]/40 text-neutral-400 hover:text-white hover:bg-[#262626] cursor-pointer"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        )}
          </>
        )}

        {/* TESTIMONIALS TAB VIEW */}
        {activeTab === "testimonials" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left column: YouTube Live comments list */}
            <div className="lg:col-span-7 p-6 rounded-2xl border border-white/5 bg-[#141414]/30 space-y-6">
              <div className="flex flex-col gap-4 border-b border-white/5 pb-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-headline tracking-tight text-white">Latest YouTube Comments</h2>
                    <p className="text-xs text-neutral-500">Public student comments fetched from your YouTube channel</p>
                  </div>
                  <button
                    onClick={() => fetchComments(false)}
                    disabled={commentsLoading}
                    className="px-4 py-2 rounded-full border border-white/10 hover:bg-[#1c1c1c] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {commentsLoading && !commentsNextPageToken ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {/* Video URL Filter Input */}
                <div className="flex gap-2 items-center bg-black/20 p-2 rounded-xl border border-white/5">
                  <input
                    type="text"
                    value={searchVideoUrl}
                    onChange={(e) => setSearchVideoUrl(e.target.value)}
                    placeholder="Filter by YouTube Video URL or ID (optional)..."
                    className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none placeholder-neutral-600 px-2 py-1"
                  />
                  {searchVideoUrl && (
                    <button
                      onClick={() => {
                        setSearchVideoUrl("");
                        setTimeout(() => fetchComments(false), 0);
                      }}
                      className="text-neutral-500 hover:text-white text-[10px] uppercase font-bold tracking-wider px-2 cursor-pointer bg-transparent border-0"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => fetchComments(false)}
                    disabled={commentsLoading}
                    className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-[10px] font-bold transition cursor-pointer shrink-0"
                  >
                    Fetch
                  </button>
                </div>
              </div>

              {commentsLoading && ytComments.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50">
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span className="text-xs text-neutral-500 font-mono">LOADING COMMENT THREADS...</span>
                </div>
              ) : ytComments.length === 0 ? (
                <div className="py-12 text-center text-xs italic text-neutral-500 border border-dashed border-white/5 rounded-xl bg-black/10">
                  No comment threads found. Check your YOUTUBE_API_KEY, or paste a valid Video URL above.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {ytComments.map((comment) => {
                      const isAlreadyFeatured = featuredTestimonials.some((t) => t.id === comment.id);
                      const selectedRating = ratingSelection[comment.id] || 5;

                      return (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                            isAlreadyFeatured
                              ? "bg-[#22c55e]/5 border-[#22c55e]/20"
                              : "bg-[#1c1c1c]/30 border-white/5 hover:border-white/10"
                          }`}
                        >
                          {/* Author Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {comment.avatarUrl ? (
                                <img
                                  src={comment.avatarUrl}
                                  alt={comment.name}
                                  className="w-8 h-8 rounded-full border border-white/10"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                                  {comment.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-white">{comment.name}</h4>
                                <p className="text-[9px] text-neutral-500">
                                  {new Date(comment.publishedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {comment.videoUrl && (
                              <a
                                href={comment.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-[#0099ff] hover:underline"
                              >
                                View on YouTube ↗
                              </a>
                            )}
                          </div>

                          {/* Comment Body */}
                          <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-black/20 p-3 rounded-lg border border-white/5">
                            "{comment.comment}"
                          </p>

                          {/* Feature Action Panel */}
                          <div className="flex items-center justify-between pt-1">
                            {/* Star Rating Selection */}
                            {!isAlreadyFeatured ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-neutral-500 font-semibold">Stars:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setRatingSelection({ ...ratingSelection, [comment.id]: star })}
                                      className={`w-5 h-5 flex items-center justify-center rounded transition text-xs font-bold select-none cursor-pointer ${
                                        selectedRating >= star
                                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/35"
                                          : "bg-neutral-800 text-neutral-600 border border-neutral-700/30"
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[#22c55e]">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Featured on Home</span>
                              </div>
                            )}

                            {/* Submit Action */}
                            {isAlreadyFeatured ? (
                              <button
                                onClick={() => handleUnfeatureTestimonial(comment.id)}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#ff5577]/10 border border-[#ff5577]/20 text-[#ff5577] hover:bg-[#ff5577]/20 transition cursor-pointer"
                              >
                                Remove Feature
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFeatureComment(comment, selectedRating)}
                                disabled={actionLoading}
                                className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-white text-black hover:bg-neutral-200 transition cursor-pointer"
                              >
                                + Feature Review
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Pagination Button */}
                  {commentsNextPageToken && (
                    <div className="pt-3 border-t border-white/5 flex justify-center">
                      <button
                        onClick={() => fetchComments(true)}
                        disabled={commentsLoading}
                        className="px-6 py-2 rounded-full border border-white/10 hover:bg-[#1c1c1c] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 text-neutral-400 hover:text-white"
                      >
                        {commentsLoading ? "Loading..." : "Load More Comments"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right column: Featured testimonials list */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-white/5 bg-[#141414]/30 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-headline tracking-tight text-white">Featured Testimonials</h2>
                  <p className="text-xs text-neutral-500">Currently active on the website homepage</p>
                </div>
                <span className="text-xs font-semibold text-neutral-500 bg-[#1c1c1c] border border-white/5 px-3 py-1 rounded-full">
                  {featuredTestimonials.length} Featured
                </span>
              </div>

              {featuredLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50">
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span className="text-xs text-neutral-500 font-mono">LOADING FEATURED LIST...</span>
                </div>
              ) : featuredTestimonials.length === 0 ? (
                <div className="py-12 text-center text-xs italic text-neutral-500 border border-dashed border-white/5 rounded-xl bg-black/10">
                  No testimonials are currently featured. Select comments from the left panel to display them on the homepage.
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {featuredTestimonials.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-white/5 bg-[#1c1c1c]/10 flex flex-col gap-2.5 relative group"
                    >
                      {/* Top profile banner */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {item.avatar_url ? (
                            <img
                              src={item.avatar_url}
                              alt={item.name}
                              className="w-7 h-7 rounded-full border border-white/10"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-neutral-400">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">{item.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              {/* Star rating */}
                              <div className="flex text-[9px] text-amber-400">
                                {Array.from({ length: item.rating }).map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Unfeature button */}
                        <button
                          onClick={() => handleUnfeatureTestimonial(item.id)}
                          disabled={actionLoading}
                          className="px-2 py-1 rounded bg-[#ff5577]/10 hover:bg-[#ff5577]/25 text-[#ff5577] border border-[#ff5577]/20 text-[9px] font-bold transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-neutral-400 italic leading-relaxed">
                        "{item.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
