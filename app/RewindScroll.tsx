"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function RewindScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Array of images with their titles and descriptions
  const REWIND_DATA = [
    { src: "/rewind/graduationday.jpg", title: "Graduation Day", description: "A heartfelt farewell to years of dedication — honoring achievements, friendships, and the journey that shaped every graduate." },
    { src: "/rewind/orientationday.jpg", title: "Orientation Day", description: "The beginning of something new — where fresh faces, new opportunities, and exciting experiences come together." },
    { src: "/rewind/shubharamgh.jpg", title: "SHUBHARAMBH '25", description: "A night of rhythm and tradition — vibrant beats, colorful attire, and endless dancing that brings everyone together." },
    { src: "/rewind/artscape.jpg", title: "ARTSCAPE", description: "A creative showcase where imagination meets expression — featuring artworks that reflect talent, passion, and originality." },
    { src: "/rewind/wall_of_arts.jpg", title: "Wall of Arts", description: "A living canvas within the campus — where student artworks come together to transform a simple wall into a space of expression and beauty." },
    { src: "/rewind/christmas.jpg", title: "Christmas Celebrations", description: "A joyful celebration of the holiday season — spreading cheer, warmth, and creativity across the campus." },
    { src: "/rewind/umang.jpg", title: "UMANG", description: "A festive celebration of Sankranthi — embracing tradition, culture, and joy through vibrant campus festivities." },
    { src: "/rewind/artscape2.0.jpg", title: "ARTSCAPE 2.0", description: "A vibrant gathering of emerging artists — showcasing diverse creations and fresh perspectives from across campuses." },
    { src: "/rewind/aquila.jpg", title: "AQUILA 2025", description: "Aquila marks our grand annual celebration — a day filled with energy, performances, and unforgettable campus moments, ending on a high note." }
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showInfoOnMobile, setShowInfoOnMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsDesktop(window.innerWidth >= 1366);
    };
    const checkTouch = () => setIsTouchDevice(
      window.matchMedia("(pointer: coarse)").matches || 
      ('ontouchstart' in window) ||
      navigator.maxTouchPoints > 0
    );
    check();
    checkTouch();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-play the images every 1.8 seconds, but PAUSE when hovered (desktop) or info is shown (mobile)
  useEffect(() => {
    if (isHovered || showInfoOnMobile) return; // Do not set interval if interaction active

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % REWIND_DATA.length);
    }, 1800);
    
    return () => clearInterval(interval);
  }, [isHovered, showInfoOnMobile]);

  // Track the scroll progress of the 220vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate the smooth cinematic zoom.
  // We natively render the container at its massive 85vw/85vh size so the browser loads the full high-res image.
  // Then we start it scaled down to 47.05% (which visually looks like 40vw/40vh).
  // This prevents any pixelation when expanding!
  // On mobile: no scale at all, just render at full size
  const scale = useTransform(scrollYProgress, [0, 1], isDesktop ? [0.4705, 1] : [1, 1]);

  // Show info overlay = hover on desktop, always-visible on mobile
  const shouldShowInfo = isTouchDevice ? showInfoOnMobile : isHovered;

  const handleTap = () => {
    if (isTouchDevice) {
      setShowInfoOnMobile(!showInfoOnMobile);
    }
  };

  return (
    // .zoom-section equivalent: matching Archive height on mobile/tablet, 220vh on desktop
    <section id="rewind" ref={containerRef} className="relative h-[70vh] tablet:h-[80vh] desktop:h-[220vh] bg-[#050505] w-full">
      
      {/* .sticky-wrapper equivalent: Freezes the content in place on desktop */}
      <div className="desktop:sticky top-0 w-full h-[70vh] tablet:h-[80vh] desktop:h-screen flex flex-col laptop:items-center laptop:justify-center overflow-hidden">
        
        {/* Website Personality: Floating Glassmorphic Orbs behind the zoom using the Core Brand Color */}
        <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] bg-[#D4A373]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-70" />
        <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-[#D4A373]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-70" />
        
        {/* Header */}
        <div className="absolute top-0 left-0 laptop:top-12 laptop:left-12 z-50 pointer-events-none mix-blend-difference text-white px-5 mob-m:px-6 pt-6 mob-m:pt-8 tablet:pt-10 laptop:p-0 w-full laptop:w-auto text-left">
          <h2 className="font-bebas text-4xl mob-m:text-5xl tablet:text-7xl tracking-tight leading-none mb-0.5 mob-m:mb-1 tablet:mb-2 uppercase">REWIND</h2>
          <p className="font-inter text-[#D4A373] text-[10px] mob-m:text-xs tablet:text-sm tracking-[0.3em] tablet:tracking-[0.4em] uppercase font-bold drop-shadow-md">Step back in time</p>
        </div>
        
        {/* THE CINEMATIC ZOOM CONTAINER */}
        <motion.div 
          style={{ scale }}
          onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
          onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
          onClick={handleTap}
          className="relative my-auto laptop:m-0 self-center w-[92vw] mob-m:w-[88vw] tablet:w-[85vw] aspect-video laptop:aspect-auto laptop:h-[85vh] rounded-[24px] mob-m:rounded-[32px] tablet:rounded-[48px] laptop:rounded-[2vw] overflow-hidden will-change-transform cursor-pointer shadow-[0_0_50px_rgba(212,163,115,0.1)]"
        >
          {/* AUTO-PLAYING IMAGES */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full rounded-[16px] mob-m:rounded-[24px] md:rounded-[1vw] overflow-hidden"
            >
              <Image
                src={REWIND_DATA[currentImageIndex].src}
                alt={REWIND_DATA[currentImageIndex].title}
                fill
                sizes="(max-width: 1024px) 100vw, 85vw"
                priority={currentImageIndex === 0} // Only preload the very first image
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-black/5 pointer-events-none z-10" />

          {/* Mobile tap hint — pulsing dot indicator */}
          {isMobile && !showInfoOnMobile && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#D4A373] animate-pulse" />
              <span className="font-inter text-white/70 text-[10px] tracking-[0.2em] uppercase">Tap for details</span>
            </div>
          )}

          {/* INFO OVERLAY (TITLE & DESCRIPTION) */}
          <AnimatePresence>
            {shouldShowInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-start justify-end p-5 mob-m:p-6 md:p-12 text-left bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-24 mob-m:pt-32"
              >
                <h3 className="font-bebas text-2xl mob-m:text-3xl md:text-7xl text-[#D4A373] tracking-widest mb-1 mob-m:mb-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                  {REWIND_DATA[currentImageIndex].title}
                </h3>
                <p className="font-inter text-white/90 text-xs mob-m:text-sm md:text-xl font-light max-w-3xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {REWIND_DATA[currentImageIndex].description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

      </div>
    </section>
  );
}
