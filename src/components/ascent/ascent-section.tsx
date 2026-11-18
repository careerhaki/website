import { type Fact, FactRow } from "@/components/fact-row/fact-row";

import { AscentFacts } from "./ascent-facts";
import styles from "./ascent-section.module.css";

export type Stage = {
  name: string;
  /** One bold line. */
  line: string;
  body: string;
  items: readonly string[];
};

type AscentSectionProps = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Prepare, Land, Thrive, in order. The last is the dark card. */
  stages: readonly [Stage, Stage, Stage];
  facts: readonly Fact[];
};

/**
 * "How CareerHaki works": The Ascent, its three stage cards and the fact row.
 *
 * Still version (and browsers without scroll-driven animations): on desktop
 * the cards step up by 36px, Prepare lowest, and Thrive is the dark card; on
 * phones they are flat and stacked.
 *
 * Motion H3, the climb (CSS only, follows the scroll both ways):
 * - Desktop: the cards start level and climb into their steps, a small orange
 *   marker hops from card to card, and Thrive turns dark at the top.
 * - Phones and tablets: a slim Prepare, Land, Thrive bar sticks under the
 *   navigation, its orange line fills as you scroll and the stage you are
 *   reading turns dark; Thrive turns dark as it reaches the middle.
 * Then the fact row: its hairline draws and the facts rise in turn, once the
 * climb has finished and the row is in view (`AscentFacts`).
 */
export function AscentSection({ eyebrow, title, lead, stages, facts }: AscentSectionProps) {
  return (
    <section id="the-ascent" className={styles.section} aria-labelledby="ascent-title">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id="ascent-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>

      <div className={styles.bar} aria-hidden="true">
        {stages.map((stage) => (
          <span key={stage.name} className={styles.barLabel}>
            {stage.name}
          </span>
        ))}
        <span className={styles.barFill} />
      </div>

      <div className={styles.climb}>
        <span className={styles.marker} aria-hidden="true" />
        <ol role="list" className={styles.stages} data-stages="">
          {stages.map((stage, index) => (
            <li
              key={stage.name}
              className={styles.stage}
              data-stage={stage.name.toLowerCase()}
            >
              <span className={styles.numeral} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.stageName}>{stage.name}</h3>
              <p className={styles.stageLine}>{stage.line}</p>
              <p className={styles.stageBody}>{stage.body}</p>
              <ul role="list" className={styles.items}>
                {stage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <FactRow facts={facts} className={styles.facts} />
      <AscentFacts />
    </section>
  );
}
