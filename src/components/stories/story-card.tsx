import Image from "next/image";
import type { CSSProperties } from "react";

import { BAR_SCALE_MONTHS, type Story } from "@/content/stories";

import styles from "./success-stories.module.css";

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
 */
export function StoryCard({
  story,
  featured = false,
  showPhoto,
}: {
  story: Story;
  featured?: boolean;
  showPhoto: boolean;
}) {
  const { name, role, company, logo, linkedinUrl, photo, headline, card, bars } = story;
  const logoH = Math.round(LOGO_H * (logo?.boost ?? 1));
  const logoW = logo ? Math.round((logoH * logo.src.width) / logo.src.height) : 0;

  return (
    <article className={styles.card} data-featured={featured ? "" : undefined}>
      <h3 className={styles.headline}>{headline}</h3>
      <figure className={styles.figure}>
        <blockquote className={styles.quote}>
          <p>{card}</p>
        </blockquote>

        {bars && bars.length > 0 ? (
          <ul className={styles.bars}>
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
        ) : null}

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
    </article>
  );
}
