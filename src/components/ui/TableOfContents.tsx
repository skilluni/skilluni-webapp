"use client";

import { useEffect, useState } from "react";
import type { DbChapter } from "../../lib/db";

const SPOTLIGHT_COLORS = [
  { text: "#6a4cf5", border: "rgba(106, 76, 245, 0.2)", bg: "rgba(106, 76, 245, 0.08)" },
  { text: "#d44df0", border: "rgba(212, 77, 240, 0.2)", bg: "rgba(212, 77, 240, 0.08)" },
  { text: "#ff7a3d", border: "rgba(255, 122, 61, 0.2)", bg: "rgba(255, 122, 61, 0.08)" },
  { text: "#ff5577", border: "rgba(255, 85, 119, 0.2)", bg: "rgba(255, 85, 119, 0.08)" },
];

type TableOfContentsProps = {
  chapters: DbChapter[];
  layout: "desktop" | "mobile";
};

export default function TableOfContents({ chapters, layout }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (chapters.length === 0) return;

    // Set first chapter as default active
    setActiveId(chapters[0].id);

    const observerOptions = {
      root: null,
      rootMargin: "-120px 0px -70% 0px", // Trigger when section is near top of viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entry that has scrolled into view
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort visible entries by top position to pick the highest one on the screen
        const highestEntry = visibleEntries.reduce((prev, current) => {
          return prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current;
        });
        setActiveId(highestEntry.target.id);
      }
    }, observerOptions);

    chapters.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [chapters]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // Smooth scroll using scrollIntoView
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (layout === "desktop") {
    return (
      <div className="space-y-6">
        <h4 className="text-caption uppercase tracking-[0.2em] font-semibold text-ink-muted px-4">
          Chapters
        </h4>
        <nav className="space-y-1">
          {chapters.map((chapter, index) => {
            const isActive = activeId === chapter.id;
            const spot = SPOTLIGHT_COLORS[index % SPOTLIGHT_COLORS.length];
            return (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                onClick={(e) => handleScrollTo(e, chapter.id)}
                className="group flex flex-col gap-1 py-3 px-4 rounded-xl transition-all duration-200 select-none border border-transparent"
                style={{
                  background: isActive ? "var(--color-surface-1)" : "transparent",
                  borderColor: isActive ? "var(--color-hairline)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: isActive ? spot.text : "var(--color-hairline)",
                      transform: isActive ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-200"
                    style={{
                      color: isActive ? spot.text : "var(--color-ink-muted)",
                    }}
                  >
                    Chapter {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="pl-3.5">
                  <p
                    className="text-body-sm font-semibold transition-colors duration-200 group-hover:text-ink"
                    style={{
                      color: isActive ? "var(--color-ink)" : "var(--color-ink-muted)",
                    }}
                  >
                    {chapter.title}
                  </p>
                  <p className="text-[11px] text-ink-muted/60 mt-0.5">
                    {chapter.lectures.length} {chapter.lectures.length === 1 ? "Lesson" : "Lessons"}
                  </p>
                </div>
              </a>
            );
          })}
        </nav>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="flex gap-2 w-full">
      {chapters.map((chapter, index) => {
        const isActive = activeId === chapter.id;
        const spot = SPOTLIGHT_COLORS[index % SPOTLIGHT_COLORS.length];
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            onClick={(e) => handleScrollTo(e, chapter.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 shrink-0 select-none"
            style={{
              background: isActive ? spot.bg : "var(--color-surface-1)",
              borderColor: isActive ? spot.text : "var(--color-hairline)",
              color: isActive ? spot.text : "var(--color-ink-muted)",
            }}
          >
            <span className="opacity-60">Ch. {index + 1}</span>
            <span>{chapter.title}</span>
          </a>
        );
      })}
    </div>
  );
}
