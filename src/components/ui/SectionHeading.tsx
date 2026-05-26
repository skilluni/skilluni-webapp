type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow ? (
        <p className="text-caption uppercase tracking-[0.2em]" style={{ color: 'var(--color-ink-muted)' }}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-display-lg" style={{ color: 'var(--color-ink)' }}>
        {title}
      </h2>
      {description ? (
        <p className="text-body-lg" style={{ color: 'var(--color-ink-muted)' }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
