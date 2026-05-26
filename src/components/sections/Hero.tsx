"use client";

import { useEffect, useRef } from "react";
import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

export default function Hero() {
  const { hero } = HOME;
  const sectionRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      const introItems = gsap.utils.toArray<HTMLElement>(
        "[data-hero-intro]",
        sectionRef.current
      );
      const highlightItems = gsap.utils.toArray<HTMLElement>(
        "[data-hero-highlight]",
        sectionRef.current
      );
      const previewSteps = gsap.utils.toArray<HTMLElement>(
        "[data-hero-step]",
        sectionRef.current
      );

      gsap.fromTo(
        introItems,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.12,
        }
      );

      gsap.fromTo(
        highlightItems,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.3,
        }
      );

      if (previewRef.current) {
        gsap.fromTo(
          previewRef.current,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          }
        );

        gsap.to(previewRef.current, {
          y: -10,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      gsap.fromTo(
        previewSteps,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.4,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(226,232,240,0.7)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.12)_0%,rgba(255,255,255,0)_65%)]" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.2)_0%,rgba(255,255,255,0)_65%)]" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div
            data-hero-intro
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/70"
          >
            {hero.eyebrow}
          </div>
          <h1
            data-hero-intro
            className="max-w-xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl"
          >
            {hero.title}
          </h1>
          <p
            data-hero-intro
            className="max-w-xl text-base leading-7 text-foreground/70 md:text-lg"
          >
            {hero.description}
          </p>
          <div data-hero-intro className="flex flex-wrap gap-4">
            <ButtonLink
              href={hero.primaryCta.href}
              label={hero.primaryCta.label}
              size="lg"
            />
            <ButtonLink
              href={hero.secondaryCta.href}
              label={hero.secondaryCta.label}
              size="lg"
              variant="ghost"
              isExternal={hero.secondaryCta.isExternal}
            />
          </div>
          <ul className="grid gap-3 text-sm text-foreground/70 md:grid-cols-2">
            {hero.highlights.map((item) => (
              <li
                key={item}
                data-hero-highlight
                className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background/80 px-4 py-3"
              >
                <span className="mt-2 h-2 w-2 rounded-full bg-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          ref={previewRef}
          className="rounded-3xl border border-foreground/10 bg-white/70 p-8 shadow-[0_25px_70px_-45px_rgba(0,0,0,0.55)] backdrop-blur dark:bg-neutral-900/60"
        >
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
              {hero.preview.title}
            </p>
            <h3 className="text-2xl font-semibold text-foreground">
              {hero.preview.description}
            </h3>
            <div className="space-y-3">
              {hero.preview.steps.map((step, index) => (
                <div
                  key={step}
                  data-hero-step
                  className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm"
                >
                  <span className="text-foreground/80">{step}</span>
                  <span className="text-xs font-semibold text-foreground/60">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
