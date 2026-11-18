import type { CSSProperties } from "react";

import styles from "./proof-band.module.css";

export type Proof = {
  /** A stable, unique name for the figure. */
  id: string;
  /** The figure exactly as written, for example "$25K+" or "1 to 4". */
  figure: string;
  /** One line under the figure. */
  label: string;
};

type ProofBandProps = {
  eyebrow: string;
  title: string;
  proofs: readonly Proof[];
};

/** Splits "1 to 4" into ["", "1", " to ", "4", ""]: odd entries are digits. */
const DIGIT_RUNS = /(\d+)/;
const splitDigits = (figure: string) => figure.split(DIGIT_RUNS);

/**
 * The design system's proof band: `ink` ground, eyebrow and heading on the
 * left, large `accent` figures on the right separated by hairlines. Use only
 * confirmed proof from the operating brief.
 *
 * Motion, chosen by Nithish (A with B), CSS scroll-driven animations only, no
 * script. Both follow the scroll in both directions.
 * - A, lights down: as the band arrives, the dark grows from a rounded panel
 *   inside the page margins to the full width, and the heading's words come
 *   up out of the dark in turn.
 * - B, the figures follow your scroll: each row's hairline draws, then each
 *   digit rolls up to its real value like an odometer, rightmost first, and
 *   the label settles in. From 860px the heading holds still beside them.
 *
 * Still version (reduce motion, and browsers without scroll-driven
 * animations): the band as designed, nothing hidden.
 *
 * The page text of a figure is exactly the figure ("$25K+"). The digits a
 * wheel rolls past are CSS generated content with empty alternative text, so
 * search engines and screen readers never see them.
 */
export function ProofBand({ eyebrow, title, proofs }: ProofBandProps) {
  if (proofs.length === 0) return null;
  const words = title.split(" ");

  return (
    <section id="results" className={styles.band} aria-labelledby="results-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="results-title" className={styles.title}>
            {words.map((word, i) => (
              <span key={i}>
                <span className={styles.word} style={{ "--i": i } as CSSProperties}>
                  {word}
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h2>
        </div>
        <ul role="list" className={styles.rows} data-proofs="">
          {proofs.map(({ id, figure, label }) => {
            const parts = splitDigits(figure);
            // k counts digits from the right: 0 for the last one, which
            // settles first.
            const total = parts.reduce((n, part, i) => (i % 2 ? n + part.length : n), 0);
            let before = 0;
            const pieces = parts.map((part, i) => {
              if (i % 2 === 0) return part;
              const start = before;
              before += part.length;
              return [...part].map((digit, j) => (
                <span key={`${i}-${j}`} className={styles.wheel}>
                  <span
                    className={styles.digit}
                    data-d={digit}
                    style={{ "--d": Number(digit), "--k": total - 1 - (start + j) } as CSSProperties}
                  >
                    {digit}
                  </span>
                </span>
              ));
            });
            return (
              <li key={id} className={styles.row}>
                <p className={styles.figure}>{pieces}</p>
                <p className={styles.label}>{label}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
