import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { ensureAdminUserExists, validateAdminSession } from "../../../lib/adminAuth";

import { getClientIp, checkRateLimit, incrementRateLimit, resetRateLimit } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@skilluni.com";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET: Check if session cookie is valid
export async function GET() {
  try {
    const authenticated = await validateAdminSession();
    return NextResponse.json({ authenticated });
  } catch (e) {
    console.error("Auth GET check error:", e);
    return NextResponse.json({ authenticated: false, error: "Authentication check failed" }, { status: 500 });
  }
}

// POST: Verify password and set secure HTTP-only cookie
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `login:failed:${ip}`;

    // 1. Check if IP is currently locked out
    const limitCheck = await checkRateLimit(rateLimitKey, 5, 15 * 60);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 });
    }

    // Ensure admin user exists and has synced credentials in Supabase
    await ensureAdminUserExists();

    // Authenticate using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: password,
    });

    if (error || !data.session) {
      // Increment failed attempts
      const failedAttempts = await incrementRateLimit(rateLimitKey, 15 * 60);
      
      // Artificial delay (exponential backoff: 2s, 4s, 8s, 16s, etc.)
      const delayMs = Math.pow(2, failedAttempts) * 1000;
      await sleep(delayMs);

      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
    }

    // Reset failed attempts on success
    await resetRateLimit(rateLimitKey);

    const sessionToken = data.session.access_token;
    
    // Set secure HTTP-only cookie using Next.js cookies utility
    const cookieStore = await cookies();
    cookieStore.set("skilluni_admin_session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: data.session.expires_in || (60 * 60 * 24 * 7), // Use session expiry
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true, message: "Welcome back, Admin!" });
  } catch (e) {
    console.error("Auth POST error:", e);
    return NextResponse.json({ success: false, error: "Authentication transaction failed" }, { status: 500 });
  }
}

// DELETE: Clear session cookie on logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("skilluni_admin_session");

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    console.error("Auth DELETE error:", e);
    return NextResponse.json({ success: false, error: "Logout transaction failed" }, { status: 500 });
  }
}
