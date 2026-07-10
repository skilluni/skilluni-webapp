"use client";

import { useEffect, useRef, useCallback } from "react";
import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";
import { useAuth } from "../providers/AuthProvider";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

/* ── SVG watermarks ─────────────────────────────────────────── */

const wmStyle: React.CSSProperties = {
  position: "absolute",
  width: "64%",
  height: "64%",
  opacity: 0.12,
  pointerEvents: "none",
  color: "#fff",
};

function QuizWatermark() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={wmStyle}>
      <path
        d="M60 10C32.4 10 10 32.4 10 60s22.4 50 50 50 50-22.4 50-50S87.6 10 60 10Zm0 80c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5Zm8.4-27.6c-2.2 1.6-3.4 3-3.4 5.6h-10c0-5.8 3.2-9.4 7-12.2 3.2-2.4 5-4 5-7.8 0-4.4-3.6-8-8-8s-8 3.6-8 8H41c0-9.8 8.2-18 18-18s18 8.2 18 18c0 6.2-4 10-8.6 14.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function NotesWatermark() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={wmStyle}>
      <path d="M90 15H40c-5.5 0-10 4.5-10 10v70c0 5.5 4.5 10 10 10h50c5.5 0 10-4.5 10-10V25c0-5.5-4.5-10-10-10ZM45 40h40v5H45v-5Zm40 20H45v-5h40v5Zm-10 15H45v-5h30v5Z" fill="currentColor" />
      <path d="M25 30v65c0 8.3 6.7 15 15 15h45c-1.8 3-5.2 5-8.8 5H40c-11 0-20-9-20-20V40c0-3.6 2-7 5-8.8V30Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function CodesWatermark() {
  return (
    <svg viewBox="0 0 120 120" fill="none" style={wmStyle}>
      <path d="M40 85 10 60l30-25 7 8.4L27.4 60 47 76.6 40 85ZM80 85l-7-8.4L92.6 60 73 43.4 80 35l30 25-30 25Z" fill="currentColor" />
      <rect x="55" y="20" width="10" height="80" rx="5" fill="currentColor" opacity="0.6" transform="rotate(15 60 60)" />
    </svg>
  );
}

/* ── Card data ──────────────────────────────────────────────── */

const FEATURE_CARDS = [
  {
    id: "quiz",
    title: "Quiz",
    description: "Test your knowledge with Quizzes.",
    gradient: "linear-gradient(160deg, #e05cf7 0%, #d44df0 35%, #a832c8 100%)",
    Watermark: QuizWatermark,
  },
  {
    id: "notes",
    title: "Notes",
    description: "Access lecture notes from YouTube video.",
    gradient: "linear-gradient(160deg, #8568ff 0%, #6a4cf5 35%, #4a2dd4 100%)",
    Watermark: NotesWatermark,
  },
  {
    id: "codes",
    title: "Codes",
    description: "Access Codes from YouTube video.",
    gradient: "linear-gradient(160deg, #ff9955 0%, #ff7a3d 35%, #e05a1a 100%)",
    Watermark: CodesWatermark,
  },
];

/* ── getRestingValues helper ── */
function getRestingValues(cardId: string) {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  const xOffset = width < 480 ? 55 : width < 640 ? 65 : width < 1024 ? 120 : 165;
  const yOffsetSide = width < 640 ? 6 : 8;
  const yOffsetCenter = width < 640 ? -4 : -6;
  const scaleSide = width < 640 ? 0.90 : 0.93;

  if (cardId === "quiz") {
    return { rotation: -8, scale: scaleSide, zIndex: 2, x: -xOffset, y: yOffsetSide };
  } else if (cardId === "codes") {
    return { rotation: 8, scale: scaleSide, zIndex: 2, x: xOffset, y: yOffsetSide };
  } else {
    return { rotation: 0, scale: 1, zIndex: 3, x: 0, y: yOffsetCenter };
  }
}

/* ── Style helpers ──────────────────────────────────────────── */

const upperStyle = (gradient: string): React.CSSProperties => ({
  flex: 2,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  overflow: "hidden",
  background: gradient,
});

const spotlightOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 40%, transparent 75%)",
  pointerEvents: "none",
};

const titleStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  fontFamily: "var(--font-display)",
  fontSize: 28,
  fontWeight: 600,
  color: "#fff",
  letterSpacing: -0.8,
  textShadow: "0 2px 12px rgba(0,0,0,0.25)",
  marginTop: "auto",
};

const lowerStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 16px",
  background: "linear-gradient(180deg, #f5f5f5 0%, #e4e4e4 100%)",
  display: "flex",
  alignItems: "flex-start",
};

const descStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 450,
  lineHeight: 1.4,
  letterSpacing: -0.1,
  color: "#333",
  margin: 0,
};

/* ── Component ──────────────────────────────────────────────── */

