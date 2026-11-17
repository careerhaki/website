# CareerHaki website

The marketing site, tools and student portal for CareerHaki, an end-to-end career coaching and mentorship company for people in tech. Owner: Nithish Reddy.

## Read first

The full context lives in the Claude project "CareerHaki - Site", in two documents. Read both at the start of a work session when the project is attached:

- `careerhaki-operating-brief.md`: the business, confirmed proof, truth rules, voice, brand.
- `careerhaki-build-plan.md`: product definition, stack, stages, modules and what "done" means.

If they are not available, the essentials are below. Do not guess the rest; ask Nithish.

## Essentials

- **Customer:** recent graduates and candidates with two to three years of experience who want a better role in tech. Canada, the US and India.
- **Primary action on every page:** book a discovery call. Secondary: employer enquiry.
- **Program:** working name "The Ascent", in three stages: Prepare, Land, Thrive.
- **Voice:** leave the reader more confident in themselves by being specific. Write to "you". Short sentences, plain words. Avoid revolutionize, transform, unlock, empower and journey.
- **Brand:** accent orange `#E17032` (proposed) or brand orange `#F26716`, charcoal `#262626`, dark grey `#494E54`, iron `#DBDEE3`. Final palette and typeface come from module 1.1.

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

Node 22 and npm. Run from the repository root.

| Task | Command | Notes |
|---|---|---|
| Install | `npm install` | Run once after cloning and whenever `package.json` changes. |
| Dev | `npm run dev` | Local site at http://localhost:3000, reloads on save. |
| Build | `npm run build` | Production build; the same command Vercel runs. Must pass before a pull request is ready. |
| Lint | `npm run lint` | ESLint with the Next.js rules. Next.js 16 no longer lints during the build, so run it yourself. |
| Test | `npm test` | Checks the colour tokens against the design system and their WCAG AA contrast. No install needed. |
| Type check | `npm run typecheck` | TypeScript across the project. |

Where things live: pages in `src/app/`, design tokens in `src/app/globals.css`, site name, address and page metadata in `src/lib/site.ts`, images in `src/assets/`, tests in `tests/`.

Search engines are told not to index any deployment until `SITE_LIVE=1` is set on the Vercel production environment at launch (module 1.6).

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
