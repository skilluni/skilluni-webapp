"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER, SITE } from "../../constants/site";
import { NAV_LINKS } from "../../constants/nav";
import ButtonLink from "../ui/ButtonLink";
import { useAuth } from "../../components/providers/AuthProvider";
import AvatarDisplay from "../dashboard/AvatarDisplay";
import type { AvatarId } from "../../types/dashboard";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  if (pathname?.startsWith("/admin") || pathname === "/signin" || pathname === "/signup") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

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
          {user ? (
            <div className="relative group animate-fade-in-up">
              {/* Profile Trigger */}
              <button
                className="flex items-center justify-center shrink-0 transition-transform hover:scale-105 cursor-pointer focus:outline-none"
                aria-label="Profile menu"
              >
                <AvatarDisplay
                  name={profile?.name || profile?.username || user?.email || "User"}
                  size={32}
                />
              </button>

              {/* Hover Dropdown Card */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div
                  className="w-56 p-4 flex flex-col"
                  style={{
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {/* User Profile Summary */}
                  <div className="mb-3 min-w-0 text-center">
                    <p className="text-body-sm font-semibold truncate text-white leading-snug">
                      {profile?.name || "Learner"}
                    </p>
                    <p className="text-micro truncate text-neutral-400 mt-0.5 leading-none">
                      @{profile?.username || "username"}
                    </p>
                  </div>

                  {/* Menu Options */}
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-between text-caption px-3 py-2 rounded-lg hover:bg-white/5 text-neutral-300 hover:text-white transition"
                    >
                      <span>Dashboard</span>
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="mt-2 inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-9 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/30 cursor-pointer select-none text-center font-medium"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ButtonLink
                href="/signin"
                label="Sign in"
                variant="secondary"
                size="sm"
              />
              <ButtonLink
                href="/signup"
                label={HEADER.cta.label}
                size="md"
                dataCursor="link"
                cursorText="Join"
                isMagnetic
              />
            </>
          )}
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
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-body-sm py-2 px-3 text-ink bg-surface-1 rounded-md">
                  <AvatarDisplay
                    name={profile?.name || profile?.username || user?.email || "User"}
                    size={28}
                  />
                  <div className="min-w-0 text-left">
                    <p className="font-semibold truncate text-xs text-white leading-tight">{profile?.name || "Learner"}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5 leading-none">@{profile?.username || "username"}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-10 px-5 bg-white text-black hover:bg-neutral-200 w-full"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-10 px-5 bg-[#141414] text-rose-400 border border-hairline hover:bg-[#1c1c1c] cursor-pointer w-full"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-11 px-5 bg-[#141414] text-white border border-hairline hover:bg-[#1c1c1c]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-11 px-5 bg-white text-black hover:bg-neutral-200"
                >
                  {HEADER.cta.label}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
