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
    <main className="flex-1" style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
      {/* Course Header */}
      <section
        className="py-20 md:py-28"
        style={{ borderBottom: '1px solid var(--color-hairline-soft)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6">
          <SectionHeading
            eyebrow={ROADMAP_PAGE.header.eyebrow}
            title={course.title}
            description={course.description}
          />
          <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
            {ROADMAP_PAGE.header.description}
          </p>

          {/* Meta Cards - Responsive Horizontal Row */}
          <div className="mt-4 flex flex-row gap-3 md:gap-4 w-full">
            {[
              { label: ROADMAP_PAGE.meta.level, value: course.level },
              { label: ROADMAP_PAGE.meta.lectures, value: `${course.lectures.length}` },
              { label: ROADMAP_PAGE.meta.progress, value: `${progress}${ROADMAP_PAGE.progressSuffix}` },
            ].map((meta) => (
              <div
                key={meta.label}
                className="flex-1 px-3 py-3 md:px-4 md:py-4 min-w-0 flex flex-col justify-between"
                style={{
                  background: 'var(--color-surface-1)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-hairline)',
                }}
              >
                <p className="text-[10px] md:text-caption uppercase tracking-[0.2em] truncate" style={{ color: 'var(--color-ink-muted)' }}>
                  {meta.label}
                </p>
                <p className="mt-2 text-sm md:text-headline truncate font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {meta.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lecture Timeline */}
      <section className="py-20 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <SectionHeading
            eyebrow={ROADMAP_PAGE.steps.eyebrow}
            title={ROADMAP_PAGE.steps.title}
            description={ROADMAP_PAGE.steps.description}
          />
          <div
            className="relative space-y-6 pl-8"
            style={{ borderLeft: '1px dashed var(--color-hairline)' }}
          >
            {sortedLectures.map((lecture) => (
              <div key={lecture.id} className="relative">
                <span
                  className="absolute -left-[11px] top-8 h-5 w-5"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--color-hairline)',
                    background: 'var(--color-surface-1)',
                  }}
                />
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
