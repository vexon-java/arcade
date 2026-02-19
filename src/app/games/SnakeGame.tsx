import { useState, useEffect, useRef, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { PixelButton } from '@/app/components/PixelButton';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, RefreshCw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;

export function SnakeGame({ onBack, onGameOver, theme = 'cyan' }: { onBack: () => void; onGameOver?: (score: number, type?: 'victory' | 'defeat') => void; theme?: 'cyan' | 'red' | 'green' }) {
  // Game State
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOverState] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Defeat Effects State
  const [screenShake, setScreenShake] = useState(0);
  const [defeatFlash, setDefeatFlash] = useState(false);

  // Refs for mutable state in game loop
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Position>({ x: 15, y: 15 });
  const directionRef = useRef<Position>({ x: 0, y: -1 }); // Start moving up
  const nextDirectionRef = useRef<Position>({ x: 0, y: -1 });
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const isPausedRef = useRef(false);
  const gameLoopRef = useRef<any>(null);
  const speedRef = useRef(INITIAL_SPEED);

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    let isCollision;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      isCollision = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isCollision);
    return newFood;
  }, []);

  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    setSnake(initialSnake);
    snakeRef.current = initialSnake;

    const initialFood = generateFood(initialSnake);
    setFood(initialFood);
    foodRef.current = initialFood;

    setScore(0);
    scoreRef.current = 0;

    setGameOverState(false);
    gameOverRef.current = false;

    // Reset effects
    setScreenShake(0);
    setDefeatFlash(false);

    setIsPaused(false);
    isPausedRef.current = false;

    directionRef.current = { x: 0, y: -1 };
    nextDirectionRef.current = { x: 0, y: -1 };

    speedRef.current = INITIAL_SPEED;

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(gameLoop, speedRef.current);
  };

  useEffect(() => {
    startGame();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGameOver = () => {
    setGameOverState(true);
    gameOverRef.current = true;

    // Trigger Defeat Effects
    setScreenShake(20);
    setDefeatFlash(true);

    // Auto-clear effects after 1 second
    setTimeout(() => {
      setScreenShake(0);
      setDefeatFlash(false);
    }, 1000);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (onGameOver) {
      onGameOver(scoreRef.current, 'defeat');
    }
  };

  const gameLoop = () => {
    if (gameOverRef.current || isPausedRef.current) return;

    const currentSnake = snakeRef.current;
    const currentHead = currentSnake[0];
    const currentDir = directionRef.current;
    const nextDir = nextDirectionRef.current;

    // Prevent strictly opposite direction turns
    if (nextDir.x !== -currentDir.x || nextDir.y !== -currentDir.y) {
      directionRef.current = nextDir;
    }

    const actualDir = directionRef.current;
    const newHead = { x: currentHead.x + actualDir.x, y: currentHead.y + actualDir.y };

    // Wall Collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      handleGameOver();
      return;
    }

    // Self Collision
    if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      handleGameOver();
      return;
    }

    const newSnake = [newHead, ...currentSnake];

    // Food Collision
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      // Eat food: don't pop tail
      setScore(s => s + 10);
      scoreRef.current += 10;

      const newFood = generateFood(newSnake);
      setFood(newFood);
      foodRef.current = newFood;

      // Increase speed
      const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(scoreRef.current / 50) * 5);
      if (newSpeed !== speedRef.current) {
        speedRef.current = newSpeed;
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(gameLoop, speedRef.current);
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;
  };

  const handleDirectionChange = (newDir: Position) => {
    // Basic check to prevent immediate reversal logic is in game loop, 
    // but here we buffer the input.
    // We also want to prevent multiple rapid keypresses from causing self-collision
    // e.g. currently moving Up, press Left then Down quickly -> Snake moves Down instantly into neck.
    // The buffering in `nextDirectionRef` handles one turn per tick, but if we press two keys in one tick, 
    // the last one wins. This might still allow a "suicide". 
    // A queue would be better but simple single-buffer is okay for now.

    const currentDir = directionRef.current; // The direction currently being executed
    if (newDir.x !== -currentDir.x || newDir.y !== -currentDir.y) {
      nextDirectionRef.current = newDir;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;

      if (e.key === ' ') {
        e.preventDefault();
        const newPaused = !isPausedRef.current;
        setIsPaused(newPaused);
        isPausedRef.current = newPaused;
        return;
      }

      const keyMap: Record<string, Position> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 }
      };

      const newDir = keyMap[e.key];
      if (newDir) {
        handleDirectionChange(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const togglePause = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    isPausedRef.current = newPaused;
  };

  return (
    <GameWrapper title="NEON_COBRA" onBack={onBack}>
      <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">

        {/* Header / Stats */}
        <div className="flex justify-between items-center w-full max-w-md px-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--primary)]/70">SCORE</span>
            <span className="text-2xl font-black text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {score.toString().padStart(5, '0')}
            </span>
          </div>

          <button
            onClick={togglePause}
            className="p-2 border-2 border-[var(--primary)] rounded-full hover:bg-[var(--primary)]/20 transition-colors"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>

        {/* Game Area */}
        <div
          className="relative p-1 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl shadow-[0_0_30px_var(--primary)] transition-transform duration-75"
          style={{
            transform: screenShake > 0 ? `translate(${Math.random() * screenShake - screenShake / 2}px, ${Math.random() * screenShake - screenShake / 2}px)` : 'none'
          }}
        >
          <div
            className="bg-black/90 relative overflow-hidden rounded-lg border-2 border-white/5"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
          >
            {/* Grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ background: `linear-gradient(var(--primary) 1px, transparent 1px) 0 0 / ${CELL_SIZE}px ${CELL_SIZE}px, linear-gradient(90deg, var(--primary) 1px, transparent 1px) 0 0 / ${CELL_SIZE}px ${CELL_SIZE}px` }} />

            {/* Snake */}
            {snake.map((segment, i) => {
              const isHead = i === 0;
              const next = snake[i + 1];

              return (
                <motion.div
                  key={`${segment.x}-${segment.y}-${i}`}
                  className="absolute"
                  style={{
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE + 0.5, // Slight overlap to remove gaps
                    height: CELL_SIZE + 0.5,
                    backgroundColor: i === 0 ? 'var(--primary)' : 'var(--primary)',
                    boxShadow: i === 0 ? '0 0 15px var(--primary)' : 'none',
                    zIndex: 20 - i,
                    borderRadius: isHead ? '2px' : '0px' // Keep head slightly rounded
                  }}
                />
              );
            })}

            {/* Food - Removed scale animation for "instant" feel */}
            <motion.div
              layoutId="food"
              className="absolute bg-[var(--accent)] rounded-full hidden-food-anim"
              style={{
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                boxShadow: '0 0 15px var(--accent)'
              }}
            />

            {/* Defeat Flash Overlay */}
            <AnimatePresence>
              {defeatFlash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-600 mix-blend-overlay z-[60]"
                />
              )}
            </AnimatePresence>

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameOver && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50"
                >
                  <h2 className="text-3xl text-[var(--accent)] font-bold text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>GAME OVER</h2>
                  <div className="text-[var(--primary)] mb-4">SCORE: {score}</div>
                  <PixelButton onClick={startGame} size="normal">RETRY</PixelButton>
                </motion.div>
              )}

              {isPaused && !gameOver && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 z-40"
                >
                  <div className="text-2xl text-[var(--primary)] font-bold tracking-widest">PAUSED</div>
                  <button onClick={togglePause} className="p-4 bg-[var(--primary)]/20 rounded-full border border-[var(--primary)] hover:bg-[var(--primary)]/40 transition-all">
                    <Play size={32} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls - Mobile Friendly D-Pad */}
        <div className="grid grid-cols-3 gap-2 mt-4 select-none touch-manipulation">
          <div />
          <button
            className="w-16 h-16 bg-[var(--primary)]/10 border-2 border-[var(--primary)]/50 rounded-lg flex items-center justify-center active:bg-[var(--primary)]/30 active:scale-95 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleDirectionChange({ x: 0, y: -1 }); }}
          >
            <ChevronUp size={32} />
          </button>
          <div />

          <button
            className="w-16 h-16 bg-[var(--primary)]/10 border-2 border-[var(--primary)]/50 rounded-lg flex items-center justify-center active:bg-[var(--primary)]/30 active:scale-95 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleDirectionChange({ x: -1, y: 0 }); }}
          >
            <ChevronLeft size={32} />
          </button>

          <button
            className="w-16 h-16 bg-[var(--primary)]/10 border-2 border-[var(--primary)]/50 rounded-lg flex items-center justify-center active:bg-[var(--primary)]/30 active:scale-95 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleDirectionChange({ x: 0, y: 1 }); }}
          >
            <ChevronDown size={32} />
          </button>

          <button
            className="w-16 h-16 bg-[var(--primary)]/10 border-2 border-[var(--primary)]/50 rounded-lg flex items-center justify-center active:bg-[var(--primary)]/30 active:scale-95 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleDirectionChange({ x: 1, y: 0 }); }}
          >
            <ChevronRight size={32} />
          </button>
        </div>

        <div className="text-xs text-[var(--primary)]/40 font-mono text-center">
          [WASD / ARROWS] to Move • [SPACE] to Pause
        </div>

      </div>
    </GameWrapper>
  );
}
