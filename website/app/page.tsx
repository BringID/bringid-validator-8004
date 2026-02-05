import { Hero } from "@/components/landing/Hero";
import { SkillMdBlock } from "@/components/landing/SkillMdBlock";
import { Steps } from "@/components/landing/Steps";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <SkillMdBlock />
      <Steps />
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-800 mt-12">
        <p>
          Built on{" "}
          <a
            href="https://eips.ethereum.org/EIPS/eip-8004"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            EIP-8004
          </a>{" "}
          +{" "}
          <a
            href="https://bringid.org"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            BringID
          </a>
        </p>
      </footer>
    </main>
  );
}
