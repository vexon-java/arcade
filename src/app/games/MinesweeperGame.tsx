import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { Flag, Bomb, RotateCcw, ShieldAlert, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 10;
const COLS = 10;
const MINES = 15;

const NEON_COLORS: Record<number, string> = {
  1: '#00f3ff', // Cyan
  2: '#00ff00', // Lime
  3: '#ff0033', // Red
  4: '#ff00ff', // Magenta
  5: '#ff9900', // Amber
  6: '#ffff00', // Yellow
  7: '#ffffff', // White
  8: '#888888', // Gray
};

export function MinesweeperGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [screenShake, setScreenShake] = useState(0);
  const [flash, setFlash] = useState(false);

  const [time, setTime] = useState(0);

  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (newBoard[newRow][newCol].isMine) count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
    setFlagsLeft(MINES);
    setTime(0);
    setScreenShake(0);
    setFlash(false);
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  useEffect(() => {
    let interval: any;
    if (!gameOver && !gameWon && board.length > 0) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameOver, gameWon, board]);

  const triggerExplosion = () => {
    setScreenShake(15);
    setFlash(true);
    setTimeout(() => {
      setScreenShake(0);
      setFlash(false);
    }, 200);
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (newBoard[row][col].isMine) {
      board.forEach((r, rowIdx) => r.forEach((c, colIdx) => {
        if (c.isMine) newBoard[rowIdx][colIdx].isRevealed = true;
      }));
      setBoard(newBoard);
      setGameOver(true);
      triggerExplosion();
      return;
    }

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);
    setBoard(newBoard);

    const allSafeCellsRevealed = newBoard.every((row) =>
      row.every((cell) => cell.isMine || cell.isRevealed)
    );
    if (allSafeCellsRevealed) {
      setGameWon(true);
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || gameWon || board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlagsLeft(prev => prev + (newBoard[row][col].isFlagged ? -1 : 1));
  };

  return (
    <GameWrapper title="NEON_MINES" onBack={onBack}>
      <div className={`flex flex-col items-center gap-6 w-full transition-transform duration-75`}
        style={{ transform: screenShake > 0 ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none' }}>

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-red-600 pointer-events-none z-50 mix-blend-screen"
            />
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center w-full max-w-md px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-start">
            <span className="text-[8px] text-[var(--primary)]/50 font-mono tracking-widest">THREATS_TAGGED</span>
            <div className="flex items-center gap-2 text-xl font-black text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              <Flag className="w-4 h-4 arcade-glow-cyan" /> {flagsLeft.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/30 font-mono tracking-widest uppercase">Uptime</span>
            <div className="text-lg text-white font-mono">{time}s</div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[8px] text-red-500/50 font-mono tracking-widest uppercase">Total_Mines</span>
            <div className="text-xl font-black text-red-500" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {MINES}
            </div>
          </div>
        </div>

        <div className="relative p-2 bg-gradient-to-br from-white/10 to-transparent rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {board.map((row, r) =>
              row.map((cell, c) => (
                <motion.button
                  key={`${r}-${c}`}
                  whileHover={!cell.isRevealed && !gameOver && !gameWon ? { scale: 1.05, backgroundColor: 'rgba(0, 255, 0, 0.1)' } : {}}
                  whileTap={!cell.isRevealed ? { scale: 0.95 } : {}}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(r, c, e)}
                  className={`relative w-10 h-10 flex items-center justify-center text-xs font-black transition-all duration-300
                    ${cell.isRevealed
                      ? 'bg-black/20 shadow-inner'
                      : 'bg-black/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.5)] border border-white/5 rounded-sm overflow-hidden'
                    }`}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    cursor: (gameOver || gameWon || cell.isRevealed) ? 'default' : 'pointer'
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {!cell.isRevealed && cell.isFlagged && (
                      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} key="flag">
                        <Flag className="w-4 h-4 text-[var(--primary)] arcade-glow-magenta" />
                      </motion.div>
                    )}

                    {cell.isRevealed && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key="revealed">
                        {cell.isMine ? (
                          <Bomb className="w-5 h-5 text-red-500 arcade-glow-red" />
                        ) : cell.neighborMines > 0 ? (
                          <span style={{ color: NEON_COLORS[cell.neighborMines], textShadow: `0 0 10px ${NEON_COLORS[cell.neighborMines]}` }}>
                            {cell.neighborMines}
                          </span>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!cell.isRevealed && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                  )}
                </motion.button>
              ))
            )}
          </div>

          <AnimatePresence>
            {(gameOver || gameWon) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                {gameOver ? (
                  <>
                    <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-red-500 mb-2 italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>CRITICAL_FAILURE</h2>
                    <p className="text-xs text-white/50 font-mono mb-8">SYSTEM_BREACHED_BY_ORDNANCE</p>
                  </>
                ) : (
                  <>
                    <Trophy className="w-16 h-16 text-[var(--primary)] mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-[var(--primary)] mb-2 italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>SYSTEM_CLEAR</h2>
                    <p className="text-xs text-white/50 font-mono mb-8">ALL_THREATS_NEUTRALIZED</p>
                  </>
                )}

                <button
                  onClick={initializeBoard}
                  className="group relative px-8 py-3 bg-black flex items-center gap-3 border-2 border-[var(--primary)] transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-[var(--primary)] group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[var(--primary)] font-black text-[10px]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    REBOOT_LOGIC
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-6 text-[8px] text-white/20 font-mono tracking-[0.3em] uppercase">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-white/20 flex items-center justify-center text-[6px]">L</div> Reveal_Neural
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-white/20 flex items-center justify-center text-[6px]">R</div> Tag_Threat
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
