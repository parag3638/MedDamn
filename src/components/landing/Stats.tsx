"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PillBadge } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 10000, suffix: "+", label: "Patients served" },
  { value: 500, suffix: "+", label: "Healthcare providers" },
  { value: 99, suffix: "%", label: "Uptime & reliability" },
  { value: 98, suffix: "%", label: "Provider satisfaction" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1400;
    const startValue = Math.round(value * 0.7);
    const range = value - startValue;
    const start = performance.now();
    let raf: number;

    setCount(startValue);

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
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
      className="font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl"
    >
      {count.toLocaleString()}
      <span className="text-sage-glow">{suffix}</span>
    </span>
  );
}

export default function Stats() {
  return (
    <section
      id="impact"
      aria-label="Impact statistics"
      className="grain relative overflow-hidden bg-sage-band px-6 py-28 sm:px-8 md:py-32"
    >
      {/* glow */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-sage-glow/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <PillBadge tone="sage">Impact</PillBadge>
          <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-5xl">
            Real outcomes, <span className="text-sage-glow">measured.</span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-white/65">
            Every number reflects faster workflows, better care and practices that
            run smarter with Lumen.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-60px" }}
              className="glass-card flex flex-col items-center gap-2 rounded-3xl px-5 py-9 text-center"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
