/**
 * The visitor's analytics choice (the consent banner, decided with Nithish,
 * 26 November 2026; copy and rules in the legal pages doc).
 *
 * - Google Analytics and PostHog load only after "Accept analytics"
 *   (src/lib/analytics-loader.ts reads the same key).
 * - Ignoring the banner means no consent: nothing loads.
 * - "Reject analytics", now or later through Cookie settings, clears what the
 *   two tools left in the browser: `_ga*` and `ph_*` cookies, and their
 *   localStorage and sessionStorage keys (PostHog keeps a copy there).
 *
 * Kept free of imports so `npm test` can check it with Node.
 */

// Versioned, so a later change to what consent covers can ask again.
export const CONSENT_STORAGE_KEY = "careerhaki:consent:v1";

/** Fired on `window` when the visitor chooses; the analytics loader listens. */
export const CONSENT_EVENT = "careerhaki:consent";

export type ConsentChoice = "accepted" | "rejected";

/**
 * Names the two tools use: Google Analytics `_ga` and `_ga_<id>`; PostHog
 * `ph_<key>_posthog` (cookie and localStorage), `ph_<key>_window_id` and
 * friends (sessionStorage), and `__ph_opt_in_out_<key>`.
 */
const ANALYTICS_NAME = /^(_ga|ph_|__ph_)/;

export function isAnalyticsName(name: string): boolean {
  return ANALYTICS_NAME.test(name);
}

/** The stored choice, or null when there is none (or storage is blocked). */
export function readConsent(storage?: Storage | null): ConsentChoice | null {
  try {
    const raw = (storage ?? window.localStorage).getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const choice = (JSON.parse(raw) as { choice?: unknown }).choice;
    return choice === "accepted" || choice === "rejected" ? choice : null;
  } catch {
    return null;
  }
}

/**
 * Remember the choice so the banner doesn't ask on every page. If storage is
 * blocked the choice still holds for this page; the banner asks again next
 * time, and nothing loads without a yes.
 */
export function saveConsent(choice: ConsentChoice, storage?: Storage | null, now = new Date()): void {
  try {
    (storage ?? window.localStorage).setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ choice, at: now.toISOString() }),
    );
  } catch {
    // Nothing to do: see above.
  }
}

/** The host and each parent domain, so a cookie set on any of them goes. */
export function cookieDomains(hostname: string): string[] {
  const parts = hostname.split(".");
  const domains: string[] = [];
  for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join("."));
  return domains;
}

type CookieJar = { cookie: string };

/** Every analytics cookie name currently readable on this page. */
export function analyticsCookieNames(jar: CookieJar): string[] {
  return jar.cookie
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter((name) => name && isAnalyticsName(name));
}

/**
 * Clear the `_ga*` and `ph_*` cookies and storage keys. Cookies are expired
 * on the host and every parent domain (Google Analytics sets its cookie on
 * the widest domain it can). Safe to run when there is nothing to clear.
 */
export function clearAnalyticsStorage(
  jar: CookieJar | null = typeof document === "undefined" ? null : document,
  hostname: string = typeof location === "undefined" ? "" : location.hostname,
  storages?: (Storage | null)[],
): void {
  if (jar) {
    const domains = cookieDomains(hostname);
    for (const name of analyticsCookieNames(jar)) {
      jar.cookie = `${name}=; Max-Age=0; path=/`;
      for (const domain of domains) jar.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    }
  }

  let stores = storages;
  if (!stores) {
    stores = [];
    try {
      stores.push(window.localStorage, window.sessionStorage);
    } catch {
      // Storage blocked: nothing was stored there either.
    }
  }
  for (const store of stores) {
    if (!store) continue;
    try {
      const names: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const name = store.key(i);
        if (name && isAnalyticsName(name)) names.push(name);
      }
      for (const name of names) store.removeItem(name);
    } catch {
      // Nothing to do.
    }
  }
}
