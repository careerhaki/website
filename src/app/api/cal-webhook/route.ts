import { airtable, bookingToLead, verifyCalSignature } from "@/lib/cal-webhook";

/**
 * Cal.com calls this address when someone books a discovery call. The
 * booking is checked against the shared secret, then written to the Leads
 * table in Airtable with its source.
 *
 * Needs two secrets on Vercel (Production and Preview), never in the code:
 * - CAL_WEBHOOK_SECRET: the same value as the webhook's secret in Cal.com.
 * - AIRTABLE_TOKEN: a personal access token that can write to the
 *   CareerHaki CRM base.
 *
 * Replies: 200 written or ignored (other events); 401 bad signature;
 * 400 unreadable; 503 not configured; 502 Airtable refused (Cal.com retries).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const token = process.env.AIRTABLE_TOKEN;
  if (!secret) return Response.json({ error: "webhook not configured" }, { status: 503 });

  const raw = await request.text();
  if (!verifyCalSignature(raw, request.headers.get("x-cal-signature-256"), secret)) {
    return Response.json({ error: "bad signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "unreadable" }, { status: 400 });
  }

  // Cal.com's "Ping test" and events other than a new booking.
  const fields = bookingToLead(body as Parameters<typeof bookingToLead>[0]);
  if (!fields) return Response.json({ ok: true, ignored: true });

  if (!token) return Response.json({ error: "crm not configured" }, { status: 503 });

  const res = await fetch(
    `https://api.airtable.com/v0/${airtable.baseId}/${airtable.tableId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    // Logged for Vercel's runtime logs; the booking itself is safe in Cal.com.
    console.error("Airtable refused the lead", res.status, await res.text());
    return Response.json({ error: "crm write failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
