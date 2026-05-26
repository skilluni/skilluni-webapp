"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import { METRICS } from "../../constants/metrics";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

export default function Metrics() {
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
        "[data-metric-card]",
        sectionRef.current
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
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={HOME.sectionIds.metrics}
      className="border-y border-foreground/10 bg-foreground/2 py-20 md:py-28"
      ref={sectionRef}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <SectionHeading
          eyebrow={HOME.metrics.eyebrow}
          title={HOME.metrics.title}
          description={HOME.metrics.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              data-metric-card
              className="rounded-3xl border border-foreground/10 bg-white/70 p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur dark:bg-neutral-900/60"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
