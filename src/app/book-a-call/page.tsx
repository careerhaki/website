import { CalEmbed } from "@/components/cal-embed/cal-embed";
import { calPageUrl } from "@/lib/booking";
import { topmateProfileUrl, topmateReviews } from "@/content/topmate-reviews";
import { whatsappUrl } from "@/lib/contact";
import { pageMetadata } from "@/lib/site";

import styles from "./book-a-call.module.css";

export const metadata = pageMetadata({
  path: "/book-a-call",
  title: "Book a discovery call",
  description:
    "Book a 30-minute discovery call with Nithish Reddy on Google Meet. Bring the role you want next and leave knowing what to fix first.",
});

// Copy: version 1 by the copy team, approved for now by Nithish on
// 21 November 2026 (checkpoint review 5.12). Assumed claims 6.4, 6.5 and
// 6.12 to 6.14 are confirmed or removed before launch.
const steps = [
  "You tell him the role you want next and what you’ve done so far.",
  "He compares your experience with that role and names the first thing to fix.",
  <>
    He tells you whether <span translate="no">The Ascent</span> is right for where you are now.
  </>,
];

// Topmate reviews (testimonials doc, 22 November 2026): label and bridge
// line from the copy team, used as is. The bridge line links to the
// homepage stories only once they exist, never as a dead link.
const reviewsLabel = "What people said after a 1:1 session with Nithish on Topmate";
const bridge =
  "Prathyusha, Karandeep, Rahul and Dheeraj each had a Topmate session with Nithish before they joined CareerHaki.";

/**
 * Layout B+C: from 860px the words sit on the left and hold still while the
 * calendar fills the right. On phones the calendar comes straight after the
 * lead and the job-post line, and the three steps follow it.
 *
 * Topmate reviews (Nithish, 22 November): on desktop in the left column
 * under the steps, beside the calendar, which holds still while you read
 * them; on phones after the calendar, so booking stays first. In the page's
 * code they come after the calendar, so the keyboard reaches the calendar
 * first on every screen.
 */
export default function BookACallPage() {
  const whatsapp = whatsappUrl();

  return (
    <main id="main" className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.title}>
          Book your discovery call with <span className={styles.mark}>Nithish</span>
        </h1>
        <p className={styles.lead}>
          Nithish Reddy is a senior enterprise cloud architect and one of our co-founders. Pick a
          time below for 30 minutes with him on Google Meet. Times show in your own time zone.
        </p>
        <p className={styles.post}>
          Have a job post you’d love to land? Paste the link in the form, and Nithish will read it
          before you meet.
        </p>
        <section className={styles.steps} aria-labelledby="call-steps">
          <h2 id="call-steps" className={styles.stepsTitle}>
            What happens on the call
          </h2>
          <ol className={styles.stepList}>
            {steps.map((step, index) => (
              <li key={index} className={styles.step}>
                <span className={styles.numeral} aria-hidden="true">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className={styles.calendar}>
        <CalEmbed />
        <ul className={styles.after}>
          <li>You’ll get a confirmation email and a calendar invite with the Google Meet link.</li>
          <li>Need to move it? Use the link in your confirmation email.</li>
          <li>
            Calendar not loading? <a href={calPageUrl}>Open the booking page</a>
          </li>
          {whatsapp ? (
            <li>
              Rather message first? <a href={whatsapp}>Message us on WhatsApp</a>
            </li>
          ) : null}
        </ul>
      </div>

      <section className={styles.reviews} aria-labelledby="topmate-reviews">
        <h2 id="topmate-reviews" className={styles.reviewsTitle}>
          {reviewsLabel}
        </h2>
        <ul className={styles.reviewList}>
          {topmateReviews.map((review) => (
            <li key={review.id}>
              <figure className={styles.review}>
                <blockquote className={styles.reviewText}>
                  <p>
                    “{review.before}
                    <strong className={styles.pull}>{review.quote}</strong>
                    {review.after}”
                  </p>
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
            </li>
          ))}
        </ul>
        <p className={styles.topmateLink}>
          <a
            href={topmateProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read all reviews on Topmate (opens in a new tab)"
          >
            Read all reviews on Topmate
            <span className={styles.external} aria-hidden="true">
              ↗
            </span>
          </a>
        </p>
        <p className={styles.bridge}>{bridge}</p>
      </section>
    </main>
  );
}
