"use client";

import Link from "next/link";
import { COURSES_TAB } from "../../constants/dashboard";
import type { DashboardCourse } from "../../types/dashboard";
import CourseProgressCard from "./CourseProgressCard";

type CoursesTabProps = {
  courses: DashboardCourse[];
  onUnenroll?: (courseId: string) => void | Promise<void>;
};

export default function CoursesTab({ courses, onUnenroll }: CoursesTabProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-headline">{COURSES_TAB.title}</h1>
        <p className="text-body mt-1" style={{ color: "var(--color-ink-muted)" }}>
          {COURSES_TAB.subtitle}
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((dc, index) => (
            <CourseProgressCard key={dc.enrollment.id} data={dc} colorIndex={index} onUnenroll={onUnenroll} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          className="text-center py-16"
          style={{
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-hairline)",
          }}
        >
          {/* Illustration — open book icon */}
          <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "var(--color-surface-2)" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 5C4 3.9 4.9 3 6 3H11C12.1 3 14 4 14 5V25L9 22L4 25V5Z" stroke="var(--color-ink-muted)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 5C14 3.9 14.9 3 16 3H22C23.1 3 24 3.9 24 5V25L19 22L14 25V5Z" stroke="var(--color-ink-muted)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-body-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
            {COURSES_TAB.emptyTitle}
          </p>
          <p className="text-micro mb-6" style={{ color: "var(--color-ink-muted)" }}>
            {COURSES_TAB.emptyDescription}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-9 px-5 bg-white text-black hover:bg-neutral-200"
          >
            {COURSES_TAB.exploreCta}
          </Link>
        </div>
      )}
    </div>
  );
}
