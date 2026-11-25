// The call-to-action band's copy, shared by every page that ends with it.
// "The call to book". Written by the copy team (21 November; checkpoint
// review 5.10), approved by Nithish. Two claims are assumed and listed in
// the checkpoint review to confirm before launch: a founder takes every
// discovery call (6.2) and names the first thing to fix (6.4), and a
// candidate can bring a job post to it (6.5). Nothing on price or length.
export const ctaBand = {
  id: "book",
  eyebrow: "Your next step",
  title: {
    before: "See ",
    mark: "how close",
    after: " you are",
    line2: "to your next role.",
  },
  lead: (
    <>
      One of our two founders looks at the role you want next to the experience you have. You
      leave knowing what to fix first, whether or not you join <span translate="no">The Ascent</span>.
    </>
  ),
  note: "Bring one job post you’d love to land.",
} as const;

