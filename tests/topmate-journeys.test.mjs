// Each journey's "changed" sentence must be word for word from that
// student's approved story (src/content/stories.ts).
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const stories = readFileSync(new URL("../src/content/stories.ts", import.meta.url), "utf8");
const journeys = readFileSync(new URL("../src/content/topmate-reviews.ts", import.meta.url), "utf8");

test("journey sentences are unchanged from the approved stories", () => {
  const block = journeys.slice(journeys.indexOf("topmateJourneys"));
  const changed = [...block.matchAll(/changed:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(changed.length, 4);
  for (const sentence of changed) assert.ok(stories.includes(sentence), `not in stories.ts: ${sentence}`);
});
