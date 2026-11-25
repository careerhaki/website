// The Results page (/results), D+ with frame F: the students' words word for
// word, the picker (reorders, never hides), story links, the opened story
// and its path (R2), M2 bars, the logo wall, the still version, keyboard
// order and fit. Phone and desktop.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const source = readFileSync(new URL("../src/content/stories.ts", import.meta.url), "utf8");
const ORDER = ["karandeep", "rahul", "dheeraj", "jothi", "haritha", "prathyusha", "priya", "kushagra"];
const FIELDS = ["headline", "pullQuote", "before", "changed", "after", "first90Days"];

/** Each story's approved words, read from stories.ts. */
function approved(id) {
  const start = source.indexOf(`id: "${id}"`);
  const end = source.indexOf("placements:", start);
  const block = source.slice(start, end);
  return Object.fromEntries(
    FIELDS.map((f) => {
      const m = block.match(new RegExp(`\\b${f}:\\s*\\n?\\s*"([^"]+)"`));
      return [f, m?.[1]];
    }),
  );
}

const isPhone = (testInfo) => testInfo.project.name === "phone";
const rowIds = (page) => page.locator("#main [id] > article").evaluateAll((els) => els.map((el) => el.parentElement.id));
const pick = (page, name) => page.getByRole("radio", { name, exact: true }).check();
const feedback = (page) => page.locator("p[aria-live='polite']");

test("head, title and the copy rules: no 1 to 4, no rating, no price", async ({ page }) => {
  await page.goto("/results");
  await expect(page).toHaveTitle("Success stories in data, cloud and software | CareerHaki");
  await expect(page.locator("h1")).toHaveText("Find someone who started where you are.");
  const text = await page.locator("main").textContent();
  expect(text).not.toMatch(/1 to 4|out of 5|4\.9|\bprice\b|guarantee/i);
  for (const figure of ["120+", "$25K+", "82 in 100"]) expect(text).toContain(figure);
  expect(text).toContain("Each timeline on this page is one person’s own, not a forecast.");
});

test("all eight stories, in order, every part word for word from stories.ts", async ({ page }) => {
  await page.goto("/results");
  expect(await rowIds(page)).toEqual(ORDER);
  for (const id of ORDER) {
    const words = approved(id);
    for (const f of FIELDS) expect(words[f], `${id}.${f} read from stories.ts`).toBeTruthy();
    const row = page.locator(`#${id}`);
    await expect(row.locator("h3")).toHaveText(words.headline);
    await expect(row.locator("article > blockquote")).toHaveText(words.pullQuote);
    await expect(row.locator("li[data-part] blockquote")).toHaveText([words.before, words.changed, words.after, words.first90Days]);
    await expect(row.locator("li[data-part] > p")).toHaveText(["Before", "What changed", "After", "First 90 days"]);
  }
  // Eyebrows: the one starting point each.
  await expect(page.locator("#rahul article > p").first()).toHaveText("After graduation");
  await expect(page.locator("#kushagra article > p").first()).toHaveText("Junior, ready to move up");
  // Time bars only where approved; the numbers are text.
  await expect(page.locator("#jothi")).toContainText("6 months applying");
  await expect(page.locator("#haritha")).toContainText("Within 3 months");
  for (const id of ["prathyusha", "priya", "kushagra"]) await expect(page.locator(`#${id} [data-tone]`)).toHaveCount(0);
});

test("picker: a tap reorders and hides nothing; feedback and subheadings", async ({ page }) => {
  await page.goto("/results");
  await expect(page.locator("#main h2").first()).toHaveText("Where they started, where they work now");
  await expect(feedback(page)).toHaveText("");

  await pick(page, "I’m junior and ready to move up");
  await expect.poll(() => rowIds(page)).toEqual(["jothi", "priya", "kushagra", "karandeep", "rahul", "dheeraj", "haritha", "prathyusha"]);
  await expect(feedback(page)).toHaveText("3 stories started where you are ↓");
  await expect(feedback(page).locator("a")).toHaveAttribute("href", "#results-matches");
  await expect(page.locator("#results-matches")).toHaveText("Started where you are");
  await expect(page.locator("#results-others")).toHaveText("Everyone else");
  for (const id of ORDER) await expect(page.locator(`#${id}`)).toBeVisible();

  await pick(page, "I want help negotiating an offer");
  await expect(feedback(page)).toHaveText("1 story started where you are ↓");
  expect((await rowIds(page))[0]).toBe("priya");

  await pick(page, "Cloud");
  await expect(feedback(page)).toHaveText("None of the eight started exactly here. All eight are still below ↓");
  expect(await rowIds(page)).toEqual(ORDER);
  await expect(page.locator("#results-all")).toHaveText("Where they started, where they work now");

  await pick(page, "I’m a recent graduate");
  await expect(feedback(page)).toHaveText("1 story started where you are, in cloud ↓");
  await expect(page.locator("#results-matches")).toHaveText("Started where you are, in cloud");

  await page.getByRole("button", { name: "Clear choices" }).click();
  await pick(page, "Data");
  await expect(feedback(page)).toHaveText("6 stories in data ↓");
  await expect(page.locator("#results-matches")).toHaveText("In data");

  await page.getByRole("button", { name: "Clear choices" }).click();
  expect(await rowIds(page)).toEqual(ORDER);
  await expect(page.getByRole("radio", { name: "My applications aren’t landing" })).toBeFocused();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Clear choices" })).toHaveCount(0);
});

