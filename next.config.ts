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
  // The AI Readiness Check lives at /{lang}/tools/ai-readiness (built by
  // src/lib/ai-readiness-page.ts, which also sets its Content-Security-Policy).
  // Its first address, /tools/ai-readiness, now leads there.
  async redirects() {
    return [{ source: "/tools/ai-readiness", destination: "/en/tools/ai-readiness", permanent: false }];
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
