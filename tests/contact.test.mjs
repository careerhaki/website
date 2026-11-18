// The WhatsApp button: hidden until the number is set (module 1.5), and a
// correct click-to-chat address once it is.
import assert from "node:assert/strict";
import { test } from "node:test";

import { socialLinks, whatsappMessage, whatsappUrl } from "../src/lib/contact.ts";

test("no number: no WhatsApp address, so no button", () => {
  assert.equal(whatsappUrl(""), null);
  assert.equal(whatsappUrl("  - + "), null);
});

test("a number: wa.me address with digits only and the message filled in", () => {
  assert.equal(
    whatsappUrl("+1 (613) 555-0123", "Hi, a question?"),
    "https://wa.me/16135550123?text=Hi%2C%20a%20question%3F",
  );
});

test("the default message is short, plain and says nothing about price", () => {
  assert.ok(whatsappMessage.length < 80);
  assert.doesNotMatch(whatsappMessage, /price|fee|cost|\$|guarantee/i);
});

test("social links: none until an address is set, then only real https addresses", () => {
  assert.deepEqual(socialLinks(), []);
  assert.deepEqual(socialLinks({ LinkedIn: "", Instagram: "  " }), []);
  assert.deepEqual(socialLinks({ LinkedIn: "#", Instagram: "instagram.com/x" }), []);
  assert.deepEqual(
    socialLinks({ LinkedIn: " https://www.linkedin.com/company/careerhaki ", Instagram: "" }),
    [{ label: "LinkedIn", href: "https://www.linkedin.com/company/careerhaki" }],
  );
});
