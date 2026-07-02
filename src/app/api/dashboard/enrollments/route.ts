import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET — fetch all enrollments for the authenticated user
export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST — enroll the authenticated user in a course
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { course_id } = await req.json();
  if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });

  // Check if already enrolled
  const { data: existing } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Already enrolled", enrollment: existing });
  }

  const { data, error } = await admin
    .from("enrollments")
    .insert({ user_id: user.id, course_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE — unenroll the authenticated user from a course
export async function DELETE(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { course_id } = await req.json();
    if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });

    // Delete from enrollments
    const enrollDelete = await admin
      .from("enrollments")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", course_id);

    if (enrollDelete.error) {
      return NextResponse.json({ error: enrollDelete.error.message }, { status: 500 });
    }

    // Delete associated progress
    const progressDelete = await admin
      .from("lecture_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", course_id);

    if (progressDelete.error) {
      console.error("Failed to delete progress on unenroll:", progressDelete.error.message);
    }

    return NextResponse.json({ success: true, message: "Unenrolled successfully" });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
