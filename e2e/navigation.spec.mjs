// The navigation on a phone and a desktop: what shows, the phone menu sheet
// with the keyboard, the bar condensing after a scroll, and the skip link.
import { expect, test } from "@playwright/test";

test("navigation: links on desktop, menu sheet on phone", async ({ page }, testInfo) => {
  await page.goto("/");
  const phone = testInfo.project.name === "phone";
  const main = page.getByRole("navigation", { name: "Main" });

  await expect(page.getByRole("link", { name: "Book a call", exact: true })).toBeVisible();

  if (!phone) {
    await expect(main.getByRole("link")).toHaveCount(6);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    return;
  }

  await expect(main).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();

  const closeButton = page.getByRole("button", { name: "Close menu" });
  await expect(closeButton).toHaveAttribute("aria-expanded", "true");
  const sheet = page.getByRole("navigation", { name: "Menu" });
  await expect(sheet.getByRole("link")).toHaveCount(7);
  await page.waitForTimeout(300);
  console.log("DIAG", JSON.stringify(await page.evaluate(() => {
    const link = document.querySelector("#site-menu a");
    const sheet = document.getElementById("site-menu");
    const before = document.activeElement?.outerHTML.slice(0, 90);
    link.focus();
    return {
      before,
      after: document.activeElement?.outerHTML.slice(0, 90),
      inert: link.closest("[inert]")?.tagName ?? null,
      visibility: getComputedStyle(sheet).visibility,
      liVisibility: getComputedStyle(link.parentElement).visibility,
      bodyKids: Array.from(document.body.children).map((e) => e.tagName + (e.id ? "#" + e.id : "") + (e.inert ? "(inert)" : "")),
    };
  })));
  await expect(sheet.getByRole("link", { name: "The Ascent" })).toBeFocused();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "screenshots/phone/menu-open.png" });

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("navigation: the bar condenses after scrolling", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header");
  await expect(header).toHaveAttribute("data-scrolled", "false");
  await page.evaluate(() => {
    document.body.style.minHeight = "300vh";
    window.scrollTo(0, 400);
  });
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveAttribute("data-scrolled", "false");
});

test("navigation: the first Tab reaches the skip link", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
});
