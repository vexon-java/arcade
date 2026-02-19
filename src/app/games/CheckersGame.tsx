import { useState } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

type PieceType = 'regular' | 'king' | null;
type PieceColor = 'white' | 'black' | null;

interface Piece {
  type: PieceType;
  color: PieceColor;
}

export function CheckersGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [board, setBoard] = useState<Piece[][]>(() => {
    const newBoard: Piece[][] = Array(8).fill(null).map(() =>
      Array(8).fill(null).map(() => ({ type: null, color: null }))
    );

    // Setup black pieces (top 3 rows)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { type: 'regular', color: 'black' };
        }
      }
    }

    // Setup white pieces (bottom 3 rows)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { type: 'regular', color: 'white' };
        }
      }
    }

    return newBoard;
  });

  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [score, setScore] = useState({ white: 0, black: 0 });

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece.type || !piece.color) return false;

    // Target square must be empty
    if (board[toRow][toCol].type !== null) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    // Check if it's a diagonal move
    if (Math.abs(rowDiff) !== colDiff) return false;

    // Regular piece can only move forward
    if (piece.type === 'regular') {
      if (piece.color === 'white' && rowDiff >= 0) return false;
      if (piece.color === 'black' && rowDiff <= 0) return false;
    }

    // Simple move (one square diagonally)
    if (Math.abs(rowDiff) === 1) return true;

    // Jump move (two squares diagonally)
    if (Math.abs(rowDiff) === 2) {
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      const midPiece = board[midRow][midCol];

      // Must jump over opponent's piece
      return midPiece.color !== null && midPiece.color !== piece.color;
    }

    return false;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!selectedSquare) {
      // Select piece
      if (board[row][col].color === currentPlayer) {
        setSelectedSquare([row, col]);
      }
    } else {
      const [selectedRow, selectedCol] = selectedSquare;

      // Deselect if clicking the same square
      if (selectedRow === row && selectedCol === col) {
        setSelectedSquare(null);
        return;
      }

      // Try to move
      if (isValidMove(selectedRow, selectedCol, row, col)) {
        const newBoard = board.map(r => r.map(p => ({ ...p })));
        const piece = newBoard[selectedRow][selectedCol];

        // Check if it's a jump
        const rowDiff = Math.abs(row - selectedRow);
        if (rowDiff === 2) {
          // Remove captured piece
          const midRow = (selectedRow + row) / 2;
          const midCol = (selectedCol + col) / 2;
          const capturedColor = newBoard[midRow][midCol].color;
          newBoard[midRow][midCol] = { type: null, color: null };

          // Update score
          if (capturedColor === 'white') {
            setScore(prev => ({ ...prev, black: prev.black + 1 }));
          } else if (capturedColor === 'black') {
            setScore(prev => ({ ...prev, white: prev.white + 1 }));
          }
        }

        // Move piece
        newBoard[row][col] = piece;
        newBoard[selectedRow][selectedCol] = { type: null, color: null };

        // Check for king promotion
        if (piece.type === 'regular') {
          if ((piece.color === 'white' && row === 0) || (piece.color === 'black' && row === 7)) {
            newBoard[row][col].type = 'king';
          }
        }

        setBoard(newBoard);
        setSelectedSquare(null);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      } else {
        // Invalid move, try to select a different piece
        if (board[row][col].color === currentPlayer) {
          setSelectedSquare([row, col]);
        } else {
          setSelectedSquare(null);
        }
      }
    }
  };

  const resetGame = () => {
    const newBoard: Piece[][] = Array(8).fill(null).map(() =>
      Array(8).fill(null).map(() => ({ type: null, color: null }))
    );

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { type: 'regular', color: 'black' };
        }
      }
    }

    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { type: 'regular', color: 'white' };
        }
      }
    }

    setBoard(newBoard);
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setScore({ white: 0, black: 0 });
  };

  return (
    <GameWrapper title="ШАШКИ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        {/* Score and turn */}
        <div className="flex gap-8 items-center">
          <div className="text-center">
            <div className="text-xs mb-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              БЕЛЫЕ
            </div>
            <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {score.white}
            </div>
          </div>

          <div
            className="text-lg px-4 py-2 border-2 border-[var(--primary)] rounded-lg"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.7rem',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
            }}
          >
            ХОД: {currentPlayer === 'white' ? 'БЕЛЫЕ' : 'ЧЁРНЫЕ'}
          </div>

          <div className="text-center">
            <div className="text-xs mb-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              ЧЁРНЫЕ
            </div>
            <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {score.black}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="border-4 border-[var(--primary)] p-2" style={{ boxShadow: '0 0 20px var(--primary)' }}>
          <div className="grid grid-cols-8 gap-0">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected =
                  selectedSquare &&
                  selectedSquare[0] === rowIndex &&
                  selectedSquare[1] === colIndex;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl border border-[var(--primary)] transition-all relative"
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(0, 255, 0, 0.5)'
                        : isDark
                          ? 'rgba(0, 255, 0, 0.2)'
                          : 'rgba(0, 0, 0, 0.8)',
                      boxShadow: isSelected ? '0 0 15px var(--primary)' : 'none'
                    }}
                  >
                    {piece.type && piece.color && (
                      <div
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: piece.color === 'white'
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(0, 0, 0, 0.9)',
                          border: `3px solid ${piece.color === 'white' ? '#ffffff' : 'var(--primary)'}`,
                          boxShadow: `0 0 10px ${piece.color === 'white' ? '#ffffff' : 'var(--primary)'}`,
                        }}
                      >
                        {piece.type === 'king' && (
                          <span className="text-xl" style={{
                            color: piece.color === 'white' ? '#000' : 'var(--primary)',
                            filter: `drop-shadow(0 0 3px ${piece.color === 'white' ? '#000' : 'var(--primary)'})`
                          }}>
                            ♔
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Instructions and reset */}
        <div className="flex flex-col gap-4 items-center">
          <div className="text-xs text-center max-w-md" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
            Выберите шашку, затем клетку для хода<br />
            Прыгайте через шашки противника<br />
            Дамка появляется на последней линии
          </div>

          <button
            onClick={resetGame}
            className="px-6 py-3 bg-black border-3 border-[var(--primary)] rounded-xl text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all font-bold arcade-glow"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.7rem',
              boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
            }}
          >
            НОВАЯ ИГРА
          </button>
        </div>
      </div>
    </GameWrapper>
  );
}
