import { ButtonAnchor, ButtonLink } from "@/components/button";
import { type Stat, StatRow } from "@/components/stat-row/stat-row";
import { whatsappUrl } from "@/lib/contact";
import { bookingPath } from "@/lib/navigation";

import styles from "./hero.module.css";
import { RotatingField } from "./rotating-field";

type HeroProps = {
  /** The eyebrow up to its last word, ending in a space. */
  eyebrow: string;
  /** The eyebrow's last word, cycled in turn (H4). The first is the still one. */
  fields: readonly string[];
  title: string;
  lead: string;
  stats: readonly Stat[];
};

// Read at build time: the number is a constant until module 1.5.
const whatsapp = whatsappUrl();

/**
 * The design system's hero: eyebrow, H1, lead, the button pair, the stat row.
 * Built for type alone; a session photo can take the right half later.
 *
 * Motion: H1, the headline never moves and the rest rises into place once
 * (CSS only, so it runs before any script); H2 in the stat row; H4 in the
 * eyebrow; H5 on the buttons. The main button carries `data-hero-cta`, which
 * switches on the navigation's N2.
 */
export function Hero({ eyebrow, fields, title, lead, stats }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <p className={styles.eyebrow}>
        {eyebrow}
        <RotatingField words={fields} />
      </p>
      <h1 id="hero-title" className={styles.title}>
        {title}
      </h1>
      <p className={`${styles.lead} ${styles.rise}`}>{lead}</p>
      <div className={`${styles.actions} ${styles.rise}`}>
        <ButtonLink href={bookingPath} arrow data-hero-cta="">
          Book a discovery call
        </ButtonLink>
        {whatsapp ? (
          <ButtonAnchor href={whatsapp} variant="secondary" rel="noopener">
            Message us on WhatsApp
          </ButtonAnchor>
        ) : null}
      </div>
      <StatRow stats={stats} className={`${styles.stats} ${styles.rise}`} />
    </section>
  );
}
