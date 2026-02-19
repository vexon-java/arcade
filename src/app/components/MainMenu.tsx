import { motion } from 'motion/react';
import { PixelButton } from '@/app/components/PixelButton';
import { User, Trophy, LogOut } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onExit: () => void;
  onProfile: () => void;
  onLeaderboard: () => void;
  nickname: string;
  currentTheme: 'cyan' | 'green' | 'red';
  onThemeChange: (theme: 'cyan' | 'green' | 'red') => void;
}

export function MainMenu({ onPlay, onExit, onProfile, onLeaderboard, nickname, currentTheme, onThemeChange }: MainMenuProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Top Header Controls */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
        <motion.button
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onProfile}
          className="pointer-events-auto p-4 bg-black/80 border-2 border-primary rounded-xl text-primary hover:bg-primary/10 transition-all flex items-center gap-3 shadow-[0_0_15px_var(--primary)] group"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }}
        >
          <User className="w-5 h-5" />
          <span>{nickname.toUpperCase()}</span>
        </motion.button>

        <motion.button
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onLeaderboard}
          className="pointer-events-auto p-4 bg-black/80 border-2 border-[var(--neon-amber)] rounded-xl text-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/10 transition-all flex items-center gap-3 arcade-glow group shadow-[0_0_15px_rgba(255,170,0,0.3)]"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }}
        >
          <Trophy className="w-5 h-5" />
          <span>ЛИДЕРЫ</span>
        </motion.button>
      </div>

      {/* Main Branding */}
      <div className="mb-12 relative text-center">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter italic select-none arcade-text-glitch
            ${currentTheme === 'green' ? 'text-[var(--neon-lime)]' : currentTheme === 'red' ? 'text-[var(--neon-red)]' : 'text-[var(--neon-cyan)]'}`}
          style={{
            fontFamily: "'Press Start 2P', cursive",
            animation: 'glitch 2s infinite'
          }}
        >
          ARCADE
        </motion.h1>
        <motion.div
          animate={{ scaleX: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="absolute -bottom-2 left-0 w-full h-1 bg-primary shadow-[0_0_10px_var(--primary)]"
        />
      </div>

      <style>{`
        @keyframes glitch {
          0% { text-shadow: 2px 0 ${currentTheme === 'green' ? '#00ff00' : currentTheme === 'red' ? '#ff0000' : 'var(--neon-cyan)'}, -2px 0 ${currentTheme === 'green' ? '#008800' : currentTheme === 'red' ? '#880000' : 'var(--neon-magenta)'}; }
          2% { text-shadow: 5px 0 ${currentTheme === 'green' ? '#00ff00' : currentTheme === 'red' ? '#ff0000' : 'var(--neon-cyan)'}, -5px 0 ${currentTheme === 'green' ? '#008800' : currentTheme === 'red' ? '#880000' : 'var(--neon-magenta)'}; }
          4% { text-shadow: -2px 0 ${currentTheme === 'green' ? '#00ff00' : currentTheme === 'red' ? '#ff0000' : 'var(--neon-cyan)'}, 2px 0 ${currentTheme === 'green' ? '#008800' : currentTheme === 'red' ? '#880000' : 'var(--neon-magenta)'}; }
          100% { text-shadow: 2px 0 ${currentTheme === 'green' ? '#00ff00' : currentTheme === 'red' ? '#ff0000' : 'var(--neon-cyan)'}, -2px 0 ${currentTheme === 'green' ? '#008800' : currentTheme === 'red' ? '#880000' : 'var(--neon-magenta)'}; }
        }
      `}</style>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-6"
      >
        <PixelButton onClick={onPlay} size="large" variant="primary" className="arcade-glow">
          ИГРАТЬ
        </PixelButton>

        <PixelButton onClick={onExit} size="large" variant="danger" className="arcade-glow">
          ВЫЙТИ ИЗ ИГРЫ
        </PixelButton>
      </motion.div>

      {/* Theme Selection Buttons - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex gap-3 pointer-events-none">
        {(['cyan', 'green', 'red'] as const).map((t) => (
          <motion.button
            key={t}
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onThemeChange(t)}
            className={`pointer-events-auto size-8 rounded-full border-2 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]
              ${currentTheme === t ? 'border-white scale-110 shadow-[0_0_15px_white]' : 'border-transparent opacity-60 hover:opacity-100'}
            `}
            style={{
              backgroundColor: t === 'cyan' ? '#00f0ff' : t === 'green' ? '#00ff00' : '#ff0000',
              boxShadow: currentTheme === t ? `0 0 20px ${t === 'cyan' ? '#00f0ff' : t === 'green' ? '#00ff00' : '#ff0000'}` : ''
            }}
            title={`Переключить на ${t === 'cyan' ? 'голубую' : t === 'green' ? 'зеленую' : 'красную'} тему`}
          />
        ))}
      </div>

    </div>
  );
}