import type { CSSProperties } from "react";

import { BAR_SCALE_MONTHS, type TimeBar } from "@/content/stories";

import styles from "./time-bars.module.css";

/**
 * Motion M2's time bars, on one shared scale. Decorative rails; the label and
 * the value are always plain text ("On his own: 9+ months applying").
 */
export function TimeBars({ bars, className }: { bars: readonly TimeBar[]; className?: string }) {
  if (bars.length === 0) return null;
  return (
    <ul className={className ? `${styles.bars} ${className}` : styles.bars}>
      {bars.map((bar) => (
        <li key={bar.label} className={styles.bar}>
          <span className={styles.barLabel}>{bar.label}</span>
          <span className={styles.vh}>: </span>
          <span className={styles.rail} aria-hidden="true">
            <span
              className={styles.fill}
              data-tone={bar.tone}
              style={{ "--w": Math.min(1, bar.months / BAR_SCALE_MONTHS) } as CSSProperties}
            />
          </span>
          <span className={styles.barValue}>{bar.value}</span>
        </li>
      ))}
    </ul>
  );
}
