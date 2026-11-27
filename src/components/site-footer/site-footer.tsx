import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/careerhaki-logo.png";
import { socialLinks, whatsappUrl } from "@/lib/contact";
import { bookingPath, employerEnquiryPath, legalLinks, navLinks } from "@/lib/navigation";

import styles from "./site-footer.module.css";

type FooterLink = {
  href: string;
  label: string;
  /** Leaves a name such as GrowthHaki untranslated. */
  translate?: "no";
  /** An address outside the site (WhatsApp, LinkedIn, Instagram). */
  external?: boolean;
};

const byHref = (href: string): FooterLink => {
  const link = navLinks.find((l) => l.href === href);
  if (!link) throw new Error(`No navigation link for ${href}`);
  return { ...link };
};

/**
 * Built at module scope: the columns do not change between requests. The
 * WhatsApp and social links appear by themselves once their addresses are set
 * in src/lib/contact.ts; until then they are left out, never shown broken.
 */
const whatsapp = whatsappUrl();
const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "The program",
    links: [byHref("/the-ascent"), byHref("/results"), byHref("/mentors")],
  },
  {
    title: "Explore",
    links: [byHref("/growthhaki"), byHref("/for-employers"), byHref("/about")],
  },
  {
    title: "Talk to us",
    links: [
      { href: bookingPath, label: "Book a discovery call" },
      ...(whatsapp ? [{ href: whatsapp, label: "WhatsApp", external: true }] : []),
      { href: employerEnquiryPath, label: "Employer enquiry" },
      ...socialLinks().map((s) => ({ ...s, external: true })),
    ],
  },
];

const year = new Date().getFullYear();

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  return link.external ? (
    <a href={link.href} className={className} rel="noopener">
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className} translate={link.translate}>
      {link.label}
    </Link>
  );
}

/**
 * The site footer (design system: logo and one line, three link columns,
 * hairline, copyright and legal links). Light, on `bg`: the proof band is
 * the page's one `ink` band.
 *
 * Motion, chosen by Nithish (B with A), CSS scroll-driven animations only,
 * no script; both follow the scroll in both directions.
 * - B, reveal (from 860px wide and 600px tall): the page lifts off the
 *   footer. The page (`#main`) sits above the footer with a soft edge, and
 *   the footer's content slides out from under it at about half speed.
 * - A, settle (every size): the logo line and the three columns rise in
 *   turn, the hairline draws and the copyright line fades in. Each part runs
 *   on its own view timeline, so it has settled by the time it is fully on
 *   screen, even at the very end of the page.
 *
 * Still version (reduce motion, and browsers without scroll-driven
 * animations): the footer as designed, nothing hidden.
 */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner} data-footer-inner="">
        <div className={styles.top}>
          <div className={styles.brand} data-settle="" style={{ "--i": 0 } as CSSProperties}>
            <Link href="/" className={styles.logo}>
              <Image src={logo} alt="CareerHaki home" sizes="139px" className={styles.logoImage} />
            </Link>
            <p className={styles.line}>
              Career coaching and mentorship for people in tech. Based in Ottawa, working with
              candidates in Canada, the US and India.
            </p>
          </div>
          <nav aria-label="Footer" className={styles.columns}>
            {columns.map((column, i) => (
              <div
                key={column.title}
                className={styles.column}
                data-settle=""
                style={{ "--i": i + 1 } as CSSProperties}
              >
                <h2 className={styles.columnTitle}>{column.title}</h2>
                <ul role="list" className={styles.list}>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterAnchor link={link} className={styles.link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.base} data-footer-base="">
          <p className={styles.copyright}>
            © {year} <span translate="no">CareerHaki</span>
          </p>
          <nav aria-label="Legal" className={styles.legal}>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
            {/* Reopens the cookie banner (ConsentBanner listens for clicks
                on this attribute), so the footer stays a server component. */}
            <button type="button" className={`${styles.link} ${styles.linkButton}`} data-cookie-settings="">
              Cookie settings
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
