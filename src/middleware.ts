import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Determine if this route requires admin authentication
  const isAdminPath = pathname.startsWith("/admin");
  const isApiMutation =
    (pathname.startsWith("/api/courses") ||
     pathname.startsWith("/api/testimonials") ||
     pathname.startsWith("/api/youtube-comments")) &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
  
  // Note: /api/youtube-comments GET is also admin-only
  const isYoutubeCommentsGet = pathname.startsWith("/api/youtube-comments") && request.method === "GET";

  const requiresAdmin = (isAdminPath && pathname !== "/admin") || isApiMutation || isYoutubeCommentsGet;

  if (requiresAdmin) {
    const sessionCookie = request.cookies.get("skilluni_admin_session");
    if (!sessionCookie) {
      if (isAdminPath) {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    }

    const token = sessionCookie.value;

    // Validate token against Supabase Auth API
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey || "",
        },
      });

      if (!res.ok) {
        throw new Error("Invalid token");
      }

      const userData = await res.json();
      const isAdmin = userData?.app_metadata?.role === "admin";

      if (!isAdmin) {
        throw new Error("Not an admin");
      }
    } catch (e) {
      console.error("Middleware admin validation error:", e);
      if (isAdminPath) {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/courses/:path*",
    "/api/testimonials/:path*",
    "/api/youtube-comments/:path*",
  ],
};
