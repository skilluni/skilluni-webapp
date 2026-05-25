import Link from "next/link";
import { HEADER, SITE } from "../../constants/site";
import { NAV_LINKS } from "../../constants/nav";
import ButtonLink from "../ui/ButtonLink";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={SITE.homeHref} className="text-lg font-semibold text-foreground">
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/70 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink
            href={HEADER.cta.href}
            label={HEADER.cta.label}
            size="md"
          />
        </div>
      </div>
    </header>
  );
}
