import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateAdminSession } from "../../../lib/adminAuth";

export const dynamic = "force-dynamic";

// GET: Public fetch of approved testimonials
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET testimonials API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST: Secured admin operations (approve/delete)
export async function POST(request: Request) {
  try {
    // 1. Session Token Validation
    const isAuthenticated = await validateAdminSession();

    if (!isAuthenticated) {
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

        if (name.length > 100) {
          return NextResponse.json({ error: "Name is too long (max 100 characters)" }, { status: 400 });
        }
        if (comment.length > 1000) {
          return NextResponse.json({ error: "Comment is too long (max 1000 characters)" }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from("testimonials").upsert({
          id,
          name,
          avatar_url: avatarUrl || "",
          comment,
          rating: Number(rating) || 5,
          source: "youtube",
          status: "approved",
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
