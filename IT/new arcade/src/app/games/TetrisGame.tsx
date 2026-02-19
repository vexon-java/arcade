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

export function TetrisGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino>(TETROMINOS[0]);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getRandomPiece = () => TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];

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

  return (
    <GameWrapper title="ТЕТРИС" onBack={onBack}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>СЧЁТ: {score}</div>
          {isPaused && <div className="animate-pulse">ПАУЗА</div>}
        </div>

        <div className="border-4 border-[#00ff00] p-2" style={{ boxShadow: '0 0 20px #00ff00' }}>
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
                    boxShadow: cell ? '0 0 5px #00ff00' : 'none',
                    border: '1px solid rgba(0, 255, 0, 0.2)'
                  }}
                />
              ))
            )}
          </div>
        </div>

        {gameOver && (
          <div className="text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ИГРА ОКОНЧЕНА! СЧЁТ: {score}
          </div>
        )}

        <div className="text-[10px] text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → движение | ↑ поворот | ↓ быстрее | ПРОБЕЛ - пауза
        </div>
      </div>
    </GameWrapper>
  );
}
