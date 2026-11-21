import type { CSSProperties } from "react";

import { type Person, PersonCard } from "./person-card";
import styles from "./people-section.module.css";

type PeopleSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  people: readonly Person[];
};

/**
 * A section of person cards: eyebrow, heading, lead, then the cards.
 *
 * Motion, chosen by Nithish (B + A + C), CSS only, no script:
 * - B, swipe row (under 860px): the cards sit in a row you swipe, with scroll
 *   snap; the card in the middle is full size and its neighbours step back
 *   (smaller, never dimmed, so their text keeps full contrast).
 *   The next card peeks in from the edge, so the row reads as more to see.
 * - A, rise in turn (from 860px): the cards rise in turn as the row arrives,
 *   and the short orange rule under each eyebrow draws. Scroll-driven.
 * - C, lift (any size): pointing at a card that links somewhere, or tabbing
 *   to its link, lifts it 6px with a soft shadow and underlines the link.
 *
 * Still version (reduce motion, and browsers without scroll-driven
 * animations): the cards as designed; on phones the row still swipes.
 */
export function PeopleSection({ id, eyebrow, title, lead, people }: PeopleSectionProps) {
  if (people.length === 0) return null;
  const titleId = `${id}-title`;
  return (
    <section id={id} className={styles.section} aria-labelledby={titleId}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>
      {/* The row scrolls sideways on phones. A keyboard reaches every card
          through its link; when a card has no link, the row itself takes
          focus so it can be scrolled with the arrow keys. */}
      <ul
        role="list"
        className={styles.row}
        aria-label={eyebrow}
        tabIndex={people.some((p) => !p.href) ? 0 : undefined}
      >
        {people.map((person, i) => (
          <li key={person.id} className={styles.item} style={{ "--i": i } as CSSProperties}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>
    </section>
  );
}
