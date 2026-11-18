/**
 * How stat figures are written, shared by the server (the real figure in the
 * page) and the count-up, so both match exactly.
 */
export const formatter = (decimals: number) =>
  new Intl.NumberFormat("en", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
