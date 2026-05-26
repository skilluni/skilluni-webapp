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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        <Navbar />
        <ClientEffects />
        {children}
      </body>
    </html>
  );
}
