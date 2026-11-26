import type { Fact } from "@/components/fact-row/fact-row";

/**
 * The Ascent's copy, shared by the homepage section and The Ascent page
 * (/the-ascent), word for word on both.
 *
 * Head, stage name, line, body and items: the homepage's, from the approved
 * mockup (module 1.1), reviewed with the copywriting skill ("your mentors":
 * students have several). The copy team's 5.3 proposals wait for the final
 * copy pass. Facts confirmed by Nithish on 17 November: weekly group office
 * hours, a 1:1 whenever needed, mentors in the student's field.
 */

export type StageId = "prepare" | "land" | "thrive";

export type Stage = {
  id: StageId;
  name: string;
  /** One bold line. */
  line: string;
  body: string;
  items: readonly string[];
};

export const ascentHead = {
  eyebrow: "The CareerHaki program",
  title: "The Ascent",
  lead: "Three stages that take you from where you are now to your first 90 days in a better role.",
} as const;

export const ascentStages: readonly [Stage, Stage, Stage] = [
  {
    id: "prepare",
    name: "Prepare",
    line: "Know the role, then close the gap.",
    body: "Your mentors map the skills and certifications your target role asks for, then rebuild your resume and LinkedIn around what you’ve shipped.",
    items: ["Career roadmap", "Skill and certification plan", "Resume and LinkedIn", "Real-world projects"],
  },
  {
    id: "land",
    name: "Land",
    line: "Apply with a plan.",
    body: "You target the right roles, run technical and behavioural mock interviews with working engineers, and get coaching through the offer and the negotiation.",
    items: ["Application strategy", "Mock interviews", "Offer and negotiation"],
  },
  {
    id: "thrive",
    name: "Thrive",
    line: "Start strong in the new job.",
    body: "Most coaching stops at the offer. We stay with you through your first 90 days, while you ramp up, learn the team and earn trust.",
    items: ["First 90 days plan", "Workplace relationships", "Ongoing mentorship"],
  },
];

export const ascentFacts: readonly Fact[] = [
  {
    label: "Weekly office hours",
    line: "A group session with Nithish every week, and a 1:1 with him whenever you need one.",
  },
  {
    label: "Mentors in your field",
    line: "Engineers who work in your area coach you on skills, tools, communication and how you show up online, depending on what your plan needs.",
  },
  {
    label: "A private chat space",
    line: "Ask questions between sessions and get answers from your mentors.",
  },
  {
    label: "Open-ended",
    line: "You stay in the program until you’re hired, then through your first 90 days in the job.",
  },
];

/**
 * The Ascent page only (layout D, picked by Nithish on 25 November 2026).
 * New copy by the copy team (recommended version, panel average 8.7),
 * approved for the build. Claims marked [ASSUMED] are listed in the
 * checkpoint review (section 6) to confirm or remove before launch:
 * 1 the first 1:1 sets the target role and roadmap; 2 the skill plan in
 * order; 3 line-by-line resume edits; 4 a mentor-reviewed project; 5 a mentor
 * helps tailor each application; 6 feedback after every mock round; 7 Thrive
 * starts at the signed offer; 8 a first-90-days plan before day one;
 * 9 office hours, mentors and chat space through the first 90 days.
 */
export type StageStory = {
  /** The story's id in stories.ts. */
  id: string;
  /** Eyebrow-style label on the panel. */
  label: string;
  /** Which of the student's approved texts the panel shows, word for word. */
  words: "card" | "changed" | "first90Days";
  /** An optional muted line under the caption. */
  context?: string;
};

export type StagePageCopy = {
  /** "Where you start". */
  start: string;
  /** A confirmed CareerHaki line under the start note. */
  note?: string;
  /** One sentence per item, in the order of the stage's items. */
  details: readonly string[];
  story: StageStory;
};

export const ascentPage: {
  title: string;
  description: string;
  stages: Record<StageId, StagePageCopy>;
} = {
  title: "The Ascent: Prepare, Land and Thrive",
  description:
    "What you do in each stage of The Ascent, from your resume and mock interviews to your first 90 days in the new job, with mentors who work in your field.",
  stages: {
    prepare: {
      start: "Start here if you’re not ready to apply yet.",
      details: [
        // [ASSUMED] 1
        "Your first 1:1 with Nithish sets your target role and the steps between you and it.",
        // [ASSUMED] 2
        "Mentors in your field name the few skills and certifications your target role asks for, in order.",
        // [ASSUMED] 3
        "Line-by-line edits to every role on your resume, plus sessions on LinkedIn, job platforms and posts.",
        // [ASSUMED] 4
        "You build a project with your target role’s tools, and a mentor reviews it as you go.",
      ],
      story: {
        id: "haritha",
        label: "What changed for Haritha is what Prepare covers",
        words: "card",
      },
    },
    land: {
      start: "Start here if you already have interviews lined up.",
      details: [
        // [ASSUMED] 5
        "You and your mentor pick the roles that fit, and tailor each application before it goes out.",
        // [ASSUMED] 6
        "Technical and behavioural rounds with an engineer in your field, and detailed feedback after each one.",
        "When an offer comes, we go through it with you and plan what to ask for.",
      ],
      story: {
        id: "karandeep",
        label: "What changed for Karandeep is what Land covers",
        words: "changed",
        // Keeps his 4 weeks from reading as typical (as on the homepage).
        context:
          "Karandeep’s offer came faster than most. An offer typically takes 1 to 4 months, and 82 in 100 students land a role.",
      },
    },
    thrive: {
      // [ASSUMED] 7
      start: "You move into Thrive once you’ve signed your offer.",
      // Confirmed by Nithish (22 November).
      note: "All eight students on our Results page had support through their first 90 days in the new job. Nithish still talks to them regularly.",
      details: [
        // [ASSUMED] 8
        "Before day one, you plan what to learn, who to meet and what to deliver by day 90.",
        "You learn how to work with stakeholders and your manager, and what the business needs from you.",
        // [ASSUMED] 9
        "Office hours, your mentors and the chat space stay with you through your first 90 days.",
      ],
      story: {
        id: "jothi",
        label: "Jothi on his first 90 days at KOHO",
        words: "first90Days",
      },
    },
  },
};
