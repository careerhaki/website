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
