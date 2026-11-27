"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CONSENT_EVENT,
  type ConsentChoice,
  clearAnalyticsStorage,
  readConsent,
  saveConsent,
} from "@/lib/consent";

/** The footer's Cookie settings button carries this attribute. */
export const COOKIE_SETTINGS_ATTR = "data-cookie-settings";

/**
 * The cookie banner (legal pages doc, version A; layout B's card in the
 * bottom corner). Its styles are global (consent-banner.css, imported by
 * globals.css): it is on every page, so a CSS module would add a stylesheet.
 *
 * - Rendered after hydration, and only when no choice is stored, so the
 *   first paint and the largest paint are the page's own. Fixed in place,
 *   so it shifts nothing.
 * - A region (`section`), not a dialog: the page stays readable and usable
 *   with it open. Ignoring it means no consent.
 * - Accept and Reject are the same outline button, side by side.
 * - While it is open, keyboard focus is never hidden under it: a covered
 *   element is scrolled clear, and on phones the page's end gets room for
 *   the card (consent-banner.css).
 * - Cookie settings in the footer brings it back and moves focus to it;
 *   after a choice, focus returns to the button.
 * - Whenever the choice isn't "accepted", any `_ga*` and `ph_*` cookies and
 *   storage are cleared, on each page (src/lib/consent.ts).
 */
export function ConsentBanner({ privacyHref }: { privacyHref: string | null }) {
  const [open, setOpen] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const focusOnOpen = useRef(false);

  useEffect(() => {
    const choice = readConsent();
    if (choice !== "accepted") clearAnalyticsStorage();
    // Reading storage can only happen in the browser, after hydration; the
    // banner is meant to appear then, so this effect is where it opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!choice) setOpen(true);

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const opener = target?.closest<HTMLElement>(`[${COOKIE_SETTINGS_ATTR}]`);
      if (!opener) return;
      openerRef.current = opener;
      focusOnOpen.current = true;
      setOpen(true);
      // Already open: move focus to it all the same.
      regionRef.current?.focus();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      regionRef.current?.focus();
    }
  }, [open]);

  // While open, a focused element is never hidden under the card (WCAG
  // 2.4.11): an element the card covers is scrolled clear of it when focused from the
  // keyboard. On phones the
  // page's end gets room for the card (--consent-h, consent-banner.css).
  useEffect(() => {
    const region = regionRef.current;
    if (!open || !region) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty("--consent-h", `${Math.ceil(entry.borderBoxSize[0].blockSize)}px`);
    });
    observer.observe(region);
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || region.contains(target)) return;
      // Keyboard focus only: scrolling under a pointer between press and
      // release would move the click off its target.
      if (!target.matches(":focus-visible")) return;
      const card = region.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const covered = box.bottom > card.top && box.left < card.right && box.right > card.left;
      if (covered) window.scrollBy({ top: box.bottom - card.top + 16, behavior: "instant" });
    };
    document.addEventListener("focusin", onFocusIn);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      root.style.removeProperty("--consent-h");
    };
  }, [open]);

  const choose = useCallback((choice: ConsentChoice) => {
    saveConsent(choice);
    if (choice === "rejected") clearAnalyticsStorage();
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { choice } }));
    setOpen(false);
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  if (!open) return null;

  return (
    <section ref={regionRef} className="consent-banner" aria-label="Cookie choices" tabIndex={-1}>
      <p className="consent-banner-text">
        With your OK, we use <span translate="no">Google Analytics</span> and{" "}
        <span translate="no">PostHog</span> to see which pages get read and where bookings come
        from. <span translate="no">PostHog</span> also records clicks and scrolls, with anything you
        type hidden.
        {privacyHref ? (
          <>
            {" "}
            <Link href={privacyHref} className="consent-banner-link">
              How we use your{" "}
              <span className="consent-banner-nowrap">
                data<span aria-hidden="true"> →</span>
              </span>
            </Link>
          </>
        ) : null}
      </p>
      <div className="consent-banner-buttons">
        <button type="button" className="consent-banner-button" onClick={() => choose("accepted")}>
          Accept analytics
        </button>
        <button type="button" className="consent-banner-button" onClick={() => choose("rejected")}>
          Reject analytics
        </button>
      </div>
    </section>
  );
}
