import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { TimeBars } from "@/components/stories/time-bars";
import type { ResultsStory } from "@/content/results";
import { builtPages } from "@/lib/navigation";

import styles from "./results.module.css";

/** Logo height before its optical boost, in px (as on the story cards). */
const LOGO_H = 22;

/** The stage links wait for The Ascent page: never a dead link. */
const ascentBuilt = builtPages.has("/the-ascent");

// Built once (rendering-hoist-jsx).
const chevron = (
  <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

/** "The Ascent" is a name: never translated. */
function withName(text: string): ReactNode {
  const [before, after] = text.split("The Ascent");
  if (after === undefined) return text;
  return (
    <>
      {before}
      <span translate="no">The Ascent</span>
      {after}
    </>
  );
}

/**
 * One story row on the Results page (frame F): the student's starting point
 * as the eyebrow, the approved headline and pull-quote, the M2 time bars,
 * then logo, name and role today. "Read {first}’s story" opens the rest in
 * place: Before / What changed / After / First 90 days on a path (as the
 * Book a Call journeys) and the stage link once The Ascent page exists. No
 * booking panel per story: the call-to-action band ends the page (Nithish,
 * 24 November). Every word of the student's is from stories.ts, unchanged.
 */
export function StoryRow({ story, showPhoto }: { story: ResultsStory; showPhoto: boolean }) {
  const { id, first, name, role, company, logo, linkedinUrl, photo } = story;
  const logoH = Math.round(LOGO_H * (logo?.boost ?? 1));
  const parts = [
    { key: "before", label: "Before", text: story.before },
    { key: "changed", label: "What changed", text: story.changed },
    { key: "after", label: "After", text: story.after },
    { key: "first90", label: "First 90 days", text: story.first90Days },
  ];

  return (
    <article className={styles.row} aria-labelledby={`${id}-title`}>
      <p className={styles.start}>{story.eyebrow}</p>
      <h3 id={`${id}-title`} className={styles.headline}>
        {story.headline}
      </h3>
      <blockquote className={styles.quote}>
        <p>{story.pullQuote}</p>
      </blockquote>
      {story.bars ? <TimeBars bars={story.bars} className={styles.bars} /> : null}

      <div className={styles.who}>
        {logo ? (
          <Image
            src={logo.src}
            alt=""
            width={Math.round((logoH * logo.src.width) / logo.src.height)}
            height={logoH}
            className={styles.logo}
            style={{ "--logo-h": `${logoH}px` } as CSSProperties}
          />
        ) : null}
        <div className={styles.person}>
          {showPhoto && photo ? (
            <Image src={photo} alt="" className={styles.photo} width={56} height={56} sizes="56px" />
          ) : null}
          <p className={styles.names}>
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
          </p>
        </div>
      </div>

      <details className={styles.story}>
        <summary className={styles.toggle}>
          <span className={styles.whenClosed}>Read {first}’s story</span>
          <span className={styles.whenOpen}>Hide story</span>
          {chevron}
        </summary>
        <div className={styles.opened}>
          <ol className={styles.parts}>
            {parts.map((part) => (
              <li key={part.key} className={styles.part} data-part={part.key}>
                {part.key === "first90" ? null : <span className={styles.seg} aria-hidden="true" />}
                <p className={styles.partLabel}>{part.label}</p>
                <blockquote className={styles.partText}>
                  <p>{part.text}</p>
                </blockquote>
              </li>
            ))}
          </ol>
          {ascentBuilt ? (
            <p className={styles.stage}>
              <Link href={story.stageHref} className={styles.go}>
                {withName(story.stageText)}
                <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </p>
          ) : null}
        </div>
      </details>
    </article>
  );
}
