"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 240;
const FRAME_PREFIX = "ezgif-frame-";
const FRAME_EXTENSION = ".jpg";
const FOLDER_PATH = "https://jzyg3qcwdokpd0fx.public.blob.vercel-storage.com/logo%20animated/";

// 3D Hover Tilt Wrapper for massive scroll cards — with tap-to-reveal on mobile
function TiltCardWrapper({ children, transformOrigin, isMobile }: { children: (revealed: boolean) => React.ReactNode, transformOrigin: string, isMobile: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [tapped, setTapped] = useState(false);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]); // Less intense for giant cards
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    x.set((relativeX / rect.width) - 0.5);
    y.set((relativeY / rect.height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (isMobile) {
      setTapped(!tapped);
    }
  };

  // On desktop: revealed = controlled by CSS group-hover (always false here, CSS handles it)
  // On mobile: revealed = tapped state
  const revealed = isMobile ? tapped : false;

  return (
    <div 
      style={{ transformOrigin, perspective: "1500px" }}
      className={`group inline-block cursor-crosshair transition-transform duration-500 ${!isMobile ? 'hover:scale-[1.15]' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {children(revealed)}
      </motion.div>
    </div>
  );
}

export default function ArsArenaScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkLayout = () => setIsMobile(window.innerWidth < 1024);
    const checkTouch = () => setIsTouchDevice(
      window.matchMedia("(pointer: coarse)").matches || 
      ('ontouchstart' in window) ||
      navigator.maxTouchPoints > 0
    );
    checkLayout();
    checkTouch();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply spring physics to the scroll progress for buttery smooth interpolation
  // This eliminates jitter from chunky mouse wheels
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      // pad with zeros, e.g., 001
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `${FOLDER_PATH}${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);

        // Removed auto-background color sampling to enforce Dark Mode
      };
      
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  const isLoaded = imagesLoaded === TOTAL_FRAMES;

  // Track the current frame index using the smoothed progress
  const frameIndex = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isLoaded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(latest)));
    const img = images[index];
    
    if (img && img.complete) {
      // Draw image to fill canvas (contain fit as requested)
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (canvasRatio > imgRatio) {
        // Canvas is wider than image (fit to width to COVER)
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image (fit to height to COVER)
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  });

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Redraw current frame
        const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameIndex.get())));
        const img = images[index];
        if (img && img.complete) {
          setTimeout(() => {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const canvasRatio = canvas.width / canvas.height;
              const imgRatio = img.width / img.height;
              
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              let drawWidth, drawHeight, offsetX, offsetY;
              
      if (canvasRatio > imgRatio) {
        // Canvas is wider than image (fit to width to COVER)
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image (fit to height to COVER)
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
          }, 0);
        }
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, [images, frameIndex, isLoaded]);

  // --- Scroll Timing Configuration (0.0 to 1.0) ---
  // Frame 95 out of 240 is exactly 40% scroll progress (95/239 = 0.397)
  

  // Origins Card
  // To hit ezgif-frame-095.jpg exactly: it is index 94 in the array. 94 / 239 = 0.3933
  const originsFadeInStart = 0.29; // Starts fading in around Frame 70
  const originsFadeInEnd = 0.393;   // EXACTLY 0% TRANSPARENT AT EZGIF-FRAME-095.JPG
  const originsFadeOutStart = 0.50; // Stays fully visible until Frame 120
  const originsFadeOutEnd = 0.60; // Fades out by Frame 143

  // Campus Canvas Card
  const campusFadeInStart = 0.65; // Starts fading in at Frame 155
  const campusFadeInEnd = 0.75; // Fully visible at Frame 179
  const campusFadeOutStart = 0.82; // Stays fully visible until Frame 196
  const campusFadeOutEnd = 0.88; // Fades out by Frame 210

  // More Than a Club Card
  const clubFadeInStart = 0.90; // Starts fading in at Frame 215
  const clubFadeInEnd = 0.95; // Fully visible at Frame 227

  // Welcome Card (0%)
  const welcomeFadeOutStart = 0.08;
  const welcomeFadeOutEnd = 0.15;
  
  const opacity0 = useTransform(smoothProgress, [0, welcomeFadeOutStart, welcomeFadeOutEnd], [1, 1, 0]);
  const y0 = useTransform(smoothProgress, [0, welcomeFadeOutStart, welcomeFadeOutEnd], [0, 0, -100]);
  const pointerEvents0 = useTransform(smoothProgress, [0, welcomeFadeOutStart, welcomeFadeOutEnd], ["auto", "auto", "none"]);

  // Origins Card
  const opacity30 = useTransform(smoothProgress, 
    [0, originsFadeInStart, originsFadeInEnd, originsFadeOutStart, originsFadeOutEnd], 
    [0, 0, 1, 1, 0]
  );
  const y30 = useTransform(smoothProgress, [0, originsFadeInStart, originsFadeInEnd, originsFadeOutEnd], [50, 50, 0, -50]);
  const pointerEvents30 = useTransform(smoothProgress, 
    [0, originsFadeInStart, originsFadeInStart + 0.01, originsFadeOutEnd - 0.01, originsFadeOutEnd], 
    ["none", "none", "auto", "auto", "none"]
  );

  // Campus Canvas Card
  const opacity60 = useTransform(smoothProgress, 
    [0, campusFadeInStart, campusFadeInEnd, campusFadeOutStart, campusFadeOutEnd], 
    [0, 0, 1, 1, 0]
  );
  const y60 = useTransform(smoothProgress, [0, campusFadeInStart, campusFadeInEnd, campusFadeOutEnd], [50, 50, 0, -50]);
  const pointerEvents60 = useTransform(smoothProgress, 
    [0, campusFadeInStart, campusFadeInStart + 0.01, campusFadeOutEnd - 0.01, campusFadeOutEnd], 
    ["none", "none", "auto", "auto", "none"]
  );

  // More Than a Club Card
  const opacity90 = useTransform(smoothProgress, 
    [0, clubFadeInStart, clubFadeInEnd], 
    [0, 0, 1]
  );
  const y90 = useTransform(smoothProgress, [0, clubFadeInStart, clubFadeInEnd], [50, 50, 0]);
  const pointerEvents90 = useTransform(smoothProgress, 
    [0, clubFadeInStart, clubFadeInStart + 0.01], 
    ["none", "none", "auto"]
  );

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#F5F2EB]">
      {/* Invisible anchor for the Header navigation. Dynamically tied to the originsFadeInEnd variable! (Scrollable distance is 300vh) */}
      <div id="origins" className="absolute" style={{ top: `${originsFadeInEnd * 300}vh` }} />
      
      {/* Split-Door Theater Reveal (Option 7) */}
      <AnimatePresence>
        {!isLoaded && (
          <div className="fixed inset-0 z-[99999] pointer-events-none">
            
            {/* LEFT DOOR (Clips the left 50% of the screen) */}
            <motion.div 
              className="absolute inset-0 bg-[#F5F2EB] flex flex-col items-center justify-center"
              style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
              // Aggressively slides left to open
              exit={{ x: "-50vw", opacity: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.4 } }}
            >
              {/* Subtle watermark background */}
              <img src="https://static.wixstatic.com/media/c1ad4c_cb5350d89fce4d21a3cc2359f7c28e3d~mv2.jpg" alt="bg" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-5 scale-105 translate-x-3" />
              
              {/* The Left Half of the Logo */}
              <img src="https://static.wixstatic.com/media/c1ad4c_c9131629f24a445ab5acb173ec2202dc~mv2.png" alt="Logo Left" className="relative z-10 w-48 h-48 mob-m:w-64 mob-m:h-64 laptop:w-96 laptop:h-96 object-contain mix-blend-multiply" />
            </motion.div>

            {/* RIGHT DOOR (Clips the right 50% of the screen) */}
            <motion.div 
              className="absolute inset-0 bg-[#F5F2EB] flex flex-col items-center justify-center"
              style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}
              // Aggressively slides right to open
              exit={{ x: "50vw", opacity: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.4 } }}
            >
              {/* Subtle watermark background */}
              <img src="https://static.wixstatic.com/media/c1ad4c_cb5350d89fce4d21a3cc2359f7c28e3d~mv2.jpg" alt="bg" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-5 scale-105 translate-x-3" />
              
              {/* The Right Half of the Logo */}
              <img src="https://static.wixstatic.com/media/c1ad4c_c9131629f24a445ab5acb173ec2202dc~mv2.png" alt="Logo Right" className="relative z-10 w-48 h-48 mob-m:w-64 mob-m:h-64 laptop:w-96 laptop:h-96 object-contain mix-blend-multiply" />
            </motion.div>

            {/* Center Lock / Glassmorphic Loading Dial */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              // The lock bursts open and fades out before the doors slide
              exit={{ scale: 2, opacity: 0, filter: "blur(10px)", transition: { duration: 0.5, ease: "easeIn" } }}
            >
              <div className="w-24 h-24 mob-m:w-32 mob-m:h-32 laptop:w-48 laptop:h-48 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center">
                <div className="font-bebas text-black/90 text-3xl mob-m:text-4xl laptop:text-6xl tracking-normal leading-none text-center flex justify-center mt-2 ml-3">
                  {Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%
                </div>
                <div className="font-inter text-black/60 text-[0.4375rem] mob-m:text-[0.5rem] laptop:text-[0.625rem] tracking-[0.4em] uppercase mt-1.5 mob-m:mt-2 text-center ml-[0.6em]">
                  Preparing Canvas
                </div>
              </div>
            </motion.div>
            
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Text Overlays */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          
          {/* 0% Scroll: Welcome to ARSARENA */}
          <motion.div 
            style={{ opacity: opacity0, y: y0, pointerEvents: pointerEvents0 }}
            className="absolute left-1/2 -translate-x-1/2 tablet:translate-x-0 tablet:left-12 laptop:left-24 z-10 w-full tablet:px-0 tablet:w-auto flex justify-center tablet:justify-start"
          >
            <TiltCardWrapper transformOrigin="left center" isMobile={isTouchDevice}>
              {(revealed) => (
                <div 
                  className={`w-[92vw] mob-m:w-[88vw] tablet:w-[480px] laptop:w-[600px] p-5 mob-m:p-6 tablet:p-12 rounded-2xl mob-m:rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] overflow-hidden
                    ${isTouchDevice ? 'bg-white/70 border border-white/50' : 'bg-white/20 border border-white/30'}
                  `}
                >
                  {/* The Background Image — hover on desktop, tap-toggled on mobile */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ease-out z-0 bg-black/40 pointer-events-none
                    ${revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    <img 
                      src="https://static.wixstatic.com/media/c1ad4c_9a2277d327f847dd8b5e79d6e7b34954~mv2.jpg" 
                      alt="ARSARENA Event" 
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out
                        ${revealed ? 'scale-100' : 'scale-110 group-hover:scale-100'}
                      `} 
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  {/* The Text Content */}
                  <div className={`relative z-10 transition-opacity duration-500 flex flex-col items-start text-left pointer-events-none
                    ${revealed ? 'opacity-0' : 'group-hover:opacity-0'}
                  `}>
                    <h1 className="font-playfair text-3xl mob-m:text-4xl tablet:text-6xl desktop:text-8xl text-black/90 tracking-tight">
                      Welcome to <br />
                      <span className="italic">ARSARENA</span>
                    </h1>
                    <p className="mt-1 tablet:mt-2 font-inter text-sm mob-m:text-base tablet:text-xl text-black/80 font-light tracking-wide">
                      Art Spirit of St. Peter&apos;s
                    </p>
                  </div>
                </div>
              )}
            </TiltCardWrapper>
          </motion.div>

          {/* Origins Card */}
          <motion.div 
            style={{ opacity: opacity30, y: y30, pointerEvents: pointerEvents30 }}
            className="absolute left-1/2 -translate-x-1/2 tablet:translate-x-0 tablet:left-auto tablet:right-12 laptop:right-24 z-10 w-full tablet:px-0 tablet:w-auto flex justify-center tablet:justify-end"
          >
            <TiltCardWrapper transformOrigin="right center" isMobile={isTouchDevice}>
              {(revealed) => (
                <div 
                  className={`w-[92vw] mob-m:w-[88vw] tablet:w-[450px] laptop:w-[500px] p-5 mob-m:p-6 tablet:p-12 rounded-2xl mob-m:rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] overflow-hidden
                    ${isTouchDevice ? 'bg-white/70 border border-white/50' : 'bg-white/20 border border-white/30'}
                  `}
                >
                  {/* Hover Background Image */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ease-out z-0 bg-black/40 pointer-events-none
                    ${revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    <img 
                      src="https://static.wixstatic.com/media/c1ad4c_6252f613c07042f2a63cabeec4e9e814~mv2.jpg" 
                      alt="Origins" 
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out
                        ${revealed ? 'scale-100' : 'scale-110 group-hover:scale-100'}
                      `} 
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  {/* Text Content */}
                  <div className={`relative z-10 transition-opacity duration-500 flex flex-col items-end text-right
                    ${revealed ? 'opacity-0' : 'group-hover:opacity-0'}
                  `}>
                    <h2 className="font-playfair text-2xl mob-m:text-3xl tablet:text-6xl text-black/90 leading-tight">
                      Genesis
                    </h2>
                    <p className="mt-2 tablet:mt-4 font-inter text-sm mob-m:text-base tablet:text-lg text-black/70">
                      ARSARENA is a creative space where ideas come to life. Built on a passion for art and expression, we bring together students who love to create, design, and inspire.
                    </p>
                  </div>
                </div>
              )}
            </TiltCardWrapper>
          </motion.div>

          {/* Campus Canvas Card */}
          <motion.div 
            style={{ opacity: opacity60, y: y60, pointerEvents: pointerEvents60 }}
            className="absolute left-1/2 -translate-x-1/2 tablet:translate-x-0 tablet:left-12 laptop:left-24 z-10 w-full tablet:px-0 tablet:w-auto flex justify-center tablet:justify-start"
          >
            <TiltCardWrapper transformOrigin="left center" isMobile={isTouchDevice}>
              {(revealed) => (
                <div 
                  className={`w-[92vw] mob-m:w-[88vw] tablet:w-[450px] laptop:w-[500px] p-5 mob-m:p-6 tablet:p-12 rounded-2xl mob-m:rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] overflow-hidden
                    ${isTouchDevice ? 'bg-white/70 border border-white/50' : 'bg-white/20 border border-white/30'}
                  `}
                >
                  {/* Hover Background Image */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ease-out z-0 bg-black/40 pointer-events-none
                    ${revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    <img 
                      src="https://static.wixstatic.com/media/c1ad4c_68459f44ca3e431b9cabaff018c73109~mv2.jpg" 
                      alt="Campus Canvas" 
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out
                        ${revealed ? 'scale-100' : 'scale-110 group-hover:scale-100'}
                      `} 
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  {/* Text Content */}
                  <div className={`relative z-10 transition-opacity duration-500 flex flex-col items-start text-left
                    ${revealed ? 'opacity-0' : 'group-hover:opacity-0'}
                  `}>
                    <h2 className="font-playfair text-2xl mob-m:text-3xl tablet:text-6xl text-black/90 leading-tight">
                      Campus Canvas
                    </h2>
                    <p className="mt-2 tablet:mt-4 font-inter text-sm mob-m:text-base tablet:text-lg text-black/70">
                      From vibrant rangoli designs, glass paintings, and handcrafted photobooths to engaging competitions and art showcases, we add color and creativity to every corner of campus. Our initiatives, like the Wall of Arts and Artscape, reflect the talent and imagination of our community.
                    </p>
                  </div>
                </div>
              )}
            </TiltCardWrapper>
          </motion.div>

          {/* More Than a Club Card */}
          <motion.div 
            style={{ opacity: opacity90, y: y90, pointerEvents: pointerEvents90 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full flex justify-center"
          >
            <TiltCardWrapper transformOrigin="center" isMobile={isTouchDevice}>
              {(revealed) => (
                <div 
                  className={`w-[92vw] mob-m:w-[88vw] tablet:w-[450px] laptop:w-[500px] p-5 mob-m:p-6 tablet:p-16 rounded-2xl mob-m:rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] overflow-hidden flex flex-col items-center text-center
                    ${isTouchDevice ? 'bg-white/70 border border-white/50' : 'bg-white/20 border border-white/30'}
                  `}
                >
                  {/* Hover Background Image */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ease-out z-0 bg-black/40 pointer-events-none
                    ${revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    <img 
                      src="https://static.wixstatic.com/media/c1ad4c_6deaabfee6214a7d8d53e28251df4743~mv2.jpg" 
                      alt="More Than a Club" 
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out
                        ${revealed ? 'scale-100' : 'scale-110 group-hover:scale-100'}
                      `} 
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  {/* Text Content */}
                  <div className={`relative z-10 transition-opacity duration-500 flex flex-col items-center text-center
                    ${revealed ? 'opacity-0' : 'group-hover:opacity-0'}
                  `}>
                    <h2 className="font-playfair text-3xl mob-m:text-4xl tablet:text-7xl text-black/90">
                      More Than <br />
                      a Club
                    </h2>
                    <p className="mt-3 mob-m:mt-4 tablet:mt-6 font-inter text-sm mob-m:text-base tablet:text-lg text-black/70 max-w-lg">
                      We are a family of designers, painters, sculptors, and dreamers. Find your people, forge lifelong friendships, and collaborate on projects that matter.
                    </p>
                  </div>
                </div>
              )}
            </TiltCardWrapper>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
