"use client";

import { HOME } from "../../constants/home";
import { TESTIMONIALS, Testimonial } from "../../constants/testimonials";
import SectionHeading from "../ui/SectionHeading";

// Avatar colors inspired by the Framer atmosphere spotlights
const AVATAR_GRADIENTS = [
  "gradient-spotlight-violet",
  "gradient-spotlight-magenta",
  "gradient-spotlight-orange",
  "gradient-spotlight-coral",
];

function TestimonialCard({ item }: { item: Testimonial }) {
  // Get initials for the avatar
  const initials = item.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  // Assign avatar gradient based on testimonial ID
  const avatarBg = AVATAR_GRADIENTS[item.id % AVATAR_GRADIENTS.length];

  return (
    <div
      className="card-hover p-6 flex flex-col justify-between"
      style={{
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-hairline)",
      }}
    >
      <div>
        {/* Star Rating Badge */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: item.rating }).map((_, i) => (
            <svg
              key={i}
              className="w-4 h-4"
              style={{ color: "var(--color-gradient-orange)" }}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Comment/Quote */}
        <p
          className="text-body italic mb-6 font-sans leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          &ldquo;{item.comment}&rdquo;
        </p>
      </div>

      {/* User Information */}
      <div className="flex items-center gap-3">
        {/* Avatar with spotlight gradient */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-button font-semibold select-none shadow-none ${avatarBg}`}
          style={{ color: "#ffffff" }}
        >
          {initials}
        </div>

        {/* Name and Role */}
        <div className="flex flex-col">
          <span
            className="text-body-sm font-semibold"
            style={{ color: "var(--color-ink)" }}
          >
            {item.name}
          </span>
          <span
            className="text-caption mt-0.5"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {item.role}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  // Distribute testimonials evenly into 3 separate columns
  const col1 = TESTIMONIALS.filter((_, idx) => idx % 3 === 0);
  const col2 = TESTIMONIALS.filter((_, idx) => idx % 3 === 1);
  const col3 = TESTIMONIALS.filter((_, idx) => idx % 3 === 2);

  // Duplicate items in each column to enable smooth and seamless looping
  const col1Doubled = [...col1, ...col1];
  const col2Doubled = [...col2, ...col2];
  const col3Doubled = [...col3, ...col3];

  return (
    <section
      id={HOME.sectionIds.testimonials}
      className="py-20 md:py-28 overflow-hidden"
      style={{ background: "var(--color-canvas)" }}
    >
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center">
        {/* Section Heading centered */}
        <SectionHeading
          eyebrow={HOME.testimonials.eyebrow}
          title={HOME.testimonials.title}
          description={HOME.testimonials.description}
          align="center"
        />

        {/* Testimonials Vertical Marquee Container */}
        <div className="relative mt-16 w-full h-[650px] overflow-hidden mask-fade-vertical">
          {/* Top Gradient Fade Overlay */}
          <div
            className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, var(--color-canvas) 0%, transparent 100%)",
            }}
          />

          {/* Bottom Gradient Fade Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, var(--color-canvas) 0%, transparent 100%)",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full items-start">
            
            {/* Column 1 (Fast scroll - always visible) */}
            <div className="flex flex-col gap-6 animate-marquee-fast hover-pause">
              {col1Doubled.map((item, idx) => (
                <TestimonialCard key={`col1-${item.id}-${idx}`} item={item} />
              ))}
            </div>

            {/* Column 2 (Medium scroll - visible on tablet & desktop) */}
            <div className="hidden md:flex flex-col gap-6 animate-marquee-medium hover-pause">
              {col2Doubled.map((item, idx) => (
                <TestimonialCard key={`col2-${item.id}-${idx}`} item={item} />
              ))}
            </div>

            {/* Column 3 (Slow scroll - visible on desktop only) */}
            <div className="hidden lg:flex flex-col gap-6 animate-marquee-slow hover-pause">
              {col3Doubled.map((item, idx) => (
                <TestimonialCard key={`col3-${item.id}-${idx}`} item={item} />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
