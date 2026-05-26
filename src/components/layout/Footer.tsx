import Link from "next/link";
import { FOOTER, SITE } from "../../constants/site";

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-canvas)',
        borderTop: '1px solid var(--color-hairline-soft)',
        padding: '64px 32px',
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <h3
            className="text-display-md"
            style={{ color: 'var(--color-ink)', fontSize: '20px', letterSpacing: '-0.5px' }}
          >
            {SITE.name}
          </h3>
          <p className="text-body text-[#999999]">
            {FOOTER.note}
          </p>
        </div>
        {FOOTER.columns.map((column) => (
          <div key={column.title} className="space-y-4">
            <p className="text-caption uppercase tracking-[0.2em] text-[#999999]">
              {column.title}
            </p>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                    data-cursor="link"
                    data-cursor-text="GO"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between"
        style={{ borderTop: '1px solid var(--color-hairline-soft)' }}
      >
        <p className="text-micro text-[#999999]">
          {FOOTER.legal}
        </p>
        <div className="flex items-center gap-4">
          {FOOTER.social.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              data-cursor="link"
              data-cursor-text="VISIT"
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
