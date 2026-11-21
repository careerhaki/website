import { Hero } from "@/components/hero/hero";
import { AscentSection } from "@/components/ascent/ascent-section";
import { PainSection } from "@/components/pain/pain-section";
import { PeopleSection } from "@/components/people/people-section";
import { ProofBand } from "@/components/proof-band/proof-band";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ path: "/" });

// Copy from the approved homepage mockup (module 1.1), reviewed with the
// copywriting skill in module 1.3. Figures are confirmed proof only (see the
// operating brief); "82 in 100" is always a count of students.
const hero = {
  eyebrow: "Career coaching and mentorship for people in ",
  // Order set by Nithish; DevOps and security cut from the rotation on
  // 17 November (they stay in the lead). The first word is the still one.
  fields: ["tech", "data", "Agentic AI", "cloud", "software"],
  title: "A better role in tech, coached by engineers who do the job today.",
  lead: "For recent graduates and engineers two to three years in who want their next role in cloud, data, agentic AI, software, DevOps or security. You work with mentors who do the job in your field, from your first resume draft through your first 90 days in the new job.",
  stats: [
    {
      id: "hired",
      value: 120,
      suffix: "+",
      label: (
        <>
          professionals hired through <span translate="no">CareerHaki</span>
        </>
      ),
    },
    { id: "land", value: 82, suffix: " in 100", label: "students land a role" },
    {
      id: "rating",
      value: 4.9,
      decimals: 1,
      suffix: " out of 5",
      label: (
        <>
          rating on <span translate="no">Topmate</span>
        </>
      ),
    },
  ],
} as const;

// "The problem they feel". Copy from the mockup, reviewed with the
// copywriting skill: kept, with curly apostrophes.
const pain = {
  title: "You can do the job. Your applications aren’t saying so yet.",
  pains: [
    {
      title: "You apply widely and hear nothing.",
      body: "Your resume lists tasks and tools. It doesn’t show what you built, fixed or sped up, so it reads like everyone else’s.",
    },
    {
      title: "You know the answer, then lose it in the room.",
      body: "Interviews reward practice under pressure, and most people only get that practice in the real thing.",
    },
    {
      title: "You’re unsure what to learn next.",
      body: "There are a dozen certifications for every role. Only a few of them matter for the job you want.",
    },
    {
      title: "You’re working it out alone.",
      body: "Nobody who works in the role you want has looked at your plan and told you what to change.",
    },
  ],
  turn: "Each of these is a skill you can learn. The experience underneath it is already yours.",
  turnMark: "already yours",
} as const;

// "How CareerHaki works". Stage copy from the mockup, reviewed with the
// copywriting skill ("your mentors": students have several). Facts confirmed
// by Nithish on 17 November: weekly group office hours, a 1:1 whenever
// needed, mentors in the student's field (platform sessions cover tools,
// job platforms and personal brand, as the plan needs).
const ascent = {
  eyebrow: "The CareerHaki program",
  title: "The Ascent",
  lead: "Three stages that take you from where you are now to your first 90 days in a better role.",
  stages: [
    {
      name: "Prepare",
      line: "Know the role, then close the gap.",
      body: "Your mentors map the skills and certifications your target role asks for, then rebuild your resume and LinkedIn around what you’ve shipped.",
      items: ["Career roadmap", "Skill and certification plan", "Resume and LinkedIn", "Real-world projects"],
    },
    {
      name: "Land",
      line: "Apply with a plan.",
      body: "You target the right roles, run technical and behavioural mock interviews with working engineers, and get coaching through the offer and the negotiation.",
      items: ["Application strategy", "Mock interviews", "Offer and negotiation"],
    },
    {
      name: "Thrive",
      line: "Start strong in the new job.",
      body: "Most coaching stops at the offer. We stay with you through your first 90 days, while you ramp up, learn the team and earn trust.",
      items: ["First 90 days plan", "Workplace relationships", "Ongoing mentorship"],
    },
  ],
  facts: [
    {
      label: "Weekly office hours",
      line: "A group session with Nithish every week, and a 1:1 with him whenever you need one.",
    },
    {
      label: "Mentors in your field",
      line: "Engineers who work in your area coach you on skills, tools, communication and how you show up online, depending on what your plan needs.",
    },
    {
      label: "A private chat space",
      line: "Ask questions between sessions and get answers from your mentors.",
    },
    {
      label: "Open-ended",
      line: "You stay in the program until you’re hired, then through your first 90 days in the job.",
    },
  ],
} as const;

// "Proof from real people": outcome figures only, from the confirmed proof
// in the operating brief. 120+ repeats the hero's lead figure (Nithish asked
// for three, 17 November). "$" with no
// currency label (Nithish). The referral share is confirmed but internal: it
// says how CareerHaki finds students, not what a student gets (17 November).
const proof = {
  eyebrow: "Results",
  title: "Better pay, usually within four months.",
  proofs: [
    { id: "hired", figure: "120+", label: "professionals hired through CareerHaki" },
    { id: "salary", figure: "$25K+", label: "average salary increase" },
    { id: "time", figure: "1 to 4", label: "months to an offer, typically" },
  ],
} as const;

// "The mentors". The two co-founders for now; mentor cards join when the
// mentor list arrives. Facts from the operating brief only. Nithish said the
// details will change later (21 November); Bhogeshwar's line is drawn from
// his role and the delivery steps (welcome, file setup, chat space).
// Reviewed with the copywriting skill. The About page anchors come in 1.4.
const team = {
  id: "team",
  eyebrow: "Who you’ll work with",
  title: "Two founders, and mentors who work in your field.",
  lead: "Mentors who do the job you want coach you on skills, tools, interviews and how you show up online. The founders run everything around them.",
  people: [
    {
      id: "nithish",
      eyebrow: "Cloud",
      name: "Nithish Reddy",
      role: "Co-founder, technology and growth",
      bio: "A senior enterprise cloud architect who taught 1,400+ students as a professor at Centennial College. He runs the weekly office hours, and a 1:1 with him is there whenever you need one.",
      href: "/about#nithish",
      linkLabel: "About Nithish",
    },
    {
      id: "bhogeshwar",
      eyebrow: "Operations",
      name: "Bhogeshwar Reddy",
      role: "Co-founder, business and operations",
      bio: "He runs CareerHaki’s business and operations, so your sessions, files and chat space are ready when you need them.",
      href: "/about#bhogeshwar",
      linkLabel: "About Bhogeshwar",
    },
  ],
} as const;

// The homepage sections below arrive in the next pull requests of
// module 1.3 and in 1.4.
export default function HomePage() {
  return (
    <main id="main">
      <Hero {...hero} />
      <PainSection {...pain} />
      <AscentSection {...ascent} />
      <ProofBand {...proof} />
      <PeopleSection {...team} />
    </main>
  );
}
