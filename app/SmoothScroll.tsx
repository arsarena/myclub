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

    try {
      // Detect touch-primary devices
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || 
                            ('ontouchstart' in window) ||
                            navigator.maxTouchPoints > 0;
      const isAndroid = /Android/i.test(navigator.userAgent);

      // Initialize Lenis with device-appropriate parameters
      // Android: short duration (0.4s) — long interpolation generates too many
      // intermediate positions that overwhelm Android's video decoder during scroll
      // iOS: 1.2s works great — iOS decoder handles 60 seeks/sec
      // Desktop: 2.0s for luxurious heavy feel
      const lenis = new Lenis({
        duration: isAndroid ? 0.4 : (isTouchDevice ? 1.2 : 2.0),
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: isTouchDevice ? 1.0 : 0.8,
        touchMultiplier: isAndroid ? 2.0 : (isTouchDevice ? 1.5 : 2),
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
    } catch (e) {
      // Lenis failed to initialize (older browser, missing APIs, etc.)
      // Fall back to native scrolling — the site still works, just without smooth scroll
      console.warn("Lenis smooth scroll failed to initialize, falling back to native scroll:", e);
    }
  }, []);

  return <>{children}</>;
}
