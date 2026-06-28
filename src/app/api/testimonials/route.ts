import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

function getSessionToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

// GET: Public fetch of approved testimonials
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET testimonials API error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST: Secured admin operations (approve/delete)
export async function POST(request: Request) {
  try {
    // 1. Session Token Validation
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("skilluni_admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const token = sessionCookie.value;
    const expectedToken = getSessionToken(getAdminPassword());

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    let message = "";

    switch (action) {
      case "approve-testimonial": {
        const { id, name, avatarUrl, comment, rating } = data;
        if (!id || !name || !comment) {
          return NextResponse.json({ error: "id, name, and comment are required" }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from("testimonials").upsert({
          id,
          name,
          avatar_url: avatarUrl || "",
          comment,
          rating: Number(rating) || 5,
          source: "youtube",
        });

        if (error) throw error;
        message = "Testimonial successfully approved and featured";
        break;
      }

      case "delete-testimonial": {
        const { id } = data;
        if (!id) {
          return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from("testimonials").delete().eq("id", id);
        if (error) throw error;
        message = "Testimonial successfully removed";
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("POST testimonials API error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error in testimonials management API." },
      { status: 500 }
    );
  }
}
