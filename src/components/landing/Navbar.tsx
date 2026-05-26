"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "HOW IT WORKS", target: "how-it-works" },
  { label: "IMPACT", target: "impact" },
  { label: "ABOUT", target: "about" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const { mode } = useMode();
  const [pastHero, setPastHero] = useState(false);
  const [inDarkSection, setInDarkSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.5);
      const footer = document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setInDarkSection(rect.top < window.innerHeight * 0.6);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Light-styled only when mode is light, past hero, and NOT scrolled into the dark footer
  const isLight = mode === "light" && pastHero && !inDarkSection;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 mode-transition",
        "flex items-center justify-between px-8 md:px-12 py-8"
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className={cn(
          "flex items-center gap-2 text-lg tracking-wide mode-transition",
          isLight ? "text-sage-700" : "text-white"
        )}
      >
        <span className="w-2 h-2 rounded-full bg-current" />
        <span className="font-sans">MedDamn</span>
      </Link>

      {/* Nav Links + CTA grouped on the right */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => scrollTo(link.target)}
            className={cn(
              "text-xs tracking-[0.2em] font-bold mode-transition hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              isLight ? "text-neutral-700" : "text-white"
            )}
          >
            {link.label}
          </button>
        ))}

        {/* CTA Button */}
        <Link
          href="/vaultx/dashboard"
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-[0.15em] font-bold mode-transition transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
            isLight
              ? "bg-sage-600 text-white hover:bg-sage-700"
              : "bg-white text-neutral-900 hover:bg-white/90"
          )}
        >
          GO TO DASHBOARD
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </Link>
      </div>
    </nav>
  );
}
