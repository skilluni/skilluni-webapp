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
  // Profile information states
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

  // Security / Change Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordSaveState, setPasswordSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (!currentPassword) {
      setPasswordErrorMsg("Current password is required.");
      return;
    }

    if (!newPassword) {
      setPasswordErrorMsg("New password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("New password and confirm password do not match.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      setPasswordErrorMsg("New password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordErrorMsg("New password cannot be the same as your current password.");
      return;
    }

    setPasswordSaveState("saving");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordSuccessMsg(data.message || "Your password changed successfully.");
        setPasswordSaveState("saved");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordSaveState("idle");
          setPasswordSuccessMsg(null);
        }, 3000);
      } else {
        setPasswordErrorMsg(data.error || "Failed to update password.");
        setPasswordSaveState("idle");
      }
    } catch (err: any) {
      setPasswordErrorMsg("An unexpected error occurred while updating your password.");
      setPasswordSaveState("idle");
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
                  type="button"
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

      {/* Security & Change Password Card */}
      <div
        className="p-6"
        style={{
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-hairline)",
        }}
      >
        <h2 className="text-body-sm font-semibold mb-1">{PROFILE.securitySection}</h2>
        <p className="text-caption mb-5" style={{ color: "var(--color-ink-muted)" }}>
          {PROFILE.securitySubtitle}
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.currentPassword}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: "40px" }}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-ink"
                title={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274 4.057 5.064 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.newPassword}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: "40px" }}
                placeholder="Min 8 characters (letters & numbers)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-ink"
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274 4.057 5.064 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-caption block mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              {PROFILE.fields.confirmPassword}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: "40px" }}
                placeholder="Re-enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-ink"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 123c1.274 4.057 5.064 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-micro text-neutral-400">
            Password must be at least 8 characters long and contain both letters and numbers.
          </p>

          {passwordErrorMsg && (
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 animate-fade-in-up my-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-400 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-sm font-semibold text-rose-400 leading-tight">
                  Update Failed
                </h4>
                <p className="text-caption text-rose-300/80 mt-1 leading-relaxed">
                  {passwordErrorMsg}
                </p>
              </div>
            </div>
          )}

          {passwordSuccessMsg && (
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 animate-fade-in-up my-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-sm font-semibold text-emerald-400 leading-tight">
                  Password Changed Successfully
                </h4>
                <p className="text-caption text-emerald-300/80 mt-1 leading-relaxed">
                  {passwordSuccessMsg}
                </p>
              </div>
            </div>
          )}

          {/* Update Password Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={passwordSaveState === "saving"}
              className="inline-flex items-center justify-center text-button transition-all duration-200 active:scale-[0.97] rounded-[100px] h-10 px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: passwordSaveState === "saved" ? "var(--color-success)" : "var(--color-primary)",
                color: passwordSaveState === "saved" ? "white" : "var(--color-on-primary)",
              }}
            >
              {passwordSaveState === "saving"
                ? PROFILE.updatingPasswordLabel
                : passwordSaveState === "saved"
                ? PROFILE.passwordUpdatedLabel
                : PROFILE.updatePasswordLabel}
            </button>
          </div>
        </form>
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
            type="button"
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
