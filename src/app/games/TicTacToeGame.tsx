import { useState } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { X, Circle } from 'lucide-react';

type Player = 'X' | 'O' | null;

export function TicTacToeGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'cpu' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (squares: Player[]): { winner: Player | 'draw' | null, line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }

    if (squares.every(square => square !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const { winner } = checkWinner(squares);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares: Player[]): number => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const makeCpuMove = (currentBoard: Player[]) => {
    if (checkWinner(currentBoard).winner) return;

    let moveIndex = -1;

    if (difficulty === 'easy') {
      const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (available.length > 0) {
        moveIndex = available[Math.floor(Math.random() * available.length)];
      }
    } else {
      moveIndex = getBestMove(currentBoard);
    }

    if (moveIndex !== -1) {
      setTimeout(() => {
        handleMove(moveIndex, currentBoard, false);
      }, 500);
    }
  };

  const handleMove = (index: number, currentBoard: Player[], isPlayer: boolean) => {
    const newBoard = [...currentBoard];
    newBoard[index] = isPlayer ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isPlayer); // Toggle turn

    const { winner: gameWinner, line } = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
    } else if (gameMode === 'cpu' && isPlayer) {
      makeCpuMove(newBoard);
    }
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    if (gameMode === 'cpu' && !isXNext) return; // Prevent clicking during CPU turn

    handleMove(index, board, isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setGameMode(null);
  };

  const restartMatch = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  if (!gameMode) {
    return (
      <GameWrapper title="КРЕСТИКИ-НОЛИКИ" onBack={onBack}>
        <div className="flex flex-col items-center gap-6">
          <div className="text-xl text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>ВЫБЕРИТЕ РЕЖИМ</div>
          <button onClick={() => setGameMode('pvp')} className="px-8 py-4 border-2 border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ИГРОК ПРОТИВ ИГРОКА
          </button>
          <div className="flex gap-4">
            <button onClick={() => { setGameMode('cpu'); setDifficulty('easy'); }} className="px-6 py-4 border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              CPU (ЛЕГКО)
            </button>
            <button onClick={() => { setGameMode('cpu'); setDifficulty('hard'); }} className="px-6 py-4 border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              CPU (СЛОЖНО)
            </button>
          </div>
        </div>
      </GameWrapper>
    );
  }

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

        <div className="grid grid-cols-3 gap-3 relative">
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);
            const cellColor = isWinningCell ? (winner === 'X' ? 'var(--primary)' : 'var(--accent)') : 'var(--primary)';

            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner || (gameMode === 'cpu' && !isXNext)}
                className={`w-24 h-24 border-4 flex items-center justify-center transition-all ${isWinningCell ? 'animate-pulse bg-white/10' : 'hover:bg-[var(--primary)]/10'}`}
                style={{
                  borderColor: cellColor,
                  boxShadow: isWinningCell ? `0 0 20px ${cellColor}` : '0 0 10px rgba(0, 255, 0, 0.3)',
                }}
              >
                {cell === 'X' && <X className="w-16 h-16" style={{ color: isWinningCell ? cellColor : 'var(--primary)' }} strokeWidth={4} />}
                {cell === 'O' && <Circle className="w-16 h-16" style={{ color: isWinningCell ? cellColor : 'var(--primary)' }} strokeWidth={4} />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={restartMatch}
            className="px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px', boxShadow: '0 0 10px var(--primary)' }}
          >
            РЕСТАРТ
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-3 border-2 border-white text-white hover:bg-white/10 transition-all"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px', boxShadow: '0 0 10px #ffffff' }}
          >
            МЕНЮ
          </button>
        </div>
      </div>
    </GameWrapper>
  );
}
