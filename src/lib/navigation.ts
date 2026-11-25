/**
 * Main navigation, in the order of the design system. The pages are built in
 * module 1.4; until then these links lead to "not found".
 */
export const navLinks = [
  { href: "/the-ascent", label: "The Ascent" },
  { href: "/results", label: "Results" },
  { href: "/mentors", label: "Mentors" },
  { href: "/growthhaki", label: "GrowthHaki", translate: "no" },
  { href: "/for-employers", label: "For employers" },
  { href: "/about", label: "About" },
] as const;

/** Where every "Book a call" button goes. The Cal.com embed lands in 1.5. */
export const bookingPath = "/book-a-call";

/** The employer enquiry. The form on /for-employers gets this id in 1.5. */
export const employerEnquiryPath = "/for-employers#enquire";

/** Legal pages, built in module 1.4. */
export const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

/**
 * Pages that exist today. A link to a page that isn't built yet is left out
 * (never a dead link): the Results page's stage links appear by themselves
 * once "/the-ascent" is added here. A unit test checks this list against
 * src/app, both ways for "/the-ascent".
 */
export const builtPages: ReadonlySet<string> = new Set(["/", "/book-a-call", "/results"]);
