"use client";

import { motion } from "framer-motion";
import { UserPlus, PlugZap, Sparkles, type LucideIcon } from "lucide-react";
import { PillBadge } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

const steps: { number: string; icon: LucideIcon; title: string; description: string }[] = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign Up",
    description:
      "Create your account in minutes. No technical setup required — just your practice details and our team beside you every step of the way.",
  },
  {
    number: "02",
    icon: PlugZap,
    title: "Connect Your System",
    description:
      "Seamlessly integrate Lumen with your existing EHR or practice software. We support all major platforms and guide the full setup.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Let AI Work",
    description:
      "Your assistant handles the routine — from patient check-ins to clinical summaries — so you can focus entirely on delivering care.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className="relative bg-white px-6 py-28 sm:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <PillBadge tone="light">Getting Started</PillBadge>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
            Live in three <span className="text-sage-600">simple steps.</span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-500">
            Onboarding is fast, secure and shaped around your practice — most teams
            are running on Lumen the same week they start.
          </p>
        </motion.div>

        <div className="relative mt-20 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {/* connector line */}
          <div
            className="absolute left-0 right-0 top-[2.25rem] hidden h-px md:block"
            style={{
              background:
                "linear-gradient(to right, transparent, #c9d9cc 12%, #c9d9cc 88%, transparent)",
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: i * 0.12 }}
                viewport={{ once: true, margin: "-80px" }}
                className="relative flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-sage-200 bg-clinical">
                  <Icon className="h-7 w-7 text-sage-600" strokeWidth={1.7} />
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-sage-500 font-display text-xs font-semibold text-white shadow-sm">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-7 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
