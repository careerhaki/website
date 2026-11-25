/**
 * Cal.com booking webhooks: check they really come from Cal.com, and turn a
 * booking into a lead for the Airtable CRM (base "CareerHaki CRM", table
 * Leads). Only Node built-ins, so `npm test` can check it directly.
 *
 * Cal.com signs the raw request body with HMAC-SHA256 using the webhook's
 * secret and sends the result in the `x-cal-signature-256` header.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Airtable: base and table ids, and the Leads table's field ids. Field ids,
    not names, so renaming a column in Airtable doesn't break the site. */
export const airtable = {
  baseId: "appvZQP57FgA5QVnx",
  tableId: "tblRgt13OYntTPiAD",
  fields: {
    name: "fldvWuIpz6slp28Vk",
    created: "fldSmU1gPVMmb8exf",
    type: "fldFLqaIQmdeENwps",
    channel: "fld2JPZVblfpiEwqN",
    email: "fld6okj5nXc4i9uLM",
    phone: "fld9F11QJzLoPXR1z",
    roleOrNeed: "fldaMNI96pKeSnj3E",
    message: "fldY5FeSwTqo3aZhD",
    callTime: "fldFcyOvyqBmO1122",
    page: "fldfIRbVowrH0y0rp",
    referrer: "fldLGwcS8hd95lH98",
    utmSource: "fldosSUFUQyTWaLk6",
    utmMedium: "fldnoiWNcxKKzZF4N",
    utmCampaign: "fld1nkbxKN1y1K8MI",
    referredBy: "fldqe1ki4nGNMn04c",
    status: "fldlN8EeSal0Wivei",
    jobPost: "flduiQJVuNWxqsMV0",
    heardAboutUs: "fldmC8KTy2JOnt8yN",
    bookingId: "fld0lfszVjoTOgCIm",
    /** "Starting point": the Results picker's answer (column added by Nithish,
        25 November 2026). If it is ever deleted, set this to "" so leads
        aren't rejected for an unknown field. */
    startingPoint: "fldFmI18ZpncYIJvR",
  },
} as const;

/** True when `signature` is the HMAC-SHA256 of `rawBody` with `secret`
    (hex, as Cal.com sends it; base64 accepted too). Constant-time compare. */
export function verifyCalSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  if (!signature || !secret) return false;
  const mac = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const given = signature.trim().replace(/^sha256=/, "");
  for (const encoding of ["hex", "base64"] as const) {
    const expected = Buffer.from(mac.toString(encoding), "utf8");
    const actual = Buffer.from(given, "utf8");
    if (expected.length === actual.length && timingSafeEqual(expected, actual)) return true;
  }
  return false;
}

type Response = { label?: string; value?: unknown };
type CalBooking = {
  triggerEvent?: string;
  createdAt?: string;
  payload?: {
    uid?: string;
    /** On a reschedule: the booking it replaces (Cal.com has used both names). */
    rescheduleUid?: string;
    fromReschedule?: string;
    startTime?: string;
    attendees?: { name?: string; email?: string }[];
    responses?: Record<string, Response | undefined>;
    metadata?: Record<string, unknown>;
  };
};

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";

const answer = (responses: Record<string, Response | undefined>, key: string): string =>
  text(responses[key]?.value);

/** A full http(s) address, or "" (Airtable's URL fields reject anything else). */
const httpUrl = (value: string): string => {
  const first = value.split(/\s+/).find((part) => /^https?:\/\/\S+$/i.test(part)) ?? "";
  try {
    return first ? new URL(first).toString() : "";
  } catch {
    return "";
  }
};

/**
 * The Airtable fields (by field id) for a BOOKING_CREATED webhook, or null
 * for any other event. Empty answers are left out, so Airtable keeps its
 * cells empty rather than storing blank strings.
 */
