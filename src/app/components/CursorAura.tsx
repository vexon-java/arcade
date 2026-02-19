import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';

export function CursorAura() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (!cursorRef.current) return;

    // QuickTo for smooth but snappy movement
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power2.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      {/* Simple Green Crosshair - No extra particles or trails */}
      <div className={`relative transition-transform duration-100 ${isClicking ? 'rotate-[-10deg] scale-90' : 'scale-100'}`}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_8px_var(--primary)]"
        >
          {/* Main Arrow Body */}
          <path
            d="M2 2L12 28L17 17L28 12L2 2Z"
            fill="var(--primary)"
            fillOpacity="0.2"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Glow/Accent Detail */}
          <path
            d="M5 5L11 20L14 14L20 11L5 5Z"
            fill="var(--primary)"
            fillOpacity="0.4"
          />
          {/* Dynamic Core */}
          <motion.circle
            cx="5"
            cy="5"
            r="2"
            fill="var(--primary)"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>
      </div>
    </div>
  );
}
