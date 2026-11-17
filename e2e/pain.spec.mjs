// The pain section on a phone and a desktop: content, the still version with
// "reduce motion" on (the default for these tests), and P1 and P2 with it off.
import { expect, test } from "@playwright/test";

const section = (page) => page.locator("section[aria-labelledby=pain-title]");
const items = (page) => section(page).locator("[data-reveal]");
const mark = (page) => section(page).locator("p span").last();

// Computed style of an item's orange rule (its ::after layer).
const rule = (locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { opacity: Number(style.opacity), transform: style.transform };
  });
const underline = (page) =>
  mark(page).evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { content: style.content, transform: style.transform };
  });
const scaleX = (transform) =>
  transform === "none" ? 1 : Number(transform.match(/matrix\(([^,]+)/)?.[1] ?? 1);

test("pain: heading, four items, closing line, in heading order", async ({ page }) => {
  await page.goto("/");
  await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(
    "You can do the job. Your applications aren’t saying so yet.",
  );
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(section(page)).toContainText("The experience underneath it is already yours.");
  const levels = await page
    .locator("main h1, main h2, main h3")
    .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName[1])));
  expect(levels).toEqual([1, 2, 3, 3, 3, 3]);
});

test("pain: reduce motion shows the still version", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const turn = document.querySelector("section[aria-labelledby=pain-title] p:last-of-type");
    turn.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(400);
  const count = await items(page).count();
  for (let i = 0; i < count; i += 1) {
    const item = items(page).nth(i);
    expect(await rule(item)).toEqual({ opacity: 1, transform: "none" });
    const words = await item.locator("> *").evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).opacity),
    );
    expect(words).toEqual(["1", "1"]);
  }
  // No underline in the still version: it is the mockup.
  expect((await underline(page)).content).toBe("none");
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("P1: each rule draws in as its item arrives, then its words", async ({ page }) => {
    await page.goto("/");
    const grid = section(page).locator("[data-reveal-ready]");
    await expect(grid).toHaveCount(1);
    const first = items(page).first();
    // Below the fold at load: waiting, undrawn.
    await expect(first).not.toHaveAttribute("data-revealed");
    expect(scaleX((await rule(first)).transform)).toBe(0);

    await first.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(first).toHaveAttribute("data-revealed", "");
    await expect.poll(async () => scaleX((await rule(first)).transform)).toBe(1);
    await expect
      .poll(() => first.locator("h3").evaluate((element) => getComputedStyle(element).opacity))
      .toBe("1");
  });

  test("P2: the orange moves from the rules to the closing words, and back", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const turn = section(page).locator("p").last();
    const place = (block) =>
      turn.evaluate((element, where) => element.scrollIntoView({ block: where }), block);

    // The closing line just in from the bottom: rules orange, no underline yet.
    await place("end");
    await page.waitForTimeout(300);
    const lastItem = items(page).last();
    expect((await rule(lastItem)).opacity).toBeGreaterThan(0.9);
    expect(scaleX((await underline(page)).transform)).toBeLessThan(0.1);

    // The closing line at the middle of the screen: rules grey, underline drawn.
    await place("center");
    await expect.poll(async () => (await rule(lastItem)).opacity).toBeLessThan(0.05);
    await expect.poll(async () => scaleX((await underline(page)).transform)).toBeGreaterThan(0.95);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/pain-turn.png` });

    // Back down the page: it reverses.
    await place("end");
    await expect.poll(async () => (await rule(lastItem)).opacity).toBeGreaterThan(0.9);
  });
});
