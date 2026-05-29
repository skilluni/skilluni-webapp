"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

const PAIRS = [
  {
    num: "01",
    problem: "Resources are scattered across multiple places",
    solution: "A visual roadmap keeps everything organized in one clear pathway.",
  },
  {
    num: "02",
    problem: "Many students cannot run Java locally on a laptop",
    solution: "Interactive web quizzes and checklists let you learn on any device.",
  },
  {
    num: "03",
    problem: "Lecture watching lacks quizzes for immediate practice",
    solution: "Each lecture bundles video lessons, handwritten notes, and instant quizzes.",
  },
  {
    num: "04",
    problem: "Learning alone makes it easy to lose momentum",
    solution: "Track personal progress, check off finished items, and stay accountable.",
  },
];

export default function AboutUs() {
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
      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-about-card]",
        sectionRef.current
      );
      const heading = gsap.utils.toArray<HTMLElement>(
        "[data-about-heading]",
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
        { y: 24, opacity: 0 },
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
      id={HOME.sectionIds.about}
      className="border-y border-hairline bg-canvas py-20 md:py-28"
      ref={sectionRef}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <div data-about-heading>
          <SectionHeading
            eyebrow={HOME.about.eyebrow}
            title={HOME.about.title}
            description={HOME.about.description}
          />
        </div>
        
        <div className="flex flex-col">
          {PAIRS.map((pair) => (
            <div
              key={pair.num}
              data-about-card
              className="grid gap-4 md:grid-cols-[1fr_auto_1.2fr] md:gap-12 items-start md:items-center py-10 border-t border-hairline-soft first:border-t-0"
            >
              {/* Problem Column */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#ff7a3d] uppercase">
                  Problem {pair.num}
                </span>
                <h4 className="text-headline text-ink/90 font-medium leading-snug tracking-[-0.015em]">
                  {pair.problem}
                </h4>
              </div>

              {/* Connector Arrow */}
              <div className="flex justify-start md:justify-center py-2 md:py-0">
                <span className="text-neutral-600 text-xl font-light hidden md:inline">
                  →
                </span>
                <span className="text-neutral-600 text-lg font-light md:hidden">
                  ↓
                </span>
              </div>

              {/* Solution Column */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#22c55e] uppercase">
                  Solution
                </span>
                <h4 className="text-headline text-white font-bold leading-snug tracking-[-0.015em] flex items-start gap-2">
                  <span className="text-[#22c55e] shrink-0 select-none">✓</span>
                  <span>{pair.solution}</span>
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
