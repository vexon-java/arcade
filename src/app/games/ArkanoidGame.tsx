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

    // Ball state
    let ballX = WIDTH / 2;
    let ballY = HEIGHT - 40;
    let ballDX = 6;
    let ballDY = -6;

    // Paddle state in local scope for loop
    let currentPaddleX = WIDTH / 2 - PADDLE_WIDTH / 2;
    // Mouse tracking
    let targetPaddleX = currentPaddleX;

    const bricks: { x: number; y: number; alive: boolean; color: string }[] = [];
    const colors = ['#ff0000', '#ffaa00', '#ffff00', '#00ff00', '#00f3ff'];

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
      if (gameState.current.gameOver || gameState.current.gameWon || isPaused) {
        // Still draw static frame? Or just return
        if (!isPaused) return; // If paused, we might want to draw a static frame, but for now just stop loop logic
      }

      if (!isPaused && !gameState.current.gameOver && !gameState.current.gameWon) {
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
        if (ballX + ballDX > WIDTH - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
          ballDX = -ballDX;
        }
        if (ballY + ballDY < BALL_RADIUS) {
          ballDY = -ballDY;
        }

        // Paddle collision
        if (
          ballY + BALL_RADIUS > HEIGHT - PADDLE_HEIGHT - 5 && // Close to bottom
          ballY - BALL_RADIUS < HEIGHT && // Not already passed
          ballX > currentPaddleX &&
          ballX < currentPaddleX + PADDLE_WIDTH
        ) {
          // Hit!
          ballDY = -Math.abs(ballDY); // Ensure it goes up

          // English effect
          const hitPoint = ballX - (currentPaddleX + PADDLE_WIDTH / 2);
          ballDX = hitPoint * 0.15;
        }

        // Brick collision
        let hitBrick = false;
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
            hitBrick = true;
            gameState.current.score += 10;
            setScore(gameState.current.score);
          }
        });

        if (hitBrick && bricks.every(b => !b.alive)) {
          gameState.current.gameWon = true;
          setGameWon(true);
          setFlash(true);
          setTimeout(() => setFlash(false), 200);
        }

        // Ball lost
        if (ballY + ballDY > HEIGHT) {
          gameState.current.lives--;
          setLives(gameState.current.lives);

          // Shake effect
          setScreenShake(10);

          if (gameState.current.lives <= 0) {
            gameState.current.gameOver = true;
            setGameOver(true);
            // Big Shake
            setScreenShake(20);
            setFlash(true);
            setTimeout(() => setFlash(false), 200);
          } else {
            // Reset ball
            ballX = WIDTH / 2;
            ballY = HEIGHT - 40;
            ballDX = 6;
            ballDY = -6;
          }
        }
      }

      // Draw

      // Screen Shake
      ctx.save();
      // We need to access the react state for screenShake, but inside the loop closure
      // Ideally we'd use a ref for shake too, but let's try to infer from loop logic or pass it.
      // Since `screenShake` state updates trigger re-renders of the component but this loop is closed over initial values...
      // WAIT. `gameLoop` is defined inside useEffect, so it closes over the initial state.
      // We need `screenShake` in a Ref to be readable here if we want to update it inside/read it inside directly.
      // BUT, we are setting state `setScreenShake` which triggers re-render.
      // The canvas is ref-based.

      // Actually, standard practice for canvas + React loop:
      // Use refs for everything mutable in the loop.

      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // We can't easily read the "current" screenShake state here without a ref.
      // Let's implement shake logic in the loop based on events, or just trust the impact frame.
      // Or move shake completely to CSS on the container? 
      // CSS is easier for the container shake!

      // Draw Bricks
      bricks.forEach(brick => {
        if (brick.alive) {
          ctx.fillStyle = brick.color;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();

          // Inner glow
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT / 2);
        }
      });

      // Draw Paddle
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'var(--primary)';
      ctx.fillStyle = 'var(--primary)';
      ctx.fillRect(currentPaddleX, HEIGHT - PADDLE_HEIGHT - 5, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw Ball
      ctx.shadowColor = 'var(--primary)';
      ctx.fillStyle = 'var(--primary)';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]); // Restart loop if paused state changes? Or just check ref inside. Better to just have empty dep and use refs.
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

        {/* Flash Overlay */}
        <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${flash ? 'opacity-40' : 'opacity-0'}`} />

        {/* HUD */}
        <div className="absolute top-4 left-4 flex gap-8 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[var(--primary)]/70 text-[10px] tracking-widest">SCORE</span>
            <span className="text-[var(--primary)] text-xl font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>{score}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[var(--accent)]/70 text-[10px] tracking-widest">LIVES</span>
            <div className="flex gap-1 text-[var(--accent)]">
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-[var(--accent)] rounded-full shadow-[0_0_5px_currentColor]" />
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
