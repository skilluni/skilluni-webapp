import { notFound } from "next/navigation";
import { COURSES } from "../../../constants/courses";
import { ROADMAP_PAGE } from "../../../constants/roadmap";
import LectureCard from "../../../components/ui/LectureCard";
import SectionHeading from "../../../components/ui/SectionHeading";

type CourseRoadmapPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseRoadmapPage({
  params,
}: CourseRoadmapPageProps) {
  const { courseId } = await params;
  const course = COURSES.find((item) => item.slug === courseId);

  if (!course) {
    notFound();
  }

  const completedCount = course.lectures.filter(
    (lecture) => lecture.completed
  ).length;
  const progress = course.lectures.length
    ? Math.round((completedCount / course.lectures.length) * 100)
    : 0;
  const sortedLectures = [...course.lectures].sort(
    (a, b) => a.order - b.order
  );

  return (
    <main className="flex-1 bg-background text-foreground">
      <section className="border-b border-foreground/10 py-20 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6">
          <SectionHeading
            eyebrow={ROADMAP_PAGE.header.eyebrow}
            title={course.title}
            description={course.description}
          />
          <p className="text-sm text-foreground/60">
            {ROADMAP_PAGE.header.description}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-foreground/10 bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                {ROADMAP_PAGE.meta.level}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {course.level}
              </p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                {ROADMAP_PAGE.meta.lectures}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {course.lectures.length} {ROADMAP_PAGE.lectureCountSuffix}
              </p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                {ROADMAP_PAGE.meta.progress}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {progress}
                {ROADMAP_PAGE.progressSuffix}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <SectionHeading
            eyebrow={ROADMAP_PAGE.steps.eyebrow}
            title={ROADMAP_PAGE.steps.title}
            description={ROADMAP_PAGE.steps.description}
          />
          <div className="relative space-y-6 border-l border-dashed border-foreground/20 pl-8">
            {sortedLectures.map((lecture) => (
              <div key={lecture.id} className="relative">
                <span className="absolute -left-[11px] top-8 h-5 w-5 rounded-full border border-foreground/20 bg-background" />
                <LectureCard
                  lecture={lecture}
                  labels={ROADMAP_PAGE.lecture}
                  resources={[
                    {
                      label: ROADMAP_PAGE.lecture.resources.video,
                      href: lecture.videoUrl,
                    },
                    {
                      label: ROADMAP_PAGE.lecture.resources.notes,
                      href: lecture.notesUrl,
                    },
                    {
                      label: ROADMAP_PAGE.lecture.resources.quiz,
                      href: lecture.quizUrl ?? "",
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
