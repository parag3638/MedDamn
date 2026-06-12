"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Shared landing primitives — the pill badge + arrow CTA motifs
   ported from the reference design language (paragsingh.in / Atlas).
   ────────────────────────────────────────────────────────────── */

type Tone = "dark" | "light" | "sage";

export function PillBadge({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    dark: "border-white/15 bg-white/[0.06] text-white/75",
    light: "border-sage-200 bg-sage-50 text-sage-700",
    sage: "border-white/25 bg-white/10 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5",
        "text-[0.7rem] font-medium uppercase tracking-[0.22em]",
        tones[tone],
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-sage-accent opacity-60 [animation:pulse-ring_2.6s_ease-out_infinite]" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sage-accent" />
      </span>
      {children}
    </span>
  );
}

type ButtonVariant = "solid" | "ghost-dark" | "ghost-light" | "light";

export function ArrowButton({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  const variants: Record<ButtonVariant, { pill: string; circle: string }> = {
    solid: {
      pill: "bg-sage-500 text-white hover:bg-sage-600 shadow-[0_14px_40px_-14px_rgba(95,184,154,0.7)]",
      circle: "bg-white/20 text-white",
    },
    light: {
      pill: "bg-white text-ink hover:bg-white/90 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.5)]",
      circle: "bg-ink text-white",
    },
    "ghost-dark": {
      pill: "border border-white/25 text-white hover:bg-white/10",
      circle: "bg-white/15 text-white",
    },
    "ghost-light": {
      pill: "border border-neutral-300 text-ink hover:bg-neutral-100",
      circle: "bg-sage-500 text-white",
    },
  };
  const v = variants[variant];

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2",
        "text-[0.8rem] font-semibold tracking-[0.04em] transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        v.pill,
        className
      )}
    >
      {children}
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45",
          v.circle
        )}
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </Link>
  );
}

/* Section eyebrow + two-tone heading used across light sections */
export function SectionHeading({
  badge,
  tone = "light",
  className,
  children,
}: {
  badge?: string;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-6 text-center", className)}>
      {badge ? <PillBadge tone={tone}>{badge}</PillBadge> : null}
      <h2
        className={cn(
          "font-display font-semibold tracking-[-0.03em]",
          "text-4xl leading-[1.04] sm:text-5xl lg:text-[3.5rem]",
          tone === "dark" || tone === "sage" ? "text-white" : "text-ink"
        )}
      >
        {children}
      </h2>
    </div>
  );
}
