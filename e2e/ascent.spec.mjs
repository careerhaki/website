// The Ascent on a phone and a desktop: content, the still version with
// "reduce motion" on (the default for these tests), and H3 (the climb) and
// the fact row's reveal with it off.
import { expect, test } from "@playwright/test";

const INK = "rgb(38, 38, 38)";
const facts = [
  ["Weekly office hours", "A group session with Nithish every week, and a 1:1 with him whenever you need one."],
  ["Mentors in your field", "Engineers who work in your area coach you on skills, tools, communication and how you show up online, depending on what your plan needs."],
  ["A private chat space", "Ask questions between sessions and get answers from your mentors."],
  ["Open-ended", "You stay in the program until you’re hired, then through your first 90 days in the job."],
];

const section = (page) => page.locator("#the-ascent");
const stages = (page) => section(page).locator("[data-stages] > li");
const factRow = (page) => section(page).locator("[data-facts]");

/** Card tops relative to the stages list, Thrive's background, the marker. */
const layout = (page) =>
  section(page).evaluate((root) => {
    const listElement = root.querySelector("[data-stages]");
    const list = listElement.getBoundingClientRect();
    const cards = [...listElement.children];
    // The marker is the element just before the list.
    const markerStyle = getComputedStyle(listElement.previousElementSibling);
    return {
      tops: cards.map((card) => Math.round(card.getBoundingClientRect().top - list.top)),
      lefts: cards.map((card) => Math.round(card.getBoundingClientRect().left - list.left)),
      // How dark Thrive is, 0 (surface) to 1 (ink): the one value its colours
      // are mixed from.
      thrive: Number(getComputedStyle(cards[2]).getPropertyValue("--dark")),
      marker: markerStyle.display === "none" ? null : markerStyle.translate,
    };
  });

/** Scroll so the stages list's top sits at a fraction of the screen height. */
const placeStages = (page, fraction) =>
  section(page)
    .locator("[data-stages]")
    .evaluate((list, f) => {
      const top = list.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * f);
    }, fraction);

test("ascent: title, three stages in order, four confirmed facts", async ({ page }) => {
  await page.goto("/");
  await expect(section(page).getByRole("heading", { level: 2 })).toHaveText("The Ascent");
  await expect(stages(page).getByRole("heading", { level: 3 })).toHaveText([
    "Prepare",
    "Land",
    "Thrive",
  ]);
  const items = factRow(page).locator("> li");
  await expect(items).toHaveCount(4);
  for (const [i, [label, line]] of facts.entries()) {
    await expect(items.nth(i)).toContainText(label);
    await expect(items.nth(i)).toContainText(line);
  }
  // Out-of-date or unconfirmed claims never appear.
  await expect(section(page)).not.toContainText(/1:1 every week|weekly 1:1|platform session|price|fee|guarantee/i);
});

test("ascent: reduce motion shows the still version", async ({ page }, testInfo) => {
  await page.goto("/");
  await placeStages(page, 0.2);
  await page.waitForTimeout(300);
  const { tops, thrive, marker } = await layout(page);
  expect(thrive).toBe(1);
  expect(marker).toBeNull();
  if (testInfo.project.name === "desktop") {
    // Stepped: Prepare lowest, 36px a step.
    expect(tops[0] - tops[2]).toBe(72);
    expect(tops[1] - tops[2]).toBe(36);
  }
  await expect(section(page).locator("div[aria-hidden=true]"), "no stage bar").toBeHidden();
  await expect(factRow(page)).not.toHaveAttribute("data-facts-ready");
  const opacities = await factRow(page)
    .locator("> li")
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity));
  expect(opacities).toEqual(["1", "1", "1", "1"]);
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("H3 desktop: level, then climbing into steps, Thrive dark at the top, and back", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the climb is the desktop layout");
    await page.goto("/");

    await placeStages(page, 0.95);
    await page.waitForTimeout(200);
    let now = await layout(page);
    expect(Math.abs(now.tops[0] - now.tops[1]), "level").toBeLessThanOrEqual(1);
    expect(Math.abs(now.tops[0] - now.tops[2]), "level").toBeLessThanOrEqual(1);
    expect(now.thrive).toBe(0);
    expect(now.marker).not.toBeNull();

    await placeStages(page, 0.25);
    await page.waitForTimeout(200);
    now = await layout(page);
    expect(now.tops[0] - now.tops[2], "stepped").toBe(72);
    expect(now.tops[1] - now.tops[2], "stepped").toBe(36);
    expect(now.thrive).toBe(1);
    // The marker has hopped to Thrive: 30px into it, 18px above it.
    const [x, y] = now.marker.split(" ").map(parseFloat);
    expect(Math.abs(x - (now.lefts[2] + 30))).toBeLessThanOrEqual(2);
    expect(Math.abs(y - (now.tops[2] - 18))).toBeLessThanOrEqual(2);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/ascent-climbed.png` });

    await placeStages(page, 0.95);
    await page.waitForTimeout(200);
    now = await layout(page);
    expect(Math.abs(now.tops[0] - now.tops[2]), "level again").toBeLessThanOrEqual(1);
  });

  test("H3 phone: the stage bar follows the card being read, Thrive darkens", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "the stage bar is the phone layout");
    await page.goto("/");
    const bar = section(page).locator("div[aria-hidden=true]");
    const labels = bar.locator("span:not(:last-child)");
    const colours = () =>
      labels.evaluateAll((spans) => spans.map((span) => getComputedStyle(span).color));
    const ink = INK;

    // Land's top a little above the middle of the screen.
    await stages(page).nth(1).evaluate((card) => {
      const top = card.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.4);
    });
    await page.waitForTimeout(200);
    await expect(bar).toBeVisible();
    const box = await bar.boundingBox();
    expect(box.y, "stuck under the navigation").toBeLessThan(90);
    const now = await colours();
    expect(now[1]).toBe(ink);
    expect(now[0]).not.toBe(ink);
    expect(now[2]).not.toBe(ink);
    expect((await layout(page)).thrive).toBe(0);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/ascent-bar.png` });

    // Thrive past the middle: dark, and its label is the current one.
    await stages(page).nth(2).evaluate((card) => {
      const top = card.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.3);
    });
    await page.waitForTimeout(200);
    expect((await layout(page)).thrive).toBe(1);
    expect((await colours())[2]).toBe(ink);
  });

  test("facts: wait for the climb, then the hairline draws and the facts rise", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(factRow(page)).toHaveAttribute("data-facts-ready", "");
    await expect(factRow(page)).not.toHaveAttribute("data-facts-in");

    // Bring the stages to the top of the screen, past the climb, then the
    // facts into view.
    await placeStages(page, 0.1);
    await factRow(page).evaluate((row) => row.scrollIntoView({ block: "center" }));
    await expect(factRow(page)).toHaveAttribute("data-facts-in", "");
    await expect
      .poll(() =>
        factRow(page)
          .locator("> li")
          .last()
          .evaluate((element) => getComputedStyle(element).opacity),
      )
      .toBe("1");
  });
});
