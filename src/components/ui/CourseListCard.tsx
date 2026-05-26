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
      className="card-hover flex h-full flex-col justify-between p-6 md:p-8"
      style={{
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-hairline)",
      }}
    >
      <div className="flex flex-col gap-6">
        {/* 1. Course Title */}
        <h3 className="text-display-md" style={{ color: "var(--color-ink)" }}>
          {course.title}
        </h3>

        {/* 2. Transparent Colored Chips (Tags) */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => {
              const color = TAG_COLORS[index % TAG_COLORS.length];
              return (
                <span
                  key={tag}
                  className="px-3 py-1 text-micro font-semibold uppercase tracking-[0.1em] rounded-full border transition-colors duration-200"
                  style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    borderColor: color.border,
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* 3. Level, Lectures and Access Subcards - Enforced Row Layout via Inline CSS */}
        <div className="w-full" style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
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
        className="mt-8 flex w-full items-center justify-center text-button font-bold text-center py-4 rounded-full transition-all duration-200 active:scale-[0.98] hover:scale-[1.01] hover:shadow-lg shadow-md cursor-pointer select-none"
        style={{
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
        }}
      >
        ENROLL FOR FREE
      </Link>
    </div>
  );
}
