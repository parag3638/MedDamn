"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LumenMark } from "@/components/brand/LumenMark";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How it works", target: "how-it-works" },
  { label: "Capabilities", target: "capabilities" },
  { label: "Impact", target: "impact" },
  { label: "Philosophy", target: "about" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.78);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pl-2 pr-2 transition-all duration-500",
          scrolled
            ? "glass-pill-light shadow-[0_10px_40px_-20px_rgba(28,47,56,0.4)]"
            : "glass-pill"
        )}
      >
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 pl-1.5"
          aria-label="Lumen — home"
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              scrolled ? "bg-sage-500 text-white" : "bg-white/10 text-sage-glow"
            )}
          >
            <LumenMark className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "font-display text-lg font-semibold tracking-tight transition-colors",
              scrolled ? "text-ink" : "text-white"
            )}
          >
            Lumen
          </span>
        </Link>

        {/* Links */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollToId(link.target)}
              className={cn(
                "text-[0.78rem] font-medium tracking-wide transition-colors hover:text-sage-500 focus-visible:text-sage-500 focus-visible:outline-none",
                scrolled ? "text-neutral-600" : "text-white/75"
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center">
          <Link
            href="/vaultx/dashboard"
            className={cn(
              "group flex items-center gap-2 rounded-full py-2 pl-4 pr-2 text-[0.78rem] font-semibold tracking-wide transition-all duration-300",
              scrolled
                ? "bg-ink text-white hover:bg-ink-700"
                : "bg-white text-ink hover:bg-white/90"
            )}
          >
            <span className="hidden sm:inline">Go to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-500 text-white transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.6} />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
