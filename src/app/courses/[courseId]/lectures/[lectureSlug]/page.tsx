import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "../../../../../lib/db";

type LectureDetailsPageProps = {
  params: Promise<{
    courseId: string;
    lectureSlug: string;
  }>;
};

const SPOTLIGHT_COLORS = [
  { text: "#6a4cf5", border: "rgba(106, 76, 245, 0.2)", bg: "rgba(106, 76, 245, 0.08)" },
  { text: "#d44df0", border: "rgba(212, 77, 240, 0.2)", bg: "rgba(212, 77, 240, 0.08)" },
  { text: "#ff7a3d", border: "rgba(255, 122, 61, 0.2)", bg: "rgba(255, 122, 61, 0.08)" },
  { text: "#ff5577", border: "rgba(255, 85, 119, 0.2)", bg: "rgba(255, 85, 119, 0.08)" },
];

// Robust helper to convert standard YouTube watch URLs to embed URL formats
function getEmbedUrl(videoUrl: string | undefined): string | null {
  if (!videoUrl) return null;

  try {
    // Already an embed URL
    if (videoUrl.includes("youtube.com/embed/")) {
      return videoUrl;
    }

    let videoId = "";
    if (videoUrl.includes("youtube.com/watch")) {
      const urlObj = new URL(videoUrl);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (videoUrl.includes("youtu.be/")) {
      const urlObj = new URL(videoUrl);
      videoId = urlObj.pathname.substring(1);
    } else if (videoUrl.includes("youtube.com/v/")) {
      const parts = videoUrl.split("/v/");
      videoId = parts[parts.length - 1].split(/[?#]/)[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;
    }
    return null;
  } catch (e) {
    console.error("Failed to parse YouTube URL:", videoUrl, e);
    // Dynamic string fallback for safety
    if (videoUrl.includes("watch?v=")) {
      const match = videoUrl.split("watch?v=")[1];
      if (match) {
        const id = match.split("&")[0];
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=0`;
      }
    }
    return null;
  }
}

export default async function LectureDetailsPage({
  params,
}: LectureDetailsPageProps) {
  const { courseId, lectureSlug } = await params;

  const course = getCourseBySlug(courseId);
  if (!course) {
    notFound();
  }

  const lecture = course.lectures.find((l) => l.slug === lectureSlug);
  if (!lecture) {
    notFound();
  }

  const embedUrl = getEmbedUrl(lecture.videoUrl);

  // Group lectures into chapters to match the spotlight colors
  const chapters = course.chapters;
  const chapterIndex = chapters.findIndex((ch) =>
    ch.lectures.some((l) => l.slug === lecture.slug)
  );
  
  // Choose spotlight color based on chapter index
  const spotColor = chapterIndex !== -1
    ? SPOTLIGHT_COLORS[chapterIndex % SPOTLIGHT_COLORS.length]
    : SPOTLIGHT_COLORS[0];

  return (
    <main
      className="flex-1 min-h-screen py-12 md:py-20"
      style={{ background: "var(--color-canvas)", color: "var(--color-ink)" }}
    >
      <div className="mx-auto max-w-4xl px-6 flex flex-col gap-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href={`/courses/${course.slug}`}
            data-cursor="link"
            data-cursor-text="Roadmap"
            className="group inline-flex items-center gap-4 text-caption font-semibold transition-colors duration-200"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center transition-all duration-300 group-hover:bg-white/5 group-hover:border-neutral-700"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--color-hairline)",
                borderRadius: "var(--radius-full)",
                color: "var(--color-ink)",
              }}
            >
              <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
            </span>
            <span className="group-hover:text-white transition-colors duration-200">
              Back to {course.title} Roadmap
            </span>
          </Link>
        </div>

        {/* Lecture Header Block */}
        <div className="space-y-4">
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
            <span
              className="px-3 py-1 text-[11px] uppercase tracking-widest font-semibold bg-neutral-900/80 text-ink-muted border border-[var(--color-hairline)] rounded-full"
            >
              Duration: {lecture.duration}
            </span>
            {lecture.isLocked && (
              <span
                className="px-3 py-1 text-[11px] uppercase tracking-widest font-bold bg-[#ff5577]/10 text-[#ff5577] border border-[#ff5577]/20 rounded-full animate-pulse-glow"
              >
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

        {/* Video Player Section wrapped in custom Mock Browser Chrome */}
        <div className="relative mt-2">
          {embedUrl ? (
            <div
              className="w-full rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 hover:border-neutral-700 animate-scale-in relative group"
              style={{
                borderColor: "var(--color-hairline)",
                background: "var(--color-surface-1)",
              }}
            >
              {/* Dynamic Atmospheric Spotlight Aura behind browser frame */}
              <div 
                className="absolute -inset-10 bg-radial-gradient from-[var(--spotlight-color)]/8 to-transparent blur-3xl pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{
                  // @ts-ignore
                  '--spotlight-color': spotColor.text
                }}
              />

              {/* Browser Chrome Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b select-none relative z-10"
                style={{
                  background: "var(--color-surface-2)",
                  borderColor: "var(--color-hairline)",
                }}
              >
                {/* Window Dots */}
                <div className="flex items-center gap-1.5 w-1/4">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                
                {/* Active Tab / Address bar */}
                <div
                  className="flex items-center justify-center gap-2 px-3 py-1 text-[11px] font-semibold rounded-md border text-ink-muted w-1/2 md:w-2/5 truncate"
                  style={{
                    background: "var(--color-canvas)",
                    borderColor: "var(--color-hairline)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ backgroundColor: spotColor.text }} />
                  <span className="truncate font-mono tracking-tight">skilluni.edu/player/{lecture.slug}</span>
                </div>

                {/* Right metadata info indicator */}
                <div className="w-1/4 flex justify-end text-[10px] font-mono tracking-wider opacity-30 select-none uppercase">
                  1080p stream
                </div>
              </div>

              {/* Video Player Container */}
              <div className="aspect-video w-full relative z-10 bg-black">
                <iframe
                  src={embedUrl}
                  title={lecture.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            // Exquisite glassmorphic placeholder for coming soon videos
            <div
              className="w-full py-20 px-8 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed relative overflow-hidden animate-scale-in"
              style={{
                borderColor: "var(--color-hairline)",
                background: "linear-gradient(135deg, rgba(20, 20, 20, 0.4) 0%, rgba(28, 28, 28, 0.2) 100%)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Decorative aura */}
              <div 
                className="absolute -inset-10 bg-radial-gradient from-[var(--spot-glow)]/5 to-transparent blur-3xl pointer-events-none animate-pulse-glow" 
                style={{
                  // @ts-ignore
                  '--spot-glow': spotColor.text
                }}
              />

              <div className="relative z-10 space-y-4 max-w-md">
                <div
                  className="mx-auto w-12 h-12 rounded-full flex items-center justify-center border border-[var(--color-hairline)] bg-neutral-900/60"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={spotColor.text}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
                  </svg>
                </div>
                
                <h3
                  className="text-headline font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Video Lesson Coming Soon
                </h3>
                <p
                  className="text-body-sm max-w-sm mx-auto leading-relaxed"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  We are hard at work productionizing this lesson. In the meantime, you can explore the notes and interactive quiz below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resources Actions Grid */}
        <div className="mt-4 space-y-6">
          <h2
            className="text-caption uppercase tracking-[0.2em]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Lesson Materials & Resources
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Take Quiz Button Card */}
            {lecture.quizUrl ? (
              <a
                href={lecture.quizUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                data-cursor-text="Quiz"
                className="group flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] shadow-lg hover:shadow-xl select-none"
                style={{
                  background: "var(--color-primary)",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                }}
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-60">
                    Practice Assignment
                  </span>
                  <h3 className="text-lg font-bold tracking-tight">
                    Take Lesson Quiz
                  </h3>
                  <p className="text-body-sm opacity-80 mt-1 leading-relaxed">
                    Test your understanding immediately with direct concept questions.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between font-bold text-button">
                  <span>Start Practice Quiz</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </a>
            ) : (
              <div
                className="flex flex-col justify-between p-6 rounded-2xl border border-dashed select-none opacity-60"
                style={{
                  borderColor: "var(--color-hairline)",
                  background: "var(--color-surface-1)",
                  color: "var(--color-ink-muted)",
                }}
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-45">
                    Practice Assignment
                  </span>
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
                    Lesson Quiz Unavailable
                  </h3>
                  <p className="text-body-sm opacity-60 mt-1 leading-relaxed">
                    An interactive review quiz is being prepared for this lecture step.
                  </p>
                </div>
                
                <div className="mt-8 text-button font-medium italic">
                  Quiz coming soon
                </div>
              </div>
            )}

            {/* Download Notes Button Card */}
            {lecture.notesUrl ? (
              <a
                href={lecture.notesUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                data-cursor-text="Notes"
                className="group flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:border-neutral-700 shadow-md hover:shadow-lg select-none"
                style={{
                  background: "var(--color-surface-1)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-60" style={{ color: "var(--color-ink-muted)" }}>
                    Lecture Guides
                  </span>
                  <h3 className="text-lg font-bold tracking-tight">
                    Download Lesson Notes
                  </h3>
                  <p className="text-body-sm mt-1 leading-relaxed" style={{ color: "var(--color-ink-muted)" }}>
                    Access complete high-quality handwritten theory notes and programming cheat sheets.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between font-bold text-button" style={{ color: "#0099ff" }}>
                  <span>Download Notes PDF</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </a>
            ) : (
              <div
                className="flex flex-col justify-between p-6 rounded-2xl border border-dashed select-none opacity-60"
                style={{
                  borderColor: "var(--color-hairline)",
                  background: "var(--color-surface-1)",
                  color: "var(--color-ink-muted)",
                }}
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-45">
                    Lecture Guides
                  </span>
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
                    Lesson Notes Unavailable
                  </h3>
                  <p className="text-body-sm opacity-60 mt-1 leading-relaxed">
                    Handwritten class notes are currently in draft review for this step.
                  </p>
                </div>
                
                <div className="mt-8 text-button font-medium italic">
                  Notes coming soon
                </div>
              </div>
            )}

          </div>
        </div>
        
      </div>
    </main>
  );
}
