"use client";

import { useEffect, useRef, useState } from "react";
import { COURSES } from "../../constants/courses";
import { HOME } from "../../constants/home";
import { COURSES_PAGE } from "../../constants/coursesPage";
import CourseListCard from "../ui/CourseListCard";
import ButtonLink from "../ui/ButtonLink";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

export default function CoursesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const itemsPerPage = mounted ? (isMobile ? 1 : 2) : 2;
  const maxIndex = Math.max(0, COURSES.length - itemsPerPage);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Ensure index remains in bounds when resizing
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [isMobile, maxIndex, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section
      id={HOME.sectionIds.courses}
      className="relative overflow-hidden py-20 md:py-28 bg-canvas border-b border-hairline-soft"
      ref={sectionRef}
    >
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
          <div className="flex items-center gap-4">
            <ButtonLink
              href={HOME.courses.ctaHref}
              label={HOME.courses.ctaLabel}
              variant="secondary"
            />
            {/* Carousel navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                disabled={!mounted || currentIndex === 0}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#141414] border border-hairline text-white hover:bg-[#1c1c1c] active:scale-[0.95] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                aria-label="Previous Course"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                disabled={!mounted || currentIndex === maxIndex}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#141414] border border-hairline text-white hover:bg-[#1c1c1c] active:scale-[0.95] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                aria-label="Next Course"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal sliding track wrapper */}
        <div className="relative overflow-hidden w-full -my-4 py-4">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [--items-per-page:1] md:[--items-per-page:2]"
            style={{
              transform: `translateX(calc(-100% * ${currentIndex} / var(--items-per-page)))`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                  data-course-card
                  className="w-full shrink-0 px-3 flex-[0_0_100%] md:flex-[0_0_50%]"
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

        {/* Pagination Dots */}
        {mounted && maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="py-3 px-2 flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 block ${
                    currentIndex === idx
                      ? "w-6 bg-white"
                      : "w-1.5 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

