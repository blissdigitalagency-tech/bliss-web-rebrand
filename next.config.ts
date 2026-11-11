import type { NextConfig } from "next";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Content-Security-Policy for the AI Readiness Check page. Its report shows
 * text taken from other people's websites, and it sits on the same domain as
 * Keystatic, whose GitHub sign-in token is a cookie any script here can read.
 * The report escapes that text; this policy is the safety net: only the page's
 * own inline scripts may run, so injected HTML can never run code. The script
 * hashes are worked out from the page at build time, so editing its scripts
 * needs no change here.
 */
function aiReadinessPolicy() {
  const html = readFileSync(join(process.cwd(), "public/tools/ai-readiness/index.html"), "utf8");
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, code]) => `'sha256-${createHash("sha256").update(code, "utf8").digest("base64")}'`,
  );
  return [
    "default-src 'none'",
    `script-src ${hashes.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  // Keystatic's GitHub sign-in sends you to 127.0.0.1 in development; let the
  // dev server answer there too (has no effect on the live site)
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Only photos under /public/images go through the image optimizer
    localPatterns: [{ pathname: "/images/**", search: "" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // 404 page for addresses outside /en and /id (src/app/global-not-found.tsx)
    globalNotFound: true,
  },
  // The AI Readiness Check is a plain HTML page (public/tools/ai-readiness/),
  // kept out of React so ChatGPT and Meta AI, which don't run JavaScript, can
  // read it. This serves it at its clean address.
  async rewrites() {
    return [{ source: "/tools/ai-readiness", destination: "/tools/ai-readiness/index.html" }];
  },
  async headers() {
    const csp = aiReadinessPolicy();
    return [
      {
        // Images and fonts change rarely; let browsers keep them for a week
        source: "/:path*\\.(jpg|jpeg|png|webp|svg|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      // The tool page at its clean address and at its file name
      ...["/tools/ai-readiness", "/tools/ai-readiness/index.html"].map((source) => ({
        source,
        headers: [{ key: "Content-Security-Policy", value: csp }],
      })),
    ];
  },
};

export default nextConfig;
