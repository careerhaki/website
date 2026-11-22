import { airtable, verifyCalSignature, webhookToAction } from "@/lib/cal-webhook";

/**
 * Cal.com calls this address when a discovery call is booked, rescheduled
 * or cancelled. The call is checked against the shared secret, then the
 * Leads table in Airtable is updated:
 * - booked: a new lead with its answers and source;
 * - rescheduled: the lead's call time and booking ID move to the new booking;
 * - cancelled: the lead's status becomes "Call cancelled".
 *
 * Needs two secrets on Vercel (Production and Preview), never in the code:
 * - CAL_WEBHOOK_SECRET: the same value as the webhook's secret in Cal.com.
 * - AIRTABLE_TOKEN: a personal access token that can write to the
 *   CareerHaki CRM base.
 *
 * Replies: 200 done or ignored (other events, Cal.com's ping); 401 bad
 * signature; 400 unreadable; 503 not configured; 502 Airtable refused
 * (Cal.com retries).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE_URL = `https://api.airtable.com/v0/${airtable.baseId}/${airtable.tableId}`;

async function airtableFetch(token: string, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
}

/** The lead whose Booking ID is one of `uids`, tried in order. */
async function findLead(token: string, uids: string[]): Promise<string | null> {
  for (const uid of uids) {
    // Cal.com booking IDs are letters, digits, - and _; anything else is skipped.
    if (!/^[\w-]+$/.test(uid)) continue;
    const params = new URLSearchParams({
      // Formulas need the column's name; renaming "Booking ID" in Airtable
      // breaks reschedules and cancellations (not new bookings).
      filterByFormula: `{Booking ID}='${uid}'`,
      maxRecords: "1",
      returnFieldsByFieldId: "true",
    });
    params.append("fields[]", airtable.fields.bookingId);
    const res = await airtableFetch(token, `${TABLE_URL}?${params}`);
    if (!res.ok) throw new Error(`Airtable search ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { records?: { id: string }[] };
    if (data.records?.[0]) return data.records[0].id;
  }
  return null;
}

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

  const action = webhookToAction(body as Parameters<typeof webhookToAction>[0]);
  if (action.kind === "ignore") return Response.json({ ok: true, ignored: true });
  if (!token) return Response.json({ error: "crm not configured" }, { status: 503 });

  try {
    let res: Response;
    if (action.kind === "create") {
      res = await airtableFetch(token, TABLE_URL, {
        method: "POST",
        body: JSON.stringify({ records: [{ fields: action.fields }], typecast: true }),
      });
    } else {
      const id = await findLead(token, action.findUids);
      if (id) {
        res = await airtableFetch(token, TABLE_URL, {
          method: "PATCH",
          body: JSON.stringify({ records: [{ id, fields: action.fields }], typecast: true }),
        });
      } else if (action.fallback) {
        res = await airtableFetch(token, TABLE_URL, {
          method: "POST",
          body: JSON.stringify({ records: [{ fields: action.fallback }], typecast: true }),
        });
      } else {
        // A cancelled booking that was never recorded: nothing to change.
        return Response.json({ ok: true, ignored: true });
      }
    }
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  } catch (error) {
    // Logged for Vercel's runtime logs; the booking itself is safe in Cal.com.
    console.error("CRM update failed", error);
    return Response.json({ error: "crm write failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
