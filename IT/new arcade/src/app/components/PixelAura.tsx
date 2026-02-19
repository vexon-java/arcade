import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface PixelAuraProps {
  small?: boolean;
}

export function PixelAura({ small = false }: PixelAuraProps) {
  const [pixels, setPixels] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const pixelCount = small ? 8 : 12;
    const newPixels = Array.from({ length: pixelCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 0.5,
      size: Math.random() * (small ? 4 : 8) + (small ? 4 : 6)
    }));
    setPixels(newPixels);
  }, [small]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {pixels.map((pixel) => (
        <motion.div
          key={pixel.id}
          className="absolute bg-[#00ff00] rounded-sm"
          style={{
            width: pixel.size,
            height: pixel.size,
            left: '50%',
            top: '50%',
            boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00'
          }}
          initial={{ 
            x: pixel.x, 
            y: pixel.y,
            opacity: 0
          }}
          animate={{
            x: [pixel.x, pixel.x + 20, pixel.x - 20, pixel.x],
            y: [pixel.y, pixel.y - 20, pixel.y + 20, pixel.y],
            opacity: [0, 1, 0.7, 1, 0.5, 1],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: pixel.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}
