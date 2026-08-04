"use client";

import { useState, useEffect } from "react";
import { PROFILE } from "../../constants/dashboard";
import type { Profile } from "../../components/providers/AuthProvider";

type ProfileTabProps = {
  profile: Profile;
  token: string;
  onProfileUpdate: (updated: Partial<Profile>) => void;
  onSignOut: () => void;
};

export default function ProfileTab({ profile, token, onProfileUpdate, onSignOut }: ProfileTabProps) {
  const [name, setName] = useState(profile.name || "");
  const [institution, setInstitution] = useState<"School" | "University" | "Independent">(profile.institution || "Independent");
  const [boardOfStudy, setBoardOfStudy] = useState(profile.board_of_study || "ICSE");
  const [schoolClass, setSchoolClass] = useState(profile.class || "Class 10");
  const [schoolName, setSchoolName] = useState(profile.school_name || "");
  const [universityName, setUniversityName] = useState(profile.university_name || "");
  const [course, setCourse] = useState(profile.course || "");

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setName(profile.name || "");
    setInstitution(profile.institution || "Independent");
    setBoardOfStudy(profile.board_of_study || "ICSE");
    setSchoolClass(profile.class || "Class 10");
    setSchoolName(profile.school_name || "");
    setUniversityName(profile.university_name || "");
    setCourse(profile.course || "");
  }, [profile]);

  const handleSave = async () => {
    setErrorMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Display name cannot be empty.");
      return;
    }

    const payload: Record<string, unknown> = {
      name: cleanName,
      institution,
    };

    if (institution === "School") {
      const cleanSchool = schoolName.trim();
      if (!cleanSchool) {
        setErrorMsg("School name is required for School status.");
        return;
      }
      payload.board_of_study = boardOfStudy;
      payload.class = schoolClass;
      payload.school_name = cleanSchool;
      payload.university_name = null;
      payload.course = null;
    } else if (institution === "University") {
      const cleanUni = universityName.trim();
      const cleanCourse = course.trim();
      if (!cleanUni || !cleanCourse) {
        setErrorMsg("University name and course are required for University status.");
        return;
      }
      payload.university_name = cleanUni;
      payload.course = cleanCourse;
      payload.board_of_study = null;
      payload.class = null;
      payload.school_name = null;
    } else {
      payload.board_of_study = null;
      payload.class = null;
      payload.school_name = null;
      payload.university_name = null;
      payload.course = null;
    }

    setSaveState("saving");

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        onProfileUpdate(updated);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || "Failed to update profile.");
        setSaveState("idle");
      }
    } catch {
      setErrorMsg("An unexpected network error occurred.");
      setSaveState("idle");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmFirst = window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.");
    if (!confirmFirst) return;

    const confirmSecond = window.prompt("Please type 'DELETE' to confirm account deletion:");
    if (confirmSecond !== "DELETE") {
      window.alert("Deletion cancelled. Confirmation text did not match.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        window.alert("Your account has been successfully deleted.");
        onSignOut();
      } else {
        const errData = await res.json();
        window.alert(`Error deleting account: ${errData.error || "Unknown error"}`);
        setIsDeleting(false);
      }
    } catch (err: any) {
      window.alert(`Error: ${err.message || "An unexpected error occurred"}`);
      setIsDeleting(false);
    }
  };

  const inputStyle = {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-hairline)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-ink)",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    fontSize: "15px",
  };

  const readOnlyStyle = {
    ...inputStyle,
    background: "var(--color-surface-2)",
    color: "var(--color-ink-muted)",
    cursor: "not-allowed",
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-headline">{PROFILE.title}</h1>
        <p className="text-body mt-1" style={{ color: "var(--color-ink-muted)" }}>
          {PROFILE.subtitle}
        </p>
      </div>

      {/* Account Information */}
      <div
        className="p-6"
        style={{
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-hairline)",
        }}
      >
        <h2 className="text-body-sm font-semibold mb-5">{PROFILE.accountSection}</h2>

        <div className="space-y-5">
          {/* Email — Read only */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.email}
              <span className="text-micro ml-2 opacity-50">({PROFILE.readOnlyHint})</span>
            </label>
            <div className="relative">
              <input type="text" value={profile.email} readOnly style={readOnlyStyle} />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 6V4.5C5 3.12 6.12 2 7.5 2V2C8.88 2 10 3.12 10 4.5V6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          </div>

          {/* Username — Read only */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.username}
              <span className="text-micro ml-2 opacity-50">({PROFILE.readOnlyHint})</span>
            </label>
            <div className="relative">
              <input type="text" value={`@${profile.username}`} readOnly style={readOnlyStyle} />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 6V4.5C5 3.12 6.12 2 7.5 2V2C8.88 2 10 3.12 10 4.5V6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          </div>

          {/* Name — Editable */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Your display name"
            />
          </div>

          {/* Institution — Editable */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.institution}
            </label>
            <div className="flex gap-2">
              {(["School", "University", "Independent"] as const).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstitution(inst)}
                  className="flex-1 py-2.5 text-button transition-all duration-200 cursor-pointer"
                  style={{
                    background: institution === inst ? "var(--color-surface-2)" : "transparent",
                    color: institution === inst ? "var(--color-ink)" : "var(--color-ink-muted)",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--color-hairline)",
                  }}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          {/* Institution-specific fields */}
          {institution === "School" && (
            <>
              <div>
                <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
                  {PROFILE.fields.boardOfStudy}
                </label>
                <select
                  value={boardOfStudy}
                  onChange={(e) => setBoardOfStudy(e.target.value)}
                  style={inputStyle}
                >
                  <option value="ICSE">ICSE</option>
                  <option value="CBSE">CBSE</option>
                  <option value="State Board">State Board</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
                  {PROFILE.fields.class}
                </label>
                <select
                  value={schoolClass}
                  onChange={(e) => setSchoolClass(e.target.value)}
                  style={inputStyle}
                >
                  {["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
                  {PROFILE.fields.schoolName}
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  style={inputStyle}
                  placeholder="Your school name"
                />
              </div>
            </>
          )}

          {institution === "University" && (
            <>
              <div>
                <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
                  {PROFILE.fields.universityName}
                </label>
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  style={inputStyle}
                  placeholder="Your university name"
                />
              </div>
              <div>
                <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
                  {PROFILE.fields.course}
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 text-caption text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
            {errorMsg}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-10 px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: saveState === "saved" ? "var(--color-success)" : "var(--color-primary)",
              color: saveState === "saved" ? "white" : "var(--color-on-primary)",
            }}
          >
            {saveState === "saving" ? PROFILE.savingLabel : saveState === "saved" ? PROFILE.savedLabel : PROFILE.saveLabel}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="p-6 mt-8"
        style={{
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}
      >
        <h2 className="text-body-sm font-semibold mb-2" style={{ color: "rgb(239, 68, 68)" }}>
          Danger Zone
        </h2>
        <p className="text-micro mb-4" style={{ color: "var(--color-ink-muted)" }}>
          Once you delete your account, there is no going back. All your course enrollments, lecture progress, and personal details will be permanently deleted.
        </p>
        <div className="flex">
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-10 px-6 cursor-pointer border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
