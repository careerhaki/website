"use client";

import Image from "next/image";
import { type CSSProperties, memo, type ReactNode, useEffect, useRef, useState } from "react";

import styles from "./logo-strip.module.css";

export type BeltLogo = {
  id: string;
  /** The file's address; only the address, to keep the page's data small. */
  src: string;
  /** Desktop size in px; phones draw it smaller in CSS. */
  width: number;
  height: number;
  /** Optical size factor, applied to the strip's logo height in CSS. */
  k: number;
  tone?: "soft";
};

export type BeltRow = { durPhone: string; durWide: string; logos: BeltLogo[] };

/** How long a row takes to ease to a stop, or back up to speed, in ms. */
const EASE_MS = 450;
/** The first sign of a visitor, as for analytics and the Cal.com embed. */
const TRIGGERS = ["pointerdown", "pointermove", "touchstart", "scroll", "keydown"] as const;

function LogoSet({ logos, copy }: { logos: BeltLogo[]; copy: boolean }) {
  return (
    <ul className={styles.set} data-copy={copy ? "" : undefined}>
      {logos.map((logo) => (
        <li key={logo.id} className={styles.item}>
          {/* Never lazy: a lazy logo beyond the strip's right edge would not
              load until it drifted into view, and show as a gap. */}
          <Image
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            loading="eager"
            fetchPriority="low"
            className={styles.logo}
            data-tone={logo.tone}
            style={{ "--k": logo.k } as CSSProperties}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Each track holds its set twice, so moving it by half loops seamlessly.
 * Memoised: Pause and Play re-render the strip, never its 136 images.
 */
const Rows = memo(function Rows({ rows }: { rows: BeltRow[] }) {
  return rows.map((row, i) => (
    <div
      key={i}
      className={styles.row}
      data-row={i}
      style={{ "--dur-phone": row.durPhone, "--dur-wide": row.durWide } as CSSProperties}
    >
      <div className={styles.track}>
        <LogoSet logos={row.logos} copy={false} />
        <LogoSet logos={row.logos} copy />
      </div>
    </div>
  ));
});

// Static icons, hoisted so they are not rebuilt on each render.
const pauseIcon = (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
    <rect x="1.5" y="1" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="7.5" y="1" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);
const playIcon = (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
    <path d="M2.5 1.2v9.6L10.5 6z" fill="currentColor" />
  </svg>
);

/**
 * Motion L, the spotlight belt: the strip's label, Pause button and belt.
 *
 * - Two rows drift in opposite directions, forever, in CSS.
 * - Logos are one colour at rest; a colour copy of the belt sits on top,
 *   masked to a band in the middle, so each logo takes its own colours as it
 *   passes the centre.
 * - Pointing at a row eases it to a stop (real pointers only, so a tap never
 *   leaves a row stuck on a phone). Pause stops both rows (WCAG 2.2.2). The
 *   belt also stops while it is off screen. All three change each CSS
 *   animation's playback rate, so the colour copy always moves exactly with
 *   the row beneath it.
 *
 * The belt (136 images: each logo twice per row, in one colour and in colour)
 * is added on the visitor's first touch, scroll, key press or pointer move,
 * or as soon as the strip is in view (a tall screen). Rendered with the page
 * it took Lighthouse mobile from 96 to 90, and an 8-second fallback (as
 * analytics has) still cost 7 points: Lighthouse's simulation counts the
 * logos' work as if it came early. No visitor can see the strip without one
 * of those triggers, so none is needed. Until then its space is held, so
 * nothing moves when it arrives.
 *
 * Still version (reduce motion): both rows stop and wrap into one wall of all
 * 34 logos, in one colour; no button. It is added as soon as the page runs.
 */
export function SpotlightBelt({
  id,
  label,
  rows,
  children,
}: {
  id: string;
  label: string;
  rows: BeltRow[];
  /** The list of names for screen readers. */
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const applyRef = useRef<(() => void) | null>(null);
  const beltRef = useRef<HTMLDivElement>(null);

  // Add the belt on the first sign of a visitor, or when it comes into view.
  useEffect(() => {
    const box = beltRef.current;
    if (!box) return;
    // With reduce motion on, the still wall costs no drift: add it at once,
    // so it never pushes the page down later.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      cleanup();
      setReady(true);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
    });
    io.observe(box);
    for (const name of TRIGGERS) window.addEventListener(name, start, { passive: true, once: true });
    function cleanup() {
      io.disconnect();
      for (const name of TRIGGERS) window.removeEventListener(name, start);
    }
    return cleanup;
  }, []);

  // Once the belt is there: Pause, hover-to-stop, off-screen stop.
  useEffect(() => {
    const belt = beltRef.current;
    if (!ready || !belt) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const baseRows = [...belt.querySelectorAll<HTMLElement>(`.${styles.base} > [data-row]`)];
    const rowIds = baseRows.map((r) => r.dataset.row!);
    const hovered = new Set<string>();
    const frames = new Map<string, number>();
    let onScreen = true;

    const animations = (row: string) =>
      [...belt.querySelectorAll<HTMLElement>(`[data-row="${row}"] > *`)].flatMap((t) => t.getAnimations());

    const ease = (row: string, to: number, instant: boolean) => {
      const anims = animations(row);
      if (anims.length === 0) return;
      cancelAnimationFrame(frames.get(row) ?? 0);
      const from = anims[0].playbackRate;
      if (instant || from === to) {
        for (const a of anims) a.playbackRate = to;
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / EASE_MS);
        const rate = from + (to - from) * (1 - (1 - t) ** 3);
        for (const a of anims) a.playbackRate = rate;
        if (t < 1) frames.set(row, requestAnimationFrame(step));
      };
      frames.set(row, requestAnimationFrame(step));
    };

    const apply = (instant = false) => {
      if (reduce.matches) return;
      for (const row of rowIds) {
        const go = onScreen && !pausedRef.current && !hovered.has(row);
        ease(row, go ? 1 : 0, instant || !onScreen);
      }
    };
    applyRef.current = () => apply();
    apply(true);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      apply(true);
    });
    io.observe(belt);

    const enter = (e: PointerEvent) => {
      if (!pointer.matches) return;
      hovered.add((e.currentTarget as HTMLElement).dataset.row!);
      apply();
    };
    const leave = (e: PointerEvent) => {
      hovered.delete((e.currentTarget as HTMLElement).dataset.row!);
      apply();
    };
    for (const r of baseRows) {
      r.addEventListener("pointerenter", enter);
      r.addEventListener("pointerleave", leave);
    }

    return () => {
      io.disconnect();
      for (const r of baseRows) {
        r.removeEventListener("pointerenter", enter);
        r.removeEventListener("pointerleave", leave);
      }
      for (const f of frames.values()) cancelAnimationFrame(f);
      applyRef.current = null;
    };
  }, [ready]);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    applyRef.current?.();
  };

  const beltId = `${id}-belt`;
  return (
    <>
      <div className={styles.head}>
        <p id={`${id}-label`} className={styles.label}>
          {label}
        </p>
        <button
          type="button"
          className={styles.pause}
          aria-controls={beltId}
          aria-label={paused ? "Play the logos" : "Pause the logos"}
          onClick={toggle}
        >
          {paused ? playIcon : pauseIcon}
          <span>{paused ? "Play" : "Pause"}</span>
        </button>
      </div>
      {children}
      <div id={beltId} ref={beltRef} className={styles.belt} aria-hidden="true" data-ready={ready ? "" : undefined}>
        {ready ? (
          <>
            <div className={styles.base}>
              <Rows rows={rows} />
            </div>
            <div className={styles.spot}>
              <Rows rows={rows} />
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
