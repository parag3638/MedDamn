"use client";

import { ModeProvider } from "@/contexts/ModeContext";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BalanceToggle from "@/components/landing/BalanceToggle";
import Philosophy from "@/components/landing/Philosophy";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <ModeProvider>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <BalanceToggle />
        <Philosophy />
        <HowItWorks />
        <Stats />
      </main>
      <Footer />
    </ModeProvider>
  );
}
