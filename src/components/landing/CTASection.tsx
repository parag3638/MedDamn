"use client";

import { motion } from "framer-motion";
import { PillBadge, ArrowButton } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

export default function CTASection() {
  return (
    <section
      aria-label="Get started"
      className="bg-clinical px-6 py-24 sm:px-8 md:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        viewport={{ once: true, margin: "-100px" }}
        className="grain relative mx-auto flex max-w-5xl flex-col items-center gap-8 overflow-hidden rounded-[2.5rem] border border-sage-200 bg-white px-8 py-16 text-center shadow-[0_40px_100px_-50px_rgba(28,47,56,0.35)] sm:px-12 md:py-20"
      >
        {/* atmosphere */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sage-glow/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-sage-300/25 blur-[90px]" />
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          viewBox="0 0 600 600"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="300" cy="300" r="160" stroke="#3d5e52" strokeWidth="1" />
          <circle cx="300" cy="300" r="230" stroke="#3d5e52" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="300" stroke="#3d5e52" strokeWidth="0.4" />
        </svg>

        <div className="relative flex flex-col items-center gap-7">
          <PillBadge tone="light">Start Today</PillBadge>
          <h2 className="font-display text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl">
            Give your clinic its{" "}
            <span className="text-sage-600">time back.</span>
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-neutral-500 sm:text-lg">
            Join the providers using Lumen to turn documentation into minutes, not
            hours — and put their full attention back on patients.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <ArrowButton href="/intake" variant="solid">
              Start Patient Check-In
            </ArrowButton>
            <ArrowButton href="/vaultx/dashboard" variant="ghost-light">
              Go to Dashboard
            </ArrowButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
