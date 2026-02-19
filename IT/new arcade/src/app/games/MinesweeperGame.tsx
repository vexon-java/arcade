import { useState, useEffect } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { Flag, Bomb } from 'lucide-react';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 10;
const COLS = 10;
const MINES = 15;

export function MinesweeperGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsLeft, setFlagsLeft] = useState(MINES);

  const initializeBoard = () => {
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
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
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    
    if (newBoard[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);
    setBoard(newBoard);

    // Check win condition
    const allSafeCellsRevealed = newBoard.every((row, r) =>
      row.every((cell, c) => cell.isMine || cell.isRevealed)
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
    <GameWrapper title="САПЁР" onBack={onBack}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5" /> {flagsLeft}
          </div>
          <div className="flex items-center gap-2">
            <Bomb className="w-5 h-5" /> {MINES}
          </div>
        </div>

        <div className="grid gap-1 p-3 border-4 border-[#00ff00]" 
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            boxShadow: '0 0 20px #00ff00' 
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
                className="w-8 h-8 border-2 border-[#00ff00] flex items-center justify-center text-xs transition-all"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  backgroundColor: cell.isRevealed 
                    ? cell.isMine 
                      ? 'rgba(255, 0, 0, 0.3)' 
                      : 'rgba(0, 255, 0, 0.1)' 
                    : 'rgba(0, 255, 0, 0.05)',
                  boxShadow: cell.isRevealed ? '0 0 5px #00ff00' : 'none'
                }}
              >
                {cell.isFlagged && <Flag className="w-4 h-4 text-[#00ff00]" />}
                {cell.isRevealed && cell.isMine && <Bomb className="w-5 h-5 text-red-500" />}
                {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
                  <span className="text-[#00ff00]">{cell.neighborMines}</span>
                )}
              </button>
            ))
          )}
        </div>

        {gameOver && (
          <div className="text-xl text-red-500" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ВЗРЫВ!
          </div>
        )}

        {gameWon && (
          <div className="text-xl animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ПОБЕДА!
          </div>
        )}

        <button
          onClick={initializeBoard}
          className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
        >
          НОВАЯ ИГРА
        </button>

        <div className="text-[10px] text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ЛКМ - открыть | ПКМ - флаг
        </div>
      </div>
    </GameWrapper>
  );
}
