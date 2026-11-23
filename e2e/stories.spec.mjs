// Homepage success stories (layout A, M2 time bars, M3 stacked stories on
// phones) on a phone and a desktop: approved text only, markup, the still
// version with "reduce motion" on (the default for these tests), and the
// motion with it off.
import { expect, test } from "@playwright/test";

const section = (page) => page.locator("section#stories");
const cards = (page) => section(page).locator("article");
const fills = (page) => section(page).locator("[aria-hidden='true'] > span");
const isPhone = (testInfo) => testInfo.project.name === "phone";

/** Each bar's horizontal scale, 0 to 1 (1 = full). */
const fillScale = (page) =>
  fills(page).evaluateAll((els) =>
    els.map((el) => {
      const t = getComputedStyle(el).transform;
      return t === "none" ? 1 : Math.round(new DOMMatrixReadOnly(t).a * 100) / 100;
    }),
  );

test("stories: copy, the three stories in order, after the results band and before the people", async ({ page }) => {
  await page.goto("/");
  await expect(section(page).getByText("Where they started", { exact: true })).toBeVisible();
  await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(
    "Applying for months, graduated with internships, stuck at Amazon.",
  );
  await expect(section(page)).toContainText(
    "All three had support through their first 90 days in the new job, and Nithish still talks to them regularly.",
  );
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveText([
    "9 months of applying, then TS Imagine in under 4 weeks",
    "From internships to cloud engineering in almost 3 months",
    "Amazon engineer to senior developer at CIHI in 2 months",
  ]);
  await expect(section(page)).toContainText(
    "Karandeep’s offer came faster than most. An offer typically takes 1 to 4 months, and 82 in 100 students land a role.",
  );
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")].map((s) => s.id).filter(Boolean),
  );
  expect(order.indexOf("stories")).toBe(order.indexOf("results") + 1);
  expect(order.indexOf("team")).toBe(order.indexOf("stories") + 1);
  await expect(section(page)).not.toContainText(/price|fee|guarantee|\[CONFIRM|\[ASSUMED/i);
});

test("stories: card markup, plain-text numbers, decorative bars and logos, no quote mark", async ({ page }) => {
  await page.goto("/");
  await expect(cards(page)).toHaveCount(3);
  for (const [i, [name, role]] of [
    ["Karandeep Singh", "Data engineer, TS Imagine"],
    ["Rahul Patel", "Senior AWS engineer, Adastra"],
    ["Dheeraj Puttapaka", "Senior software developer, CIHI"],
  ].entries()) {
    const card = cards(page).nth(i);
    await expect(card.locator(":scope > h3")).toHaveCount(1);
    await expect(card.locator("figure > blockquote")).toHaveCount(1);
    await expect(card.locator("figure > figcaption")).toContainText(name);
    await expect(card.locator("figure > figcaption")).toContainText(role);
    await expect(card.locator("cite")).toHaveCount(0);
    // Logos are in one colour and decorative.
    const logo = card.locator("figcaption img").last();
    await expect(logo).toHaveAttribute("alt", "");
    expect(await logo.evaluate((el) => getComputedStyle(el).filter)).toContain("grayscale(1)");
  }
  await expect(cards(page).first()).toContainText(
    "I applied for more than 9 months and started doubting myself. Nithish showed me where I was going wrong. We repositioned my profile and aimed it at fintech. I had an offer in under 4 weeks.",
  );
  // The bar numbers are plain text; the bars themselves are hidden from screen readers.
  for (const text of ["On his own", "9+ months applying", "With CareerHaki", "Offer in under 4 weeks", "Almost 3 months", "2 months"]) {
    await expect(section(page).getByText(text, { exact: true })).toBeVisible();
  }
  await expect(fills(page)).toHaveCount(4);
  // No photos or LinkedIn links until they are set: no placeholder, no dead link.
  await expect(section(page).locator("figcaption a")).toHaveCount(0);
  await expect(section(page).locator("figcaption img")).toHaveCount(3);
  // The closing action is a text link, not an orange button.
  const link = section(page).getByRole("link", { name: /Tell us where you’re starting on a discovery call/ });
  await expect(link).toHaveAttribute("href", "/book-a-call");
  expect(await link.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(await link.evaluate((a) => a.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
});

test("stories: layout A, the featured panel and two columns beside it on desktop", async ({ page }, testInfo) => {
  await page.goto("/");
  const featured = cards(page).first();
  expect(await featured.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(242, 234, 223)");
  expect(await cards(page).nth(1).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  const a = await featured.boundingBox();
  const b = await cards(page).nth(1).boundingBox();
  const c = await cards(page).nth(2).boundingBox();
  if (isPhone(testInfo)) {
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
  } else {
    expect(b.x).toBeGreaterThan(a.x + a.width);
    expect(Math.round(c.x)).toBe(Math.round(b.x));
    expect(c.y).toBeGreaterThan(b.y);
  }
});

test("stories: still version, bars full and nothing sticks", async ({ page }) => {
  await page.goto("/");
  await section(page).scrollIntoViewIfNeeded();
  expect(await fillScale(page)).toEqual([1, 1, 1, 1]);
  const positions = await section(page)
    .locator("article")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el.parentElement).position));
  expect(positions).not.toContain("sticky");
});

test("stories: with motion, bars fill with the scroll and are full at the bottom of the page", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  // Before the section reaches the screen, the bars are empty.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  expect(Math.max(...(await fillScale(page)))).toBeLessThan(0.05);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => fillScale(page)).toEqual([1, 1, 1, 1]);
  // M3: on phones the two smaller stories stick in turn; on desktop they don't.
  const positions = await section(page)
    .locator("article")
    .evaluateAll((els) => els.slice(1).map((el) => getComputedStyle(el.parentElement).position));
  expect(positions).toEqual(isPhone(testInfo) ? ["sticky", "sticky"] : ["static", "static"]);
});

test("stories: no sideways scroll on a 360px phone", async ({ page }) => {
  for (const reducedMotion of ["reduce", "no-preference"]) {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await section(page).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  }
});

test("stories: keyboard order follows reading order, and focus lands on the booking link", async ({ page }) => {
  await page.goto("/");
  const focusables = await section(page)
    .locator("a, button, [tabindex]")
    .evaluateAll((els) => els.map((el) => el.textContent.trim()));
  expect(focusables).toEqual(["Tell us where you’re starting on a discovery call→"]);
  // Tab from the results band's last stop lands on the link, then leaves the section.
  await section(page).locator("h2").evaluate((h) => {
    h.tabIndex = -1;
    h.focus();
  });
  await page.keyboard.press("Tab");
  await expect(section(page).getByRole("link")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.closest("section")?.id)).toBe("team");
});
