"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveringRef = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch-primary devices and disable the custom cursor entirely
    const isTouch = window.matchMedia("(pointer: coarse)").matches || 
                    ('ontouchstart' in window) ||
                    navigator.maxTouchPoints > 0;
    
    if (isTouch) {
      setIsTouchDevice(true);
      return; // Don't run any cursor logic on mobile
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // We added 'angle' and 'isSplatter' for the new Calligraphy and Splatter physics
    let points: { x: number; y: number; life: number; size: number; isSplatter: boolean }[] = [];
    let mouse = { x: -100, y: -100 };
    let lastMouse = { x: -100, y: -100 };
    let hueOffset = 0; // For multi-tonal ink

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const steps = Math.max(1, Math.floor(dist / 4)); 
      
      for(let i = 0; i < steps; i++) {
        const px = lastMouse.x + (dx * (i / steps));
        const py = lastMouse.y + (dy * (i / steps));

        // 1. Core Calligraphy Brush Stroke
        points.push({ 
          x: px, 
          y: py, 
          life: 1,
          size: Math.random() * 10 + 15, // Larger base size for the calligraphy nib
          isSplatter: false
        });

        // 2. High-Velocity Paint Splatter!
        // If the user flicks the mouse fast (dist > 15), we spawn detached ink droplets
        if (dist > 15 && Math.random() > 0.6) {
          points.push({
            // Throw the splatter outwards based on randomness
            x: px + (Math.random() - 0.5) * 60,
            y: py + (Math.random() - 0.5) * 60,
            life: 1,
            size: Math.random() * 4 + 1, // Tiny droplets
            isSplatter: true
          });
        }
      }
      
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };

    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest("a, button, [role='button'], input, [data-cursor]");
      isHoveringRef.current = !!isClickable;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", checkHover);

    // Force hide default cursor globally
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    let animationId: number;
    let smoothHoverSize = 8; 

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 3. Multi-Tonal Ink Oscillation
      hueOffset += 0.02;
      // We oscillate between 0 and 1 to blend two colors: #D4A373 (Gold) and #8C6239 (Bronze)
      const mixRatio = (Math.sin(hueOffset) + 1) / 2;
      const r = Math.round(212 - mixRatio * (212 - 140)); // 212 to 140
      const g = Math.round(163 - mixRatio * (163 - 98));  // 163 to 98
      const b = Math.round(115 - mixRatio * (115 - 57));  // 115 to 57
      const inkColor = `${r}, ${g}, ${b}`;

      // 1. Draw the trailing watercolor/ink stroke
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.beginPath();
        
        if (p.isSplatter) {
          // Splatters are perfect little circles
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        } else {
          // The Calligraphy Nib: A heavily squashed ellipse locked at a 45-degree angle (-Math.PI/4).
          // Moving diagonally with the angle makes a thin line, moving against it makes a thick line!
          ctx.ellipse(
            p.x, p.y, 
            p.size * p.life,         // Radius X (Length of nib)
            (p.size * 0.15) * p.life, // Radius Y (Thickness of nib)
            -Math.PI / 4,            // Fixed 45-degree calligraphy rotation
            0, Math.PI * 2
          );
        }

        ctx.fillStyle = `rgba(${inkColor}, ${p.life * 0.8})`; 
        ctx.fill();
        
        p.life -= 0.035; // How fast the ink fades
      }
      // Clean up fully dried ink
      points = points.filter(p => p.life > 0);

      // 2. Draw the main brush tip
      const isHovering = isHoveringRef.current;
      
      // Smoothly animate the cursor tip size
      const targetSize = isHovering ? 36 : 6;
      smoothHoverSize += (targetSize - smoothHoverSize) * 0.2;

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, smoothHoverSize, 0, Math.PI * 2);
      
      if (isHovering) {
        // When hovering a link, it becomes a hollow ring
        ctx.fillStyle = `rgba(${inkColor}, 0.1)`;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgb(${inkColor})`;
        ctx.stroke();
      } else {
        // When normal, it's a solid paint droplet
        ctx.fillStyle = `rgb(${inkColor})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", checkHover);
      cancelAnimationFrame(animationId);
      document.body.style.cursor = "auto";
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  // Don't render anything on touch devices — no canvas, no overhead
  if (isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      // z-[9999] ensures the paint sits on top of the entire website
      className="fixed inset-0 pointer-events-none z-[9999]"
      // Normal blend mode so the gold paint looks completely real and rich
      style={{ mixBlendMode: "normal" }}
    />
  );
}
