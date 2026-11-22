"use client";

import { useEffect, useRef, useState } from "react";
import { preconnect } from "react-dom";

import { attributionKeys, calBrandColor, calLink } from "@/lib/booking";

import styles from "./cal-embed.module.css";

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns: Record<string, (...args: unknown[]) => void>;
  q: unknown[];
};

declare global {
  interface Window {
    Cal?: CalApi;
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

const NAMESPACE = "discovery-call";
const EMBED_SRC = "https://app.cal.com/embed/embed.js";

/** Cal.com's own loader: a queue that holds calls until embed.js arrives. */
function installCal(): CalApi {
  if (window.Cal) return window.Cal;
  const queue = (api: { q: unknown[] }, args: unknown) => api.q.push(args);
  const cal = function (this: unknown, ...args: unknown[]) {
    const self = window.Cal!;
    if (!self.loaded) {
      self.ns = {};
      self.q = self.q || [];
      const script = document.createElement("script");
      script.src = EMBED_SRC;
      script.async = true;
      document.head.appendChild(script);
      self.loaded = true;
    }
    if (args[0] === "init") {
      const api = function (...inner: unknown[]) {
        queue(api, inner);
      } as unknown as CalApi;
      api.q = [];
      const name = args[1];
      if (typeof name === "string") {
        self.ns[name] = self.ns[name] || api;
        queue(self.ns[name] as unknown as CalApi, args);
        queue(self, ["initNamespace", name]);
      } else queue(self, args);
      return;
    }
    queue(self, args);
  } as CalApi;
  cal.q = [];
  cal.ns = {};
  window.Cal = cal;
  return cal;
}

/** Where the visitor came from, sent with the booking so it reaches the CRM. */
function attribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const meta: Record<string, string> = { page: window.location.pathname };
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value) meta[key] = value.slice(0, 200);
  }
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    meta.referrer = document.referrer.slice(0, 500);
  }
  return Object.fromEntries(Object.entries(meta).map(([k, v]) => [`metadata[${k}]`, v]));
}

/**
 * The Cal.com calendar, inline. The box keeps its height from the start, so
 * nothing below it jumps, and shows a quiet stand-in in our colours until
 * the calendar is ready. Cal.com's script loads once the box is near the
 * screen and the visitor has touched, scrolled or moved the pointer.
 */
export function CalEmbed() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"waiting" | "loading" | "ready">("waiting");

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false;
    let idle = 0;

    const start = () => {
      if (cancelled) return;
      setState("loading");
      const Cal = installCal();
      Cal("init", NAMESPACE, { origin: "https://app.cal.com" });
      const cal = Cal.ns[NAMESPACE];
      cal("inline", {
        elementOrSelector: box,
        calLink,
        config: { layout: "month_view", theme: "light", ...attribution() },
      });
      cal("ui", {
        theme: "light",
        layout: "month_view",
        hideEventTypeDetails: true,
        cssVarsPerTheme: { light: { "cal-brand": calBrandColor } },
      });
      cal("on", { action: "linkReady", callback: () => !cancelled && setState("ready") });
      cal("on", {
        action: "bookingSuccessful",
        callback: () => {
          window.posthog?.capture("discovery_call_booked");
          window.gtag?.("event", "discovery_call_booked");
        },
      });
    };

    // Cal.com's script is about 1 MB of work with its frame. Loaded during
    // page load it would cost Lighthouse mobile its 95, so, like analytics,
    // it starts on the visitor's first touch, scroll, key press or pointer
    // move (nearly always within a second on this page), or after 8 seconds.
    const triggers = ["pointerdown", "pointermove", "touchstart", "scroll", "keydown", "focusin"];
    let near = false;
    let nudged = false;
    const go = () => {
      if (!near || !nudged) return;
      stop();
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(start, { timeout: 500 })
        : window.setTimeout(start, 50);
    };
    const nudge = () => {
      preconnect("https://app.cal.com");
      nudged = true;
      go();
    };
    const timer = window.setTimeout(nudge, 8000);
    const stop = () => {
      window.clearTimeout(timer);
      for (const type of triggers) window.removeEventListener(type, nudge);
    };
    for (const type of triggers) window.addEventListener(type, nudge, { passive: true, once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          near = true;
          go();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(box);

    return () => {
      cancelled = true;
      stop();
      observer.disconnect();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <div className={styles.frame} data-state={state} aria-busy={state !== "ready"}>
      <div ref={boxRef} className={styles.calendar} />
      {/* Shapes only: the line under the calendar already says what to do
          if it doesn't load. */}
      <div className={styles.standIn} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.month} />
        <span className={styles.bar} data-short="" />
      </div>
    </div>
  );
}
