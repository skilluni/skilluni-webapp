import type { DbCourse } from "../lib/db";

// ─── Avatar System ───────────────────────────────────────────────────────────

export type AvatarId = "avatar-1" | "avatar-2" | "avatar-3" | "avatar-4" | "avatar-5";

export type AvatarDef = {
  id: AvatarId;
  label: string;
  /** Accent color from the brand palette */
  color: string;
};

// ─── Dashboard Tabs ──────────────────────────────────────────────────────────

export type DashboardTab = "overview" | "courses" | "profile";

// ─── Enrollment ──────────────────────────────────────────────────────────────

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
};

// ─── Lecture Progress ────────────────────────────────────────────────────────

export type LectureProgress = {
  id: string;
  user_id: string;
  lecture_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
};

// ─── Dashboard Course (enriched with progress) ──────────────────────────────

export type DashboardCourse = {
  course: DbCourse;
  enrollment: Enrollment;
  totalLectures: number;
  completedLectures: number;
  progressPercent: number;
  /** The last lecture the user was working on */
  lastLecture?: {
    id: string;
    title: string;
    slug: string;
    chapterTitle: string;
  };
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export type DashboardStats = {
  coursesEnrolled: number;
  lessonsCompleted: number;
  totalLessons: number;
};
