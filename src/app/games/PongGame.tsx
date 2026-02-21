import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';

export function PongGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const requestRef = useRef<number>(0);

  // Refs for flag synchronization
  const isPausedRef = useRef(false);
  const isReadyRef = useRef(false);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isReadyRef.current = isReady; }, [isReady]);

  const gameState = useRef({
    playerY: 160,
    aiY: 160,
    ballX: 300,
    ballY: 200,
    ballVX: 4,
    ballVY: 4,
    keys: {} as { [key: string]: boolean },
    trail: [] as { x: number, y: number }[],
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number, color: string }[],
    screenShake: 0,
    aiTargetY: 160,
    aiReactionTimer: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 600;
    const HEIGHT = 400;
    const PADDLE_WIDTH = 12;
    const PADDLE_HEIGHT = 80;
    const BALL_SIZE = 10;
    const PADDLE_SPEED = 8;
    const MAX_BALL_SPEED = 12;

    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (!isPausedRef.current && isReadyRef.current) {
        update(WIDTH, HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE, PADDLE_SPEED);
      }
      draw(ctx, WIDTH, HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE);
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    // Start intro sequence
    const introTimer = setTimeout(() => setIsReady(true), 1500);

    const spawnParticles = (x: number, y: number, color: string) => {
      const state = gameState.current;
      for (let i = 0; i < 8; i++) {
        state.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1.0,
          color
        });
      }
    };

    const update = (w: number, h: number, pw: number, ph: number, bs: number, ps: number) => {
      const state = gameState.current;

      // Decay screen shake
      if (state.screenShake > 0) state.screenShake -= 0.5;

      // Update particles
      state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
      });
      state.particles = state.particles.filter(p => p.life > 0);

      // Player Movement
      if (state.keys['KeyW'] || state.keys['ArrowUp']) state.playerY -= ps;
      if (state.keys['KeyS'] || state.keys['ArrowDown']) state.playerY += ps;
      state.playerY = Math.max(10, Math.min(h - ph - 10, state.playerY));

      // Human-like AI Logic
      state.aiReactionTimer--;
      if (state.aiReactionTimer <= 0) {
        state.aiTargetY = state.ballY - ph / 2 + (Math.random() - 0.5) * 40;
        state.aiReactionTimer = 10 + Math.random() * 15;
      }

      const aiMoveSpeed = ps * 0.7;
      if (state.aiY < state.aiTargetY - 5) state.aiY += aiMoveSpeed;
      else if (state.aiY > state.aiTargetY + 5) state.aiY -= aiMoveSpeed;
      state.aiY = Math.max(10, Math.min(h - ph - 10, state.aiY));

      // Ball Physics
      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // Extended Trail
      state.trail.unshift({ x: state.ballX, y: state.ballY });
      if (state.trail.length > 15) state.trail.pop();

      // Wall Collisions
      if (state.ballY <= 10) {
        state.ballY = 10;
        state.ballVY = Math.abs(state.ballVY);
        state.screenShake = 3;
        spawnParticles(state.ballX, state.ballY, '#00ccff');
      } else if (state.ballY >= h - bs - 10) {
        state.ballY = h - bs - 10;
        state.ballVY = -Math.abs(state.ballVY);
        state.screenShake = 3;
        spawnParticles(state.ballX, state.ballY, '#ff3300');
      }

      // Paddle Collisions
      const checkCollision = (paddleX: number, paddleY: number, side: 'left' | 'right') => {
        if (
          state.ballY + bs >= paddleY &&
          state.ballY <= paddleY + ph &&
          ((side === 'left' && state.ballX <= paddleX + pw && state.ballX >= paddleX) ||
            (side === 'right' && state.ballX + bs >= paddleX && state.ballX + bs <= paddleX + pw))
        ) {
          const relativeIntersectY = (paddleY + ph / 2) - (state.ballY + bs / 2);
          const normalized = relativeIntersectY / (ph / 2);
          const bounceAngle = normalized * (Math.PI / 4);

          const speed = Math.min(MAX_BALL_SPEED, Math.sqrt(state.ballVX ** 2 + state.ballVY ** 2) * 1.05);
          state.ballVX = (side === 'left' ? 1 : -1) * Math.cos(bounceAngle) * speed;
          state.ballVY = -Math.sin(bounceAngle) * speed;

          state.ballX = side === 'left' ? paddleX + pw + 1 : paddleX - bs - 1;

          // Collision effects
          state.screenShake = 6;
          spawnParticles(state.ballX, state.ballY + bs / 2, side === 'left' ? '#00ccff' : '#ff3300');
        }
      };

      checkCollision(0, state.playerY, 'left');
      checkCollision(w - pw, state.aiY, 'right');

      // Scoring
      if (state.ballX < -bs * 2) {
        setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        resetBall(w, h, 'player');
      } else if (state.ballX > w + bs * 2) {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        resetBall(w, h, 'ai');
      }
    };

    const resetBall = (w: number, h: number, loser: 'player' | 'ai') => {
      const state = gameState.current;
      state.ballX = w / 2;
      state.ballY = h / 2;
      state.ballVX = loser === 'player' ? 4 : -4;
      state.ballVY = (Math.random() - 0.5) * 6;
      state.trail = [];
      state.screenShake = 10;
    };

    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, pw: number, ph: number, bs: number) => {
      const state = gameState.current;

      ctx.save();
      // Apply screen shake
      if (state.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
      }

      // Background - Slightly lighter
      ctx.fillStyle = '#0a0a20';
      ctx.fillRect(0, 0, w, h);

      // Brighter Grid Lines
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // Glowing Walls
      const drawWall = (y: number, color1: string, color2: string) => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = color1;
        ctx.strokeStyle = color1;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.strokeStyle = color2;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y > h / 2 ? y + 4 : y - 4);
        ctx.lineTo(w, y > h / 2 ? y + 4 : y - 4);
        ctx.stroke();
        ctx.restore();
      };

      drawWall(10, '#00ccff', '#ffffff');
      drawWall(h - 10, '#ff3300', '#ffffff');

      // Center Line - Brighter
      ctx.setLineDash([15, 15]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, 20);
      ctx.lineTo(w / 2, h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball Trail - More vibrant
      state.trail.forEach((pos, i) => {
        const alpha = (1 - i / state.trail.length) * 0.5;
        ctx.fillStyle = i % 2 === 0 ? `rgba(0, 204, 255, ${alpha})` : `rgba(255, 51, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x + bs / 2, pos.y + bs / 2, (bs / 2) * (1 - i / state.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });

      // Collision Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.shadowBlur = p.life * 10;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
      });
      ctx.globalAlpha = 1.0;

      // Neon Glow
      ctx.shadowBlur = 20;

      // Players
      ctx.fillStyle = '#00ccff';
      ctx.shadowColor = '#00ccff';
      ctx.fillRect(5, state.playerY, pw - 5, ph);

      ctx.fillStyle = '#ff3300';
      ctx.shadowColor = '#ff3300';
      ctx.fillRect(w - pw, state.aiY, pw - 5, ph);

      // Ball
      ctx.fillStyle = 'white';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(state.ballX + bs / 2, state.ballY + bs / 2, bs / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();

      if (isPaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff';
        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('TIME FROZEN', w / 2, h / 2);
      }
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearTimeout(introTimer);
    };
  }, [isPausedRef.current, isReadyRef.current]);

  return (
    <GameWrapper title="PONG_ULTRA" onBack={onBack}>
      <div className="flex flex-col items-center gap-8 relative">
        <div className="flex gap-16 text-3xl font-black italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div className="text-[#00ccff] arcade-glow-text">P1: {score.player}</div>
          <div className="text-[#ff3300]" style={{ textShadow: '0 0 10px #ff3300' }}>AI: {score.ai}</div>
        </div>

        <div className="relative p-1 bg-gradient-to-br from-[#00ccff] to-[#ff3300] rounded-2xl arcade-glow overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="rounded-xl bg-black block"
          />

          {/* Ready / Play Overlay */}
          <AnimatePresence>
            {!isReady && (
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
        </div>

        <div className="flex gap-10 text-[10px] text-white/40 font-mono tracking-widest uppercase">
          <span>[W/S] P1_DRIVE</span>
          <span>[SPACE] FREEZE_TIME</span>
        </div>
      </div>
    </GameWrapper>
  );
}
