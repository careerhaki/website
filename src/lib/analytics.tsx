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

const googleAnalytics = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
`;

// PostHog's loader protocol: a stub that queues calls until the real library
// arrives, then the library reads the stub and takes over.
const postHog = `
(function (doc, stub) {
  if (stub.__SV) return;
  window.posthog = stub;
  stub._i = [];
  stub.people = stub.people || [];
  ['capture', 'identify', 'reset', 'register', 'group', 'opt_in_capturing', 'opt_out_capturing'].forEach(function (name) {
    stub[name] = function () {
      stub.push([name].concat(Array.prototype.slice.call(arguments, 0)));
    };
  });
  stub.init = function (token, config, name) {
    var script = doc.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = config.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    doc.head.appendChild(script);
    stub._i.push([token, config, name]);
  };
  stub.__SV = 1;
})(document, window.posthog || []);
posthog.init('${POSTHOG_KEY}', {
  api_host: '${POSTHOG_HOST}',
  defaults: '2026-08-30',
  person_profiles: 'identified_only'
});
`;

/**
 * Google Analytics and PostHog. Both load after the page has finished
 * loading and the browser is idle, so they never delay the headline or
 * the booking button.
 */
export function Analytics() {
  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {googleAnalytics}
      </Script>
      <Script id="posthog" strategy="lazyOnload">
        {postHog}
      </Script>
    </>
  );
}
