import { motion } from 'motion/react';
import { useState } from 'react';
import { PixelAura } from '@/app/components/PixelAura';

interface PixelButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  delay?: number;
  size?: 'large' | 'normal';
}

export function PixelButton({ onClick, children, delay = 0, size = 'normal' }: PixelButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClass = size === 'large' ? 'w-56 h-56 text-2xl' : 'w-64 h-20 text-xl';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <PixelAura />}
      
      <motion.button
        onClick={onClick}
        className={`relative z-10 ${sizeClass} bg-black border-4 border-[#00ff00] rounded-xl text-[#00ff00] transition-all duration-300 hover:bg-[#00ff00] hover:text-black flex items-center justify-center`}
        style={{
          fontFamily: "'Press Start 2P', cursive",
          boxShadow: '0 0 20px #00ff00, inset 0 0 20px rgba(0, 255, 0, 0.1)'
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 0 40px #00ff00, inset 0 0 30px rgba(0, 255, 0, 0.3)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-center px-4 leading-tight">{children}</span>
      </motion.button>
    </motion.div>
  );
}