// The content editor at /keystatic. It has its own root layout, separate
// from the site's styles.
import type { Metadata } from "next";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "Bliss Digital content", robots: { index: false, follow: false } };

export default function KeystaticLayout() {
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
