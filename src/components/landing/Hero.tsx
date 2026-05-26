"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative min-h-screen flex items-end overflow-hidden"
    >
      {/* Background: portrait image first, sage gradient overlay on top */}
      <div className="absolute inset-0">
        {/* Base immersive gradient underneath */}
        <div className="absolute inset-0 bg-immersive" />
        <Image
          src="/images/hero-portrait.jpg"
          alt="Doctor using AI-powered healthcare assistant"
          fill
          priority
          className="object-cover object-center saturate-[0.55] brightness-[0.85]"
        />
        {/* Sage gradient tint — keep it lighter so image + text stay vivid */}
        <div className="absolute inset-0 bg-immersive opacity-45" />
        {/* Right-side darkening so description text is readable */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/10 to-transparent" />
        {/* Left-edge darkening so headline text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        {/* Decorative arcs — centered around the subject (right-center) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 1440 900"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="900" cy="450" r="380" stroke="white" strokeWidth="1" />
          <circle cx="880" cy="460" r="450" stroke="white" strokeWidth="0.7" />
          <circle cx="860" cy="470" r="520" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-8 md:px-12 pb-32 pt-32">
        <div className="max-w-[108rem] mx-auto flex justify-end">

          {/* All content — right column, right-aligned */}
          <div className="flex flex-col gap-16 md:max-w-2xl ">

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-6xl md:text-7xl lg:text-[7rem] font-medium leading-[0.92] text-white"
            >
              AI-Powered
              <br />
              Healthcare
              <br />
              Assistant.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="flex flex-col gap-5 max-w-xl"
            >
              <p className="text-sm md:text-base leading-relaxed text-white/85 font-medium">
                Streamline your healthcare experience with our intelligent AI
                assistant. Fast, secure, and designed for modern medical practices.
              </p>

              <a
                href="/intake"
                className="inline-flex self-start items-center gap-3 px-7 py-3.5 rounded-full text-xs tracking-[0.18em] font-medium bg-sage-500/70 backdrop-blur-sm border border-sage-400/50 text-white hover:bg-sage-700/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Patient Check-In
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </a>

              <div className="flex flex-col items-start gap-2">
                <p className="text-xs tracking-[0.2em] text-white/60 font-medium">
                  TRUSTED BY HEALTHCARE PROFESSIONALS
                </p>
                <div className="flex flex-wrap gap-2">
                  {["HIPAA Compliant", "End-to-End Encrypted", "SOC 2 Certified"].map((badge) => (
                    <span
                      key={badge}
                      className="text-xs px-3 py-1 rounded-full border border-white/50 text-white/80"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
