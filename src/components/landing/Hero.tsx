"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, BadgeCheck } from "lucide-react";
import { PillBadge, ArrowButton } from "./ui";

const trust = [
  { icon: ShieldCheck, label: "HIPAA Compliant" },
  { icon: Lock, label: "End-to-End Encrypted" },
  { icon: BadgeCheck, label: "SOC 2 Certified" },
];

const heroStats = [
  { value: "99%", label: "Uptime & reliability" },
  { value: "500+", label: "Healthcare providers" },
  { value: "10k+", label: "Patients served" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      className="grain relative flex min-h-screen items-center overflow-hidden bg-hero-dark"
    >
      {/* Right-bleeding cinematic portrait */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[58%]">
        <Image
          src="/images/hero-portrait.jpg"
          alt="Clinician using Lumen, the AI-powered healthcare assistant"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 58vw"
          className="object-cover object-[60%_center] saturate-[0.7] [mask-image:linear-gradient(to_right,transparent,black_42%)] md:[mask-image:linear-gradient(to_right,transparent,black_38%)]"
        />
        {/* tone the photo toward the sage-dark palette */}
        <div className="absolute inset-0 bg-ink/45 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
      </div>

      {/* Legibility wash on the left */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent md:to-ink/0" />

      {/* Sage glow */}
      <div className="pointer-events-none absolute -right-20 top-1/4 h-[34rem] w-[34rem] rounded-full bg-sage-accent/20 blur-[120px]" />

      {/* Concentric arcs centered on the subject */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 1440 900"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="980" cy="430" r="300" stroke="#7fd6b3" strokeWidth="1" />
        <circle cx="960" cy="440" r="400" stroke="white" strokeWidth="0.6" />
        <circle cx="940" cy="450" r="520" stroke="white" strokeWidth="0.4" />
      </svg>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center px-6 pb-16 pt-28 sm:px-8">
        <div className="flex max-w-2xl flex-col gap-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <PillBadge tone="dark">AI-Powered Healthcare Assistant</PillBadge>
          </motion.div>

          <h1 className="font-display text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-7xl lg:text-[5.25rem]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.06 }}
            >
              Intelligent care,
            </motion.span>
            <motion.span
              className="block text-sage-accent"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.16 }}
            >
              made effortless.
            </motion.span>
          </h1>

          <motion.p
            className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.26 }}
          >
            Lumen turns patient conversations into structured clinical summaries,
            SOAP notes and differential diagnoses — so your team spends less time
            on paperwork and more on people.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.34 }}
          >
            <ArrowButton href="/intake" variant="solid">
              Start Patient Check-In
            </ArrowButton>
            <ArrowButton href="/vaultx/dashboard" variant="ghost-dark">
              Go to Dashboard
            </ArrowButton>
          </motion.div>

          {/* Trust row */}
          <motion.div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.46 }}
          >
            {trust.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-xs font-medium text-white/55"
              >
                <Icon className="h-3.5 w-3.5 text-sage-glow" strokeWidth={2} />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Glass stat strip */}
          <motion.div
            className="mt-6 grid max-w-xl grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.56 }}
          >
            {heroStats.map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-2xl px-4 py-3.5"
              >
                <div className="font-display text-2xl font-semibold text-white sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[0.7rem] leading-tight text-white/55">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/40 md:flex">
        <span className="text-[0.62rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-9 w-px bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}
