import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

export function PlatformerGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 600;
    const HEIGHT = 400;
    const PLAYER_SIZE = 30;
    const GRAVITY = 0.5;
    const JUMP_STRENGTH = -12;

    let playerX = 50;
    let playerY = HEIGHT - PLAYER_SIZE - 60;
    let playerVY = 0;
    let isJumping = false;
    let gameScore = 0;

    const platforms = [
      { x: 0, y: HEIGHT - 50, width: WIDTH, height: 50 },
      { x: 150, y: HEIGHT - 150, width: 100, height: 20 },
      { x: 350, y: HEIGHT - 200, width: 100, height: 20 },
      { x: 100, y: HEIGHT - 280, width: 120, height: 20 }
    ];

    const coins: { x: number; y: number; collected: boolean }[] = [
      { x: 180, y: HEIGHT - 200, collected: false },
      { x: 380, y: HEIGHT - 250, collected: false },
      { x: 130, y: HEIGHT - 330, collected: false }
    ];

    let keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ' && !isJumping) {
        playerVY = JUMP_STRENGTH;
        isJumping = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (gameOver) return;

      // Update player
      if (keys['ArrowLeft']) playerX -= 5;
      if (keys['ArrowRight']) playerX += 5;

      playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, playerX));

      playerVY += GRAVITY;
      playerY += playerVY;

      // Check platform collisions
      let onPlatform = false;
      platforms.forEach(platform => {
        if (
          playerX + PLAYER_SIZE > platform.x &&
          playerX < platform.x + platform.width &&
          playerY + PLAYER_SIZE > platform.y &&
          playerY + PLAYER_SIZE < platform.y + platform.height &&
          playerVY > 0
        ) {
          playerY = platform.y - PLAYER_SIZE;
          playerVY = 0;
          isJumping = false;
          onPlatform = true;
        }
      });

      // Check coin collection
      coins.forEach(coin => {
        if (!coin.collected) {
          const dist = Math.sqrt(
            Math.pow(playerX + PLAYER_SIZE / 2 - coin.x, 2) +
            Math.pow(playerY + PLAYER_SIZE / 2 - coin.y, 2)
          );
          if (dist < PLAYER_SIZE) {
            coin.collected = true;
            gameScore += 100;
            setScore(gameScore);
          }
        }
      });

      // Game over if fall
      if (playerY > HEIGHT) {
        setGameOver(true);
      }

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw platforms
      ctx.fillStyle = '#00ff00';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff00';
      platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      });

      // Draw coins
      coins.forEach(coin => {
        if (!coin.collected) {
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#ffff00';
          ctx.shadowColor = '#ffff00';
          ctx.fill();
        }
      });

      // Draw player
      ctx.fillStyle = '#00ff00';
      ctx.shadowColor = '#00ff00';
      ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);

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
    <GameWrapper title="ПЛАТФОРМЕР" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          СЧЁТ: {score}
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-4 border-[#00ff00]"
          style={{ boxShadow: '0 0 20px #00ff00' }}
        />

        {gameOver && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              УПАЛ! СЧЁТ: {score}
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
            >
              ЗАНОВО
            </button>
          </div>
        )}

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          ← → движение | ПРОБЕЛ - прыжок | Собирайте монеты!
        </div>
      </div>
    </GameWrapper>
  );
}
