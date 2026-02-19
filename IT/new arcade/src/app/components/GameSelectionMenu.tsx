import { motion } from 'motion/react';
import { GameButton } from '@/app/components/GameButton';
import { Worm, X, Square, Grid3x3, Ship, Triangle, Grid2x2, Puzzle, Bomb, Crown, Car, MousePointer, HelpCircle, Rocket, Swords } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const games: Game[] = [
  { id: 'snake', name: 'Змейка', icon: <Worm className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'tictactoe', name: 'Крестики-Нолики', icon: <X className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'tetris', name: 'Тетрис', icon: <Square className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: '2048', name: '2048', icon: <Grid3x3 className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'pong', name: 'Пинг-Понг', icon: <Triangle className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'arkanoid', name: 'Арканоид', icon: <Grid2x2 className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'maze', name: 'Лабиринт', icon: <Puzzle className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'memory', name: 'Память', icon: <Grid2x2 className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'minesweeper', name: 'Сапёр', icon: <Bomb className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'checkers', name: 'Шашки', icon: <Crown className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'racing', name: 'Гонки', icon: <Car className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'clicker', name: 'Кликер', icon: <MousePointer className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'quiz', name: 'Викторина', icon: <HelpCircle className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'platformer', name: 'Платформер', icon: <Rocket className="w-8 h-8 md:w-12 md:h-12" /> },
  { id: 'battleship', name: 'Морской Бой', icon: <Ship className="w-8 h-8 md:w-12 md:h-12" /> },
];

interface GameSelectionMenuProps {
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
}

export function GameSelectionMenu({ onBack, onSelectGame }: GameSelectionMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col items-center justify-start px-4 md:px-8 lg:px-16 py-8 overflow-y-auto"
    >
      <motion.h2
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-xl md:text-2xl lg:text-3xl text-[#00ff00] font-pixel tracking-wider mb-12 text-center px-4"
        style={{
          textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
          fontFamily: "'Press Start 2P', cursive",
          lineHeight: '1.6'
        }}
      >
        Какую игру выберешь?
      </motion.h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl mb-8 px-4">
        {games.map((game, index) => (
          <GameButton
            key={game.id}
            game={game}
            delay={0.3 + index * 0.05}
            onClick={() => onSelectGame(game.id)}
          />
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onBack}
        className="mt-8 px-8 py-4 text-[#00ff00] border-4 border-[#00ff00] rounded-lg transition-all duration-300 hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_20px_#00ff00]"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '12px',
          boxShadow: '0 0 10px #00ff00'
        }}
      >
        НАЗАД
      </motion.button>
    </motion.div>
  );
}