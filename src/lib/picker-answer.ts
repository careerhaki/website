/**
 * The Results page picker's answer ("Where are you starting from?", and the
 * field if one was chosen), carried to the discovery call booking.
 *
 * Decided with Nithish, 24 November 2026: the answer travels hidden, as
 * Cal.com booking metadata, and lands in the Airtable lead so Nithish sees it
 * before the call. The visitor sees nothing new. It is kept for the browser
 * tab only (sessionStorage), so it never follows someone to another visit.
 *
 * Kept free of imports so `npm test` can check it with Node.
 */

export const PICKER_STORAGE_KEY = "careerhaki:picker";

export type PickerAnswer = {
  /** Stable ids, as in `startingPoints` and `fields` (src/content/results.ts). */
  start: string | null;
  field: string | null;
  /** What the visitor tapped, in words: "My applications aren’t landing · Data". */
  text: string;
};

/** The words for the CRM: the answer's label, then the field's, joined by " · ". */
export function pickerText(startLabel: string | null, fieldLabel: string | null): string {
  return [startLabel, fieldLabel].filter(Boolean).join(" · ");
}

/**
 * Remember the answer for this tab, or forget it when nothing is chosen.
 * Storage can be missing or full (private modes, some in-app browsers), so
 * every failure is silent: the booking works without it.
 */
export function savePickerAnswer(answer: PickerAnswer | null, storage?: Storage | null): void {
  try {
    const store = storage ?? window.sessionStorage;
    if (!answer || !answer.text) store.removeItem(PICKER_STORAGE_KEY);
    else store.setItem(PICKER_STORAGE_KEY, JSON.stringify(answer));
  } catch {
    // Nothing to do: the answer is a nice-to-have.
  }
}

const clean = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

/** The answer saved in this tab, or null. Anything malformed reads as null. */
export function readPickerAnswer(storage?: Storage | null): PickerAnswer | null {
  try {
    const store = storage ?? window.sessionStorage;
    const raw = store.getItem(PICKER_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { start, field, text } = parsed as Record<string, unknown>;
    const answer = { start: clean(start, 40), field: clean(field, 40), text: clean(text, 200) ?? "" };
    return answer.text ? answer : null;
  } catch {
    return null;
  }
}

/**
 * Cal.com metadata for the booking (`metadata[key]` in the embed's config):
 * the ids for counting, the words for the CRM. Empty when there is no answer.
 */
export function pickerMetadata(answer: PickerAnswer | null): Record<string, string> {
  if (!answer) return {};
  const meta: Record<string, string> = { starting_point: answer.text };
  if (answer.start) meta.picker_start = answer.start;
  if (answer.field) meta.picker_field = answer.field;
  return meta;
}
