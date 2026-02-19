import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

export function RacingGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 400;
    const HEIGHT = 600;
    const CAR_WIDTH = 40;
    const CAR_HEIGHT = 60;

    let playerX = WIDTH / 2 - CAR_WIDTH / 2;
    let playerSpeed = 0;
    const maxSpeed = 8;
    let roadOffset = 0;
    let gameScore = 0;

    const obstacles: { x: number; y: number }[] = [];
    
    const addObstacle = () => {
      obstacles.push({
        x: Math.random() * (WIDTH - CAR_WIDTH),
        y: -CAR_HEIGHT
      });
    };

    let obstacleTimer = 0;
    let keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (gameOver) return;

      // Update player
      if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= 5;
      }
      if (keys['ArrowRight'] && playerX < WIDTH - CAR_WIDTH) {
        playerX += 5;
      }

      // Update road
      roadOffset += 10;
      if (roadOffset > 40) roadOffset = 0;

      // Add obstacles
      obstacleTimer++;
      if (obstacleTimer > 60) {
        addObstacle();
        obstacleTimer = 0;
      }

      // Update obstacles
      obstacles.forEach((obs, index) => {
        obs.y += 8;
        
        // Check collision
        if (
          obs.y + CAR_HEIGHT > HEIGHT - CAR_HEIGHT - 20 &&
          obs.y < HEIGHT - 20 &&
          obs.x + CAR_WIDTH > playerX &&
          obs.x < playerX + CAR_WIDTH
        ) {
          setGameOver(true);
        }

        // Remove off-screen obstacles
        if (obs.y > HEIGHT) {
          obstacles.splice(index, 1);
          gameScore += 10;
          setScore(gameScore);
        }
      });

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw road
      ctx.fillStyle = '#00ff00';
      ctx.globalAlpha = 0.1;
      ctx.fillRect(WIDTH / 3, 0, WIDTH / 3, HEIGHT);
      ctx.globalAlpha = 1;

      // Draw road markings
      ctx.fillStyle = '#00ff00';
      for (let y = -40; y < HEIGHT; y += 40) {
        ctx.fillRect(WIDTH / 2 - 2, y + roadOffset, 4, 20);
      }

      // Draw player car
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff00';
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(playerX, HEIGHT - CAR_HEIGHT - 20, CAR_WIDTH, CAR_HEIGHT);
      
      // Draw obstacles
      obstacles.forEach(obs => {
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.fillRect(obs.x, obs.y, CAR_WIDTH, CAR_HEIGHT);
      });

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    window.location.reload();
  };

  return (
    <GameWrapper title="ГОНКИ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          СЧЁТ: {score}
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className="border-4 border-[#00ff00]"
          style={{ boxShadow: '0 0 20px #00ff00' }}
        />

        {gameOver && (
          <div className="text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            АВАРИЯ! СЧЁТ: {score}
          </div>
        )}

        {gameOver && (
          <button
            onClick={resetGame}
            className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
          >
            ЗАНОВО
          </button>
        )}

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → управление | Уворачивайтесь от препятствий!
        </div>
      </div>
    </GameWrapper>
  );
}
