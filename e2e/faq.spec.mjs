// The FAQ on a phone and a desktop: copy, opening by pointer and keyboard,
// the still version with "reduce motion" on (the default for these tests),
// and motion A (rules draw in), C (the heading holds still on desktop) and
// D (the answer arrives) with it off.
import { expect, test } from "@playwright/test";

const questions = [
  "Is this for me if I’m just starting out, or moving into a new area of tech?",
  "Will my mentors know my field?",
  "Can I do this alongside a full-time job?",
  "How long until I get an offer?",
  "What if I’m not ready to apply yet?",
  "What if I already have interviews lined up?",
  "Will you find me the job?",
];

const section = (page) => page.locator("section#faq");
const items = (page) => section(page).locator("details");
const summaries = (page) => section(page).locator("summary");

/** Scroll so an element's top sits at a fraction of the screen height. */
const place = (locator, fraction) =>
  locator.evaluate((el, f) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * f);
  }, fraction);

/** How much of each question's hairline is drawn, 0 to 1. */
const rules = (page) =>
  items(page).evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el, "::before").scale;
      return s === "none" ? 1 : Math.round(parseFloat(s.split(" ")[0]) * 100) / 100;
    }),
  );

test("faq: heading, seven questions, closed at first, nothing on cost", async ({ page }) => {
  await page.goto("/");
  await expect(section(page).getByRole("heading", { level: 2 })).toHaveText("Before you book");
  await expect(summaries(page)).toHaveText(questions);
  for (const open of await items(page).evaluateAll((els) => els.map((el) => el.open))) {
    expect(open).toBe(false);
  }
  await expect(section(page)).not.toContainText(/price|cost|fee|free|guarantee|refund|\[NEED|\[ASSUMED/i);
  // The only figures are confirmed proof.
  await expect(section(page)).toContainText("1 to 4 months");
  await expect(section(page)).toContainText("120+");
});

test("faq: sits between the people section and the end of the page", async ({ page }) => {
  await page.goto("/");
  const ids = await page.locator("#main > section").evaluateAll((els) => els.map((el) => el.id));
  expect(ids.indexOf("faq")).toBe(ids.indexOf("team") + 1);
});

test("faq: a click opens an answer and the plus turns into a minus; a second click closes it", async ({
  page,
}) => {
  await page.goto("/");
  const first = items(page).first();
  const bar = (el) =>
    el.locator("summary span[aria-hidden]").evaluate((s) => getComputedStyle(s, "::after").transform);
  const closedBar = await bar(first);
  await summaries(page).first().click();
  await expect(first).toHaveJSProperty("open", true);
  await expect(first.locator("p")).toBeVisible();
  await expect(first.locator("p")).toContainText("count as experience");
  expect(await bar(first)).not.toBe(closedBar);
  await summaries(page).first().click();
  await expect(first).toHaveJSProperty("open", false);
});

test("faq: keyboard reaches every question, Enter opens it, and the ring shows", async ({ page }) => {
  await page.goto("/");
  const second = summaries(page).nth(1);
  await second.focus();
  await expect(second).toBeFocused();
  expect(await second.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(items(page).nth(1)).toHaveJSProperty("open", true);
  await expect(items(page).nth(1).locator("p")).toBeVisible();
  const h = await second.evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeGreaterThanOrEqual(44);
});

test("faq: still version, every hairline in place", async ({ page }) => {
  await page.goto("/");
  await place(section(page), 0.9);
  expect(new Set(await rules(page))).toEqual(new Set([1]));
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("A: a question just below the screen has its rule undrawn; in view, drawn and settled", async ({
    page,
  }) => {
    await page.goto("/");
    const last = items(page).last();
    await place(last, 1.02);
    await page.waitForTimeout(150);
    expect((await rules(page)).at(-1)).toBeLessThan(0.5);
    await place(last, 0.5);
    await page.waitForTimeout(150);
    expect((await rules(page)).at(-1)).toBe(1);
    const opacity = await summaries(page)
      .last()
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBe(1);
  });

  test("A: every question is settled at the very end of the page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    const opacities = await summaries(page).evaluateAll((els) =>
      els.map((el) => Number(getComputedStyle(el).opacity)),
    );
    for (const o of opacities) expect(o).toBe(1);
  });

  test("D: an opened answer ends at full strength", async ({ page }) => {
    await page.goto("/");
    await place(section(page), 0.1);
    await summaries(page).nth(2).click();
    const p = items(page).nth(2).locator("p");
    await expect.poll(() => p.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    await expect(p).toBeVisible();
  });

  test("C desktop: the heading holds still while the questions pass", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "side by side from 860px");
    await page.goto("/");
    // Open two answers so the list is taller than the heading's travel.
    await place(section(page), 0.1);
    await summaries(page).nth(0).click();
    await summaries(page).nth(1).click();
    await page.waitForTimeout(500);
    const head = section(page).locator("h2");
    const list = summaries(page).last();
    await place(section(page), -0.05);
    const a = await head.evaluate((el) => el.getBoundingClientRect().top);
    const l1 = await list.evaluate((el) => el.getBoundingClientRect().top);
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.waitForTimeout(100);
    const b = await head.evaluate((el) => el.getBoundingClientRect().top);
    const l2 = await list.evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(a - b)).toBeLessThan(2);
    expect(l1 - l2).toBeGreaterThan(100);
  });

  test("nothing in the section widens the page", async ({ page }) => {
    await page.goto("/");
    await place(section(page), 0.5);
    await summaries(page).first().click();
    await page.waitForTimeout(500);
    const wide = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(wide).toBe(false);
  });
});
