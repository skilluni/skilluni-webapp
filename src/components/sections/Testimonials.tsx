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

// Extended Testimonial interface
interface ExtTestimonial {
  id: any;
  name: string;
  comment: string;
  rating: number;
  role?: string;
  avatarUrl?: string;
  avatar_url?: string;
  source?: string;
}

function TestimonialCard({ item }: { item: ExtTestimonial }) {
  // Get initials for the avatar
  const initials = item.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  // Compute a numeric ID from string or number for gradient selection
  const numericId = typeof item.id === "number"
    ? item.id
    : String(item.id).split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  
  // Assign avatar gradient based on testimonial ID
  const avatarBg = AVATAR_GRADIENTS[numericId % AVATAR_GRADIENTS.length];
  
  const resolvedAvatar = item.avatar_url || item.avatarUrl;
  const resolvedRole = item.role || (item.source === "youtube" ? "YouTube Student" : "Student");

  return (
    <div
      className="w-[260px] sm:w-[300px] min-h-[300px] sm:min-h-[350px] shrink-0 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.7)] group cursor-pointer"
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
              className="w-4 h-4 transition-transform group-hover:scale-110"
              style={{ color: "#facc15" }}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Comment/Quote - Vertical long display */}
        <p
          className="text-body italic mb-6 font-sans leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          &ldquo;{item.comment}&rdquo;
        </p>
      </div>

      {/* User Information */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5 mt-auto min-w-0">
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          {/* Avatar with spotlight gradient */}
          {resolvedAvatar ? (
            <img
              src={resolvedAvatar}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              onError={(e) => {
                // Fallback to initials if image loading fails
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-button font-semibold select-none shadow-none shrink-0 ${avatarBg}`}
              style={{ color: "#ffffff" }}
            >
              {initials}
            </div>
          )}

          {/* Name and Role */}
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span
              className="text-body-sm font-semibold truncate"
              style={{ color: "var(--color-ink)" }}
              title={item.name}
            >
              {item.name}
            </span>
            <span
              className="text-caption mt-0.5 truncate"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {resolvedRole}
            </span>
          </div>
        </div>

        {/* YouTube icon in primary text color */}
        {item.source === "youtube" && (
          <div
            className="opacity-70 group-hover:opacity-100 transition shrink-0 select-none ml-2"
            style={{ color: "var(--color-ink)" }}
            title="Imported from YouTube"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

type TestimonialsProps = {
  initialTestimonials?: ExtTestimonial[];
};

export default function Testimonials({ initialTestimonials }: TestimonialsProps) {
  // Use DB testimonials if available and not empty, otherwise default to constant list
  const baseList = initialTestimonials && initialTestimonials.length > 0
    ? initialTestimonials
    : TESTIMONIALS;

  // Duplicate items for continuous seamless horizontal marquee loop
  const marqueeItems = baseList.length < 6
    ? [...baseList, ...baseList, ...baseList, ...baseList]
    : [...baseList, ...baseList];

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
      </div>

      {/* Single Row Horizontal Marquee Container */}
      <div className="relative mt-16 w-full overflow-hidden">
        {/* Left Edge Gradient Fade Overlay */}
        <div
          className="absolute top-0 bottom-0 left-0 w-16 sm:w-36 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, var(--color-canvas) 0%, transparent 100%)",
          }}
        />

        {/* Right Edge Gradient Fade Overlay */}
        <div
          className="absolute top-0 bottom-0 right-0 w-16 sm:w-36 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, var(--color-canvas) 0%, transparent 100%)",
          }}
        />

        {/* Horizontal Marquee Track */}
        <div className="flex gap-6 w-max py-4 animate-marquee-horizontal hover-pause">
          {marqueeItems.map((item, idx) => (
            <TestimonialCard key={`testimonial-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
