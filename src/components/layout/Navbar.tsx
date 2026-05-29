"use client";

import { useState } from "react";
import Link from "next/link";
import { HEADER, SITE } from "../../constants/site";
import { NAV_LINKS } from "../../constants/nav";
import ButtonLink from "../ui/ButtonLink";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={SITE.homeHref}
          className="text-headline text-ink font-semibold tracking-[-0.03em]"
          data-cursor="link"
          data-cursor-text="GO"
        >
          {SITE.name}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="link"
              data-cursor-text="GO"
              className="text-body-sm transition-colors text-ink-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink
            href="#"
            label="Sign in"
            variant="secondary"
            size="sm"
          />
          <ButtonLink
            href={HEADER.cta.href}
            label={HEADER.cta.label}
            size="md"
            dataCursor="link"
            cursorText="Join"
            isMagnetic
          />
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center md:hidden"
          style={{
            background: 'var(--color-surface-1)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-ink)',
          }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="animate-fade-in-up px-6 pb-6 pt-2 md:hidden"
          style={{
            background: 'var(--color-canvas)',
            borderBottom: '1px solid var(--color-hairline)',
          }}
        >
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-sm py-2"
                style={{ color: 'var(--color-ink-muted)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <ButtonLink
              href="#"
              label="Sign in"
              variant="secondary"
              size="md"
            />
            <ButtonLink
              href={HEADER.cta.href}
              label={HEADER.cta.label}
              size="md"
            />
          </div>
        </div>
      )}
    </header>
  );
}
