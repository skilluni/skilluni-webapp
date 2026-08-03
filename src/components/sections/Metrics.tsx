"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import { METRICS } from "../../constants/metrics";
import SectionHeading from "../ui/SectionHeading";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

const SPOTLIGHT_VARIANTS = [
  'gradient-spotlight-violet',
  'gradient-spotlight-magenta',
  'gradient-spotlight-orange',
  'gradient-spotlight-coral',
];

type MetricItem = {
  label: string;
  value: string;
};

type MetricsProps = {
  initialMetrics?: MetricItem[];
};

export default function Metrics({ initialMetrics }: MetricsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const displayMetrics = initialMetrics || METRICS;

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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {displayMetrics.map((metric, index) => {
            const variant = SPOTLIGHT_VARIANTS[index % SPOTLIGHT_VARIANTS.length];
            const isSpotlight = !!variant;
            const cardRatioClass = index % 4 === 0 || index % 4 === 3 ? "col-span-1 sm:col-span-2" : "col-span-1 sm:col-span-3";

            const renderLabel = (label: string) => {
              const lower = label.toLowerCase();
              if (lower === "subscribers") {
                return (
                  <>
                    <span className="sm:hidden">Subs</span>
                    <span className="hidden sm:inline">Subscribers</span>
                  </>
                );
              }
              if (lower === "total views") {
                return (
                  <>
                    <span className="hidden sm:inline">Total </span>Views
                  </>
                );
              }
              if (lower === "video lessons") {
                return (
                  <>
                    <span className="hidden sm:inline">Video </span>Lessons
                  </>
                );
              }
              return label;
            };

            const renderValue = (value: string) => {
              const match = value.match(/^(.*?)\s*(lessons)$/i);
              if (match) {
                return (
                  <>
                    {match[1]}
                    <span className="hidden sm:inline"> {match[2]}</span>
                  </>
                );
              }
              return value;
            };

            return (
              <div
                key={metric.label}
                data-metric-card
                className={
                  isSpotlight
                    ? `rounded-[20px] p-8 ${variant} ${cardRatioClass} text-white relative overflow-hidden flex flex-col justify-center gap-1 h-36`
                    : `rounded-[20px] border border-hairline bg-surface-1 p-8 ${cardRatioClass} flex flex-col justify-center gap-1 h-36`
                }
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: isSpotlight ? "rgba(255, 255, 255, 0.8)" : "var(--color-ink-muted)" }}
                >
                  {renderLabel(metric.label)}
                </p>
                <p className="text-display-md text-ink leading-tight">
                  {renderValue(metric.value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