export default function Hero() {
  const { user } = useAuth();
  const { hero } = HOME;

  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverEnabled = useRef(false);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  /* ── Hover handlers ───────────────────────────────────────── */

  const handleMouseEnter = useCallback((cardId: string, el: HTMLDivElement) => {
    if (!hoverEnabled.current) return;
    gsap.to(el, {
      rotation: 0,
      scale: 1.04,
      zIndex: 10,
      y: -10,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  const handleMouseLeave = useCallback((cardId: string, el: HTMLDivElement) => {
    if (!hoverEnabled.current) return;
    const r = getRestingValues(cardId);
    gsap.to(el, {
      rotation: r.rotation,
      scale: r.scale,
      zIndex: r.zIndex,
      y: r.y,
      x: r.x,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  /* ── GSAP setup ───────────────────────────────────────────── */

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    registerGsapPlugins();

    const ctx = gsap.context(() => {
      /* ── Text intro stagger ───────────────────────────────── */
      const introItems = gsap.utils.toArray<HTMLElement>("[data-hero-intro]", sectionRef.current);
      gsap.fromTo(
        introItems,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", stagger: 0.12 }
      );

      const [quizCard, notesCard, codesCard] = cardRefs.current;
      if (!quizCard || !notesCard || !codesCard) return;

      /* ── Direct entrance fan-out animation on load (both desktop & mobile) ── */

      // Initial card state: stacked at center, invisible
      gsap.set([quizCard, notesCard, codesCard], {
        opacity: 0,
        scale: 0.82,
        rotation: 0,
        x: 0,
        y: 30,
        position: "absolute",
      });

      const tl = gsap.timeline({
        delay: 0.4,
        onComplete: () => {
          hoverEnabled.current = true;
        },
      });

      const restingQuiz = getRestingValues("quiz");
      const restingNotes = getRestingValues("notes");
      const restingCodes = getRestingValues("codes");

      // Phase 1: Center card (Notes) scales/fades in
      tl.to(
        notesCard,
        { opacity: 1, scale: 1, y: restingNotes.y, duration: 0.5, ease: "back.out(1.2)" },
        0.1
      );

      // Phase 2: Side cards fan out
      tl.to(
        quizCard,
        {
          opacity: 1,
          scale: restingQuiz.scale,
          y: restingQuiz.y,
          x: restingQuiz.x,
          rotation: restingQuiz.rotation,
          duration: 0.55,
          ease: "back.out(1.2)",
        },
        0.25
      );
      tl.to(
        codesCard,
        {
          opacity: 1,
          scale: restingCodes.scale,
          y: restingCodes.y,
          x: restingCodes.x,
          rotation: restingCodes.rotation,
          duration: 0.55,
          ease: "back.out(1.2)",
        },
        0.25
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--color-canvas)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "60px 24px 40px",
          gap: 20,
        }}
      >
        {/* ── Center-aligned text block ─────────────────────── */}
        <div
          ref={textRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            textAlign: "center",
            willChange: "transform",
          }}
        >


          <h1
            data-hero-intro
            className="text-display-xxl tracking-[-0.05em] text-ink"
            style={{ maxWidth: 700 }}
          >
            {hero.title}
          </h1>

          <p
            data-hero-intro
            className="text-body-lg text-ink-muted"
            style={{ maxWidth: 540 }}
          >
            {hero.description}
          </p>

          <div data-hero-intro className="flex flex-wrap justify-center gap-4" style={{ marginTop: 8 }}>
            {!user && (
              <ButtonLink
                href={hero.primaryCta.href}
                label={hero.primaryCta.label}
                size="lg"
              />
            )}
            <ButtonLink
              href={hero.secondaryCta.href}
              label={hero.secondaryCta.label}
              size="lg"
              variant="secondary"
              isExternal={hero.secondaryCta.isExternal}
            />
          </div>
        </div>

        {/* ── Cards stage ───────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 340,
          }}
        >
          {FEATURE_CARDS.map((card, index) => {
            const WatermarkIcon = card.Watermark;
            return (
              <div
                key={card.id}
                ref={setCardRef(index)}
                onMouseEnter={() => {
                  const el = cardRefs.current[index];
                  if (el) handleMouseEnter(card.id, el);
                }}
                onMouseLeave={() => {
                  const el = cardRefs.current[index];
                  if (el) handleMouseLeave(card.id, el);
                }}
                style={{
                  position: "absolute",
                  width: "var(--card-width)",
                  aspectRatio: "3 / 4",
                  borderRadius: 30,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow:
                    "0 20px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
                  willChange: "transform, opacity",
                  opacity: 0,
                  zIndex: index === 1 ? 3 : 2,
                  cursor: "pointer",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                {/* Upper ⅔ — spotlight gradient + watermark + title */}
                <div style={upperStyle(card.gradient)}>
                  <div style={spotlightOverlay} />
                  <WatermarkIcon />
                  <span style={titleStyle}>{card.title}</span>
                </div>

                {/* Lower ⅓ — light surface + description */}
                <div style={lowerStyle}>
                  <p style={descStyle}>{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
