import localFont from "next/font/local";

// Same families as the Figma file, self-hosted (no request to Google Fonts)
export const jakarta = localFont({
  src: [
    { path: "../fonts/plus-jakarta-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/plus-jakarta-sans-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

export const fragment = localFont({
  src: [{ path: "../fonts/fragment-mono-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-fragment",
  display: "swap",
  preload: false,
});
