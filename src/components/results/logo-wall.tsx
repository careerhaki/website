import Image from "next/image";
import type { CSSProperties } from "react";

import { type AlumniLogo, alumniRows, logoRatio, logoScale } from "@/components/logo-strip/alumni-logos";
import { WALL_FIRST } from "@/content/results";

import { WallMore } from "./results-island";
import styles from "./results.module.css";

/** Logo height in px before optical sizing, from 860px (phones: 26px in CSS). */
const HEIGHT = 32;

const all = alumniRows.flat();
const first = new Set<string>(WALL_FIRST);
const byId = new Map(all.map((logo) => [logo.id, logo]));

/** The first 12 in their set order, then the rest in the strip's order. */
const ordered: readonly AlumniLogo[] = [
  ...WALL_FIRST.map((id) => byId.get(id)).filter((l): l is AlumniLogo => Boolean(l)),
  ...all.filter((logo) => !first.has(logo.id)),
];

/**
 * The Results page's logo wall: all 34 alumni employers, still, in one
 * colour (the logo strip's filter; Nature's Touch soft), sized as the strip
 * sizes them. Each logo's alternative text is the company's official name.
 * Phones show the first 12 and "Show all 34 companies"; desktop shows all.
 */
export function LogoWall({ id, label, listLabel }: { id: string; label: string; listLabel: string }) {
  const listId = `${id}-list`;
  return (
    <section className={styles.wall} aria-labelledby={`${id}-label`}>
      <h2 id={`${id}-label`} className={styles.wallLabel}>
        {label}
      </h2>
      <ul id={listId} className={styles.wallList} aria-label={listLabel} tabIndex={-1}>
        {ordered.map((logo) => {
          const k = logoScale(logo);
          const height = Math.round(HEIGHT * k);
          return (
            <li key={logo.id} className={styles.wallItem}>
              <Image
                src={logo.src}
                alt={logo.name}
                width={Math.round(height * logoRatio(logo))}
                height={height}
                className={styles.wallLogo}
                data-tone={logo.tone}
                translate="no"
                style={{ "--k": Number(k.toFixed(3)) } as CSSProperties}
              />
            </li>
          );
        })}
      </ul>
      <WallMore listId={listId} label={`Show all ${ordered.length} companies`} />
    </section>
  );
}
