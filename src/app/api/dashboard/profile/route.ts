import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET — fetch current user profile
export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("GET profile database error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
  return NextResponse.json(data);
}

// PATCH — update profile fields
export async function PATCH(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Validate name if provided
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
  }

  // Validate institution if provided
  if (body.institution !== undefined) {
    if (!["School", "University", "Independent"].includes(body.institution)) {
      return NextResponse.json({ error: "Invalid institution type" }, { status: 400 });
    }
  }

  // Fetch existing profile for fallback and institution context
  const { data: currentProfile } = await admin
    .from("profiles")
    .select("institution, board_of_study, class, school_name, university_name, course")
    .eq("id", user.id)
    .single();

  const effectiveInstitution = body.institution || currentProfile?.institution || "Independent";

  const update: Record<string, unknown> = {};

  if (body.name !== undefined) update.name = body.name.trim();
  if (body.avatar_id !== undefined) update.avatar_id = body.avatar_id;
  if (body.institution !== undefined) update.institution = body.institution;

  // Cleanup & assign institution-specific fields based on effective institution
  if (effectiveInstitution === "Independent") {
    update.board_of_study = null;
    update.class = null;
    update.school_name = null;
    update.university_name = null;
    update.course = null;
  } else if (effectiveInstitution === "School") {
    update.university_name = null;
    update.course = null;

    update.board_of_study = body.board_of_study !== undefined ? body.board_of_study : (currentProfile?.board_of_study || "ICSE");
    update.class = body.class !== undefined ? body.class : (currentProfile?.class || "Class 10");

    const schoolNameVal = body.school_name !== undefined ? body.school_name : currentProfile?.school_name;
    update.school_name = typeof schoolNameVal === "string" ? schoolNameVal.trim() : null;

    if (!update.school_name) {
      return NextResponse.json({ error: "School name is required for School status" }, { status: 400 });
    }
  } else if (effectiveInstitution === "University") {
    update.board_of_study = null;
    update.class = null;
    update.school_name = null;

    const uniNameVal = body.university_name !== undefined ? body.university_name : currentProfile?.university_name;
    const courseVal = body.course !== undefined ? body.course : currentProfile?.course;

    update.university_name = typeof uniNameVal === "string" ? uniNameVal.trim() : null;
    update.course = typeof courseVal === "string" ? courseVal.trim() : null;

    if (!update.university_name || !update.course) {
      return NextResponse.json({ error: "University name and course are required for University status" }, { status: 400 });
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const { data, error } = await admin
    .from("profiles")
    .update(update)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("PATCH profile database error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE — delete account and all associated user data
export async function DELETE(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Delete dependent user records
    await admin.from("lecture_progress").delete().eq("user_id", user.id);
    await admin.from("enrollments").delete().eq("user_id", user.id);
    await admin.from("profiles").delete().eq("id", user.id);

    // Delete auth user from Supabase admin auth
    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
    if (deleteErr) {
      console.error("DELETE profile admin error:", deleteErr);
      return NextResponse.json({ error: "Failed to delete user account" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE profile catch error:", err);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

