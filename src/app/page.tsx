import Image from "next/image";

import logo from "@/assets/careerhaki-logo.png";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ path: "/" });

// Module 1.2: one blank branded page. Sections and components are module 1.3.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-site flex-col justify-center gap-10 px-gutter py-section">
      <Image
        src={logo}
        alt="CareerHaki"
        sizes="191px"
        loading="eager"
        className="h-11 w-auto self-start"
      />
      <h1 className="max-w-[19ch] text-h1">
        Career coaching and mentorship for people in tech.
      </h1>
    </main>
  );
}
