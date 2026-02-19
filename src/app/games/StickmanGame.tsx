import { useEffect, useRef, useState } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Home } from 'lucide-react';
import { PixelButton } from '@/app/components/PixelButton';

const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const MOVEMENT_SPEED = 7;
const GROUND_Y = 320;
const ATTACK_RANGE_X = 100;
const ATTACK_COOLDOWN = 350;
const DAMAGE = 10;

interface Fighter {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    direction: 'left' | 'right';
    state: 'idle' | 'run' | 'jump' | 'attack' | 'hit' | 'dead';
    color: string;
    isPlayer: boolean;
    lastAttackTime: number;
    hitStop: number;
}

export function StickmanGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const requestRef = useRef<number>(0);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);

    // Impact effects state
    const [screenShake, setScreenShake] = useState(0);
    const [flash, setFlash] = useState(false);

    const getInitialState = () => ({
        player: {
            x: 150,
            y: GROUND_Y,
            vx: 0,
            vy: 0,
            hp: 100,
            maxHp: 100,
            direction: 'right' as const,
            state: 'idle' as const,
            color: 'var(--primary)', // Blue
            isPlayer: true,
            lastAttackTime: 0,
            hitStop: 0
        },
        enemy: {
            x: 650,
            y: GROUND_Y,
            vx: 0,
            vy: 0,
            hp: 100,
            maxHp: 100,
            direction: 'left' as const,
            state: 'idle' as const,
            color: 'var(--accent)', // Red
            isPlayer: false,
            lastAttackTime: 0,
            hitStop: 0
        }
    });

    const gameState = useRef(getInitialState());
    const particles = useRef<{ x: number, y: number, vx: number, vy: number, life: number, color: string }[]>([]);
    const keys = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            if (e.code === 'Escape') setIsPaused(prev => !prev);
        };
        const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        requestRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const resetGame = () => {
        gameState.current = getInitialState();
        particles.current = [];
        setGameOver(false);
        setWinner(null);
        setIsPaused(false);
        setScreenShake(0);
        setFlash(false);
    };

    const spawnParticles = (x: number, y: number, color: string, count = 20) => {
        for (let i = 0; i < count; i++) {
            particles.current.push({
                x, y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1.0,
                color
            });
        }
    };

    const updateFighter = (f: Fighter, target: Fighter) => {
        if (f.state === 'dead') return;

        if (f.hitStop > 0) {
            f.hitStop--;
            return;
        }

        f.vy += GRAVITY;
        f.x += f.vx;
        f.y += f.vy;

        if (f.state !== 'run' && f.state !== 'jump') f.vx *= 0.8;

        if (f.x < 40) f.x = 40;
        if (f.x > 760) f.x = 760;

        if (f.y >= GROUND_Y) {
            f.y = GROUND_Y;
            f.vy = 0;
            if (f.state === 'jump') f.state = 'idle';
        }

        if ((f.state === 'attack' || f.state === 'hit') && Date.now() - f.lastAttackTime > 300) {
            f.state = 'idle';
        }

        if (isPaused || gameOver) return;

        if (!f.isPlayer) {
            const dist = Math.abs(f.x - target.x);
            const directionToPlayer = target.x > f.x ? 1 : -1;
            f.direction = directionToPlayer > 0 ? 'right' : 'left';

            if (dist > ATTACK_RANGE_X - 20) {
                f.vx = directionToPlayer * (MOVEMENT_SPEED * 0.8);
                if (f.state !== 'attack' && f.state !== 'jump' && f.state !== 'hit') f.state = 'run';
            } else {
                f.vx = 0;
                if (Date.now() - f.lastAttackTime > ATTACK_COOLDOWN + 200) {
                    attack(f, target);
                }
            }
        } else {
            if (f.state !== 'attack' && f.state !== 'hit') {
                f.vx = 0;
                if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
                    f.vx = -MOVEMENT_SPEED;
                    f.direction = 'left';
                    if (f.y === GROUND_Y) f.state = 'run';
                }
                if (keys.current['KeyD'] || keys.current['ArrowRight']) {
                    f.vx = MOVEMENT_SPEED;
                    f.direction = 'right';
                    if (f.y === GROUND_Y) f.state = 'run';
                }
                if ((keys.current['KeyW'] || keys.current['ArrowUp']) && f.y === GROUND_Y) {
                    f.vy = JUMP_FORCE;
                    f.state = 'jump';
                }
                if (keys.current['Space'] && Date.now() - f.lastAttackTime > ATTACK_COOLDOWN) {
                    attack(f, target);
                }
                if (f.vx === 0 && f.y === GROUND_Y && f.state === 'run') f.state = 'idle';
            }
        }
    };

    const attack = (attacker: Fighter, defender: Fighter) => {
        attacker.state = 'attack';
        attacker.lastAttackTime = Date.now();

        const xDist = Math.abs(attacker.x - defender.x);
        const yDist = Math.abs((attacker.y - 40) - (defender.y - 40));

        const facingTarget = (attacker.direction === 'right' && defender.x > attacker.x) ||
            (attacker.direction === 'left' && defender.x < attacker.x);

        if (xDist < ATTACK_RANGE_X && yDist < 60 && facingTarget && defender.state !== 'dead') {
            takeDamage(defender, attacker);
        }
    };

    const takeDamage = (victim: Fighter, attacker: Fighter) => {
        victim.hp -= DAMAGE;
        victim.state = 'hit';
        victim.lastAttackTime = Date.now();
        victim.vx = attacker.direction === 'right' ? 15 : -15;
        victim.vy = -5;

        victim.hitStop = 5;
        attacker.hitStop = 5;

        spawnParticles(victim.x, victim.y - 40, victim.color);

        if (victim.hp <= 0) {
            victim.hp = 0;
            victim.state = 'dead';

            // Critical Hit / Death Effect
            setScreenShake(20);
            setFlash(true);
            setTimeout(() => setFlash(false), 100);

            // Slow motion finish or delay game over slightly for impact
            setTimeout(() => {
                setGameOver(true);
                setWinner(attacker.isPlayer ? 'CYBER_UNIT' : 'CPU_OVERLORD');
            }, 500);
        } else {
            // Apply small screen shake on hit
            setScreenShake(5);
        }
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        if (canvas.width !== 800 * devicePixelRatio) {
            canvas.width = 800 * devicePixelRatio;
            canvas.height = 450 * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }

        // Resolve screen shake decay
        if (screenShake > 0) {
            setScreenShake(prev => Math.max(0, prev - 1));
        }

        if (!isPaused && !gameOver) {
            const { player, enemy } = gameState.current;
            updateFighter(player, enemy);
            updateFighter(enemy, player);
            particles.current.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; });
            particles.current = particles.current.filter(p => p.life > 0);
        }

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, 800, 450);

        // Apply camera shake if needed
        ctx.save();
        if (screenShake > 0) {
            const dx = (Math.random() - 0.5) * screenShake;
            const dy = (Math.random() - 0.5) * screenShake;
            ctx.translate(dx, dy);
        }

        ctx.strokeStyle = 'var(--primary)';
        ctx.beginPath();
        for (let i = 0; i < 800; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, 450); }
        for (let j = 0; j < 450; j += 50) { ctx.moveTo(0, j); ctx.lineTo(800, j); }
        ctx.stroke();

        // Draw Floor
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 10);
        ctx.lineTo(800, GROUND_Y + 10);
        ctx.stroke();

        // Add floor glow
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 10);
        ctx.lineTo(800, GROUND_Y + 10);
        ctx.stroke();

        const { player, enemy } = gameState.current;
        drawFighter(ctx, player);
        drawFighter(ctx, enemy);

        particles.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.restore(); // End shake transform

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const drawFighter = (ctx: CanvasRenderingContext2D, f: Fighter) => {
        ctx.save();
        ctx.translate(f.x, f.y);
        if (f.direction === 'left') ctx.scale(-1, 1);

        if (f.state !== 'dead') {
            ctx.save();
            ctx.scale(f.direction === 'left' ? -1 : 1, 1);
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(-30, -110, 60, 4);
            ctx.fillStyle = f.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = f.color;
            ctx.fillRect(-30, -110, 60 * (f.hp / f.maxHp), 4);
            ctx.restore();
        }

        ctx.strokeStyle = f.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = f.color;

        let headY = -70;
        let bodyY = -35;

        if (f.state === 'run') {
            const t = Date.now() / 80;
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(Math.sin(t) * 25, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(Math.sin(t + Math.PI) * 25, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(20, -40 + Math.sin(t) * 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-20, -40 - Math.sin(t) * 15); ctx.stroke();
        } else if (f.state === 'attack') {
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(-15, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(15, 0); ctx.stroke();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(55, -45); ctx.stroke();
        } else if (f.state === 'hit') {
            ctx.translate(Math.random() * 6 - 3, Math.random() * 6 - 3);
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(-10, -5); ctx.stroke();
        } else if (f.state === 'dead') {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(10, 5); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(-15, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(15, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(15, -30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-15, -30); ctx.stroke();
        }

        ctx.beginPath(); ctx.moveTo(0, headY + 10); ctx.lineTo(0, bodyY); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, headY, 16, 0, Math.PI * 2); ctx.stroke();

        ctx.restore();
    };

    return (
        <GameWrapper title="CYBER_STRIKE" onBack={onBack}>
            <div className={`relative w-full aspect-[16/9] bg-black overflow-hidden rounded-2xl arcade-glow ring-2 ring-[var(--primary)]/20 ${flash ? 'bg-white mix-blend-screen' : ''}`}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

                {/* White Flash Effect Overlay */}
                <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${flash ? 'opacity-30' : 'opacity-0'}`} />

                <div className="absolute top-4 left-8 right-8 flex justify-between pointer-events-none">
                    <div className="flex flex-col gap-1">
                        <div className="text-[var(--primary)] font-black text-xs italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>CYBER_P1</div>
                        <div className="w-64 h-2 bg-black/50 border border-[var(--primary)]/30 overflow-hidden">
                            <motion.div animate={{ width: `${gameState.current.player.hp}%` }} className="h-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <div className="text-[var(--accent)] font-black text-xs italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>CPU_NODE</div>
                        <div className="w-64 h-2 bg-black/50 border border-[var(--accent)]/30 overflow-hidden">
                            <motion.div animate={{ width: `${gameState.current.enemy.hp}%` }} className="h-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] ml-auto" />
                        </div>
                    </div>
                </div>

                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 gap-6"
                    >
                        <div className="text-center">
                            <h2 className="text-5xl font-black mb-2 italic text-[var(--primary)] glitch-text" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                {winner === 'CYBER_UNIT' ? 'VICTORY' : 'DEFEATED'}
                            </h2>
                            <p className="text-[var(--primary)]/70 font-mono text-sm tracking-widest mb-8">
                                {winner === 'CYBER_UNIT' ? 'SYSTEM SECURE' : 'CRITICAL FAILURE'}
                            </p>

                            <div className="flex gap-4">
                                <PixelButton onClick={resetGame} size="normal" variant="primary">
                                    <div className="flex items-center gap-2">RESTART <RotateCcw size={16} /></div>
                                </PixelButton>

                                <PixelButton onClick={onBack} size="normal" variant="secondary">
                                    <div className="flex items-center gap-2">MENU <Home size={16} /></div>
                                </PixelButton>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isPaused && !gameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <h2 className="text-3xl font-black mb-6 italic text-[var(--accent)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>PAUSED</h2>
                        <div className="flex gap-4">
                            <PixelButton onClick={() => setIsPaused(false)} size="normal">RESUME</PixelButton>
                            <PixelButton onClick={onBack} size="normal" variant="secondary">MENU</PixelButton>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-4 left-0 right-0 text-center text-white/20 font-mono text-[8px] pointer-events-none tracking-widest">
                    [WASD/ARROWS] MOVE • [SPACE] ATTACK • [ESC] PAUSE
                </div>
            </div>
        </GameWrapper>
    );
}
