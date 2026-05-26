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
        <div
          className="animate-pulse-glow absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: '800px',
            height: '600px',
            background: 'radial-gradient(50% 50% at 50% 0%, rgba(106, 76, 245, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -right-32 top-1/4"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(212, 77, 240, 0.08) 0%, transparent 60%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left column */}
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
              variant="secondary"
              isExternal={hero.secondaryCta.isExternal}
            />
          </div>

          <ul className="animate-fade-in-up-delay-4 grid gap-3 md:grid-cols-2">
            {hero.highlights.map((item) => (
              <li
                key={item}
                data-hero-highlight
                className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background/80 px-4 py-3"
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: 'var(--color-gradient-violet)' }}
                />
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
            <p
              className="text-caption uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              {hero.preview.title}
            </p>
            <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>
              {hero.preview.description}
            </h3>
            <div className="space-y-3">
              {hero.preview.steps.map((step, index) => (
                <div
                  key={step}
                  data-hero-step
                  className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm"
                >
                  <span style={{ color: 'var(--color-ink-muted)' }}>{step}</span>
                  <span
                    className="flex h-6 w-6 items-center justify-center text-micro"
                    style={{
                      background: 'var(--color-canvas)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
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
