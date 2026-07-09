import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET — fetch all lecture progress for the authenticated user
export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin
    .from("lecture_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("GET progress database error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// POST — mark a lecture as completed / uncompleted (upsert)
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lecture_id, course_id, completed } = await req.json();
  if (!lecture_id || !course_id) {
    return NextResponse.json({ error: "lecture_id and course_id required" }, { status: 400 });
  }

  // Verify the user is enrolled in the course first
  const { data: enrollment, error: enrollErr } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .single();

  if (enrollErr || !enrollment) {
    return NextResponse.json({ error: "Must enroll in the course first" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("lecture_progress")
    .upsert(
      {
        user_id: user.id,
        lecture_id,
        course_id,
        completed: completed !== false,
        completed_at: completed !== false ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lecture_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("POST progress database error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
  return NextResponse.json(data);
}
