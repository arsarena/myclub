"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Header() {
  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Origins", href: "#origins" },
    { name: "Archive", href: "#archive" },
    { name: "Core", href: "#core" },
    { name: "Rewind", href: "#rewind" },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Container variants for a smooth sequential fade-in
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.4,
      }
    }
  };

  // Nav item variants for a gentle upward slide
  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Hide header if scrolling down and we're past the very top (don't hide when mobile menu is open)
    if (latest > previous && latest > 150 && !mobileMenuOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navigateTo = (href: string) => {
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
    window.history.pushState(null, '', href);
  };

  return (
    <>
      {/* Smart header: slides up when scrolling down to avoid overlapping content */}
      <motion.header 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 }
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-3 mob-m:px-4 tablet:px-8 py-3 mob-m:py-4 tablet:py-6"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between relative">
          
          {/* Cinematic Logo fade-in */}
          <motion.div 
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
            className="flex items-center flex-1"
          >
            <img 
              src="/logo.png" 
              alt="ARSARENA Logo" 
              className="h-5 mob-m:h-6 md:h-8 w-auto object-contain mix-blend-multiply" 
            />
          </motion.div>
          
          {/* Center Navigation Pill with smooth stagger — DESKTOP ONLY */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="flex justify-center"
          >
            <motion.nav 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="hidden laptop:flex items-center gap-2 rounded-full border border-white/50 bg-white/30 px-3 py-2 font-inter text-sm font-medium text-black/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] ring-1 ring-inset ring-white/40"
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  variants={itemVariants}
                  className="relative px-4 py-1.5 rounded-full transition-colors hover:text-black group flex flex-col items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.href);
                  }}
                  // Elegant, non-jarring hover scale and soft glow
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(255,255,255,0.5)",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.03)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {item.name}
                  
                  {/* Smooth underline glow effect */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-black/30 rounded-full transition-all duration-400 ease-out group-hover:w-[60%]" />
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
          
          {/* Right Side: CTA + Hamburger */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-end gap-3 tablet:gap-4 flex-1"
          >
            {/* Join Us CTA — visible on all sizes */}
            <motion.a 
              href="#join" 
              onClick={(e) => {
                e.preventDefault();
                navigateTo("#join");
                setMobileMenuOpen(false);
              }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "#000", 
                color: "#fff",
                boxShadow: "0px 8px 20px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="inline-flex items-center justify-center text-center leading-none cursor-pointer rounded-full border border-black/20 px-3 mob-m:px-4 tablet:px-6 py-1.5 mob-m:py-2 tablet:py-2.5 font-inter text-[10px] mob-m:text-xs tablet:text-sm font-medium text-black transition-colors"
            >
              Join Us
            </motion.a>

            {/* Hamburger Button — MOBILE ONLY */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="laptop:hidden flex flex-col items-center justify-center w-9 h-9 mob-m:w-10 mob-m:h-10 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 shadow-sm"
              aria-label="Toggle navigation menu"
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="block w-3.5 mob-m:w-4 h-[1.5px] bg-black/80 mb-1"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
                className="block w-3.5 mob-m:w-4 h-[1.5px] bg-black/80 mb-1"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="block w-3.5 mob-m:w-4 h-[1.5px] bg-black/80"
              />
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Full-screen Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[49] laptop:hidden"
          >
            {/* Glassmorphic Background */}
            <div className="absolute inset-0 bg-[#F5F2EB]/80 backdrop-blur-2xl" />

            {/* Navigation Links */}
            <nav className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    delay: 0.1 + index * 0.08, 
                    duration: 0.5, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="font-playfair text-3xl mob-m:text-4xl tablet:text-5xl text-black/80 tracking-tight py-2 mob-m:py-3 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-2 left-0 w-0 h-[2px] bg-[#D4A373] rounded-full transition-all duration-500 ease-out group-hover:w-full" />
                </motion.a>
              ))}

              {/* Decorative gold accent */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-16 h-[2px] bg-[#D4A373]/40 rounded-full mt-4"
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
