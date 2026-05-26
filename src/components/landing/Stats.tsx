"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

const stats = [
  { value: 10000, suffix: "+", label: "Patients\nserved" },
  { value: 500, suffix: "+", label: "Healthcare\nproviders" },
  { value: 99, suffix: "%", label: "Uptime &\nreliability" },
  { value: 98, suffix: "%", label: "Provider\nsatisfaction" },
];

function AnimatedCounter({
  value,
  suffix,
  isLight,
}: {
  value: number;
  suffix: string;
  isLight: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1400;
    const startValue = Math.round(value * 0.75);
    const range = value - startValue;
    const start = performance.now();
    let raf: number;

    setCount(startValue);

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Quartic ease-out: fast start, heavy deceleration near end
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(startValue + eased * range));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value]);

  return (
    <span
      ref={ref}
      className={cn(
        "font-serif text-5xl md:text-6xl mode-transition",
        isLight ? "text-neutral-900" : "text-white"
      )}
    >
      {count}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { mode } = useMode();
  const isLight = mode === "light";

  return (
    <section
      id="impact"
      aria-label="Impact statistics"
      className={cn(
        "py-24 px-8 md:px-12 mode-transition",
        isLight ? "bg-neutral-50" : "bg-immersive"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <h2
            className={cn(
              "font-serif text-3xl md:text-4xl font-normal mb-4 mode-transition",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            Trusted by healthcare professionals
            across the country.
          </h2>
          <p
            className={cn(
              "text-sm max-w-2xl mx-auto mode-transition",
              isLight ? "text-neutral-500" : "text-white/70"
            )}
          >
            Every number reflects real outcomes — faster workflows, better care,
            and practices that run smarter with MedDamn.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col items-center text-center gap-2"
            >
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                isLight={isLight}
              />
              <p
                className={cn(
                  "text-sm whitespace-pre-line mode-transition",
                  isLight ? "text-neutral-500" : "text-white/60"
                )}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
