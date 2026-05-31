import { COURSES_PAGE } from "../../constants/coursesPage";
import CourseListCard from "../../components/ui/CourseListCard";
import SectionHeading from "../../components/ui/SectionHeading";
import ButtonLink from "../../components/ui/ButtonLink";
import { getCourses } from "../../lib/db";

export default async function CoursesPage() {
  const courses = getCourses();
  return (
    <main className="flex-1" style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
      <section
        className="py-20 md:py-28"
        style={{ borderBottom: '1px solid var(--color-hairline-soft)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={COURSES_PAGE.hero.eyebrow}
            title={COURSES_PAGE.hero.title}
            description={COURSES_PAGE.hero.description}
          />
          <ButtonLink
            href={COURSES_PAGE.hero.primaryCta.href}
            label={COURSES_PAGE.hero.primaryCta.label}
            size="lg"
            cursorText="Join"
            dataCursor="link"
            isMagnetic
          />
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <SectionHeading
            eyebrow={COURSES_PAGE.list.eyebrow}
            title={COURSES_PAGE.list.title}
            description={COURSES_PAGE.list.description}
          />
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => {
              const meta = [
                {
                  label: COURSES_PAGE.card.metaLabels.level,
                  value: course.level,
                },
                {
                  label: COURSES_PAGE.card.metaLabels.lectures,
                  value: `${course.lectures.length}`,
                },
                {
                  label: COURSES_PAGE.card.metaLabels.access,
                  value: course.isPremium
                    ? COURSES_PAGE.card.accessLabels.premium
                    : COURSES_PAGE.card.accessLabels.free,
                },
              ];

              return (
                <CourseListCard
                  key={course.id}
                  course={course}
                  meta={meta}
                  ctaLabel={COURSES_PAGE.card.ctaLabel}
                  ctaHref={`${COURSES_PAGE.card.ctaHrefBase}/${course.slug}`}
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
