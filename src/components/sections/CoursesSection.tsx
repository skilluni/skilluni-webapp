"use client";

import { useEffect, useRef } from "react";
import { COURSES } from "../../constants/courses";
import { HOME } from "../../constants/home";
import { COURSES_PAGE } from "../../constants/coursesPage";
import CourseListCard from "../ui/CourseListCard";
import ButtonLink from "../ui/ButtonLink";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

export default function CoursesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      const heading = gsap.utils.toArray<HTMLElement>(
        "[data-courses-heading]",
        sectionRef.current
      );
      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-course-card]",
        sectionRef.current
      );

      gsap.fromTo(
        heading,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        cards,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={HOME.sectionIds.courses}
      className="relative overflow-hidden py-20 md:py-28"
      ref={sectionRef}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.2)_0%,rgba(255,255,255,0)_70%)]" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <div
          data-courses-heading
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
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
            <div key={course.id} data-course-card>
              <CourseCard
                course={course}
                ctaLabel={HOME.courses.ctaLabel}
                ctaHref={`${HOME.courses.ctaHref}/${course.slug}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

