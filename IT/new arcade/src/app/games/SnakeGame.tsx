import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;

export function SnakeGame({ onBack }: { onBack: () => void }) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        };

        // Check collision with walls
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood());
          setScore(prev => prev + 10);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, food, gameOver, isPaused, generateFood]);

  return (
    <GameWrapper title="ЗМЕЙКА" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>СЧЁТ: {score}</div>
          {isPaused && <div className="animate-pulse">ПАУЗА</div>}
        </div>

        <div
          className="border-4 border-[#00ff00] relative"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            boxShadow: '0 0 20px #00ff00, inset 0 0 20px rgba(0, 255, 0, 0.1)'
          }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-[#00ff00]"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                boxShadow: index === 0 ? '0 0 10px #00ff00' : '0 0 5px #00ff00'
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute bg-[#00ff00] animate-pulse"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              boxShadow: '0 0 15px #00ff00'
            }}
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-4">
              <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                ИГРА ОКОНЧЕНА
              </div>
              <div className="text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                СЧЁТ: {score}
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
              >
                ЗАНОВО
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → ↑ ↓ управление | ПРОБЕЛ - пауза
        </div>
      </div>
    </GameWrapper>
  );
}
