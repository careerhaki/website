// Person cards on a phone and a desktop: content, the still version with
// "reduce motion" on (the default for these tests), and with it off:
// B (swipe row, phones), A (rise in turn, desktop) and C (lift on hover and
// keyboard focus).
import { expect, test } from "@playwright/test";

const section = (page) => page.locator("section#team");
const row = (page) => section(page).getByRole("list");
const items = (page) => row(page).locator(":scope > li");
const card = (page, name) => section(page).locator("article").filter({ hasText: name });

const isPhone = (testInfo) => testInfo.project.name === "phone";

/** Opacity, vertical offset and scale of each card's list item. */
const itemState = (page) =>
  items(page).evaluateAll((els) =>
    els.map((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return {
        opacity: Number(getComputedStyle(el).opacity),
        y: Math.round(m.m42),
        scale: Math.round(m.a * 100) / 100,
      };
    }),
  );

const lift = (locator) =>
  locator.evaluate((el) => Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42));

test("people: heading, two co-founder cards, each links to its About anchor", async ({ page }) => {
  await page.goto("/");
  await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(
    "Two founders, and mentors who work in your field.",
  );
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveText([
    "Nithish Reddy",
    "Bhogeshwar Reddy",
  ]);
  await expect(card(page, "Nithish Reddy")).toContainText("1,400+ students");
  await expect(section(page).getByRole("link", { name: "About Nithish" })).toHaveAttribute(
    "href",
    "/about#nithish",
  );
  await expect(section(page).getByRole("link", { name: "About Bhogeshwar" })).toHaveAttribute(
    "href",
    "/about#bhogeshwar",
  );
  // Every card has a link, so the row needs no tab stop of its own.
  await expect(row(page)).not.toHaveAttribute("tabindex");
  await expect(section(page)).not.toContainText(/price|fee|guarantee|\[NEED/i);
});

test("people: the whole card opens its link, and the link is a 44px target", async ({ page }) => {
  await page.goto("/");
  const target = card(page, "Nithish Reddy");
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href") ?? null,
    [box.x + 24, box.y + 24],
  );
  expect(hit, "a click near the card's top corner opens the link").toBe("/about#nithish");
  const h = await section(page).getByRole("link", { name: "About Nithish" }).evaluate((a) => a.getBoundingClientRect().height);
  expect(h).toBeGreaterThanOrEqual(44);
});

test("people: phones swipe a row, desktop shows a grid; nothing scrolls the page sideways", async ({ page }, testInfo) => {
  await page.goto("/");
  await row(page).scrollIntoViewIfNeeded();
  const r = await row(page).evaluate((el) => ({
    display: getComputedStyle(el).display,
    overflow: getComputedStyle(el).overflowX,
    snap: getComputedStyle(el).scrollSnapType,
  }));
  if (isPhone(testInfo)) {
    expect(r).toEqual({ display: "flex", overflow: "auto", snap: "x mandatory" });
    // The second card peeks in from the edge.
    const second = await items(page).nth(1).boundingBox();
    expect(second.x).toBeLessThan(page.viewportSize().width);
  } else {
    expect(r.display).toBe("grid");
  }
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sideways).toBeLessThanOrEqual(0);
});

test("people: reduce motion shows the still version", async ({ page }) => {
  await page.goto("/");
  await row(page).scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  for (const s of await itemState(page)) expect(s).toEqual({ opacity: 1, y: 0, scale: 1 });
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("A (desktop): cards rise in turn as the row arrives and settle in view", async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), "A runs from 860px");
    await page.goto("/");
    await row(page).evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.95);
    });
    await page.waitForTimeout(200);
    const arriving = await itemState(page);
    expect(arriving[0].y, "first card still rising").toBeGreaterThan(0);
    expect(arriving[1].y, "second card behind the first").toBeGreaterThanOrEqual(arriving[0].y);

    await row(page).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(200);
    for (const s of await itemState(page)) expect(s).toEqual({ opacity: 1, y: 0, scale: 1 });
  });

  test("B (phone): the middle card is full size and its neighbour steps back, and swapping follows the swipe", async ({ page }, testInfo) => {
    test.skip(!isPhone(testInfo), "B runs under 860px");
    await page.goto("/");
    await row(page).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(200);
    let [first, second] = await itemState(page);
    expect(first.scale).toBe(1);
    expect(second.scale).toBeLessThan(1);
    expect(second.opacity, "never dimmed: full contrast").toBe(1);

    await row(page).evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
    await page.waitForTimeout(300);
    [first, second] = await itemState(page);
    expect(second.scale).toBe(1);
    expect(first.scale).toBeLessThan(1);
  });

  test("C: hovering or tabbing to a card lifts it", async ({ page }, testInfo) => {
    await page.goto("/");
    const target = card(page, "Nithish Reddy");
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    expect(await lift(target)).toBe(0);
    await section(page).getByRole("link", { name: "About Nithish" }).focus();
    await page.waitForTimeout(400);
    expect(await lift(target), "lifted on keyboard focus").toBe(-6);
    if (!isPhone(testInfo)) {
      await page.locator("body").focus();
      await card(page, "Bhogeshwar Reddy").hover();
      await page.waitForTimeout(400);
      expect(await lift(card(page, "Bhogeshwar Reddy")), "lifted on hover").toBe(-6);
    }
    await page.evaluate(() => document.fonts.ready);
    await section(page).screenshot({ path: `screenshots/${testInfo.project.name}/people.png` });
  });
});
