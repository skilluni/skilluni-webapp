import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Helper to hash password for secure cookie token
function getSessionToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123"; // Fallback default for development
}

// GET: Check if session cookie is valid
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("skilluni_admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const token = sessionCookie.value;
    const expectedToken = getSessionToken(getAdminPassword());

    if (token === expectedToken) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false });
  } catch (e) {
    console.error("Auth GET check error:", e);
    return NextResponse.json({ authenticated: false, error: "Authentication check failed" }, { status: 500 });
  }
}

// POST: Verify password and set secure HTTP-only cookie
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 });
    }

    const expectedPassword = getAdminPassword();

    if (password !== expectedPassword) {
      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
    }

    const sessionToken = getSessionToken(expectedPassword);
    
    // Set secure HTTP-only cookie using Next.js cookies utility
    const cookieStore = await cookies();
    cookieStore.set("skilluni_admin_session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
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
