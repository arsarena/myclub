"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import JoinModal from "./JoinModal";

export default function Footer() {
  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  // Track if we are on client to avoid hydration errors with window
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Smooth springs for the dynamic flashlight
  // The stiffness and damping dictate how "heavy" the light feels as it chases the mouse
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return; // Skip on mobile
    const rect = containerRef.current.getBoundingClientRect();
    // Offset by 400px (half the 800px width/height of the spotlight) so the light is perfectly centered on the cursor
    mouseX.set(e.clientX - rect.left - 400);
    mouseY.set(e.clientY - rect.top - 400);
  };

  return (
    <>
    <footer 
      id="join"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[80vh] mob-m:min-h-[85vh] tablet:min-h-[90vh] bg-[#050505] flex flex-col justify-end overflow-hidden pb-6 mob-m:pb-8 tablet:pb-10 pt-16 mob-m:pt-20 tablet:pt-32 desktop:pt-40 border-t border-white/5"
    >
       {/* The Massive Subtext Watermark */}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] overflow-hidden select-none">
          <h1 className="font-bebas text-[35vw] text-white whitespace-nowrap tracking-tighter">
            ARSARENA
          </h1>
       </div>

       {/* The Dynamic Cursor Flashlight (Only on desktop with mouse — skip entirely on touch devices) */}
       {isMounted && !isMobile && (
         <motion.div 
           className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-0"
           style={{
             background: "radial-gradient(circle, rgba(212,163,115,0.15) 0%, rgba(212,163,115,0) 70%)",
             x: springX,
             y: springY,
           }}
         />
       )}

       {/* Ambient static lighting — always visible, more prominent on mobile */}
       <div className={`absolute bottom-0 right-0 rounded-full blur-[80px] mob-m:blur-[100px] pointer-events-none ${
         isMobile 
           ? "w-[300px] h-[300px] bg-[#D4A373]/8" 
           : "w-[600px] h-[600px] bg-[#D4A373]/5"
       }`} />

       {/* Main Content Area */}
       <div className="relative z-10 w-full px-4 mob-m:px-6 tablet:px-12 laptop:px-16 desktop:px-24 large:px-32 flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <p className="font-inter text-[#D4A373] text-xs mob-m:text-sm tracking-[0.3em] mob-m:tracking-[0.4em] uppercase font-bold mb-3 mob-m:mb-4 drop-shadow-md text-center">
              Become a Visionary
            </p>

            <div className="group relative cursor-pointer mb-6 mob-m:mb-8 flex flex-col items-center justify-center">
               <h2 className="font-bebas text-center whitespace-nowrap text-[16vw] mob-m:text-[13vw] tablet:text-[11vw] laptop:text-[9vw] desktop:text-[8vw] large:text-[7vw] leading-[0.9] text-white tracking-tight transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#D4A373] group-hover:via-white group-hover:to-[#D4A373] group-hover:scale-[1.02]">
                 JOIN ARSARENA
               </h2>
               {/* Underline pulse on hover */}
               <div className="w-0 h-[3px] mob-m:h-[4px] bg-[#D4A373] mx-auto mt-3 mob-m:mt-4 transition-all duration-700 ease-out group-hover:w-1/2 opacity-50" />
            </div>

            {/* Club Mission Statement */}
            <p className="font-inter text-white/60 text-center max-w-xs mob-m:max-w-sm tablet:max-w-xl laptop:max-w-2xl desktop:max-w-3xl text-xs mob-m:text-sm tablet:text-base desktop:text-lg leading-relaxed mb-8 mob-m:mb-10 tablet:mb-12 px-2">
              At ARSARENA, we don't just make art — we create experiences, celebrate creativity, and grow together. Ready to make your mark?
            </p>

            {/* The Glowing CTA Button */}
            <motion.button
              onClick={() => setIsJoinModalOpen(true)}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 40px rgba(212,163,115,0.5)",
                backgroundColor: "#E5B887" 
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 mob-m:px-8 tablet:px-12 py-3.5 mob-m:py-4 min-h-[44px] bg-[#D4A373] text-black font-inter uppercase tracking-[0.12em] mob-m:tracking-[0.15em] text-[0.625rem] mob-m:text-xs font-extrabold rounded-full transition-all duration-300 shadow-xl"
            >
              Submit Portfolio
            </motion.button>
          </motion.div>



          {/* Legal / Copyright Footer */}
          <div className="w-full flex flex-row justify-between items-center gap-2 mob-m:gap-3 mt-10 mob-m:mt-12 tablet:mt-16 text-white/30 text-[0.5625rem] mob-m:text-[0.625rem] tablet:text-xs laptop:text-sm font-inter uppercase tracking-[0.15em] mob-m:tracking-[0.2em] px-1 tablet:px-2">
             <p>© {new Date().getFullYear()} ARSARENA</p>
             <motion.a 
               href="https://www.instagram.com/arsarena_spec?igsh=MWZ6b29lNHEwN2hraA=="
               target="_blank"
               rel="noopener noreferrer"
               whileHover={{ color: "#D4A373" }}
               className="transition-colors duration-300 cursor-pointer w-11 h-11 flex items-center justify-center -mr-2"
             >
               <span className="sr-only">Instagram</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                 <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                 <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
               </svg>
             </motion.a>
          </div>

       </div>
    </footer>

    <JoinModal 
      isOpen={isJoinModalOpen} 
      onClose={() => setIsJoinModalOpen(false)} 
    />
    </>
  );
}
