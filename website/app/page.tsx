import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Illustration } from "@/components/landing/Illustration";
import { LearnMore } from "@/components/landing/LearnMore";
import { Paths } from "@/components/landing/Paths";
import { UseCases } from "@/components/landing/UseCases";
import { Steps } from "@/components/landing/Steps";
import { TrustBlock } from "@/components/landing/TrustBlock";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="container">
        <Hero />
        <Illustration />
        <LearnMore />
        <Paths />
        <UseCases />
        <Steps />
        <TrustBlock />
        <Footer />
      </div>
    </>
  );
}
