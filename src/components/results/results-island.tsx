"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { type Field, fields, type StartingPoint, startingPoints } from "@/content/results";

import styles from "./results.module.css";

export type PickerRow = {
  id: string;
  matches: readonly StartingPoint[];
  field: Field;
  /** The row itself, rendered on the server. */
  row: ReactNode;
};

const fieldName = new Map<Field, string>(fields.map((f) => [f.id, f.label.toLowerCase()]));

const stories = (n: number) => (n === 1 ? "1 story" : `${n} stories`);

function subheading(start: StartingPoint | null, field: Field | null) {
  if (start && field) return `Started where you are, in ${fieldName.get(field)}`;
  if (start) return "Started where you are";
  return `In ${fieldName.get(field!)}`;
}

function feedback(n: number, start: StartingPoint | null, field: Field | null) {
  if (n === 0) return "None of the eight started exactly here. All eight are still below";
  if (start && field) return `${stories(n)} started where you are, in ${fieldName.get(field)}`;
  if (start) return `${stories(n)} started where you are`;
  return `${stories(n)} in ${fieldName.get(field!)}`;
}

/** Opens the story named in the address (/results#jothi) and brings it under the navigation. */
function openFromHash(ids: ReadonlySet<string>) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!ids.has(id)) return;
  const row = document.getElementById(id);
  const details = row?.querySelector("details");
  if (!row || !details) return;
  details.open = true;
  row.scrollIntoView({ block: "start" });
}

/**
 * "Where are you starting from?" and the story rows (D+, approved by Nithish
 * on 24 November 2026).
 *
 * - A tap reorders, never hides: the stories that match every choice made
 *   move up under their own subheading, the rest follow under "Everyone
 *   else". The order is the DOM order (React moves the keyed rows), so the
 *   reading and keyboard order follow what is seen.
 * - The feedback line sits directly under the answers, so it is in view
 *   after a tap on a 360px phone. It is a live region and links to the
 *   first match. No automatic scroll.
 * - A link for each story: /results#jothi opens Jothi's story and scrolls
 *   it under the navigation, on load and on hashchange.
 *
 * Every row is in the served HTML, in the default order.
 */
export function StoryPicker({ rows, showAllLabel }: { rows: readonly PickerRow[]; showAllLabel: string }) {
  const [start, setStart] = useState<StartingPoint | null>(null);
  const [field, setField] = useState<Field | null>(null);

  useEffect(() => {
    const ids = new Set(rows.map((r) => r.id));
    const onHash = () => openFromHash(ids);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [rows]);

  const chosen = start !== null || field !== null;
  const isMatch = (r: PickerRow) => (start === null || r.matches.includes(start)) && (field === null || r.field === field);
  const matched = chosen ? rows.filter(isMatch) : [];
  const groups =
    matched.length > 0
      ? [
          { id: "results-matches", title: subheading(start, field), rows: matched },
          { id: "results-others", title: "Everyone else", rows: rows.filter((r) => !isMatch(r)) },
        ].filter((g) => g.rows.length > 0)
      : [{ id: "results-all", title: showAllLabel, rows }];

  const formRef = useRef<HTMLFormElement>(null);
  // "Clear choices" goes away once used, so focus moves to the first answer
  // rather than being lost to the page.
  const clear = () => {
    setStart(null);
    setField(null);
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  };

  return (
    <>
      <form ref={formRef} className={styles.picker} onSubmit={(e) => e.preventDefault()}>
        <fieldset className={styles.answers}>
          <legend className={styles.question}>Where are you starting from?</legend>
          <div className={styles.chips}>
            {startingPoints.map((p) => (
              <label key={p.id} className={styles.chip}>
                <input
                  type="radio"
                  name="start"
                  value={p.id}
                  checked={start === p.id}
                  onChange={() => setStart(p.id)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.fields}>
          <legend className={styles.fieldLegend}>Your field (optional)</legend>
          <div className={styles.chips}>
            {fields.map((f) => (
              <label key={f.id} className={styles.chip}>
                <input
                  type="radio"
                  name="field"
                  value={f.id}
                  checked={field === f.id}
                  onChange={() => setField(f.id)}
                />
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className={styles.feedback}>
          <p aria-live="polite" className={styles.feedbackLine}>
            {chosen ? (
              <a href={`#${groups[0].id}`} className={styles.go}>
                {feedback(matched.length, start, field)}
                <span aria-hidden="true">&nbsp;↓</span>
              </a>
            ) : null}
          </p>
          {chosen ? (
            <button type="button" className={styles.clear} onClick={clear}>
              Clear choices
            </button>
          ) : null}
        </div>
      </form>

      {/* Subheadings and rows are keyed siblings in one parent, so a
          reorder moves them (an opened story stays open). */}
      <div className={styles.rows}>
        {groups.flatMap((group) => [
          <h2 key={group.id} id={group.id} className={styles.subheading}>
            {group.title}
          </h2>,
          ...group.rows.map((r) => (
            <div key={r.id} id={r.id} className={styles.item}>
              {r.row}
            </div>
          )),
        ])}
      </div>
    </>
  );
}

/**
 * The logo wall's button on phones: "Show all 34 companies". On expand the
 * button goes and focus moves to the list, so a keyboard or screen-reader
 * user lands on the companies they asked for.
 */
export function WallMore({ listId, label }: { listId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    if (!open || !pending.current) return;
    pending.current = false;
    document.getElementById(listId)?.focus();
  }, [open, listId]);

  if (open) return null;
  return (
    <button
      type="button"
      className={styles.more}
      aria-controls={listId}
      aria-expanded="false"
      onClick={() => {
        document.getElementById(listId)?.setAttribute("data-open", "");
        pending.current = true;
        setOpen(true);
      }}
    >
      {label}
    </button>
  );
}
