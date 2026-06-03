import Link from "next/link";
import type { Lecture } from "../../types/lecture";

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

  return (
    <div
      className="relative p-6 select-none"
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
        // @ts-ignore
        '--hover-accent': accentColor || '#0099ff',
      }}
    >
      <div
        className="flex items-center justify-between text-caption uppercase tracking-[0.2em]"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <span>{labels.lectureLabel}</span>
        <span
          className="flex h-8 w-8 items-center justify-center text-body-sm"
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
        <h3 className="text-headline font-bold" style={{ color: 'var(--color-ink)' }}>
          {lecture.title}
        </h3>
        <p className="text-body text-ink-muted leading-relaxed line-clamp-2">
          {lecture.description}
        </p>
      </div>
      
      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex items-center gap-2">
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
          {lecture.isLocked ? (
            <span
              className="px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-[#ff5577]/10 text-[#ff5577] border border-[#ff5577]/20 rounded-full"
            >
              Locked
            </span>
          ) : null}
        </div>
        
        {/* Start Lesson Trigger */}
        <Link
          href={lectureHref}
          data-cursor="link"
          data-cursor-text="Open"
          className="group px-4 py-2.5 text-button font-semibold flex items-center gap-1.5 transition-all duration-200 bg-white text-black hover:bg-neutral-200 rounded-[100px] shrink-0"
        >
          <span>Start Lesson</span>
          <svg
            className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5"
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
  );
}
