import Link from "next/link";
import type { Lecture } from "../../types/lecture";

type LectureLabels = {
  stepLabel: string;
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
    <Link
      href={lectureHref}
      data-cursor="link"
      data-cursor-text="Open"
      className="group block relative p-6 transition-all duration-300 hover:border-neutral-700 hover:scale-[1.01] select-none"
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
        <span>{labels.stepLabel}</span>
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
        <h3 className="text-headline font-bold transition-colors group-hover:text-[var(--hover-accent)]" style={{ color: 'var(--color-ink)' }}>
          {lecture.title}
        </h3>
        <p className="text-body text-ink-muted leading-relaxed line-clamp-2">
          {lecture.description}
        </p>
      </div>
      
      <div className="mt-5 flex items-center justify-between">
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
        <span 
          className="px-4 py-2 text-button font-semibold flex items-center gap-2 transition-all duration-300 group-hover:bg-white/5 group-hover:border-neutral-700 group-hover:text-[var(--hover-accent)]"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-pill)',
            color: 'var(--color-ink)'
          }}
        >
          <span>Start Lesson</span>
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </span>
      </div>
    </Link>
  );
}
