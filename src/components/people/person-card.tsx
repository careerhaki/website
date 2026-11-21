import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import styles from "./people-section.module.css";

export type Person = {
  /** A stable, unique name, also the card's anchor on the About page. */
  id: string;
  /** Their field or part of the program, for example "Cloud". */
  eyebrow: string;
  name: string;
  role: string;
  /** Two sentences at most. */
  bio: string;
  /** Optional link to more about them, for example "/about#nithish". */
  href?: string;
  /** The link's words, for example "About Nithish". Needed with `href`. */
  linkLabel?: string;
  /** A real photo, when supplied. The card works without one. */
  photo?: StaticImageData;
};

/**
 * The design system's person card: `surface` card with eyebrow (and a short
 * orange rule under it), name, role, two sentences, and an optional link.
 * A photo sits above the eyebrow when supplied.
 */
export function PersonCard({ person }: { person: Person }) {
  const { eyebrow, name, role, bio, href, linkLabel, photo } = person;
  return (
    <article className={styles.card} data-linked={href ? "" : undefined}>
      {photo ? (
        <Image
          src={photo}
          alt=""
          className={styles.photo}
          sizes="(width >= 53.75rem) 24rem, 84vw"
          placeholder="blur"
        />
      ) : null}
      <p className={styles.cardEyebrow}>{eyebrow}</p>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.role}>{role}</p>
      <p className={styles.bio}>{bio}</p>
      {href && linkLabel ? (
        <Link href={href} className={styles.more}>
          <span className={styles.moreText}>{linkLabel}</span>
        </Link>
      ) : null}
    </article>
  );
}
