import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { getClientIp, incrementRateLimit } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `rate:verify-otp:${ip}`;
    const requestCount = await incrementRateLimit(rateLimitKey, 60);

    if (requestCount > 10) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { username, token } = await request.json();

    if (!username || !token) {
      return NextResponse.json({ success: false, error: "Username/email and OTP token are required." }, { status: 400 });
    }

    const cleanInput = username.trim().toLowerCase();
    let targetEmail: string | null = null;

    if (cleanInput.includes("@")) {
      targetEmail = cleanInput;
    } else {
      // 1. Try RPC function to resolve email from username
      try {
        const { data: rpcEmail, error: rpcError } = await supabaseAdmin.rpc("get_email_by_username", {
          username_input: cleanInput,
        });

        if (!rpcError && rpcEmail) {
          targetEmail = rpcEmail;
        }
      } catch (e) {
        console.warn("RPC get_email_by_username error in verify-otp:", e);
      }

      // 2. Fallback: Query profiles table directly if RPC didn't return an email
      if (!targetEmail) {
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .ilike("username", cleanInput)
          .maybeSingle();

        if (profileData?.email) {
          targetEmail = profileData.email;
        }
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP code." }, { status: 401 });
    }

    // 3. Verify OTP using resolved email — try "recovery", "email", and "magiclink" types sequentially
    const cleanToken = token.trim();
    const tokenTypes: Array<"recovery" | "email" | "magiclink"> = ["recovery", "email", "magiclink"];

    let sessionData = null;
    let lastError: any = null;

    for (const tokenType of tokenTypes) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: cleanToken,
        type: tokenType,
      });

      if (!error && data?.session) {
        sessionData = data.session;
        break;
      }
      if (error) {
        lastError = error;
      }
    }

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: lastError?.message || "Invalid or expired verification code." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      },
    });
  } catch (err: any) {
    console.error("Verify OTP proxy API error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
