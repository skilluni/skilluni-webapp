"use client";

import React, { useEffect, useState } from "react";

// ─── Timing constants ───────────────────────────────────────────────────────
const MIN_DURATION_MS   = 2000;
const ASSEMBLE_START    = 300;
const ASSEMBLE_STAGGER  = 100;
const PIECE_TRAVEL      = 500;

// ─── Only the 4 gradient spotlights from globals.css ────────────────────────
const GRADIENTS = [
  // violet  (gradient-spotlight-violet)
  "radial-gradient(circle at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 75%), #6a4cf5",
  // magenta (gradient-spotlight-magenta)
  "radial-gradient(circle at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 75%), #d44df0",
  // orange  (gradient-spotlight-orange)
  "radial-gradient(circle at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 75%), #ff7a3d",
  // coral   (gradient-spotlight-coral)
  "radial-gradient(circle at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 75%), #ff5577",
];

const DROP_SHADOWS = [
  "drop-shadow(0 6px 24px rgba(106,76,245,0.50))",   // violet
  "drop-shadow(0 6px 24px rgba(212,77,240,0.50))",    // magenta
  "drop-shadow(0 6px 24px rgba(255,122,61,0.50))",    // orange
  "drop-shadow(0 6px 24px rgba(255,85,119,0.50))",    // coral
];

// Color assignment per hex (indices into GRADIENTS) — no adjacent duplicates
const COLOR_MAP = [0, 1, 2, 0, 3, 1, 2];

// ─── Hexagon geometry ───────────────────────────────────────────────────────
const HEX_W = 74;
const HEX_H = 86;
const GAP   = 6;
const DX    = HEX_W + GAP;                // 80 px
const DY    = HEX_H * 0.75 + GAP * 0.5;   // ~67.5 px

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

// ─── Honeycomb grid (7 hexes, relative to centre) ───────────────────────────
//   Row 0  (2):  top-left,  top-right
//   Row 1  (3):  mid-left,  center,  mid-right
//   Row 2  (2):  bot-left,  bot-right
const GRID: { x: number; y: number }[] = [
  { x: -DX / 2, y: -DY },     // 0  top-left
  { x:  DX / 2, y: -DY },     // 1  top-right
  { x: -DX,     y:  0   },    // 2  mid-left
  { x:  0,      y:  0   },    // 3  center
  { x:  DX,     y:  0   },    // 4  mid-right
  { x: -DX / 2, y:  DY  },    // 5  bot-left
  { x:  DX / 2, y:  DY  },    // 6  bot-right
];

// ─── Scattered starting positions ───────────────────────────────────────────
const SCATTER: { x: number; y: number; rotate: number }[] = [
  { x: -155, y: -140, rotate:  22 },
  { x:  145, y: -155, rotate: -18 },
  { x: -175, y:    5, rotate: -14 },
  { x:    5, y:   15, rotate:  40 },
  { x:  185, y:   15, rotate: -28 },
  { x: -140, y:  140, rotate:  16 },
  { x:  155, y:  135, rotate: -10 },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface LoadingScreenProps {
  loading: boolean;
}

export default function LoadingScreen({ loading }: LoadingScreenProps) {
  const [canDismiss, setCanDismiss]     = useState(false);
  const [assembled, setAssembled]       = useState<boolean[]>(Array(7).fill(false));
  const [allAssembled, setAllAssembled] = useState(false);
  const [fadeOut, setFadeOut]           = useState(false);
  const [mounted, setMounted]           = useState(true);

  // ── Minimum 5-second gate ────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setCanDismiss(true), MIN_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  // ── Staggered assembly ───────────────────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < 7; i++) {
      timers.push(
        setTimeout(() => {
          setAssembled(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, ASSEMBLE_START + i * ASSEMBLE_STAGGER)
      );
    }

    // Mark fully assembled after last piece finishes travelling
    const lastDone = ASSEMBLE_START + 6 * ASSEMBLE_STAGGER + PIECE_TRAVEL;
    timers.push(setTimeout(() => setAllAssembled(true), lastDone));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Trigger fade-out when both ready ─────────────────────────────────────
  useEffect(() => {
    if (!loading && canDismiss && allAssembled) setFadeOut(true);
  }, [loading, canDismiss, allAssembled]);

  if (!mounted) return null;

  return (
    <div
      onTransitionEnd={() => { if (fadeOut) setMounted(false); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#090909",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        transition: "opacity 1000ms cubic-bezier(0.4,0,0.2,1)",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* ── Subtle dot grid ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.018,
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          pointerEvents: "none",
        }}
      />

      {/* ── Ambient glow behind the honeycomb ───────────────────── */}
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          background: "radial-gradient(circle, rgba(106,76,245,0.16) 0%, transparent 65%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          transition: `opacity ${PIECE_TRAVEL}ms ease`,
          opacity: allAssembled ? 0.9 : 0.35,
        }}
      />

      {/* ── Hexagonal puzzle pieces ─────────────────────────────── */}
      <div style={{ position: "relative", width: 0, height: 0 }}>
        {GRID.map((target, i) => {
          const scatter     = SCATTER[i];
          const isAssembled = assembled[i];
          const colorIdx    = COLOR_MAP[i];

          const tx  = isAssembled ? target.x : scatter.x;
          const ty  = isAssembled ? target.y : scatter.y;
          const rot = isAssembled ? 0 : scatter.rotate;
          const sc  = isAssembled ? 1 : 0.85;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${HEX_W}px`,
                height: `${HEX_H}px`,
                marginLeft: `-${HEX_W / 2}px`,
                marginTop: `-${HEX_H / 2}px`,
                filter: isAssembled ? DROP_SHADOWS[colorIdx] : "none",
                transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`,
                transition: isAssembled
                  ? `transform ${PIECE_TRAVEL}ms cubic-bezier(0.34,1.26,0.64,1), filter ${PIECE_TRAVEL}ms ease`
                  : "none",
                willChange: "transform",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  clipPath: HEX_CLIP,
                  background: GRADIENTS[colorIdx],
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Wordmark — appears once puzzle is solved ────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(32px, 6vh, 60px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          transition: `opacity ${PIECE_TRAVEL}ms ease, transform ${PIECE_TRAVEL}ms ease`,
          opacity: allAssembled ? 1 : 0,
          transform: allAssembled ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter','Inter Variable',system-ui,sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.4em",
            color: "#ffffff",
            textTransform: "uppercase",
            paddingLeft: "0.4em",
          }}
        >
          SKILLUNI
        </span>
        <span
          style={{
            fontFamily: "'Inter','Inter Variable',system-ui,sans-serif",
            fontSize: "9px",
            fontWeight: 400,
            letterSpacing: "0.18em",
            color: "#555555",
            textTransform: "uppercase",
            paddingLeft: "0.18em",
          }}
        >
          Interactive Learning Platform
        </span>
      </div>
    </div>
  );
}
