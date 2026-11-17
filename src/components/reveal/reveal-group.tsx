"use client";

import { type ReactNode, useEffect, useRef } from "react";

/** Pause between items that come into view together, in milliseconds. */
const STAGGER = 90;

/**
 * Reveals its `[data-reveal]` children as each one comes into view, once.
 * It only sets attributes; the look of the hidden and shown states lives in
 * the component's own stylesheet, keyed on:
 *
 * - `data-reveal-ready` on this element: the script is running, so items not
 *   yet revealed may be hidden.
 * - `data-revealed` on an item, with `--reveal-delay` for items that arrive
 *   together, so they go in turn.
 *
 * The page is served with everything shown. Items already on screen when the
 * script starts are marked revealed in the same step as `ready`, so nothing
 * that has been seen ever disappears. With "reduce motion" on, nothing is
 * hidden at all.
 */
export function RevealGroup({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (items.length === 0) return;
    let first = true;

    const observer = new IntersectionObserver(
      (entries) => {
        if (first) {
          // Anything on screen at all, even a sliver at the bottom edge, has
          // been seen: it stays as served, with no animation.
          const seen = entries
            .filter(({ boundingClientRect: box }) => box.top < window.innerHeight && box.bottom > 0)
            .map((entry) => entry.target as HTMLElement);
          for (const item of seen) {
            item.dataset.revealed = "";
            observer.unobserve(item);
          }
          group.dataset.revealReady = "";
          first = false;
          return;
        }
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => items.indexOf(a) - items.indexOf(b));
        arriving.forEach((item, index) => {
          item.style.setProperty("--reveal-delay", `${index * STAGGER}ms`);
          item.dataset.revealed = "";
          observer.unobserve(item);
        });
      },
      // An item counts as arrived once it is a little way into the screen.
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const item of items) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={groupRef} className={className}>
      {children}
    </div>
  );
}
