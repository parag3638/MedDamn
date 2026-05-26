"use client";

import { motion } from "framer-motion";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description:
      "Create your account in minutes. No technical setup required — just your practice details and you're ready to go. Our onboarding team is available to help every step of the way.",
  },
  {
    number: "02",
    title: "Connect Your System",
    description:
      "Seamlessly integrate MedDamn with your existing EHR or practice management software. We support all major platforms and our team guides you through the full setup.",
  },
  {
    number: "03",
    title: "Let AI Work",
    description:
      "Your intelligent assistant handles routine tasks — from patient check-ins to clinical summaries — so you can focus entirely on delivering exceptional care.",
  },
];

export default function HowItWorks() {
  const { mode } = useMode();
  const isLight = mode === "light";

  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className={cn(
        "py-24 px-8 md:px-12 mode-transition",
        isLight ? "bg-white" : "bg-immersive"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 text-center"
        >
          <h2
            className={cn(
              "font-serif text-4xl md:text-5xl font-normal mb-4 mode-transition",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            How It Works
          </h2>
          <p
            className={cn(
              "text-sm md:text-base max-w-2xl mx-auto mode-transition",
              isLight ? "text-neutral-500" : "text-white/70"
            )}
          >
            Getting started with MedDamn is simple. Our onboarding is fast,
            secure, and designed around your practice's needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col gap-4"
            >
              <span
                className={cn(
                  "font-serif text-5xl md:text-6xl mode-transition",
                  isLight ? "text-sage-300" : "text-white/20"
                )}
              >
                {step.number}
              </span>
              <h3
                className={cn(
                  "font-serif text-2xl md:text-3xl font-normal mode-transition",
                  isLight ? "text-neutral-900" : "text-white"
                )}
              >
                {step.title}
              </h3>
              <p
                className={cn(
                  "text-sm leading-relaxed mode-transition",
                  isLight ? "text-neutral-500" : "text-white/60"
                )}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
