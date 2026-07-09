import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { getClientIp, incrementRateLimit } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `rate:recover:${ip}`;
    const requestCount = await incrementRateLimit(rateLimitKey, 60);

    if (requestCount > 5) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    // 1. Resolve email address from username server-side
    const { data: email, error: rpcError } = await supabaseAdmin.rpc("get_email_by_username", {
      username_input: username.trim().toLowerCase(),
    });

    // 2. If the user exists, trigger OTP sending
    if (!rpcError && email) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        console.error("Error triggering OTP sign-in:", otpError);
      }
    }

    // 3. Always return a generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that username exists, an OTP has been sent to its registered email.",
    });
  } catch (err: any) {
    console.error("Recover password proxy API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
