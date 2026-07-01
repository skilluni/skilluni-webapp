import { notFound } from "next/navigation";
import Link from "next/link";
import { ROADMAP_PAGE } from "../../../constants/roadmap";
import LectureCard from "../../../components/ui/LectureCard";
import SectionHeading from "../../../components/ui/SectionHeading";
import TableOfContents from "../../../components/ui/TableOfContents";
import { getCourseBySlug, getCourses } from "../../../lib/db";

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

  // Group lectures into chapters dynamically from the database
  const chapters = course.chapters;

  return (
    <main className="flex-1" style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
      {/* Course Header */}
      <section
        className="py-20 md:py-0 relative overflow-hidden md:min-h-[calc(100vh-4rem)] md:flex md:items-center"
        style={{ 
          borderBottom: '1px solid var(--color-hairline-soft)',
          background: `radial-gradient(120% 120% at 50% 0%, ${spotColor}26 0%, rgba(9, 9, 9, 0.8) 50%, rgba(9, 9, 9, 1) 100%)`
        }}
      >
        {/* Atmosphere spotlight aura */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] sm:w-[1000px] sm:h-[500px] rounded-full blur-[130px] pointer-events-none opacity-45"
          style={{
            background: `radial-gradient(circle, ${spotColor} 0%, transparent 70%)`,
          }}
        />

        {/* Hexagonal net overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='103.92' viewBox='0 0 60 103.92'%3E%3Cpath d='M0 0 L30 17.32 L60 0 M30 17.32 L30 51.96 M0 69.28 L30 51.96 L60 69.28 M0 69.28 L0 103.92 M60 69.28 L60 103.92' fill='none' stroke='%23ffffff' stroke-width='1.2'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 103.92px'
          }}
        />

        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 relative z-10 w-full">

          <SectionHeading
            eyebrow={ROADMAP_PAGE.header.eyebrow}
            title={course.title}
            description={course.description}
          />
          <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
            {ROADMAP_PAGE.header.description}
          </p>

          {/* Meta Cards - Responsive Grid Row */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
            {[
              { label: ROADMAP_PAGE.meta.level, value: course.level },
              { label: ROADMAP_PAGE.meta.lectures, value: `${course.lectures.length}` },
              { label: ROADMAP_PAGE.meta.progress, value: `${progress}${ROADMAP_PAGE.progressSuffix}`, isProgress: true },
            ].map((meta, index) => (
              <div
                key={meta.label}
                className={`${
                  index === 0 ? "col-span-2 md:col-span-1" : "col-span-1"
                } px-4 py-4 min-w-0 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--hover-spot)] group/card`}
                style={{
                  background: 'var(--color-surface-1)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-hairline)',
                  // @ts-ignore
                  '--hover-spot': `${spotColor}33`,
                }}
              >
                <p className="text-[10px] md:text-caption uppercase tracking-[0.2em] truncate" style={{ color: 'var(--color-ink-muted)' }}>
                  {meta.label}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 min-w-0">
                  <p className="text-sm md:text-headline truncate font-semibold" style={{ color: 'var(--color-ink)' }}>
                    {meta.value}
                  </p>
                  {meta.isProgress && (
                    /* Animated visual progress bar */
                    <div className="h-1.5 w-20 sm:w-24 rounded-full bg-white/10 overflow-hidden shrink-0 hidden sm:block">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${spotColor}, #ffffff)`
                        }}
                      />
                    </div>
                  )}
                </div>
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

          {/* Mobile TOC sticky bar */}
          <div className="lg:hidden sticky top-[64px] z-30 -mx-6 px-6 bg-canvas/85 backdrop-blur border-b border-hairline-soft py-3 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            <TableOfContents chapters={chapters} layout="mobile" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Desktop TOC sticky sidebar */}
            <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 self-start">
              <TableOfContents chapters={chapters} layout="desktop" />
            </aside>

            {/* Chapters list */}
            <div className="lg:col-span-3 space-y-16">
              {chapters.map((chapter, index) => {
                const spot = SPOTLIGHT_COLORS[index % SPOTLIGHT_COLORS.length];
                return (
                  <div key={chapter.id} id={chapter.id} className="space-y-8 scroll-mt-24">
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
                      <div className="relative pl-0 ml-0 md:pl-8 md:ml-4 border-l-0 md:border-l border-dashed border-[var(--color-hairline)] space-y-6">
                        {chapter.lectures.map((lecture) => (
                          <div key={lecture.id} className="relative">
                            <span
                              className="hidden md:flex absolute -left-[42px] top-[30px] h-5 w-5 items-center justify-center transition-all duration-300"
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
        </div>
      </section>
    </main>
  );
}
