import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — SkillUni",
  description: "Your learning dashboard. Track courses, view progress, and manage your profile.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--color-canvas)" }}>
      {children}
    </div>
  );
}
