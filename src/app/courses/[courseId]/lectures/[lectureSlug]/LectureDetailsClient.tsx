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

export default function LectureDetailsClient({
  course,
  lecture,
  spotColor,
}: LectureDetailsClientProps) {
  const [showCodes, setShowCodes] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [codeFilesData, setCodeFilesData] = useState<CodeFileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if codeFiles links are available
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

  const handleCopyCode = () => {
    const activeFile = codeFilesData[activeFileIndex];
    if (activeFile && activeFile.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to render SVGs for specific programming language tabs
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

  // Group lectures into chapters
  const chapters = course.chapters;
  const chapterIndex = chapters.findIndex((ch) =>
    ch.lectures.some((l) => l.slug === lecture.slug)
  );

  return (
    <main
      className="flex-1 min-h-screen py-12 md:py-20"
      style={{ background: "var(--color-canvas)", color: "var(--color-ink)" }}
    >
      <div className="mx-auto w-full px-6 transition-all duration-300 max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className={`${showCodes ? "" : "max-w-4xl mx-auto"} mb-8 transition-all duration-300`}>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
              />
            </svg>
            <span>Back to Roadmap</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div
        className={`mx-auto w-full px-6 transition-all duration-300 ${
          showCodes
            ? "max-w-[100%] flex flex-col lg:flex-row gap-8 items-stretch"
            : "max-w-4xl flex flex-col gap-8"
        }`}
      >
        {/* Left Side Content Column */}
        <div className={`transition-all duration-300 ${showCodes ? "w-full lg:w-1/2 flex flex-col gap-6" : "space-y-6 w-full"}`}>
          {/* Custom Video Player */}
          <CustomVideoPlayer
            videoUrl={lecture.videoUrl}
            title={lecture.title}
            accentColor={spotColor.text}
          />

          {/* Quick Actions / Lesson Materials (Quiz, Notes, Codes buttons) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Take Quiz Link */}
            {lecture.quizUrl ? (
              <a
                href={lecture.quizUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                data-cursor-text="Quiz"
                className="group flex items-center justify-between p-4 rounded-xl transition-all duration-200 bg-white text-black hover:bg-neutral-200 select-none text-button font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Take Quiz</span>
                </div>
                <svg className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </a>
            ) : (
              <div
                className="flex items-center justify-between p-4 rounded-xl border border-dashed select-none opacity-50 text-button font-medium italic"
                style={{
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink-muted)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Take Quiz</span>
                </div>
              </div>
            )}

            {/* Lesson Notes Link */}
            {lecture.notesUrl ? (
              <a
                href={lecture.notesUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                data-cursor-text="Notes"
                className="group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border border-hairline bg-[#1c1c1c] hover:bg-[#262626] select-none text-button font-bold text-ink"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Lesson Notes</span>
                </div>
                <svg className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </a>
            ) : (
              <div
                className="flex items-center justify-between p-4 rounded-xl border border-dashed select-none opacity-50 text-button font-medium italic"
                style={{
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink-muted)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Lesson Notes</span>
                </div>
              </div>
            )}

            {/* Show Codes Button */}
            {hasCodeLinks ? (
              <button
                onClick={() => setShowCodes(!showCodes)}
                data-cursor="link"
                data-cursor-text="Codes"
                className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border border-hairline select-none text-button font-bold cursor-pointer ${
                  showCodes
                    ? "bg-[#1c1c1c] text-white hover:bg-neutral-800"
                    : "bg-[#1c1c1c]/10 text-white hover:bg-[#1c1c1c]"
                }`}
                style={showCodes ? { borderColor: spotColor.text, color: spotColor.text } : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span>{showCodes ? "Hide Codes" : "Show Codes"}</span>
                </div>
                <svg
                  className={`h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 ${
                    showCodes ? "rotate-90 text-[var(--color-ink)]" : "group-hover:translate-x-0.5"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div
                className="flex items-center justify-between p-4 rounded-xl border border-dashed select-none opacity-50 text-button font-medium italic"
                style={{
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink-muted)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span>Show Codes</span>
                </div>
              </div>
            )}
          </div>

          {/* Lecture Header Block */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="px-3 py-1 text-[11px] uppercase tracking-widest font-bold border rounded-full"
                style={{
                  color: spotColor.text,
                  borderColor: spotColor.border,
                  backgroundColor: spotColor.bg,
                }}
              >
                Lesson {lecture.order}
              </span>
              <span className="px-3 py-1 text-[11px] uppercase tracking-widest font-semibold bg-neutral-900/80 text-ink-muted border border-[var(--color-hairline)] rounded-full">
                Duration: {lecture.duration}
              </span>
              {lecture.isLocked && (
                <span className="px-3 py-1 text-[11px] uppercase tracking-widest font-bold bg-[#ff5577]/10 text-[#ff5577] border border-[#ff5577]/20 rounded-full animate-pulse-glow">
                  Premium Locked
                </span>
              )}
            </div>

            <h1
              className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {lecture.title}
            </h1>

            <p
              className="text-body-lg leading-relaxed max-w-3xl"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {lecture.description}
            </p>
          </div>
        </div>

        {/* Right Side Codes Panel Column */}
        {showCodes && (
          <div className="w-full lg:w-1/2 flex flex-col h-[500px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 border border-[var(--color-hairline)] rounded-xl overflow-hidden bg-[#1e1e1e] animate-scale-in shadow-2xl">
            {/* Tabs Navbar */}
            <div className="flex items-center justify-between border-b border-[var(--color-hairline)] bg-[#141414] px-4 overflow-x-auto scrollbar-none shrink-0 h-12">
              <div className="flex overflow-x-auto scrollbar-none h-full">
                {loading ? (
                  <div className="flex items-center px-4 text-xs text-[var(--color-ink-muted)]">
                    Loading files...
                  </div>
                ) : (
                  codeFilesData.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex items-center gap-2 px-4 h-full border-b-2 text-xs font-semibold select-none cursor-pointer transition-all duration-200 ${
                        activeFileIndex === idx
                          ? "bg-[#1e1e1e] text-white"
                          : "border-transparent text-[var(--color-ink-muted)] hover:text-white hover:bg-neutral-800/40"
                      }`}
                      style={
                        activeFileIndex === idx
                          ? { borderBottomColor: spotColor.text }
                          : { borderBottomColor: "transparent" }
                      }
                    >
                      {getFileIcon(file.language)}
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      {file.error && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Loading failed" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Utility actions */}
              {!loading && codeFilesData.length > 0 && (
                <div className="flex items-center gap-2 py-1.5 shrink-0">
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg border border-[var(--color-hairline)] hover:bg-[#1c1c1c] text-xs font-semibold text-[var(--color-ink-muted)] hover:text-white transition flex items-center gap-1 cursor-pointer select-none"
                    title="Copy Code to Clipboard"
                  >
                    {copied ? (
                      <span className="text-emerald-500 font-bold">Copied!</span>
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
                    className="p-1.5 rounded-lg border border-[var(--color-hairline)] hover:bg-[#1c1c1c] text-xs font-semibold text-[var(--color-ink-muted)] hover:text-white transition flex items-center gap-1 select-none"
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

            {/* Monaco Editor Container */}
            <div className="flex-1 w-full overflow-hidden relative bg-[#1e1e1e]">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1e1e1e]">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[var(--color-accent-blue)] animate-spin" style={{ borderTopColor: spotColor.text }} />
                  <p className="text-xs font-semibold tracking-wider text-[var(--color-ink-muted)] uppercase">
                    Fetching code files...
                  </p>
                </div>
              ) : codeFilesData.length > 0 ? (
                (() => {
                  const activeFile = codeFilesData[activeFileIndex];
                  if (activeFile?.error) {
                    return (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#1e1e1e] text-center">
                        <svg className="h-12 w-12 text-rose-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <h4 className="text-sm font-bold text-white mb-2">Could Not Load File</h4>
                        <p className="text-xs text-[var(--color-ink-muted)] max-w-sm mb-6 leading-relaxed">
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
                      theme="vs-dark"
                      loading={
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1e1e1e]">
                          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          <p className="text-xs text-[var(--color-ink-muted)]">Loading Editor...</p>
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
                      }}
                    />
                  );
                })()
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
                  <p className="text-xs text-[var(--color-ink-muted)] italic">No code files to display</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
