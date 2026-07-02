"use client";

import { useState, useCallback, useEffect } from "react";
import type { DashboardTab } from "../../types/dashboard";
import type { DashboardCourse, DashboardStats } from "../../types/dashboard";
import type { Profile } from "../../components/providers/AuthProvider";
import DashboardSidebar from "./DashboardSidebar";
import OverviewTab from "./OverviewTab";
import CoursesTab from "./CoursesTab";
import ProfileTab from "./ProfileTab";

type DashboardShellProps = {
  profile: Profile;
  courses: DashboardCourse[];
  stats: DashboardStats;
  token: string;
  onSignOut: () => void;
  onProfileUpdate: (updated: Partial<Profile>) => void;
  onUnenroll?: (courseId: string) => void | Promise<void>;
};

const VALID_TABS: DashboardTab[] = ["overview", "courses", "profile"];

export default function DashboardShell({
  profile,
  courses,
  stats,
  token,
  onSignOut,
  onProfileUpdate,
  onUnenroll,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Read tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as DashboardTab;
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, []);


  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userName={profile.name}
        username={profile.username}
        onSignOut={onSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 px-5 py-8 md:px-10 md:py-10 overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewTab
            userName={profile.name}
            stats={stats}
            courses={courses}
          />
        )}
        {activeTab === "courses" && (
          <CoursesTab courses={courses} onUnenroll={onUnenroll} />
        )}
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            token={token}
            onProfileUpdate={onProfileUpdate}
            onSignOut={onSignOut}
          />
        )}
      </main>
    </div>
  );
}
