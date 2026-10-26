/**
 * Server-side proxy for the contact form (moved from the old site's
 * api/lead.ts, unchanged in behaviour).
 *
 * The browser cannot verify a Google Forms submission: cross-origin POSTs to
 * `formResponse` must use `mode: "no-cors"`, which yields an opaque response
 * whose status is unreadable. A failed submit therefore looks identical to a
 * successful one, and the lead is lost silently.
 *
 * Running the same POST from the server gets us the real status code, so the
 * client can be told the truth.
 */

const GOOGLE_FORM_ID = "11LGIiPI5qn80S7CrbFVwBF968911WitPd0pS1UEmFjU";

const FORM_ENTRIES = {
  fullName: "entry.453305128",
  email: "entry.1914457611",
  phone: "entry.1590725062",
  website: "entry.2064856931",
  service: "entry.1119050936",
  message: "entry.513959369",
} as const;

type LeadPayload = Partial<Record<keyof typeof FORM_ENTRIES, string>> & {
  /** Honeypot: real users never fill this. */
  company_role?: string;
};

const MAX_FIELD_LENGTH = 5000;

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request): Promise<Response> {
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Silently accept-and-drop bot submissions so they get no feedback signal.
  if (payload.company_role) {
    return json({ ok: true }, 200);
  }

  if (!payload.fullName?.trim() || !payload.email?.trim() || !payload.service?.trim()) {
    return json({ ok: false, error: "missing_required_fields" }, 400);
  }

  const body = new URLSearchParams();
  for (const [field, entryId] of Object.entries(FORM_ENTRIES)) {
    const value = payload[field as keyof typeof FORM_ENTRIES] ?? "";
    body.append(entryId, value.slice(0, MAX_FIELD_LENGTH));
  }

  try {
    const upstream = await fetch(`https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/formResponse`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      redirect: "follow",
    });

    if (!upstream.ok) {
      console.error("[lead] Google Forms rejected submission", { status: upstream.status, email: payload.email });
      return json({ ok: false, error: "upstream_rejected" }, 502);
    }

    /*
     * Accepted limitation: a 200 is trusted as delivered. Google also returns
     * 200 + the confirmation page when the `entry.*` ids above are wrong,
     * recording a blank row instead. That only happens if a question in the
     * Google Form is deleted and recreated.
     *
     * If leads ever start arriving blank, that is the cause: re-read the ids
     * from the form's HTML and update FORM_ENTRIES.
     */
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[lead] Google Forms unreachable", err, { email: payload.email });
    return json({ ok: false, error: "upstream_unreachable" }, 502);
  }
}
