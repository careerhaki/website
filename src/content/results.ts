import { type Story, stories } from "@/content/stories";

/**
 * The Results page (/results), D+ with the story rows of frame F, approved by
 * Nithish on 24 November 2026 (careerhaki-results-page-decisions.md). Copy by
 * the copy team. The students' words are not here: they stay in
 * src/content/stories.ts, word for word.
 */

/** The picker's six starting points. Values are stable ids for analytics. */
export const startingPoints = [
  { id: "applications", label: "My applications aren’t landing" },
  { id: "switching", label: "I’m switching from another field" },
  { id: "graduate", label: "I’m a recent graduate" },
  { id: "junior", label: "I’m junior and ready to move up" },
  { id: "experienced", label: "I’m experienced and aiming higher" },
  { id: "offer", label: "I want help negotiating an offer" },
] as const;

export type StartingPoint = (typeof startingPoints)[number]["id"];

/** Only fields with stories are offered. Lower case in running text. */
export const fields = [
  { id: "data", label: "Data" },
  { id: "cloud", label: "Cloud" },
  { id: "software", label: "Software" },
] as const;

export type Field = (typeof fields)[number]["id"];

type Stage = "prepare" | "land" | "thrive";

type ResultsEntry = {
  /** The row's eyebrow: the student's one starting point (sentence case). */
  eyebrow: string;
  /** Picker answers that bring this story up. Can be more than the eyebrow. */
  matches: readonly StartingPoint[];
  field: Field;
  /** The Ascent stage the "What changed" maps to, for the stage link. */
  stage: Stage;
  /** A stage line of its own, where the template doesn't fit. */
  stageLine?: string;
};

/**
 * Starting points and matching (decisions doc). Rahul's eyebrow is "After
 * graduation" (a noun above "Senior AWS engineer" read as a contradiction).
 * "Negotiating an offer" is a picker answer only, never an eyebrow. Kushagra
 * under "Junior, ready to move up" (Nithish, 24 November). Prathyusha's
 * stage is Prepare (Nithish, 24 November), with her own line.
 */
const entries: Record<string, ResultsEntry> = {
  karandeep: { eyebrow: "Applications not landing", matches: ["applications"], field: "data", stage: "land" },
  rahul: { eyebrow: "After graduation", matches: ["graduate"], field: "cloud", stage: "prepare" },
  dheeraj: { eyebrow: "Experienced, aiming higher", matches: ["experienced"], field: "software", stage: "land" },
  jothi: { eyebrow: "Applications not landing", matches: ["applications", "junior"], field: "data", stage: "land" },
  haritha: { eyebrow: "Applications not landing", matches: ["applications"], field: "data", stage: "prepare" },
  prathyusha: {
    eyebrow: "Switching fields",
    matches: ["switching"],
    field: "data",
    stage: "prepare",
    stageLine: "Switching fields starts with Prepare in The Ascent",
  },
  priya: { eyebrow: "Junior, ready to move up", matches: ["junior", "offer"], field: "data", stage: "land" },
  kushagra: { eyebrow: "Junior, ready to move up", matches: ["junior"], field: "data", stage: "land" },
};

/** The order of the rows before any choice. */
const ORDER = ["karandeep", "rahul", "dheeraj", "jothi", "haritha", "prathyusha", "priya", "kushagra"];

const STAGE_NAME: Record<Stage, string> = { prepare: "Prepare", land: "Land", thrive: "Thrive" };

export type ResultsStory = Story & ResultsEntry & { first: string; stageHref: string; stageText: string };

const byId = new Map(stories.map((story) => [story.id, story]));

export const resultsStories: readonly ResultsStory[] = ORDER.map((id) => {
  const story = byId.get(id);
  const entry = entries[id];
  if (!story || !entry) throw new Error(`Results page: no story or entry for "${id}"`);
  const first = story.name.split(" ")[0];
  return {
    ...story,
    ...entry,
    first,
    stageHref: `/the-ascent#${entry.stage}`,
    // Template by the copy team (panel 8.5): about the program today, since
    // every student joined before The Ascent had its name.
    stageText:
      entry.stageLine ?? `What changed for ${first} is what ${STAGE_NAME[entry.stage]} covers in The Ascent`,
  };
});

/** The wall's first 12 on phones, in order; desktop uses the same order. */
export const WALL_FIRST = [
  "google",
  "amazon",
  "deloitte",
  "accenture",
  "kpmg",
  "citi",
  "autodesk",
  "mckesson",
  "intact",
  "zs",
  "hydro-ottawa",
  "queens",
] as const;
