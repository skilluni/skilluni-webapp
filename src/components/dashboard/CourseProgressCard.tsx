"use client";

import Link from "next/link";
import { COURSES_TAB } from "../../constants/dashboard";
import type { DashboardCourse } from "../../types/dashboard";

type CourseProgressCardProps = {
  data: DashboardCourse;
  colorIndex: number;
  onUnenroll?: (courseId: string) => void | Promise<void>;
};

export default function CourseProgressCard({ data, colorIndex, onUnenroll }: CourseProgressCardProps) {
  const { course, progressPercent, completedLectures, totalLectures, lastLecture } = data;

  const targetLectureSlug = lastLecture?.slug || course.lectures[0]?.slug || course.chapters[0]?.lectures[0]?.slug;
  const ctaHref = targetLectureSlug
    ? `/courses/${course.slug}/lectures/${targetLectureSlug}`
    : `/courses/${course.slug}`;

  return (
    <div
      className="flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-hairline)",
      }}
    >

      {/* Title & Level */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-body-sm font-semibold line-clamp-2" style={{ color: "var(--color-ink)" }}>
          {course.title}
        </h3>
        <span
          className="text-micro font-medium px-2 py-0.5 shrink-0"
          style={{
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-ink-muted)",
          }}
        >
          {course.level}
        </span>
      </div>

      {/* Lesson count */}
      <p className="text-micro mb-4" style={{ color: "var(--color-ink-muted)" }}>
        {completedLectures}/{totalLectures} {COURSES_TAB.lessonsLabel}
      </p>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: "#ffffff",
            }}
          />
        </div>
        <span className="text-micro font-medium shrink-0" style={{ color: "var(--color-ink-muted)" }}>
          {progressPercent}% {COURSES_TAB.progressLabel}
        </span>
      </div>

      {/* CTA */}
      <div className="mt-auto flex items-center gap-2">
        <Link
          href={ctaHref}
          className="flex-1 inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-9 px-4 cursor-pointer"
          style={{
            background: progressPercent > 0 ? "var(--color-primary)" : "var(--color-surface-2)",
            color: progressPercent > 0 ? "var(--color-on-primary)" : "var(--color-ink)",
            border: progressPercent > 0 ? "none" : "1px solid var(--color-hairline)",
          }}
        >
          {progressPercent > 0 ? COURSES_TAB.continueCta : COURSES_TAB.viewCta}
        </Link>
        {onUnenroll && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onUnenroll(course.id);
            }}
            className="inline-flex items-center justify-center text-[11px] font-semibold text-rose-500 hover:text-white hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 transition-all duration-200 active:scale-[0.97] rounded-[100px] h-9 px-4 cursor-pointer select-none"
          >
            Unenroll
          </button>
        )}
      </div>
    </div>
  );
}
