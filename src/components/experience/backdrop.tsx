"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { themeColors } from "@/lib/confetti";

type Star = {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
  speed: number;
};

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

/**
 * The permanent stage behind every chapter: three drifting aurora blobs (CSS,
 * GPU-composited) plus a canvas starfield that parallaxes with the pointer or
 * device tilt and occasionally throws a shooting star.
 */
export function Backdrop() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shooters: Shooter[] = [];
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let nextShooter = 2600;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area so phones don't render desktop star counts.
      const count = Math.round(Math.min(190, Math.max(60, (width * height) / 9000)));
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + depth * 1.5,
          depth,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.6,
        };
      });
    };

    const onPointer = (event: PointerEvent) => {
      parallax.tx = (event.clientX / width - 0.5) * 2;
      parallax.ty = (event.clientY / height - 0.5) * 2;
    };

    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      parallax.tx = Math.max(-1, Math.min(1, event.gamma / 45));
      parallax.ty = Math.max(-1, Math.min(1, (event.beta - 45) / 45));
    };

    const draw = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;

      parallax.x += (parallax.tx - parallax.x) * 0.045;
      parallax.y += (parallax.ty - parallax.y) * 0.045;

      ctx.clearRect(0, 0, width, height);

      const [c1, c2, c3] = themeColors();
      for (const star of stars) {
        const twinkle = reduceMotion
          ? 0.7
          : 0.45 + 0.55 * Math.abs(Math.sin(star.phase + (now / 1000) * star.speed));
        const ox = parallax.x * (6 + star.depth * 26);
        const oy = parallax.y * (6 + star.depth * 26);
        ctx.globalAlpha = twinkle * (0.25 + star.depth * 0.75);
        ctx.fillStyle = star.depth > 0.82 ? c2 : star.depth > 0.6 ? c1 : "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x + ox, star.y + oy, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) {
        nextShooter -= dt;
        if (nextShooter <= 0) {
          nextShooter = 5000 + Math.random() * 9000;
          const fromLeft = Math.random() > 0.5;
          shooters.push({
            x: fromLeft ? -40 : width + 40,
            y: Math.random() * height * 0.55,
            vx: (fromLeft ? 1 : -1) * (0.5 + Math.random() * 0.35),
            vy: 0.18 + Math.random() * 0.16,
            life: 1,
          });
        }

        for (const shooter of shooters) {
          shooter.x += shooter.vx * dt;
          shooter.y += shooter.vy * dt;
          shooter.life -= dt / 1400;

          const tailX = shooter.x - shooter.vx * 90;
          const tailY = shooter.y - shooter.vy * 90;
          const gradient = ctx.createLinearGradient(shooter.x, shooter.y, tailX, tailY);
          gradient.addColorStop(0, c3);
          gradient.addColorStop(1, "transparent");
          ctx.globalAlpha = Math.max(0, shooter.life);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(shooter.x, shooter.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }
        shooters = shooters.filter((shooter) => shooter.life > 0);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onTilt);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div className="absolute inset-0 opacity-70 blur-[90px] sm:blur-[130px]">
        <div className="animate-drift-slow absolute top-[-18%] left-[-12%] size-[62vmax] rounded-full bg-[radial-gradient(circle_at_center,var(--c1),transparent_65%)]" />
        <div className="animate-drift-fast absolute right-[-16%] bottom-[-22%] size-[58vmax] rounded-full bg-[radial-gradient(circle_at_center,var(--c2),transparent_65%)]" />
        <div className="animate-float absolute top-[28%] right-[18%] size-[38vmax] rounded-full bg-[radial-gradient(circle_at_center,var(--c3),transparent_68%)] opacity-80" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      <div className="vignette absolute inset-0" />

      {/* Film grain keeps the large gradient fields from banding. */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
