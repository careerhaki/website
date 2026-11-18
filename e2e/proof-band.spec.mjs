// The results band (the design system's proof band) on a phone and a
// desktop: confirmed proof only, the still version with "reduce motion" on
// (the default for these tests), and motion A (lights down) with B (the
// figures follow your scroll) with it off.
import { expect, test } from "@playwright/test";

const BG = "rgb(250, 246, 240)";
const title = "Better pay, usually within four months.";
const proofs = [
  ["$25K+", "average salary increase"],
  ["1 to 4", "months to an offer, typically"],
];

const band = (page) => page.locator("#results");
const rows = (page) => band(page).locator("[data-proofs] > li");

/** Scroll so an element's top sits at a fraction of the screen height. */
const place = (locator, fraction) =>
  locator.evaluate((el, f) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * f);
  }, fraction);

/** How far each digit of a row still has to roll, in pixels (0 = settled). */
const rolling = (row) =>
  row.locator("[data-d]").evaluateAll((digits) =>
    digits.map((d) => {
      const t = getComputedStyle(d).translate;
      return t === "none" ? 0 : Math.round(parseFloat(t.split(" ")[1] ?? "0"));
    }),
  );

/** How far the band's ink layer is drawn in from each side, in pixels
    (0 = full width). The layer is 18px wider than the band each side. */
const inset = (page) =>
  band(page).evaluate((el) => {
    const s = getComputedStyle(el, "::before").scale;
    const x = s === "none" ? 1 : parseFloat(s.split(" ")[0]);
    const layer = el.getBoundingClientRect().width + 36;
    return Math.max(0, Math.round((el.getBoundingClientRect().width - layer * x) / 2));
  });

/** Each heading word's opacity, 0 to 1. */
const wordLight = (page) =>
  band(page)
    .locator("h2 span > span")
    .evaluateAll((words) => words.map((w) => Number(getComputedStyle(w).opacity)));

test("results: eyebrow, heading and confirmed figures only, as plain text", async ({ page }) => {
  await page.goto("/");
  await expect(band(page).getByText("Results", { exact: true })).toBeVisible();
  await expect(band(page).getByRole("heading", { level: 2 })).toHaveText(title);
  await expect(rows(page)).toHaveCount(proofs.length);
  for (const [i, [figure, label]] of proofs.entries()) {
    // The page text is exactly the figure: the digits a wheel rolls past are
    // generated content, so search engines and screen readers never see them.
    await expect(rows(page).nth(i).locator("p").first()).toHaveText(figure);
    await expect(rows(page).nth(i).locator("p").nth(1)).toHaveText(label);
  }
  // The referral share is internal, and nothing about price appears.
  await expect(band(page)).not.toContainText(/referr|price|fee|guarantee|%/i);
  // The figures in the served HTML, for search engines.
  const html = await (await page.request.get("/")).text();
  expect(html).toContain("average salary increase");
});

test("results: reduce motion shows the still version", async ({ page }) => {
  await page.goto("/");
  await place(band(page), 0.1);
  await page.waitForTimeout(300);
  expect(await inset(page), "ink full width").toBe(0);
  expect(new Set(await wordLight(page))).toEqual(new Set([1]));
  // The words themselves are the page background colour on ink.
  const colours = await band(page)
    .locator("h2 span > span")
    .evaluateAll((words) => words.map((w) => getComputedStyle(w).color));
  expect(new Set(colours)).toEqual(new Set([BG]));
  for (let i = 0; i < proofs.length; i += 1) {
    expect(await rolling(rows(page).nth(i))).toEqual(expect.arrayContaining([0]));
    expect(new Set(await rolling(rows(page).nth(i)))).toEqual(new Set([0]));
  }
  const animations = await band(page)
    .locator("[data-d]")
    .evaluateAll((digits) => digits.map((d) => getComputedStyle(d).animationName));
  expect(new Set(animations)).toEqual(new Set(["none"]));
});

test("results: each wheel shows only its own digit at rest", async ({ page }) => {
  await page.goto("/");
  await place(band(page), 0.1);
  // The visible line of each wheel is its real digit: the digit's box sits
  // exactly in the wheel's box.
  const offsets = await band(page)
    .locator("[data-d]")
    .evaluateAll((digits) =>
      digits.map((d) => {
        const wheel = d.parentElement.getBoundingClientRect();
        const own = d.getBoundingClientRect();
        // The real digit is the last line of the column.
        return Math.round(own.bottom - wheel.bottom);
      }),
    );
  expect(new Set(offsets)).toEqual(new Set([0]));
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("A: the ink grows to full width and the heading lights up, and back", async ({ page }) => {
    await page.goto("/");
    await place(band(page), 0.97);
    await page.waitForTimeout(200);
    expect(await inset(page), "a panel inside the margins").toBeGreaterThan(10);
    const dim = await wordLight(page);
    expect(dim.some((o) => o < 0.9), "words still in the dark").toBe(true);

    await place(band(page).locator("h2"), 0.3);
    await page.waitForTimeout(200);
    expect(await inset(page), "full width").toBe(0);
    expect(new Set(await wordLight(page))).toEqual(new Set([1]));

    await place(band(page), 0.97);
    await page.waitForTimeout(200);
    expect(await inset(page), "back to the panel").toBeGreaterThan(10);
  });

  test("B: digits roll up as each row arrives, settle in view, and roll back", async ({ page }, testInfo) => {
    await page.goto("/");
    const row = rows(page).nth(0);

    await place(row, 0.95);
    await page.waitForTimeout(200);
    const arriving = await rolling(row);
    expect(arriving.some((px) => px > 0), "still rolling as it arrives").toBe(true);

    await place(row, 0.45);
    await page.waitForTimeout(200);
    expect(new Set(await rolling(row)), "settled once in view").toEqual(new Set([0]));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/results.png` });

    await place(row, 0.95);
    await page.waitForTimeout(200);
    expect((await rolling(row)).some((px) => px > 0), "rolls back").toBe(true);
  });

  test("B: every figure has settled at the very end of the page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    for (let i = 0; i < proofs.length; i += 1) {
      expect(new Set(await rolling(rows(page).nth(i))), `row ${i + 1}`).toEqual(new Set([0]));
    }
  });

  test("B desktop: the heading holds still beside the figures", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "side by side from 860px");
    await page.goto("/");
    const head = band(page).locator("h2");
    await place(band(page), 0.05);
    await page.waitForTimeout(150);
    const first = await head.evaluate((el) => Math.round(el.getBoundingClientRect().top));
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.waitForTimeout(150);
    const second = await head.evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(Math.abs(second - first)).toBeLessThanOrEqual(2);
  });
});
