"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

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
      className="border-y border-foreground/10 bg-foreground/2 py-20 md:py-28"
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
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map(({ data, spotlight }) => (
            <div
              key={block.title}
              data-about-card
              className="rounded-3xl border border-foreground/10 bg-white/70 p-7 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur dark:bg-neutral-900/60"
            >
              <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>
                {data.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {data.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-body" style={{ color: spotlight ? 'rgba(255,255,255,0.85)' : 'var(--color-ink-muted)' }}>
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: spotlight ? 'rgba(255,255,255,0.5)' : 'var(--color-gradient-orange)' }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
