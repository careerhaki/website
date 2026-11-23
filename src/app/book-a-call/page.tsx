import { CalEmbed } from "@/components/cal-embed/cal-embed";
import { calPageUrl } from "@/lib/booking";
import { TopmateSection } from "@/components/topmate/topmate-section";
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

/**
 * Layout B+C: from 860px the words sit on the left and hold still while the
 * calendar fills the right. On phones the calendar comes straight after the
 * lead and the job-post line, and the three steps follow it.
 *
 * Topmate proof (Nithish, 22 November; option E1): on desktop in the left
 * column under the steps, beside the calendar (which scrolls with the page,
 * so all of it can be reached); on phones after the calendar, so booking
 * stays first. "Pick a time" at its end leads back to the calendar. In the
 * page's code it comes after the calendar, so the keyboard reaches the
 * calendar first on every screen.
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

      <div id="calendar" className={styles.calendar}>
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

      <div className={styles.reviews}>
        <TopmateSection calendarId="calendar" />
      </div>
    </main>
  );
}
