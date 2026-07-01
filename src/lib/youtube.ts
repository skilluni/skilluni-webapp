export type YoutubeStats = {
  subscribers: string;
  views: string;
  videos: string;
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  }
  return num.toLocaleString();
}

export async function getYoutubeStats(): Promise<YoutubeStats> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const handle = process.env.YOUTUBE_HANDLE || "SkillUni";

  if (!apiKey) {
    console.warn(
      "YOUTUBE_API_KEY is not defined. Using fallback mock YouTube statistics for SkillUni."
    );
    return {
      subscribers: "2.0K+",
      views: "120K+",
      videos: "45 lessons",
    };
  }

  try {
    let url = "";
    if (channelId) {
      url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    } else {
      const formattedHandle = handle.startsWith("@") ? handle : `@${handle}`;
      url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${encodeURIComponent(
        formattedHandle
      )}&key=${apiKey}`;
    }

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache response in Next.js for 1 hour
    });

    if (!res.ok) {
      throw new Error(`YouTube API responded with status ${res.status}`);
    }

    const data = await res.json();
    const item = data.items?.[0];

    if (!item) {
      throw new Error(`No YouTube channel found for handle/id: ${handle}`);
    }

    const stats = item.statistics;
    const subs = parseInt(stats.subscriberCount || "0", 10);
    const views = parseInt(stats.viewCount || "0", 10);
    const videos = parseInt(stats.videoCount || "0", 10);

    return {
      subscribers: subs > 0 ? formatNumber(subs) : "2.0K+",
      views: views > 0 ? formatNumber(views) : "120K+",
      videos: videos > 0 ? `${videos} lessons` : "45 lessons",
    };
  } catch (error) {
    console.error("Error fetching YouTube Data API statistics:", error);
    return {
      subscribers: "2.0K+",
      views: "120K+",
      videos: "45 lessons",
    };
  }
}

export function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    if (url.includes("youtube.com/embed/")) {
      const parts = url.split("youtube.com/embed/");
      return parts[parts.length - 1].split(/[?#]/)[0];
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v");
    }
    if (url.includes("youtu.be/")) {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    }
    if (url.includes("youtube.com/v/")) {
      const parts = url.split("/v/");
      return parts[parts.length - 1].split(/[?#]/)[0];
    }
    return null;
  } catch (e) {
    return null;
  }
}
