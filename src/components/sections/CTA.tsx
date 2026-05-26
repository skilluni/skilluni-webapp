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
      className="py-20 md:py-28"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          data-cta-panel
          className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/3 p-10 text-center md:p-14"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(148,163,184,0.25)_0%,rgba(255,255,255,0)_60%)]" />
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {HOME.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-foreground/70 md:text-lg">
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
              variant="ghost"
              isMagnetic
            />
          </div>
        </div>
      </div>
    </section>
  );
}
