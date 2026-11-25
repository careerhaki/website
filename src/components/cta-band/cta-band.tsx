import type { ReactNode } from "react";

import { ButtonAnchor, ButtonLink } from "@/components/button";
import { whatsappUrl } from "@/lib/contact";
import { bookingPath } from "@/lib/navigation";


type CtaBandProps = {
  id: string;
  eyebrow: string;
  /** The heading's first line, up to and around the marked words. */
  title: {
    before: string;
    /** The words the orange underline draws under. */
    mark: string;
    after: string;
    /** The second line, which slides into line with the first. */
    line2: string;
  };
  lead: ReactNode;
  /** One short line under the buttons. */
  note: string;
};

// Read at build time: the number is a constant until module 1.5.
const whatsapp = whatsappUrl();

/**
 * The design system's call-to-action band: surface ground, H1-size heading,
 * lead, the button pair. The last section of a page, before the footer.
 *
 * Motion A + B, chosen by Nithish (21 November), CSS scroll-driven only, no
 * script: as the band arrives, the heading's second line slides into line
 * with the first (the gap closes); once it lands, an orange underline draws
 * under the marked words; then the button's arrow nudges once. It reverses
 * on the way back up, and finishes before the band's middle reaches the
 * middle of the screen, so it is complete at the end of the page.
 *
 * Still version (reduce motion, and browsers without scroll-driven
 * animations): the lines aligned and the underline drawn.
 *
 * The booking button carries `data-hero-cta`, so the navigation's "Book a
 * call" is an outline while this one is on screen (N2).
 */
export function CtaBand({ id, eyebrow, title, lead, note }: CtaBandProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className="cta-band" aria-labelledby={titleId}>
      <div className="cta-band-inner">
        <p className="cta-band-eyebrow">{eyebrow}</p>
        <h2 id={titleId} className="cta-band-title">
          <span className="cta-band-line">
            {title.before}
            <span className="cta-band-mark">{title.mark}</span>
            {title.after}
          </span>{" "}
          <span className="cta-band-line cta-band-line2">{title.line2}</span>
        </h2>
        <p className="cta-band-lead">{lead}</p>
        <div className="cta-band-actions">
          <ButtonLink href={bookingPath} arrow className="cta-band-book" data-hero-cta="">
            Book a discovery call
          </ButtonLink>
          {whatsapp ? (
            <ButtonAnchor href={whatsapp} variant="secondary" rel="noopener">
              Message us on WhatsApp
            </ButtonAnchor>
          ) : null}
        </div>
        <p className="cta-band-note">{note}</p>
      </div>
    </section>
  );
}
