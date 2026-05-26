import type { Metadata } from "next";
import ClientEffects from "../components/layout/ClientEffects";
import Navbar from "../components/layout/Navbar";
import { SITE } from "../constants/site";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          background: "var(--color-canvas)",
          color: "var(--color-ink)",
          fontFamily: "var(--font-sans)",
        }}
        suppressHydrationWarning
      >
        <Navbar />
        <ClientEffects />
        {children}
      </body>
    </html>
  );
}
