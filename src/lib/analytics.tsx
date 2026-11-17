import Script from "next/script";

// Public identifiers: both are visible in any visitor's browser by design.
const GA_MEASUREMENT_ID = "G-K2CF3QD3DM";
const POSTHOG_KEY = "phc_yfUjFzt5SyoK3NfhLbmxEnYMLXL8iZwKVwpVkDgFegQV";
const POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * Analytics run on the production deployment only, so previews and local
 * work never add visits. ANALYTICS_FORCE=1 switches them on for a one-off
 * check elsewhere.
 */
const enabled =
  process.env.VERCEL_ENV === "production" ||
  process.env.ANALYTICS_FORCE === "1";

/**
 * Together the two trackers are about 450 KB of script and several hundred
 * milliseconds of work on a mid-range phone. Loaded during page load they
 * took Lighthouse mobile from 98 to 89. So they start on the visitor's first
 * touch, scroll, key press or pointer move, or after 8 seconds, whichever
 * comes first. A visit shorter than 8 seconds with no interaction at all is
 * not counted.
 */
const loader = `
(function () {
  var started = false;
  var triggers = ['pointerdown', 'pointermove', 'touchstart', 'scroll', 'keydown'];

  function addScript(src) {
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = src;
    document.head.appendChild(script);
  }

  function startGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${GA_MEASUREMENT_ID}');
    addScript('https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}');
  }

  // PostHog's loader protocol: a stub that queues calls until the real
  // library arrives, then the library reads the stub and takes over.
  function startPostHog() {
    var stub = window.posthog || [];
    if (stub.__SV) return;
    window.posthog = stub;
    stub._i = [];
    stub.people = stub.people || [];
    ['capture', 'identify', 'reset', 'register', 'group', 'opt_in_capturing', 'opt_out_capturing'].forEach(function (name) {
      stub[name] = function () {
        stub.push([name].concat(Array.prototype.slice.call(arguments, 0)));
      };
    });
    stub.__SV = 1;
    stub._i.push(['${POSTHOG_KEY}', {
      api_host: '${POSTHOG_HOST}',
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
      disable_surveys: true
    }, undefined]);
    addScript('${POSTHOG_HOST}'.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js');
  }

  function start() {
    if (started) return;
    started = true;
    triggers.forEach(function (name) { window.removeEventListener(name, start); });
    var whenIdle = window.requestIdleCallback || function (run) { return setTimeout(run, 1); };
    whenIdle(startGoogleAnalytics);
    whenIdle(startPostHog);
  }

  triggers.forEach(function (name) {
    window.addEventListener(name, start, { passive: true });
  });
  setTimeout(start, 8000);
})();
`;

/** Google Analytics and PostHog, started by the small loader above. */
export function Analytics() {
  if (!enabled) return null;

  return (
    <Script id="analytics" strategy="afterInteractive">
      {loader}
    </Script>
  );
}
