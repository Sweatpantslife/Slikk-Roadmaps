import type { NextConfig } from "next";

/**
 * Hosts allowed to invoke Server Actions, derived from APP_URL / ALLOWED_ORIGINS.
 * Behind a reverse proxy (e.g. Coolify's Traefik) Next trusts the forwarded
 * host, but listing the public host here is a safe belt-and-suspenders that
 * avoids "Invalid Server Actions request" errors on some proxy setups.
 */
function serverActionOrigins(): string[] {
  const raw = [process.env.APP_URL, process.env.ALLOWED_ORIGINS].filter(Boolean).join(",");
  const hosts = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      try {
        return new URL(v.includes("://") ? v : `https://${v}`).host;
      } catch {
        return v;
      }
    });
  return [...new Set(hosts)];
}

// Conservative, app-compatible headers. (A strict CSP is intentionally left
// out — the App Router emits inline bootstrap scripts, so a CSP needs nonce
// middleware; see the README's hardening notes.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Ignored by browsers over plain HTTP, so it's safe for local `docker compose up`
  // and enforced once Traefik terminates TLS in front of the app.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const allowedOrigins = serverActionOrigins();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Trust the proxy's X-Forwarded-* headers when generating absolute URLs.
  ...(allowedOrigins.length > 0
    ? { experimental: { serverActions: { allowedOrigins } } }
    : {}),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
