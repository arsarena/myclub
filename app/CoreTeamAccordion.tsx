"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const TEAM_MEMBERS = [
  { 
    id: 1, 
    name: "Yashwanth", 
    role: "President", 
    image: "/welcome-hover.jpg",
    quote: "Art is chaos mapped to a grid."
  },
  { 
    id: 2, 
    name: "Tanmayi", 
    role: "Secretary", 
    image: "/campus-hover.jpg",
    quote: "Perfection is found in the margins."
  },
  { 
    id: 3, 
    name: "Jeshwanth", 
    role: "Club Admin", 
    image: "/welcome.jpg",
    quote: "Pixels are paint driven by electricity."
  },
  { 
    id: 4, 
    name: "Samatha", 
    role: "Joint Secretary", 
    image: "/club-hover.jpg",
    quote: "We engineer environments where art thrives."
  },
  { 
    id: 5, 
    name: "Deevakar", 
    role: "Vice President", 
    image: "/origins-hover.jpg",
    quote: "Vision without execution is just hallucination."
  },
];

export default function CoreTeamAccordion() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
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

  return (
    <section id="core" className="h-[100svh] w-full bg-[#050505] overflow-hidden relative cursor-crosshair flex flex-col">
       
       {/* Section Header — sits in flow on mobile, absolute on desktop */}
       <div className="relative laptop:absolute laptop:top-12 laptop:left-12 z-50 pointer-events-none laptop:mix-blend-difference text-white px-4 mob-m:px-6 pt-4 pb-2 mob-m:pt-6 mob-m:pb-4 laptop:p-0 bg-[#050505] laptop:bg-transparent flex-shrink-0">
         <h2 className="font-bebas text-3xl mob-m:text-4xl tablet:text-7xl tracking-tight leading-none mb-0.5 mob-m:mb-1 tablet:mb-2">THE CORE</h2>
         <p className="font-inter text-[#D4A373] text-[10px] mob-m:text-xs tablet:text-sm tracking-[0.3em] tablet:tracking-[0.4em] uppercase font-bold drop-shadow-md">The Visionaries of ARSARENA</p>
       </div>

       {/* The Accordion Container — takes remaining height on mobile */}
       <div className="flex flex-col laptop:flex-row flex-1 laptop:h-full w-full">
          {TEAM_MEMBERS.map((member, index) => {
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;
            
            // Flex sizing logic:
            // Mobile: expanded = 4, collapsed = 0.5, default = 1
            // Desktop: expanded = 5, collapsed = 0.5, default = 1
            const flexSize = !isAnyHovered 
              ? "1" 
              : (isHovered 
                ? (isMobile ? "4" : "5") 
                : "0.5");
            
            return (
              <motion.div 
                layout
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                key={member.id}
                // Removed CSS transition-all since Framer Motion handles the layout animation now
                className="relative overflow-hidden group border-b laptop:border-b-0 laptop:border-r border-white/5 last:border-b-0 laptop:last:border-r-0 cursor-pointer"
                style={{ flex: flexSize }}
                onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
                onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
                onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
              >
                {/* The Background Portrait */}
                <Image 
                  src={member.image} 
                  alt={member.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={true} // Priority true since this is usually in the initial viewport or just below it
                  className={`object-cover transition-all duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-center transform-gpu will-change-transform
                    ${!isHovered ? "grayscale" : "grayscale-0"}
                    ${!isAnyHovered 
                      ? "scale-[1.02]" 
                      : (isHovered 
                          ? "scale-105" 
                          : "scale-100 opacity-30")}
                  `} 
                />
                
                {/* Cinematic Gradient Overlays */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                
                {/* Subtle Gold accent glow on the hovered card */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-[#D4A373]/20 to-transparent mix-blend-overlay transition-opacity duration-700
                   ${isHovered ? "opacity-100" : "opacity-0"}
                `} />

                {/* Name Label (Visible only when compressed) */}
                {/* On mobile/tablet (flex-col): horizontal text. On laptop (flex-row): rotated -90deg */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-500 pointer-events-none laptop:-rotate-90
                   ${isHovered ? "opacity-0 scale-110 blur-sm" : "opacity-100 scale-100 blur-0 delay-200"}
                `}>
                   <span className={`font-bebas text-2xl mob-m:text-3xl tablet:text-5xl laptop:text-6xl tracking-widest transition-colors duration-500
                     ${!isAnyHovered ? "text-white/80" : "text-white/30"}
                   `}>
                     {member.name}
                   </span>
                </div>

                {/* Expanded Details (Visible only when active) */}
                <div className="absolute bottom-0 left-0 w-full p-4 mob-m:p-6 tablet:p-16 flex flex-col justify-end">
                   
                   {/* Animated Role */}
                   <div className="overflow-hidden mb-2 tablet:mb-4">
                     <p className={`font-inter text-[#D4A373] text-xs mob-m:text-sm tablet:text-lg tracking-[0.3em] tablet:tracking-[0.4em] uppercase font-semibold transition-all duration-[600ms] ease-out
                        ${isHovered ? "translate-y-0 opacity-100 delay-100" : "translate-y-full opacity-0"}
                     `}>
                       {member.role}
                     </p>
                   </div>
                   
                   {/* Animated Name */}
                   <div className="overflow-hidden">
                     <h3 className={`font-playfair text-2xl mob-m:text-3xl tablet:text-8xl desktop:text-[8rem] text-white tracking-tight leading-none whitespace-nowrap transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]
                        ${isHovered ? "translate-y-0 opacity-100 delay-75" : "translate-y-[120%] opacity-0"}
                     `}>
                       {member.name}
                     </h3>
                   </div>
                   
                   
                   
                </div>
              </motion.div>
            )
          })}
       </div>
    </section>
  );
}
