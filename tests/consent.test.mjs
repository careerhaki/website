// The consent banner's storage rules, and the analytics loader's gating:
// Google Analytics and PostHog load only after "Accept analytics".
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";

import { analyticsLoader } from "../src/lib/analytics-loader.ts";
import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
  analyticsCookieNames,
  clearAnalyticsStorage,
  cookieDomains,
  isAnalyticsName,
  readConsent,
  saveConsent,
} from "../src/lib/consent.ts";

const memory = (entries = {}) => {
  const map = new Map(Object.entries(entries));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
    map,
  };
};

test("choice: none, then saved and read back", () => {
  const store = memory();
  assert.equal(readConsent(store), null);
  saveConsent("accepted", store, new Date("2026-11-27T12:00:00Z"));
  assert.equal(readConsent(store), "accepted");
  assert.deepEqual(JSON.parse(store.getItem(CONSENT_STORAGE_KEY)), {
    choice: "accepted",
    at: "2026-11-27T12:00:00.000Z",
  });
  saveConsent("rejected", store);
  assert.equal(readConsent(store), "rejected");
});

test("choice: anything unexpected reads as no choice", () => {
  assert.equal(readConsent(memory({ [CONSENT_STORAGE_KEY]: "yes" })), null);
  assert.equal(readConsent(memory({ [CONSENT_STORAGE_KEY]: '{"choice":"maybe"}' })), null);
  const broken = { getItem: () => { throw new Error("blocked"); } };
  assert.equal(readConsent(broken), null);
  assert.doesNotThrow(() => saveConsent("accepted", { setItem: () => { throw new Error("full"); } }));
});

test("names: _ga* and ph_* are analytics; our own keys are not", () => {
  for (const name of ["_ga", "_ga_K2CF3QD3DM", "ph_phc_abc_posthog", "ph_phc_abc_window_id", "__ph_opt_in_out_phc_abc"]) {
    assert.ok(isAnalyticsName(name), name);
  }
  for (const name of [CONSENT_STORAGE_KEY, "careerhaki:picker", "page_ga", "graph_x", "cal_id"]) {
    assert.ok(!isAnalyticsName(name), name);
  }
});

test("cookie domains: the host and each parent", () => {
  assert.deepEqual(cookieDomains("www.careerhaki.com"), ["www.careerhaki.com", "careerhaki.com"]);
  assert.deepEqual(cookieDomains("localhost"), []);
});

test("clearing expires analytics cookies on every domain and empties storage", () => {
  const written = [];
  const jar = {
    get cookie() {
      return "_ga=GA1.1.1; careerhaki_x=1; _ga_K2CF3QD3DM=GS1; ph_phc_abc_posthog=%7B%7D";
    },
    set cookie(value) {
      written.push(value);
    },
  };
  assert.deepEqual(analyticsCookieNames(jar), ["_ga", "_ga_K2CF3QD3DM", "ph_phc_abc_posthog"]);

  const local = memory({ ph_phc_abc_posthog: "{}", [CONSENT_STORAGE_KEY]: '{"choice":"rejected"}' });
  const session = memory({ ph_phc_abc_window_id: "1", "careerhaki:picker": "{}" });
  clearAnalyticsStorage(jar, "www.careerhaki.com", [local, session]);

  for (const name of ["_ga", "_ga_K2CF3QD3DM", "ph_phc_abc_posthog"]) {
    assert.ok(written.includes(`${name}=; Max-Age=0; path=/`), name);
    assert.ok(written.includes(`${name}=; Max-Age=0; path=/; domain=careerhaki.com`), name);
    assert.ok(written.includes(`${name}=; Max-Age=0; path=/; domain=www.careerhaki.com`), name);
  }
  assert.ok(!written.some((w) => w.startsWith("careerhaki_x")));
  assert.deepEqual([...local.map.keys()], [CONSENT_STORAGE_KEY]);
  assert.deepEqual([...session.map.keys()], ["careerhaki:picker"]);
});

