import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import type { Story } from "@/content/stories";

import styles from "./success-stories.module.css";
import { TimeBars } from "./time-bars";

/** Logo height on the card before its optical boost, in px. */
const LOGO_H = 22;

/**
 * The design system's story card. Markup: article, h3 headline, then a
 * figure holding the student's words (blockquote), the M2 time bars and a
 * figcaption with photo, name, role and company, and the employer's logo.
 *
 * - The logo is in one colour (the logo strip's filter) and decorative
 *   (alt=""): the company is already written in the caption.
 * - The name links to LinkedIn once `linkedinUrl` is set, in a new tab.
 * - The photo shows only when `showPhoto` is true (the photo rule is applied
 *   by the section, across the row).
 * - The bars are decorative; their numbers are always plain text.
 *
 * The Ascent page uses the featured card as each stage's story panel, with
 * an eyebrow-style `label`, another of the student's approved texts in
 * quotes (`words`), and a context line and link after the figure (`after`).
 * The homepage passes none of these.
 */
export function StoryCard({
  story,
  featured = false,
  showPhoto,
  label,
  words,
  after,
  className,
  headingId,
}: {
  story: Story;
  featured?: boolean;
  showPhoto: boolean;
  label?: string;
  /** Which approved text to show; the card text by default. */
  words?: "card" | "changed" | "first90Days";
  after?: ReactNode;
  className?: string;
  headingId?: string;
}) {
  const { name, role, company, logo, linkedinUrl, photo, headline, bars } = story;
  const text = story[words ?? "card"];
  const logoH = Math.round(LOGO_H * (logo?.boost ?? 1));
  const logoW = logo ? Math.round((logoH * logo.src.width) / logo.src.height) : 0;

  return (
    <article
      className={className ? `${styles.card} ${className}` : styles.card}
      data-featured={featured ? "" : undefined}
      aria-labelledby={headingId}
    >
      {label ? <p className={styles.label}>{label}</p> : null}
      <h3 id={headingId} className={styles.headline}>
        {headline}
      </h3>
      <figure className={styles.figure}>
        <blockquote className={styles.quote}>
          {/* The homepage shows the card text as is; other texts in quotes. */}
          <p>{words ? `“${text}”` : text}</p>
        </blockquote>

        {bars ? <TimeBars bars={bars} /> : null}

        <figcaption className={styles.caption}>
          {showPhoto && photo ? (
            <Image src={photo} alt="" className={styles.photo} width={56} height={56} sizes="56px" />
          ) : null}
          <span className={styles.who}>
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.name}
                translate="no"
                aria-label={`${name} on LinkedIn (opens in a new tab)`}
              >
                {name}
              </a>
            ) : (
              <span className={styles.name} translate="no">
                {name}
              </span>
            )}
            <span className={styles.role}>
              {role}, <span translate="no">{company}</span>
            </span>
          </span>
          {logo ? (
            <Image
              src={logo.src}
              alt=""
              width={logoW}
              height={logoH}
              className={styles.logo}
              style={{ "--logo-h": `${logoH}px` } as CSSProperties}
            />
          ) : null}
        </figcaption>
      </figure>
      {after}
    </article>
  );
}
