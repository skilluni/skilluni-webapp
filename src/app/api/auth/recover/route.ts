import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { getClientIp, incrementRateLimit } from "../../../../lib/rateLimit";
import { getAppOrigin } from "../../../../lib/getAppOrigin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `rate:recover:${ip}`;
    const requestCount = await incrementRateLimit(rateLimitKey, 60);

    if (requestCount > 5) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { username } = await request.json();

    if (!username || !username.trim()) {
      return NextResponse.json({ success: false, error: "Username or email is required." }, { status: 400 });
    }

    const cleanInput = username.trim().toLowerCase();
    let targetEmail: string | null = null;

    // 1. Check if the input is directly an email address
    if (cleanInput.includes("@")) {
      targetEmail = cleanInput;
    } else {
      // 2. Try RPC function to resolve email from username
      try {
        const { data: rpcEmail, error: rpcError } = await supabaseAdmin.rpc("get_email_by_username", {
          username_input: cleanInput,
        });

        if (!rpcError && rpcEmail) {
          targetEmail = rpcEmail;
        }
      } catch (e) {
        console.warn("RPC get_email_by_username error, falling back to profile query:", e);
      }

      // 3. Fallback: Query profiles table directly if RPC didn't return an email
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

    // 4. If the target email was resolved, send recovery email / OTP
    if (targetEmail) {
      const appOrigin = getAppOrigin(request);
      const redirectToUrl = `${appOrigin}/signin`;

      // Primary: resetPasswordForEmail via supabaseAdmin (service_role)
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: redirectToUrl,
      });

      if (resetError) {
        console.warn("resetPasswordForEmail failed, falling back to signInWithOtp:", resetError.message);
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: redirectToUrl,
          },
        });

        if (otpError) {
          console.error("signInWithOtp fallback error:", otpError.message);
        }
      }
    }

    // 5. Always return a generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that username/email exists, a verification code has been sent to its registered email address.",
    });
  } catch (err: any) {
    console.error("Recover password proxy API error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
