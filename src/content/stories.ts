import type { StaticImageData } from "next/image";

import adastra from "@/assets/logos/adastra.png";
import cihi from "@/assets/logos/cihi.svg";
import euna from "@/assets/logos/euna-solutions.svg";
import kpmg from "@/assets/logos/kpmg.svg";
import mckesson from "@/assets/logos/mckesson.svg";
import safeguard from "@/assets/logos/safeguard-global.png";
import tsImagine from "@/assets/logos/ts-imagine.svg";

/**
 * CareerHaki success stories: the eight approved stories in
 * `careerhaki-testimonials.md` (project doc, section 7, 22 November 2026).
 *
 * Every student's words here are their approved text, word for word. Never
 * write or change them here: change the project doc first, with the
 * student's yes, then copy the new text in. Headlines are the copy team's,
 * built only from the student's facts. Titles are the ones Nithish wrote
 * next to each student (sentence case, as everywhere on the site).
 *
 * Photos and LinkedIn links come later (testimonials doc, 9.2). Until a
 * field is set nothing shows for it: no initials, no grey circle, no link.
 */

export type StoryLogo = {
  src: StaticImageData;
  /** Optical size by eye, the same factor as the logo strip (default 1). */
  boost?: number;
};

/** One bar of motion M2. `months` sets its length on the shared scale. */
export type TimeBar = {
  /** Shown beside the bar, for example "On his own". */
  label: string;
  /** Shown under the bar, always as plain text: "9+ months applying". */
  value: string;
  months: number;
  /** "before": muted (time on their own). "with": accent (with CareerHaki). */
  tone: "before" | "with";
};

export type Placement =
  | { page: "home"; order: number; featured?: boolean }
  | { page: "ascent"; stage: "prepare" | "land" | "thrive"; backup?: boolean }
  | { page: "results" };

export type Story = {
  id: string;
  name: string;
  role: string;
  company: string;
  /** The employer's logo, shown in one colour. Not every employer has a file yet. */
  logo?: StoryLogo;
  /** A full https:// address. The name links to it once set. */
  linkedinUrl?: string;
  /** A head-and-shoulders photo, shown round at about 56px once set. */
  photo?: StaticImageData;
  headline: string;
  pullQuote: string;
  /** The card text: the student's own words, shortened and approved. */
  card: string;
  before: string;
  changed: string;
  after: string;
  /** In the student's voice; approved by each student (Nithish, 22 Nov). */
  first90Days: string;
  /** Months from joining to the offer, where the student gave it. */
  monthsToOffer?: number;
  /**
   * The M2 time bars, on one shared scale (`BAR_SCALE_MONTHS`). Only where
   * the copy for them is approved; the others get theirs when placed.
   */
  bars?: readonly TimeBar[];
  placements: readonly Placement[];
};

/** Every story's bars share one scale, set by Karandeep's 9 months. */
export const BAR_SCALE_MONTHS = 9;

/**
 * The photo rule, to be confirmed by Nithish (checkpoint review): within a
 * row, every card has a photo or none does ("all-or-none"), so a half-filled
 * row never looks unfinished. "each" shows any photo that is set.
 */
export const PHOTO_RULE: "all-or-none" | "each" = "all-or-none";

