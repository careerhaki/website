import type { StaticImageData } from "next/image";

import accenture from "@/assets/logos/accenture.svg";
import acosta from "@/assets/logos/acosta.png";
import adastra from "@/assets/logos/adastra.png";
import aimco from "@/assets/logos/aimco.svg";
import amaris from "@/assets/logos/amaris.png";
import amazon from "@/assets/logos/amazon.svg";
import autodesk from "@/assets/logos/autodesk.svg";
import bird from "@/assets/logos/bird.png";
import brainbox from "@/assets/logos/brainbox-ai.svg";
import cihi from "@/assets/logos/cihi.svg";
import citi from "@/assets/logos/citi.svg";
import deloitte from "@/assets/logos/deloitte.svg";
import ehealth from "@/assets/logos/ehealth-saskatchewan.png";
import euna from "@/assets/logos/euna-solutions.svg";
import fluent from "@/assets/logos/fluent.png";
import goeasy from "@/assets/logos/goeasy.svg";
import google from "@/assets/logos/google.svg";
import hydroOttawa from "@/assets/logos/hydro-ottawa.svg";
import intact from "@/assets/logos/intact.svg";
import kpmg from "@/assets/logos/kpmg.svg";
import lactalis from "@/assets/logos/lactalis.svg";
import mckesson from "@/assets/logos/mckesson.svg";
import minesense from "@/assets/logos/minesense.png";
import naturesTouch from "@/assets/logos/natures-touch.png";
import ottawaHospital from "@/assets/logos/ottawa-hospital.png";
import perion from "@/assets/logos/perion.svg";
import providence from "@/assets/logos/providence-health.svg";
import queens from "@/assets/logos/queens-university.svg";
import safeguard from "@/assets/logos/safeguard-global.png";
import sita from "@/assets/logos/sita.svg";
import stellaJones from "@/assets/logos/stella-jones.svg";
import tsImagine from "@/assets/logos/ts-imagine.svg";
import valsoft from "@/assets/logos/valsoft.png";
import zs from "@/assets/logos/zs-associates.svg";

export type AlumniLogo = {
  id: string;
  /** The company's official name: the logo's alternative text. */
  name: string;
  src: StaticImageData;
  /**
   * Optical size, by eye, on top of equal-area sizing: logos whose lettering
   * reads small at strip height are drawn larger (default 1).
   */
  boost?: number;
  /**
   * "soft": a lighter one-colour treatment, for a filled badge whose white
   * name would vanish under the usual one-colour filter (Nature's Touch).
   */
  tone?: "soft";
};

/**
 * Where CareerHaki alumni work: 34 companies, confirmed by Nithish (21 and
 * 22 November 2026). Shown as places alumni work, never as clients. File
 * status in src/assets/logos/README.md.
 *
 * Two rows of 17. Well-known names are spread across both rows, so any
 * moment of the belt shows a few.
 */
export const alumniRows: readonly (readonly AlumniLogo[])[] = [
  [
    { id: "google", name: "Google", src: google },
    { id: "deloitte", name: "Deloitte", src: deloitte },
    { id: "hydro-ottawa", name: "Hydro Ottawa", src: hydroOttawa },
    { id: "accenture", name: "Accenture", src: accenture },
    { id: "queens", name: "Queen’s University", src: queens },
    { id: "kpmg", name: "KPMG", src: kpmg },
    { id: "intact", name: "Intact Financial Corporation", src: intact },
    { id: "citi", name: "Citi", src: citi },
    { id: "mckesson", name: "McKesson", src: mckesson },
    { id: "aimco", name: "AIMCo", src: aimco },
    { id: "perion", name: "Perion Network", src: perion },
    { id: "sita", name: "SITA", src: sita },
    { id: "goeasy", name: "goeasy", src: goeasy },
    { id: "euna", name: "Euna Solutions", src: euna },
    { id: "stella-jones", name: "Stella-Jones", src: stellaJones },
    { id: "bird", name: "Bird Construction", src: bird },
    { id: "natures-touch", name: "Nature’s Touch", src: naturesTouch, boost: 1.1, tone: "soft" },
  ],
  [
    { id: "amazon", name: "Amazon", src: amazon },
    { id: "providence", name: "Providence Health Care", src: providence },
    { id: "autodesk", name: "Autodesk", src: autodesk, boost: 1.1 },
    { id: "ottawa-hospital", name: "The Ottawa Hospital", src: ottawaHospital, boost: 1.35 },
    { id: "zs", name: "ZS Associates", src: zs },
    { id: "lactalis", name: "Lactalis", src: lactalis },
    { id: "ts-imagine", name: "TS Imagine", src: tsImagine },
    { id: "brainbox", name: "BrainBox AI", src: brainbox },
    { id: "acosta", name: "Acosta Group", src: acosta },
    { id: "fluent", name: "Fluent, Inc.", src: fluent },
    { id: "amaris", name: "Amaris Consulting", src: amaris },
    { id: "safeguard", name: "Safeguard Global", src: safeguard, boost: 1.2 },
    { id: "ehealth", name: "eHealth Saskatchewan", src: ehealth, boost: 1.1 },
    { id: "cihi", name: "Canadian Institute for Health Information", src: cihi, boost: 1.4 },
    { id: "valsoft", name: "ValSoft", src: valsoft },
    { id: "minesense", name: "MineSense", src: minesense, boost: 1.2 },
    { id: "adastra", name: "Adastra", src: adastra },
  ],
];

/** A logo's width over its height. */
export const logoRatio = (logo: AlumniLogo) => logo.src.width / logo.src.height;

/**
 * Optical size factor: equal visual area, so a long wordmark doesn't tower
 * over a square mark (clamped 0.62 to 1.45), then the logo's own boost.
 * Shared by the logo strip and the Results page's logo wall.
 */
export function logoScale(logo: AlumniLogo) {
  const k = Math.min(1.45, Math.max(0.62, Math.sqrt(3.2 / logoRatio(logo))));
  return k * (logo.boost ?? 1);
}
