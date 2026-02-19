import { motion } from 'motion/react';
import { useState } from 'react';
import { PixelAura } from '@/app/components/PixelAura';

interface Game {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface GameButtonProps {
  game: Game;
  delay?: number;
  onClick: () => void;
}

export function GameButton({ game, delay = 0, onClick }: GameButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <PixelAura small />}

      <motion.button
        onClick={onClick}
        className="relative z-10 w-full aspect-square bg-black border-4 border-[var(--primary)] rounded-xl flex flex-col items-center justify-center gap-2 md:gap-3 text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)]/10 p-3 md:p-4"
        style={{
          boxShadow: '0 0 15px var(--primary), inset 0 0 15px var(--secondary)',
          minWidth: '100px',
          minHeight: '100px'
        }}
        whileHover={{
          scale: 1.08,
          boxShadow: '0 0 35px var(--primary), inset 0 0 30px var(--secondary)'
        }}
        whileTap={{ scale: 0.92 }}
      >
        <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
          {game.icon}
        </div>
        <span
          className="text-center text-[8px] md:text-xs leading-tight px-1"
          style={{
            fontFamily: "'Press Start 2P', cursive"
          }}
        >
          {game.name}
        </span>
      </motion.button>
    </motion.div>
  );
}