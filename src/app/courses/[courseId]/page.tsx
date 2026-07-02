import { notFound } from "next/navigation";
import { getCourseBySlug, getCourses } from "../../../lib/db";
import CourseRoadmapClient from "./CourseRoadmapClient";

type CourseRoadmapPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseRoadmapPage({
  params,
}: CourseRoadmapPageProps) {
  const { courseId } = await params;
  const course = await getCourseBySlug(courseId);

  if (!course) {
    notFound();
  }

  const allCourses = await getCourses();
  const courseIndex = allCourses.findIndex((c) => c.slug === course.slug);
  const colors = ["#6a4cf5", "#d44df0", "#ff7a3d", "#ff5577"];
  const spotColor = colors[courseIndex !== -1 ? courseIndex % colors.length : 0];

  const completedCount = course.lectures.filter(
    (lecture) => lecture.completed
  ).length;
  const progress = course.lectures.length
    ? Math.round((completedCount / course.lectures.length) * 100)
    : 0;

  return (
    <CourseRoadmapClient
      course={course}
      spotColor={spotColor}
      initialProgress={progress}
    />
  );
}
