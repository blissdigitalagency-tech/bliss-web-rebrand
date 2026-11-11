// Vercel entry point for /api/scan. It turns Vercel's web-standard Request into
// the small event object the engine in lib/scan.js expects, and the engine's
// answer back into a Response. The engine itself does not know about Vercel,
// so the tests and the Terminal pack call it directly.
import scan from "../lib/scan.js";

async function run(request) {
  const url = new URL(request.url);
  const event = {
    httpMethod: request.method,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: Object.fromEntries(request.headers),
    body: request.method === "POST" ? await request.text() : null,
  };
  const out = await scan.handler(event);
  return new Response(out.body, { status: out.statusCode, headers: out.headers });
}

export const GET = run;
export const POST = run;
