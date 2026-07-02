"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/providers/AuthProvider";
import { supabase } from "../../lib/supabase";
import DashboardShell from "../../components/dashboard/DashboardShell";
import type { DashboardCourse, DashboardStats, Enrollment, LectureProgress } from "../../types/dashboard";
import type { DbCourse } from "../../lib/db";
import type { Profile } from "../../components/providers/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();

  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [token, setToken] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  // Get the access token
  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setToken(data.session.access_token);
      }
    };
    if (user) getToken();
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setDataLoading(true);

      try {
        // Fetch enrollments, progress, and all courses in parallel
        const [enrollRes, progressRes, coursesRes] = await Promise.all([
          fetch("/api/dashboard/enrollments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/dashboard/progress", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/courses"),
        ]);

        const enrollments: Enrollment[] = enrollRes.ok ? await enrollRes.json() : [];
        const progressList: LectureProgress[] = progressRes.ok ? await progressRes.json() : [];

        // Courses API returns DbCourse[] — parse from API route or direct Supabase
        let allCourses: DbCourse[] = [];
        if (coursesRes.ok) {
          allCourses = await coursesRes.json();
        }

        // Build progress lookup: courseId -> completed lecture IDs
        const progressByCourse = new Map<string, Set<string>>();
        for (const p of progressList) {
          if (p.completed) {
            const set = progressByCourse.get(p.course_id) || new Set();
            set.add(p.lecture_id);
            progressByCourse.set(p.course_id, set);
          }
        }

        // Build dashboard courses
        const dashboardCourses: DashboardCourse[] = [];
        let totalCompleted = 0;
        let totalLessons = 0;

        for (const enrollment of enrollments) {
          const course = allCourses.find((c) => c.id === enrollment.course_id);
          if (!course) continue;

          const completedIds = progressByCourse.get(course.id) || new Set();
          const completedCount = completedIds.size;
          const lectureCount = course.lectures.length;
          const percent = lectureCount > 0 ? Math.round((completedCount / lectureCount) * 100) : 0;

          totalCompleted += completedCount;
          totalLessons += lectureCount;

          // Find the first incomplete lecture for "resume"
          let lastLecture: DashboardCourse["lastLecture"] = undefined;
          for (const chapter of course.chapters) {
            for (const lecture of chapter.lectures) {
              if (!completedIds.has(lecture.id)) {
                lastLecture = {
                  id: lecture.id,
                  title: lecture.title,
                  slug: lecture.slug,
                  chapterTitle: chapter.title,
                };
                break;
              }
            }
            if (lastLecture) break;
          }

          dashboardCourses.push({
            course,
            enrollment,
            totalLectures: lectureCount,
            completedLectures: completedCount,
            progressPercent: percent,
            lastLecture,
          });
        }

        setCourses(dashboardCourses);
        setStats({
          coursesEnrolled: enrollments.length,
          lessonsCompleted: totalCompleted,
          totalLessons,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleProfileUpdate = useCallback(
    (updated: Partial<Profile>) => {
      // Trigger re-fetch of profile in AuthProvider
      refreshProfile();
    },
    [refreshProfile]
  );

  const handleUnenroll = useCallback(
    async (courseId: string) => {
      if (!token) return;

      const confirmUnenroll = window.confirm("Are you sure you want to unenroll from this course? This will also clear your lesson progress.");
      if (!confirmUnenroll) return;

      try {
        const res = await fetch("/api/dashboard/enrollments", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ course_id: courseId }),
        });

        if (res.ok) {
          const targetCourse = courses.find((c) => c.course.id === courseId);
          if (targetCourse) {
            setCourses((prev) => prev.filter((c) => c.course.id !== courseId));
            setStats((prev) => ({
              coursesEnrolled: Math.max(0, prev.coursesEnrolled - 1),
              lessonsCompleted: Math.max(0, prev.lessonsCompleted - targetCourse.completedLectures),
              totalLessons: Math.max(0, prev.totalLessons - targetCourse.totalLectures),
            }));
          }
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Failed to unenroll.");
        }
      } catch (err) {
        console.error("Unenroll error:", err);
        alert("An error occurred. Please try again.");
      }
    },
    [token, courses]
  );

  // Loading state
  if (authLoading || !user || !profile) {
    return null; // LoadingScreen from AuthProvider handles this
  }

  if (dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: "calc(100vh - 4rem)" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-hairline)", borderTopColor: "transparent" }}
          />
          <p className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      profile={profile}
      courses={courses}
      stats={stats}
      token={token}
      onSignOut={handleSignOut}
      onProfileUpdate={handleProfileUpdate}
      onUnenroll={handleUnenroll}
    />
  );
}
