// The Ascent page (/the-ascent), layout D: the copy word for word (the
// homepage's stages, the copy team's lines, the students' approved words),
// the story links both ways with Results, the phone bar, the still version
// and the scroll-driven motion. Phone and desktop.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const source = readFileSync(new URL("../src/content/stories.ts", import.meta.url), "utf8");
const ascentSource = readFileSync(new URL("../src/content/ascent.ts", import.meta.url), "utf8");

const INK = "rgb(38, 38, 38)";
const MUTED = "rgb(92, 88, 82)";
const isPhone = (testInfo) => testInfo.project.name === "phone";

/** One of a student's approved texts, read from stories.ts. */
function approved(id, field) {
  const start = source.indexOf(`id: "${id}"`);
  const block = source.slice(start, source.indexOf("placements:", start));
  return block.match(new RegExp(`\\b${field}:\\s*\\n?\\s*"([^"]+)"`))?.[1];
}

const stage = (page, id) => page.locator(`section#${id}`);
const bar = (page) => page.getByRole("navigation", { name: "Stage you’re reading" });

/** Scroll so an element's top sits at a fraction of the screen height. */
const place = (locator, fraction) =>
  locator.evaluate((el, f) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * f);
  }, fraction);

test("head: title, description, H1, lead and the stage index", async ({ page }) => {
  await page.goto("/the-ascent");
  await expect(page).toHaveTitle("The Ascent: Prepare, Land and Thrive | CareerHaki");
  await expect(page.locator("meta[name='description']")).toHaveAttribute(
    "content",
    "What you do in each stage of The Ascent, from your resume and mock interviews to your first 90 days in the new job, with mentors who work in your field.",
  );
  await expect(page.locator("main header p").first()).toHaveText("The CareerHaki program");
  await expect(page.locator("h1")).toHaveText("The Ascent");
  await expect(page.locator("main header p").nth(1)).toHaveText(
    "Three stages that take you from where you are now to your first 90 days in a better role.",
  );
  const index = page.getByRole("navigation", { name: "Stages", exact: true }).getByRole("link");
  await expect(index).toHaveText(["01Prepare ↓", "02Land ↓", "03Thrive ↓"]);
  expect(await index.evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual([
    "#prepare",
    "#land",
    "#thrive",
  ]);
});

test("three stages, the homepage's words, the copy team's lines and the student stories", async ({ page }) => {
  await page.goto("/the-ascent");
  await expect(page.locator("main section[data-stage] h2")).toHaveText(["Prepare", "Land", "Thrive"]);

  // The same stage copy as the homepage section, word for word.
  await page.goto("/");
  const homeStages = await page.locator("#the-ascent [data-stages] > li").allInnerTexts();
  await page.goto("/the-ascent");
  for (const [i, id] of ["prepare", "land", "thrive"].entries()) {
    const terms = await stage(page, id).locator("dt").allInnerTexts();
    for (const term of terms) expect(homeStages[i]).toContain(term);
    for (const p of await stage(page, id).locator("h2 ~ p").allInnerTexts()) {
      if (!p.startsWith("Start here") && !p.startsWith("You move") && !p.startsWith("All eight")) {
        expect(homeStages[i]).toContain(p);
      }
    }
  }

  // Every new line is the approved one from ascent.ts.
  for (const text of await page.locator("main dd").allInnerTexts()) expect(ascentSource).toContain(text);
  await expect(stage(page, "prepare")).toContainText("Start here if you’re not ready to apply yet.");
  await expect(stage(page, "land")).toContainText("Start here if you already have interviews lined up.");
  await expect(stage(page, "thrive")).toContainText("You move into Thrive once you’ve signed your offer.");
  await expect(stage(page, "thrive")).toContainText(
    "All eight students on our Results page had support through their first 90 days in the new job. Nithish still talks to them regularly.",
  );

  // One student under each stage, their approved words in quotes.
  const stories = [
    ["prepare", "haritha", "card", "What changed for Haritha is what Prepare covers"],
    ["land", "karandeep", "changed", "What changed for Karandeep is what Land covers"],
    ["thrive", "jothi", "first90Days", "Jothi on his first 90 days at KOHO"],
  ];
  for (const [id, student, field, label] of stories) {
    const panel = stage(page, id).locator("article");
    await expect(panel.locator("> p").first()).toHaveText(label);
    await expect(panel.locator("h3")).toHaveText(approved(student, "headline"));
    await expect(panel.locator("blockquote")).toHaveText(`“${approved(student, field)}”`);
    const link = panel.getByRole("link", { name: /full story/ });
    await expect(link).toHaveAttribute("href", `/results#${student}`);
  }
  // Bars only where approved; Karandeep's context line keeps his 4 weeks honest.
  await expect(stage(page, "prepare")).toContainText("Within 3 months");
  await expect(stage(page, "land").locator("[data-tone]")).toHaveCount(2);
  await expect(stage(page, "land")).toContainText(
    "Karandeep’s offer came faster than most. An offer typically takes 1 to 4 months, and 82 in 100 students land a role.",
  );
  await expect(stage(page, "thrive").locator("[data-tone]")).toHaveCount(2);
  await expect(stage(page, "thrive").locator("figcaption img"), "no KOHO or Wealthsimple file yet").toHaveCount(0);

  const text = await page.locator("main").textContent();
  expect(text).not.toMatch(/\bprices?\b|\bfees?\b|guarantee|4\.9|out of 5/i);
});

test("fact row and the call-to-action band end the page", async ({ page }) => {
  await page.goto("/the-ascent");
  const facts = page.locator("main [data-facts] > li");
  await expect(facts).toHaveCount(4);
  await expect(facts.first()).toContainText("Weekly office hours");
  await expect(page.locator("#book")).toBeVisible();
  await expect(page.locator("#book [data-hero-cta]")).toHaveAttribute("href", "/book-a-call");
});

test("a story link opens that story on Results; Results' stage links come back here", async ({ page }) => {
  await page.goto("/the-ascent");
  await stage(page, "land").getByRole("link", { name: /full story/ }).click();
  await expect(page).toHaveURL(/\/results#karandeep$/);
  await expect(page.locator("#karandeep details")).toHaveAttribute("open", "");

  const link = page.locator("#karandeep details a[href^='/the-ascent']");
  await expect(link).toHaveText("What changed for Karandeep is what Land covers in The Ascent →");
  await expect(link).toHaveAttribute("href", "/the-ascent#land");
  // Jothi's stays at Land (his What changed); Prathyusha's own line.
  await expect(page.locator("#jothi details a")).toHaveAttribute("href", "/the-ascent#land");
  await expect(page.locator("#prathyusha details a")).toHaveText("Switching fields starts with Prepare in The Ascent →");
  await link.click();
  await expect(page).toHaveURL(/\/the-ascent#land$/);
  await expect(stage(page, "land").locator("h2")).toBeInViewport();
});

test("a stage link lands the stage under the navigation (and the phone bar)", async ({ page }, testInfo) => {
  await page.goto("/the-ascent#thrive");
  const heading = stage(page, "thrive").locator("h2");
  await expect(heading).toBeInViewport();
  const top = await stage(page, "thrive").evaluate((el) => el.getBoundingClientRect().top);
  const covers = isPhone(testInfo) ? bar(page) : page.locator("header").first();
  const bottom = await covers.evaluate((el) => el.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(bottom - 1);
});

test("phone bar: under 860px only, sticky under the navigation, three links", async ({ page }, testInfo) => {
  await page.goto("/the-ascent");
  if (!isPhone(testInfo)) {
    await expect(bar(page)).toBeHidden();
    return;
  }
  await expect(bar(page).getByRole("link")).toHaveText(["Prepare", "Land", "Thrive"]);
  await place(stage(page, "land"), 0.3);
  await expect(bar(page)).toBeInViewport();
  const headBottom = await page.locator("header").first().evaluate((h) => h.getBoundingClientRect().bottom);
  const barTop = await bar(page).evaluate((el) => el.getBoundingClientRect().top);
  expect(barTop).toBeGreaterThan(0);
  expect(barTop).toBeLessThanOrEqual(headBottom + 1);
  // Solid, so the stages never show through.
  expect(await bar(page).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(250, 246, 240)");
  await bar(page).getByRole("link", { name: "Thrive" }).click();
  await expect(page).toHaveURL(/#thrive$/);
  await expect(stage(page, "thrive").locator("h2")).toBeInViewport();
});

test("still version (reduce motion): everything in place, bars full, band full width", async ({ page }) => {
  await page.goto("/the-ascent");
  await place(stage(page, "thrive"), 0.05);
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => {
    const thrive = document.querySelector("section#thrive");
    return {
      band: getComputedStyle(thrive, "::before").scale,
      rows: [...document.querySelectorAll("main dl > div > *")].map((el) => getComputedStyle(el).opacity),
      numerals: [...document.querySelectorAll("main section span[aria-hidden='true']")].map((el) => getComputedStyle(el).opacity),
      fills: [...document.querySelectorAll("main [data-tone]")].map((el) => getComputedStyle(el).transform),
    };
  });
  expect(state.band).toBe("none");
  expect(new Set(state.rows)).toEqual(new Set(["1"]));
  expect(new Set(state.numerals)).toEqual(new Set(["1"]));
  for (const t of state.fills) expect(t).toBe("none");
});

test.describe("motion (no reduce motion)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("rows draw and settle; the Thrive band grows to full width", async ({ page }) => {
    await page.goto("/the-ascent");
    const firstRow = stage(page, "land").locator("dl > div").first();
    // Just below the screen: not drawn yet.
    await place(firstRow, 1.02);
    await expect
      .poll(() => firstRow.locator("dt").evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeLessThan(0.1);
    // Wholly on screen: drawn and settled, its words at full strength.
    await place(firstRow, 0.6);
    await expect.poll(() => firstRow.locator("dt").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect.poll(() => firstRow.evaluate((el) => getComputedStyle(el, "::before").transform)).toMatch(/none|matrix\(1, 0, 0, 1/);

    const thrive = stage(page, "thrive");
    await place(thrive, 0.95);
    await expect.poll(() => thrive.evaluate((el) => getComputedStyle(el, "::before").scale)).not.toBe("none");
    await place(thrive, 0.1);
    await expect.poll(() => thrive.evaluate((el) => getComputedStyle(el, "::before").scale)).toMatch(/^(none|1( 1)?)$/);
  });

  test("phone bar: the stage you're reading turns ink, the line fills", async ({ page }, testInfo) => {
    test.skip(!isPhone(testInfo), "phones only");
    await page.goto("/the-ascent");
    const color = (name) => bar(page).getByRole("link", { name }).evaluate((a) => getComputedStyle(a).color);
    const fill = () =>
      bar(page)
        .locator("span[aria-hidden='true']")
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);

    await place(stage(page, "land"), 0.3);
    await expect.poll(() => color("Land")).toBe(INK);
    expect(await color("Prepare")).toBe(MUTED);
    expect(await color("Thrive")).toBe(MUTED);
    const halfway = await fill();
    expect(halfway).toBeGreaterThan(0.1);
    expect(halfway).toBeLessThan(0.9);

    await place(stage(page, "thrive"), 0.3);
    await expect.poll(() => color("Thrive")).toBe(INK);
    expect(await color("Land")).toBe(MUTED);
    expect(await fill()).toBeGreaterThan(halfway);
  });
});

test("keyboard: the stage index comes first, then each stage's story link", async ({ page }, testInfo) => {
  test.skip(isPhone(testInfo), "desktop keyboard order");
  await page.goto("/the-ascent");
  await page.locator("h1").click();
  const order = [];
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => document.activeElement?.getAttribute("href")));
  }
  expect(order).toEqual(["#prepare", "#land", "#thrive", "/results#haritha", "/results#karandeep", "/results#jothi"]);
});
