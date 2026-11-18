"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { formatter } from "./format";

/** Count length and the pause before it starts, in milliseconds. */
const DURATION = 1000;
const DELAY = 250;
/**
 * If the row is already on screen when this script starts and the page has
 * been showing for longer than this (a slow connection), the real figures
 * have been read already: they stay as they are rather than drop to zero.
 */
const LATE = 600;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Motion H2 for the stat row: the hairline draws across and every
 * `[data-count-to]` figure inside counts up once, when the row first comes
 * into view. The page is served with the real figures, so without this
 * script, and with "reduce motion" on, they simply show.
 *
 * The figures are written straight into the page each frame (a ref, not
 * state), so React does not re-render while counting.
 */
export function CountUp({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const figures = Array.from(
      row.querySelectorAll<HTMLElement>("[data-count-to]"),
    );
    if (figures.length === 0) return;

    const targets = figures.map((element) => ({
      element,
      to: Number(element.dataset.countTo),
      format: formatter(Number(element.dataset.decimals ?? 0)),
      text: element.textContent ?? "",
    }));
    let frame = 0;
    let first = true;

    const finish = () => {
      for (const { element, text } of targets) {
        element.textContent = text;
        element.style.minWidth = "";
      }
    };

    const run = () => {
      // Hold each figure at its final width so the words beside it never
      // shift while the digits change.
      // All reads first, then all writes, so the page is laid out once.
      const widths = targets.map(({ element }) => element.getBoundingClientRect().width);
      targets.forEach(({ element, format }, i) => {
        element.style.minWidth = `${widths[i]}px`;
        element.textContent = format.format(0);
      });
      row.dataset.counting = "";
      const start = performance.now() + DELAY;
      const tick = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - start) / DURATION));
        if (progress === 1) {
          finish();
          return;
        }
        const eased = easeOut(progress);
        for (const { element, to, format } of targets) {
          element.textContent = format.format(to * eased);
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const wasFirst = first;
      first = false;
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const paint = performance.getEntriesByName("first-contentful-paint")[0];
      const late = performance.now() - (paint?.startTime ?? 0) > LATE;
      if (wasFirst && late) return;
      run();
    });
    observer.observe(row);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      finish();
    };
  }, []);

  return (
    <ul ref={rowRef} role="list" className={className}>
      {children}
    </ul>
  );
}
