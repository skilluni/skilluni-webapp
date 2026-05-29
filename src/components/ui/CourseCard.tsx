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
      data-cursor="view"
      className="group flex h-full flex-col justify-between rounded-[20px] border border-hairline bg-surface-1/80 backdrop-blur-md p-6 transition-all duration-300 hover:border-neutral-700 hover:scale-[1.01]"
    >
      <div className="space-y-4">
        <h3 className="text-display-md text-ink">
          {course.title}
        </h3>
        <p className="text-body text-ink-muted">
          {course.description}
        </p>
      </div>
      <Link
        href={ctaHref}
        data-cursor="link"
        data-cursor-text="View"
        className="mt-6 inline-flex items-center gap-2 text-body-sm font-semibold text-[#0099ff] transition-colors hover:text-[#33adff]"
      >
        {ctaLabel}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
