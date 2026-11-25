// The Book a Call page on a phone and a desktop: the approved copy, layout
// B+C (calendar straight after the lead on phones; split from 860px), the
// orange underline under "Nithish", the calendar box that keeps its height
// while Cal.com loads, and the fallback link. Cal.com itself is stubbed, so
// these tests never depend on its servers.
import { expect, test } from "@playwright/test";

const EMBED = "https://app.cal.com/embed/embed.js";

test.beforeEach(async ({ page }) => {
  await page.route("https://app.cal.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "/* stub */" }),
  );
});

const box = (el) => el.evaluate((n) => n.getBoundingClientRect().toJSON());

test("copy, title and the fallback link", async ({ page }) => {
  await page.goto("/book-a-call");
  await expect(page).toHaveTitle("Book a discovery call | CareerHaki");
  await expect(page.locator("h1")).toHaveText("Book your discovery call with Nithish");
  await expect(page.getByText("30 minutes with him on Google Meet")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What happens on the call" })).toBeVisible();
  await expect(page.locator("main ol").first().locator(":scope > li")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Open the booking page" })).toHaveAttribute(
    "href",
    "https://cal.com/careerhaki/discovery-call",
  );
  // No WhatsApp line until the number is set.
  await expect(page.getByText("Rather message first?")).toHaveCount(0);
});

test("the underline under Nithish is drawn (still version)", async ({ page }) => {
  await page.goto("/book-a-call");
  const scale = await page
    .locator("h1 span")
    .evaluate((el) => getComputedStyle(el, "::after").scale);
  expect(["none", "1", "1 1"]).toContain(scale);
  const width = await page
    .locator("h1 span")
    .evaluate((el) => parseFloat(getComputedStyle(el, "::after").width));
  expect(width).toBeGreaterThan(40);
});

test("the underline draws once on arrival with motion on", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ ...testInfo.project.use, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/book-a-call");
  const name = await page
    .locator("h1 span")
    .evaluate((el) => getComputedStyle(el, "::after").animationName);
  expect(name).toContain("book-mark");
  await expect
    .poll(() =>
      page.locator("h1 span").evaluate((el) => getComputedStyle(el, "::after").scale),
    )
    .toMatch(/^(none|1|1 1)$/);
  await context.close();
});

test("layout: phones get the calendar before the steps; desktop splits", async ({ page }, testInfo) => {
  await page.goto("/book-a-call");
  const lead = await box(page.locator("main p").first());
  const calendar = await box(page.locator("[aria-busy]"));
  const steps = await box(page.locator("main ol").first());
  if (testInfo.project.name === "phone") {
    expect(calendar.top).toBeGreaterThan(lead.bottom);
    expect(steps.top).toBeGreaterThan(calendar.bottom);
  } else {
    // Words on the left, calendar on the right, tops level.
    expect(calendar.left).toBeGreaterThan(lead.right);
    expect(Math.abs(calendar.top - (await box(page.locator("h1"))).top)).toBeLessThan(24);
  }
});

test("the calendar box holds its height; Cal.com loads on the first interaction", async ({ page }) => {
  let loaded = false;
  page.on("request", (r) => r.url() === EMBED && (loaded = true));
  await page.goto("/book-a-call");
  const frame = page.locator("[aria-busy]");
  expect((await box(frame)).height).toBeGreaterThanOrEqual(540);
  await page.waitForTimeout(600);
  expect(loaded, "not loaded before any interaction").toBe(false);
  const requested = page.waitForRequest(EMBED);
  await page.mouse.move(200, 300);
  await page.mouse.wheel(0, 200);
  await requested;
  await expect(frame).toHaveAttribute("aria-busy", "true");
});

test("on this page the navigation's button is a quiet outline", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "phone", "the pill shows from the tablet width up");
  await page.goto("/book-a-call");
  const pill = page.getByRole("banner").getByRole("link", { name: "Book a call", exact: true });
  await expect(pill).toHaveAttribute("aria-current", "page");
  const bg = await pill.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe("rgba(0, 0, 0, 0)");
});

test("the Results picker answer rides with the booking as hidden metadata", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "careerhaki:picker",
      JSON.stringify({ start: "graduate", field: "cloud", text: "I’m a recent graduate · Cloud" }),
    );
    // A stand-in for Cal.com's loader that records what the page asks of it.
    window.__cal = [];
    const ns = (...args) => window.__cal.push(args);
    const cal = (...args) => window.__cal.push(args);
    cal.ns = { "discovery-call": ns };
    cal.q = [];
    cal.loaded = true;
    window.Cal = cal;
  });
  await page.goto("/book-a-call");
  // The calendar starts on the visitor's first move, once the page has hydrated.
  let x = 10;
  await expect
    .poll(async () => {
      await page.mouse.move((x += 7), 20);
      return page.evaluate(() => window.__cal.some((c) => c[0] === "inline"));
    })
    .toBe(true);
  const inline = await page.evaluate(() => window.__cal.find((c) => c[0] === "inline")[1].config);
  expect(inline["metadata[starting_point]"]).toBe("I’m a recent graduate · Cloud");
  expect(inline["metadata[picker_start]"]).toBe("graduate");
  expect(inline["metadata[picker_field]"]).toBe("cloud");
  expect(inline["metadata[page]"]).toBe("/book-a-call");
  // Prefill keys (name, notes, title…) are not touched: the visitor sees nothing new.
  for (const key of ["name", "email", "notes", "title"]) expect(inline).not.toHaveProperty(key);
});
