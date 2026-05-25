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
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.2)_0%,rgba(255,255,255,0)_70%)]" />
      </div>
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
            variant="ghost"
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
