import Link from "next/link";
import { FOOTER, SITE } from "../../constants/site";

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-background py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{SITE.name}</h3>
          <p className="text-sm leading-6 text-foreground/70">{FOOTER.note}</p>
        </div>
        {FOOTER.columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
              {column.title}
            </p>
            <ul className="space-y-2 text-sm text-foreground/70">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-foreground/10 px-6 pt-6 text-xs text-foreground/60 md:flex-row md:items-center md:justify-between">
        <p>{FOOTER.legal}</p>
        <div className="flex items-center gap-4">
          {FOOTER.social.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
