import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { getClientIp, checkRateLimit, incrementRateLimit } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `rate:change-password:${ip}`;
    
    // Check rate limit: 5 attempts per 15 minutes
    const limitCheck = await checkRateLimit(rateLimitKey, 5, 15 * 60);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many password change attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // 1. Get Authorization bearer token from headers
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access token missing." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // 2. Validate token and get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user || !user.email) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      );
    }

    // 3. Parse request body
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is required." },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: "New password is required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirm password do not match." },
        { status: 400 }
      );
    }

    // Check password rules: min 8 chars, containing letter and number
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long and contain both letters and numbers." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: "New password cannot be the same as your current password." },
        { status: 400 }
      );
    }

    // 4. Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      await incrementRateLimit(rateLimitKey, 15 * 60);
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // 5. Update user password using Supabase Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error("Change password update error:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (err: any) {
    console.error("Change password unexpected API error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while changing password." },
      { status: 500 }
    );
  }
}
