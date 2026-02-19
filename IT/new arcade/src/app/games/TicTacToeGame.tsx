import { useState } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { X, Circle } from 'lucide-react';

type Player = 'X' | 'O' | null;

export function TicTacToeGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);

  const checkWinner = (squares: Player[]): Player | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every(square => square !== null)) {
      return 'draw';
    }

    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <GameWrapper title="КРЕСТИКИ-НОЛИКИ" onBack={onBack}>
      <div className="flex flex-col items-center gap-8">
        <div className="text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          {winner 
            ? winner === 'draw' 
              ? 'НИЧЬЯ!' 
              : `ПОБЕДИЛ ${winner}!`
            : `ХОД: ${isXNext ? 'X' : 'O'}`
          }
        </div>

        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="w-24 h-24 border-4 border-[#00ff00] flex items-center justify-center hover:bg-[#00ff00] hover:bg-opacity-20 transition-all"
              style={{
                boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
                backgroundColor: cell ? 'rgba(0, 255, 0, 0.1)' : 'transparent'
              }}
            >
              {cell === 'X' && <X className="w-16 h-16 text-[#00ff00]" strokeWidth={4} />}
              {cell === 'O' && <Circle className="w-16 h-16 text-[#00ff00]" strokeWidth={4} />}
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
        >
          НОВАЯ ИГРА
        </button>
      </div>
    </GameWrapper>
  );
}
