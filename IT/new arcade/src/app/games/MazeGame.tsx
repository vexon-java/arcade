import { useState, useEffect } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { User, Trophy } from 'lucide-react';

const MAZE_SIZE = 15;

export function MazeGame({ onBack }: { onBack: () => void }) {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const generateMaze = () => {
    const newMaze: number[][] = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(1));
    
    // Simple maze generation - create paths
    const carve = (x: number, y: number) => {
      newMaze[y][x] = 0;
      const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && newMaze[ny][nx] === 1) {
          newMaze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };
    
    carve(1, 1);
    newMaze[1][1] = 2; // Start
    newMaze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 3; // End
    
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    generateMaze();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (won) return;

      let newX = playerPos.x;
      let newY = playerPos.y;

      switch (e.key) {
        case 'ArrowUp':
          newY--;
          break;
        case 'ArrowDown':
          newY++;
          break;
        case 'ArrowLeft':
          newX--;
          break;
        case 'ArrowRight':
          newX++;
          break;
        default:
          return;
      }

      if (maze[newY]?.[newX] !== 1) {
        setPlayerPos({ x: newX, y: newY });
        setMoves(moves + 1);

        if (newX === MAZE_SIZE - 2 && newY === MAZE_SIZE - 2) {
          setWon(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, maze, moves, won]);

  return (
    <GameWrapper title="ЛАБИРИНТ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>ХОДОВ: {moves}</div>
          {won && <div className="animate-pulse">ПОБЕДА!</div>}
        </div>

        <div className="border-4 border-[#00ff00] p-2" style={{ boxShadow: '0 0 20px #00ff00' }}>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)` }}>
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="w-6 h-6 flex items-center justify-center"
                  style={{
                    backgroundColor: 
                      cell === 1 ? '#00ff00' : 
                      cell === 2 ? 'rgba(0, 255, 0, 0.3)' :
                      cell === 3 ? 'rgba(255, 215, 0, 0.5)' :
                      'rgba(0, 255, 0, 0.05)',
                    boxShadow: cell === 1 ? '0 0 5px #00ff00' : 'none'
                  }}
                >
                  {x === playerPos.x && y === playerPos.y && (
                    <User className="w-5 h-5 text-[#00ff00]" />
                  )}
                  {x === MAZE_SIZE - 2 && y === MAZE_SIZE - 2 && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={generateMaze}
          className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
        >
          НОВЫЙ ЛАБИРИНТ
        </button>

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → ↑ ↓ управление | Доберитесь до финиша!
        </div>
      </div>
    </GameWrapper>
  );
}
