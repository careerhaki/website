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
    startTime?: string;
    attendees?: { name?: string; email?: string }[];
    responses?: Record<string, Response | undefined>;
    metadata?: Record<string, unknown>;
  };
};

/** The booking questions set up in Cal.com, by their identifiers. */
const KNOWN = new Set(["name", "email", "title", "attendeePhoneNumber", "notes", "guests", "rescheduleReason", "location"]);

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
  if (body.triggerEvent !== "BOOKING_CREATED" || !body.payload) return null;
  const { payload } = body;
  const responses = payload.responses ?? {};
  const attendee = payload.attendees?.[0] ?? {};
  const meta = payload.metadata ?? {};
  const f = airtable.fields;

  // "How did you hear about us?" was added in Cal.com with its own
  // identifier, so it is found by its label.
  const heard = Object.entries(responses).find(
    ([key, r]) => !KNOWN.has(key) && /hear about/i.test(r?.label ?? ""),
  );

  const notes = answer(responses, "notes");
  const jobPost = httpUrl(notes);
  const referrer = httpUrl(text(meta.referrer));

  const fields: Record<string, string> = {
    [f.name]: answer(responses, "name") || text(attendee.name),
    [f.created]: (body.createdAt ? new Date(body.createdAt) : now).toISOString(),
    [f.type]: "Candidate",
    [f.channel]: "Discovery call booked",
    [f.status]: "Call booked",
    [f.email]: answer(responses, "email") || text(attendee.email),
    [f.phone]: answer(responses, "attendeePhoneNumber"),
    [f.roleOrNeed]: answer(responses, "title"),
    [f.jobPost]: jobPost,
    // A note that isn't just a link is kept in full, so nothing is lost.
    [f.message]: notes && notes !== jobPost ? notes : "",
    [f.heardAboutUs]: heard ? text(heard[1]?.value) : "",
    [f.callTime]: payload.startTime ? new Date(payload.startTime).toISOString() : "",
    [f.page]: text(meta.page),
    [f.referrer]: referrer,
    [f.utmSource]: text(meta.utm_source),
    [f.utmMedium]: text(meta.utm_medium),
    [f.utmCampaign]: text(meta.utm_campaign),
    [f.referredBy]: text(meta.ref),
    [f.bookingId]: text(payload.uid),
  };

  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== ""));
}
