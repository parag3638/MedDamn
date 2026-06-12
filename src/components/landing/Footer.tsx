"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LumenMark } from "@/components/brand/LumenMark";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const sitemapLeft = [
  { label: "Main Page", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "Philosophy", action: () => scrollTo("about") },
  { label: "Capabilities", action: () => scrollTo("capabilities") },
  { label: "How It Works", action: () => scrollTo("how-it-works") },
  { label: "Impact", action: () => scrollTo("impact") },
];

const sitemapRight = [
  { label: "Patient Check-In", action: () => { window.location.href = "/intake"; } },
  { label: "Dashboard", action: () => { window.location.href = "/vaultx/dashboard"; } },
  { label: "Privacy Policy", action: () => {} },
  { label: "Terms of Use", action: () => {} },
];

export default function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number; size: number; opacity: number;
    }> = [];

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * 1400,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.4 - 0.05,
        size: Math.random() * 2.2 + 0.6,
        opacity: Math.random() * 0.5 + 0.15,
      });
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawWave = (
      yOffset: number, amplitude: number, frequency: number,
      speed: number, color: string, alpha: number
    ) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y =
          yOffset +
          Math.sin(x * frequency + time * speed) * amplitude +
          Math.sin(x * frequency * 0.5 + time * speed * 0.7) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawParticles = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // sage motes drifting upward
        ctx.fillStyle = `rgba(127, 214, 179, ${p.opacity})`;
        ctx.fill();
      });
    };

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      drawWave(h * 0.55, 18, 0.007, 0.7, "#152b27", 0.35);
      drawWave(h * 0.60, 14, 0.009, 0.9, "#193a32", 0.45);
      drawWave(h * 0.65, 12, 0.011, 1.1, "#1c3f38", 0.55);
      drawWave(h * 0.70, 10, 0.013, 1.3, "#21493f", 0.65);
      drawWave(h * 0.76, 8, 0.016, 1.6, "#2a5a4c", 0.7);
      drawWave(h * 0.82, 6, 0.020, 2.0, "#356b59", 0.55);
      drawParticles();
      time += 0.018;
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <footer className="relative flex min-h-screen flex-col overflow-hidden bg-footer text-white">
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-28 sm:px-10 md:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          {/* Main content */}
          <div className="flex flex-1 flex-col justify-between gap-16 md:flex-row md:gap-24">
            {/* Brand closing */}
            <div className="flex flex-col justify-center md:w-1/2">
              <div className="mb-10 flex items-center gap-2.5 text-white/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sage-glow">
                  <LumenMark className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.24em]">Lumen</span>
              </div>

              <h2 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Healthcare,
                <br />
                <span className="text-sage-glow">reimagined.</span>
              </h2>

              <p className="mb-10 mt-6 max-w-xs text-sm leading-relaxed text-white/55">
                AI-powered. Clinically precise. Always on.
                <br />
                Built for the providers who never stop.
              </p>

              <Link
                href="/intake"
                className="group inline-flex w-fit items-center gap-2 rounded-full bg-white py-2 pl-5 pr-2 text-[0.8rem] font-semibold text-ink transition-all hover:bg-white/90"
              >
                Start Patient Check-In
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-500 text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
              </Link>
            </div>

            {/* Sitemap */}
            <div className="flex flex-col justify-center md:w-1/2 md:items-end">
              <div>
                <span className="mb-7 block text-xs font-medium uppercase tracking-[0.28em] text-white/40">
                  Sitemap
                </span>
                <div className="flex gap-16 sm:gap-20">
                  <ul className="flex flex-col gap-4">
                    {sitemapLeft.map((link) => (
                      <li key={link.label}>
                        <button
                          onClick={link.action}
                          className="text-sm font-medium text-white/80 transition-colors hover:text-sage-glow"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-col gap-4">
                    {sitemapRight.map((link) => (
                      <li key={link.label}>
                        <button
                          onClick={link.action}
                          className="text-sm font-medium text-white/80 transition-colors hover:text-sage-glow"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-10 md:flex-row">
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">
              Lumen · AI-Powered Healthcare
            </p>
            <div className="flex items-center gap-2 text-white/30">
              <span className="h-px w-8 bg-current" />
              <span className="text-xs tracking-[0.2em]">EST. 2024</span>
            </div>
            <p className="text-xs text-white/35">
              © 2026 Lumen. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
