import { notFound } from "next/navigation";
import { getCourseBySlug } from "../../../../../lib/db";
import LectureDetailsClient from "./LectureDetailsClient";

type LectureDetailsPageProps = {
  params: Promise<{
    courseId: string;
    lectureSlug: string;
  }>;
};

const SPOTLIGHT_COLORS = [
  { text: "#6a4cf5", border: "rgba(106, 76, 245, 0.2)", bg: "rgba(106, 76, 245, 0.08)" },
  { text: "#d44df0", border: "rgba(212, 77, 240, 0.2)", bg: "rgba(212, 77, 240, 0.08)" },
  { text: "#ff7a3d", border: "rgba(255, 122, 61, 0.2)", bg: "rgba(255, 122, 61, 0.08)" },
  { text: "#ff5577", border: "rgba(255, 85, 119, 0.2)", bg: "rgba(255, 85, 119, 0.08)" },
];

export default async function LectureDetailsPage({
  params,
}: LectureDetailsPageProps) {
  const { courseId, lectureSlug } = await params;

  const course = await getCourseBySlug(courseId);
  if (!course) {
    notFound();
  }

  const lecture = course.lectures.find((l) => l.slug === lectureSlug);
  if (!lecture) {
    notFound();
  }

  // Group lectures into chapters to match the spotlight colors
  const chapters = course.chapters;
  const chapterIndex = chapters.findIndex((ch) =>
    ch.lectures.some((l) => l.slug === lecture.slug)
  );
  
  // Choose spotlight color based on chapter index
  const spotColor = chapterIndex !== -1
    ? SPOTLIGHT_COLORS[chapterIndex % SPOTLIGHT_COLORS.length]
    : SPOTLIGHT_COLORS[0];

  return (
    <LectureDetailsClient
      course={course}
      lecture={lecture}
      spotColor={spotColor}
    />
  );
}
