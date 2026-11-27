// The cookie banner (legal pages doc, version A; layout B's card): shown
// until the visitor chooses, Accept and Reject with equal weight, analytics
// cookies and storage cleared unless accepted, Cookie settings in the footer
// brings it back, and it never becomes the page's largest paint.
// Phone and desktop.
import { expect, test } from "@playwright/test";

const KEY = "careerhaki:consent:v1";
const TEXT =
  "With your OK, we use Google Analytics and PostHog to see which pages get read and where bookings come from. PostHog also records clicks and scrolls, with anything you type hidden.";

const banner = (page) => page.getByRole("region", { name: "Cookie choices" });
const accept = (page) => banner(page).getByRole("button", { name: "Accept analytics" });
const reject = (page) => banner(page).getByRole("button", { name: "Reject analytics" });
const settings = (page) =>
  page.locator("body > footer").getByRole("button", { name: "Cookie settings" });
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null")?.choice ?? null, KEY);

/** Give React time to hydrate (the banner opens, if at all, once it has). */
const hydrated = async (page) => {
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
};

const analyticsCookies = async (context) =>
  (await context.cookies()).map((c) => c.name).filter((n) => /^(_ga|ph_|__ph_)/.test(n)).sort();

/** Cookies and storage as the two tools leave them, plus one of our own. */
async function plantAnalytics(page, context) {
  const url = new URL(page.url());
  await context.addCookies(
    ["_ga", "_ga_K2CF3QD3DM", "ph_phc_test_posthog", "keep_me"].map((name) => ({
      name,
      value: "1",
      domain: url.hostname,
      path: "/",
    })),
  );
  await page.evaluate(() => {
    localStorage.setItem("ph_phc_test_posthog", "{}");
    sessionStorage.setItem("ph_phc_test_window_id", "1");
    sessionStorage.setItem("careerhaki:picker", '{"text":"x"}');
  });
}

test("no choice: the banner shows, with the approved words and two equal buttons", async ({ page }) => {
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await expect(banner(page).locator("p")).toContainText(TEXT);
  await expect(banner(page).getByRole("button")).toHaveText(["Accept analytics", "Reject analytics"]);

  // Equal weight: the same style and the same size, side by side.
  const looks = await banner(page)
    .getByRole("button")
    .evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          style: [s.backgroundColor, s.color, s.borderColor, s.borderWidth, s.fontWeight, s.fontSize].join(),
          w: Math.round(r.width),
          h: Math.round(r.height),
          top: Math.round(r.top),
        };
      }),
    );
  expect(looks[0].style).toBe(looks[1].style);
  expect(Math.abs(looks[0].w - looks[1].w)).toBeLessThanOrEqual(1);
  expect(looks[0].h).toBe(looks[1].h);
  expect(looks[0].h).toBeGreaterThanOrEqual(44);
  expect(looks[0].top).toBe(looks[1].top);

  // A region, not a dialog: the page behind stays usable.
  expect(await banner(page).evaluate((el) => el.tagName)).toBe("SECTION");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("#main")).not.toHaveAttribute("inert", /.*/);
});

test("the privacy link appears only once /privacy is built", async ({ page, request }) => {
  const built = (await request.get("/privacy")).status() === 200;
  await page.goto("/");
  const link = banner(page).getByRole("link", { name: "How we use your data" });
  if (built) await expect(link).toHaveAttribute("href", "/privacy#cookies-and-analytics");
  else await expect(link).toHaveCount(0);
});

test("placement: a card in the bottom corner, 400px at most, the width less 32px on phones", async ({ page }) => {
  await page.goto("/");
  const box = await banner(page).boundingBox();
  const vw = page.viewportSize().width;
  const vh = page.viewportSize().height;
  expect(Math.round(box.x)).toBe(16);
  expect(Math.round(vh - (box.y + box.height))).toBe(16);
  expect(Math.round(box.width)).toBe(Math.min(400, vw - 32));
  const s = await banner(page).evaluate((el) => {
    const c = getComputedStyle(el);
    return { position: c.position, radius: c.borderTopLeftRadius, border: c.borderTopWidth };
  });
  expect(s).toEqual({ position: "fixed", radius: "18px", border: "1px" });
});

test("ignoring it means no consent: no choice stored, nothing from Google or PostHog, asked again", async ({ page }) => {
  const calls = [];
  page.on("request", (r) => {
    if (/googletagmanager|google-analytics|posthog/.test(r.url())) calls.push(r.url());
  });
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(500);
  await page.goto("/results");
  await expect(banner(page)).toBeVisible();
  expect(await stored(page)).toBeNull();
  expect(calls).toEqual([]);
});

test("Accept: the banner goes, the choice is kept across pages and visits", async ({ page }) => {
  await page.goto("/");
  await accept(page).click();
  await expect(banner(page)).toHaveCount(0);
  expect(await stored(page)).toBe("accepted");
  await page.goto("/about");
  await hydrated(page);
  await expect(banner(page)).toHaveCount(0);
});

