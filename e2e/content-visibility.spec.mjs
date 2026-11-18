// Below-the-fold sections use content-visibility: auto, so the browser skips
// laying them out and painting them until they near the screen. These tests
// check that the trick is on, that the placeholder sizes are close enough
// that the page does not jump, and that nothing is lost: text is still in the
// page for search and find-in-page, and the motion tests in the other files
// still pass with it on.
import { expect, test } from "@playwright/test";

const sections = [
  { name: "pain", selector: "main > section:nth-of-type(2)" },
  { name: "ascent", selector: "#the-ascent" },
];

/** Height of a section and whether the browser is currently skipping it. */
const state = (page, selector) =>
  page.locator(selector).evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    cv: getComputedStyle(el).contentVisibility,
    // The section's own box is always drawn; its children are what the
    // browser skips. checkVisibility reports that with contentVisibilityAuto.
    skipped: !el.firstElementChild.checkVisibility({ contentVisibilityAuto: true }),
  }));

for (const { name, selector } of sections) {
  test(`${name}: skipped until near the screen, placeholder within 8% of the real height`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const before = await state(page, selector);
    expect(before.cv).toBe("auto");

    await page.locator(selector).scrollIntoViewIfNeeded();
    await expect.poll(async () => (await state(page, selector)).skipped).toBe(false);
    const after = await state(page, selector);

    // Placeholder close to the drawn height, so the scrollbar does not jump.
    expect(Math.abs(after.height - before.height) / after.height).toBeLessThan(0.08);
  });
}

// Chrome draws anything within about one and a half screens of the
// viewport, so a section is skipped at load only if it starts further down
// than that. On the phone that is the Ascent today; on a 1440x900 desktop
// both sections are close enough to be drawn at once.
test("sections far below the fold are skipped at load", async ({ page }, testInfo) => {
  await page.goto("/");
  const far = await page.evaluate(
    (selectors) =>
      selectors.filter((s) => document.querySelector(s).getBoundingClientRect().top > innerHeight * 2.6),
    sections.map((s) => s.selector),
  );
  if (testInfo.project.name === "phone") expect(far).toContain("#the-ascent");
  for (const selector of far) expect((await state(page, selector)).skipped, selector).toBe(true);
});

test("skipped text is still in the page for search and find-in-page", async ({ page }) => {
  const html = await (await page.request.get("/")).text();
  expect(html).toContain("Start strong in the new job.");
  await page.goto("/");
  await expect(page.locator("#the-ascent")).toContainText("Open-ended");
});

test("a link to #the-ascent still lands just under the navigation", async ({ page }) => {
  await page.goto("/#the-ascent");
  await page.evaluate(() => document.fonts.ready);
  // The sections above may be placeholders when the jump happens; once
  // everything is drawn the section must still sit under the bar.
  await expect
    .poll(async () => {
      const top = await page.locator("#the-ascent").evaluate((el) => el.getBoundingClientRect().top);
      const head = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
      return top - head;
    })
    .toBeGreaterThanOrEqual(0);
  const top = await page.locator("#the-ascent").evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeLessThan(160);
});

test("nothing inside a section is clipped once it is drawn", async ({ page }) => {
  await page.goto("/");
  for (const { selector } of sections) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    const clipped = await page.locator(selector).evaluate((root) => {
      const box = root.getBoundingClientRect();
      return [...root.querySelectorAll("*")]
        .filter((el) => el.checkVisibility())
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1;
        })
        .map((el) => el.className || el.tagName);
    });
    expect(clipped, "elements reaching outside their section").toEqual([]);
  }
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("ascent: the climb's marker and stepped cards stay inside the section", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the marker is desktop only");
    await page.goto("/");
    const list = page.locator("#the-ascent [data-stages]");
    // Midway through the climb, where the cards and the marker move most.
    await list.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.5);
    });
    const inside = await page.locator("#the-ascent").evaluate((root) => {
      const box = root.getBoundingClientRect();
      const list = root.querySelector("[data-stages]");
      return [...list.children, list.previousElementSibling].every((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= box.top && r.bottom <= box.bottom;
      });
    });
    expect(inside).toBe(true);
  });

  test("ascent: the phone stage bar still sticks under the navigation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "the bar is phones and tablets only");
    await page.goto("/");
    const bar = page.locator("#the-ascent > div[aria-hidden='true']");
    await page.locator("#the-ascent [data-stages] > li").nth(1).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 200));
    const top = await bar.evaluate((el) => el.getBoundingClientRect().top);
    const head = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThanOrEqual(head + 2);
  });
});
