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

// Premium, semi-transparent chip colors inspired by key brand spotlights
const TAG_COLORS = [
  { bg: "rgba(106, 76, 245, 0.08)", text: "#a393ff", border: "rgba(106, 76, 245, 0.2)" }, // Violet
  { bg: "rgba(212, 77, 240, 0.08)", text: "#f09eff", border: "rgba(212, 77, 240, 0.2)" }, // Magenta
  { bg: "rgba(255, 122, 61, 0.08)", text: "#ffb08a", border: "rgba(255, 122, 61, 0.2)" }, // Orange
  { bg: "rgba(0, 153, 255, 0.08)", text: "#5cbaff", border: "rgba(0, 153, 255, 0.2)" },  // Blue
  { bg: "rgba(34, 197, 94, 0.08)", text: "#86efac", border: "rgba(34, 197, 94, 0.2)" },  // Green
];

export default function CourseListCard({
  course,
  meta,
  ctaHref,
}: CourseListCardProps) {
  // Use the course's tags or fallback to defaults
  const tags = course.tags || [];

  return (
    <div
      data-cursor="view"
      className="flex h-full flex-col justify-between rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.55)] backdrop-blur dark:bg-neutral-900/60"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {course.title}
          </h3>
          <p className="text-sm leading-6 text-foreground/70">
            {course.description}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {meta.map((item) => (
            <div
              key={item.label}
              className="px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col justify-between gap-1 min-w-0"
              style={{
                flex: "1 1 0%",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-hairline-soft)",
              }}
            >
              <span
                className="text-[10px] sm:text-micro font-medium uppercase tracking-[0.08em] truncate"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {item.label}
              </span>
              <span
                className="text-xs sm:text-body-sm font-semibold truncate"
                style={{ color: "var(--color-ink)" }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* 4. Content Covered (Description) */}
        <div className="flex flex-col gap-2">
          <h4
            className="text-micro font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Content Covered
          </h4>
          <p
            className="text-body leading-relaxed font-sans"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            {course.description}
          </p>
        </div>
      </div>

      {/* 5. Primary CTA to Enroll: ENROLL FOR FREE */}
      <Link
        href={ctaHref}
        data-cursor="link"
        data-cursor-text="View"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
      >
        ENROLL FOR FREE
      </Link>
    </div>
  );
}
