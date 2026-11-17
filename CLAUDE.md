# CareerHaki website

The marketing site, tools and student portal for CareerHaki, an end-to-end career coaching and mentorship company for people in tech. Owner: Nithish Reddy.

## Read first

The full context lives in the Claude project "CareerHaki - Site", in four documents. Read them in this order at the start of a work session when the project is attached:

- `careerhaki-operating-brief.md`: the business, confirmed proof, truth rules, voice, brand.
- `careerhaki-build-plan.md`: product definition, stack, stages, modules and what "done" means.
- `careerhaki-decisions.md`: the decisions log, newest first.
- `careerhaki-design-system.md`: final colours, type, spacing, components, motion rules.

Where they disagree, the decisions log and the design system win, because they are newer.

If they are not available, the essentials are below. Do not guess the rest; ask Nithish.

## Essentials

- **Customer:** recent graduates and candidates with two to three years of experience who want a better role in tech. Canada, the US and India.
- **Primary action on every page:** book a discovery call. Secondary: employer enquiry.
- **Program:** The Ascent, in three stages: Prepare, Land, Thrive. The name is final (chosen by Nithish, 16 November 2026).
- **Voice:** leave the reader more confident in themselves by being specific. Write to "you". Short sentences, plain words. Avoid revolutionize, transform, unlock, empower and journey.
- **Brand:** the palette and typefaces are final (Direction A, module 1.1) and are defined in `careerhaki-design-system.md`; in code they live in `src/app/globals.css`. Warm off-white background `#FAF6F0`, charcoal text `#262626`, orange `#E17032` as the only accent. Small orange text uses `#A4470F`, and orange buttons carry charcoal text, never white. Headlines are Newsreader; body and interface are Inter. The logo stays in Gotham and is only ever used as the supplied image file. Do not use the older brand-guide values (`#F26716`, `#494E54`, `#DBDEE3`) on the site.

## Truth rules

These are not negotiable.

- Publish only proof listed as confirmed in the operating brief.
- Nothing about price, payment terms, fees or guarantees appears anywhere on the site.
- Never invent statistics, testimonials, logos, scarcity or outcomes. If proof is missing, design the section to work without it and tell Nithish.
- Do not promise a job.
- No placeholder text or grey image boxes in anything merged to `main`.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS, deployed on Vercel. Content is MDX in this repository. Booking is Cal.com; the CRM is Airtable; email is Resend. Supabase is added at stage 4. See the build plan for reasons and limits.

## Commands

To be filled in at module 1.2, when the project is created: install, dev, build, lint, test.

## How to work

- Take one module from the build plan at a time. State assumptions at the top of the work.
- Never commit to `main`. Work on a branch, push, and open a pull request; every change gets a Vercel preview link for Nithish to approve.
- Keep changes small: one page pattern or component per pull request.
- Verify before reporting done: build passes, the page has been looked at on phone and desktop widths, Lighthouse mobile is 95+, keyboard and contrast checks pass.
- Report to Nithish in plain language, answer yes or no first, and keep it short.
- Record decisions in the project documents, not only in chat.

## Skills in this repository

Third-party skills live in `.claude/skills/` and are listed with their sources in `.claude/skills/THIRD_PARTY.md`. Use them when relevant:

- `vercel-react-best-practices`: when writing or reviewing React and Next.js code.
- `web-design-guidelines`: when reviewing a finished page or component.
- `copywriting`: when writing page copy. Our truth rules and voice win over its examples; its button-text examples are for software products and need adapting.
- `cro`: when reviewing a page for conversion.

The marketing skills read `.claude/product-marketing.md` for context.

Add a new third-party skill only after reading it in full, and record it in `THIRD_PARTY.md`.
