// The Results page: never a dead stage link, and none of the words it must
// not carry in its own copy files.
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const pageFile = (path) => new URL(`../src/app${path === "/" ? "" : path}/page.tsx`, import.meta.url);

test("builtPages lists only pages that exist, and lists /the-ascent once it does", () => {
  const nav = read("src/lib/navigation.ts");
  const list = nav.match(/builtPages[^=]*= new Set\(\[([^\]]*)\]\)/);
  assert.ok(list, "builtPages not found");
  const paths = [...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const path of paths) assert.ok(existsSync(pageFile(path)), `listed but not built: ${path}`);
  assert.equal(paths.includes("/the-ascent"), existsSync(pageFile("/the-ascent")));
});

test("the Results page's copy has no '1 to 4 months', rating, price or job promise", () => {
  const copy = [read("src/app/results/page.tsx"), read("src/content/results.ts"), read("src/components/results/story-row.tsx"), read("src/components/results/results-island.tsx")]
    .join("\n")
    // Comments may name what the page must not say.
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*(\/\/|\*).*$/gm, "");
  assert.doesNotMatch(copy, /1 to 4|out of 5|4\.9|\bprices?\b|\bfees?\b|guarantee/i);
  assert.match(copy, /82 in 100/);
});
