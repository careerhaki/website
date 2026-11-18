// The site footer on a phone and a desktop: its links, no broken social or
// WhatsApp links before their addresses are set, the still version with
// "reduce motion" on (the default for these tests), and motion B (reveal,
// desktop) with A (settle) with it off.
import { expect, test } from "@playwright/test";

const footer = (page) => page.locator("body > footer");
const inner = (page) => page.locator("[data-footer-inner]");
const settle = (page) => page.locator("footer [data-settle]");

const toEnd = (page) =>
  page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

/** Each settling part's opacity and vertical offset in pixels. */
const parts = (page) =>
  settle(page).evaluateAll((els) =>
    els.map((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { opacity: Number(getComputedStyle(el).opacity), y: Math.round(m.m42) };
    }),
  );

/** How far the footer's content is still tucked up, in pixels (0 = in place). */
const tucked = (page) =>
  inner(page).evaluate((el) => Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42));

test("footer: logo line, three columns, legal links, nothing broken", async ({ page }) => {
  await page.goto("/");
  await expect(footer(page)).toHaveCount(1);
  await expect(footer(page).getByRole("link", { name: "CareerHaki home" })).toHaveAttribute("href", "/");
  await expect(footer(page)).toContainText("Based in Ottawa");
  const nav = footer(page).getByRole("navigation", { name: "Footer" });
  await expect(nav.getByRole("heading", { level: 2 })).toHaveText(["The program", "Explore", "Talk to us"]);
  await expect(nav.getByRole("link")).toHaveText([
    "The Ascent",
    "Results",
    "Mentors",
    "GrowthHaki",
    "For employers",
    "About",
    "Book a discovery call",
    "Employer enquiry",
  ]);
  await expect(nav.getByRole("link", { name: "Book a discovery call" })).toHaveAttribute("href", "/book-a-call");
  const legal = footer(page).getByRole("navigation", { name: "Legal" });
  await expect(legal.getByRole("link")).toHaveText(["Privacy", "Terms"]);
  await expect(footer(page)).toContainText(`© ${new Date().getFullYear()} CareerHaki`);
  // No address is set yet, so no WhatsApp, LinkedIn or Instagram link, and
  // no link that goes nowhere.
  await expect(footer(page).locator('a[href="#"], a[href=""]')).toHaveCount(0);
  await expect(footer(page)).not.toContainText(/WhatsApp|LinkedIn|Instagram|price|fee|guarantee/i);
});

test("footer: every link is a 44px touch target", async ({ page }) => {
  await page.goto("/");
  const heights = await footer(page)
    .getByRole("link")
    .evaluateAll((links) => links.map((a) => Math.round(a.getBoundingClientRect().height)));
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
});

test("footer: reduce motion shows the still version", async ({ page }) => {
  await page.goto("/");
  await toEnd(page);
  await page.waitForTimeout(200);
  expect(await tucked(page)).toBe(0);
  for (const p of await parts(page)) expect(p).toEqual({ opacity: 1, y: 0 });
  await footer(page).scrollIntoViewIfNeeded();
  await footer(page).getByRole("link", { name: "Results" }).focus();
  await expect(footer(page).getByRole("link", { name: "Results" })).toBeFocused();
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("A: the columns rise as the footer arrives and have settled at the end of the page", async ({ page }, testInfo) => {
    await page.goto("/");
    await footer(page).evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.92);
    });
    await page.waitForTimeout(200);
    const arriving = await parts(page);
    expect(arriving.some((p) => p.opacity < 1), "still rising as it arrives").toBe(true);

    await toEnd(page);
    await page.waitForTimeout(300);
    for (const p of await parts(page)) expect(p).toEqual({ opacity: 1, y: 0 });
    expect(await tucked(page), "in place at the end").toBe(0);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/footer.png` });
  });

  test("B: on desktop the footer slides out from under the page; not on phones", async ({ page }, testInfo) => {
    await page.goto("/");
    await footer(page).evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.85);
    });
    await page.waitForTimeout(200);
    if (testInfo.project.name === "desktop") {
      expect(await tucked(page), "tucked up under the page").toBeLessThan(-20);
      const main = await page.locator("#main").evaluate((el) => getComputedStyle(el).boxShadow);
      expect(main).not.toBe("none");
    } else {
      expect(await tucked(page)).toBe(0);
    }
  });

  test("keyboard: a focused footer link is in place and not covered by the page", async ({ page }) => {
    await page.goto("/");
    await footer(page).evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.85);
    });
    await page.waitForTimeout(200);
    const link = footer(page).getByRole("link", { name: "The Ascent" });
    await link.focus();
    await page.waitForTimeout(200);
    expect(await tucked(page)).toBe(0);
    for (const p of await parts(page)) expect(p).toEqual({ opacity: 1, y: 0 });
    const onTop = await link.evaluate((a) => {
      const r = a.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + 4, r.top + r.height / 2);
      return a.contains(hit);
    });
    expect(onTop, "nothing covers the focused link").toBe(true);
  });
});
