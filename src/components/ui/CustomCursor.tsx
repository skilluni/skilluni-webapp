"use client";

import { useEffect, useRef } from "react";

// ─── Selectors ──────────────────────────────────────────────────────────────
const MAGNETIC_SELECTOR = "[data-magnetic]";
const LINK_CURSOR_SELECTOR = "[data-cursor='link']";
const VIEW_CURSOR_SELECTOR = "[data-cursor='view']";
const HIDE_CURSOR_SELECTOR = "[data-cursor='hide']";

// Anything that should trigger the cursor states (retained for body classes)
const CLICKABLE_SELECTOR =
  "a, button, [role='button'], [data-cursor='link'], label[for], summary, [onclick]";

// Anything that should trigger text styles
const EDITABLE_SELECTOR = "input, textarea, [contenteditable='true']";

// ─── Cursor mode enum ───────────────────────────────────────────────────────
type CursorMode = "default" | "link" | "text" | "view" | "magnetic" | "hidden";

// ─── SVG shapes ─────────────────────────────────────────────────────────────
// Modern filled arrowhead (default pointer)
const ARROW_SVG = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.5 1L6.5 20L9.5 12.5L18 10L1.5 1Z" fill="white" stroke="rgba(0,0,0,0.25)" stroke-width="1" stroke-linejoin="round"/>
</svg>`;

export default function CustomCursor() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const arrow = useRef({ x: -100, y: -100 });
  const modeRef = useRef<CursorMode>("default");
  const rafId = useRef(0);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canHover.matches || reduceMotion.matches) return;

    document.body.classList.add("has-custom-cursor");

    // ── Helpers ────────────────────────────────────────────────────────────
    const setMode = (mode: CursorMode) => {
      if (modeRef.current === mode) return;
      // Remove all previous mode classes
      document.body.classList.remove(
        "cursor-hidden", "cursor-link", "cursor-text",
        "cursor-view", "cursor-magnetic",
      );
      modeRef.current = mode;
      if (mode !== "default") {
        document.body.classList.add(`cursor-${mode}`);
      }
    };

    // Set SVG
    if (arrowRef.current) {
      arrowRef.current.innerHTML = ARROW_SVG;
    }

    // ── Pointer tracking ──────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
        mouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    // ── Hover detection ───────────────────────────────────────────────────
    const resolveMode = (target: any): CursorMode => {
      if (!target || typeof target.closest !== "function") return "default";
      try {
        if (target.closest(HIDE_CURSOR_SELECTOR)) return "hidden";
        if (target.closest(EDITABLE_SELECTOR)) return "text";
        if (target.closest(VIEW_CURSOR_SELECTOR)) return "view";
        if (target.closest(MAGNETIC_SELECTOR)) return "magnetic";
        if (target.closest(CLICKABLE_SELECTOR)) return "link";
      } catch (err) {
        console.error("CustomCursor resolveMode error:", err);
      }
      return "default";
    };

    const onHover = (e: Event) => {
      setMode(resolveMode(e.target));
    };

    // ── Magnetic elements ─────────────────────────────────────────────────
    const magnetEls = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR);
    const cleanupFns: (() => void)[] = [];

    magnetEls.forEach((el) => {
      const onMoveMagnet = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${dx * 0.35}px, ${dy * 0.35}px)`;
      };
      const onLeave = () => { el.style.transform = ""; };

      el.addEventListener("mousemove", onMoveMagnet as EventListener);
      el.addEventListener("mouseleave", onLeave);
      cleanupFns.push(() => {
        el.removeEventListener("mousemove", onMoveMagnet as EventListener);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    // ── Animation loop ────────────────────────────────────────────────────
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      const { x: mx, y: my } = mouse.current;

      if (!isNaN(mx) && !isNaN(my)) {
        // Arrow follows tightly
        arrow.current.x = lerp(arrow.current.x, mx, 0.8);
        arrow.current.y = lerp(arrow.current.y, my, 0.8);

        if (arrowRef.current) {
          // GPU accelerated translate3d with the default arrowhead offset (-2, -1) built in
          arrowRef.current.style.transform = `translate3d(${arrow.current.x - 2}px, ${arrow.current.y - 1}px, 0)`;
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onHover, true);
    document.addEventListener("pointerout", onHover, true);

    return () => {
      document.body.classList.remove(
        "has-custom-cursor", "cursor-hidden", "cursor-link",
        "cursor-text", "cursor-view", "cursor-magnetic",
      );
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onHover, true);
      document.removeEventListener("pointerout", onHover, true);
      cancelAnimationFrame(rafId.current);
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={arrowRef} className="cursor-arrow" />
  );
}