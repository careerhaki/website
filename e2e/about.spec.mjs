// The About page (/about), layout E: the copy word for word from about.ts,
// the founders' anchors the homepage cards link to, the booking link, no
// LinkedIn link or photo until they are set, the ink band, the still version
// and the scroll-driven motion. Phone and desktop.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const source = readFileSync(new URL("../src/content/about.ts", import.meta.url), "utf8");

/** Every quoted string in about.ts, so the page can be checked against it. */
const strings = [...source.matchAll(/"([^"\n]{12,})"/g)].map((m) => m[1]);
const has = (text) => strings.includes(text);

const place = (locator, fraction) =>
  locator.evaluate((el, f) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * f);
  }, fraction);

test("head: title, description, H1 and lead, from about.ts", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveTitle("About Nithish Reddy and Bhogeshwar Reddy | CareerHaki");
  const description = await page.locator("meta[name='description']").getAttribute("content");
  expect(has(description)).toBe(true);
  const h1 = await page.locator("h1").innerText();
  expect(has(h1)).toBe(true);
  expect(await page.locator("h1").count()).toBe(1);
  const lead = await page.locator("main header p").nth(1).innerText();
  expect(has(lead)).toBe(true);
});

test("headings in order: H1, then H2s, each founder an H3 under the hidden H2", async ({ page }) => {
  await page.goto("/about");
  const levels = await page.locator("main :is(h1, h2, h3)").evaluateAll((hs) => hs.map((h) => h.tagName));
  expect(levels.slice(0, 4)).toEqual(["H1", "H2", "H3", "H3"]);
  await expect(page.getByRole("heading", { level: 2, name: "The founders" })).toBeAttached();
  await expect(page.locator("main h3")).toHaveText(["Nithish Reddy", "Bhogeshwar Reddy"]);
});

test("founders: anchors the homepage cards use, copy from about.ts, booking link", async ({ page }) => {
  await page.goto("/about");
  for (const id of ["nithish", "bhogeshwar"]) {
    const founder = page.locator(`article#${id}`);
    await expect(founder).toBeAttached();
    for (const text of await founder.locator("p").allTextContents()) {
      if (text.length >= 12 && !text.includes("→")) expect(has(text), text).toBe(true);
    }
  }
  const book = page.locator("article#nithish").getByRole("link", { name: "Book a discovery call with Nithish" });
  await expect(book).toHaveAttribute("href", "/book-a-call");
  // No LinkedIn link and no photo until they are set (never a dead link or a grey box).
  await expect(page.locator("main a[href*='linkedin']")).toHaveCount(0);
  await expect(page.locator("main article img")).toHaveCount(0);
  // Nothing parked about Bhogeshwar's job reaches the page.
  await expect(page.locator("main")).not.toContainText("Basis");
});

test("the homepage's person cards land on the founders", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About Nithish" }).click();
  await expect(page).toHaveURL(/\/about#nithish$/);
  await expect(page.locator("article#nithish h3")).toBeInViewport();
});

test("why and The Ascent: copy from about.ts, results link, no mentors link yet", async ({ page }) => {
  await page.goto("/about");
  for (const id of ["why", "ascent"]) {
    const section = page.locator(`section#${id}`);
    for (const text of await section.locator("h2, p:not(:has(a)), dt, dd").allTextContents()) {
      if (text.length >= 12) expect(has(text), text).toBe(true);
    }
  }
  await expect(page.locator("section#ascent dt")).toHaveText([
    "Not ready to apply yet?",
    "Interviews already booked?",
    "Signed your offer?",
  ]);
  await expect(page.locator("section#ascent").getByRole("link", { name: "See the results" })).toHaveAttribute("href", "/results");
  // /mentors isn't built yet, so its link is left out.
  await expect(page.locator("main a[href='/mentors']")).toHaveCount(0);
  // Truth rules: no price words, no guarantee.
  await expect(page.locator("main")).not.toContainText(/\$\d|price|fee|guarantee/i);
});

test("the ink band: dark ground, light text, accent eyebrow", async ({ page }) => {
  await page.goto("/about");
  const band = page.locator("section#ascent");
  await place(band, 0.1);
  const look = await band.evaluate((el) => ({
    ground: getComputedStyle(el, "::before").backgroundColor,
    text: getComputedStyle(el.querySelector("h2")).color,
    eyebrow: getComputedStyle(el.querySelector("p")).color,
  }));
  expect(look.ground).toBe("rgb(38, 38, 38)");
  expect(look.text).toBe("rgb(250, 246, 240)");
  expect(look.eyebrow).toBe("rgb(225, 112, 50)");
});

test("ends with the shared call-to-action band", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("main > section").last()).toContainText("See how close you are");
});

test("still version (reduce motion): everything in place", async ({ page }) => {
  await page.goto("/about");
  await place(page.locator("section#ascent"), 0.05);
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => ({
    band: getComputedStyle(document.querySelector("section#ascent"), "::before").scale,
    rows: [...document.querySelectorAll("main dl > div > *")].map((el) => getComputedStyle(el).opacity),
  }));
  expect(state.band).toBe("none");
  expect(new Set(state.rows)).toEqual(new Set(["1"]));
});

test("keyboard: the booking link is reachable and shows a focus ring", async ({ page }) => {
  await page.goto("/about");
  const book = page.getByRole("link", { name: "Book a discovery call with Nithish" });
  await book.focus();
  await expect(book).toBeFocused();
  const outline = await book.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

test.describe("motion (no reduce motion)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("rows draw and settle; the ink band grows to full width", async ({ page }) => {
    await page.goto("/about");
    const firstRow = page.locator("section#ascent dl > div").first();
    await place(firstRow, 1.02);
    await expect
      .poll(() => firstRow.locator("dt").evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeLessThan(0.1);
    await place(firstRow, 0.6);
    await expect.poll(() => firstRow.locator("dt").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

    const band = page.locator("section#ascent");
    await place(band, 0.95);
    const full = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/;
    await expect.poll(() => band.evaluate((el) => getComputedStyle(el, "::before").transform)).not.toMatch(full);
    await place(band, 0.1);
    await expect.poll(() => band.evaluate((el) => getComputedStyle(el, "::before").transform)).toMatch(full);
  });
});
