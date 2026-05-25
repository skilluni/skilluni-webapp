import { COURSES } from "../../constants/courses";
import { HOME } from "../../constants/home";
import CourseCard from "../ui/CourseCard";
import ButtonLink from "../ui/ButtonLink";
import SectionHeading from "../ui/SectionHeading";

export default function CoursesSection() {
  return (
    <section
      id={HOME.sectionIds.courses}
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: 'var(--color-canvas)' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
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
        <div className="grid gap-6 md:grid-cols-2">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              ctaLabel={HOME.courses.ctaLabel}
              ctaHref={`${HOME.courses.ctaHref}/${course.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
