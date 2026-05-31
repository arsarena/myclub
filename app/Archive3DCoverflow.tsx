"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const ARCHIVE_IMAGES = [
  { id: 1, src: "/archive/archive_1.jpeg", title: "Archive 1" },
  { id: 2, src: "/archive/archive_2.jpeg", title: "Archive 2" },
  { id: 3, src: "/archive/archive_3.jpeg", title: "Archive 3" },
  { id: 4, src: "/archive/archive_16.jpeg", title: "Archive 4" },
  { id: 5, src: "/archive/archive_5.jpeg", title: "Archive 5" },
  { id: 6, src: "/archive/archive_6.jpeg", title: "Archive 6" },
  { id: 7, src: "/archive/archive_7.jpeg", title: "Archive 7" },
  { id: 8, src: "/archive/archive_8.jpeg", title: "Archive 8" },
  { id: 9, src: "/archive/archive_9.jpeg", title: "Archive 9" },
  { id: 10, src: "/archive/archive_10.jpeg", title: "Archive 10" },
  { id: 11, src: "/archive/archive_11.jpeg", title: "Archive 11" },
  { id: 12, src: "/archive/archive_12.jpeg", title: "Archive 12" },
  { id: 13, src: "/archive/archive_13.jpeg", title: "Archive 13" },
  { id: 14, src: "/archive/archive_14.jpeg", title: "Archive 14" },
  { id: 15, src: "/archive/archive_15.jpeg", title: "Archive 15" },
  { id: 16, src: "/archive/archive_4.jpeg", title: "Archive 16" },
  { id: 17, src: "/archive/archive_17.jpeg", title: "Archive 17" },
  { id: 18, src: "/archive/archive_18.jpeg", title: "Archive 18" }
];

