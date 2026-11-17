import { Hero } from "@/components/hero/hero";
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

// The homepage sections below the hero arrive in the next pull requests of
// module 1.3 and in 1.4.
export default function HomePage() {
  return (
    <main id="main">
      <Hero {...hero} />
    </main>
  );
}
