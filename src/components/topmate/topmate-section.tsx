import Image from "next/image";
import type { ReactNode } from "react";

import { type Story, stories } from "@/content/stories";
import {
  isFragment,
  type TopmateJourney,
  type TopmateReview,
  topmateJourneys,
  topmateProfileUrl,
  topmateReviews,
} from "@/content/topmate-reviews";

import styles from "./topmate-section.module.css";

/** Logo height before its optical boost, in px (as on the story cards). */
const LOGO_H = 22;

const storyById = new Map(stories.map((story) => [story.id, story]));
const reviewById = new Map(topmateReviews.map((review) => [review.id, review]));

/** Karandeep's review lives in his journey row; the others are listed. */
const FEATURED_REVIEW = "bebin-samuel";
const LISTED_REVIEWS = ["mounika-mannuru", "azin-katiraee"];

const pullQuote = (quote: string) => (isFragment(quote) ? `…${quote}…` : quote);

const fullReview = (review: TopmateReview) => (
  <>
    “{review.before}
    <strong className={styles.pull}>{review.quote}</strong>
    {review.after}”
  </>
);

function Chevron() {
  return (
    <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** A disclosure: a control, not a link (no underline, a chevron). */
function Toggle({ open, close, children }: { open: string; close: string; children: ReactNode }) {
  return (
    <details className={styles.toggle}>
      <summary>
        <span className={styles.whenClosed}>{open}</span>
        <span className={styles.whenOpen}>{close}</span>
        <Chevron />
      </summary>
      <div className={styles.toggleBody}>{children}</div>
    </details>
  );
}

function Journey({ journey, story }: { journey: TopmateJourney; story: Story }) {
  const { topmate, changed } = journey;
  const review = topmate.fullReviewId ? reviewById.get(topmate.fullReviewId) : undefined;
  const logo = story.logo;
  const logoH = Math.round(LOGO_H * (logo?.boost ?? 1));
  const firstName = story.name.split(" ")[0];

  return (
    <li className={styles.journey}>
      <h3 className={styles.person} translate="no">
        {story.name}
      </h3>
      <ol className={styles.steps}>
        <li className={styles.step}>
          <span className={styles.seg} aria-hidden="true" />
          <p className={styles.label}>
            <span aria-hidden="true">1:1 w/Nithish</span>
            <span className={styles.vh}>1:1 with Nithish</span>
          </p>
          <figure className={styles.topmate}>
            <blockquote>
              <p className={styles.topmateQuote}>“{review ? pullQuote(topmate.quote) : topmate.quote}”</p>
            </blockquote>
            <figcaption className={styles.source}>
              <span translate="no">Topmate</span>, {topmate.date}
            </figcaption>
          </figure>
          {review ? (
            <Toggle open="Read the full review" close="Show less">
              <p>{fullReview(review)}</p>
            </Toggle>
          ) : null}
        </li>
        <li className={styles.step}>
          <span className={styles.seg} aria-hidden="true" />
          <p className={styles.label}>
            Joined <span translate="no">CareerHaki</span>
          </p>
          <blockquote className={styles.changed}>
            <p>“{changed}”</p>
          </blockquote>
        </li>
        <li className={styles.step}>
          <p className={styles.label}>Now</p>
          {logo ? (
            <Image
              src={logo.src}
              alt=""
              width={Math.round((logoH * logo.src.width) / logo.src.height)}
              height={logoH}
              className={styles.logo}
              style={{ height: logoH }}
            />
          ) : null}
          <p className={styles.now}>
            {story.role}, <span translate="no">{story.company}</span>
          </p>
          <Toggle open={`Read ${firstName}’s story`} close="Hide story">
            <blockquote>
              <p>“{story.card}”</p>
            </blockquote>
          </Toggle>
        </li>
      </ol>
    </li>
  );
}

/**
 * Book a Call, Topmate proof (option E1, picked by Nithish on 22 November
 * 2026, after two blind reviews and four prototype rounds).
 *
 * 1. The four journeys: a Topmate 1:1 with Nithish (their review, word for
 *    word) → joined CareerHaki (their own words from their approved story)
 *    → now (logo, role, company, and their story opening in place, so the
 *    visitor stays beside the calendar). The context line sits under the
 *    heading: a Topmate 1:1 is not part of The Ascent, and not every student
 *    lands a role.
 * 2. Reviews: Bebin's in full on a panel, then two pull-quotes that open to
 *    the full review, then the Topmate link (new tab).
 * 3. "Pick a time": back up to the calendar, on every screen.
 *
 * Motion, CSS scroll-driven, transform only: each row's line draws in two
 * segments (1:1 → Joined, Joined → Now), and each dot grows as the line
 * reaches it. Still version (reduce motion, Firefox): lines and dots drawn.
 */
export function TopmateSection({ calendarId }: { calendarId: string }) {
  const featured = reviewById.get(FEATURED_REVIEW);
  const listed = LISTED_REVIEWS.map((id) => reviewById.get(id)).filter((r): r is TopmateReview => Boolean(r));

  return (
    <div className={styles.wrap}>
      <section aria-labelledby="topmate-journeys">
        <h2 id="topmate-journeys" className={styles.title}>
          Four people who met Nithish on <span translate="no">Topmate</span> first
        </h2>
        <p className={styles.context}>
          A <span translate="no">Topmate</span> 1:1 is a session with Nithish outside{" "}
          <span translate="no">The Ascent</span>. 82 in 100 <span translate="no">CareerHaki</span> students
          land a role.
        </p>
        <ol className={styles.journeys}>
          {topmateJourneys.map((journey) => {
            const story = storyById.get(journey.storyId);
            return story ? <Journey key={journey.storyId} journey={journey} story={story} /> : null;
          })}
        </ol>
      </section>

      <section aria-labelledby="topmate-reviews" className={styles.reviews}>
        <h2 id="topmate-reviews" className={styles.eyebrow}>
          What people said after a 1:1 session with Nithish on <span translate="no">Topmate</span>
        </h2>
        {featured ? (
          <figure className={styles.featured}>
            <blockquote>
              <p>{fullReview(featured)}</p>
            </blockquote>
            <figcaption className={styles.reviewer}>
              <span className={styles.reviewerName} translate="no">
                {featured.name}
              </span>
              <span>
                <span translate="no">Topmate</span>, {featured.date}
              </span>
            </figcaption>
          </figure>
        ) : null}
        <ul className={styles.list}>
          {listed.map((review) => (
            <li key={review.id}>
              <figure className={styles.review}>
                <blockquote>
                  <p className={styles.reviewQuote}>“{pullQuote(review.quote)}”</p>
                </blockquote>
                <figcaption className={styles.reviewer}>
                  <span className={styles.reviewerName} translate="no">
                    {review.name}
                  </span>
                  <span>
                    <span translate="no">Topmate</span>, {review.date}
                  </span>
                </figcaption>
              </figure>
              <Toggle open="Read the full review" close="Show less">
                <p>{fullReview(review)}</p>
              </Toggle>
            </li>
          ))}
        </ul>
        <p className={styles.external}>
          <a
            href={topmateProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read all reviews on Topmate (opens in a new tab)"
            className={styles.link}
          >
            Read all reviews on{" "}
            <span className={styles.nowrap}>
              Topmate
              <span aria-hidden="true">&nbsp;↗&#xFE0E;</span>
            </span>
          </a>
        </p>
        <a href={`#${calendarId}`} className={styles.pick}>
          Pick a time <span aria-hidden="true">↑</span>
        </a>
      </section>
    </div>
  );
}
