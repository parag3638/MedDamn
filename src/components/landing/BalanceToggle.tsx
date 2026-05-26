"use client";

import { useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

export default function BalanceToggle() {
  const { mode, toggleMode, setMode } = useMode();
  const isLight = mode === "light";

  // Tall wrapper gives scroll room; sticky section stays pinned while user scrolls
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Threshold: >30% → light (toggle ON); <12% → immersive (toggle OFF, scrolling back up)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.3 && mode === "immersive") setMode("light");
    if (v < 0.12 && mode === "light") setMode("immersive");
  });

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <section
        aria-label="AI mode toggle"
        className={cn(
          "sticky top-0 min-h-screen flex flex-col items-center justify-center px-8 mode-transition overflow-hidden",
          isLight ? "bg-white" : "bg-immersive"
        )}
      >
        {/* Decorative arcs */}
        <svg
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-700",
            isLight ? "opacity-[0.06]" : "opacity-[0.12]"
          )}
          viewBox="0 0 1200 900"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="600" cy="450" r="320" stroke={isLight ? "#8baa9b" : "white"} strokeWidth="0.6" />
          <circle cx="580" cy="470" r="380" stroke={isLight ? "#8baa9b" : "white"} strokeWidth="0.4" />
          <circle cx="620" cy="430" r="440" stroke={isLight ? "#8baa9b" : "white"} strokeWidth="0.3" />
        </svg>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl text-center">
          {/* Label + toggle */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs tracking-[0.2em] font-medium mode-transition",
                isLight ? "text-neutral-700" : "text-white"
              )}
            >
              AI MODE
            </span>
            <button
              onClick={toggleMode}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors duration-[360ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/50",
                isLight ? "bg-sage-500" : "bg-white/25"
              )}
              aria-label="Toggle AI mode"
            >
              <motion.span
                animate={{ x: isLight ? 5 : -25 }}
                transition={{ type: "spring", stiffness: 280, damping: 25 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>

          {/* Animated copy */}
          <AnimatePresence mode="wait">
            {isLight ? (
              <motion.div
                key="light"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-6"
              >
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-neutral-900">
                  Healthcare used to be complex,
                  <br />
                  <span className="text-sage-500">until AI made it effortless.</span>
                </h2>
                <p className="text-neutral-500 text-base md:text-lg max-w-lg">
                  Every clinic is different. These are the ways MedDamn helps
                  your practice run with precision and confidence.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="immersive"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-6"
              >
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-white">
                  If only managing healthcare
                  <br />
                  were as simple as flipping a switch.
                </h2>
                <p className="text-white/70 text-base md:text-lg max-w-lg">
                  With MedDamn, it practically is.
                  <br />
                  AI-powered. Clinically precise. Always on.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
