// Runs Lighthouse three times with its default mobile settings (slow 4G,
// mid-range phone) and fails if a median score is under the minimum.
// Usage: node scripts/lighthouse-check.mjs <url>
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/lighthouse-check.mjs <url>");
  process.exit(1);
}

const MINIMUM = 95;
const RUNS = 3;
const categories = ["performance", "accessibility", "best-practices", "seo"];

const runs = [];
for (let i = 1; i <= RUNS; i += 1) {
  const out = `lighthouse-${i}.json`;
  execFileSync(
    "npx",
    [
      "--yes",
      "lighthouse@12",
      url,
      "--quiet",
      "--output=json",
      `--output-path=${out}`,
      `--only-categories=${categories.join(",")}`,
      // Deployments are deliberately not indexable until launch (SITE_LIVE),
      // so the "blocked from indexing" audit is left out until then.
      "--skip-audits=is-crawlable",
      "--chrome-flags=--headless=new --no-sandbox",
    ],
    { stdio: "inherit" },
  );
  runs.push(JSON.parse(readFileSync(out, "utf8")));
}

const median = (values) => [...values].sort((a, b) => a - b)[(RUNS - 1) / 2];

const scores = Object.fromEntries(
  categories.map((id) => [
    id,
    median(runs.map((run) => Math.round(run.categories[id].score * 100))),
  ]),
);
const metric = (id) => median(runs.map((run) => run.audits[id].numericValue));
const metrics = {
  "First Contentful Paint": `${(metric("first-contentful-paint") / 1000).toFixed(1)} s`,
  "Largest Contentful Paint": `${(metric("largest-contentful-paint") / 1000).toFixed(1)} s`,
  "Total Blocking Time": `${Math.round(metric("total-blocking-time"))} ms`,
  "Cumulative Layout Shift": metric("cumulative-layout-shift").toFixed(3),
};

const line = [
  ...Object.entries(scores).map(([id, score]) => `${id} ${score}`),
  ...Object.entries(metrics).map(([name, value]) => `${name} ${value}`),
].join(", ");

console.log(`Lighthouse mobile, median of ${RUNS}: ${line}`);
// Shown on the pull request's checks page.
console.log(`::notice title=Lighthouse mobile (median of ${RUNS})::${line}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `## Lighthouse mobile (median of ${RUNS} runs)`,
      "",
      "| Category | Score |",
      "|---|---|",
      ...Object.entries(scores).map(([id, score]) => `| ${id} | ${score} |`),
      "",
      "| Metric | Value |",
      "|---|---|",
      ...Object.entries(metrics).map(([name, value]) => `| ${name} | ${value} |`),
      "",
    ].join("\n"),
  );
}

const failed = Object.entries(scores).filter(([, score]) => score < MINIMUM);
if (failed.length > 0) {
  console.error(
    `Below ${MINIMUM}: ${failed.map(([id, score]) => `${id} ${score}`).join(", ")}`,
  );
  process.exit(1);
}
