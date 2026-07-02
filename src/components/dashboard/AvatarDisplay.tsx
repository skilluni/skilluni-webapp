"use client";

type AvatarDisplayProps = {
  name: string;
  size?: number;
  className?: string;
};

const SPOTLIGHT_CLASSES = [
  "gradient-spotlight-violet",
  "gradient-spotlight-magenta",
  "gradient-spotlight-orange",
  "gradient-spotlight-coral",
];

export default function AvatarDisplay({
  name,
  size = 64,
  className = "",
}: AvatarDisplayProps) {
  const resolvedName = name || "User";
  const initial = resolvedName.trim().charAt(0).toUpperCase();
  
  // Hash the name to consistently assign a random spotlight gradient class
  const hash = resolvedName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const spotlightClass = SPOTLIGHT_CLASSES[hash % SPOTLIGHT_CLASSES.length];

  // Calculate dynamic font size based on the specified width/height
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${spotlightClass} ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-full)", // Override the standard xxs/xxl radius to force a perfect circle
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        lineHeight: 1,
        color: "#ffffff",
        textShadow: "0 1.5px 3px rgba(0, 0, 0, 0.3)",
      }}
    >
      {initial}
    </div>
  );
}
