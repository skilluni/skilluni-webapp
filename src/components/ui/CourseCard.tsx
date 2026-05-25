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
    <div className="group flex h-full flex-col justify-between rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)] backdrop-blur dark:bg-neutral-900/60">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          {course.title}
        </h3>
        <p className="text-sm leading-6 text-foreground/70">
          {course.description}
        </p>
      </div>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors group-hover:text-foreground"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
