import type { CSSProperties } from "react";

import styles from "./fact-row.module.css";

export type Fact = {
  label: string;
  line: string;
};

/**
 * The design system's fact row: a hairline, then short label-and-line pairs.
 *
 * It can be revealed by a script that sets `data-facts-ready` (hide what has
 * not been seen) and then `data-facts-in` (the hairline draws across and the
 * facts rise in turn). Served without either, it simply shows.
 */
export function FactRow({
  facts,
  className,
}: {
  facts: readonly Fact[];
  className?: string;
}) {
  if (facts.length === 0) return null;
  return (
    <ul role="list" className={[styles.row, className ?? ""].join(" ")} data-facts="">
      {facts.map((fact, index) => (
        <li
          key={fact.label}
          className={styles.fact}
          style={{ "--fact-index": index } as CSSProperties}
        >
          <span className={styles.label}>{fact.label}</span>
          <span className={styles.line}>{fact.line}</span>
        </li>
      ))}
    </ul>
  );
}
