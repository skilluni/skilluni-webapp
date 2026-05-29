"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import { METRICS } from "../../constants/metrics";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

const SPOTLIGHT_VARIANTS = [
  '', // surface-1
  'gradient-spotlight-violet',
  '', // surface-1
  'gradient-spotlight-magenta',
];

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
      className="border-y border-hairline bg-canvas py-20 md:py-28"
      ref={sectionRef}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <SectionHeading
          eyebrow={HOME.metrics.eyebrow}
          title={HOME.metrics.title}
          description={HOME.metrics.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {METRICS.map((metric, index) => {
            const variant = SPOTLIGHT_VARIANTS[index % SPOTLIGHT_VARIANTS.length];
            const isSpotlight = !!variant;

            return (
              <div
                key={metric.label}
                data-metric-card
                className={
                  isSpotlight
                    ? `rounded-[20px] p-8 ${variant} text-white relative overflow-hidden flex flex-col justify-center gap-1 h-36`
                    : "rounded-[20px] border border-hairline bg-surface-1 p-8 flex flex-col justify-center gap-1 h-36"
                }
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: isSpotlight ? "rgba(255, 255, 255, 0.8)" : "var(--color-ink-muted)" }}
                >
                  {metric.label}
                </p>
                <p className="text-display-md text-ink leading-tight">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
