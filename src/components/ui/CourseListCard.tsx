import Link from "next/link";
import type { Course } from "../../types/course";

type CourseMeta = {
  label: string;
  value: string;
};

type CourseListCardProps = {
  course: Course;
  meta: CourseMeta[];
  ctaLabel: string;
  ctaHref: string;
};

export default function CourseListCard({
  course,
  meta,
  ctaLabel,
  ctaHref,
}: CourseListCardProps) {
  return (
    <div
      className="card-hover flex h-full flex-col justify-between p-6"
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
      }}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-display-md" style={{ color: 'var(--color-ink)' }}>
            {course.title}
          </h3>
          <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
            {course.description}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {meta.map((item) => (
            <div
              key={item.label}
              className="px-4 py-3"
              style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>
                {item.label}
              </p>
              <p className="mt-1 text-body-sm" style={{ color: 'var(--color-ink)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 text-body-sm transition-colors"
        style={{ color: 'var(--color-accent-blue)' }}
      >
        {ctaLabel}
        <span className="transition-transform hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
