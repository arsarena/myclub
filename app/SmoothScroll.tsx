"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable browser's automatic scroll restoration so it always starts at the top
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Detect touch-primary devices
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || 
                          ('ontouchstart' in window) ||
                          navigator.maxTouchPoints > 0;

    // Initialize Lenis with device-appropriate parameters
    // On mobile: lighter, faster settings that don't fight native touch inertia
    // On desktop: the luxurious heavy feel
    const lenis = new Lenis({
      duration: isTouchDevice ? 1.2 : 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Silky smooth exponential ease out
      smoothWheel: true,
      // Mobile gets a higher multiplier so scrolling feels snappy, not sluggish
      wheelMultiplier: isTouchDevice ? 1.0 : 0.8,
      // Allow native touch scrolling momentum to work naturally on mobile
      touchMultiplier: isTouchDevice ? 1.5 : 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expose lenis to window for custom anchor link routing
    (window as any).lenis = lenis;

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
