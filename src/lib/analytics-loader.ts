/**
 * The small inline script that starts Google Analytics and PostHog, built as
 * a string so it runs without React. Kept free of imports so `npm test` can
 * run it against a fake window.
 *
 * Consent (decided with Nithish, 26 November 2026): nothing loads until the
 * visitor clicks "Accept analytics" in the cookie banner. The choice is read
 * from the same storage key the banner writes (src/lib/consent.ts).
 *
 * - Accepted on an earlier page: the trackers start on the visitor's first
 *   touch, scroll, key press or pointer move, or after 8 seconds, whichever
 *   comes first. Loaded during page load they took Lighthouse mobile from 98
 *   to 89 (17 November 2026), so this stays.
 * - Accepted just now: the click was the first move, so they start at once
 *   (when the browser is idle).
 * - Rejected after they started on this page (Cookie settings): both are
 *   told to stop and the page reloads, so nothing stays in memory. The
 *   banner has already cleared their cookies and storage, and clears them
 *   again on the next page, in case either wrote on the way out.
 */

export type AnalyticsIds = {
  gaMeasurementId: string;
  posthogKey: string;
  posthogHost: string;
  consentKey: string;
  consentEvent: string;
};

export function analyticsLoader(ids: AnalyticsIds): string {
  const q = (value: string) => JSON.stringify(value);
  return `
(function () {
  var CONSENT_KEY = ${q(ids.consentKey)};
  var CONSENT_EVENT = ${q(ids.consentEvent)};
  var GA_ID = ${q(ids.gaMeasurementId)};
  var started = false;
  var armed = false;
  var timer = 0;
  var triggers = ['pointerdown', 'pointermove', 'touchstart', 'scroll', 'keydown'];

  function accepted() {
    try {
      var raw = window.localStorage.getItem(CONSENT_KEY);
      return !!raw && JSON.parse(raw).choice === 'accepted';
    } catch (e) {
      return false;
    }
  }

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
    window.gtag('config', GA_ID);
    addScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
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
    stub._i.push([${q(ids.posthogKey)}, {
      api_host: ${q(ids.posthogHost)},
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
      disable_surveys: true
    }, undefined]);
    addScript(${q(ids.posthogHost)}.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js');
  }

  function disarm() {
    triggers.forEach(function (name) { window.removeEventListener(name, start); });
    clearTimeout(timer);
  }

  function start() {
    if (started) return;
    started = true;
    disarm();
    var whenIdle = window.requestIdleCallback || function (run) { return setTimeout(run, 1); };
    whenIdle(startGoogleAnalytics);
    whenIdle(startPostHog);
  }

  function arm() {
    if (armed || started) return;
    armed = true;
    triggers.forEach(function (name) {
      window.addEventListener(name, start, { passive: true });
    });
    timer = setTimeout(start, 8000);
  }

  window.addEventListener(CONSENT_EVENT, function (event) {
    var choice = event && event.detail && event.detail.choice;
    if (choice === 'accepted') {
      start();
    } else if (choice === 'rejected') {
      disarm();
      armed = false;
      if (!started) return;
      window['ga-disable-' + GA_ID] = true;
      try { window.posthog.opt_out_capturing(); } catch (e) {}
      window.location.reload();
    }
  });

  if (accepted()) arm();
})();
`;
}
