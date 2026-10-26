import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only photos under /public/images go through the image optimizer
    localPatterns: [{ pathname: "/images/**", search: "" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // 404 page for addresses outside /en and /id (src/app/global-not-found.tsx)
    globalNotFound: true,
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
