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

      // Detect Mac — trackpads send continuous momentum events that fight with
      // long Lenis durations, making scroll feel laggy/swimmy
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

      // Initialize Lenis with platform-appropriate parameters:
      // - Mobile: light/fast (don't fight native touch inertia)
      // - Mac desktop: shorter duration (trackpad momentum + long Lenis = double lag)
      // - Windows desktop: longer duration (mouse wheel benefits from smooth interpolation)
      const lenis = new Lenis({
        duration: isTouchDevice ? 1.0 : isMac ? 0.8 : 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: isTouchDevice ? 1.0 : isMac ? 1.2 : 0.8,
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
    } catch (e) {
      // Lenis failed to initialize (older browser, missing APIs, etc.)
      // Fall back to native scrolling — the site still works, just without smooth scroll
      console.warn("Lenis smooth scroll failed to initialize, falling back to native scroll:", e);
    }
  }, []);

  return <>{children}</>;
}
