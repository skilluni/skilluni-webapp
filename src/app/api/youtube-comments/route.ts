import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function getSessionToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function extractVideoId(input: string): string {
  try {
    const trimmed = input.trim();
    if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      if (trimmed.includes("youtu.be")) {
        return url.pathname.substring(1);
      }
      return url.searchParams.get("v") || "";
    }
    return trimmed;
  } catch (e) {
    return input.trim();
  }
}

export async function GET(request: Request) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const videoParam = searchParams.get("videoId") || "";
    const pageToken = searchParams.get("pageToken") || "";

    const targetVideoId = videoParam ? extractVideoId(videoParam) : "";

    // 2. Fetch YouTube credentials
    const apiKey = process.env.YOUTUBE_API_KEY;
    let channelId = process.env.YOUTUBE_CHANNEL_ID;
    const handle = process.env.YOUTUBE_HANDLE || "SkillUni";

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY environment variable is not defined." },
        { status: 500 }
      );
    }

    // 3. Resolve Handle to Channel ID if not fetching a specific video and channelId is missing
    if (!targetVideoId && !channelId) {
      try {
        const formattedHandle = handle.startsWith("@") ? handle : `@${handle}`;
        const resolveUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(
          formattedHandle
        )}&key=${apiKey}`;

        const resolveRes = await fetch(resolveUrl);
        if (resolveRes.ok) {
          const resolveData = await resolveRes.json();
          channelId = resolveData.items?.[0]?.id;
        }
      } catch (err) {
        console.error("Failed to resolve YouTube handle to ID:", err);
      }
    }

    if (!targetVideoId && !channelId) {
      return NextResponse.json(
        { error: "Could not resolve a valid YouTube Channel ID. Please define YOUTUBE_CHANNEL_ID in your env." },
        { status: 400 }
      );
    }

    // 4. Construct API URL
    let commentsUrl = "";
    if (targetVideoId) {
      commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${targetVideoId}&maxResults=50&key=${apiKey}`;
    } else {
      commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=${channelId}&maxResults=50&key=${apiKey}&order=time`;
    }

    if (pageToken) {
      commentsUrl += `&pageToken=${pageToken}`;
    }

    const commentsRes = await fetch(commentsUrl);
    if (!commentsRes.ok) {
      const errText = await commentsRes.text();
      throw new Error(`YouTube API returned status ${commentsRes.status}: ${errText}`);
    }

    const commentsData = await commentsRes.json();
    const rawComments = commentsData.items || [];

    // 5. Map into clean format
    const comments = rawComments.map((item: any) => {
      const topLevelComment = item.snippet?.topLevelComment?.snippet;
      return {
        id: item.id, // Comment ID
        name: topLevelComment?.authorDisplayName || "Anonymous Student",
        avatarUrl: topLevelComment?.authorProfileImageUrl || "",
        comment: topLevelComment?.textOriginal || "",
        publishedAt: topLevelComment?.publishedAt || "",
        videoUrl: topLevelComment?.videoId
          ? `https://youtube.com/watch?v=${topLevelComment.videoId}`
          : null,
      };
    });

    return NextResponse.json({
      comments,
      nextPageToken: commentsData.nextPageToken || null,
    });
  } catch (error) {
    console.error("Fetch YouTube comments API error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error fetching YouTube comments." },
      { status: 500 }
    );
  }
}
