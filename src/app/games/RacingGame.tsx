import { useState, useEffect, useRef, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ShieldAlert, Zap } from 'lucide-react';

export function RacingGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [flash, setFlash] = useState(false);

  const requestRef = useRef<number>(0);
  const gameStateRef = useRef({
    playerX: 300,
    playerTargetX: 300,
    currentLane: 1, // 0, 1, 2, 3
    roadOffset: 0,
    speed: 5,
    obstacles: [] as { x: number, y: number, color: string, lane: number }[],
    particles: [] as { x: number, y: number, length: number, speed: number }[],
    obstacleTimer: 0,
    gameScore: 0,
    keys: {} as Record<string, boolean>
  });

  const getLaneX = (lane: number, y: number, width: number, height: number) => {
    // Road perspective math: top width 120, bottom width 480
    const topW = 120;
    const bottomW = 480;
    const progress = y / height;
    const currentRoadW = topW + (bottomW - topW) * progress;
    const currentRoadX = (width - currentRoadW) / 2;
    const laneW = currentRoadW / 4;
    return currentRoadX + (lane + 0.5) * laneW - 22.5; // - CAR_WIDTH/2
  };

  const initializeGame = useCallback(() => {
    gameStateRef.current = {
      playerX: 300,
      playerTargetX: 300,
      currentLane: 1,
      roadOffset: 0,
      speed: 5,
      obstacles: [],
      particles: Array.from({ length: 30 }, () => ({
        x: Math.random() * 600,
        y: Math.random() * 600,
        length: Math.random() * 40 + 20,
        speed: Math.random() * 15 + 10
      })),
      obstacleTimer: 0,
      gameScore: 0,
      keys: {}
    };
    setScore(0);
    setGameOver(false);
    setScreenShake(0);
    setFlash(false);
  }, []);

  useEffect(() => {
    initializeGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      state.keys[e.key] = true;
      if (e.key === 'ArrowLeft' && state.currentLane > 0) {
        state.currentLane--;
      } else if (e.key === 'ArrowRight' && state.currentLane < 3) {
        state.currentLane++;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { gameStateRef.current.keys[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [initializeGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const CAR_WIDTH = 45;
    const CAR_HEIGHT = 70;

    const drawCar = (x: number, y: number, color: string, isPlayer: boolean) => {
      ctx.save();
      ctx.translate(x + CAR_WIDTH / 2, y + CAR_HEIGHT / 2);

      // Perspective scaling
      const scale = 0.5 + (y / HEIGHT) * 0.5;
      ctx.scale(scale, scale);

      // Shadow/Glow
      ctx.shadowBlur = isPlayer ? 20 : 10;
      ctx.shadowColor = color;

      // Base body
      ctx.fillStyle = isPlayer ? '#111' : '#222';
      ctx.beginPath();
      ctx.moveTo(-CAR_WIDTH / 2 + 5, -CAR_HEIGHT / 2);
      ctx.lineTo(CAR_WIDTH / 2 - 5, -CAR_HEIGHT / 2);
      ctx.lineTo(CAR_WIDTH / 2, -CAR_HEIGHT / 2 + 20);
      ctx.lineTo(CAR_WIDTH / 2, CAR_HEIGHT / 2);
      ctx.lineTo(-CAR_WIDTH / 2, CAR_HEIGHT / 2);
      ctx.lineTo(-CAR_WIDTH / 2, -CAR_HEIGHT / 2 + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Windshield
      ctx.fillStyle = isPlayer ? 'rgba(0, 243, 255, 0.4)' : 'rgba(255, 0, 51, 0.4)';
      ctx.fillRect(-CAR_WIDTH / 2 + 8, -CAR_HEIGHT / 2 + 15, CAR_WIDTH - 16, 12);

      // Lights
      if (isPlayer) {
        ctx.fillStyle = 'var(--primary)';
        ctx.fillRect(-CAR_WIDTH / 2 + 5, -CAR_HEIGHT / 2 + 2, 8, 4);
        ctx.fillRect(CAR_WIDTH / 2 - 13, -CAR_HEIGHT / 2 + 2, 8, 4);
      } else {
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(-CAR_WIDTH / 2 + 5, CAR_HEIGHT / 2 - 6, 8, 4);
        ctx.fillRect(CAR_WIDTH / 2 - 13, CAR_HEIGHT / 2 - 6, 8, 4);
      }

      ctx.restore();
    };

    const update = () => {
      const state = gameStateRef.current;

      // Smooth lane movement
      state.playerTargetX = getLaneX(state.currentLane, HEIGHT - 130, WIDTH, HEIGHT);
      state.playerX += (state.playerTargetX - state.playerX) * 0.15;

      // Accelerate
      state.speed = Math.min(15, state.speed + 0.001);
      state.roadOffset = (state.roadOffset + state.speed) % 100;

      // Obstacles
      state.obstacleTimer++;
      if (state.obstacleTimer > Math.max(20, 50 - Math.floor(state.speed * 1.5))) {
        const lane = Math.floor(Math.random() * 4);
        state.obstacles.push({
          lane: lane,
          x: getLaneX(lane, -CAR_HEIGHT, WIDTH, HEIGHT),
          y: -CAR_HEIGHT - 100,
          color: '#ff0033'
        });
        state.obstacleTimer = 0;
      }

      state.obstacles = state.obstacles.filter(obs => {
        obs.y += state.speed + 2;
        obs.x = getLaneX(obs.lane, obs.y, WIDTH, HEIGHT);

        // Dynamic Scaling Collision Detection
        const scale = 0.5 + (obs.y / HEIGHT) * 0.5;
        const hitboxW = CAR_WIDTH * scale;
        const hitboxH = CAR_HEIGHT * scale;
        const playerScale = 0.5 + ((HEIGHT - 130) / HEIGHT) * 0.5;
        const playerHitboxW = CAR_WIDTH * playerScale;

        const hitX = obs.x < state.playerX + playerHitboxW - 5 && obs.x + hitboxW > state.playerX + 5;
        const hitY = obs.y < HEIGHT - 60 + CAR_HEIGHT && obs.y + hitboxH > HEIGHT - 130;

        if (hitX && hitY) {
          setGameOver(true);
          setScreenShake(20);
          setFlash(true);
        }

        if (obs.y > HEIGHT) {
          state.gameScore += 10;
          setScore(state.gameScore);
          return false;
        }
        return true;
      });

      // Particles
      state.particles.forEach(p => {
        p.y += p.speed + state.speed;
        if (p.y > HEIGHT) {
          p.y = -100;
          p.x = Math.random() * WIDTH;
        }
      });

      draw();
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      const state = gameStateRef.current;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Background Grid
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = 'var(--primary)11';
      ctx.lineWidth = 1;
      for (let x = 0; x <= WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }

      // Road Perspective
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2 - 60, 0);
      ctx.lineTo(WIDTH / 2 + 60, 0);
      ctx.lineTo(WIDTH - 60, HEIGHT);
      ctx.lineTo(60, HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Road Borders
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'var(--primary)';
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2 - 60, 0);
      ctx.lineTo(60, HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2 + 60, 0);
      ctx.lineTo(WIDTH - 60, HEIGHT);
      ctx.stroke();

      // Lane Dividers
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach(p => {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2 - 60 + p * 120, 0);
        ctx.lineTo(60 + p * 480, HEIGHT);
        ctx.stroke();
      });

      // Center Dotted Lines
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -state.roadOffset * 2;
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed Particles
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
      ctx.lineWidth = 1;
      state.particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.length);
        ctx.stroke();
      });

      // Draw Obstacles
      state.obstacles.forEach(obs => {
        drawCar(obs.x, obs.y, obs.color, false);
      });

      // Draw Player
      drawCar(state.playerX, HEIGHT - CAR_HEIGHT - 60, 'var(--primary)', true);
    };

    update();
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver]);

  return (
    <GameWrapper title="CYBER_RACER" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto overflow-hidden">

        {/* HUD */}
        <div className="flex justify-between items-center w-full max-w-3xl px-8 py-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--primary)] font-mono tracking-widest uppercase opacity-50">Score_Output</span>
            <div className="text-3xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {score.toString().padStart(4, '0')}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Zap className="w-5 h-5 text-[var(--primary)] animate-pulse" />
            <div className="text-[12px] font-mono text-[var(--primary)] mt-1">LANE_ASSIST: ON</div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">System_Load</span>
            <div className="text-3xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {(Math.floor(score / 10) + 12).toString()}%
            </div>
          </div>
        </div>

        {/* CANVAS CONTAINER WITH SHAKE */}
        <motion.div
          animate={{ x: (Math.random() - 0.5) * screenShake, y: (Math.random() - 0.5) * screenShake }}
          className="relative p-2 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="rounded-lg ring-1 ring-white/10"
          />

          {/* FLASH EFFECT */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-600 mix-blend-screen pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* GAME OVER OVERLAY */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ backdropFilter: 'blur(10px)' }}
                className="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-center p-8 text-center"
              >
                <ShieldAlert className="w-20 h-20 text-red-500 mb-6 animate-bounce" />
                <h2 className="text-3xl font-black text-red-500 mb-2 italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>CRITICAL_COLLISION</h2>
                <p className="text-xs text-white/50 font-mono mb-8 uppercase tracking-[0.4em]">Hull_Integrity_Zero</p>

                <button
                  onClick={initializeGame}
                  className="group relative px-10 py-4 bg-black border-2 border-[var(--primary)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_var(--primary)]"
                >
                  <RotateCcw className="w-5 h-5 text-[var(--primary)] group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[var(--primary)] font-black text-xs" style={{ fontFamily: "'Press Start 2P', cursive" }}>REBOOT_ENGINE</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-10 text-[9px] text-white/30 font-mono tracking-[0.3em] uppercase">
            <span>← Snap_Left</span>
            <span>Snap_Right →</span>
          </div>
          <div className="text-[8px] text-white/10 font-mono">
            VIRTUAL_NEURAL_LINK_ESTABLISHED | LANE_LOCK_ENGAGED
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
