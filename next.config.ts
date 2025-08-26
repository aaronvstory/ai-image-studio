import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    // Note: adjust 'connect-src' to include Convex / OpenAI endpoints actually used.
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // consider tightening once stable
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Port configuration
  env: {
    PORT: "3500",
  },

  // Essential settings only
  reactStrictMode: true,

  // Disable experimental features that might trigger instrumentation
  experimental: {
    turbo: undefined, // Disable turbopack to avoid instrumentation issues
  },

  // ESLint configuration for build
  eslint: {
    // During production builds, ignore ESLint errors
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration for build
  typescript: {
    // During production builds, ignore TypeScript errors
    ignoreBuildErrors: true,
  },

  // Remove standalone mode for development
  // output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
