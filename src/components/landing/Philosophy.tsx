"use client";

import { motion } from "framer-motion";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

export default function Philosophy() {
  const { mode } = useMode();
  const isLight = mode === "light";

  return (
    <section
      id="about"
      aria-label="Our philosophy"
      className={cn(
        "py-24 px-8 md:px-12 mode-transition",
        isLight ? "bg-neutral-50" : "bg-immersive"
      )}
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          <span
            className={cn(
              "text-xs tracking-[0.25em] font-medium mode-transition",
              isLight ? "text-sage-600" : "text-white/60"
            )}
          >
            OUR PHILOSOPHY
          </span>

          <h2
            className={cn(
              "font-serif text-2xl md:text-3xl lg:text-4xl font-normal leading-relaxed italic mode-transition",
              isLight ? "text-neutral-800" : "text-white"
            )}
          >
            At MedDamn, we don&apos;t chase complexity — we dissolve it with
            intention. Through intelligent tools, clinical precision, and a
            steady pace, we support care that lasts.
          </h2>

          <a
            href="#about"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs tracking-[0.15em] font-medium transition-all mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              isLight
                ? "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                : "border border-white/30 text-white hover:bg-white/10"
            )}
          >
            ABOUT MEDDAMN
          </a>
        </motion.div>
      </div>
    </section>
  );
}
