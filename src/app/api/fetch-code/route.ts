import { NextResponse } from "next/server";

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
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: true, message: "URL is required" }, { status: 400 });
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
      // If it's not a Google Drive link, try to fetch it directly as a fallback
      try {
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!response.ok) {
          throw new Error(`Failed to fetch direct URL: ${response.statusText}`);
        }
        const content = await response.text();
        const urlObj = new URL(url);
        const name = urlObj.pathname.split("/").pop() || "source-code";
        const language = getLanguageFromExtension(name);
        return NextResponse.json({ name, content, language, url });
      } catch (err) {
        console.error("Direct URL fetch failed:", err);
        return NextResponse.json({
          error: true,
          message: "Could not parse Google Drive File ID and direct fetch failed.",
          url,
        });
      }
    }

    // Google Drive direct download endpoint
    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

    const res = await fetch(downloadUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
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

    const content = await res.text();

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
      message: (error as Error).message || "Internal server error fetching code",
    });
  }
}