// A fake browser for the inline loader: records the scripts it adds, the
// listeners and timers it sets, and whether the page reloads.
function fakeBrowser(stored) {
  const listeners = new Map();
  const scripts = [];
  const timers = [];
  let reloaded = false;
  const window = {
    localStorage: memory(stored ? { [CONSENT_STORAGE_KEY]: JSON.stringify({ choice: stored }) } : {}),
    addEventListener: (name, fn) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
    },
    removeEventListener: (name, fn) => listeners.get(name)?.delete(fn),
    requestIdleCallback: (fn) => fn(),
    location: { reload: () => { reloaded = true; } },
  };
  const document = {
    createElement: () => ({}),
    head: { appendChild: (el) => scripts.push(el.src) },
  };
  const context = {
    window,
    document,
    setTimeout: (fn) => timers.push(fn) && timers.length,
    clearTimeout: (id) => { if (id) timers[id - 1] = null; },
    Date,
    Array,
    JSON,
  };
  vm.createContext(context);
  const fire = (name, detail) => {
    for (const fn of [...(listeners.get(name) ?? [])]) fn({ detail });
  };
  return {
    context,
    window,
    scripts,
    fire,
    runTimers: () => timers.splice(0).forEach((fn) => fn && fn()),
    hasListener: (name) => (listeners.get(name)?.size ?? 0) > 0,
    get reloaded() {
      return reloaded;
    },
  };
}

const loader = analyticsLoader({
  gaMeasurementId: "G-TEST",
  posthogKey: "phc_test",
  posthogHost: "https://us.i.posthog.com",
  consentKey: CONSENT_STORAGE_KEY,
  consentEvent: CONSENT_EVENT,
});

test("loader: no choice means nothing loads, even after a scroll or 8 seconds", () => {
  const b = fakeBrowser(null);
  vm.runInContext(loader, b.context);
  assert.ok(!b.hasListener("scroll"));
  b.fire("scroll");
  b.runTimers();
  assert.deepEqual(b.scripts, []);
  assert.equal(b.window.posthog, undefined);
  assert.equal(b.window.gtag, undefined);
});

test("loader: rejected means nothing loads", () => {
  const b = fakeBrowser("rejected");
  vm.runInContext(loader, b.context);
  b.fire("scroll");
  b.runTimers();
  assert.deepEqual(b.scripts, []);
});

test("loader: Accept starts both trackers at once", () => {
  const b = fakeBrowser(null);
  vm.runInContext(loader, b.context);
  b.fire(CONSENT_EVENT, { choice: "accepted" });
  assert.equal(b.scripts.length, 2);
  assert.ok(b.scripts[0].startsWith("https://www.googletagmanager.com/gtag/js?id=G-TEST"));
  assert.equal(b.scripts[1], "https://us-assets.i.posthog.com/static/array.js");
});

test("loader: accepted earlier waits for the first move, as before", () => {
  const b = fakeBrowser("accepted");
  vm.runInContext(loader, b.context);
  assert.deepEqual(b.scripts, []);
  b.fire("scroll");
  assert.equal(b.scripts.length, 2);
  b.fire("scroll");
  assert.equal(b.scripts.length, 2, "starts once");
});

test("loader: accepted earlier, nothing happens, starts after 8 seconds", () => {
  const b = fakeBrowser("accepted");
  vm.runInContext(loader, b.context);
  b.runTimers();
  assert.equal(b.scripts.length, 2);
});

test("loader: rejecting before they start keeps them off and doesn't reload", () => {
  const b = fakeBrowser("accepted");
  vm.runInContext(loader, b.context);
  b.fire(CONSENT_EVENT, { choice: "rejected" });
  b.fire("scroll");
  b.runTimers();
  assert.deepEqual(b.scripts, []);
  assert.equal(b.reloaded, false);
});

test("loader: withdrawing after they started stops both and reloads the page", () => {
  const b = fakeBrowser(null);
  vm.runInContext(loader, b.context);
  b.fire(CONSENT_EVENT, { choice: "accepted" });
  b.fire(CONSENT_EVENT, { choice: "rejected" });
  assert.equal(b.window["ga-disable-G-TEST"], true);
  assert.deepEqual([...b.window.posthog.at(-1)], ["opt_out_capturing"]);
  assert.equal(b.reloaded, true);
});
