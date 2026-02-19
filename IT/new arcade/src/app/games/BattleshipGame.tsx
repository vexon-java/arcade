import { useState } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

type CellState = 'empty' | 'ship' | 'hit' | 'miss';

const GRID_SIZE = 8;

export function BattleshipGame({ onBack }: { onBack: () => void }) {
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'))
  );
  const [aiBoard, setAiBoard] = useState<CellState[][]>(() => {
    const board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'));
    // Place random ships
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      board[y][x] = 'ship';
    }
    return board;
  });
  const [setupMode, setSetupMode] = useState(true);
  const [shipsPlaced, setShipsPlaced] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [aiHits, setAiHits] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');

  const placeShip = (row: number, col: number) => {
    if (!setupMode || playerBoard[row][col] === 'ship') return;
    if (shipsPlaced >= 5) {
      setSetupMode(false);
      return;
    }

    const newBoard = playerBoard.map(r => [...r]);
    newBoard[row][col] = 'ship';
    setPlayerBoard(newBoard);
    setShipsPlaced(shipsPlaced + 1);

    if (shipsPlaced + 1 >= 5) {
      setSetupMode(false);
    }
  };

  const attack = (row: number, col: number) => {
    if (setupMode || gameOver) return;
    if (aiBoard[row][col] === 'hit' || aiBoard[row][col] === 'miss') return;

    const newBoard = aiBoard.map(r => [...r]);
    if (newBoard[row][col] === 'ship') {
      newBoard[row][col] = 'hit';
      const newHits = playerHits + 1;
      setPlayerHits(newHits);
      
      if (newHits >= 5) {
        setGameOver(true);
        setWinner('Игрок');
      }
    } else {
      newBoard[row][col] = 'miss';
    }
    setAiBoard(newBoard);

    // AI turn
    setTimeout(() => {
      aiAttack();
    }, 500);
  };

  const aiAttack = () => {
    let row, col;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (playerBoard[row][col] === 'hit' || playerBoard[row][col] === 'miss');

    const newBoard = playerBoard.map(r => [...r]);
    if (newBoard[row][col] === 'ship') {
      newBoard[row][col] = 'hit';
      const newHits = aiHits + 1;
      setAiHits(newHits);
      
      if (newHits >= 5) {
        setGameOver(true);
        setWinner('Компьютер');
      }
    } else {
      newBoard[row][col] = 'miss';
    }
    setPlayerBoard(newBoard);
  };

  const resetGame = () => {
    window.location.reload();
  };

  const getCellColor = (cell: CellState, isPlayerBoard: boolean) => {
    switch (cell) {
      case 'ship':
        return isPlayerBoard ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 0, 0.05)';
      case 'hit':
        return 'rgba(255, 0, 0, 0.7)';
      case 'miss':
        return 'rgba(255, 255, 255, 0.3)';
      default:
        return 'rgba(0, 255, 0, 0.05)';
    }
  };

  return (
    <GameWrapper title="МОРСКОЙ БОЙ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        {setupMode ? (
          <div className="text-lg text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
            РАССТАВЬТЕ КОРАБЛИ<br/>({shipsPlaced}/5)
          </div>
        ) : (
          <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            <div>ВЫ: {playerHits}/5</div>
            <div>AI: {aiHits}/5</div>
          </div>
        )}

        <div className="flex gap-8 flex-wrap justify-center">
          {/* Player Board */}
          <div>
            <div className="text-sm mb-2 text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              ВАШ ФЛОТ
            </div>
            <div className="border-4 border-[#00ff00] p-1" style={{ boxShadow: '0 0 20px #00ff00' }}>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {playerBoard.map((row, y) =>
                  row.map((cell, x) => (
                    <button
                      key={`player-${x}-${y}`}
                      onClick={() => setupMode && placeShip(y, x)}
                      className="w-10 h-10 border-2 border-[#00ff00]"
                      style={{
                        backgroundColor: getCellColor(cell, true),
                        cursor: setupMode ? 'pointer' : 'default'
                      }}
                    >
                      {cell === 'hit' && '✕'}
                      {cell === 'miss' && '○'}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Board */}
          {!setupMode && (
            <div>
              <div className="text-sm mb-2 text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                ВРАЖЕСКИЙ ФЛОТ
              </div>
              <div className="border-4 border-[#00ff00] p-1" style={{ boxShadow: '0 0 20px #00ff00' }}>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {aiBoard.map((row, y) =>
                    row.map((cell, x) => (
                      <button
                        key={`ai-${x}-${y}`}
                        onClick={() => attack(y, x)}
                        disabled={gameOver}
                        className="w-10 h-10 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:bg-opacity-20 transition-all"
                        style={{
                          backgroundColor: getCellColor(cell, false),
                          cursor: gameOver ? 'default' : 'pointer'
                        }}
                      >
                        {cell === 'hit' && '✕'}
                        {cell === 'miss' && '○'}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {gameOver && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              ПОБЕДИЛ: {winner}!
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
            >
              НОВАЯ ИГРА
            </button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
