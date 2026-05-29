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
      className="flex h-full flex-col justify-between rounded-[20px] border border-hairline bg-surface-1/80 backdrop-blur-md p-8 transition-all duration-300 hover:border-neutral-700 hover:scale-[1.01]"
    >
      <div className="space-y-6">
        {/* 1 & 2. Course Title and Tags */}
        <div className="space-y-3.5">
          <h3 className="text-headline font-bold text-ink tracking-[-0.03em] leading-snug">
            {course.title}
          </h3>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-0.5">
              {tags.map((tag, idx) => {
                const color = TAG_COLORS[idx % TAG_COLORS.length];
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border backdrop-blur-[2px] transition-all hover:scale-[1.03]"
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
        </div>

        {/* 3. Three Subcards for level, lectures and access. (Row Grid for mobile devices) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {meta.map((item, idx) => (
            <div
              key={item.label}
              className={`px-2.5 py-3 sm:px-4 flex flex-col justify-between gap-1 min-w-0 transition-colors border duration-200 hover:bg-surface-2/60 ${
                idx === 2 ? "col-span-2 sm:col-span-1" : ""
              }`}
              style={{
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                borderColor: "var(--color-hairline-soft)",
              }}
            >
              <span
                className="text-[9px] sm:text-micro font-semibold uppercase tracking-[0.08em] truncate"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {item.label}
              </span>
              <span
                className="text-xs sm:text-body-sm font-bold truncate"
                style={{ color: "var(--color-ink)" }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* 4 & 5. Eyebrow "CONTENT COVERED" and Syllabus Scope */}
        <div className="flex flex-col gap-2 pt-1">
          <h4
            className="text-micro font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            CONTENT COVERED
          </h4>
          <p
            className="text-body leading-relaxed font-sans"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            {course.description}
          </p>
        </div>
      </div>

      {/* 6. Primary CTA: ENROLL FOR FREE Pill Button */}
      <div className="mt-6 pt-1">
        <Link
          href={ctaHref}
          data-cursor="link"
          data-cursor-text="Enroll"
          className="inline-flex w-full items-center justify-center text-button font-bold bg-white text-black hover:bg-neutral-200 transition-all duration-200 active:scale-[0.97] rounded-[100px] h-12 px-6 shadow-sm hover:scale-[1.01]"
        >
          ENROLL FOR FREE
        </Link>
      </div>
    </div>
  );
}
