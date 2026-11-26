import Link from "next/link";

import { CtaBand } from "@/components/cta-band/cta-band";
import { FactRow } from "@/components/fact-row/fact-row";
import { StoryCard } from "@/components/stories/story-card";
import styles from "@/components/ascent-page/ascent-page.module.css";
import { ascentFacts, ascentHead, ascentPage, ascentStages } from "@/content/ascent";
import { ctaBand } from "@/content/cta-band";
import { PHOTO_RULE, stories } from "@/content/stories";
import { pageMetadata } from "@/lib/site";

// Layout D, picked by Nithish on 25 November 2026: A's chapters on every
// screen plus B's phone bar (careerhaki-ascent-page-decisions.md). Copy:
// the homepage's for the head, stages and facts (src/content/ascent.ts); the
// copy team's for the rest; the students' words from stories.ts, unchanged.
export const metadata = pageMetadata({
  path: "/the-ascent",
  title: ascentPage.title,
  description: ascentPage.description,
});

const byId = new Map(stories.map((story) => [story.id, story]));

const stages = ascentStages.map((stage, index) => {
  const copy = ascentPage.stages[stage.id];
  const story = byId.get(copy.story.id);
  if (!story) throw new Error(`The Ascent page: no story "${copy.story.id}"`);
  if (copy.details.length !== stage.items.length) {
    throw new Error(`The Ascent page: ${stage.id} needs one line per item`);
  }
  return { ...stage, ...copy, numeral: String(index + 1).padStart(2, "0"), story, storyCopy: copy.story };
});

/** The three panels are one row: every panel has a photo or none does. */
const showPhoto = PHOTO_RULE === "each" || stages.every((stage) => Boolean(stage.story.photo));

/**
 * The Ascent page: head with a stage index, the three stages as chapters
 * (what the stage is on the left, what you do in it on the right, then one
 * student's story on a panel), Thrive on the page's one ink band, the fact
 * row and the shared call-to-action band. Phones also get a sticky Prepare ·
 * Land · Thrive bar under the navigation. Server components only; all
 * motion is CSS (see ascent-page.module.css).
 */
export default function AscentPage() {
  return (
    <main id="main">
      <header className={styles.head}>
        <p className={styles.eyebrow}>{ascentHead.eyebrow}</p>
        <h1 className={styles.title} translate="no">
          {ascentHead.title}
        </h1>
        <p className={styles.lead}>{ascentHead.lead}</p>
        <nav className={styles.index} aria-label="Stages">
          <ol role="list">
            {stages.map((stage) => (
              <li key={stage.id}>
                <a href={`#${stage.id}`} className={styles.indexLink}>
                  <span className={styles.indexNumeral} aria-hidden="true">
                    {stage.numeral}
                  </span>
                  {stage.name}
                  <span aria-hidden="true">&nbsp;↓</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <div className={styles.stages}>
        {/* Phones only: where you are, and a way to the other stages. */}
        <nav className={styles.bar} aria-label="Stage you’re reading">
          <ol role="list">
            {stages.map((stage) => (
              <li key={stage.id}>
                <a href={`#${stage.id}`} className={styles.barLink} data-bar={stage.id}>
                  {stage.name}
                </a>
              </li>
            ))}
          </ol>
          <span className={styles.barFill} aria-hidden="true" />
        </nav>

        {stages.map((stage) => (
          <section
            key={stage.id}
            id={stage.id}
            className={styles.stage}
            data-stage={stage.id}
            aria-labelledby={`${stage.id}-title`}
          >
            <div className={styles.inner}>
              <div className={styles.chapter}>
                <div className={styles.what}>
                  <span className={styles.numeral} aria-hidden="true">
                    {stage.numeral}
                  </span>
                  <h2 id={`${stage.id}-title`} className={styles.name}>
                    {stage.name}
                  </h2>
                  <p className={styles.line}>{stage.line}</p>
                  <p className={styles.body}>{stage.body}</p>
                  <p className={styles.start}>{stage.start}</p>
                  {stage.note ? <p className={styles.note}>{stage.note}</p> : null}
                </div>
                <dl className={styles.rows}>
                  {stage.items.map((item, i) => (
                    <div key={item} className={styles.row}>
                      <dt className={styles.term}>{item}</dt>
                      <dd className={styles.detail}>{stage.details[i]}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <StoryCard
                story={stage.story}
                featured
                showPhoto={showPhoto}
                label={stage.storyCopy.label}
                words={stage.storyCopy.words}
                className={styles.panel}
                headingId={`${stage.id}-story`}
                after={
                  <>
                    {stage.storyCopy.context ? (
                      <p className={styles.context}>{stage.storyCopy.context}</p>
                    ) : null}
                    <p className={styles.more}>
                      <Link href={`/results#${stage.story.id}`} className={styles.go}>
                        Read {stage.story.name.split(" ")[0]}’s full story
                        <span aria-hidden="true">&nbsp;→</span>
                      </Link>
                    </p>
                  </>
                }
              />
            </div>
          </section>
        ))}
      </div>

      <div className={styles.facts}>
        <FactRow facts={ascentFacts} />
      </div>

      <CtaBand {...ctaBand} />
    </main>
  );
}
