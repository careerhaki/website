/**
 * The discovery call on Cal.com, set up by Nithish on 21 November 2026:
 * 30 minutes on Google Meet, booked at cal.com/careerhaki/discovery-call.
 * Kept free of imports so `npm test` can check it with Node.
 */

/** The event's path on Cal.com (username/event). */
export const calLink = "careerhaki/discovery-call";

/** The public booking page: the fallback when the embedded calendar can't load. */
export const calPageUrl = `https://cal.com/${calLink}`;

/** The selected day and buttons inside the calendar. Charcoal, not orange:
    Cal.com puts white text on this colour, and white on our orange fails
    WCAG AA. */
export const calBrandColor = "#262626";

/** Attribution sent with each booking, so it reaches the CRM with its source. */
export const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "ref"] as const;
