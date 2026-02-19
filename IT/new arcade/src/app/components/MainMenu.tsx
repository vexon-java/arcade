import { motion } from 'motion/react';
import { PixelButton } from '@/app/components/PixelButton';
import { User, Trophy } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onExit: () => void;
  onProfile: () => void;
  onLeaderboard: () => void;
}

export function MainMenu({ onPlay, onExit, onProfile, onLeaderboard }: MainMenuProps) {
  return (
    <div className="relative w-full h-full">
      {/* Кнопка профиля - верхний левый угол */}
      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        onClick={onProfile}
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 md:p-4 bg-black border-3 border-[#00ff00] rounded-xl text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all flex items-center justify-center gap-2 group"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '0.65rem',
          boxShadow: '0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 15px rgba(0, 255, 0, 0.1)',
        }}
      >
        <User className="w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden md:inline">ПРОФИЛЬ</span>
      </motion.button>

      {/* Кнопка лидерборда - верхний правый угол */}
      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        onClick={onLeaderboard}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 md:p-4 bg-black border-3 border-[#00ff00] rounded-xl text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all flex items-center justify-center gap-2 group"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '0.65rem',
          boxShadow: '0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 15px rgba(0, 255, 0, 0.1)',
        }}
      >
        <Trophy className="w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden md:inline">ТОП</span>
      </motion.button>

      {/* Центральное меню */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-8 h-full"
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl text-[#00ff00] font-pixel tracking-wider"
          style={{
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00',
            fontFamily: "'Press Start 2P', cursive"
          }}
        >
          ARCADE
        </motion.h1>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
          className="flex flex-col gap-6 mt-8"
        >
          <PixelButton onClick={onPlay} delay={0.7} size="large">
            ИГРАТЬ
          </PixelButton>
          
          <PixelButton onClick={onExit} delay={0.85} size="large">
            ВЫЙТИ
          </PixelButton>
        </motion.div>
      </motion.div>
    </div>
  );
}