export function bookingToLead(body: CalBooking, now: Date = new Date()): Record<string, string> | null {
  const created = body.triggerEvent === "BOOKING_CREATED";
  const moved = body.triggerEvent === "BOOKING_RESCHEDULED";
  if ((!created && !moved) || !body.payload) return null;
  const { payload } = body;
  const responses = payload.responses ?? {};
  const attendee = payload.attendees?.[0] ?? {};
  const meta = payload.metadata ?? {};
  const f = airtable.fields;

  // Questions are found by their identifier first, then by their label, so
  // a question re-added or renamed in Cal.com still reaches the right column.
  const byLabel = (pattern: RegExp, skip: string[] = []): string => {
    const hit = Object.entries(responses).find(
      ([key, r]) => !skip.includes(key) && pattern.test(r?.label ?? "") && text(r?.value),
    );
    return hit ? text(hit[1]?.value) : "";
  };
  const heard = byLabel(/hear about/i);
  const role = answer(responses, "title") || byLabel(/role/i, ["name", "email", "notes"]);
  const phone =
    answer(responses, "attendeePhoneNumber") || byLabel(/phone|whatsapp/i, ["name", "email", "notes"]);
  const notes = answer(responses, "notes") || byLabel(/job post/i);
  const jobPost = httpUrl(notes);
  const referrer = httpUrl(text(meta.referrer));

  const fields: Record<string, string> = {
    [f.name]: answer(responses, "name") || text(attendee.name),
    [f.created]: (body.createdAt ? new Date(body.createdAt) : now).toISOString(),
    [f.type]: "Candidate",
    [f.channel]: "Discovery call booked",
    [f.status]: "Call booked",
    [f.email]: answer(responses, "email") || text(attendee.email),
    [f.phone]: phone,
    [f.roleOrNeed]: role,
    [f.jobPost]: jobPost,
    // A note that isn't just a link is kept in full, so nothing is lost.
    [f.message]: notes && notes !== jobPost ? notes : "",
    [f.heardAboutUs]: heard,
    [f.callTime]: payload.startTime ? new Date(payload.startTime).toISOString() : "",
    [f.page]: text(meta.page),
    [f.referrer]: referrer,
    [f.utmSource]: text(meta.utm_source),
    [f.utmMedium]: text(meta.utm_medium),
    [f.utmCampaign]: text(meta.utm_campaign),
    [f.referredBy]: text(meta.ref),
    [f.bookingId]: text(payload.uid),
  };
  const startingPointField: string = f.startingPoint;
  if (startingPointField) fields[startingPointField] = text(meta.starting_point).slice(0, 200);

  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== ""));
}

/**
 * What a webhook asks of the CRM:
 * - create: a new booking, a new lead.
 * - update: a rescheduled or cancelled booking; find the lead by the old
 *   booking ID (`findUids`, in order) and change only `fields`. If no lead is
 *   found, a rescheduled booking is written as a new lead (`fallback`).
 * - ignore: anything else, including Cal.com's ping.
 */
export type CrmAction =
  | { kind: "create"; fields: Record<string, string> }
  | { kind: "update"; findUids: string[]; fields: Record<string, string>; fallback?: Record<string, string> }
  | { kind: "ignore" };

export function webhookToAction(body: CalBooking, now: Date = new Date()): CrmAction {
  const f = airtable.fields;
  const payload = body.payload;
  if (!payload) return { kind: "ignore" };

  if (body.triggerEvent === "BOOKING_CREATED") {
    const fields = bookingToLead(body, now);
    return fields ? { kind: "create", fields } : { kind: "ignore" };
  }

  if (body.triggerEvent === "BOOKING_RESCHEDULED") {
    const lead = bookingToLead(body, now);
    if (!lead) return { kind: "ignore" };
    const uid = text(payload.uid);
    const findUids = [text(payload.rescheduleUid), text(payload.fromReschedule), uid].filter(
      (value, i, all) => value !== "" && all.indexOf(value) === i,
    );
    const fields: Record<string, string> = { [f.status]: "Call booked" };
    if (lead[f.callTime]) fields[f.callTime] = lead[f.callTime];
    if (uid) fields[f.bookingId] = uid;
    return { kind: "update", findUids, fields, fallback: lead };
  }

  if (body.triggerEvent === "BOOKING_CANCELLED") {
    const uid = text(payload.uid);
    if (!uid) return { kind: "ignore" };
    return { kind: "update", findUids: [uid], fields: { [f.status]: "Call cancelled" } };
  }

  return { kind: "ignore" };
}