export const stories: readonly Story[] = [
  {
    id: "karandeep",
    name: "Karandeep Singh",
    role: "Data engineer",
    company: "TS Imagine",
    logo: { src: tsImagine },
    headline: "9 months of applying, then TS Imagine in under 4 weeks",
    pullQuote:
      "I applied for more than 9 months and got nowhere. Less than 4 weeks after joining CareerHaki, I had an offer.",
    card: "I applied for more than 9 months and started doubting myself. Nithish showed me where I was going wrong. We repositioned my profile and aimed it at fintech. I had an offer in under 4 weeks.",
    before:
      "I had a job, but I wanted a better one. I applied for more than 9 months with no real progress. I had the qualifications. I couldn’t position my profile, work out which roles fit me or get through interviews, and I started doubting myself.",
    changed:
      "Nithish was practical and honest about where I was going wrong. We repositioned my profile and worked on my interview answers, all aimed at the fintech roles I wanted.",
    after: "Less than 4 weeks after joining, I had an offer from TS Imagine as a data engineer.",
    first90Days:
      "Nithish helped me understand what the business does and what problem my work solves for it. Until then I’d thought mostly about code and pipelines.",
    monthsToOffer: 0.9,
    bars: [
      { label: "On his own", value: "9+ months applying", months: 9, tone: "before" },
      { label: "With CareerHaki", value: "Offer in under 4 weeks", months: 0.9, tone: "with" },
    ],
    placements: [
      { page: "home", order: 1, featured: true },
      { page: "ascent", stage: "land" },
      { page: "results" },
    ],
  },
  {
    id: "rahul",
    name: "Rahul Patel",
    role: "Senior AWS engineer",
    company: "Adastra",
    logo: { src: adastra },
    headline: "From internships to cloud engineering in almost 3 months",
    pullQuote:
      "I’d done internships but had no clear way into cloud. Almost 3 months after joining, I landed a cloud engineering role.",
    card: "I’d graduated with internships behind me, including one as a data intern, but no clear way into cloud. My mentor polished my profile and helped me present my AWS skills. Almost 3 months later, I had a cloud engineering role.",
    before:
      "I’d graduated and done internships, including one as a data intern, plus a couple of other roles in India. I wanted to grow in cloud, but I had no clear roadmap and no one guiding me.",
    changed:
      "The 1:1 support made a big difference. My mentor helped me polish my profile and the way I interview, and I got confident presenting my AWS skills.",
    after:
      "Almost 3 months after joining, I landed a cloud engineering role. I started on AWS migrations, Windows workloads and client-focused cloud solutions. Today I’m a senior AWS engineer at Adastra.",
    first90Days:
      "Nithish walked me through how migrations really happen and what they affect, and he shared how he sees them.",
    monthsToOffer: 2.8,
    bars: [{ label: "Joining to offer", value: "Almost 3 months", months: 2.8, tone: "with" }],
    placements: [
      { page: "home", order: 2 },
      { page: "ascent", stage: "prepare", backup: true },
      { page: "results" },
    ],
  },
  {
    id: "dheeraj",
    name: "Dheeraj Puttapaka",
    role: "Senior software developer",
    company: "CIHI",
    logo: { src: cihi, boost: 1.4 },
    headline: "Amazon engineer to senior developer at CIHI in 2 months",
    pullQuote:
      "I was a software engineer at Amazon and still felt stuck. Within 2 months of joining, I had my offer from CIHI.",
    card: "I was a software engineer at Amazon in India, but my search had no direction. A friend recommended CareerHaki. Nithish showed me where I stood and how to present my skills. Within 2 months, I had an offer from CIHI.",
    before:
      "I was a software engineer at Amazon in India. My job search had no clear direction, and I wasn’t confident in how I came across in interviews or on my resume. I felt stuck.",
    changed:
      "A friend recommended CareerHaki, and Nithish became my mentor. He showed me where I stood and how to build confidence for interviews. The roadmap gave me direction, and I got much more intentional about applying.",
    after: "Within 2 months of joining, I had an offer from CIHI. Today I’m a senior software developer there.",
    first90Days: "Nithish shared how to make an impact in a new company and how to solve the real problems it has.",
    monthsToOffer: 2,
    bars: [{ label: "Joining to offer", value: "2 months", months: 2, tone: "with" }],
    placements: [{ page: "home", order: 3 }, { page: "results" }],
  },
  {
    id: "prathyusha",
    name: "Prathyusha Venkanna",
    role: "Data engineer",
    company: "Euna Solutions",
    logo: { src: euna },
    headline: "From mechanical engineering to data engineer at Euna Solutions",
    pullQuote:
      "I came from mechanical engineering and doubted I could make it in data. My confidence is what grew most.",
    card: "I came from mechanical engineering with no roadmap into data. My mentor kept me going through interview prep, and his feedback was honest. I landed a job within 5 months of finishing the program.",
    before:
      "I have a mechanical engineering background. I was interested in data, but I had no roadmap for switching into IT, and honestly I doubted I could make it.",
    changed:
      "My mentor was easy to reach and kept me motivated. He took me through interview prep, and his feedback was honest, so I got better a step at a time.",
    after: "I landed a job within 5 months of finishing the program. Today I’m a data engineer at Euna Solutions.",
    first90Days:
      "Nithish and I spoke almost every week. He helped me see the end-to-end flow of my work and ask the right questions until I understood the workflow properly.",
    // "5 months of finishing" is her own measure, not joining to offer, so
    // no bar and never beside "1 to 4 months to an offer" (doc, 7.2).
    placements: [{ page: "ascent", stage: "thrive", backup: true }, { page: "results" }],
  },
  {
    id: "haritha",
    name: "Haritha Venkatadri",
    role: "Data analyst",
    company: "McKesson",
    logo: { src: mckesson },
    headline: "From applications that weren’t landing to McKesson in 3 months",
    pullQuote:
      "My mentor gave me detailed feedback on my mock interviews. Within 3 months of joining, I was a data analyst at McKesson.",
    card: "My resume and LinkedIn didn’t match what the companies I wanted were looking for. We reworked both, and I practised in mock interviews with detailed feedback. Within 3 months of joining, I had a role at McKesson.",
    before:
      "I didn’t know how to tailor my applications or position my experience. My resume and LinkedIn didn’t match what the companies I wanted were looking for.",
    changed:
      "We reworked my resume and LinkedIn. My mentor gave me detailed feedback on my mock interviews and pushed me toward roles that matched my skills. The structure kept me accountable, and I went into interviews feeling confident.",
    after: "Within 3 months of joining, I landed a data analyst role at McKesson.",
    first90Days:
      "Nithish helped me understand the wider business and how to handle stakeholders and what they ask for. He also showed me how to make an impact on my team.",
    monthsToOffer: 3,
    placements: [{ page: "ascent", stage: "prepare" }, { page: "results" }],
  },
  {
    id: "priya",
    name: "Priya Raavi",
    role: "Senior data analyst",
    company: "Safeguard Global",
    logo: { src: safeguard, boost: 1.2 },
    headline: "Junior engineer to senior data analyst, with an offer 10% higher",
    pullQuote: "After talking my offer through with CareerHaki, I negotiated it 10% higher.",
    card: "I was a junior engineer with too many paths and technologies to choose from, and no roadmap. The 1:1 meetings closed my knowledge gaps and got me ready to turn interviews into offers. After talking my offer through with CareerHaki, I negotiated it 10% higher.",
    before:
      "I was a junior engineer, ready for the next level. There were too many paths and technologies to choose from, and I had no clear roadmap. I wanted to spend my energy on the skills that would get me a senior role.",
    changed:
      "The 1:1 meetings helped most. They closed my knowledge gaps and got me ready to turn interviews into offers, and the team kept me motivated.",
    after:
      "I got an offer from Safeguard Global. After talking it through with CareerHaki, I negotiated it 10% higher. Today I’m a senior data analyst there.",
    first90Days:
      "Nithish helped me understand how BI and analytics work inside a company, and how managing stakeholders shapes the reports I build.",
    placements: [{ page: "ascent", stage: "land", backup: true }, { page: "results" }],
  },
  {
    id: "kushagra",
    name: "Kushagra Chakravarthy",
    role: "Senior BI lead",
    company: "KPMG",
    logo: { src: kpmg },
    headline: "From engineer to senior BI lead at KPMG",
    pullQuote:
      "We worked on everything from my resume to technical and leadership-level interviews. The focus was long-term growth over quick wins.",
    card: "I came in as a data engineering professional. We worked on my resume and on technical and leadership-level interviews. The feedback helped me interview with confidence. Today I’m a senior BI lead at KPMG.",
    before: "I came to CareerHaki as a data engineering professional.",
    changed:
      "The guidance was structured, practical and close to what the industry expects. We worked on everything from refining my resume to preparing for technical and leadership-level interviews. The focus was long-term growth over quick wins.",
    after:
      "The feedback helped me walk into interviews with confidence, and I secured a data engineering role. Today I’m a senior BI lead at KPMG.",
    first90Days:
      "Nithish helped me work with stakeholders, think about improvements for the business as a whole and understand the architecture guidance I was given.",
    placements: [{ page: "results" }],
  },
  {
    id: "jothi",
    name: "Jothi Basu",
    role: "Senior data analyst",
    company: "Wealthsimple",
    // KOHO and Wealthsimple have no logo files yet (testimonials doc, 9.7).
    headline: "From junior analyst at TCS to KOHO in 2 months",
    pullQuote:
      "I applied for 6 months and got automated rejections or silence. After 2 months with CareerHaki, I signed an offer from KOHO.",
    card: "I was a junior data analyst at TCS, in a support-heavy role. Nithish showed me how to talk about my work in terms of business impact. After 2 months, I signed with KOHO. Today I’m a senior data analyst at Wealthsimple.",
    before:
      "I was a junior data analyst at TCS, in a support-heavy role with little room for business-critical work. I spent 6 months applying on LinkedIn, Indeed and company portals, and sent hundreds of applications. I got automated rejections, or silence after the recruiter screen.",
    changed:
      "I doubted any program could get me out of the junior bracket. Nithish looked at my TCS experience and showed me a realistic way to aim it at fintech. Through mock interviews and direct feedback, he taught me to talk about my work in terms of business impact, revenue and decisions.",
    after:
      "After 2 months with CareerHaki, I signed an offer to join KOHO as a data analyst. Today I’m a senior data analyst at Wealthsimple.",
    first90Days:
      "At KOHO I focused on the business problems the company was solving, beyond the SQL and dashboards. Nithish had trained me to ask how my analysis would help stakeholders decide faster, and that helped me build trust with senior leadership right away.",
    monthsToOffer: 2,
    placements: [{ page: "ascent", stage: "thrive" }, { page: "results" }],
  },
];

/** The homepage's stories, in order; the featured one first. */
export const homeStories = stories
  .flatMap((story) =>
    story.placements
      .filter((p): p is Extract<Placement, { page: "home" }> => p.page === "home")
      .map((p) => ({ story, order: p.order, featured: Boolean(p.featured) })),
  )
  .sort((a, b) => a.order - b.order);
