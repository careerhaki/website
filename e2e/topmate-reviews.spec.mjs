// Topmate proof on the Book a Call page (option E1), phone and desktop: the
// four journeys and the reviews word for word, no stars, the toggles, the
// links, placement beside or after the calendar, the segmented draw, the
// still version, keyboard order and fit.
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://app.cal.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "/* stub */" }),
  );
});

const journeys = (page) => page.locator("section[aria-labelledby='topmate-journeys']");
const reviews = (page) => page.locator("section[aria-labelledby='topmate-reviews']");
const rows = (page) => journeys(page).locator(":scope > ol > li");
const isPhone = (testInfo) => testInfo.project.name === "phone";

/** Each segment's vertical scale in the first row (1 = drawn). */
const segScale = (page) =>
  rows(page)
    .first()
    .locator("[class*='seg']")
    .evaluateAll((els) =>
      els.map((el) => {
        const t = getComputedStyle(el).transform;
        return t === "none" ? 1 : Math.round(new DOMMatrixReadOnly(t).d * 100) / 100;
      }),
    );

test("journeys: heading, context line, four people in order, word for word", async ({ page }) => {
  await page.goto("/book-a-call");
  await expect(journeys(page).getByRole("heading", { level: 2 })).toHaveText(
    "Four people who met Nithish on Topmate first",
  );
  await expect(journeys(page)).toContainText(
    "A Topmate 1:1 is a session with Nithish outside The Ascent. 82 in 100 CareerHaki students land a role.",
  );
  await expect(journeys(page).getByRole("heading", { level: 3 })).toHaveText([
    "Karandeep Singh",
    "Rahul Patel",
    "Dheeraj Puttapaka",
    "Prathyusha Venkanna",
  ]);
  const expected = [
    ["“…shared clear, actionable guidance on how to navigate challenges and perform at my best…”", "Topmate, July 2025", "“We repositioned my profile and worked on my interview answers, all aimed at the fintech roles I wanted.”", "Data engineer, TS Imagine"],
    ["“Exactly knows what will be helpful and give proper insights”", "Topmate, January 2025", "“My mentor helped me polish my profile and the way I interview, and I got confident presenting my AWS skills.”", "Senior AWS engineer, Adastra"],
    ["“The session was very insightful.”", "Topmate, August 2025", "“The roadmap gave me direction, and I got much more intentional about applying.”", "Senior software developer, CIHI"],
    ["“Helpful”", "Topmate, March 2026", "“My mentor was easy to reach and kept me motivated. He took me through interview prep, and his feedback was honest, so I got better a step at a time.”", "Data engineer, Euna Solutions"],
  ];
  for (const [i, [quote, source, changed, now]] of expected.entries()) {
    const row = rows(page).nth(i);
    await expect(row.locator("figure blockquote")).toHaveText(quote);
    await expect(row.locator("figcaption")).toHaveText(source);
    await expect(row).toContainText(changed);
    await expect(row).toContainText(now);
    // Screen readers hear "with"; the page shows "w/".
    await expect(row.getByText("1:1 with Nithish")).toHaveCount(1);
    // No timeframe in any row (only inside a story once it is opened).
    const closedText = await row.evaluate((el) =>
      [...el.querySelectorAll("li > p, li > blockquote, figure")].map((n) => n.textContent).join(" "),
    );
    expect(closedText).not.toMatch(/\d+\s*(weeks?|months?)/);
  }
  await expect(journeys(page)).not.toContainText(/★|out of 5|rating|price|guarantee/i);
});

test("journeys: every story opens in place, Prathyusha's included; Karandeep's full review too", async ({ page }) => {
  await page.goto("/book-a-call");
  // Toggles are controls with a chevron, not underlined links.
  const deco = await journeys(page).locator("summary").first().evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(deco).toBe("none");
  for (const name of ["Karandeep", "Rahul", "Dheeraj", "Prathyusha"]) {
    const summary = journeys(page).locator("summary", { hasText: `Read ${name}’s story` });
    await expect(summary).toHaveCount(1);
    await summary.click();
    await expect(journeys(page).locator("summary", { hasText: "Hide story" }).first()).toBeVisible();
  }
  await expect(journeys(page)).toContainText("I came from mechanical engineering with no roadmap into data.");
  await journeys(page).locator("summary", { hasText: "Read the full review" }).click();
  await expect(journeys(page)).toContainText(
    "Nitish was incredibly helpful and supportive during our session.",
  );
  await expect(journeys(page).locator("a")).toHaveCount(0);
});

