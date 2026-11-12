import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keystatic's GitHub sign-in sends you to 127.0.0.1 in development; let the
  // dev server answer there too (has no effect on the live site)
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Only photos under /public/images go through the image optimizer
    localPatterns: [{ pathname: "/images/**", search: "" }],
    formats: ["image/avif", "image/webp"],
    // Keep optimized photos for 31 days (Next's default is 4 hours). A photo
    // replaced under the same file name can take that long to update, so give
    // replacements a new name.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    // 404 page for addresses outside /en and /id (src/app/global-not-found.tsx)
    globalNotFound: true,
  },
  // The AI Readiness Check lives at /{lang}/tools/ai-readiness (built by
  // src/lib/ai-readiness-page.ts, which also sets its Content-Security-Policy).
  // Its first address, /tools/ai-readiness, now leads there.
  async redirects() {
    return [
      { source: "/tools/ai-readiness", destination: "/en/tools/ai-readiness", permanent: false },
      { source: "/tools/roas-calculator", destination: "/en/tools/roas-calculator", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // Images and fonts change rarely; let browsers keep them for 30 days,
        // and use a kept copy for a day longer while checking for a new one.
        // A file replaced under the same name can take up to 30 days to reach
        // returning visitors, so give replacements a new name.
        source: "/:path*\\.(jpg|jpeg|png|webp|svg|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
