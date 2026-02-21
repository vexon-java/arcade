import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';

const ROWS = 20;
const COLS = 10;

interface Tetromino {
  shape: number[][];
  color: string;
  shadow: string;
}

const TETROMINOS: Tetromino[] = [
  { shape: [[1, 1, 1, 1]], color: '#00ccff', shadow: '#0066ff' }, // I
  { shape: [[1, 1], [1, 1]], color: '#ffff00', shadow: '#aaaa00' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#cc00ff', shadow: '#660099' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#33ff00', shadow: '#009900' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ff3300', shadow: '#990000' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff9900', shadow: '#994400' }, // L
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#3333ff', shadow: '#000099' }  // J
];

export function TetrisGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [board, setBoard] = useState<(string | 0)[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino>(TETROMINOS[0]);
  const [nextPiece, setNextPiece] = useState<Tetromino>(TETROMINOS[1]);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Refs for logic synchronization
  const isPausedRef = useRef(false);
  const isReadyRef = useRef(false);
  const gameOverRef = useRef(false);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isReadyRef.current = isReady; }, [isReady]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const [shake, setShake] = useState(false);

  const getRandomPiece = () => TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];

  // Ghost Piece Logic
  const getGhostPosition = useCallback(() => {
    let ghostY = position.y;
    while (!checkCollision(currentPiece.shape, { x: position.x, y: ghostY + 1 }, board)) {
      ghostY++;
    }
    return { x: position.x, y: ghostY };
  }, [position, currentPiece, board]);

  // Particle Loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3,
          life: p.life - 0.03
        }))
        .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  const spawnParticles = (y: number, color: string = 'var(--primary)') => {
    const newParticles: { id: number; x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        for (let i = 0; i < 6; i++) {
          newParticles.push({
            id: Math.random(),
            x: x * 24 + 12,
            y: y * 24 + 12,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 3,
            color: board[y][x] as string,
            life: 1.0
          });
        }
      }
    }
    setParticles(prev => [...prev.slice(-50), ...newParticles]); // Cap particles
  };

  const checkCollision = useCallback((shape: number[][], pos: { x: number; y: number }, currentBoard: (string | 0)[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && currentBoard[newY][newX] !== 0) return true;
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);

    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });

    // Clear full rows
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        spawnParticles(y);
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + (linesCleared === 4 ? 800 : linesCleared * 100));
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
      setShake(true);
      setTimeout(() => setShake(false), 200);
    }

    setBoard(newBoard);
    setCurrentPiece(nextPiece);
    setNextPiece(getRandomPiece());
    const newPos = { x: 3, y: 0 };

    if (checkCollision(nextPiece.shape, newPos, newBoard)) {
      setGameOver(true);
    } else {
      setPosition(newPos);
    }
  }, [board, currentPiece, position, nextPiece, checkCollision, lines]);

  const moveDown = useCallback(() => {
    if (isPausedRef.current || gameOverRef.current || !isReadyRef.current) return;

    const newPos = { ...position, y: position.y + 1 };

    if (checkCollision(currentPiece.shape, newPos, board)) {
      mergePiece();
    } else {
      setPosition(newPos);
    }
  }, [position, currentPiece, board, checkCollision, mergePiece]);

  useEffect(() => {
    const dropSpeed = Math.max(100, 700 - (level - 1) * 80);
    const interval = setInterval(moveDown, dropSpeed);
    return () => clearInterval(interval);
  }, [moveDown, level]);

  useEffect(() => {
    // Intro Sequence
    const introTimer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (isPausedRef.current || !isReadyRef.current) return;

      switch (e.key) {
        case 'ArrowLeft': {
          const newPos = { ...position, x: position.x - 1 };
          if (!checkCollision(currentPiece.shape, newPos, board)) {
            setPosition(newPos);
          }
          break;
        }
        case 'ArrowRight': {
          const newPos = { ...position, x: position.x + 1 };
          if (!checkCollision(currentPiece.shape, newPos, board)) {
            setPosition(newPos);
          }
          break;
        }
        case 'ArrowDown': {
          moveDown();
          break;
        }
        case 'ArrowUp': {
          // Rotate
          const rotated = currentPiece.shape[0].map((_, i) =>
            currentPiece.shape.map(row => row[i]).reverse()
          );
          if (!checkCollision(rotated, position, board)) {
            setCurrentPiece({ ...currentPiece, shape: rotated });
          }
          break;
        }
        case 'Control': {
          // Hard drop
          let ghostY = position.y;
          while (!checkCollision(currentPiece.shape, { x: position.x, y: ghostY + 1 }, board)) {
            ghostY++;
          }
          setPosition({ ...position, y: ghostY });
          // Force merge is handled in next moveDown or we can call it
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, position, board, checkCollision, moveDown]);

  const renderBlock = (color: string | 0, isGhost: boolean = false) => {
    if (!color) return <div className="w-6 h-6 bg-white/[0.03] border-[0.5px] border-white/5" />;

    return (
      <div
        className="w-6 h-6 border-[1.5px] relative overflow-hidden"
        style={{
          backgroundColor: isGhost ? 'transparent' : `${color}44`,
          borderColor: isGhost ? `${color}44` : color,
          boxShadow: isGhost ? 'none' : `inset 0 0 8px ${color}66, 0 0 10px ${color}33`,
        }}
      >
        {!isGhost && (
          <>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30" />
            <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-white/30" />
          </>
        )}
      </div>
    );
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setShake(false);
    setParticles([]);
    setIsReady(false);
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setPosition({ x: 3, y: 0 });
    setTimeout(() => setIsReady(true), 1500);
  };

  return (
    <GameWrapper title="CYBER_TETRIS" onBack={onBack}>
      <div className={`flex items-start gap-8 ${shake ? 'animate-shake' : ''}`}>

        {/* Left Side Info */}
        <div className="flex flex-col gap-6 w-32">
          <div className="bg-black/40 border-2 border-[var(--primary)]/30 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-[8px] text-[var(--primary)]/60 mb-2 font-mono uppercase tracking-widest">Score</div>
            <div className="text-lg font-black italic text-[var(--primary)]" style={{ fontFamily: 'monospace' }}>{score.toString().padStart(6, '0')}</div>
          </div>
          <div className="bg-black/40 border-2 border-[var(--primary)]/30 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-[8px] text-[var(--primary)]/60 mb-2 font-mono uppercase tracking-widest">Level</div>
            <div className="text-xl font-black italic text-white" style={{ fontFamily: 'monospace' }}>{level}</div>
          </div>
          <div className="bg-black/40 border-2 border-[var(--primary)]/30 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-[8px] text-[var(--primary)]/60 mb-2 font-mono uppercase tracking-widest">Lines</div>
            <div className="text-xl font-black italic text-white" style={{ fontFamily: 'monospace' }}>{lines}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative border-4 border-[var(--primary)] p-1.5 bg-black/60 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(0,204,255,0.2)]">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {board.map((row, y) =>
              row.map((cell, x) => {
                let color = cell;
                let isGhost = false;

                // Render Current Piece
                currentPiece.shape.forEach((pRow, pY) => {
                  pRow.forEach((pValue, pX) => {
                    if (pValue && position.y + pY === y && position.x + pX === x) {
                      color = currentPiece.color;
                    }
                  });
                });

                // Render Ghost Piece
                if (!color) {
                  const ghost = getGhostPosition();
                  currentPiece.shape.forEach((pRow, pY) => {
                    pRow.forEach((pValue, pX) => {
                      if (pValue && ghost.y + pY === y && ghost.x + pX === x) {
                        color = currentPiece.color;
                        isGhost = true;
                      }
                    });
                  });
                }

                return <div key={`${x}-${y}`}>{renderBlock(color, isGhost)}</div>;
              })
            )}
          </div>

          {/* Particles Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  className="absolute w-2 h-2"
                  style={{
                    left: p.x,
                    top: p.y,
                    backgroundColor: p.color,
                    boxShadow: `0 0 8px ${p.color}`,
                    borderRadius: '50%'
                  }}
                  animate={{ x: p.x + p.vx * 10, y: p.y + p.vy * 10, opacity: 0, scale: 0 }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Ready / Play Overlay */}
          <AnimatePresence>
            {!isReady && !gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="text-center">
                  <motion.h1 className="text-4xl font-black italic text-white drop-shadow-[0_0_20px_#00ccff] tracking-tighter">READY?</motion.h1>
                  <div className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-2 w-32" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-40"
            >
              <div className="text-3xl font-black text-[#ff3300] mb-2 italic tracking-tighter shadow-sm">DEFEAT</div>
              <div className="text-white/60 font-mono text-[10px] mb-8 uppercase tracking-widest">Simulation Terminated</div>
              <button
                onClick={resetGame}
                className="px-8 py-3 border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all font-black italic text-xs tracking-widest rounded-sm arcade-glow uppercase"
              >
                Retry
              </button>
            </motion.div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="text-2xl font-black italic text-[var(--primary)] animate-pulse tracking-widest">PAUSED</div>
            </div>
          )}
        </div>

        {/* Right Side - Next Piece */}
        <div className="flex flex-col gap-8">
          <div className="bg-black/40 border-2 border-[var(--primary)]/30 p-4 rounded-lg backdrop-blur-sm min-w-[120px]">
            <div className="text-[10px] text-[var(--primary)]/60 mb-4 font-mono uppercase tracking-[0.2em] font-bold">NEXT</div>
            <div className="flex flex-col gap-0.5 items-center">
              {nextPiece.shape.map((row, y) => (
                <div key={y} className="flex gap-0.5">
                  {row.map((cell, x) => (
                    <div key={x} className="w-5 h-5">
                      {cell ? renderBlock(nextPiece.color) : <div className="w-5 h-5 bg-white/5 border border-white/5" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[8px] text-white/30 font-mono uppercase leading-relaxed tracking-widest">
            [← →] MOVE<br />
            [↑] ROTATE<br />
            [↓] DROP<br />
            [SPACE] PAUSE
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px); }
          50% { transform: translate(4px, -4px); }
          75% { transform: translate(-4px, -4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </GameWrapper>
  );
}
