import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Note: For true distributed environments (like Vercel Edge), an external store (e.g., Upstash Redis) is required.
// We use a global Map here as a fallback for local/single-instance evaluation purposes.
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_CACHE_SIZE = 10000; // Prevent memory leak

// Helper to clean up old entries to prevent memory leaks
function cleanRateLimitCache() {
  if (rateLimitCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, value] of rateLimitCache.entries()) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW_MS) {
        rateLimitCache.delete(key);
      }
    }
  }
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const host = request.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  // 1. Strict Security Headers (Hardened but Auth-Compatible)
  if (!isLocalhost) {
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );

    // CSP: Comprehensive Google Auth & Firebase support for Production
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com https://accounts.google.com https://www.gstatic.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: https://*.googleusercontent.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://accounts.google.com https://www.google-analytics.com",
      "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com https://accounts.google.com https://apis.google.com https://*.googleapis.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://*.firebaseapp.com",
      "upgrade-insecure-requests",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);
    // Disable X-Frame-Options in favor of CSP frame-ancestors 'self'
  }

  // 2. CSRF Protection for API Mutations (Always active for security)
  if (
    request.method !== "GET" &&
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    // Strict URL parsing to prevent substring bypass attacks
    try {
      const sourceUrl = new URL(origin || referer || "");
      // In production, host may include port, so we compare hostnames or exact host.
      if (sourceUrl.host !== host) {
        return new NextResponse(
          JSON.stringify({ error: "CSRF token mismatch" }),
          { status: 403 },
        );
      }
    } catch {
      return new NextResponse(
        JSON.stringify({ error: "Invalid origin or referer" }),
        { status: 403 },
      );
    }
  }

  // 3. Edge-Simulated Rate Limiting
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // In newer Next.js versions, request.ip is deprecated/removed from types. We rely on the header instead.
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const now = Date.now();

    cleanRateLimitCache();

    let cache = rateLimitCache.get(ip);
    if (!cache || now - cache.timestamp > RATE_LIMIT_WINDOW_MS) {
      cache = { count: 1, timestamp: now };
    } else {
      cache.count += 1;
    }

    rateLimitCache.set(ip, cache);

    response.headers.set(
      "X-RateLimit-Limit",
      MAX_REQUESTS_PER_WINDOW.toString(),
    );
    response.headers.set(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS_PER_WINDOW - cache.count).toString(),
    );

    if (cache.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "60" },
        },
      );
    }
  }

  return response;
}

export const config = {
  // Exclude Firebase internal routes and static assets from proxy interference
  matcher: ["/((?!_next/static|_next/image|favicon.ico|__/).*)"],
};
