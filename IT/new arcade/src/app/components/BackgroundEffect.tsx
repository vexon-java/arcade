import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function BackgroundEffect() {
  const [pixels, setPixels] = useState<{ id: number; x: number; y: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const pixelCount = 40;
    const newPixels = Array.from({ length: pixelCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3
    }));
    setPixels(newPixels);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(#00ff00 1px, transparent 1px),
            linear-gradient(90deg, #00ff00 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Flickering pixels */}
      {pixels.map((pixel) => (
        <motion.div
          key={pixel.id}
          className="absolute bg-[#00ff00] rounded-sm"
          style={{
            width: '3px',
            height: '3px',
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
            boxShadow: '0 0 8px #00ff00'
          }}
          animate={{
            opacity: [0, 1, 0.3, 1, 0],
            scale: [0.3, 1, 0.5, 1, 0.3]
          }}
          transition={{
            duration: pixel.duration,
            delay: pixel.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Scanline effect */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-[#00ff00] to-transparent opacity-20"
        style={{
          boxShadow: '0 0 20px #00ff00'
        }}
        animate={{
          top: ['-10%', '110%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}