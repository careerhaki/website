// Topmate reviews on the Book a Call page, phone and desktop: word for word,
// no stars or rating, the Topmate link, the bridge line, placement (beside
// the calendar on desktop, after it on phones), keyboard order and fit.
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://app.cal.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "/* stub */" }),
  );
});

const reviews = (page) => page.locator("section[aria-labelledby='topmate-reviews']");
const isPhone = (testInfo) => testInfo.project.name === "phone";

const expected = [
  [
    "Bebin Samuel",
    "Topmate, March 2025",
    "“Very clear, concise and insightful conversation into what steps and routes I should take. He speaks from real industry experience that is clearly evident in the advice he gives. Very valuable advice for my career growth.”",
    "He speaks from real industry experience that is clearly evident in the advice he gives.",
  ],
  [
    "Karandeep Singh",
    "Topmate, July 2025",
    "“Nitish was incredibly helpful and supportive during our session. He gave me a much-needed boost of motivation in my current job environment and shared clear, actionable guidance on how to navigate challenges and perform at my best. Highly recommend connecting with him if you’re looking for direction and encouragement!”",
    "shared clear, actionable guidance on how to navigate challenges and perform at my best",
  ],
  [
    "Mounika Mannuru",
    "Topmate, July 2025",
    "“It was a really good session. He shared his thoughts clearly, and I found them very helpful and meaningful. I liked how he explained things with real examples. It gave me a better understanding and new ideas to think about.”",
    "I liked how he explained things with real examples.",
  ],
  [
    "Azin Katiraee",
    "Topmate, April 2024",
    "“It was helpful session as we went through my resume and Nithish mentioned some helpful tips. Thanks 🙏🏻”",
    "we went through my resume and Nithish mentioned some helpful tips",
  ],
];

test("reviews: label, four reviews word for word, pull-quotes in ink, no stars", async ({ page }) => {
  await page.goto("/book-a-call");
  await expect(reviews(page).getByRole("heading", { level: 2 })).toHaveText(
    "What people said after a 1:1 session with Nithish on Topmate",
  );
  const figures = reviews(page).locator("figure");
  await expect(figures).toHaveCount(4);
  for (const [i, [name, source, text, pull]] of expected.entries()) {
    await expect(figures.nth(i).locator("blockquote")).toHaveText(text);
    await expect(figures.nth(i).locator("blockquote strong")).toHaveText(pull);
    await expect(figures.nth(i).locator("figcaption")).toContainText(name);
    await expect(figures.nth(i).locator("figcaption")).toContainText(source);
    const [pullColour, restColour] = await figures
      .nth(i)
      .locator("blockquote")
      .evaluate((q) => [getComputedStyle(q.querySelector("strong")).color, getComputedStyle(q).color]);
    expect(pullColour).toBe("rgb(38, 38, 38)");
    expect(restColour).toBe("rgb(92, 88, 82)");
  }
  await expect(reviews(page)).not.toContainText(/Nikhitha|★|out of 5|rating/i);
});

test("reviews: Topmate link opens in a new tab with its accessible name; bridge line has no link", async ({ page }) => {
  await page.goto("/book-a-call");
  const link = reviews(page).getByRole("link", { name: "Read all reviews on Topmate (opens in a new tab)" });
  await expect(link).toHaveAttribute("href", "https://topmate.io/nithishreddy");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  expect(await link.evaluate((a) => a.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  const bridge = reviews(page).getByText(
    "Prathyusha, Karandeep, Rahul and Dheeraj each had a Topmate session with Nithish before they joined CareerHaki.",
  );
  await expect(bridge).toBeVisible();
  await expect(bridge.locator("a")).toHaveCount(0);
  await expect(reviews(page).getByRole("link")).toHaveCount(1);
});

test("reviews: beside the calendar on desktop, after it on phones", async ({ page }, testInfo) => {
  await page.goto("/book-a-call");
  const cal = await page.locator("main > div").nth(1).boundingBox();
  const steps = await page.getByRole("heading", { name: "What happens on the call" }).boundingBox();
  const r = await reviews(page).boundingBox();
  if (isPhone(testInfo)) {
    expect(r.y).toBeGreaterThan(cal.y + cal.height);
    expect(r.y).toBeGreaterThan(steps.y);
  } else {
    expect(r.x + r.width).toBeLessThan(cal.x);
    expect(r.y).toBeGreaterThan(steps.y);
    // The calendar holds still beside the reviews while they pass.
    await reviews(page).locator("figure").nth(3).scrollIntoViewIfNeeded();
    const calNow = await page.locator("main > div").nth(1).boundingBox();
    expect(calNow.y).toBeGreaterThanOrEqual(0);
    expect(calNow.y).toBeLessThan(page.viewportSize().height / 2);
  }
});

test("reviews: keyboard reaches the calendar's links before the Topmate link", async ({ page }) => {
  await page.goto("/book-a-call");
  const order = await page.locator("main a").evaluateAll((as) => as.map((a) => a.textContent.trim()));
  expect(order.indexOf("Open the booking page")).toBeLessThan(order.indexOf("Read all reviews on Topmate↗"));
});

test("reviews: no sideways scroll on a 360px phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/book-a-call");
  await reviews(page).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});
