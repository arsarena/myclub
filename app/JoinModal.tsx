"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [otherDiscipline, setOtherDiscipline] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    vision: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Lock body scroll and stop Lenis when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Stop Lenis smooth scroll so native scroll works inside modal
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      // Restart Lenis when modal closes
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [isOpen]);

  // The Web App URL deployed from Google Apps Script
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqbnBKytoRPDEZRZWzSdXBdGppok-SN5vYfxMYrOp1jfBF2OsqOWGn_OLl3O0dzU5ckw/exec";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If 'other' is selected, they MUST type something in the other field
    if (!formData.name || !formData.email || !selectedDiscipline || !formData.vision || !formData.phone || !formData.branch || (selectedDiscipline === "other" && !otherDiscipline)) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    if (!formData.email.toLowerCase().endsWith("@stpetershyd.com")) {
      alert("Please use your official college email address (@stpetershyd.com).");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Use no-cors mode to bypass strict browser CORS policies when talking to Google Scripts
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          branch: formData.branch,
          discipline: selectedDiscipline === "other" ? otherDiscipline : disciplines.find(d => d.id === selectedDiscipline)?.label,
          vision: formData.vision
        }),
      });

      // Because we use no-cors, the response is opaque and we can't read response.ok.
      // If the fetch didn't throw a network error, it successfully reached Google!
      setSubmitStatus("success");
      // Reset form
      setFormData({ name: "", email: "", phone: "", branch: "", vision: "" });
      setSelectedDiscipline("");
      setOtherDiscipline("");
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
      }, 3000);
      
    } catch (error) {
      setSubmitStatus("error");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disciplines = [
    { id: "pencil", label: "Sketching & Graphite Art (Pencil art)" },
    { id: "painting", label: "Canvas & Fine Art Painting (Painting)" },
    { id: "crafts", label: "Handicrafts & Mixed Media (Crafts)" },
    { id: "editing", label: "Video Editing & Post-Production (Editing)" },
    { id: "digital", label: "Digital Design & Illustration (Digital designing)" },
    { id: "other", label: "Other Creative Visionary" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end tablet:items-center justify-center p-0 tablet:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel (Centered Pop-up with mobile scroll support) */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl tablet:max-h-[88vh] z-[101] bg-[#050505]/95 tablet:bg-[#050505]/60 backdrop-blur-2xl rounded-t-2xl tablet:rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col min-h-0 h-[95vh] tablet:h-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 mob-m:top-6 mob-m:right-6 text-white/30 hover:text-white transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Scrollable Content Area */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 mob-m:p-6 tablet:p-8 md:p-12"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
              data-lenis-prevent
            >
              {/* Application Form */}
              <form className="flex flex-col gap-4 mob-m:gap-5 tablet:gap-6" onSubmit={handleSubmit}>
                
                {/* Row 1: Name and Email */}
                <div className="flex flex-col tablet:flex-row gap-4 mob-m:gap-5 tablet:gap-6 w-full mt-1 mob-m:mt-2">
                  {/* Full Name Field */}
                  <div className="flex flex-col w-full tablet:w-1/2">
                    <label className="font-inter text-white/60 text-[10px] mob-m:text-xs tracking-[0.2em] uppercase mb-1.5 mob-m:mb-2">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      placeholder="Leonardo da Vinci"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg mob-m:rounded-xl px-4 mob-m:px-5 py-3 mob-m:py-4 text-sm mob-m:text-base text-white font-inter focus:outline-none focus:border-[#D4A373] focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                  </div>
                  {/* Email Field */}
                  <div className="flex flex-col w-full tablet:w-1/2">
                    <label className="font-inter text-white/60 text-[10px] mob-m:text-xs tracking-[0.2em] uppercase mb-1.5 mob-m:mb-2">
                      College Email Address
                    </label>
                    <input 
                      type="email"
                      placeholder="rollnumber@stpetershyd.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg mob-m:rounded-xl px-4 mob-m:px-5 py-3 mob-m:py-4 text-sm mob-m:text-base text-white font-inter focus:outline-none focus:border-[#D4A373] focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number and Branch */}
                <div className="flex flex-col tablet:flex-row gap-4 mob-m:gap-5 tablet:gap-6 w-full mt-3 mob-m:mt-4 tablet:mt-6">
                  {/* Phone Number Field */}
                  <div className="flex flex-col w-full tablet:w-1/2">
                    <label className="font-inter text-white/60 text-[10px] mob-m:text-xs tracking-[0.2em] uppercase mb-1.5 mob-m:mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg mob-m:rounded-xl px-4 mob-m:px-5 py-3 mob-m:py-4 text-sm mob-m:text-base text-white font-inter focus:outline-none focus:border-[#D4A373] focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                  </div>
                  {/* Branch Field */}
                  <div className="flex flex-col w-full tablet:w-1/2">
                    <label className="font-inter text-white/60 text-[10px] mob-m:text-xs tracking-[0.2em] uppercase mb-1.5 mob-m:mb-2">
                      Branch & Section
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. CSE-A"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg mob-m:rounded-xl px-4 mob-m:px-5 py-3 mob-m:py-4 text-sm mob-m:text-base text-white font-inter focus:outline-none focus:border-[#D4A373] focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Row 3: Your Creative Craft (Custom Dropdown) */}
                <div className="flex flex-col gap-1.5 mob-m:gap-2 mt-1 mob-m:mt-2 group">
                  <label className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/50 group-focus-within:text-[#D4A373] transition-colors">
                    Your Creative Craft
                  </label>
                  
                  {/* Custom Trigger */}
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full bg-white/5 backdrop-blur-md border ${isDropdownOpen ? 'border-[#D4A373] bg-white/10' : 'border-white/10'} rounded-lg mob-m:rounded-xl py-3 px-3 mob-m:px-4 flex justify-between items-center cursor-pointer transition-all`}
                  >
                    {selectedDiscipline === "other" ? (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Type your craft here..."
                        value={otherDiscipline}
                        onChange={(e) => setOtherDiscipline(e.target.value)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen(true);
                        }}
                        className="bg-transparent border-none outline-none text-sm mob-m:text-base text-white font-inter font-light w-full placeholder:text-[#D4A373]/60 focus:ring-0"
                      />
                    ) : (
                      <span className={`font-inter font-light text-sm mob-m:text-base ${selectedDiscipline ? 'text-white' : 'text-white/40'}`}>
                        {selectedDiscipline ? disciplines.find(d => d.id === selectedDiscipline)?.label : "Select your craft..."}
                      </span>
                    )}
                    
                    <motion.svg 
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDropdownOpen ? "#D4A373" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      className="text-white/50 flex-shrink-0 ml-2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </motion.svg>
                  </div>

                  {/* Inline Dropdown List — flows in document so scrolling works on mobile */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden rounded-lg mob-m:rounded-xl border border-white/10 bg-[#0A0C10]/98"
                      >
                        {disciplines.map((discipline) => (
                          <div 
                            key={discipline.id}
                            onClick={() => {
                              setSelectedDiscipline(discipline.id);
                              setIsDropdownOpen(false);
                            }}
                            className="px-3 mob-m:px-4 py-3.5 mob-m:py-3 font-inter font-light text-xs mob-m:text-sm text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors border-b border-white/5 last:border-b-0 flex items-center justify-between"
                          >
                            {discipline.label}
                            {selectedDiscipline === discipline.id && (
                              <motion.div 
                                layoutId="activeDot"
                                className="w-1.5 h-1.5 rounded-full bg-[#D4A373] flex-shrink-0 ml-2" 
                              />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Row 4: Your Vision */}
                <div className="flex flex-col gap-1.5 mob-m:gap-2 mt-1 mob-m:mt-2 group">
                  <label className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/50 group-focus-within:text-[#D4A373] transition-colors">
                    Your Vision
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Why do you want to create with us?"
                    value={formData.vision}
                    onChange={(e) => setFormData({...formData, vision: e.target.value})}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg mob-m:rounded-xl py-3 mob-m:py-4 px-3 mob-m:px-4 text-sm mob-m:text-base text-white font-inter font-light placeholder:text-white/20 focus:outline-none focus:border-[#D4A373] focus:bg-white/10 transition-all resize-none"
                  />
                </div>

                {/* Submit Button & Status (Centered) */}
                <div className="flex flex-col items-center mt-5 mob-m:mt-6 tablet:mt-8">
                  <motion.button 
                    type="submit"
                    disabled={isSubmitting || submitStatus === "success"}
                    whileHover={{ 
                      scale: (isSubmitting || submitStatus === "success") ? 1 : 1.05, 
                      boxShadow: (isSubmitting || submitStatus === "success") ? "none" : "0 0 30px rgba(212,163,115,0.4)",
                      backgroundColor: (isSubmitting || submitStatus === "success") ? "#D4A373" : "#E5B887" 
                    }}
                    whileTap={{ scale: (isSubmitting || submitStatus === "success") ? 1 : 0.95 }}
                    className={`px-8 mob-m:px-10 tablet:px-12 py-3.5 mob-m:py-4 rounded-full font-inter uppercase tracking-[0.15em] mob-m:tracking-[0.2em] text-[10px] mob-m:text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(212,163,115,0.2)] ${
                      submitStatus === "success" 
                        ? "bg-green-500 text-white" 
                        : "bg-[#D4A373] text-black"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? "Sending..." : submitStatus === "success" ? "Application Sent!" : "Send Message"}
                  </motion.button>

                  {submitStatus === "error" && (
                    <p className="text-red-400 font-inter text-[10px] mob-m:text-xs mt-3 mob-m:mt-4">Something went wrong. Please try again.</p>
                  )}
                </div>
                
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
