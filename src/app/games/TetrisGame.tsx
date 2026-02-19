import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

const ROWS = 20;
const COLS = 10;

type Board = number[][];
type Tetromino = number[][];

const TETROMINOS: Tetromino[] = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]] // J
];

export function TetrisGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [board, setBoard] = useState<Board>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino>(TETROMINOS[0]);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const [shake, setShake] = useState(false);

  const getRandomPiece = () => TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];

  // Particle Loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.5, // Gravity
          life: p.life - 0.05
        }))
        .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  const spawnParticles = (y: number) => {
    const newParticles: { id: number; x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
    for (let x = 0; x < COLS; x++) {
      for (let i = 0; i < 5; i++) { // 5 particles per cell
        newParticles.push({
          id: Math.random(),
          x: x * 24 + 12, // Center of cell (approx)
          y: y * 24 + 12,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          color: 'var(--primary)',
          life: 1.0
        });
      }
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const checkCollision = useCallback((piece: Tetromino, pos: { x: number; y: number }, currentBoard: Board) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && currentBoard[newY][newX]) return true;
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);

    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = value;
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

    setScore(prev => prev + linesCleared * 100);
    setBoard(newBoard);

    const newPiece = getRandomPiece();
    const newPos = { x: 3, y: 0 };

    if (checkCollision(newPiece, newPos, newBoard)) {
      setGameOver(true);
      setShake(true);
    } else {
      setCurrentPiece(newPiece);
      setPosition(newPos);
    }
  }, [board, currentPiece, position, checkCollision]);

  const moveDown = useCallback(() => {
    if (isPaused || gameOver) return;

    const newPos = { ...position, y: position.y + 1 };

    if (checkCollision(currentPiece, newPos, board)) {
      mergePiece();
    } else {
      setPosition(newPos);
    }
  }, [position, currentPiece, board, checkCollision, mergePiece, isPaused, gameOver]);

  useEffect(() => {
    const interval = setInterval(moveDown, 500);
    return () => clearInterval(interval);
  }, [moveDown]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowLeft': {
          const newPos = { ...position, x: position.x - 1 };
          if (!checkCollision(currentPiece, newPos, board)) {
            setPosition(newPos);
          }
          break;
        }
        case 'ArrowRight': {
          const newPos = { ...position, x: position.x + 1 };
          if (!checkCollision(currentPiece, newPos, board)) {
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
          const rotated = currentPiece[0].map((_, i) =>
            currentPiece.map(row => row[i]).reverse()
          );
          if (!checkCollision(rotated, position, board)) {
            setCurrentPiece(rotated);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, position, board, checkCollision, moveDown, gameOver, isPaused]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            displayBoard[boardY][boardX] = 2;
          }
        }
      });
    });

    return displayBoard;
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setScore(0);
    setGameOver(false);
    setShake(false);
    setParticles([]);
    setCurrentPiece(getRandomPiece());
    setPosition({ x: 3, y: 0 });
  };

  return (
    <GameWrapper title="ТЕТРИС" onBack={onBack}>
      <div className={`flex flex-col items-center gap-4 ${shake ? 'animate-shake' : ''}`}>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-5px, 5px); }
            50% { transform: translate(5px, -5px); }
            75% { transform: translate(-5px, -5px); }
          }
          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>

        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>СЧЁТ: {score}</div>
          {isPaused && <div className="animate-pulse">ПАУЗА</div>}
        </div>

        <div className="border-4 border-[var(--primary)] p-2 relative" style={{ boxShadow: '0 0 20px var(--primary)' }}>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {renderBoard().map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="w-6 h-6"
                  style={{
                    backgroundColor: cell === 2
                      ? 'rgba(0, 255, 0, 0.8)'
                      : cell === 1
                        ? 'rgba(0, 255, 0, 0.4)'
                        : 'rgba(0, 255, 0, 0.05)',
                    boxShadow: cell ? '0 0 5px var(--primary)' : 'none',
                    border: '1px solid rgba(0, 255, 0, 0.2)'
                  }}
                />
              ))
            )}
          </div>

          {/* Particles Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map(p => (
              <div
                key={p.id}
                className="absolute w-2 h-2 bg-[var(--primary)]"
                style={{
                  left: p.x,
                  top: p.y,
                  opacity: p.life,
                  transform: `scale(${p.life})`,
                  boxShadow: '0 0 5px var(--primary)'
                }}
              />
            ))}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
              <div className="text-2xl text-[var(--accent)] mb-4 animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '0 0 10px var(--accent)' }}>
                DEFEAT
              </div>
              <div className="text-xl mb-8" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                СЧЁТ: {score}
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-2 border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all font-bold rounded-lg arcade-glow"
                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}
              >
                ЕЩЁ РАЗ
              </button>
            </div>
          )}
        </div>

        <div className="text-[10px] text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → движение | ↑ поворот | ↓ быстрее | ПРОБЕЛ - пауза
        </div>
      </div>
    </GameWrapper>
  );
}
