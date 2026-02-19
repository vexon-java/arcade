import { useState, useEffect } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { User, Trophy, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MAZE_SIZE = 15;
const CELL_SIZE = 30; // Increased fixed cell size for better detail

export function MazeGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const generateMaze = () => {
    const newMaze: number[][] = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(1));

    const carve = (x: number, y: number) => {
      newMaze[y][x] = 0;
      const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && newMaze[ny][nx] === 1) {
          newMaze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);
    newMaze[1][1] = 2; // Start
    newMaze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 3; // End

    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    generateMaze();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (won) return;

      let newX = playerPos.x;
      let newY = playerPos.y;

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          newY--;
          break;
        case 'ArrowDown': case 's': case 'S':
          newY++;
          break;
        case 'ArrowLeft': case 'a': case 'A':
          newX--;
          break;
        case 'ArrowRight': case 'd': case 'D':
          newX++;
          break;
        default:
          return;
      }

      if (maze[newY]?.[newX] !== 1) {
        setPlayerPos({ x: newX, y: newY });
        setMoves(moves + 1);

        if (newX === MAZE_SIZE - 2 && newY === MAZE_SIZE - 2) {
          setWon(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, maze, moves, won]);

  return (
    <GameWrapper title="CYBER_EXPLORER" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center w-full max-w-md px-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--primary)]/70 font-mono tracking-widest">MOVES</span>
            <span className="text-2xl font-black text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {moves.toString().padStart(4, '0')}
            </span>
          </div>
          {won && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="px-4 py-2 bg-[var(--primary)] text-black font-black italic rounded skew-x-[-12deg] shadow-[0_0_20px_var(--primary)]"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}
            >
              SUCCESS
            </motion.div>
          )}
        </div>

        <div className="relative p-2 bg-gradient-to-br from-[var(--primary)]/40 to-black rounded-xl shadow-[0_0_40px_rgba(0,255,0,0.2)] overflow-hidden">
          {/* Background Grid Layer */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `linear-gradient(var(--primary) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(90deg, var(--primary) 1px, transparent 1px) 0 0 / 20px 20px` }} />

          <div
            className="relative bg-black/40 backdrop-blur-md overflow-hidden rounded-lg border border-white/10"
            style={{ width: MAZE_SIZE * CELL_SIZE, height: MAZE_SIZE * CELL_SIZE }}
          >
            {/* Vision Mask Overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-30 mix-blend-multiply bg-black"
              style={{
                background: `radial-gradient(circle at ${playerPos.x * CELL_SIZE + CELL_SIZE / 2}px ${playerPos.y * CELL_SIZE + CELL_SIZE / 2}px, transparent 20%, rgba(0,0,0,0.8) 60%, black 100%)`
              }}
            />

            {/* Maze Grid */}
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)` }}>
              {maze.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="relative flex items-center justify-center overflow-hidden transition-all duration-500"
                    style={{
                      backgroundColor: cell === 1 ? 'rgba(var(--primary), 0.05)' : 'transparent',
                    }}
                  >
                    {cell === 1 && (
                      <div className="absolute inset-[2px] border border-[var(--primary)]/30 rounded-sm bg-gradient-to-br from-[var(--primary)]/20 to-transparent">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--primary)]" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--primary)]" />
                      </div>
                    )}

                    {cell === 3 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="relative z-10"
                      >
                        <Trophy className="w-6 h-6 text-yellow-500 arcade-glow-yellow" />
                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                      </motion.div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Player Character */}
            <motion.div
              layout
              className="absolute z-40 flex items-center justify-center p-1"
              initial={false}
              animate={{
                left: playerPos.x * CELL_SIZE,
                top: playerPos.y * CELL_SIZE,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--primary)] blur-md scale-150 opacity-40 animate-pulse" />
                <div className="relative bg-black border-2 border-[var(--primary)] rounded-full p-1 shadow-[0_0_15px_var(--primary)]">
                  <Ghost className="w-4 h-4 text-[var(--primary)]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={generateMaze}
            className="group relative px-10 py-4 bg-black overflow-hidden border-2 border-[var(--primary)] transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-[var(--primary)]/10 translate-y-full hover:translate-y-0 transition-transform duration-300" />
            <span className="relative text-[var(--primary)] font-black italic flex items-center gap-3" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>
              REBOOT_MAZE
            </span>
            <div className="absolute -top-[2px] -right-[2px] w-2 h-2 bg-[var(--primary)]" />
            <div className="absolute -bottom-[2px] -left-[2px] w-2 h-2 bg-[var(--primary)]" />
          </button>

          <div className="text-[10px] text-[var(--primary)]/40 font-mono tracking-[0.3em] uppercase animate-pulse">
            [WASD/ARROWS] Move through digital structure
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