export default function Archive3DCoverflow() {
  const [spacing, setSpacing] = useState(400);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.floor(ARCHIVE_IMAGES.length / 2));
  
  // Track normalized mouse/touch position (0 to 1). We must initialize to exactly the math required for the middle integer index.
  const mouseX = useMotionValue(Math.floor(ARCHIVE_IMAGES.length / 2) / (ARCHIVE_IMAGES.length - 1));
  
  // Apply a spring for buttery smooth interpolation when the mouse moves
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  
  useEffect(() => {
    // Responsive spacing for mobile vs desktop
    const updateLayout = () => {
      const w = window.innerWidth;
      setIsMobile(w < 1024);
      setSpacing(w < 480 ? 160 : w < 768 ? 200 : w < 1024 ? 300 : 400);
    };
    updateLayout();

    const checkTouch = () => setIsTouchDevice(
      window.matchMedia("(pointer: coarse)").matches || 
      ('ontouchstart' in window) ||
      navigator.maxTouchPoints > 0
    );
    checkTouch();
    
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    // Ignore synthesized mouse movements on touch devices to prevent overriding the buttons
    // Also ignore physical mouse movements if window < 1366px, because the arrow buttons are active and they will fight!
    if (isTouchDevice || window.innerWidth < 1366) return;
    
    // Convert clientX to a 0-1 value across the screen width
    const normalized = e.clientX / window.innerWidth;
    mouseX.set(normalized);
  };

  // Map mouse progress (0 to 1) to an active float index (0 to N-1)
  const activeIndexFloat = useTransform(smoothMouseX, [0, 1], [0, ARCHIVE_IMAGES.length - 1]);

  // Track the closest active index for arrow button state
  useMotionValueEvent(activeIndexFloat, "change", (latest) => {
    setActiveIndex(Math.round(latest));
  });

  // Arrow button handlers — jump to prev/next image
  const goToPrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    const newIndex = Math.max(0, activeIndex - 1);
    const normalized = newIndex / (ARCHIVE_IMAGES.length - 1);
    mouseX.set(normalized);
  };

  const goToNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    const newIndex = Math.min(ARCHIVE_IMAGES.length - 1, activeIndex + 1);
    const normalized = newIndex / (ARCHIVE_IMAGES.length - 1);
    mouseX.set(normalized);
  };

  return (
    <section 
      id="archive"
      onMouseMove={handleMouseMove}
      // Reduced height on mobile/tablet, full height on desktop
      className="relative w-full h-[70vh] tablet:h-[80vh] desktop:h-[100vh] bg-[#050505] overflow-hidden flex flex-col items-center justify-center cursor-crosshair touch-pan-y"
      style={{ perspective: "1500px" }}
    >
        
        {/* Core Background Blur Effects matching the aesthetic */}
        <div className="absolute top-1/4 right-1/4 w-[300px] mob-m:w-[400px] h-[300px] mob-m:h-[400px] bg-[#D4A373]/20 rounded-full blur-[80px] mob-m:blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] mob-m:w-[500px] h-[350px] mob-m:h-[500px] bg-[#2A2A2A]/5 rounded-full blur-[80px] mob-m:blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="absolute top-0 left-0 desktop:top-12 desktop:left-12 z-50 pointer-events-none desktop:mix-blend-difference text-white px-4 mob-m:px-6 pt-4 pb-2 mob-m:pt-6 mob-m:pb-4 desktop:p-0 w-full desktop:w-auto text-left">
          <h2 className="font-bebas text-3xl mob-m:text-4xl tablet:text-7xl tracking-tight leading-none mb-0.5 mob-m:mb-1 tablet:mb-2 uppercase">
            ARCHIVE
          </h2>
          <p className="font-inter text-[#D4A373] text-[10px] mob-m:text-xs tablet:text-sm tracking-[0.3em] tablet:tracking-[0.4em] uppercase font-bold drop-shadow-md">
            {isTouchDevice ? "Tap to explore" : "Move cursor to explore"}
          </p>
        </div>

        {/* Cover Flow Carousel */}
        <div 
          className="relative w-full h-[40vh] mob-m:h-[45vh] tablet:h-[60vh] flex items-center justify-center transform-style-3d cursor-none"
          data-cursor="DRAG"
        >
          {ARCHIVE_IMAGES.map((img, i) => {
            // Offset defines how far this card is from the center (0 = center, -1 = left, 1 = right)
            const offset = useTransform(activeIndexFloat, (latest) => i - latest);
            
            // Map the offset to elegant 3D cover flow math
            const x = useTransform(offset, (v) => v * spacing);
            
            // Clamp rotation so the outer cards fan inwards (reduced on mobile for performance)
            const rotateY = useTransform(offset, [-2, -1, 0, 1, 2], 
              isMobile ? [45, 35, 0, -35, -45] : [60, 50, 0, -50, -60]
            );
            
            // Pop the active card deeply to the front, push inactive deeply to the back (reduced on mobile)
            const z = useTransform(offset, [-2, -1, 0, 1, 2], 
              isMobile ? [-200, -100, 100, -100, -200] : [-400, -200, 200, -200, -400]
            );
            
            // Scale up the active card for focus
            const scale = useTransform(offset, [-2, -1, 0, 1, 2], [0.75, 0.85, 1.15, 0.85, 0.75]);
            
            // Fade out cards that are too far away to optimize rendering
            const opacity = useTransform(offset, [-3, -2, -1, 0, 1, 2, 3], [0, 0.3, 1, 1, 1, 0.3, 0]);

            // Darken inactive cards beautifully
            const filterOpacity = useTransform(offset, [-1, 0, 1], [0.6, 0, 0.6]);

            return (
              <motion.div
                key={img.id}
                className="absolute w-[240px] mob-m:w-[280px] tablet:w-[560px] desktop:w-[640px] h-[135px] mob-m:h-[158px] tablet:h-[315px] desktop:h-[360px] rounded-xl mob-m:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black"
                style={{
                  x,
                  rotateY,
                  z,
                  scale,
                  opacity,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Dimmer overlay for inactive cards */}
                <motion.div 
                  className="absolute inset-0 bg-black z-10 pointer-events-none"
                  style={{ opacity: filterOpacity }}
                />
                
                <Image 
                  src={img.src} 
                  alt={img.title} 
                  fill
                  sizes="(max-width: 1024px) 80vw, 50vw"
                  // Prioritize loading the 3 images in the center of the array so they appear instantly
                  priority={i >= 7 && i <= 11}
                  className="object-cover"
                />
                
                {/* Glass reflection for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none z-20" />
              </motion.div>
            );
          })}
        </div>

        {/* Arrow Navigation Buttons — mobile and tablet only */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 left-4 mob-m:left-6 right-4 mob-m:right-6 z-40 flex desktop:hidden items-center justify-between pointer-events-none"
        >
          {/* Previous Button */}
          {activeIndex > 0 ? (
            <motion.button
              onClick={goToPrev}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              whileTap={{ scale: 0.85 }}
              className="w-11 h-11 mob-m:w-12 mob-m:h-12 tablet:w-14 tablet:h-14 rounded-full backdrop-blur-xl border shadow-lg flex items-center justify-center transition-all duration-300 bg-white/10 border-white/20 active:bg-white/20 cursor-pointer pointer-events-auto"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </motion.button>
          ) : (
            <div className="w-11 h-11 mob-m:w-12 mob-m:h-12 tablet:w-14 tablet:h-14 pointer-events-none" />
          )}

          {/* Next Button */}
          {activeIndex < ARCHIVE_IMAGES.length - 1 ? (
            <motion.button
              onClick={goToNext}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              whileTap={{ scale: 0.85 }}
              className="w-11 h-11 mob-m:w-12 mob-m:h-12 tablet:w-14 tablet:h-14 rounded-full backdrop-blur-xl border shadow-lg flex items-center justify-center transition-all duration-300 bg-white/10 border-white/20 active:bg-white/20 cursor-pointer pointer-events-auto"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </motion.button>
          ) : (
            <div className="w-11 h-11 mob-m:w-12 mob-m:h-12 tablet:w-14 tablet:h-14 pointer-events-none" />
          )}
          </div>
        
    </section>
  );
}
