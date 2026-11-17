// Playwright opens the built site on a phone and a desktop screen, checks the
// basics and saves a full-page screenshot of every page to screenshots/.
// Usage: npm run build, then npm run screenshots.
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    // The still version of the site. The design system says visitors with
    // "reduce motion" switched on must see everything, so screenshots taken
    // this way also prove that nothing stays hidden without animation.
    reducedMotion: "reduce",
  },
  projects: [
    // A mid-range Android phone, 412px wide.
    { name: "phone", use: { ...devices["Pixel 7"] } },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  // Uses the site if it is already running (as in CI); otherwise starts the
  // production build.
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
