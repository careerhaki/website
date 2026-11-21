// The call-to-action band on a phone and a desktop: copy and the booking
// button, the still version with "reduce motion" on (the default for these
// tests), motion A + B with it off (the second line slides into line, then
// the underline draws), and N2 (the navigation's button is an outline while
// this band's button is on screen).
import { expect, test } from "@playwright/test";

const band = (page) => page.locator("section#book");
const mark = (page) => band(page).locator("h2 span span");
const book = (page) => band(page).getByRole("link", { name: "Book a discovery call" });
const navCta = (page) =>
  page.getByRole("banner").getByRole("link", { name: "Book a call", exact: true });

/** Scroll so an element's top sits at a fraction of the screen height. */
const place = (locator, fraction) =>
  locator.evaluate((el, f) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * f);
  }, fraction);

/** How far the second line still sits to the right of the first, in pixels
    (0 = in line). */
const offset = (page) =>
  band(page)
    .locator("h2 > span")
    .evaluateAll(([a, b]) =>
      Math.round(b.getBoundingClientRect().left - a.getBoundingClientRect().left),
    );

/** How much of the underline is drawn, 0 to 1. */
const drawn = (page) =>
  mark(page).evaluate((el) => {
    const s = getComputedStyle(el, "::after").scale;
    return s === "none" ? 1 : Math.round(parseFloat(s.split(" ")[0]) * 100) / 100;
  });

const background = (page) =>
  navCta(page).evaluate((element) => getComputedStyle(element).backgroundColor);

test("call-to-action band: copy, one booking button, nothing on price", async ({ page }) => {
  await page.goto("/");
  await expect(band(page).getByRole("heading", { level: 2 })).toHaveText(
    "See how close you are to your next role.",
  );
  await expect(band(page)).toContainText("Your next step");
  await expect(band(page)).toContainText(
    "One of our two founders looks at the role you want next to the experience you have. You leave knowing what to fix first, whether or not you join The Ascent.",
  );
  await expect(band(page)).toContainText("Bring one job post you’d love to land.");
  await expect(book(page)).toHaveAttribute("href", "/book-a-call");
  await expect(book(page)).toHaveAttribute("data-hero-cta", "");
  // The WhatsApp number is set in module 1.5; until then there is no button.
  await expect(band(page).getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);
  await expect(band(page)).not.toContainText(/price|fee|free|guarantee|\[NEED|\[ASSUMED/i);
  // It is the last section of the page, right before the footer.
  const last = await page.locator("#main > section").last().getAttribute("id");
  expect(last).toBe("book");
});

test("call-to-action band: still version, lines aligned and the underline drawn", async ({ page }) => {
  await page.goto("/");
  await place(band(page), 0.9);
  expect(await offset(page)).toBe(0);
  expect(await drawn(page)).toBe(1);
});

test("call-to-action band: the button is a focusable 44px target with a visible ring", async ({ page }) => {
  await page.goto("/");
  await book(page).focus();
  await expect(book(page)).toBeFocused();
  const r = await book(page).evaluate((el) => ({
    h: el.getBoundingClientRect().height,
    outline: getComputedStyle(el).outlineStyle,
  }));
  expect(r.h).toBeGreaterThanOrEqual(44);
  expect(r.outline).toBe("solid");
});

test("N2: the navigation's button is an outline while the band's button is on screen", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "phone", "phone: checked once, on desktop");
  await page.goto("/");
  // Between the hero and the band: no orange booking button on screen.
  await place(band(page), 2);
  await expect.poll(() => background(page)).toBe("rgb(225, 112, 50)");
  await book(page).scrollIntoViewIfNeeded();
  await place(book(page), 0.5);
  await expect.poll(() => background(page)).toBe("rgba(0, 0, 0, 0)");
  await place(band(page), 2);
  await expect.poll(() => background(page)).toBe("rgb(225, 112, 50)");
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("B then A: the line starts out to the right, slides in, then the underline draws", async ({
    page,
  }) => {
    await page.goto("/");
    // The band's top just inside the bottom of the screen.
    await place(band(page), 0.97);
    await page.waitForTimeout(150);
    expect(await offset(page)).toBeGreaterThan(8);
    expect(await drawn(page)).toBe(0);
  });

  test("every part has finished at the very end of the page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    expect(await offset(page)).toBe(0);
    expect(await drawn(page)).toBe(1);
    const lead = await band(page)
      .locator("p")
      .nth(1)
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(lead).toBe(1);
  });

  test("nothing in the band widens the page while it moves", async ({ page }) => {
    await page.goto("/");
    await place(band(page), 0.97);
    await page.waitForTimeout(150);
    const wide = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(wide).toBe(false);
  });
});

test.describe("with motion, the lead", () => {
  test.use({ reducedMotion: "no-preference" });

  test("is at full strength whenever it is wholly on screen", async ({ page }) => {
    await page.goto("/");
    const lead = band(page).locator("p").nth(1);
    for (const f of [0.95, 0.8, 0.6, 0.4, 0.2]) {
      await place(band(page), f);
      await page.waitForTimeout(120);
      const s = await lead.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          inView: r.top >= 0 && r.bottom <= window.innerHeight,
          opacity: Number(getComputedStyle(el).opacity),
        };
      });
      if (s.inView) expect(s.opacity, `band top at ${f} of the screen`).toBe(1);
    }
  });
});
