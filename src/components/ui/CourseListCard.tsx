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
              className="rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-xs"
            >
              <p className="text-foreground/60">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Link
        href={ctaHref}
        data-cursor="link"
        data-cursor-text="View"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
