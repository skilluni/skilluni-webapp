import Link from "next/link";
import { FOOTER, SITE } from "../../constants/site";

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-hairline)',
      }}
      className="pt-16 pb-12 md:pt-24 md:pb-16 text-ink"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Main Footer Grid */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 pb-16">
          {/* Left Block: Brand, History, and Speciality (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-display-md text-white font-semibold tracking-tight hover:opacity-90 transition"
              >
                {SITE.name}
              </Link>
              <span className="text-micro font-medium uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/10">
                Free Forever
              </span>
            </div>

            {/* Comprehensive History & Speciality Paragraph */}
            <p className="text-body text-ink-muted leading-relaxed font-sans pr-0 lg:pr-6">
              {SITE.description}
            </p>

            {/* Social Media Icons Bar */}
            <div className="flex items-center gap-3 pt-2">
              {/* YouTube */}
              <a
                href={SITE.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-canvas border border-hairline flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                data-cursor="link"
                data-cursor-text="VISIT"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Reddit */}
              <a
                href={SITE.reddit}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reddit"
                className="w-10 h-10 rounded-full bg-canvas border border-hairline flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                data-cursor="link"
                data-cursor-text="VISIT"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.566 3.875a.384.384 0 0 0-.272.655c.687.688 2.057.94 3.088.94 1.03 0 2.401-.252 3.088-.94a.384.384 0 0 0-.543-.543c-.496.496-1.636.74-2.545.74-.91 0-2.049-.244-2.545-.74a.382.382 0 0 0-.271-.112z"/>
                </svg>
              </a>

              {/* Gmail / Email */}
              <a
                href={`mailto:${SITE.email}`}
                aria-label="Gmail"
                className="w-10 h-10 rounded-full bg-canvas border border-hairline flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                data-cursor="link"
                data-cursor-text="EMAIL"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Block: Navigation Columns (7 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FOOTER.columns.map((column) => (
              <div key={column.title} className="space-y-4">
                <p className="text-caption font-semibold uppercase tracking-[0.2em] text-white/90">
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-body-sm text-ink-muted hover:text-white transition-colors duration-200 block"
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
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div
          className="pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-hairline"
        >
          <p className="text-caption text-ink-muted">
            {FOOTER.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