test("Reject: the banner goes and every _ga* and ph_* cookie and storage key is cleared", async ({ page, context }) => {
  await page.goto("/");
  await plantAnalytics(page, context);
  await reject(page).click();
  await expect(banner(page)).toHaveCount(0);
  expect(await stored(page)).toBe("rejected");
  expect(await analyticsCookies(context)).toEqual([]);
  expect((await context.cookies()).map((c) => c.name)).toContain("keep_me");
  const left = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
  expect(left.local).toEqual([KEY]);
  expect(left.session).toEqual(["careerhaki:picker"]);
});

test("unless accepted, leftovers are cleared on every page load", async ({ page, context }) => {
  await page.goto("/");
  await plantAnalytics(page, context);
  await page.reload();
  await expect(banner(page)).toBeVisible();
  await expect.poll(() => analyticsCookies(context)).toEqual([]);

  await reject(page).click();
  await plantAnalytics(page, context);
  await page.goto("/results");
  await expect.poll(() => analyticsCookies(context)).toEqual([]);
});

test("accepted: analytics cookies are left alone", async ({ page, context }) => {
  await page.goto("/");
  await accept(page).click();
  await plantAnalytics(page, context);
  await page.reload();
  await hydrated(page);
  expect(await analyticsCookies(context)).toEqual(["_ga", "_ga_K2CF3QD3DM", "ph_phc_test_posthog"]);
});

test("Cookie settings: brings the banner back with focus on it; a choice returns focus", async ({ page, context }) => {
  await page.goto("/");
  await accept(page).click();
  await settings(page).scrollIntoViewIfNeeded();
  await settings(page).click();
  await expect(banner(page)).toBeVisible();
  await expect(banner(page)).toBeFocused();
  // Withdrawal: Reject now clears what was left.
  await plantAnalytics(page, context);
  await reject(page).click();
  await expect(banner(page)).toHaveCount(0);
  await expect(settings(page)).toBeFocused();
  expect(await stored(page)).toBe("rejected");
  expect(await analyticsCookies(context)).toEqual([]);
});

test("keyboard: Cookie settings is a button in the footer's legal row; Enter opens the banner", async ({ page }) => {
  await page.goto("/");
  await reject(page).click();
  const legal = page.locator("body > footer").getByRole("navigation", { name: "Legal" });
  await expect(legal.getByRole("button", { name: "Cookie settings" })).toHaveCount(1);
  await settings(page).focus();
  await page.keyboard.press("Enter");
  await expect(banner(page)).toBeFocused();
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(["How we use your data →", "Accept analytics"]).toContain(focused);
});

test("the banner is never the page's largest paint", async ({ page }) => {
  for (const path of ["/", "/book-a-call", "/results", "/the-ascent", "/about"]) {
    await page.goto(path);
    await expect(banner(page)).toBeVisible();
    const inBanner = await page.evaluate(
      () =>
        new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            resolve(Boolean(last?.element?.closest?.(".consent-banner")));
          }).observe({ type: "largest-contentful-paint", buffered: true });
        }),
    );
    expect(inBanner, path).toBe(false);
  }
});

test("no sideways scroll on a 360px phone with the banner open", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const box = await banner(page).boundingBox();
  expect(Math.round(box.width)).toBe(328);
  // Side by side where they fit; stacked at equal width where they don't.
  const widths = await banner(page)
    .getByRole("button")
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
  expect(Math.abs(widths[0] - widths[1])).toBeLessThanOrEqual(1);
});

test.describe("motion (no reduce motion)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the banner rises into place once, in 0.3 s", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    const a = await banner(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration, count: s.animationIterationCount };
    });
    expect(a).toEqual({ name: "consent-banner-rise", duration: "0.3s", count: "1" });
    await expect.poll(() => banner(page).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test("still version (reduce motion): in place at once", async ({ page }) => {
  await page.goto("/");
  const s = await banner(page).evaluate((el) => ({
    name: getComputedStyle(el).animationName,
    opacity: getComputedStyle(el).opacity,
  }));
  expect(s).toEqual({ name: "none", opacity: "1" });
});

test("keyboard focus is never hidden under the open card", async ({ page }) => {
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  const card = await banner(page).boundingBox();
  // The footer's last links, at the very end of the page.
  for (const name of ["Privacy", "Terms", "Employer enquiry", "About"]) {
    const el = page.locator("body > footer").getByRole("link", { name, exact: true });
    // Focus from the keyboard: Tab from the element just before it.
    await el.evaluate((node) => {
      const all = [...document.querySelectorAll("a[href], button")];
      all[all.indexOf(node) - 1].focus();
    });
    await page.keyboard.press("Tab");
    await expect(el).toBeFocused();
    const box = await el.boundingBox();
    const hidden =
      box.y + box.height > card.y && box.x < card.x + card.width && box.x + box.width > card.x;
    expect(hidden, name).toBe(false);
  }
});
