"use client";

import { motion } from "framer-motion";
import { PillBadge } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Philosophy() {
  return (
    <section
      id="about"
      aria-label="Our philosophy"
      className="bg-clinical relative overflow-hidden px-6 py-28 sm:px-8 md:py-36"
    >
      {/* faint concentric arcs */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        viewBox="0 0 600 600"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="300" cy="300" r="170" stroke="#3d5e52" strokeWidth="1" />
        <circle cx="300" cy="300" r="230" stroke="#3d5e52" strokeWidth="0.7" />
        <circle cx="300" cy="300" r="290" stroke="#3d5e52" strokeWidth="0.5" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative mx-auto flex max-w-4xl flex-col items-center gap-9 text-center"
      >
        <PillBadge tone="light">Our Philosophy</PillBadge>

        <p className="font-serif text-[1.75rem] font-normal italic leading-[1.5] text-ink sm:text-4xl sm:leading-[1.45]">
          We don&apos;t chase complexity —
          <br className="hidden sm:block" /> we{" "}
          <span className="text-sage-600">dissolve it with intention.</span>{" "}
          Through intelligent tools, clinical precision and a steady pace, we
          support care that lasts.
        </p>

        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="h-px w-8 bg-neutral-300" />
          The Lumen approach to clinical AI
          <span className="h-px w-8 bg-neutral-300" />
        </div>
      </motion.div>
    </section>
  );
}
