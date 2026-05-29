import { notFound } from "next/navigation";
import { COURSES } from "../../../constants/courses";
import { ROADMAP_PAGE } from "../../../constants/roadmap";
import LectureCard from "../../../components/ui/LectureCard";
import SectionHeading from "../../../components/ui/SectionHeading";
import { getCourseChapters } from "../../../lib/chapters";

type CourseRoadmapPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

const SPOTLIGHT_COLORS = [
  { text: "#6a4cf5", border: "rgba(106, 76, 245, 0.2)", bg: "rgba(106, 76, 245, 0.08)" },
  { text: "#d44df0", border: "rgba(212, 77, 240, 0.2)", bg: "rgba(212, 77, 240, 0.08)" },
  { text: "#ff7a3d", border: "rgba(255, 122, 61, 0.2)", bg: "rgba(255, 122, 61, 0.08)" },
  { text: "#ff5577", border: "rgba(255, 85, 119, 0.2)", bg: "rgba(255, 85, 119, 0.08)" },
];

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

  // Group lectures into chapters dynamically
  const chapters = getCourseChapters(course.slug, course.lectures);

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

      {/* Lecture Timeline Grouped by Chapters */}
      <section className="py-20 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6">
          <SectionHeading
            eyebrow={ROADMAP_PAGE.steps.eyebrow}
            title={ROADMAP_PAGE.steps.title}
            description={ROADMAP_PAGE.steps.description}
          />

          <div className="space-y-16">
            {chapters.map((chapter, index) => {
              const spot = SPOTLIGHT_COLORS[index % SPOTLIGHT_COLORS.length];
              return (
                <div key={chapter.id} className="space-y-8">
                  {/* Chapter Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[var(--color-hairline-soft)]">
                    <div className="space-y-2">
                      <span 
                        className="inline-flex px-3 py-1 text-[11px] uppercase tracking-widest font-bold rounded-full"
                        style={{
                          color: spot.text,
                          borderColor: spot.border,
                          background: spot.bg,
                          borderWidth: '1px',
                        }}
                      >
                        Chapter {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
                        {chapter.title}
                      </h3>
                      <p className="text-body text-ink-muted max-w-3xl leading-relaxed">
                        {chapter.description}
                      </p>
                    </div>
                    <div
                      className="text-caption uppercase tracking-[0.2em] self-start md:self-center font-medium px-4 py-2 shrink-0"
                      style={{
                        background: 'var(--color-surface-1)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--color-hairline)',
                        color: 'var(--color-ink-muted)',
                      }}
                    >
                      {chapter.lectures.length} {chapter.lectures.length === 1 ? 'Lesson' : 'Lessons'}
                    </div>
                  </div>

                  {/* Chapter Lectures Timeline */}
                  {chapter.lectures.length > 0 ? (
                    <div className="relative pl-8 ml-4 border-l border-dashed border-[var(--color-hairline)] space-y-6">
                      {chapter.lectures.map((lecture) => (
                        <div key={lecture.id} className="relative">
                          <span
                            className="absolute -left-[42px] top-[30px] h-5 w-5 flex items-center justify-center transition-all duration-300"
                            style={{
                              borderRadius: 'var(--radius-full)',
                              border: '2px solid var(--color-hairline)',
                              background: 'var(--color-canvas)',
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: spot.text }} />
                          </span>
                          <LectureCard
                            lecture={lecture}
                            courseSlug={course.slug}
                            labels={ROADMAP_PAGE.lecture}
                            accentColor={spot.text}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-body-sm text-ink-muted italic pl-4">
                      No lessons available in this chapter yet.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
