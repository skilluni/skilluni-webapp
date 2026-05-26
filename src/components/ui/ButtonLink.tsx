import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-white text-black hover:bg-neutral-200",
  secondary:
    "bg-[#141414] text-white hover:bg-[#1c1c1c]",
};

const SIZES = {
  sm: "h-9 px-4",
  md: "h-11 px-5",
  lg: "h-12 px-6",
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
    "inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97]",
    "rounded-[100px]",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const externalProps = isExternal
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
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
