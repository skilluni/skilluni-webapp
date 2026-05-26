import { COURSES } from "../../constants/courses";
import { HOME } from "../../constants/home";
import { COURSES_PAGE } from "../../constants/coursesPage";
import CourseListCard from "../ui/CourseListCard";
import ButtonLink from "../ui/ButtonLink";
import SectionHeading from "../ui/SectionHeading";

export default function CoursesSection() {
  return (
    <section
      id={HOME.sectionIds.courses}
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: 'var(--color-canvas)' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 relative">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={HOME.courses.eyebrow}
            title={HOME.courses.title}
            description={HOME.courses.description}
          />
          <ButtonLink
            href={HOME.courses.ctaHref}
            label={HOME.courses.ctaLabel}
            variant="secondary"
          />
        </div>

        {/* Horizontal Scrolling Row Container */}
        <div className="relative w-full">
          {/* Left fading gradient overlay for premium desktop touch */}
          <div 
            className="pointer-events-none absolute -left-2 top-0 bottom-0 w-8 md:w-16 z-10"
            style={{
              background: 'linear-gradient(to right, var(--color-canvas) 0%, transparent 100%)',
            }}
          />

          {/* Right fading gradient overlay for premium desktop touch */}
          <div 
            className="pointer-events-none absolute -right-2 top-0 bottom-0 w-8 md:w-16 z-10"
            style={{
              background: 'linear-gradient(to left, var(--color-canvas) 0%, transparent 100%)',
            }}
          />

          {/* Horizontally scrollable flex container */}
          <div 
            className="flex flex-row overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-6 pt-2 scrollbar-none"
            style={{
              scrollPaddingLeft: '4px',
              scrollPaddingRight: '4px'
            }}
          >
            {COURSES.map((course) => {
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
                <div 
                  key={course.id} 
                  className="w-[290px] xs:w-[330px] sm:w-[410px] flex-shrink-0 snap-start"
                >
                  <CourseListCard
                    course={course}
                    meta={meta}
                    ctaLabel={COURSES_PAGE.card.ctaLabel}
                    ctaHref={`${COURSES_PAGE.card.ctaHrefBase}/${course.slug}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

