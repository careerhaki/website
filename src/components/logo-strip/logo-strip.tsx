import { type AlumniLogo, logoRatio, logoScale } from "./alumni-logos";
import styles from "./logo-strip.module.css";
import { type BeltRow, SpotlightBelt } from "./spotlight-belt";

type LogoStripProps = {
  id: string;
  /** The visible label, e.g. "Where our alumni work". */
  label: string;
  /** Name of the list for screen readers. */
  listLabel: string;
  rows: readonly (readonly AlumniLogo[])[];
};

/** Logo height in px before optical sizing: phones, then from 860px. */
const HEIGHT = { phone: 26, wide: 32 } as const;
/** Space between logos in px, matching `--logo-gap` in the CSS. */
const GAP = { phone: 36, wide: 56 } as const;
/** Drift speed in px per second; a phone row moves as calmly as a desktop's. */
const SPEED = { phone: 26, wide: 32 } as const;

const ratio = logoRatio;
const scale = logoScale;

/** One copy of the row's set, in seconds of drift at the size's speed. */
function duration(row: readonly AlumniLogo[], size: "phone" | "wide") {
  const length = row.reduce((sum, logo) => sum + HEIGHT[size] * scale(logo) * ratio(logo) + GAP[size], 0);
  return `${(length / SPEED[size]).toFixed(1)}s`;
}

/**
 * The alumni logo strip, under the hero. Motion L, the spotlight belt,
 * chosen by Nithish (21 and 22 November 2026); see `SpotlightBelt`.
 *
 * Everything here is worked out at build time: each logo's optical size and
 * each row's drift duration, so the browser only has to slide the rows.
 * Screen readers hear one list of the companies' names; the belt itself is
 * hidden from them, since it repeats every logo.
 */
export function LogoStrip({ id, label, listLabel, rows }: LogoStripProps) {
  const belt: BeltRow[] = rows.map((row) => ({
    durPhone: duration(row, "phone"),
    durWide: duration(row, "wide"),
    logos: row.map((logo) => {
      const k = scale(logo);
      const height = Math.round(HEIGHT.wide * k);
      return {
        id: logo.id,
        src: logo.src.src,
        width: Math.round(height * ratio(logo)),
        height,
        k: Number(k.toFixed(3)),
        tone: logo.tone,
      };
    }),
  }));
  return (
    <section id={id} className={styles.strip} aria-labelledby={`${id}-label`}>
      <SpotlightBelt id={id} label={label} rows={belt}>
        <ul className="sr-only" aria-label={listLabel}>
          {rows.flat().map((logo) => (
            <li key={logo.id} translate="no">
              {logo.name}
            </li>
          ))}
        </ul>
      </SpotlightBelt>
    </section>
  );
}
