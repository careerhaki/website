import Link from "next/link";

import { PHOTO_RULE, type Story } from "@/content/stories";

import { StoryCard } from "./story-card";
import styles from "./success-stories.module.css";

type SuccessStoriesProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  /** The featured story first, then the others. */
  stories: readonly Story[];
  context: string;
  link: { href: string; label: string };
};

/** Within a row, every card has a photo or none does (PHOTO_RULE). */
const photosShown = (row: readonly Story[]) =>
  PHOTO_RULE === "each" || row.every((story) => Boolean(story.photo));

/**
 * Homepage success stories, layout A (picked by Nithish, 22 November): the
 * featured story on a `surface` panel, the other two beside it on desktop as
 * hairline-topped columns with no fill, so they don't echo the people cards.
 * Then a context line and a text link to book.
 *
 * Motion, CSS only, no script:
 * - M2, time bars: each story's time fills as a thin bar with the scroll, on
 *   one shared 9-month scale. Karandeep's 9+ months on his own fill first in
 *   `muted`, then his under 4 weeks with CareerHaki in `accent`.
 * - M3, stacked stories (under 860px): the two smaller stories stick under
 *   the navigation in turn, the second sliding over the first.
 *
 * Still version (reduce motion, and browsers without scroll-driven
 * animations): bars full, no stacking. No quote mark, no logo colouring
 * (both decided against, 22 November).
 */
export function SuccessStories({ id, eyebrow, title, lead, stories, context, link }: SuccessStoriesProps) {
  if (stories.length === 0) return null;
  const [featured, ...others] = stories;
  const showPhoto = photosShown(stories);
  const titleId = `${id}-title`;

  return (
    <section id={id} className={styles.section} aria-labelledby={titleId}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>

      <div className={styles.stories}>
        <StoryCard story={featured} featured showPhoto={showPhoto} />
        {others.length > 0 ? (
          <div className={styles.others}>
            {others.map((story) => (
              <div key={story.id} className={styles.other}>
                <StoryCard story={story} showPhoto={showPhoto} />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <p className={styles.context}>{context}</p>
      <p className={styles.more}>
        <Link href={link.href} className={styles.go}>
          {link.label}
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </Link>
      </p>
    </section>
  );
}