test("picker: the feedback line is on screen after a tap on a 360px phone; no automatic scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/results");
  const radio = page.getByRole("radio", { name: "I want help negotiating an offer" });
  await radio.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await radio.check();
  await expect(feedback(page)).toHaveText(/started where you are/);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  const box = await feedback(page).boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(740);
});

test("an opened story stays open when the list reorders", async ({ page }) => {
  await page.goto("/results");
  await page.locator("#priya summary").click();
  await pick(page, "I’m junior and ready to move up");
  await expect.poll(() => rowIds(page).then((ids) => ids[1])).toBe("priya");
  await expect(page.locator("#priya details")).toHaveAttribute("open", "");
});

test("opened story: toggle text, no booking panel, no stage link until The Ascent page exists", async ({ page }) => {
  await page.goto("/results");
  const row = page.locator("#prathyusha");
  const shown = () => row.locator("summary").evaluate((el) => el.innerText.trim());
  expect(await shown()).toBe("Read Prathyusha’s story");
  await row.locator("summary").click();
  await expect.poll(shown).toBe("Hide story");
  // The call-to-action band ends the page; no booking panel per story.
  await expect(page.locator("main details a[href='/book-a-call']")).toHaveCount(0);
  await expect(page.locator("main a[href^='/the-ascent']")).toHaveCount(0);
});

test("a link for each story: /results#jothi opens it under the navigation; hashchange too", async ({ page }) => {
  await page.goto("/results#jothi");
  await expect(page.locator("#jothi details")).toHaveAttribute("open", "");
  await expect
    .poll(() => page.locator("#jothi").evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBeLessThan(160);
  const headBottom = await page.locator("header").first().evaluate((h) => h.getBoundingClientRect().bottom);
  expect(await page.locator("#jothi").evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headBottom - 1);
  await page.evaluate(() => (window.location.hash = "kushagra"));
  await expect(page.locator("#kushagra details")).toHaveAttribute("open", "");
});

test("logo wall: 12 and a button on phones, focus moves to the list; all 34 on desktop", async ({ page }, testInfo) => {
  await page.goto("/results");
  const list = page.getByRole("list", { name: "Companies where our alumni work" });
  await expect(page.getByRole("heading", { name: "Where our alumni work" })).toBeVisible();
  await expect(list.locator("img")).toHaveCount(34);
  const visible = () => list.locator("li").evaluateAll((els) => els.filter((el) => el.offsetParent !== null).length);
  await expect(list.locator("img").first()).toHaveAttribute("alt", "Google");
  const button = page.getByRole("button", { name: "Show all 34 companies" });
  if (isPhone(testInfo)) {
    expect(await visible()).toBe(12);
    await button.click();
    expect(await visible()).toBe(34);
    await expect(button).toHaveCount(0);
    await expect(list).toBeFocused();
  } else {
    expect(await visible()).toBe(34);
    await expect(button).toBeHidden();
  }
});

test("keyboard: the picker's answers, then the stories' toggles in the order shown", async ({ page }) => {
  await page.goto("/results");
  await page.getByRole("radio", { name: "My applications aren’t landing" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: "My applications aren’t landing" })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "I’m switching from another field" })).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio", { name: "Data" })).toBeFocused();
  const order = await page.locator("main input, main summary, main a, main button").evaluateAll((els) =>
    els.filter((el) => el.offsetParent !== null).map((el) => el.innerText.trim() || el.getAttribute("value")),
  );
  const firstToggle = order.findIndex((t) => t.startsWith("Read "));
  expect(order[firstToggle]).toBe("Read Prathyusha’s story");
  expect(order.indexOf("software")).toBeLessThan(firstToggle);
});

test("still version: bars full, path drawn; no animation set", async ({ page }) => {
  await page.goto("/results");
  const fills = await page.locator("#main [data-tone]").evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).animationName),
  );
  expect(new Set(fills)).toEqual(new Set(["none"]));
  await page.locator("#karandeep summary").click();
  const segs = await page.locator("#karandeep [class*='seg']").evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
  expect(segs.every((t) => t === "none")).toBe(true);
});

