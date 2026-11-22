// Cal.com booking webhook: signature check, and a booking turned into an
// Airtable lead with its source.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { airtable, bookingToLead, verifyCalSignature } from "../src/lib/cal-webhook.ts";

const f = airtable.fields;
const secret = "test-secret";
const sign = (body, encoding = "hex") => createHmac("sha256", secret).update(body).digest(encoding);

test("signature: the right one passes (hex or base64), anything else fails", () => {
  const body = '{"triggerEvent":"BOOKING_CREATED"}';
  assert.equal(verifyCalSignature(body, sign(body), secret), true);
  assert.equal(verifyCalSignature(body, sign(body, "base64"), secret), true);
  assert.equal(verifyCalSignature(body + " ", sign(body), secret), false);
  assert.equal(verifyCalSignature(body, "deadbeef", secret), false);
  assert.equal(verifyCalSignature(body, null, secret), false);
  assert.equal(verifyCalSignature(body, sign(body), ""), false);
});

const booking = {
  triggerEvent: "BOOKING_CREATED",
  createdAt: "2026-11-22T14:00:00.000Z",
  payload: {
    uid: "abc123",
    startTime: "2026-11-25T15:00:00.000Z",
    attendees: [{ name: "Priya S", email: "priya@example.com" }],
    responses: {
      name: { label: "Your name", value: "Priya S" },
      email: { label: "Email address", value: "priya@example.com" },
      title: { label: "What role do you want next?", value: " Data engineer " },
      attendeePhoneNumber: { label: "Phone or WhatsApp", value: "+16135550123" },
      notes: { label: "Link to a job post you’d love to land", value: "https://jobs.example.com/123" },
      "How-did-you-hear-about-us": { label: "How did you hear about us?", value: "A friend" },
    },
    metadata: {
      page: "/book-a-call",
      referrer: "https://www.linkedin.com/",
      utm_source: "linkedin",
      utm_medium: "social",
      utm_campaign: "nov",
      videoCallUrl: "https://meet.google.com/x",
    },
  },
};

test("a booking becomes a candidate lead with its answers and source", () => {
  const lead = bookingToLead(booking);
  assert.deepEqual(lead, {
    [f.name]: "Priya S",
    [f.created]: "2026-11-22T14:00:00.000Z",
    [f.type]: "Candidate",
    [f.channel]: "Discovery call booked",
    [f.status]: "Call booked",
    [f.email]: "priya@example.com",
    [f.phone]: "+16135550123",
    [f.roleOrNeed]: "Data engineer",
    [f.jobPost]: "https://jobs.example.com/123",
    [f.heardAboutUs]: "A friend",
    [f.callTime]: "2026-11-25T15:00:00.000Z",
    [f.page]: "/book-a-call",
    [f.referrer]: "https://www.linkedin.com/",
    [f.utmSource]: "linkedin",
    [f.utmMedium]: "social",
    [f.utmCampaign]: "nov",
    [f.bookingId]: "abc123",
  });
});

test("a note that isn't a link goes to Message; empty answers are left out", () => {
  const b = structuredClone(booking);
  b.payload.responses.notes.value = "Senior data role at a bank, see attached";
  delete b.payload.responses.attendeePhoneNumber;
  b.payload.metadata = {};
  const lead = bookingToLead(b);
  assert.equal(lead[f.jobPost], undefined);
  assert.equal(lead[f.message], "Senior data role at a bank, see attached");
  assert.equal(lead[f.phone], undefined);
  assert.equal(lead[f.utmSource], undefined);
});

test("a link inside a sentence is picked out and the full note kept", () => {
  const b = structuredClone(booking);
  b.payload.responses.notes.value = "This one: https://jobs.example.com/9 thanks";
  const lead = bookingToLead(b);
  assert.equal(lead[f.jobPost], "https://jobs.example.com/9");
  assert.equal(lead[f.message], "This one: https://jobs.example.com/9 thanks");
});

test("bookingToLead skips cancellations and the ping", () => {
  assert.equal(bookingToLead({ triggerEvent: "BOOKING_CANCELLED", payload: {} }), null);
  assert.equal(bookingToLead({ triggerEvent: "PING" }), null);
});

import { webhookToAction } from "../src/lib/cal-webhook.ts";

test("a new booking is a create", () => {
  const action = webhookToAction(booking);
  assert.equal(action.kind, "create");
  assert.equal(action.fields[f.bookingId], "abc123");
});

test("a reschedule finds the old booking and moves the call time", () => {
  const b = structuredClone(booking);
  b.triggerEvent = "BOOKING_RESCHEDULED";
  b.payload.uid = "new456";
  b.payload.rescheduleUid = "abc123";
  b.payload.startTime = "2026-11-26T16:00:00.000Z";
  const action = webhookToAction(b);
  assert.equal(action.kind, "update");
  assert.deepEqual(action.findUids, ["abc123", "new456"]);
  assert.deepEqual(action.fields, {
    [f.status]: "Call booked",
    [f.callTime]: "2026-11-26T16:00:00.000Z",
    [f.bookingId]: "new456",
  });
  // Not found? It's written as a new lead with the new time.
  assert.equal(action.fallback[f.callTime], "2026-11-26T16:00:00.000Z");
  assert.equal(action.fallback[f.bookingId], "new456");
});

test("a cancellation marks the lead's status", () => {
  const action = webhookToAction({ triggerEvent: "BOOKING_CANCELLED", payload: { uid: "abc123" } });
  assert.deepEqual(action, { kind: "update", findUids: ["abc123"], fields: { [f.status]: "Call cancelled" } });
});

test("the ping and other events are ignored", () => {
  assert.equal(webhookToAction({ triggerEvent: "PING", payload: {} }).kind, "ignore");
  assert.equal(webhookToAction({ triggerEvent: "MEETING_ENDED", payload: { uid: "x" } }).kind, "ignore");
});
