import type { AvatarDef, DashboardTab } from "../types/dashboard";

// ─── Avatars ─────────────────────────────────────────────────────────────────

export const AVATARS: AvatarDef[] = [
  { id: "avatar-1", label: "Prism",    color: "#6a4cf5" },
  { id: "avatar-2", label: "Nova",     color: "#d44df0" },
  { id: "avatar-3", label: "Ember",    color: "#ff7a3d" },
  { id: "avatar-4", label: "Coral",    color: "#ff5577" },
  { id: "avatar-5", label: "Sky",      color: "#0099ff" },
];

// ─── Tab Definitions ─────────────────────────────────────────────────────────

export const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview",   icon: "grid" },
  { id: "courses",  label: "My Courses", icon: "book" },
  { id: "profile",  label: "Profile",    icon: "user" },
];

// ─── Overview Labels ─────────────────────────────────────────────────────────

export const OVERVIEW = {
  greeting: "Welcome back",
  subtitle: "Here's your learning progress at a glance.",
  stats: {
    enrolled: "Courses Enrolled",
    completed: "Lessons Completed",
    total: "Total Lessons",
  },
  continueCard: {
    title: "Continue Learning",
    resumeLabel: "Resume",
    emptyTitle: "No courses yet",
    emptyDescription: "Browse our course catalog and start learning today.",
    exploreCta: "Explore Courses",
  },
};

// ─── Courses Tab Labels ──────────────────────────────────────────────────────

export const COURSES_TAB = {
  title: "My Courses",
  subtitle: "All your enrolled courses and progress.",
  continueCta: "Continue",
  viewCta: "View Course",
  progressLabel: "complete",
  lessonsLabel: "lessons",
  emptyTitle: "No courses enrolled",
  emptyDescription: "Start your learning journey by enrolling in a course.",
  exploreCta: "Browse Courses",
};

// ─── Profile Tab Labels ─────────────────────────────────────────────────────

export const PROFILE = {
  title: "Profile",
  subtitle: "Manage your account and personalise your avatar.",
  avatarSection: "Choose Avatar",
  accountSection: "Account Information",
  fields: {
    email: "Email",
    username: "Username",
    name: "Display Name",
    institution: "Institution Type",
    boardOfStudy: "Board of Study",
    class: "Class",
    schoolName: "School Name",
    universityName: "University Name",
    course: "Course / Programme",
  },
  readOnlyHint: "Cannot be changed",
  saveLabel: "Save Changes",
  savingLabel: "Saving…",
  savedLabel: "Saved!",
};
