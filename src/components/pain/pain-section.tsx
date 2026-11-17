import { RevealGroup } from "@/components/reveal/reveal-group";

import styles from "./pain-section.module.css";

export type Pain = {
  title: string;
  body: string;
};

type PainSectionProps = {
  title: string;
  pains: readonly Pain[];
  /** The closing line. `turnMark` must be a phrase inside it; it gets the orange underline. */
  turn: string;
  turnMark: string;
};

/**
 * "The problem they feel": an H2, the design system's pain items (2px orange
 * rule, H3, a sentence or two) and a closing line, on the `surface` band.
 *
 * Motion:
 * - P1, the rules draw in: each item's orange rule draws from the left as it
 *   comes into view, items arriving together in turn, and its words follow.
 * - P2, the turn: as the closing line reaches the middle of the screen, the
 *   orange leaves the four rules (they settle to the hairline grey) and draws
 *   under the closing line's last words. It follows the scroll in both
 *   directions, in CSS alone; browsers without scroll-driven animations, and
 *   "reduce motion", get the still version (orange rules, no underline).
 */
export function PainSection({ title, pains, turn, turnMark }: PainSectionProps) {
  if (pains.length === 0) return null;
  const at = turn.lastIndexOf(turnMark);
  const before = at >= 0 ? turn.slice(0, at) : turn;
  const after = at >= 0 ? turn.slice(at + turnMark.length) : "";

  return (
    <section className={styles.band} aria-labelledby="pain-title">
      <div className={styles.inner}>
        <h2 id="pain-title" className={styles.title}>
          {title}
        </h2>
        <RevealGroup className={styles.grid}>
          {pains.map((pain) => (
            <div key={pain.title} className={styles.item} data-reveal="">
              <h3 className={styles.itemTitle}>{pain.title}</h3>
              <p className={styles.itemBody}>{pain.body}</p>
            </div>
          ))}
        </RevealGroup>
        <p className={styles.turn}>
          {before}
          {at >= 0 ? <span className={styles.mark}>{turnMark}</span> : null}
          {after}
        </p>
      </div>
    </section>
  );
}
