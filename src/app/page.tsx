import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Philosophy from "@/components/landing/Philosophy";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Lumen — AI-Powered Healthcare",
  description:
    "Lumen turns clinical complexity into calm. AI-assisted intake, SOAP notes, differential diagnoses and ICD-10 mapping — built for the providers who never stop.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Philosophy />
        <Features />
        <HowItWorks />
        <Stats />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
