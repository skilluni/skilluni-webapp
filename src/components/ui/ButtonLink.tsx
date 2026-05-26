import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-foreground text-background hover:bg-neutral-900 dark:hover:bg-neutral-200",
  ghost:
    "border border-foreground/20 text-foreground hover:border-foreground/60 hover:bg-foreground/5",
};

const SIZES = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

type ButtonLinkProps = {
  href: string;
  label: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  isExternal?: boolean;
  dataCursor?: "link" | "view" | "hide";
  cursorText?: string;
  isMagnetic?: boolean;
};

export default function ButtonLink({
  href,
  label,
  variant = "primary",
  size = "md",
  className,
  isExternal,
  dataCursor = "link",
  cursorText,
  isMagnetic = false,
}: ButtonLinkProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-full font-medium transition-colors",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : undefined;

  return (
    <Link
      href={href}
      className={classes}
      data-cursor={dataCursor}
      data-cursor-text={cursorText ?? label}
      data-magnetic={isMagnetic ? "true" : undefined}
      {...externalProps}
    >
      {label}
    </Link>
  );
}
