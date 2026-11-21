import type { ReactNode } from "react";

import styles from "./faq-section.module.css";

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type FaqSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
};

// Built once (rendering-hoist-jsx): the plus that turns into a minus.
const plusMinus = <span className={styles.icon} aria-hidden="true" />;

/**
 * The design system's FAQ: eyebrow, heading, then questions that open in
 * place. Native `details` and `summary`, so it works without script, by
 * keyboard (Tab, then Enter or Space) and with find-in-page.
 *
 * Motion A + C + D, chosen by Nithish (21 November), CSS only, no script:
 * - A, rules draw in: each question's hairline draws from the left as it
 *   arrives, then the question settles. Scroll-driven, reverses.
 * - C, split (from 860px): the heading holds still on the left while the
 *   questions pass on the right.
 * - D, the answer arrives: on opening, the space opens smoothly (where the
 *   browser can animate to its height) and the answer rises into place a
 *   beat later. The plus turns into a minus.
 *
 * Still version (reduce motion, and browsers without scroll-driven
 * animations): hairlines in place; answers open at once.
 */
export function FaqSection({ id, eyebrow, title, items }: FaqSectionProps) {
  if (items.length === 0) return null;
  const titleId = `${id}-title`;
  return (
    <section id={id} className={styles.section} aria-labelledby={titleId}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <details key={item.id} id={`${id}-${item.id}`} className={styles.item}>
            <summary className={styles.question}>
              <span>{item.question}</span>
              {plusMinus}
            </summary>
            <div className={styles.answer}>
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
