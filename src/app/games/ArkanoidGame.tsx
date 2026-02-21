import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { PixelButton } from '@/app/components/PixelButton';
import { RotateCcw, Home, Play } from 'lucide-react';

export function ArkanoidGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Refs for flag synchronization (avoid stale closures)
  const isPausedRef = useRef(false);
  const isReadyRef = useRef(false);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isReadyRef.current = isReady; }, [isReady]);

  // Visual Effects
  const [screenShake, setScreenShake] = useState(0);
  const [flash, setFlash] = useState(false);

  // Game State Refs (to avoid re-renders impacting loop)
  const gameState = useRef({
    lives: 3,
    score: 0,
    gameOver: false,
    gameWon: false,
    paddleX: 300 - 50, // Center
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 600;
    const HEIGHT = 500;
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 10;
    const BALL_RADIUS = 6;
    const BRICK_ROWS = 5;
    const BRICK_COLS = 8;
    const BRICK_WIDTH = 65;
    const BRICK_HEIGHT = 20;
    const BRICK_PADDING = 8;
    const BRICK_OFFSET_TOP = 40;
    const BRICK_OFFSET_LEFT = 12;

    // Ball state - Slower as requested
    let ballX = WIDTH / 2;
    let ballY = HEIGHT - 40;
    let ballDX = 4;
    let ballDY = -4;

    // Paddle state in local scope for loop
    let currentPaddleX = WIDTH / 2 - PADDLE_WIDTH / 2;
    // Mouse tracking
    let targetPaddleX = currentPaddleX;

    const bricks: { x: number; y: number; alive: boolean; color: string }[] = [];
    const colors = ['#ff3300', '#ff9900', '#ffff00', '#33ff00', '#00ccff'];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          alive: true,
          color: colors[row] || '#ffffff'
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      targetPaddleX = mouseX - PADDLE_WIDTH / 2;
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') targetPaddleX -= 40;
      if (e.code === 'ArrowRight') targetPaddleX += 40;
      if (e.code === 'Escape') setIsPaused(p => !p);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    let animationFrameId: number;

    const gameLoop = () => {
      if (gameState.current.gameOver || gameState.current.gameWon) {
        // Wait
      } else if (!isPausedRef.current && isReadyRef.current) {
        // Update paddle
        // Smooth lerp
        currentPaddleX += (targetPaddleX - currentPaddleX) * 0.2;

        // Clamp
        if (currentPaddleX < 0) currentPaddleX = 0;
        if (currentPaddleX + PADDLE_WIDTH > WIDTH) currentPaddleX = WIDTH - PADDLE_WIDTH;
        gameState.current.paddleX = currentPaddleX;

        // Update ball
        ballX += ballDX;
        ballY += ballDY;

        // Wall collision
        if (ballX + ballDX > WIDTH - BALL_RADIUS - 5 || ballX + ballDX < BALL_RADIUS + 5) {
          ballDX = -ballDX;
        }
        if (ballY + ballDY < BALL_RADIUS + 5) {
          ballDY = -ballDY;
        }

        // Paddle collision
        if (
          ballY + BALL_RADIUS > HEIGHT - PADDLE_HEIGHT - 10 &&
          ballY - BALL_RADIUS < HEIGHT &&
          ballX > currentPaddleX &&
          ballX < currentPaddleX + PADDLE_WIDTH
        ) {
          ballDY = -Math.abs(ballDY);
          const hitPoint = ballX - (currentPaddleX + PADDLE_WIDTH / 2);
          ballDX = hitPoint * 0.15;
          setScreenShake(3);
        }

        // Brick collision
        bricks.forEach(brick => {
          if (!brick.alive) return;
          if (
            ballX > brick.x &&
            ballX < brick.x + BRICK_WIDTH &&
            ballY > brick.y &&
            ballY < brick.y + BRICK_HEIGHT
          ) {
            ballDY = -ballDY;
            brick.alive = false;
            gameState.current.score += 10;
            setScore(gameState.current.score);
            setScreenShake(4);
          }
        });

        if (bricks.every(b => !b.alive)) {
          gameState.current.gameWon = true;
          setGameWon(true);
          setFlash(true);
          setTimeout(() => setFlash(false), 200);
        }

        // Ball lost
        if (ballY + ballDY > HEIGHT) {
          gameState.current.lives--;
          setLives(gameState.current.lives);
          setScreenShake(10);

          if (gameState.current.lives <= 0) {
            gameState.current.gameOver = true;
            setGameOver(true);
            setScreenShake(20);
            setFlash(true);
            setTimeout(() => setFlash(false), 200);
          } else {
            ballX = WIDTH / 2;
            ballY = HEIGHT - 100;
            ballDX = 4;
            ballDY = -4;
          }
        }
      }

      // Draw Sequence
      ctx.fillStyle = '#0a0a20'; // Lighter background
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Brighter Grid
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= WIDTH; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); }
      for (let y = 0; y <= HEIGHT; y += 30) { ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); }
      ctx.stroke();

      // Glowing Borders
      const drawBorder = (x1: number, y1: number, x2: number, y2: number, color: string) => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      };

      const borderColor = '#00ccff';
      drawBorder(2, 0, 2, HEIGHT, borderColor); // Left
      drawBorder(WIDTH - 2, 0, WIDTH - 2, HEIGHT, borderColor); // Right
      drawBorder(0, 2, WIDTH, 2, borderColor); // Top

      // Draw Bricks
      bricks.forEach(brick => {
        if (brick.alive) {
          ctx.save();
          ctx.fillStyle = brick.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 4);
          ctx.fill();

          // Glossy highlight
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, 2);
          ctx.restore();
        }
      });

      // Draw Paddle - High Visibility
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ccff';
      ctx.fillStyle = '#00ccff';
      ctx.beginPath();
      ctx.roundRect(currentPaddleX, HEIGHT - PADDLE_HEIGHT - 15, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
      ctx.fill();
      ctx.restore();

      // Draw Ball - High Visibility
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Intro Sequence
    const introTimer = setTimeout(() => setIsReady(true), 1500);

    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(introTimer);
    };
  }, [isPausedRef.current, isReadyRef.current]);
  // Restart loop if paused state changes? Or just check ref inside. Better to just have empty dep and use refs.
  // Actually, to make start/stop easy, let's keep it simple.

  // Effect to handle screen shake decay
  useEffect(() => {
    if (screenShake > 0) {
      const timer = setTimeout(() => setScreenShake(0), 200 + screenShake * 10);
      return () => clearTimeout(timer);
    }
  }, [screenShake]);

  const resetGame = () => {
    window.location.reload(); // Simple reload to clear all state including refs
  };

  return (
    <GameWrapper title="ARKANOID_PRIME" onBack={onBack}>
      <div
        className={`relative w-full max-w-[600px] aspect-[6/5] bg-black rounded-lg overflow-hidden arcade-glow ring-2 ring-[var(--primary)]/20 ${flash ? 'bg-white mix-blend-screen' : ''}`}
        style={{
          transform: `translate(${Math.random() * screenShake - screenShake / 2}px, ${Math.random() * screenShake - screenShake / 2}px)`
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={500}
          className="w-full h-full block"
        />

        {/* Ready / Play Overlay */}
        <AnimatePresence>
          {!isReady && !gameOver && !gameWon && (
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            >
              <div className="text-center">
                <motion.h1
                  className="text-6xl font-black italic text-white drop-shadow-[0_0_20px_#00ccff] tracking-tighter skew-x-[-15deg]"
                >
                  READY?
                </motion.h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 400 }}
                  className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-2"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash Overlay */}
        <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${flash ? 'opacity-40' : 'opacity-0'}`} />

        {/* HUD */}
        <div className="absolute top-4 left-6 flex gap-12 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[#00ccff]/50 text-[8px] tracking-[0.3em] font-bold">SCORE</span>
            <span className="text-white text-2xl font-black italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '0 0 10px #00ccff' }}>{score}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[#ff3300]/50 text-[8px] tracking-[0.3em] font-bold">LIVES</span>
            <div className="flex gap-2 mt-2">
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-[#ff3300] rounded-sm transform rotate-45 shadow-[0_0_10px_#ff3300]" />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-20"
            >
              <h2 className="text-4xl text-[var(--accent)] font-black italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>GAME OVER</h2>
              <div className="text-[var(--primary)] font-mono mb-4">FINAL SCORE: {score}</div>

              <div className="flex gap-4">
                <PixelButton onClick={resetGame} size="normal" variant="primary">
                  <div className="flex items-center gap-2">RETRY <RotateCcw size={16} /></div>
                </PixelButton>
                <PixelButton onClick={onBack} size="normal" variant="secondary">
                  <div className="flex items-center gap-2">MENU <Home size={16} /></div>
                </PixelButton>
              </div>
            </motion.div>
          )}

          {gameWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-20"
            >
              <h2 className="text-4xl text-[var(--primary)] font-black italic tracking-tighter animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive" }}>MISSION CLEAR</h2>
              <div className="text-[var(--primary)] font-mono mb-4">FINAL SCORE: {score}</div>

              <div className="flex gap-4">
                <PixelButton onClick={resetGame} size="normal" variant="primary">
                  <div className="flex items-center gap-2">PLAY AGAIN <RotateCcw size={16} /></div>
                </PixelButton>
                <PixelButton onClick={onBack} size="normal" variant="secondary">
                  <div className="flex items-center gap-2">MENU <Home size={16} /></div>
                </PixelButton>
              </div>
            </motion.div>
          )}

          {isPaused && !gameOver && !gameWon && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <h2 className="text-3xl text-[var(--accent)] font-black tracking-widest mb-6">PAUSED</h2>
              <div className="flex gap-4">
                <PixelButton onClick={() => setIsPaused(false)} size="normal">RESUME</PixelButton>
                <PixelButton onClick={onBack} size="normal" variant="secondary">MENU</PixelButton>
              </div>
            </div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-2 w-full text-center text-white/10 text-[8px] font-mono tracking-[0.2em] pointer-events-none">
          MOUSE TO AIM • ESC TO PAUSE
        </div>
      </div>
    </GameWrapper>
  );
}
