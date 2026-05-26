import Link from "next/link";
import type { Lecture } from "../../types/lecture";

type LectureResource = {
  label: string;
  href: string;
};

type LectureLabels = {
  stepLabel: string;
  durationLabel: string;
  lockedLabel: string;
  emptyResourceLabel: string;
};

type LectureCardProps = {
  lecture: Lecture;
  labels: LectureLabels;
  resources: LectureResource[];
};

export default function LectureCard({
  lecture,
  labels,
  resources,
}: LectureCardProps) {
  return (
    <article
      className="relative p-6"
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
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
      <div className="mt-4 space-y-3">
        <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>
          {lecture.title}
        </h3>
        <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
          {lecture.description}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
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
            className="px-3 py-1 text-caption"
            style={{
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--color-ink-muted)',
            }}
          >
            {labels.lockedLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {resources.map((resource) =>
          resource.href ? (
            <Link
              key={resource.label}
              href={resource.href}
              className="text-button transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'var(--color-surface-2)',
                color: 'var(--color-ink)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 14px',
              }}
            >
              {resource.label}
            </Link>
          ) : (
            <span
              key={resource.label}
              className="text-button"
              style={{
                background: 'transparent',
                color: 'var(--color-ink-muted)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 14px',
                border: '1px dashed var(--color-hairline)',
              }}
            >
              {labels.emptyResourceLabel}
            </span>
          )
        )}
      </div>
    </article>
  );
}
