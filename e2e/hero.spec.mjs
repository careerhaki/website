// The homepage hero on a phone and a desktop: content and proof, the still
// version with "reduce motion" on (the default for these tests), and the
// approved motion (H1, H2, H4, N2) with it off.
import { expect, test } from "@playwright/test";

const fields = ["tech", "data", "Agentic AI", "cloud", "software"];
const figures = ["120+", "82 in 100", "4.9 out of 5"];

const hero = (page) => page.locator("section[aria-labelledby=hero-title]");
const activeWord = (page) => hero(page).locator("[data-active]");
const navCta = (page) =>
  page.getByRole("banner").getByRole("link", { name: "Book a call", exact: true });

test("hero: copy, one booking button, confirmed figures", async ({ page }) => {
  await page.goto("/");
  const section = hero(page);
  await expect(section.getByRole("heading", { level: 1 })).toHaveText(
    "A better role in tech, coached by engineers who do the job today.",
  );
  // Screen readers and search get the eyebrow once, with its first field.
  await expect(section.locator("p").first()).toHaveText(
    /Career coaching and mentorship for people in tech/i,
  );
  await expect(section).toContainText("agentic AI");

  const book = section.getByRole("link", { name: "Book a discovery call" });
  await expect(book).toHaveAttribute("href", "/book-a-call");
  await expect(book).toHaveAttribute("data-hero-cta", "");
  // The WhatsApp number is set in module 1.5; until then there is no button.
  await expect(section.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);

  const items = section.getByRole("list").getByRole("listitem");
  await expect(items).toHaveCount(3);
  for (const [i, figure] of figures.entries()) {
    await expect(items.nth(i)).toContainText(figure);
  }
  // No price, fee or guarantee anywhere in the hero.
  await expect(section).not.toContainText(/price|fee|guarantee|\$/i);
});

test("hero: reduce motion shows the still version", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  await expect(activeWord(page)).toHaveText("tech");
  const shown = await hero(page)
    .locator("p, h1, div, ul")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { opacity: style.opacity, transform: style.transform };
      }),
    );
  // Everything at full opacity and in its own place (no offset left over).
  for (const { opacity, transform } of shown) {
    expect(opacity).toBe("1");
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
  }
  for (const figure of figures) {
    await expect(hero(page).locator("[aria-hidden=true]", { hasText: figure }).first()).toBeVisible();
  }
});

test("hero: the booking button is focusable and visible", async ({ page }) => {
  await page.goto("/");
  const book = hero(page).getByRole("link", { name: "Book a discovery call" });
  await book.focus();
  await expect(book).toBeFocused();
  const outline = await book.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).toBe("solid");
});

test("N2: the navigation's button is an outline while the hero's is on screen", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "phone", "phone: checked the same way on desktop");
  await page.goto("/");
  const background = () =>
    navCta(page).evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect.poll(background).toBe("rgba(0, 0, 0, 0)");
  await page.evaluate(() => {
    document.body.style.minHeight = "300vh";
    window.scrollTo(0, 1200);
  });
  await expect.poll(background).toBe("rgb(225, 112, 50)");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(background).toBe("rgba(0, 0, 0, 0)");
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  // The page clock is paused, so time moves only when the test moves it.
  // Waits until the browser has told the page whether the field's box is on
  // screen. An observer created now is notified after the component's own
  // (they are delivered in the order they were made), so once this resolves
  // the field has paused or resumed. A fixed wait failed under load.
  const onScreenReported = (page, want) =>
    activeWord(page).evaluate(
      (word, wanted) =>
        new Promise((resolve) => {
          const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting === wanted) {
              observer.disconnect();
              resolve();
            }
          });
          observer.observe(word.parentElement);
        }),
      want,
    );

  // Pauses the page's clock just ahead of now. On a busy machine the clock
  // can pass that moment before the pause lands, so try again from the new now.
  const pauseClock = async (page) => {
    for (let attempt = 1; ; attempt += 1) {
      const now = await page.evaluate(() => Date.now());
      try {
        await page.clock.pauseAt(now + 50);
        return;
      } catch (error) {
        if (attempt === 5 || !String(error).includes("to the past")) throw error;
      }
    }
  };

  test("H4: one round through every field, headline still, then rests", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await pauseClock(page);
    // The rotation starts when its own observer reports the hero on screen.
    // On a busy CI runner that report can land after the clock is paused, so
    // the first 2.4 s would pass before the timer exists ("tech" twice). Wait
    // for the same report first; observers are told in the order they were
    // made, so the rotation's timer is set by the time this resolves.
    await onScreenReported(page, true);
    await page.evaluate(() => document.fonts.ready);
    const box = hero(page).locator("[data-active]").locator("..");

    // The box is as wide as the widest word, and every word fits in it.
    const widths = await box.evaluate((element) => ({
      box: element.getBoundingClientRect().width,
      words: Array.from(element.children, (word) => word.getBoundingClientRect().width),
    }));
    expect(widths.box).toBeCloseTo(Math.max(...widths.words), 0);

    const h1 = hero(page).getByRole("heading", { level: 1 });
    const eyebrow = hero(page).locator("p").first();
    const h1Start = await h1.boundingBox();
    const eyebrowStart = await eyebrow.boundingBox();
    const shown = [await activeWord(page).textContent()];
    for (let i = 0; i < fields.length; i += 1) {
      await page.clock.runFor(2400);
      await page.waitForTimeout(500); // let the swap finish
      shown.push(await activeWord(page).textContent());
      expect(await h1.boundingBox(), `headline with "${shown.at(-1)}"`).toEqual(h1Start);
      expect(await eyebrow.boundingBox(), `eyebrow with "${shown.at(-1)}"`).toEqual(eyebrowStart);
    }
    expect(shown).toEqual([...fields, "tech"]);

    // After one round it stays on the first word.
    await page.clock.runFor(10_000);
    await expect(activeWord(page)).toHaveText("tech");
  });

  test("H4: the field pauses while the hero is off screen", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await pauseClock(page);
    // Let the rotation see the hero on screen first (see the test above), so
    // its "off screen" report is the one that follows the scroll.
    await onScreenReported(page, true);
    await page.evaluate(() => {
      document.body.style.minHeight = "400vh";
      window.scrollTo(0, 2400);
    });
    await onScreenReported(page, false);
    await page.clock.runFor(5000);
    await expect(activeWord(page)).toHaveText("tech");
    await page.evaluate(() => window.scrollTo(0, 0));
    await onScreenReported(page, true);
    await page.clock.runFor(2400);
    await expect(activeWord(page)).toHaveText("data");
  });

  test("H1 and H2: everything settles and the figures end on the real values", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const items = hero(page).getByRole("list").getByRole("listitem");
    for (const [i, figure] of figures.entries()) {
      await expect(items.nth(i).locator("[aria-hidden=true]")).toHaveText(figure, {
        timeout: 4000,
      });
    }
    // The real figures stay in the page for screen readers throughout.
    await expect(items.first().locator(".sr-only")).toHaveText("120+");
    const lead = hero(page).locator("p").nth(1);
    await expect.poll(() => lead.evaluate((element) => getComputedStyle(element).opacity)).toBe(
      "1",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/home-motion.png` });
  });

  test("H2: a figure never breaks across lines", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const heights = await hero(page)
      .locator("li > span:first-child")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
    const lineHeights = await hero(page)
      .locator("li > span:first-child")
      .evaluateAll((elements) =>
        elements.map((element) => parseFloat(getComputedStyle(element).fontSize) * 1.5),
      );
    heights.forEach((height, i) => expect(height).toBeLessThan(lineHeights[i]));
  });
});
