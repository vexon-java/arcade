import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

type Board = number[][];

export function Game2048({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeBoard = useCallback(() => {
    const newBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(initializeBoard());
  }, [initializeBoard]);

  const addRandomTile = (currentBoard: Board) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveLeft = (currentBoard: Board): [Board, number] => {
    let points = 0;
    const newBoard = currentBoard.map(row => {
      const filtered = row.filter(cell => cell !== 0);
      const merged: number[] = [];
      
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          points += filtered[i] * 2;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      
      while (merged.length < 4) {
        merged.push(0);
      }
      
      return merged;
    });
    return [newBoard, points];
  };

  const rotateBoard = (currentBoard: Board): Board => {
    return currentBoard[0].map((_, colIndex) =>
      currentBoard.map(row => row[colIndex]).reverse()
    );
  };

  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;

    let workingBoard = board.map(row => [...row]);
    let rotations = 0;

    switch (direction) {
      case 'right':
        rotations = 2;
        break;
      case 'up':
        rotations = 3;
        break;
      case 'down':
        rotations = 1;
        break;
    }

    for (let i = 0; i < rotations; i++) {
      workingBoard = rotateBoard(workingBoard);
    }

    const [movedBoard, points] = moveLeft(workingBoard);

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      workingBoard = rotateBoard(movedBoard);
    }

    const boardChanged = JSON.stringify(board) !== JSON.stringify(workingBoard);
    
    if (boardChanged) {
      addRandomTile(workingBoard);
      setBoard(workingBoard);
      setScore(prev => prev + points);
      
      if (isGameOver(workingBoard)) {
        setGameOver(true);
      }
    }
  };

  const isGameOver = (currentBoard: Board): boolean => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) return false;
        if (j < 3 && currentBoard[i][j] === currentBoard[i][j + 1]) return false;
        if (i < 3 && currentBoard[i][j] === currentBoard[i + 1][j]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          move('left');
          break;
        case 'ArrowRight':
          move('right');
          break;
        case 'ArrowUp':
          move('up');
          break;
        case 'ArrowDown':
          move('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
  };

  const getTileColor = (value: number) => {
    const opacity = Math.min(Math.log2(value) / 11, 1);
    return `rgba(0, 255, 0, ${opacity * 0.8})`;
  };

  return (
    <GameWrapper title="2048" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          СЧЁТ: {score}
        </div>

        <div className="grid grid-cols-4 gap-3 p-4 border-4 border-[#00ff00]" style={{ boxShadow: '0 0 20px #00ff00' }}>
          {board.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className="w-20 h-20 border-2 border-[#00ff00] flex items-center justify-center text-2xl transition-all duration-200"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  backgroundColor: cell ? getTileColor(cell) : 'rgba(0, 255, 0, 0.05)',
                  boxShadow: cell ? '0 0 15px rgba(0, 255, 0, 0.5)' : 'none'
                }}
              >
                {cell !== 0 && cell}
              </div>
            ))
          )}
        </div>

        {gameOver && (
          <div className="text-xl text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ИГРА ОКОНЧЕНА!
          </div>
        )}

        <button
          onClick={resetGame}
          className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
        >
          НОВАЯ ИГРА
        </button>

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → ↑ ↓ управление
        </div>
      </div>
    </GameWrapper>
  );
}
