import { CtaBand } from "@/components/cta-band/cta-band";
import { LogoWall } from "@/components/results/logo-wall";
import { type PickerRow, StoryPicker } from "@/components/results/results-island";
import { StoryRow } from "@/components/results/story-row";
import styles from "@/components/results/results.module.css";
import { ctaBand } from "@/content/cta-band";
import { resultsStories } from "@/content/results";
import { PHOTO_RULE } from "@/content/stories";
import { pageMetadata } from "@/lib/site";

// Copy by the copy team; the page approved by Nithish as D+ (frame F) on
// 24 November 2026 (careerhaki-results-page-decisions.md). No "1 to 4
// months" anywhere on this page (Prathyusha is on it), no rating, no price
// and no job promise. "82 in 100" is always a count of students.
export const metadata = pageMetadata({
  path: "/results",
  title: "Success stories in data, cloud and software",
  description:
    "Eight CareerHaki students, in their own words: where they started, what changed and where they work now. Data, cloud and software, from TS Imagine to KPMG.",
});

const figures = [
  { id: "hired", figure: "120+", label: "professionals hired through CareerHaki" },
  { id: "salary", figure: "$25K+", label: "average salary increase" },
  { id: "land", figure: "82 in 100", label: "students land a role" },
] as const;

/** Within the list, every row has a photo or none does (PHOTO_RULE). */
const showPhoto = PHOTO_RULE === "each" || resultsStories.every((story) => Boolean(story.photo));

const rows: PickerRow[] = resultsStories.map((story) => ({
  id: story.id,
  matches: story.matches,
  field: story.field,
  row: <StoryRow story={story} showPhoto={showPhoto} />,
}));

/**
 * The Results page: head, the "Where are you starting from?" picker and all
 * eight stories (one list that reorders), closing figures and the logo wall,
 * then the call-to-action band as on the homepage. Server components; the
 * picker, the story links and the wall's button are one small client island.
 */
export default function ResultsPage() {
  return (
    <main id="main">
      <div className={styles.page}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Success stories</p>
          <h1 className={styles.title}>Find someone who started where you are.</h1>
          <p className={styles.lead}>
            One applied for more than 9 months with no real progress. Another started in mechanical
            engineering. All eight tell you in their own words what changed and where they work now.
          </p>
        </header>

        <StoryPicker rows={rows} showAllLabel="Where they started, where they work now" />

        <div className={styles.closing}>
          <ul className={styles.figures}>
            {figures.map((f) => (
              <li key={f.id} className={styles.figure}>
                <span className={styles.figureValue}>{f.figure}</span>
                <span className={styles.figureLabel}>
                  {f.id === "hired" ? (
                    <>
                      professionals hired through <span translate="no">CareerHaki</span>
                    </>
                  ) : (
                    f.label
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Each timeline on this page is one person’s own, not a forecast. Karandeep’s offer came faster
            than most.
          </p>
          <p className={styles.note}>
            All eight had support through their first 90 days in the new job, and Nithish still talks to
            them regularly.
          </p>
          <LogoWall id="alumni-wall" label="Where our alumni work" listLabel="Companies where our alumni work" />
        </div>
      </div>
      <CtaBand {...ctaBand} />
    </main>
  );
}
