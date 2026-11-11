import type { NextConfig } from "next";

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
    return [
      {
        // Images and fonts change rarely; let browsers keep them for a week
        source: "/:path*\\.(jpg|jpeg|png|webp|svg|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
