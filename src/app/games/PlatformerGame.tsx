import { useState, useEffect, useRef, useMemo } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Trophy, RotateCcw, Gem, Zap, ShieldAlert, Palette, ArrowRight } from 'lucide-react';

type Theme = 'cyan' | 'red' | 'green';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function PlatformerGame({ onBack, onGameOver, theme: globalTheme = 'cyan' }: { onBack: () => void; onGameOver?: (score: number, type?: 'victory' | 'defeat') => void; theme?: 'cyan' | 'red' | 'green' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOverState] = useState(false);
  const [level, setLevel] = useState(1);
  const [levelComplete, setLevelComplete] = useState(false);

  // Map global theme names to Platformer's Theme
  const theme = globalTheme;

  const themes = {
    cyan: { primary: '#00f3ff', secondary: '#00ddec', glow: 'rgba(0,243,255,0.5)' },
    red: { primary: '#ff3131', secondary: '#e62a2a', glow: 'rgba(255,49,49,0.5)' },
    green: { primary: '#00ff00', secondary: '#00dd00', glow: 'rgba(0,255,0,0.5)' }
  };

  const currentTheme = themes[theme];

  const setGameOver = (value: boolean) => {
    setGameOverState(value);
    if (value && onGameOver) {
      onGameOver(score, 'defeat');
    }
  };

  const [platforms, setPlatforms] = useState([
    { x: 0, y: 718, width: 1024, height: 50 },
    { x: 200, y: 600, width: 200, height: 20 },
    { x: 500, y: 500, width: 200, height: 20 },
    { x: 200, y: 350, width: 200, height: 20 }
  ]);

  const [coins, setCoins] = useState([
    { x: 300, y: 550, collected: false },
    { x: 600, y: 450, collected: false },
    { x: 300, y: 300, collected: false }
  ]);

  const [spikes, setSpikes] = useState<{ x: number, y: number }[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const generateLevel = (lvl: number) => {
    const WIDTH = 1024;
    const HEIGHT = 768;
    const newPlatforms = [{ x: 0, y: HEIGHT - 50, width: WIDTH, height: 50 }];
    const newCoins: { x: number; y: number; collected: boolean }[] = [];
    const newSpikes: { x: number; y: number }[] = [];

    const count = 8 + Math.min(lvl, 6);
    const difficultyScale = Math.min(lvl, 10) / 10;

    let lastX = 50;
    let lastY = HEIGHT - 50;
    let direction = 1;

    for (let i = 0; i < count; i++) {
      const pWidth = Math.max(100, 200 - (difficultyScale * 80));
      const minGapX = 80 + (difficultyScale * 60);
      const maxGapX = 200 + (difficultyScale * 60);
      const gapX = minGapX + Math.random() * (maxGapX - minGapX);

      let nextX = direction === 1 ? lastX + gapX : lastX - gapX - pWidth;
      const verticalGap = 80 + Math.random() * 40;
      let nextY = lastY - verticalGap;

      if (nextX < 20) {
        nextX = 20;
        direction = 1;
      } else if (nextX + pWidth > WIDTH - 20) {
        nextX = WIDTH - 20 - pWidth;
        direction = -1;
      }

      newPlatforms.push({ x: nextX, y: nextY, width: pWidth, height: 20 });

      if (newCoins.length < 3 && (i % 2 === 0 || i === count - 1)) {
        newCoins.push({ x: nextX + pWidth / 2, y: nextY - 30, collected: false });
      } else if (Math.random() > 0.3) {
        newSpikes.push({ x: nextX + pWidth / 2, y: nextY - 20 });
      }

      lastX = nextX;
      lastY = nextY;
    }

    setPlatforms(newPlatforms);
    setCoins(newCoins);
    setSpikes(newSpikes);
    setLevelComplete(false);
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    generateLevel(nextLvl);
  };

  const spawnParticles = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 1024;
    const HEIGHT = 768;
    const PLAYER_SIZE = 30;
    const GRAVITY = 0.5;
    const JUMP_STRENGTH = -12;

    let playerX = 50;
    let playerY = HEIGHT - 80;
    let playerVY = 0;
    let isJumping = false;
    let gameScore = score;
    let collectedInLevel = 0;
    let keys: { [key: string]: boolean } = {};
    let frame = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping) {
        playerVY = JUMP_STRENGTH;
        isJumping = true;
        spawnParticles(playerX + PLAYER_SIZE / 2, playerY + PLAYER_SIZE, currentTheme.secondary);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId: number;

    const gameLoop = () => {
      if (gameOver || levelComplete) return;
      frame++;

      if (keys['ArrowLeft']) playerX -= 6;
      if (keys['ArrowRight']) playerX += 6;
      playerX = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, playerX));

      playerVY += GRAVITY;
      playerY += playerVY;

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
          if (isJumping) {
            spawnParticles(playerX + PLAYER_SIZE / 2, playerY + PLAYER_SIZE, currentTheme.secondary, 4);
          }
          isJumping = false;
          onPlatform = true;
        }
      });

      coins.forEach((coin) => {
        if (!coin.collected) {
          const dist = Math.sqrt(Math.pow(playerX + PLAYER_SIZE / 2 - coin.x, 2) + Math.pow(playerY + PLAYER_SIZE / 2 - coin.y, 2));
          if (dist < PLAYER_SIZE) {
            coin.collected = true;
            gameScore += 100;
            collectedInLevel++;
            setScore(gameScore);
            spawnParticles(coin.x, coin.y, '#ffff00', 12);
            if (collectedInLevel >= 3) {
              setLevelComplete(true);
              if (onGameOver) onGameOver(gameScore, 'victory');
            }
          }
        }
      });

      spikes.forEach(spike => {
        if (
          playerX + PLAYER_SIZE - 8 > spike.x - 10 &&
          playerX + 8 < spike.x + 10 &&
          playerY + PLAYER_SIZE > spike.y &&
          playerY < spike.y + 20
        ) {
          setGameOver(true);
        }
      });

      if (playerY > HEIGHT) setGameOver(true);

      // Render
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Grid
      ctx.strokeStyle = currentTheme.primary + '11';
      ctx.lineWidth = 1;
      for (let x = 0; x < WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }

      // Platforms
      ctx.shadowBlur = 15;
      ctx.shadowColor = currentTheme.primary;
      ctx.fillStyle = currentTheme.primary;
      platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = currentTheme.secondary;
        ctx.fillRect(platform.x, platform.y, platform.width, 4);
        ctx.fillStyle = currentTheme.primary;
      });

      // Coins
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffff00';
      ctx.fillStyle = '#ffff00';
      coins.forEach(coin => {
        if (!coin.collected) {
          const bounce = Math.sin(frame * 0.1) * 5;
          ctx.beginPath();
          ctx.arc(coin.x, coin.y + bounce, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Spikes
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff4444';
      ctx.fillStyle = '#ff4444';
      spikes.forEach(spike => {
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y);
        ctx.lineTo(spike.x + 10, spike.y + 20);
        ctx.lineTo(spike.x - 10, spike.y + 20);
        ctx.closePath();
        ctx.fill();
      });

      // Particles
      ctx.shadowBlur = 0;
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fillRect(p.x, p.y, 3, 3);
      });

      // Player
      ctx.shadowBlur = 25;
      ctx.shadowColor = currentTheme.primary;
      ctx.fillStyle = currentTheme.primary;
      ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
      ctx.strokeStyle = '#white';
      ctx.lineWidth = 2;
      ctx.strokeRect(playerX + 5, playerY + 5, PLAYER_SIZE - 10, PLAYER_SIZE - 10);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver, levelComplete, platforms, coins, spikes, level, theme]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setLevel(1);
    generateLevel(1);
  };

  return (
    <GameWrapper title="NEON_PLATFORMER" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
        {/* DASHBOARD */}
        <div className="flex justify-between w-full px-4 items-end">
          <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Neural_Phase</span>
              <span className="text-2xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>{level.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Core_Extraction</span>
              <span className="text-2xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>{score.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="relative group w-full flex justify-center">
          <canvas
            ref={canvasRef}
            width={1024}
            height={768}
            className="border-2 rounded-2xl max-w-full h-auto max-h-[70vh] object-contain transition-colors duration-500"
            style={{
              borderColor: currentTheme.primary + '44',
              boxShadow: `0 0 40px ${currentTheme.glow}`
            }}
          />

          <AnimatePresence>
            {levelComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-8 rounded-2xl z-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-green-500/20 rounded-2xl border border-green-500/40">
                    <Trophy className="w-16 h-16 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>Phase_Synced</h2>
                </div>
                <button
                  onClick={nextLevel}
                  className="px-10 py-5 bg-green-500 text-black font-pixel rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center gap-3"
                  style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '14px' }}
                >
                  UPGRADE_CORE <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-950/20 backdrop-blur-xl flex flex-col items-center justify-center gap-6 rounded-2xl z-30"
              >
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="p-10 bg-black border-2 border-red-500 rounded-3xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                >
                  <ShieldAlert className="w-20 h-20 text-red-500 animate-pulse" />
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '0 0 20px #ff0000' }}>NEURAL_ERROR</h2>
                    <p className="text-red-400 font-mono text-xs uppercase tracking-widest">Extraction failed at Phase {level}</p>
                  </div>
                  <button
                    onClick={resetGame}
                    className="mt-4 px-10 py-4 bg-red-600 border-2 border-red-400 text-white rounded-xl hover:bg-black hover:text-red-500 transition-all font-black flex items-center gap-3"
                    style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
                  >
                    <RotateCcw className="w-5 h-5" /> REBOOT_SESSION
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-12 text-[10px] text-white/30 font-mono tracking-[0.3em] uppercase items-center">
          <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Move: ← → / WASD</div>
          <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 rotate-[-90deg]" /> Jump: SPACE / UP</div>
          <div className="flex items-center gap-2"><Gem className="w-4 h-4 text-yellow-500" /> Collect: 3 CORES</div>
        </div>
      </div>
    </GameWrapper>
  );
}
