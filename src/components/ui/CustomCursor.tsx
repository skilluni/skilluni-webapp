"use client";

import { useEffect, useRef } from "react";

const MAGNETIC_SELECTOR = "[data-magnetic]";
const LINK_CURSOR_SELECTOR = "[data-cursor='link']";
const VIEW_CURSOR_SELECTOR = "[data-cursor='view']";
const HIDE_CURSOR_SELECTOR = "[data-cursor='hide']";
const FORM_CONTROL_SELECTOR = "input, textarea, select";

type Particle = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
};

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });
  const particles = useRef<Particle[]>([]);
  const lastParticle = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canHover.matches || reduceMotion.matches) {
      return;
    }

    document.body.classList.add("has-custom-cursor");

    const onMove = (event: PointerEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY };
    };

    const onHoverUpdate = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const isCursorTarget =
        target?.closest(LINK_CURSOR_SELECTOR) ||
        target?.closest(VIEW_CURSOR_SELECTOR);
      const shouldHide =
        target?.closest(HIDE_CURSOR_SELECTOR) ||
        target?.closest(FORM_CONTROL_SELECTOR);

      if (shouldHide) {
        document.body.classList.add("cursor-hidden");
        return;
      }

      if (isCursorTarget) {
        document.body.classList.remove("cursor-hidden");
        return;
      }

      document.body.classList.remove("cursor-hidden");
    };

    const magnetEls = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR);
    const linkEls = document.querySelectorAll<HTMLElement>(LINK_CURSOR_SELECTOR);
    const viewEls = document.querySelectorAll<HTMLElement>(VIEW_CURSOR_SELECTOR);
    const cleanupFns: (() => void)[] = [];

    magnetEls.forEach((el) => {
      const onEnter = () => document.body.classList.add("cursor-magnetic");
      const onLeave = () => {
        document.body.classList.remove("cursor-magnetic");
        el.style.transform = "";
      };
      const onMoveMagnet = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${dx * 0.35}px, ${dy * 0.35}px)`;
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mousemove", onMoveMagnet as EventListener);

      cleanupFns.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mousemove", onMoveMagnet as EventListener);
      });
    });

    linkEls.forEach((el) => {
      const text = el.getAttribute("data-cursor-text") ?? "GO";
      const onEnter = () => {
        document.body.classList.add("cursor-link");
        if (textRef.current) {
          textRef.current.textContent = text;
        }
      };
      const onLeave = () => document.body.classList.remove("cursor-link");

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      cleanupFns.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    viewEls.forEach((el) => {
      const onEnter = () => document.body.classList.add("cursor-view");
      const onLeave = () => document.body.classList.remove("cursor-view");
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      cleanupFns.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    const spawnParticle = (x: number, y: number) => {
      const el = document.createElement("div");
      el.style.cssText =
        "position:fixed;width:4px;height:4px;border-radius:50%;" +
        "background:rgba(255,255,255,0.3);pointer-events:none;" +
        `z-index:9997;transform:translate(-50%,-50%);left:${x}px;top:${y}px`;
      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.4;
      particles.current.push({
        el,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 0.5,
      });
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      const { x: mx, y: my } = mouse.current;
      dot.current.x = lerp(dot.current.x, mx, 0.6);
      dot.current.y = lerp(dot.current.y, my, 0.6);
      ring.current.x = lerp(ring.current.x, mx, 0.11);
      ring.current.y = lerp(ring.current.y, my, 0.11);

      if (dotRef.current) {
        dotRef.current.style.left = `${dot.current.x}px`;
        dotRef.current.style.top = `${dot.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      if (textRef.current) {
        textRef.current.style.left = `${ring.current.x}px`;
        textRef.current.style.top = `${ring.current.y}px`;
      }

      const now = Date.now();
      const moved =
        Math.abs(mx - dot.current.x) > 1.5 ||
        Math.abs(my - dot.current.y) > 1.5;
      if (now - lastParticle.current > 45 && moved) {
        spawnParticle(dot.current.x, dot.current.y);
        lastParticle.current = now;
      }

      for (let i = particles.current.length - 1; i >= 0; i -= 1) {
        const particle = particles.current[i];
        particle.x += (particle.vx *= 0.9);
        particle.y += (particle.vy *= 0.9);
        particle.alpha -= 0.03;
        particle.el.style.left = `${particle.x}px`;
        particle.el.style.top = `${particle.y}px`;
        particle.el.style.opacity = `${particle.alpha}`;
        particle.el.style.transform =
          `translate(-50%,-50%) scale(${particle.alpha * 2})`;
        if (particle.alpha <= 0) {
          particle.el.remove();
          particles.current.splice(i, 1);
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onHoverUpdate, true);
    document.addEventListener("pointerout", onHoverUpdate, true);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      document.body.classList.remove("cursor-hidden");
      document.body.classList.remove("cursor-magnetic");
      document.body.classList.remove("cursor-link");
      document.body.classList.remove("cursor-view");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onHoverUpdate, true);
      document.removeEventListener("pointerout", onHoverUpdate, true);
      cancelAnimationFrame(rafId.current);
      cleanupFns.forEach((fn) => fn());
      particles.current.forEach((particle) => particle.el.remove());
      particles.current = [];
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={textRef} className="cursor-label" />
    </>
  );
}