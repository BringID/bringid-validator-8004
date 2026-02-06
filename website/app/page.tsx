import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { VideoDemo } from "@/components/landing/VideoDemo";
import { UseCases } from "@/components/landing/UseCases";
import { Steps } from "@/components/landing/Steps";
import { TrustBlock } from "@/components/landing/TrustBlock";
import { DeveloperCallout } from "@/components/landing/DeveloperCallout";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <VideoDemo />
      <UseCases />
      <Steps />
      <TrustBlock />
      <DeveloperCallout />
      <Footer />
    </main>
  );
}
