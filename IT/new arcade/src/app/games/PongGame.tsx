import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

export function PongGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 600;
    const HEIGHT = 400;
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 80;
    const BALL_SIZE = 10;

    let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    let ballX = WIDTH / 2;
    let ballY = HEIGHT / 2;
    let ballVX = 4;
    let ballVY = 4;
    let mouseY = HEIGHT / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseY = e.clientY - rect.top;
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);

    const gameLoop = () => {
      if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw center line
      ctx.strokeStyle = '#00ff00';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update player paddle
      playerY += (mouseY - playerY - PADDLE_HEIGHT / 2) * 0.1;
      playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));

      // Update AI paddle
      const aiTarget = ballY - PADDLE_HEIGHT / 2;
      aiY += (aiTarget - aiY) * 0.08;
      aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));

      // Update ball
      ballX += ballVX;
      ballY += ballVY;

      // Ball collision with top/bottom
      if (ballY <= 0 || ballY >= HEIGHT - BALL_SIZE) {
        ballVY = -ballVY;
      }

      // Ball collision with paddles
      if (ballX <= PADDLE_WIDTH && ballY + BALL_SIZE >= playerY && ballY <= playerY + PADDLE_HEIGHT) {
        ballVX = Math.abs(ballVX) * 1.05;
        const relativeIntersect = (ballY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ballVY = relativeIntersect * 5;
      }

      if (ballX >= WIDTH - PADDLE_WIDTH - BALL_SIZE && ballY + BALL_SIZE >= aiY && ballY <= aiY + PADDLE_HEIGHT) {
        ballVX = -Math.abs(ballVX) * 1.05;
        const relativeIntersect = (ballY - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ballVY = relativeIntersect * 5;
      }

      // Ball out of bounds
      if (ballX < 0) {
        setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        ballX = WIDTH / 2;
        ballY = HEIGHT / 2;
        ballVX = 4;
        ballVY = 4;
      } else if (ballX > WIDTH) {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        ballX = WIDTH / 2;
        ballY = HEIGHT / 2;
        ballVX = -4;
        ballVY = 4;
      }

      // Draw paddles
      ctx.fillStyle = '#00ff00';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff00';
      ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(WIDTH - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPaused]);

  return (
    <GameWrapper title="ПИНГ-ПОНГ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-12 text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>ВЫ: {score.player}</div>
          <div>AI: {score.ai}</div>
        </div>

        {isPaused && (
          <div className="text-lg animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ПАУЗА
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-4 border-[#00ff00]"
          style={{ boxShadow: '0 0 20px #00ff00' }}
        />

        <div className="text-xs text-center" style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: '1.8' }}>
          Двигайте мышью | ПРОБЕЛ - пауза
        </div>
      </div>
    </GameWrapper>
  );
}
