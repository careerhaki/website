import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ path: "/" });

// The hero and the homepage sections arrive in the next pull requests of
// module 1.3; until then the page keeps its one line under the navigation.
export default function HomePage() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-[70dvh] w-full max-w-site flex-col justify-center px-gutter py-section"
    >
      <h1 className="max-w-[19ch] text-h1">
        Career coaching and mentorship for people in tech.
      </h1>
    </main>
  );
}
