import { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

export function PongGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const requestRef = useRef<number>(0);

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
      if (!isPaused) {
        update(WIDTH, HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE, PADDLE_SPEED);
      }
      draw(ctx, WIDTH, HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE);
      requestRef.current = requestAnimationFrame(gameLoop);
    };

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
      state.playerY = Math.max(0, Math.min(h - ph, state.playerY));

      // Human-like AI Logic
      state.aiReactionTimer--;
      if (state.aiReactionTimer <= 0) {
        state.aiTargetY = state.ballY - ph / 2 + (Math.random() - 0.5) * 40;
        state.aiReactionTimer = 10 + Math.random() * 15;
      }

      const aiMoveSpeed = ps * 0.7;
      if (state.aiY < state.aiTargetY - 5) state.aiY += aiMoveSpeed;
      else if (state.aiY > state.aiTargetY + 5) state.aiY -= aiMoveSpeed;
      state.aiY = Math.max(0, Math.min(h - ph, state.aiY));

      // Ball Physics
      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // Extended Trail
      state.trail.unshift({ x: state.ballX, y: state.ballY });
      if (state.trail.length > 15) state.trail.pop();

      // Wall Collisions
      if (state.ballY <= 0) {
        state.ballY = 0;
        state.ballVY = Math.abs(state.ballVY);
        state.screenShake = 3;
        spawnParticles(state.ballX, state.ballY, 'var(--primary)');
      } else if (state.ballY >= h - bs) {
        state.ballY = h - bs;
        state.ballVY = -Math.abs(state.ballVY);
        state.screenShake = 3;
        spawnParticles(state.ballX, state.ballY, 'var(--primary)');
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
          spawnParticles(state.ballX, state.ballY + bs / 2, side === 'left' ? 'var(--primary)' : 'var(--accent)');
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

      // Background
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, w, h);

      // CRT Grid Lines
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += 30) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // Center Line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball Trail
      state.trail.forEach((pos, i) => {
        const alpha = (1 - i / state.trail.length) * 0.4;
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x + bs / 2, pos.y + bs / 2, (bs / 2) * (1 - i / state.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });

      // Collision Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 2, 2);
      });
      ctx.globalAlpha = 1.0;

      // Neon Glow
      ctx.shadowBlur = 15;

      // Players
      ctx.fillStyle = 'var(--primary)';
      ctx.shadowColor = 'var(--primary)';
      ctx.fillRect(5, state.playerY, pw - 5, ph);

      ctx.fillStyle = 'var(--accent)';
      ctx.shadowColor = 'var(--accent)';
      ctx.fillRect(w - pw, state.aiY, pw - 5, ph);

      // Ball
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'var(--primary)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(state.ballX + bs / 2, state.ballY + bs / 2, bs / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();

      if (isPaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#00ff00';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', w / 2, h / 2);
      }
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused]);

  return (
    <GameWrapper title="PONG_ULTRA" onBack={onBack}>
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-16 text-3xl font-black italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div className="text-[var(--primary)] arcade-glow-text">P1: {score.player}</div>
          <div className="text-[var(--accent)]" style={{ textShadow: '0 0 10px var(--accent)' }}>AI: {score.ai}</div>
        </div>

        <div className="relative p-1 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl arcade-glow">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="rounded-xl bg-black block"
          />
        </div>

        <div className="flex gap-8 text-[10px] text-[var(--primary)] opacity-60 font-mono tracking-widest uppercase">
          <span>[W/S] P1_DRIVE</span>
          <span>[SPACE] FREEZE_TIME</span>
        </div>
      </div>
    </GameWrapper>
  );
}
