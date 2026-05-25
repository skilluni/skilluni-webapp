import Link from "next/link";
import type { Course } from "../../types/course";

type CourseCardProps = {
  course: Course;
  ctaLabel: string;
  ctaHref: string;
};

export default function CourseCard({
  course,
  ctaLabel,
  ctaHref,
}: CourseCardProps) {
  return (
    <div
      className="group card-hover flex h-full flex-col justify-between p-6"
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
      }}
    >
      <div className="space-y-4">
        <h3 className="text-display-md" style={{ color: 'var(--color-ink)' }}>
          {course.title}
        </h3>
        <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
          {course.description}
        </p>
      </div>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 text-body-sm transition-colors"
        style={{ color: 'var(--color-accent-blue)' }}
      >
        {ctaLabel}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
