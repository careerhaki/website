// The alumni logo strip (motion L, the spotlight belt) on a phone and a
// desktop: content and the still version with "reduce motion" on (the
// default for these tests), then the drift, Pause and hover-to-stop with it
// off.
import { expect, test } from "@playwright/test";

const strip = (page) => page.locator("section#alumni");
const belt = (page) => page.locator("#alumni-belt");
const pause = (page) => strip(page).getByRole("button");
const isPhone = (testInfo) => testInfo.project.name === "phone";

/** Scroll to the strip, which adds the belt, and wait for it. */
const reach = async (page) => {
  await strip(page).scrollIntoViewIfNeeded();
  await expect(belt(page)).toHaveAttribute("data-ready", "");
  await expect(belt(page).locator("[data-row] > *")).toHaveCount(4);
};

/** Current time (ms) and playback rate of every track's drift, base first. */
const drift = (page) =>
  belt(page).evaluate((el) =>
    [...el.querySelectorAll("[data-row] > *")].map((t) => {
      const [a] = t.getAnimations();
      return a ? { time: Number(a.currentTime), rate: a.playbackRate } : null;
    }),
  );

test("logo strip: sits under the hero, label, one list of 34 names, never clients", async ({ page }) => {
  await page.goto("/");
  // Right after the hero, before the pain section.
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("#main > section")].slice(0, 3).map((s) => s.id || s.getAttribute("aria-labelledby")),
  );
  expect(order[0]).toBe("hero-title");
  expect(order[1]).toBe("alumni");
  await expect(strip(page).locator("#alumni-label")).toHaveText("Where our alumni work");
  const list = strip(page).getByRole("list", { name: "Companies where our alumni work" });
  const names = await list.getByRole("listitem").allTextContents();
  expect(names).toHaveLength(34);
  expect(new Set(names).size).toBe(34);
  expect(names).toContain("The Ottawa Hospital");
  expect(names).toContain("Nature’s Touch");
  // The belt repeats every logo, so it is hidden from screen readers and its
  // images carry empty alternative text.
  await expect(belt(page)).toHaveAttribute("aria-hidden", "true");
  // With reduce motion on (these tests' default) the wall is added at once.
  await expect(belt(page)).toHaveAttribute("data-ready", "");
  const alts = await belt(page).locator("img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
  expect(alts.length).toBe(34 * 4);
  expect(alts.every((a) => a === "")).toBe(true);
  await expect(strip(page)).not.toContainText(/client|partner/i);
});

test("logo strip, still version: every logo shows at once, no button, nothing scrolls sideways", async ({ page }) => {
  await page.goto("/");
  await strip(page).scrollIntoViewIfNeeded();
  await expect(pause(page)).toBeHidden();
  await expect(belt(page)).toHaveAttribute("data-ready", "");
  const logos = belt(page).locator(":scope > div:first-child ul:not([data-copy]) img");
  await expect(logos).toHaveCount(34);
  const box = await strip(page).boundingBox();
  for (const b of await logos.evaluateAll((imgs) => imgs.map((i) => i.getBoundingClientRect().toJSON()))) {
    expect(b.width).toBeGreaterThan(0);
    expect(b.left).toBeGreaterThanOrEqual(box.x - 1);
    expect(b.right).toBeLessThanOrEqual(box.x + box.width + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize().width,
  );
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("logo strip: the belt waits for the visitor, in a held space, so nothing moves", async ({ page }, testInfo) => {
    const logos = [];
    page.on("request", (r) => {
      if (/logos?|\/media\/(google|adastra)/.test(r.url()) && !r.url().includes("careerhaki-logo")) logos.push(r.url());
    });
    await page.goto("/");
    await page.waitForTimeout(1500);
    // Below the fold on load: no logo is fetched until the visitor moves.
    if (isPhone(testInfo)) {
      await expect(belt(page)).not.toHaveAttribute("data-ready", "");
      expect(logos).toEqual([]);
    }
    const held = (await belt(page).boundingBox()).height;
    expect(held).toBeGreaterThan(80);
    const below = await page.locator("#main > section").nth(2).evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await reach(page);
    expect(Math.abs((await belt(page).boundingBox()).height - held)).toBeLessThan(2);
    const after = await page.locator("#main > section").nth(2).evaluate((el) => el.getBoundingClientRect().top + scrollY);
    expect(Math.abs(after - below)).toBeLessThan(2);
  });

  test("logo strip: the rows drift, the colour copy moves with them, every logo loads", async ({ page }) => {
    await page.goto("/");
    await reach(page);
    const first = await drift(page);
    expect(first).toHaveLength(4);
    await page.waitForTimeout(600);
    const later = await drift(page);
    for (let i = 0; i < 4; i += 1) expect(later[i].time).toBeGreaterThan(first[i].time);
    // Base row and its spotlight copy run the same clock.
    expect(Math.abs(later[0].time - later[2].time)).toBeLessThan(50);
    expect(Math.abs(later[1].time - later[3].time)).toBeLessThan(50);
    // No logo waits to load until it drifts into view.
    await expect
      .poll(() => belt(page).locator("img").evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)))
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize().width,
    );
  });

  test("logo strip: Pause stops both rows and becomes Play; Play starts them again", async ({ page }) => {
    await page.goto("/");
    await reach(page);
    const button = pause(page);
    await expect(button).toHaveAccessibleName("Pause the logos");
    expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await button.click();
    await expect(button).toHaveAccessibleName("Play the logos");
    await expect(button).toHaveText("Play");
    await expect.poll(async () => (await drift(page)).every((d) => d.rate === 0)).toBe(true);
    const still = await drift(page);
    await page.waitForTimeout(400);
    expect(await drift(page)).toEqual(still);
    await button.click();
    await expect(button).toHaveAccessibleName("Pause the logos");
    await expect.poll(async () => (await drift(page)).every((d) => d.rate === 1)).toBe(true);
  });

  test("logo strip: pointing at a row eases that row to a stop (desktop only)", async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), "Hover-to-stop is for real pointers only.");
    await page.goto("/");
    await reach(page);
    const row = belt(page).locator(":scope > div:first-child > [data-row='0']");
    const box = await row.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(async () => (await drift(page)).map((d) => d.rate)).toEqual([0, 1, 0, 1]);
    await page.mouse.move(box.x + box.width / 2, box.y - 120);
    await expect.poll(async () => (await drift(page)).map((d) => d.rate)).toEqual([1, 1, 1, 1]);
  });
});
