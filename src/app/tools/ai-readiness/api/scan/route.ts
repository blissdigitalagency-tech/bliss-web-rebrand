// The AI Readiness Check's scan, answered at /tools/ai-readiness/api/scan.
// The page is plain HTML in public/tools/ai-readiness/; the engine and its
// tests live in /ai-readiness (see ai-readiness/README.md).
export { GET, POST } from "../../../../../../ai-readiness/api/scan.mjs";

// One check stops itself after 25 seconds; this is the hard stop on top of that
export const maxDuration = 60;
