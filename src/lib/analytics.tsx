import Script from "next/script";

import { analyticsLoader } from "@/lib/analytics-loader";
import { CONSENT_EVENT, CONSENT_STORAGE_KEY } from "@/lib/consent";

// Public identifiers: both are visible in any visitor's browser by design.
const GA_MEASUREMENT_ID = "G-K2CF3QD3DM";
const POSTHOG_KEY = "phc_yfUjFzt5SyoK3NfhLbmxEnYMLXL8iZwKVwpVkDgFegQV";
const POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * Analytics run on the production deployment only, so previews and local
 * work never add visits. ANALYTICS_FORCE=1 switches them on for a one-off
 * check elsewhere. On every deployment, they load only after the visitor
 * accepts them in the cookie banner (src/lib/analytics-loader.ts).
 */
const enabled =
  process.env.VERCEL_ENV === "production" ||
  process.env.ANALYTICS_FORCE === "1";

// Built once: the script does not change between requests.
const loader = analyticsLoader({
  gaMeasurementId: GA_MEASUREMENT_ID,
  posthogKey: POSTHOG_KEY,
  posthogHost: POSTHOG_HOST,
  consentKey: CONSENT_STORAGE_KEY,
  consentEvent: CONSENT_EVENT,
});

/** Google Analytics and PostHog, started by the small loader, with consent. */
export function Analytics() {
  if (!enabled) return null;

  return (
    <Script id="analytics" strategy="afterInteractive">
      {loader}
    </Script>
  );
}
