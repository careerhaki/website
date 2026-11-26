import type { StaticImageData } from "next/image";

// The About page's copy. Written by the copy team (round 3, direction B "The
// hiring standard", panel average 9.2; careerhaki-about-page-decisions.md),
// pending Nithish's pick of the heading direction. Facts from Nithish: his
// title at Insight (26 Nov); why CareerHaki exists, in his words (26 Nov);
// 1,400+ students taught at Centennial, attributed to him personally. Only
// confirmed facts for Bhogeshwar until Nithish has asked him.
//
// Assumed, to confirm before launch (checkpoint review, section 6): students
// work from real job posts; mock rounds are run the way hiring teams run
// them; students use the tools teams use now; a student can start in Land
// with the rounds they have booked (6.10, 6.11).

export type Founder = {
  /** The anchor the homepage's person cards link to (/about#nithish). */
  id: "nithish" | "bhogeshwar";
  eyebrow: string;
  name: string;
  role: string;
  /** Their job outside CareerHaki, in sentence case. Shown when set. */
  job?: string;
  bio: string;
  /** A link to book, after the bio (Nithish takes every discovery call). */
  bookLink?: string;
  /** Full https:// address. Empty: no LinkedIn link is shown. */
  linkedinUrl?: string;
  /** A real 4:5 photo. Both founders have one, or neither is shown. */
  photo?: StaticImageData;
};

export const founders: readonly Founder[] = [
  {
    id: "nithish",
    eyebrow: "Cloud",
    name: "Nithish Reddy",
    role: "Co-founder, technology and growth",
    job: "Senior enterprise cloud architect at Insight",
    bio: "As a professor at Centennial College, Nithish taught 1,400+ students. At CareerHaki he takes every discovery call, runs the weekly group office hours and is there for a 1:1 whenever you need one. He stays with students through their first 90 days in the new job, and still talks to them regularly.",
    bookLink: "Book a discovery call with Nithish",
    linkedinUrl: "",
  },
  {
    id: "bhogeshwar",
    eyebrow: "Operations",
    name: "Bhogeshwar Reddy",
    role: "Co-founder, business and operations",
    bio: "Bhogeshwar co-founded CareerHaki with Nithish and leads its business and operations.",
    linkedinUrl: "",
  },
];

export const aboutPage = {
  title: "About Nithish Reddy and Bhogeshwar Reddy",
  description:
    "Meet Nithish Reddy and Bhogeshwar Reddy, CareerHaki’s co-founders in Ottawa, and why they coach you to the standard of the teams that hire.",
  head: {
    eyebrow: "About CareerHaki",
    title: "Held to the standard of the teams that hire you.",
    lead: "CareerHaki is led from Ottawa by its co-founders, Nithish Reddy and Bhogeshwar Reddy, with mentors who work in your field. We coach candidates in Canada, the US and India.",
  },
  /** For screen readers: the founders follow the head with no visible heading. */
  foundersTitle: "The founders",
  why: {
    eyebrow: "Why we exist",
    title: "The market is the syllabus.",
    body: [
      "Colleges and universities teach the subject. Hiring teams test whether you can do the job, and the two have drifted far apart. Nithish has seen both sides, as a professor at Centennial College and as a working cloud architect.",
      "CareerHaki brings the real market to you: mentors who work as engineers in your field today, the job posts you’d actually apply to, interview rounds run the way teams run them, and the tools those teams use now. A data engineer reviews a data resume, and a security engineer runs your security mock interview. You have access to several mentors.",
    ],
    /** Shown once /mentors is built. */
    mentorsLink: "Meet the mentors",
  },
  ascent: {
    eyebrow: "The Ascent",
    title: "Until you’re hired, and 90 days beyond.",
    lead: "Start at the stage that matches where you are.",
    rows: [
      {
        term: "Not ready to apply yet?",
        detail:
          "Start in Prepare. Your mentors map the skills and certifications your target role asks for, then rebuild your resume and LinkedIn around what you’ve shipped.",
      },
      {
        term: "Interviews already booked?",
        detail:
          "Start in Land, with technical and behavioural mock interviews for those rounds, then coaching through the offer and the negotiation.",
      },
      {
        term: "Signed your offer?",
        detail:
          "Thrive takes you through your first 90 days in the new job, while you learn the team and earn trust. Most coaching stops at the offer.",
      },
    ],
    closing:
      "82 in 100 students land a role, typically within 1 to 4 months. We give you the numbers as they are, and we never promise a job.",
    resultsLink: "See the results",
  },
} as const;
