"use client";

import { useEffect, useRef } from "react";

/** Where the stepped desktop layout (and the climb) starts. Matches the CSS. */
const STEPPED = "(width >= 64rem)";

/**
 * Chains the fact row to the climb (H3): the facts appear only once the
 * Thrive card has turned dark and the row itself is in view, whichever
 * comes later, so the section ends on one movement.
 *
 * The climb ends at fixed points on the screen, so plain observers are
 * enough: on desktop when the stages reach 30% from the top, on phones when
 * the Thrive card reaches 55%. Renders nothing visible; finds its section
 * from its own place in the page. Facts already on screen when the script
 * starts stay as served, and with "reduce motion" on nothing is hidden.
 */
export function AscentFacts() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    const stages = section?.querySelector<HTMLElement>("[data-stages]");
    const thrive = section?.querySelector<HTMLElement>("[data-stage='thrive']");
    const facts = section?.querySelector<HTMLElement>("[data-facts]");
    if (!stages || !thrive || !facts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (facts.getBoundingClientRect().top < window.innerHeight) return;

    facts.dataset.factsReady = "";
    let climbed = false;
    let inView = false;
    const observers: IntersectionObserver[] = [];
    const stop = () => {
      for (const observer of observers) observer.disconnect();
    };
    const check = () => {
      if (!climbed || !inView) return;
      facts.dataset.factsIn = "";
      stop();
    };
    const watch = (target: Element, bottomInset: string, set: () => void) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Reached once its top is above the line, including scrolled past.
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            set();
            check();
          }
        },
        { rootMargin: `0px 0px -${bottomInset} 0px` },
      );
      observer.observe(target);
      observers.push(observer);
    };

    const stepped = window.matchMedia(STEPPED).matches;
    watch(stepped ? stages : thrive, stepped ? "70%" : "45%", () => {
      climbed = true;
    });
    watch(facts, "8%", () => {
      inView = true;
    });
    return stop;
  }, []);

  return <span ref={anchorRef} hidden />;
}
