import Link from "next/link";
import type { Lecture } from "../../types/lecture";
import { getYouTubeId } from "../../lib/youtube";

type LectureLabels = {
  lectureLabel: string;
  durationLabel: string;
  lockedLabel: string;
};

type LectureCardProps = {
  lecture: Lecture;
  courseSlug: string;
  labels: LectureLabels;
  accentColor?: string;
};

export default function LectureCard({
  lecture,
  courseSlug,
  labels,
  accentColor,
}: LectureCardProps) {
  const lectureHref = `/courses/${courseSlug}/lectures/${lecture.slug}`;
  const videoId = getYouTubeId(lecture.videoUrl);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

  return (
    <div
      className="relative p-6 select-none group"
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
        // @ts-ignore
        '--hover-accent': accentColor || '#0099ff',
      }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail Column */}
        {thumbnailUrl && (
          <div className="w-full md:w-64 lg:w-72 shrink-0 aspect-video rounded-lg overflow-hidden relative bg-neutral-900 border border-white/5 self-start md:self-center">
            <img
              src={thumbnailUrl}
              alt={lecture.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Lock Overlay for locked/premium lectures */}
            {lecture.isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                <div className="relative flex items-center justify-center">
                  {/* Red/pink glow ring for locked */}
                  <div className="absolute -inset-1.5 rounded-full blur-sm bg-[#ff5577]/30" />
                  {/* Circular Glassmorphic Button */}
                  <div className="h-11 w-11 flex items-center justify-center rounded-full bg-neutral-900/60 border border-white/10 backdrop-blur-md text-[#ff5577] shadow-lg">
                    <svg className="w-4 h-4 fill-[#ff5577]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {/* Duration Overlay */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-black/80 backdrop-blur rounded text-white border border-white/5 tracking-wider">
              {lecture.duration}
            </div>
          </div>
        )}

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div
              className="flex items-center justify-between text-caption uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              <span>{labels.lectureLabel}</span>
              <span
                className="flex h-8 w-8 items-center justify-center text-body-sm font-bold"
                style={{
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-ink)',
                }}
              >
                {lecture.order}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="text-headline font-bold transition-colors duration-200 group-hover:text-[var(--hover-accent)]" style={{ color: 'var(--color-ink)' }}>
                {lecture.title}
              </h3>
              <p className="text-body text-ink-muted leading-relaxed line-clamp-2">
                {lecture.description}
              </p>
            </div>
          </div>
          
          <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex items-center gap-2">
              {!thumbnailUrl && (
                <span
                  className="px-3 py-1 text-caption"
                  style={{
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  {labels.durationLabel}: {lecture.duration}
                </span>
              )}
              {lecture.isLocked ? (
                <span
                  className="px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-[#ff5577]/10 text-[#ff5577] border border-[#ff5577]/20 rounded-full"
                >
                  Locked
                </span>
              ) : null}
              {lecture.completed ? (
                <span
                  className="px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Completed</span>
                </span>
              ) : null}
            </div>
            
            {/* Start Lesson Trigger */}
            <Link
              href={lectureHref}
              data-cursor="link"
              data-cursor-text="Open"
              className="group/btn px-4 py-2.5 text-button font-semibold flex items-center gap-1.5 transition-all duration-200 bg-white text-black hover:bg-neutral-200 rounded-[100px] shrink-0"
            >
              <span>{lecture.completed ? "Revise" : "Start Lesson"}</span>
              <svg
                className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

