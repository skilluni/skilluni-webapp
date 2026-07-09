import { NextResponse } from "next/server";
import { getClientIp, incrementRateLimit } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

function getLanguageFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "java":
      return "java";
    case "py":
      return "python";
    case "js":
      case "jsx":
      return "javascript";
    case "ts":
      case "tsx":
      return "typescript";
    case "cpp":
      case "cc":
      case "cxx":
      return "cpp";
    case "c":
      case "h":
      return "c";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "sql":
      return "sql";
    case "xml":
      return "xml";
    case "yaml":
      case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `rate:fetch-code:${ip}`;
    const requestCount = await incrementRateLimit(rateLimitKey, 60);

    if (requestCount > 30) {
      return NextResponse.json(
        { error: true, message: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: true, message: "URL is required" }, { status: 400 });
    }

    // Parse URL and enforce security checks to mitigate SSRF
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: true, message: "Invalid URL format" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: true, message: "Only HTTPS URLs are allowed" }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isGoogleDomain = hostname === "docs.google.com" || hostname === "drive.google.com" || hostname.endsWith(".google.com");
    if (!isGoogleDomain) {
      return NextResponse.json({ error: true, message: "Only Google Drive or Google Docs URLs are allowed" }, { status: 400 });
    }

    // Extract File ID from Google Drive URL
    let fileId = "";
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch) {
      fileId = dMatch[1];
    } else {
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        fileId = idMatch[1];
      }
    }

    if (!fileId) {
      return NextResponse.json({
        error: true,
        message: "Could not parse Google Drive File ID from URL.",
        url,
      }, { status: 400 });
    }

    // Google Drive direct download endpoint
    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

    const res = await fetch(downloadUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({
        error: true,
        message: `Google Drive file fetch failed with status ${res.status}. Make sure the file is shared as 'Anyone with the link can view'.`,
        url,
      });
    }

    // Try to get filename from content-disposition
    const disposition = res.headers.get("content-disposition");
    let name = "code-file";
    if (disposition) {
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        name = filenameMatch[1];
      }
    }

    // Implement response size cap (e.g. 2 MB)
    let content = "";
    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let totalBytes = 0;
      const limit = 2 * 1024 * 1024; // 2 MB

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          totalBytes += value.length;
          if (totalBytes > limit) {
            throw new Error("Response size limit exceeded");
          }
          content += decoder.decode(value, { stream: true });
        }
        content += decoder.decode(); // flush
      } finally {
        reader.releaseLock();
      }
    } else {
      content = await res.text();
      if (new TextEncoder().encode(content).length > 2 * 1024 * 1024) {
        throw new Error("Response size limit exceeded");
      }
    }

    // Check if the response is HTML, which means Google Drive returned a landing page/error instead of raw file text
    if (content.trim().startsWith("<!DOCTYPE html>") || content.trim().startsWith("<html")) {
      return NextResponse.json({
        error: true,
        message: "Google Drive returned an HTML page instead of raw code. Please make sure the sharing link is public ('Anyone with the link' can View) and is not a folder link.",
        url,
      });
    }

    const language = getLanguageFromExtension(name);

    return NextResponse.json({
      name,
      content,
      language,
      url,
    });
  } catch (error) {
    console.error("Fetch code API route error:", error);
    return NextResponse.json({
      error: true,
      message: "Internal server error fetching code",
    });
  }
}
