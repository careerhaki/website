// One test per page, run once on the phone and once on the desktop screen.
// Add each new page to this list when it is built (module 1.4).
import { expect, test } from "@playwright/test";

const pages = [{ name: "home", path: "/" }];

for (const { name, path } of pages) {
  test(`${name}: loads, fits the screen, screenshot saved`, async ({ page }, testInfo) => {
    const response = await page.goto(path);
    expect(response?.status(), "the page responds").toBe(200);

    // Wait for Inter and Newsreader so the screenshot shows the real typefaces.
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator("h1"), "exactly one visible H1").toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();

    // Nothing may be wider than the screen (no sideways scrolling).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "pixels wider than the screen").toBeLessThanOrEqual(0);

    // Below-the-fold sections use content-visibility: auto. A full-page
    // screenshot on a phone stretches the picture without scrolling, so
    // Chrome would leave them blank; draw everything first, as a reader
    // scrolling down would see it.
    await page.addStyleTag({ content: "* { content-visibility: visible !important; }" });

    await page.screenshot({
      path: `screenshots/${testInfo.project.name}/${name}.png`,
      fullPage: true,
    });
  });
}
