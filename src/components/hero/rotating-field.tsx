"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./hero.module.css";

/** How long each word stays, in milliseconds. */
const INTERVAL = 2400;
/**
 * Full rounds before it rests on the first word for good. WCAG 2.2.2 asks
 * that motion which starts by itself and runs beside other content either
 * stops or can be paused; one round shows every field (about 12 seconds for five) and then stops.
 * Infinity loops for as long as the hero is on screen.
 */
const ROUNDS = 1;

/**
 * Motion H4: the last word of the eyebrow cycles through the fields.
 *
 * Every word is in the page, stacked in one grid cell, so the box is always as
 * wide as the widest word: the line never re-wraps and the headline never
 * moves. Only the active word is visible. Screen readers and search read the
 * first word once; the moving box is hidden from them.
 *
 * It runs only while it is on screen and the tab is visible, goes round
 * ROUNDS times and comes to rest on the first word. With "reduce motion" on
 * it stays on the first word.
 */
export function RotatingField({ words }: { words: readonly string[] }) {
  // Steps taken so far. The word animates in only after the first step, so
  // nothing moves on arrival.
  const [step, setStep] = useState(0);
  const boxRef = useRef<HTMLSpanElement>(null);
  const count = words.length;

  useEffect(() => {
    const box = boxRef.current;
    if (!box || count < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const last = count * ROUNDS;
    let onScreen = false;
    let steps = 0;
    let timer: number | undefined;

    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const advance = () => {
      steps += 1;
      setStep(steps);
      if (steps >= last) stop();
    };
    const update = () => {
      if (reduce.matches) {
        steps = 0;
        setStep(0);
      }
      const run =
        onScreen &&
        steps < last &&
        !reduce.matches &&
        document.visibilityState === "visible";
      if (run && timer === undefined) {
        timer = window.setInterval(advance, INTERVAL);
      } else if (!run && timer !== undefined) {
        stop();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    observer.observe(box);
    reduce.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      stop();
      observer.disconnect();
      reduce.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [count]);

  if (count === 0) return null;
  const active = step % count;

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span
        ref={boxRef}
        className={styles.field}
        aria-hidden="true"
        data-moved={step > 0 ? "" : undefined}
      >
        {words.map((word, index) => (
          <span
            key={word}
            className={styles.word}
            data-active={index === active ? "" : undefined}
          >
            {word}
          </span>
        ))}
      </span>
    </>
  );
}
