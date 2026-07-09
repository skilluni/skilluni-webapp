export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

function getKvCredentials() {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { restUrl, restToken };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number; resetAt: Date }> {
  const { restUrl, restToken } = getKvCredentials();

  if (!restUrl || !restToken) {
    // If not configured, fail open to prevent blocking clients
    return { allowed: true, count: 0, resetAt: new Date() };
  }

  try {
    const res = await fetch(`${restUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["GET", key],
        ["TTL", key],
      ]),
    });

    if (!res.ok) {
      throw new Error(`Upstash REST API returned status ${res.status}`);
    }

    const results = await res.json();
    const countVal = results[0]?.result;
    const ttl = results[1]?.result || -1;

    const count = countVal ? parseInt(countVal, 10) : 0;
    const now = new Date();
    const resetAt = ttl > 0 ? new Date(now.getTime() + ttl * 1000) : new Date(now.getTime() + windowSeconds * 1000);

    return {
      allowed: count < limit,
      count,
      resetAt,
    };
  } catch (e) {
    console.error("Rate limit check failed, bypassing:", e);
    return { allowed: true, count: 0, resetAt: new Date() };
  }
}

export async function incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
  const { restUrl, restToken } = getKvCredentials();

  if (!restUrl || !restToken) return 0;

  try {
    const res = await fetch(`${restUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["TTL", key],
      ]),
    });

    if (!res.ok) {
      throw new Error(`Upstash REST API returned status ${res.status}`);
    }

    const results = await res.json();
    const count = results[0]?.result || 0;
    const ttl = results[1]?.result || -1;

    if (ttl === -1) {
      await fetch(`${restUrl}/expire/${key}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${restToken}` },
      });
    }

    return count;
  } catch (e) {
    console.error("Rate limit increment failed:", e);
    return 0;
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  const { restUrl, restToken } = getKvCredentials();

  if (!restUrl || !restToken) return;

  try {
    await fetch(`${restUrl}/del/${key}`, {
      headers: { Authorization: `Bearer ${restToken}` },
    });
  } catch (e) {
    console.error("Rate limit reset failed:", e);
  }
}
