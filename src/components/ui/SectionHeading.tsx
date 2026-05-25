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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-7 text-foreground/70 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
