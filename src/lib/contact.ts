/**
 * Direct contact. Kept free of imports so `npm test` can check it with Node.
 *
 * The WhatsApp number arrives in module 1.5. Until it is set, every WhatsApp
 * button on the site is left out of the page rather than shown broken
 * (decided by Nithish, 17 November 2026).
 */

/**
 * The WhatsApp number in international format, country code first, for
 * example "16135550123". Spaces, dashes and a leading + are ignored.
 * Empty: WhatsApp buttons are not shown.
 */
export const whatsappNumber = "";

/** The message a visitor's WhatsApp opens with. They can edit it before sending. */
export const whatsappMessage = "Hi CareerHaki, I’d like to ask about your coaching.";

/**
 * The click-to-chat address for a number, with the message filled in, or
 * null when there is no number yet.
 */
export function whatsappUrl(
  number: string = whatsappNumber,
  message: string = whatsappMessage,
): string | null {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 0) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
