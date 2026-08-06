import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { supabase } from "../../../../lib/supabase";
import { getClientIp, incrementRateLimit } from "../../../../lib/rateLimit";
import { getAppOrigin } from "../../../../lib/getAppOrigin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimitKey = `rate:signup:${ip}`;
    const requestCount = await incrementRateLimit(rateLimitKey, 60);

    if (requestCount > 5) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      email,
      password,
      username,
      name,
      institution = "Independent",
      board_of_study = null,
      class: schoolClass = null,
      school_name = null,
      university_name = null,
      course = null,
    } = body;

    // Basic Validation
    if (!email || !password || !username || !name) {
      return NextResponse.json(
        { error: "Email, password, username, and full name are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim();

    // Check if username already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 400 }
      );
    }

    const metadata = {
      username: cleanUsername,
      name: name.trim(),
      institution,
      board_of_study: institution === "School" ? board_of_study : null,
      class: institution === "School" ? schoolClass : null,
      school_name: institution === "School" ? school_name?.trim() : null,
      university_name: institution === "University" ? university_name?.trim() : null,
      course: institution === "University" ? course?.trim() : null,
    };

    const appOrigin = getAppOrigin(req);

    // 1. Create User via Supabase Auth (natively triggers email confirmation if enabled in Supabase Dashboard)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: metadata,
        emailRedirectTo: `${appOrigin}/signin`,
      },
    });

    if (authError) {
      console.error("Supabase signUp error:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData?.user) {
      return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }

    // 2. Persist Profile record via Supabase Admin (bypasses RLS error 42501)
    const profilePayload = {
      id: authData.user.id,
      email: cleanEmail,
      username: cleanUsername,
      name: name.trim(),
      institution,
      board_of_study: institution === "School" ? board_of_study : null,
      class: institution === "School" ? schoolClass : null,
      school_name: institution === "School" ? school_name?.trim() : null,
      university_name: institution === "University" ? university_name?.trim() : null,
      course: institution === "University" ? course?.trim() : null,
      avatar_id: "avatar_1",
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(profilePayload);

    if (profileError) {
      console.error("Admin profiles upsert error:", profileError.message);
    }

    // 3. Return clean, sanitized response
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: cleanEmail,
        username: cleanUsername,
        name: name.trim(),
      },
      session: authData.session
        ? {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
          }
        : null,
      message: authData.session
        ? "Account created successfully!"
        : "Account created! Please check your email to confirm your account.",
    });
  } catch (err: any) {
    console.error("API Signup error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
