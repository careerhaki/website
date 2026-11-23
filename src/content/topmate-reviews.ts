/**
 * Topmate reviews of Nithish's 1:1 career sessions, for the Book a Call page.
 * Picked in `careerhaki-testimonials.md` (project doc, section 10.2, read from
 * Nithish's Topmate dashboard on 22 November 2026).
 *
 * Word for word, typos included ("Nitish"), under the name as Topmate shows
 * it, so they match what a visitor finds on Topmate. Never edit them. A
 * Topmate reviewer is never shown as someone who was hired.
 *
 * Each review is split around its pull-quote (the copy team's pick, the
 * reviewer's exact words): `before + quote + after` is the whole review.
 */
export type TopmateReview = {
  id: string;
  name: string;
  /** Month and year, as shown: "March 2025". */
  date: string;
  before: string;
  quote: string;
  after: string;
};

export const topmateProfileUrl = "https://topmate.io/nithishreddy";

export const topmateReviews: readonly TopmateReview[] = [
  {
    id: "bebin-samuel",
    name: "Bebin Samuel",
    date: "March 2025",
    before: "Very clear, concise and insightful conversation into what steps and routes I should take. ",
    quote: "He speaks from real industry experience that is clearly evident in the advice he gives.",
    after: " Very valuable advice for my career growth.",
  },
  {
    id: "karandeep-singh",
    name: "Karandeep Singh",
    date: "July 2025",
    before:
      "Nitish was incredibly helpful and supportive during our session. He gave me a much-needed boost of motivation in my current job environment and ",
    quote: "shared clear, actionable guidance on how to navigate challenges and perform at my best",
    after: ". Highly recommend connecting with him if you’re looking for direction and encouragement!",
  },
  {
    // Replaces Nikhitha's review (Nithish, 22 November 2026).
    id: "mounika-mannuru",
    name: "Mounika Mannuru",
    date: "July 2025",
    before:
      "It was a really good session. He shared his thoughts clearly, and I found them very helpful and meaningful. ",
    quote: "I liked how he explained things with real examples.",
    after: " It gave me a better understanding and new ideas to think about.",
  },
  {
    id: "azin-katiraee",
    name: "Azin Katiraee",
    date: "April 2024",
    before: "It was helpful session as ",
    quote: "we went through my resume and Nithish mentioned some helpful tips",
    after: ". Thanks 🙏🏻",
  },
];

/**
 * The four people who had a Topmate 1:1 with Nithish, then joined CareerHaki
 * (confirmed by Nithish, 22 November 2026), in the order picked for the Book
 * a Call page: Prathyusha last, because her Topmate review is one word.
 *
 * `topmate` is their Topmate review, word for word (`quote` is the part
 * shown large; `fullReviewId` points at the whole review when it is longer).
 * `changed` is one or two sentences from their approved story's "What
 * changed", unchanged (a test checks it against src/content/stories.ts).
 * No timeframes in the rows, so none reads as typical.
 */
export type TopmateJourney = {
  storyId: string;
  topmate: { date: string; quote: string; fullReviewId?: string };
  changed: string;
};

export const topmateJourneys: readonly TopmateJourney[] = [
  {
    storyId: "karandeep",
    topmate: {
      date: "July 2025",
      quote: "shared clear, actionable guidance on how to navigate challenges and perform at my best",
      fullReviewId: "karandeep-singh",
    },
    changed:
      "We repositioned my profile and worked on my interview answers, all aimed at the fintech roles I wanted.",
  },
  {
    storyId: "rahul",
    topmate: { date: "January 2025", quote: "Exactly knows what will be helpful and give proper insights" },
    changed:
      "My mentor helped me polish my profile and the way I interview, and I got confident presenting my AWS skills.",
  },
  {
    storyId: "dheeraj",
    topmate: { date: "August 2025", quote: "The session was very insightful." },
    changed: "The roadmap gave me direction, and I got much more intentional about applying.",
  },
  {
    storyId: "prathyusha",
    topmate: { date: "March 2026", quote: "Helpful" },
    changed:
      "My mentor was easy to reach and kept me motivated. He took me through interview prep, and his feedback was honest, so I got better a step at a time.",
  },
];

/**
 * For a pull-quote taken out of a longer review: a cut from inside a
 * sentence is marked with ellipses at both ends. (A review shown whole, like
 * "Helpful", is never marked.)
 */
export const isFragment = (quote: string) => /^[a-z]/.test(quote) || !/[.!?]$/.test(quote);
