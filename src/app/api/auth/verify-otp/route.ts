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
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { username, token } = await request.json();

    if (!username || !token) {
      return NextResponse.json({ error: "Username and OTP token are required." }, { status: 400 });
    }

    // 1. Resolve email address from username server-side
    const { data: email, error: rpcError } = await supabaseAdmin.rpc("get_email_by_username", {
      username_input: username.trim().toLowerCase(),
    });

    if (rpcError || !email) {
      return NextResponse.json({ error: "Invalid OTP code." }, { status: 401 });
    }

    // 2. Verify OTP using resolved email
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: "email",
    });

    if (verifyError || !data.session) {
      return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (err: any) {
    console.error("Verify OTP proxy API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
