"use client";

import Link from "next/link";
import { OVERVIEW } from "../../constants/dashboard";
import type { DashboardStats, DashboardCourse } from "../../types/dashboard";

type OverviewTabProps = {
  userName: string;
  stats: DashboardStats;
  courses: DashboardCourse[];
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="px-5 py-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-hairline)",
      }}
    >
      <p className="text-caption uppercase tracking-[0.2em]" style={{ color: "var(--color-ink-muted)" }}>
        {label}
      </p>
      <p className="text-display-md font-semibold" style={{ color: "var(--color-ink)" }}>
        {value}
      </p>
    </div>
  );
}

const SPOTLIGHT_CLASSES = [
  "gradient-spotlight-violet",
  "gradient-spotlight-magenta",
  "gradient-spotlight-orange",
  "gradient-spotlight-coral",
];

export default function OverviewTab({ userName, stats, courses }: OverviewTabProps) {
  const resolvedName = userName || "Learner";
  const hash = resolvedName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const spotlightClass = SPOTLIGHT_CLASSES[hash % SPOTLIGHT_CLASSES.length];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Greeting Banner — spotlight gradient matches profile gradient */}
      <div className={`${spotlightClass} px-8 py-8 md:px-10 md:py-10`}>
        <p className="text-body-sm font-medium opacity-80 mb-1">
          {OVERVIEW.greeting},
        </p>
        <h1 className="text-display-md tracking-tight font-semibold">
          {userName || "Learner"}
        </h1>
        <p className="text-body mt-2 opacity-70">
          {OVERVIEW.subtitle}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={OVERVIEW.stats.enrolled} value={stats.coursesEnrolled} />
        <StatCard label={OVERVIEW.stats.completed} value={stats.lessonsCompleted} />
        <StatCard label={OVERVIEW.stats.total} value={stats.totalLessons} />
      </div>

      {/* Continue Learning Card */}
      <div
        className="p-6 md:p-8"
        style={{
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-hairline)",
        }}
      >
        <h2 className="text-headline mb-4">{OVERVIEW.continueCard.title}</h2>

        {courses.length > 0 ? (
          <div className="flex flex-col gap-6">
            {courses.map((c) => (
              <div
                key={c.enrollment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold truncate" style={{ color: "var(--color-ink)" }}>
                    {c.course.title}
                  </p>
                  {c.lastLecture && (
                    <p className="text-micro mt-1 truncate" style={{ color: "var(--color-ink-muted)" }}>
                      {c.lastLecture.chapterTitle} » {c.lastLecture.title}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${c.progressPercent}%`,
                          background: "#ffffff",
                        }}
                      />
                    </div>
                    <span className="text-micro font-medium shrink-0" style={{ color: "var(--color-ink-muted)" }}>
                      {c.progressPercent}%
                    </span>
                  </div>
                </div>

                <Link
                  href={
                    c.lastLecture
                      ? `/courses/${c.course.slug}/lectures/${c.lastLecture.slug}`
                      : `/courses/${c.course.slug}`
                  }
                  className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-9 px-5 bg-white text-black hover:bg-neutral-200 shrink-0 self-start sm:self-center"
                >
                  {c.progressPercent > 0 ? OVERVIEW.continueCard.resumeLabel : "Start Learning"}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-body-sm mb-1" style={{ color: "var(--color-ink)" }}>
              {OVERVIEW.continueCard.emptyTitle}
            </p>
            <p className="text-micro mb-5" style={{ color: "var(--color-ink-muted)" }}>
              {OVERVIEW.continueCard.emptyDescription}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-9 px-5 bg-white text-black hover:bg-neutral-200"
            >
              {OVERVIEW.continueCard.exploreCta}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
