"use client";

import { motion } from "framer-motion";
import {
  MessagesSquare,
  LayoutDashboard,
  Workflow,
  NotebookPen,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PillBadge } from "./ui";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: string;
  chips?: string[];
};

const features: Feature[] = [
  {
    icon: MessagesSquare,
    title: "AI-Assisted Intake",
    description:
      "Lumen listens to patient conversations and form inputs, then returns a clean, structured clinical summary in seconds — no dictation, no busywork.",
    span: "md:col-span-2",
    chips: ["SOAP notes", "Differential diagnoses", "ICD-10 mapping"],
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboards",
    description:
      "Track every case with real-time status, review notes and alerts — your whole practice at a glance.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Auto-generated differential diagnoses, red-flag warnings and treatment insights surface what matters first.",
  },
  {
    icon: NotebookPen,
    title: "Templates & Notes",
    description:
      "Organize clinical templates, reusable notes and documentation in one calm, searchable system.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "HIPAA-grade data security, end-to-end encryption and a scalable stack you can trust with every record.",
  },
];

export default function Features() {
  return (
    <section
      id="capabilities"
      aria-label="Capabilities"
      className="bg-clinical relative px-6 py-28 sm:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <PillBadge tone="light">Capabilities</PillBadge>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.4rem]">
            Built for the way{" "}
            <span className="text-sage-600">clinicians actually work.</span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-500">
            One intelligent platform that handles the documentation, surfaces the
            risks and keeps every case moving — from first conversation to closure.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((f, i) => {
            const highlighted = i === 0;
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: (i % 3) * 0.08 }}
                viewport={{ once: true, margin: "-80px" }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[1.75rem] p-7 transition-all duration-300",
                  f.span,
                  highlighted
                    ? "bg-sage-band text-white"
                    : "card-clinical hover:-translate-y-1 hover:border-sage-300"
                )}
              >
                {highlighted && (
                  <svg
                    className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 opacity-25"
                    viewBox="0 0 200 200"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1" />
                    <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.6" />
                  </svg>
                )}

                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    highlighted
                      ? "bg-white/15 text-white"
                      : "bg-sage-50 text-sage-600 group-hover:bg-sage-500 group-hover:text-white"
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>

                <h3
                  className={cn(
                    "mt-6 font-display text-xl font-semibold tracking-tight sm:text-2xl",
                    highlighted ? "text-white" : "text-ink"
                  )}
                >
                  {f.title}
                </h3>
                <p
                  className={cn(
                    "mt-2.5 max-w-md text-sm leading-relaxed",
                    highlighted ? "text-white/75" : "text-neutral-500"
                  )}
                >
                  {f.description}
                </p>

                {f.chips && (
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {f.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
