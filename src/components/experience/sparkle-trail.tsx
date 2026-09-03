"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

const POOL = 16;

/**
 * A lagging comet tail that follows the cursor. Desktop only: it is disabled on
 * coarse pointers and when the visitor asks for reduced motion.
 */
export function SparkleTrail() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    const dots: HTMLSpanElement[] = [];
    for (let i = 0; i < POOL; i += 1) {
      const dot = document.createElement("span");
      const size = 12 - i * 0.55;
      dot.style.cssText = `position:fixed;top:0;left:0;width:${size}px;height:${size}px;border-radius:9999px;opacity:${(1 - i / POOL) * 0.5};background:${
        i % 3 === 0 ? "var(--c2)" : i % 3 === 1 ? "var(--c1)" : "var(--c3)"
      };filter:blur(${0.5 + i * 0.22}px);will-change:transform;`;
      container.appendChild(dot);
      dots.push(dot);
    }

    const points = Array.from({ length: POOL }, () => ({ x: -100, y: -100 }));
    const pointer = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const frame = () => {
      let leadX = pointer.x;
      let leadY = pointer.y;
      points.forEach((point, i) => {
        point.x += (leadX - point.x) * 0.34;
        point.y += (leadY - point.y) * 0.34;
        dots[i].style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`;
        leadX = point.x;
        leadY = point.y;
      });
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      dots.forEach((dot) => dot.remove());
    };
  }, [reduceMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 mix-blend-screen"
    />
  );
}
