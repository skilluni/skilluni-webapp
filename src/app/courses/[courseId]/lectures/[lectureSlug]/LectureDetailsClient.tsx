"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import type { DbCourse, DbLecture } from "../../../../../lib/db";
import CustomVideoPlayer from "../../../../../components/ui/CustomVideoPlayer";

type LectureDetailsClientProps = {
  course: DbCourse;
  lecture: DbLecture;
  spotColor: {
    text: string;
    border: string;
    bg: string;
  };
};

type CodeFileData = {
  name: string;
  content: string;
  language: string;
  error?: boolean;
  message?: string;
  url: string;
};

const SPOTLIGHT_COLORS = [
  { text: "#6a4cf5", border: "rgba(106, 76, 245, 0.2)", bg: "rgba(106, 76, 245, 0.08)" },
  { text: "#d44df0", border: "rgba(212, 77, 240, 0.2)", bg: "rgba(212, 77, 240, 0.08)" },
  { text: "#ff7a3d", border: "rgba(255, 122, 61, 0.2)", bg: "rgba(255, 122, 61, 0.08)" },
  { text: "#ff5577", border: "rgba(255, 85, 119, 0.2)", bg: "rgba(255, 85, 119, 0.08)" },
];

export default function LectureDetailsClient({
  course,
  lecture,
  spotColor,
}: LectureDetailsClientProps) {
  const [showCodes, setShowCodes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [codeFilesData, setCodeFilesData] = useState<CodeFileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accordion state for sidebar chapters. Default to expanding the chapter of the current lecture.
  const activeChapter = course.chapters.find((ch) =>
    ch.lectures.some((l) => l.slug === lecture.slug)
  );

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    if (activeChapter) {
      return { [activeChapter.id]: true };
    }
    return {};
  });

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasCodeLinks = lecture.codeFiles && lecture.codeFiles.length > 0;

  // Fetch code files when showCodes is toggled to true and data hasn't been fetched yet
  useEffect(() => {
    if (showCodes && codeFilesData.length === 0 && hasCodeLinks) {
      const fetchAllCodeFiles = async () => {
        setLoading(true);
        try {
          const promises = lecture.codeFiles!.map(async (url, idx) => {
            try {
              const res = await fetch(`/api/fetch-code?url=${encodeURIComponent(url)}`);
              if (!res.ok) {
                return {
                  name: `File ${idx + 1}`,
                  content: "",
                  language: "plaintext",
                  error: true,
                  message: `Network error (status ${res.status}).`,
                  url,
                };
              }
              const data = await res.json();
              if (data.error) {
                return {
                  name: data.name || `File ${idx + 1}`,
                  content: "",
                  language: "plaintext",
                  error: true,
                  message: data.message,
                  url,
                };
              }
              return {
                name: data.name,
                content: data.content,
                language: data.language,
                url,
              };
            } catch (err) {
              return {
                name: `File ${idx + 1}`,
                content: "",
                language: "plaintext",
                error: true,
                message: (err as Error).message || "Fetch failed.",
                url,
              };
            }
          });

          const results = await Promise.all(promises);
          setCodeFilesData(results);
        } catch (e) {
          console.error("Error batch fetching code files:", e);
        } finally {
          setLoading(false);
        }
      };

      fetchAllCodeFiles();
    }
  }, [showCodes, codeFilesData.length, hasCodeLinks, lecture.codeFiles]);

  // Adjust sidebar state based on screen size on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopyCode = () => {
    const activeFile = codeFilesData[activeFileIndex];
    if (activeFile && activeFile.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (language: string) => {
    switch (language) {
      case "java":
        return (
          <svg className="h-4 w-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case "python":
        return (
          <svg className="h-4 w-4 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        );
      case "javascript":
      case "typescript":
        return (
          <svg className="h-4 w-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3V3zm13.5 12.5c-.8 0-1.4-.4-1.8-.9l-1.2.8c.6.9 1.6 1.5 3 1.5 2.1 0 3.6-1.3 3.6-3.2 0-3-4.1-3.2-4.1-4.7 0-.5.5-.9 1.2-.9.9 0 1.5.4 1.8.8l1.1-.9c-.5-.8-1.5-1.3-2.9-1.3-2 0-3.3 1.2-3.3 3.1 0 2.8 4.1 3.1 4.1 4.7 0 .7-.6 1-1.4 1zM9 13.8V9.3h1.8v4.5c0 1.2-.6 1.8-1.8 1.8-.6 0-1.1-.2-1.4-.5l.8-1.2c.2.2.4.3.6.3.3 0 .4-.2.4-.6z" />
          </svg>
        );
      case "html":
      case "css":
        return (
          <svg className="h-4 w-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <main
      className="flex-1 min-h-screen"
      style={{ background: "var(--color-canvas)", color: "var(--color-ink)" }}
    >
      {/* Backdrop for mobile outline drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      <div className="flex flex-col lg:flex-row w-full items-stretch min-h-[calc(100vh-80px)]">
        {/* Left/Center Panel - Main Workspace */}
        <div className="flex-1 p-6 md:p-10 transition-all duration-300 min-w-0 max-w-5xl mx-auto w-full">
          {/* Header Panel with Breadcrumb and Sidebar Toggle */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href={`/courses/${course.slug}`}
              data-cursor="link"
              data-cursor-text="Roadmap"
              className="group inline-flex items-center gap-2 text-caption font-semibold transition-colors duration-200 hover:text-white"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <svg
                className="h-4 w-4 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
              <span>Back to Roadmap</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-[0.97] ${
                  sidebarOpen
                    ? "bg-white text-black border-white"
                    : "border-white/10 text-neutral-400 hover:text-white hover:bg-[#1c1c1c]"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Course Outline</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Contents */}
          <div className="flex flex-col gap-6">
            <CustomVideoPlayer
              videoUrl={lecture.videoUrl}
              title={lecture.title}
              accentColor={spotColor.text}
            />

            {/* Redesigned Premium Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Take Quiz Card */}
              {lecture.quizUrl ? (
                <a
                  href={lecture.quizUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-xl border border-white/5 bg-[#141414]/30 hover:bg-[#1c1c1c]/50 hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-28 cursor-pointer relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-gradient-to-br from-white/5 to-transparent rounded-full filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10 shrink-0">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <svg className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Take Quiz</h3>
                    <p className="text-[10px] text-neutral-500 mt-1">Test your understanding</p>
                  </div>
                </a>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-white/5 bg-white/[0.01] opacity-40 flex flex-col justify-between h-28 select-none">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900/50 flex items-center justify-center text-neutral-600 border border-white/5 shrink-0">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Take Quiz</h3>
                    <p className="text-[10px] text-neutral-600 mt-1 italic font-sans">Not available</p>
                  </div>
                </div>
              )}

              {/* Lesson Notes Card */}
              {lecture.notesUrl ? (
                <a
                  href={lecture.notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-xl border border-white/5 bg-[#141414]/30 hover:bg-[#1c1c1c]/50 hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-28 cursor-pointer relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-gradient-to-br from-white/5 to-transparent rounded-full filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10 shrink-0">
                      <svg className="h-4.5 w-4.5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <svg className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lesson Notes</h3>
                    <p className="text-[10px] text-neutral-500 mt-1">Read lesson summary</p>
                  </div>
                </a>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-white/5 bg-white/[0.01] opacity-40 flex flex-col justify-between h-28 select-none">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900/50 flex items-center justify-center text-neutral-600 border border-white/5 shrink-0">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Lesson Notes</h3>
                    <p className="text-[10px] text-neutral-600 mt-1 italic font-sans">Not uploaded</p>
                  </div>
                </div>
              )}

              {/* Show Codes Toggle Card */}
              {hasCodeLinks ? (
                <button
                  onClick={() => setShowCodes(!showCodes)}
                  className="p-5 rounded-xl border bg-[#141414]/30 hover:bg-[#1c1c1c]/50 transition-all duration-300 flex flex-col justify-between h-28 cursor-pointer relative group text-left w-full select-none"
                  style={{ borderColor: showCodes ? spotColor.text : "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0" style={showCodes ? { borderColor: spotColor.border, backgroundColor: spotColor.bg } : undefined}>
                      <svg className="h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    </div>
                    <svg className={`h-3.5 w-3.5 transition-transform duration-300 text-neutral-500 ${showCodes ? "rotate-90" : "group-hover:translate-x-0.5"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={showCodes ? { color: spotColor.text } : { color: "#ffffff" }}>
                      {showCodes ? "Hide Codes" : "Code Files"}
                    </h3>
                    <p className="text-[10px] text-neutral-500 mt-1">Explore video codes</p>
                  </div>
                </button>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-white/5 bg-white/[0.01] opacity-40 flex flex-col justify-between h-28 select-none">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900/50 flex items-center justify-center text-neutral-600 border border-white/5 shrink-0">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Code Files</h3>
                    <p className="text-[10px] text-neutral-600 mt-1 italic font-sans">No codes used</p>
                  </div>
                </div>
              )}
            </div>

            {/* Monaco Code Editor Workspace - Rendered inline under the buttons */}
            {showCodes && (
              <div className="w-full flex flex-col h-[500px] border border-white/5 rounded-xl overflow-hidden bg-[#1a1a1a] animate-scale-in shadow-2xl shrink-0">
                {/* Monaco Toolbar */}
                <div className="flex items-center justify-between border-b border-white/5 bg-[#141414] px-4 overflow-x-auto scrollbar-none shrink-0 h-12">
                  <div className="flex overflow-x-auto scrollbar-none h-full">
                    {loading ? (
                      <div className="flex items-center px-4 text-xs text-neutral-500">
                        Loading files...
                      </div>
                    ) : (
                      codeFilesData.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFileIndex(idx)}
                          className={`flex items-center gap-2 px-4 h-full border-b-2 text-xs font-semibold select-none cursor-pointer transition-all duration-200 ${
                            activeFileIndex === idx
                              ? "bg-[#1a1a1a] text-white"
                              : "border-transparent text-neutral-500 hover:text-white hover:bg-neutral-800/40"
                          }`}
                          style={{ borderBottomColor: activeFileIndex === idx ? spotColor.text : "transparent" }}
                        >
                          {getFileIcon(file.language)}
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          {file.error && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" title="Loading failed" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Monaco utility actions */}
                  {!loading && codeFilesData.length > 0 && (
                    <div className="flex items-center gap-2 py-1.5 shrink-0">
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 rounded-lg border border-white/10 hover:bg-[#1c1c1c] text-xs font-semibold text-neutral-400 hover:text-white transition flex items-center gap-1 cursor-pointer select-none"
                        title="Copy Code to Clipboard"
                      >
                        {copied ? (
                          <span className="text-emerald-500 font-bold px-1">Copied!</span>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <a
                        href={codeFilesData[activeFileIndex]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-white/10 hover:bg-[#1c1c1c] text-xs font-semibold text-neutral-400 hover:text-white transition flex items-center gap-1 select-none"
                        title="Open file in Google Drive"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Open Link</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Monaco Container */}
                <div className="flex-1 w-full overflow-hidden relative bg-[#1a1a1a]">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a]">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-emerald-500 animate-spin" style={{ borderTopColor: spotColor.text }} />
                      <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                        Fetching code files...
                      </p>
                    </div>
                  ) : codeFilesData.length > 0 ? (
                    (() => {
                      const activeFile = codeFilesData[activeFileIndex];
                      if (activeFile?.error) {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#1a1a1a] text-center">
                            <svg className="h-12 w-12 text-rose-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <h4 className="text-sm font-bold text-white mb-2">Could Not Load File</h4>
                            <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">
                              {activeFile.message || "Please ensure the sharing permission on Google Drive is set to 'Anyone with the link can view'."}
                            </p>
                            <a
                              href={activeFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition flex items-center gap-2 select-none"
                            >
                              <span>Open in Google Drive</span>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        );
                      }

                      return (
                        <Editor
                          height="100%"
                          width="100%"
                          language={activeFile?.language || "plaintext"}
                          value={activeFile?.content || ""}
                          theme="cursor-dark"
                          beforeMount={(monaco) => {
                            try {
                              monaco.editor.defineTheme("cursor-dark", {
                                base: "vs-dark",
                                inherit: true,
                                rules: [],
                                colors: {
                                  "editor.background": "#1a1a1a",
                                  "editor.foreground": "#D8DEE9",
                                  "editor.lineHighlightBackground": "#292929",
                                  "editorCursor.foreground": "#FFFFFF",
                                  "editorLineNumber.foreground": "#505050",
                                  "editorLineNumber.activeForeground": "#FFFFFF",
                                  "editor.selectionBackground": "#40404099",
                                  "editor.inactiveSelectionBackground": "#40404077",
                                },
                              });
                            } catch (e) {
                              console.error("beforeMount theme definition error:", e);
                            }
                          }}
                          onMount={(editor, monaco) => {
                            try {
                              monaco.editor.defineTheme("cursor-dark", {
                                base: "vs-dark",
                                inherit: true,
                                rules: [],
                                colors: {
                                  "editor.background": "#1a1a1a",
                                  "editor.foreground": "#D8DEE9",
                                  "editor.lineHighlightBackground": "#292929",
                                  "editorCursor.foreground": "#FFFFFF",
                                  "editorLineNumber.foreground": "#505050",
                                  "editorLineNumber.activeForeground": "#FFFFFF",
                                  "editor.selectionBackground": "#40404099",
                                  "editor.inactiveSelectionBackground": "#40404077",
                                },
                              });
                              monaco.editor.setTheme("cursor-dark");
                            } catch (e) {
                              console.error("onMount theme definition error:", e);
                            }
                          }}
                          loading={
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                              <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                              <p className="text-xs text-neutral-500">Loading Editor...</p>
                            </div>
                          }
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "var(--font-mono)",
                            scrollbar: {
                              vertical: "visible",
                              horizontal: "visible",
                            },
                            lineNumbers: "on",
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 },
                            domReadOnly: true,
                            contextmenu: false,
                            stickyScroll: { enabled: false },
                          }}
                        />
                      );
                    })()
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                      <p className="text-xs text-neutral-500 italic">No code files to display</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lecture Details Typography */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border rounded-full select-none"
                  style={{
                    color: spotColor.text,
                    borderColor: spotColor.border,
                    backgroundColor: spotColor.bg,
                  }}
                >
                  Lesson {lecture.order}
                </span>
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#141414]/80 text-[var(--color-ink-muted)] border border-[var(--color-hairline)] rounded-full select-none">
                  Duration: {lecture.duration}
                </span>
                {lecture.isLocked && (
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-[#ff5577]/10 text-[#ff5577] border border-[#ff5577]/20 rounded-full animate-pulse-glow select-none">
                    Premium Locked
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {lecture.title}
              </h1>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans max-w-3xl">
                {lecture.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Sticky Sidebar Roadmap Outline */}
        <div
          className={`fixed inset-y-0 right-0 z-50 lg:z-10 lg:static flex flex-col border-l border-white/5 bg-[#0b0b0b] transition-all duration-300 shrink-0 ${
            sidebarOpen
              ? "translate-x-0 w-full sm:w-[320px] lg:w-[28%] xl:w-[25%] lg:h-[calc(100vh-80px)] lg:sticky lg:top-20"
              : "translate-x-full lg:translate-x-0 lg:w-0 lg:border-l-0 overflow-hidden"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 h-16 shrink-0 bg-black/40">
            <div className="min-w-0 pr-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">Course Navigation</span>
              <h2 className="text-xs font-extrabold text-white truncate mt-0.5 uppercase tracking-wide">{course.title}</h2>
            </div>
            {/* Close Button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg border border-white/10 hover:bg-[#1c1c1c] text-neutral-400 hover:text-white cursor-pointer select-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chapters and Lessons Outline */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-black/[0.05]">
            {course.chapters.map((ch, chIdx) => {
              const isExpanded = !!expandedChapters[ch.id];
              const chSpotColor = SPOTLIGHT_COLORS[chIdx % SPOTLIGHT_COLORS.length];
              return (
                <div key={ch.id} className="border border-white/5 rounded-xl bg-black/10 overflow-hidden">
                  <button
                    onClick={() => toggleChapter(ch.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition cursor-pointer select-none text-left"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: chSpotColor.text }}>
                        Chapter {chIdx + 1}
                      </span>
                      <h3 className="text-xs font-bold text-white truncate mt-0.5">{ch.title}</h3>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 shrink-0 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 divide-y divide-white/5 bg-[#141414]/20 animate-fade-in">
                      {ch.lectures.map((l) => {
                        const isActive = l.slug === lecture.slug;
                        return (
                          <Link
                            key={l.id}
                            href={`/courses/${course.slug}/lectures/${l.slug}`}
                            className={`flex items-start gap-3 p-3.5 hover:bg-white/[0.04] transition-all group ${
                              isActive ? "bg-white/[0.02]" : ""
                            }`}
                          >
                            {/* Order index */}
                            <div className={`w-5.5 h-5.5 rounded-full border text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isActive 
                                ? "bg-white text-black border-white" 
                                : "border-white/10 text-neutral-500 group-hover:border-white/30 group-hover:text-white"
                            }`}>
                              {l.order}
                            </div>
                            
                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <span className={`text-xs font-semibold block transition leading-tight ${
                                isActive ? "text-white" : "text-neutral-400 group-hover:text-white"
                              }`}>
                                {l.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-[9px] text-neutral-500 font-medium">
                                <span>{l.duration}</span>
                                {l.isLocked && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#ff5577] font-semibold">Premium</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Indicator right */}
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0 mt-2" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
