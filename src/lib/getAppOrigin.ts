/**
 * Utility function to dynamically determine the current application origin URL.
 * Automatically checks:
 * 1. process.env.NEXT_PUBLIC_APP_URL (if set)
 * 2. Incoming HTTP request headers ('origin', 'x-forwarded-host', 'host')
 * 3. Fallback for local development ('http://localhost:3000')
 */
export function getAppOrigin(request?: Request): string {
  // 1. Explicit environment variable (highest priority for production deployment)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    let appUrl = process.env.NEXT_PUBLIC_APP_URL.trim();
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      appUrl = `https://${appUrl}`;
    }
    return appUrl.replace(/\/$/, "");
  }

  // 2. Derive dynamically from incoming HTTP request headers
  if (request) {
    const origin = request.headers.get("origin");
    if (origin && origin !== "null") {
      return origin.replace(/\/$/, "");
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    if (forwardedHost) {
      const host = forwardedHost.split(",")[0].trim();
      return `${forwardedProto}://${host}`.replace(/\/$/, "");
    }

    const host = request.headers.get("host");
    if (host) {
      const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  return "http://localhost:3000";
}