test("with motion: bars fill with the scroll; the opened path draws after the open, frame by frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/results");
  expect(await page.locator("#karandeep li").first().evaluate((el) => getComputedStyle(el).viewTimelineName)).toBe("--story-bar");
  const scale = () =>
    page.locator("#karandeep [data-tone='before']").evaluate((el) => {
      const t = getComputedStyle(el).transform;
      return t === "none" ? 1 : new DOMMatrixReadOnly(t).a;
    });
  const y = await page.locator("#karandeep [data-tone]").first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const vh = page.viewportSize().height;
  await page.evaluate((v) => window.scrollTo(0, v), y - vh + 2);
  await expect.poll(scale).toBeLessThan(0.05);
  await page.evaluate((v) => window.scrollTo(0, v), y - vh * 0.3);
  await expect.poll(scale).toBe(1);

  const dots = () =>
    page.locator("#rahul li[data-part]").evaluateAll((els) =>
      els.map((el) => {
        const t = getComputedStyle(el, "::before").transform;
        return t === "none" ? 1 : new DOMMatrixReadOnly(t).a;
      }),
    );
  await page.locator("#rahul summary").scrollIntoViewIfNeeded();
  await page.locator("#rahul summary").click();
  // Nothing drawn while the story opens (0.35s)…
  expect(Math.max(...(await dots()))).toBe(0);
  // …then each dot in turn; all drawn within a second.
  await expect.poll(dots, { timeout: 2000 }).toEqual([1, 1, 1, 1]);
});

test("no sideways scroll on a 360px phone, with every story open and the wall expanded", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const reducedMotion of ["reduce", "no-preference"]) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/results");
    await page.locator("main details").evaluateAll((els) => els.forEach((d) => (d.open = true)));
    await page.getByRole("button", { name: "Show all 34 companies" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  }
});

test("picker answer: kept for this tab for the booking, counted, cleared with the choices", async ({ page }) => {
  await page.addInitScript(() => {
    window.__events = [];
    window.posthog = { capture: (name, props) => window.__events.push({ name, props }) };
  });
  await page.goto("/results");
  const stored = () => page.evaluate(() => JSON.parse(sessionStorage.getItem("careerhaki:picker") ?? "null"));
  expect(await stored()).toBeNull();

  await pick(page, "My applications aren’t landing");
  await pick(page, "Data");
  expect(await stored()).toEqual({
    start: "applications",
    field: "data",
    text: "My applications aren’t landing · Data",
  });
  const events = await page.evaluate(() => window.__events);
  expect(events.at(-1)).toEqual({
    name: "results_picker_answer",
    props: { start: "applications", field: "data", matches: 3 },
  });

  await page.getByRole("button", { name: "Clear choices" }).click();
  expect(await stored()).toBeNull();
  // Nothing new on screen: no text mentions the booking.
  await expect(page.locator("main")).not.toContainText("booking");
});

test("closing, option C: figures centred on the ink band; logo tiles in an even grid", async ({ page }, testInfo) => {
  await page.goto("/results");
  const fig = page.locator("main ul li", { hasText: "average salary increase" }).first();
  const band = fig.locator("xpath=ancestor::section[1]");
  expect(await band.evaluate((el) => getComputedStyle(el, "::before").backgroundColor)).toBe("rgb(38, 38, 38)");
  expect(await band.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
  const value = fig.locator("span").first();
  expect(await value.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(225, 112, 50)");
  // Each figure stays on one line and inside its column.
  for (const li of await page.locator("main ul li", { has: page.locator("span") }).filter({ hasText: /CareerHaki|salary|land a role/ }).all()) {
    const [v, box] = await Promise.all([li.locator("span").first().boundingBox(), li.boundingBox()]);
    expect(v.height).toBeLessThan(140);
    expect(v.x).toBeGreaterThanOrEqual(box.x - 1);
    expect(v.x + v.width).toBeLessThanOrEqual(box.x + box.width + 1);
  }
  const list = page.locator("#alumni-wall-list");
  const cols = await list.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(cols).toBe(isPhone(testInfo) ? 2 : 6);
  if (!isPhone(testInfo)) {
    // The label covers the first two tiles; 34 logos fill six full rows.
    const label = await page.locator("#alumni-wall-label").boundingBox();
    const first = await list.locator("li").first().boundingBox();
    expect(Math.abs(label.y - first.y)).toBeLessThan(2);
    expect(Math.abs(label.x + label.width + 1 - first.x)).toBeLessThan(2);
    const last = await list.locator("li").last().boundingBox();
    const box = await list.boundingBox();
    expect(Math.abs(last.x + last.width + 1 - (box.x + box.width))).toBeLessThan(2);
  }
});