test("reviews: Bebin in full on the panel, two pull-quotes that open, the Topmate link", async ({ page }) => {
  await page.goto("/book-a-call");
  await expect(reviews(page).getByRole("heading", { level: 2 })).toHaveText(
    "What people said after a 1:1 session with Nithish on Topmate",
  );
  const figures = reviews(page).locator("figure");
  await expect(figures).toHaveCount(3);
  await expect(figures.nth(0).locator("blockquote")).toHaveText(
    "“Very clear, concise and insightful conversation into what steps and routes I should take. He speaks from real industry experience that is clearly evident in the advice he gives. Very valuable advice for my career growth.”",
  );
  await expect(figures.nth(1).locator("blockquote")).toHaveText("“I liked how he explained things with real examples.”");
  await expect(figures.nth(2).locator("blockquote")).toHaveText(
    "“…we went through my resume and Nithish mentioned some helpful tips…”",
  );
  await expect(reviews(page)).toContainText("Mounika Mannuru");
  await expect(reviews(page)).toContainText("Azin Katiraee");
  await expect(reviews(page)).not.toContainText(/Nikhitha|★|out of 5/);
  await reviews(page).locator("summary").nth(1).click();
  await expect(reviews(page)).toContainText("It was helpful session as we went through my resume and Nithish mentioned some helpful tips. Thanks 🙏🏻");
  const link = reviews(page).getByRole("link", { name: "Read all reviews on Topmate (opens in a new tab)" });
  await expect(link).toHaveAttribute("href", "https://topmate.io/nithishreddy");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  expect(await link.evaluate((a) => a.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
});

test("placement: beside the calendar on desktop, after it on phones; Pick a time on phones only", async ({ page }, testInfo) => {
  await page.goto("/book-a-call");
  const cal = await page.locator("#calendar").boundingBox();
  const steps = await page.getByRole("heading", { name: "What happens on the call" }).boundingBox();
  const j = await journeys(page).boundingBox();
  const pick = page.getByRole("link", { name: "Pick a time" });
  if (isPhone(testInfo)) {
    expect(j.y).toBeGreaterThan(cal.y + cal.height);
    await expect(pick).toBeVisible();
    await expect(pick).toHaveAttribute("href", "#calendar");
    await pick.click();
    await expect.poll(() => page.locator("#calendar").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(page.viewportSize().height / 3);
  } else {
    expect(j.x + j.width).toBeLessThan(cal.x);
    expect(j.y).toBeGreaterThan(steps.y);
    await expect(pick).toBeHidden();
    await reviews(page).scrollIntoViewIfNeeded();
    const calNow = await page.locator("#calendar").boundingBox();
    expect(calNow.y).toBeGreaterThanOrEqual(0);
    expect(calNow.y).toBeLessThan(page.viewportSize().height / 2);
  }
});

test("still version: lines and dots drawn", async ({ page }) => {
  await page.goto("/book-a-call");
  expect(await segScale(page)).toEqual([1, 1]);
});

test("with motion: the line draws in two segments as the row arrives, then stays drawn", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/book-a-call");
  const top = await rows(page).first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const vh = page.viewportSize().height;
  // The row's top just inside the bottom of the screen: nothing drawn yet.
  await page.evaluate((y) => window.scrollTo(0, y), top - vh + 20);
  await expect.poll(() => segScale(page)).toEqual([0, 0]);
  // The row's top at the middle of the screen: both segments drawn.
  await page.evaluate((y) => window.scrollTo(0, y), top - vh * 0.3);
  await expect.poll(() => segScale(page)).toEqual([1, 1]);
  // And still drawn at the end of the page.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => segScale(page)).toEqual([1, 1]);
});

test("keyboard reaches the calendar's links before anything in the Topmate section", async ({ page }) => {
  await page.goto("/book-a-call");
  const order = await page
    .locator("main a, main summary")
    .evaluateAll((els) => els.map((el) => el.textContent.trim()));
  const booking = order.indexOf("Open the booking page");
  const first = order.findIndex((t) => t.startsWith("Read the full review"));
  expect(booking).toBeGreaterThanOrEqual(0);
  expect(booking).toBeLessThan(first);
});

test("no sideways scroll on a 360px phone, with every toggle open", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/book-a-call");
  await page.locator("main details").evaluateAll((els) => els.forEach((d) => (d.open = true)));
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});
