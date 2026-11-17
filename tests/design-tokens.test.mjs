// Guards the colour tokens: they must match careerhaki-design-system.md,
// and every text pairing the design system allows must pass WCAG AA.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map(
    ([, name, hex]) => [name, hex.toUpperCase()],
  ),
);

const designSystem = {
  bg: "#FAF6F0",
  surface: "#F2EADF",
  ink: "#262626",
  muted: "#5C5852",
  line: "#DDD3C5",
  accent: "#E17032",
  "accent-text": "#A4470F",
  "accent-hover": "#EC8A52",
  "on-ink-muted": "#C9C2B8",
  "on-ink-line": "#4A4641",
};

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("colour tokens match the design system", () => {
  assert.deepEqual(tokens, designSystem);
});

// [text, ground, minimum ratio]. 4.5 for normal text, 3 for large text.
const pairs = [
  ["ink", "bg", 4.5],
  ["ink", "surface", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["accent-text", "bg", 4.5],
  ["accent-text", "surface", 4.5],
  ["ink", "accent", 4.5], // primary button
  ["ink", "accent-hover", 4.5], // primary button, hover
  ["bg", "ink", 4.5],
  ["on-ink-muted", "ink", 4.5],
  ["accent", "ink", 4.5], // eyebrows and figures on the dark band
];

for (const [text, ground, minimum] of pairs) {
  test(`${text} on ${ground} is at least ${minimum}:1`, () => {
    const ratio = contrast(tokens[text], tokens[ground]);
    assert.ok(
      ratio >= minimum,
      `${text} on ${ground} is ${ratio.toFixed(2)}:1`,
    );
  });
}

test("accent is never small text on a light ground, nor under white text", () => {
  assert.ok(contrast(tokens.accent, tokens.bg) < 4.5);
  assert.ok(contrast("#FFFFFF", tokens.accent) < 4.5);
});
