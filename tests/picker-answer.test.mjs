// The Results picker's answer, carried hidden into the Cal.com booking.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PICKER_STORAGE_KEY,
  pickerMetadata,
  pickerText,
  readPickerAnswer,
  savePickerAnswer,
} from "../src/lib/picker-answer.ts";

const memory = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    map,
  };
};

test("text: answer then field, joined by a middle dot", () => {
  assert.equal(pickerText("My applications aren’t landing", "Data"), "My applications aren’t landing · Data");
  assert.equal(pickerText("I’m a recent graduate", null), "I’m a recent graduate");
  assert.equal(pickerText(null, "Cloud"), "Cloud");
  assert.equal(pickerText(null, null), "");
});

test("save and read round-trip; clearing forgets it", () => {
  const s = memory();
  const answer = { start: "applications", field: "data", text: "My applications aren’t landing · Data" };
  savePickerAnswer(answer, s);
  assert.deepEqual(readPickerAnswer(s), answer);
  savePickerAnswer(null, s);
  assert.equal(readPickerAnswer(s), null);
  assert.equal(s.map.has(PICKER_STORAGE_KEY), false);
});

test("malformed or missing storage reads as no answer, never throws", () => {
  const s = memory();
  s.setItem(PICKER_STORAGE_KEY, "{not json");
  assert.equal(readPickerAnswer(s), null);
  s.setItem(PICKER_STORAGE_KEY, JSON.stringify({ start: "x", text: "" }));
  assert.equal(readPickerAnswer(s), null);
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("full"); }, removeItem() {} };
  assert.equal(readPickerAnswer(broken), null);
  assert.doesNotThrow(() => savePickerAnswer({ start: "a", field: null, text: "A" }, broken));
});

test("metadata: words for the CRM, ids for counting; nothing without an answer", () => {
  assert.deepEqual(pickerMetadata(null), {});
  assert.deepEqual(pickerMetadata({ start: "graduate", field: null, text: "I’m a recent graduate" }), {
    starting_point: "I’m a recent graduate",
    picker_start: "graduate",
  });
});
