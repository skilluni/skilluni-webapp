import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "../../../../../lib/db";
import CustomVideoPlayer from "../../../../../components/ui/CustomVideoPlayer";

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

export default async function LectureDetailsPage({
  params,
}: LectureDetailsPageProps) {
  const { courseId, lectureSlug } = await params;

  const course = await getCourseBySlug(courseId);
  if (!course) {
    notFound();
  }

  const lecture = course.lectures.find((l) => l.slug === lectureSlug);
  if (!lecture) {
    notFound();
  }

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
      <div className="mx-auto max-w-6xl px-6 flex flex-col gap-8">
        
        {/* Navigation Breadcrumb */}
        <div>
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

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start">
          
          {/* Main Content Column (Left, spans 3 columns on desktop) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Custom Video Player */}
            <CustomVideoPlayer 
              videoUrl={lecture.videoUrl} 
              title={lecture.title} 
              accentColor={spotColor.text} 
            />

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
          </div>

          {/* Sidebar Column (Right, spans 1 column on desktop) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div 
              className="p-6 rounded-2xl border space-y-6"
              style={{
                background: "var(--color-surface-1)",
                borderColor: "var(--color-hairline)",
              }}
            >
              <div>
                <h2
                  className="text-caption uppercase tracking-[0.2em] font-bold"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  Lesson Materials
                </h2>
                <p className="text-xs text-ink-muted/60 mt-1">
                  Access notes and check your understanding.
                </p>
              </div>

              <div className="flex flex-col gap-3">
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

                {/* Download Notes Link */}
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
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
