"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

export default function CTA() {
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
      const panel = gsap.utils.toArray<HTMLElement>(
        "[data-cta-panel]",
        sectionRef.current
      );

      gsap.fromTo(
        panel,
        { y: 24, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={HOME.sectionIds.cta}
      className="py-20 md:py-28 bg-canvas"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          data-cta-panel
          className="relative overflow-hidden rounded-[20px] border border-hairline bg-surface-1 p-10 text-center md:p-14"
        >
          <h2 className="text-display-lg text-ink font-semibold tracking-[-0.03em]">
            {HOME.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-ink-muted leading-relaxed">
            {HOME.cta.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink
              href={HOME.cta.primaryCta.href}
              label={HOME.cta.primaryCta.label}
              size="lg"
              cursorText="Join"
              dataCursor="link"
              isMagnetic
            />
            <ButtonLink
              href={HOME.cta.secondaryCta.href}
              label={HOME.cta.secondaryCta.label}
              size="lg"
              variant="secondary"
              isMagnetic
            />
          </div>
        </div>
      </div>
    </section>
  );
}
