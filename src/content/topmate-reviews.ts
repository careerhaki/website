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
