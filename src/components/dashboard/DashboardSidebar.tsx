"use client";

import type { DashboardTab } from "../../types/dashboard";
import { DASHBOARD_TABS } from "../../constants/dashboard";
import AvatarDisplay from "./AvatarDisplay";

type SidebarProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userName: string;
  username: string;
  onSignOut: () => void;
};

/** Tab icon renderer */
function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "var(--color-ink)" : "var(--color-ink-muted)";

  if (icon === "grid") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" stroke={color} strokeWidth="1.4" />
        <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5" stroke={color} strokeWidth="1.4" />
        <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5" stroke={color} strokeWidth="1.4" />
        <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }
  if (icon === "book") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 3.5C3 2.67 3.67 2 4.5 2H7.5C8.33 2 9 2.67 9 3.5V16L6 14L3 16V3.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M9 3.5C9 2.67 9.67 2 10.5 2H13.5C14.33 2 15 2.67 15 3.5V16L12 14L9 16V3.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "user") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3.5" stroke={color} strokeWidth="1.4" />
        <path d="M2.5 16C2.5 13.24 5.41 11 9 11C12.59 11 15.5 13.24 15.5 16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  userName,
  username,
  onSignOut,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar hidden md:flex flex-col">
        {/* User Identity */}
        <div className="flex flex-col items-center gap-3 px-5 pt-8 pb-6">
          <AvatarDisplay name={userName || username || "User"} size={72} />
          <div className="text-center">
            <p className="text-body-sm font-semibold text-ink truncate max-w-[160px]">
              {userName || "Learner"}
            </p>
            <p className="text-micro text-ink-muted truncate max-w-[160px]">
              @{username || "user"}
            </p>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer text-left group"
                style={{
                  background: isActive ? "var(--color-surface-2)" : "transparent",
                  color: isActive ? "var(--color-ink)" : "var(--color-ink-muted)",
                }}
              >
                <TabIcon icon={tab.icon} active={isActive} />
                <span className="text-body-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-6">
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer text-left"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6.5 16H4C3.45 16 3 15.55 3 15V3C3 2.45 3.45 2 4 2H6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M12 12.5L15.5 9L12 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.5 9H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="text-body-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="md:hidden sticky top-[64px] z-30 border-b overflow-x-auto scrollbar-none" style={{
        background: "var(--color-canvas)",
        borderColor: "var(--color-hairline)",
      }}>
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] transition-all duration-200 cursor-pointer shrink-0"
                style={{
                  background: isActive ? "var(--color-surface-2)" : "transparent",
                  color: isActive ? "var(--color-ink)" : "var(--color-ink-muted)",
                }}
              >
                <TabIcon icon={tab.icon} active={isActive} />
                <span className="text-caption font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
