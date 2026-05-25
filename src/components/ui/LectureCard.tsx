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
    <article className="relative rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.55)] backdrop-blur dark:bg-neutral-900/60">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
        <span>{labels.stepLabel}</span>
        <span>{lecture.order}</span>
      </div>
      <div className="mt-4 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          {lecture.title}
        </h3>
        <p className="text-sm leading-6 text-foreground/70">
          {lecture.description}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
        <span className="rounded-full border border-foreground/10 px-3 py-1">
          {labels.durationLabel}: {lecture.duration}
        </span>
        {lecture.isLocked ? (
          <span className="rounded-full border border-foreground/10 px-3 py-1">
            {labels.lockedLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {resources.map((resource) =>
          resource.href ? (
            <Link
              key={resource.label}
              href={resource.href}
              className="rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold text-foreground/70 transition-colors hover:border-foreground/60 hover:text-foreground"
            >
              {resource.label}
            </Link>
          ) : (
            <span
              key={resource.label}
              className="rounded-full border border-dashed border-foreground/20 px-4 py-2 text-xs font-semibold text-foreground/40"
            >
              {labels.emptyResourceLabel}
            </span>
          )
        )}
      </div>
    </article>
  );
}
