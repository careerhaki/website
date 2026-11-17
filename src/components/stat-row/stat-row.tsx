import type { ReactNode } from "react";

import { CountUp } from "./count-up";
import { formatter } from "./format";
import styles from "./stat-row.module.css";

export type Stat = {
  /** The number that counts up, for example 120 or 4.9. */
  value: number;
  /** Decimal places shown while counting (1 for 4.9). */
  decimals?: number;
  /** Text after the number, for example "+" or " in 100". */
  suffix?: string;
  /** One line under the figure. Wrap brand names in translate="no". */
  label: ReactNode;
  /** A stable, unique name for the figure. */
  id: string;
};

/**
 * The design system's stat row: a hairline, then figures in the headline face
 * with a one-line label under each. Motion H2 (count-up) lives in `CountUp`.
 * Use only confirmed proof from the operating brief.
 */
export function StatRow({
  stats,
  className,
}: {
  stats: readonly Stat[];
  className?: string;
}) {
  if (stats.length === 0) return null;
  return (
    <CountUp className={[styles.row, className ?? ""].join(" ")}>
      {stats.map(({ id, value, decimals = 0, suffix = "", label }) => {
        const number = formatter(decimals).format(value);
        return (
          <li key={id} className={styles.stat}>
            <span className={styles.figure}>
              <span className="sr-only">{`${number}${suffix}`}</span>
              <span aria-hidden="true">
                <span
                  className={styles.number}
                  data-count-to={value}
                  data-decimals={decimals}
                >
                  {number}
                </span>
                {suffix}
              </span>
            </span>
            <span className={styles.label}>{label}</span>
          </li>
        );
      })}
    </CountUp>
  );
}
