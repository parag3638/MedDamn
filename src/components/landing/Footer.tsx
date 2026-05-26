"use client";

import { useRef, useEffect } from "react";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const sitemapLeft = [
  { label: "Main Page", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "About", action: () => scrollTo("about") },
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
        opacity: Math.random() * 0.55 + 0.15,
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
        ctx.fillStyle = `rgba(218, 165, 32, ${p.opacity})`;
        ctx.fill();
      });
    };

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      drawWave(h * 0.55, 18, 0.007, 0.7,  "#152535", 0.35);
      drawWave(h * 0.60, 14, 0.009, 0.9,  "#1a2f40", 0.45);
      drawWave(h * 0.65, 12, 0.011, 1.1,  "#1c3545", 0.55);
      drawWave(h * 0.70, 10, 0.013, 1.3,  "#1f3a4c", 0.65);
      drawWave(h * 0.76,  8, 0.016, 1.6,  "#234550", 0.72);
      drawWave(h * 0.82,  6, 0.020, 2.0,  "#285058", 0.60);
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
    <footer className="relative bg-footer text-white overflow-hidden min-h-screen flex flex-col">
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col flex-1 px-8 md:px-16 pt-20 pb-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">

          {/* Main content — grows to fill space */}
          <div className="flex-1 flex flex-col md:flex-row gap-16 md:gap-24 justify-between">

            {/* Brand closing — left */}
            <div className="md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white/50 mb-10">
                <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
                <span className="text-xs tracking-[0.2em] font-medium">MEDDAMN</span>
              </div>

              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] mb-6">
                Healthcare,
                <br />
                reimagined.
              </h2>

              <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-10">
                AI-powered. Clinically precise. Always on.
                <br />
                Built for the providers who never stop.
              </p>

              <div className="flex items-center gap-2 text-white/30">
                <span className="w-8 h-px bg-current" />
                <span className="text-xs tracking-[0.2em]">EST. 2024</span>
              </div>
            </div>

            {/* Sitemap — right */}
            <div className="md:w-1/2 flex flex-col justify-center md:items-end">
              <div>
                <span className="text-xs tracking-[0.28em] text-white/40 font-medium mb-7 block">
                  SITEMAP
                </span>
                <div className="flex gap-20">
                  <ul className="flex flex-col gap-4">
                    {sitemapLeft.map((link) => (
                      <li key={link.label}>
                        <button
                          onClick={link.action}
                          className="text-sm font-medium text-white/80 hover:text-white transition-colors"
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
                          className="text-sm font-medium text-white/80 hover:text-white transition-colors"
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-12 border-t border-white/10 mt-12">
            <p className="text-xs text-white/30 tracking-[0.15em]">
              MEDDAMN · AI-POWERED HEALTHCARE
            </p>
            <p className="text-xs text-white/35">
              © 2026 MedDamn. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
