import Image from "next/image";
import Link from "next/link";

import { CtaBand } from "@/components/cta-band/cta-band";
import styles from "@/components/about-page/about-page.module.css";
import { aboutPage, founders, type Founder } from "@/content/about";
import { ctaBand } from "@/content/cta-band";
import { bookingPath, builtPages } from "@/lib/navigation";
import { pageMetadata } from "@/lib/site";

// Layout E, picked by Nithish on 26 November 2026: the founders right under
// the head (face and words together, equal weight), why CareerHaki exists,
// The Ascent on the page's one ink band, then the shared call-to-action
// band (careerhaki-about-page-decisions.md). Copy: the copy team's, in
// src/content/about.ts.
export const metadata = pageMetadata({
  path: "/about",
  title: aboutPage.title,
  description: aboutPage.description,
});

/** The two founders are one row: both have a photo or neither does. */
const showPhoto = founders.every((f) => Boolean(f.photo));

function FounderBlock({ founder }: { founder: Founder }) {
  const first = founder.name.split(" ")[0];
  return (
    <article id={founder.id} className={styles.founder} aria-labelledby={`${founder.id}-name`}>
      {showPhoto && founder.photo ? (
        <div className={styles.photo}>
          <Image
            src={founder.photo}
            alt={founder.name}
            sizes="(width >= 53.75rem) 22.5rem, 17.5rem"
            placeholder="blur"
          />
        </div>
      ) : null}
      <p className={styles.founderEyebrow}>{founder.eyebrow}</p>
      <h3 id={`${founder.id}-name`} className={styles.name} translate="no">
        {founder.name}
      </h3>
      <p className={styles.role}>{founder.role}</p>
      {founder.job ? <p className={styles.job}>{founder.job}</p> : null}
      <p className={styles.bio}>{founder.bio}</p>
      {founder.bookLink || founder.linkedinUrl ? (
        <p className={styles.links}>
          {founder.bookLink ? (
            <Link href={bookingPath} className={styles.link}>
              {founder.bookLink}
              <span aria-hidden="true">&nbsp;→</span>
            </Link>
          ) : null}
          {founder.linkedinUrl ? (
            <a
              href={founder.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${founder.name} on LinkedIn (opens in a new tab)`}
              className={styles.link}
            >
              {first} on{" "}
              <span className={styles.nowrap}>
                LinkedIn
                <span aria-hidden="true">&nbsp;↗&#xFE0E;</span>
              </span>
            </a>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}

/**
 * The About page: head, the two founders, why CareerHaki exists (with the
 * mentors and a link to the Mentors page once it exists), The Ascent by
 * the reader's situation on the page's one ink band, and the shared
 * call-to-action band. Server components only; all motion is CSS (see
 * about-page.module.css).
 */
export default function AboutPage() {
  const { head, why, ascent } = aboutPage;
  return (
    <main id="main" className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>{head.eyebrow}</p>
        <h1 className={styles.title}>{head.title}</h1>
        <p className={styles.lead}>{head.lead}</p>
      </header>

      <section className={styles.founders} aria-labelledby="founders-title">
        <h2 id="founders-title" className={styles.vh}>
          {aboutPage.foundersTitle}
        </h2>
        <div className={styles.founderRow} data-photos={showPhoto ? "" : undefined}>
          {founders.map((founder) => (
            <FounderBlock key={founder.id} founder={founder} />
          ))}
        </div>
      </section>

      <section id="why" className={styles.section} aria-labelledby="why-title">
        <div className={styles.inner}>
          <div className={styles.split}>
            <div>
              <p className={styles.eyebrow}>{why.eyebrow}</p>
              <h2 id="why-title" className={styles.h2}>
                {why.title}
              </h2>
            </div>
            <div className={styles.text}>
              {why.body.map((paragraph) => (
                <p key={paragraph} className={styles.body}>
                  {paragraph}
                </p>
              ))}
              {builtPages.has("/mentors") ? (
                <p className={styles.more}>
                  <Link href="/mentors" className={styles.link}>
                    {why.mentorsLink}
                    <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="ascent" className={styles.ink} aria-labelledby="ascent-title">
        <div className={styles.inner}>
          <div className={styles.split}>
            <div>
              <p className={styles.eyebrow}>{ascent.eyebrow}</p>
              <h2 id="ascent-title" className={styles.h2}>
                {ascent.title}
              </h2>
              <p className={styles.body}>{ascent.lead}</p>
            </div>
            <div>
              <dl className={styles.rows}>
                {ascent.rows.map((row) => (
                  <div key={row.term} className={styles.row}>
                    <dt className={styles.term}>{row.term}</dt>
                    <dd className={styles.detail}>{row.detail}</dd>
                  </div>
                ))}
              </dl>
              <div className={styles.closing}>
                <p className={styles.body}>{ascent.closing}</p>
                <p className={styles.more}>
                  <Link href="/results" className={styles.link}>
                    {ascent.resultsLink}
                    <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand {...ctaBand} />
    </main>
  );
}
