import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

export function ArkanoidGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 600;
    const HEIGHT = 500;
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 10;
    const BALL_RADIUS = 8;
    const BRICK_ROWS = 5;
    const BRICK_COLS = 8;
    const BRICK_WIDTH = 70;
    const BRICK_HEIGHT = 20;

    let paddleX = WIDTH / 2 - PADDLE_WIDTH / 2;
    let ballX = WIDTH / 2;
    let ballY = HEIGHT - 100;
    let ballDX = 4;
    let ballDY = -4;
    let mouseX = WIDTH / 2;

    const bricks: { x: number; y: number; alive: boolean }[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + 5) + 5,
          y: row * (BRICK_HEIGHT + 5) + 30,
          alive: true
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const gameLoop = () => {
      if (gameOver || gameWon) return;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Update paddle
      paddleX += (mouseX - paddleX - PADDLE_WIDTH / 2) * 0.2;
      paddleX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, paddleX));

      // Update ball
      ballX += ballDX;
      ballY += ballDY;

      // Ball collision with walls
      if (ballX - BALL_RADIUS < 0 || ballX + BALL_RADIUS > WIDTH) {
        ballDX = -ballDX;
      }
      if (ballY - BALL_RADIUS < 0) {
        ballDY = -ballDY;
      }

      // Ball collision with paddle
      if (
        ballY + BALL_RADIUS > HEIGHT - PADDLE_HEIGHT &&
        ballX > paddleX &&
        ballX < paddleX + PADDLE_WIDTH
      ) {
        ballDY = -Math.abs(ballDY);
        const relativeIntersect = (ballX - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ballDX = relativeIntersect * 6;
      }

      // Ball out of bounds
      if (ballY > HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          }
          return newLives;
        });
        ballX = WIDTH / 2;
        ballY = HEIGHT - 100;
        ballDX = 4;
        ballDY = -4;
      }

      // Ball collision with bricks
      bricks.forEach(brick => {
        if (!brick.alive) return;

        if (
          ballX + BALL_RADIUS > brick.x &&
          ballX - BALL_RADIUS < brick.x + BRICK_WIDTH &&
          ballY + BALL_RADIUS > brick.y &&
          ballY - BALL_RADIUS < brick.y + BRICK_HEIGHT
        ) {
          ballDY = -ballDY;
          brick.alive = false;
          setScore(prev => prev + 10);
        }
      });

      // Check win condition
      if (bricks.every(b => !b.alive)) {
        setGameWon(true);
      }

      // Draw paddle
      ctx.fillStyle = '#00ff00';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff00';
      ctx.fillRect(paddleX, HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw bricks
      bricks.forEach(brick => {
        if (brick.alive) {
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      });

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameOver, gameWon]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameWon(false);
    setGameOver(false);
    window.location.reload(); // Simple reset
  };

  return (
    <GameWrapper title="АРКАНОИД" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>СЧЁТ: {score}</div>
          <div>ЖИЗНИ: {lives}</div>
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={500}
          className="border-4 border-[#00ff00]"
          style={{ boxShadow: '0 0 20px #00ff00' }}
        />

        {gameWon && (
          <div className="text-xl animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ПОБЕДА! СЧЁТ: {score}
          </div>
        )}

        {gameOver && (
          <div className="text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ИГРА ОКОНЧЕНА
          </div>
        )}

        {(gameWon || gameOver) && (
          <button
            onClick={resetGame}
            className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
          >
            НОВАЯ ИГРА
          </button>
        )}

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          Двигайте мышью
        </div>
      </div>
    </GameWrapper>
  );
}
