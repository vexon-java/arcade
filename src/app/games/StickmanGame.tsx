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
    const [isReady, setIsReady] = useState(false);

    // Refs for game flags to avoid stale closures in gameLoop
    const gameOverRef = useRef(false);
    const isPausedRef = useRef(false);
    const isReadyRef = useRef(false);

    // Sync refs with state
    useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { isReadyRef.current = isReady; }, [isReady]);

    const requestRef = useRef<number>(0);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);

    // Impact effects state
    const [screenShake, setScreenShake] = useState(0);
    const [flash, setFlash] = useState(false);

    const getInitialState = () => ({
        player: {
            x: 100,
            y: GROUND_Y,
            vx: 0,
            vy: 0,
            hp: 120,
            maxHp: 120,
            direction: 'right' as const,
            state: 'idle' as const,
            color: '#00ccff', // Bright Blue
            isPlayer: true,
            lastAttackTime: 0,
            hitStop: 0
        },
        enemy: {
            x: 700,
            y: GROUND_Y,
            vx: 0,
            vy: 0,
            hp: 120,
            maxHp: 120,
            direction: 'left' as const,
            state: 'idle' as const,
            color: '#ff3300', // Bright Red
            isPlayer: false,
            lastAttackTime: 0,
            hitStop: 0
        }
    });

    const gameState = useRef(getInitialState());
    const particles = useRef<{ x: number, y: number, vx: number, vy: number, life: number, color: string, alpha?: number }[]>([]);
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

        // Start intro sequence
        const introTimer = setTimeout(() => setIsReady(true), 1500);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            clearTimeout(introTimer);
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
        setIsReady(false);
        setTimeout(() => setIsReady(true), 1500);
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

        // isPaused/gameOver checks are now handled in gameLoop via refs

        if (!f.isPlayer) {
            const dist = Math.abs(f.x - target.x);
            const directionToPlayer = target.x > f.x ? 1 : -1;
            f.direction = directionToPlayer > 0 ? 'right' : 'left';

            if (dist > ATTACK_RANGE_X - 10) {
                f.vx = directionToPlayer * (MOVEMENT_SPEED * (0.8 + Math.random() * 0.4));
                if (f.state !== 'attack' && f.state !== 'jump' && f.state !== 'hit') f.state = 'run';
            } else {
                f.vx = 0;
                // Randomize attack timing slightly for more natural feel
                const cooldown = ATTACK_COOLDOWN + (Math.random() * 300);
                if (Date.now() - f.lastAttackTime > cooldown && f.state !== 'hit') {
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
        victim.vx = attacker.direction === 'right' ? 18 : -18; // More knockback
        victim.vy = -6;

        victim.hitStop = 8; // More impact freeze
        attacker.hitStop = 8;

        // Spawn hit sparks
        spawnSparks(victim.x, victim.y - 40, '#ffffff', 10);
        spawnParticles(victim.x, victim.y - 40, victim.color, 15);

        if (victim.hp <= 0) {
            victim.hp = 0;
            victim.state = 'dead';
            setScreenShake(25);
            setFlash(true);
            setTimeout(() => setFlash(false), 150);
            setTimeout(() => {
                setGameOver(true);
                setWinner(attacker.isPlayer ? 'CYBER_UNIT' : 'CPU_OVERLORD');
            }, 800);
        } else {
            setScreenShake(8);
        }
    };

    const spawnSparks = (x: number, y: number, color: string, count: number) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 10 + Math.random() * 15;
            particles.current.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color,
                alpha: 1.0
            });
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

        // Use refs for logic to avoid stale state issues in the requestAnimationFrame closure
        if (!isPausedRef.current && !gameOverRef.current && isReadyRef.current) {
            const { player, enemy } = gameState.current;
            updateFighter(player, enemy);
            updateFighter(enemy, player);
            particles.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity for particles
                p.life -= 0.02;
            });
            particles.current = particles.current.filter(p => p.life > 0);
        }

        // Draw Arena - Lighter and more vibrant
        ctx.fillStyle = '#0a0a20';
        ctx.fillRect(0, 0, 800, 450);

        // Lighter Grid
        ctx.strokeStyle = '#151540';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 800; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, 450); }
        for (let j = 0; j < 450; j += 40) { ctx.moveTo(0, j); ctx.lineTo(800, j); }
        ctx.stroke();

        // Apply camera shake if needed
        ctx.save();
        if (screenShake > 0) {
            const dx = (Math.random() - 0.5) * screenShake;
            const dy = (Math.random() - 0.5) * screenShake;
            ctx.translate(dx, dy);
        }

        // Floor with stronger glow
        const floorY = GROUND_Y + 10;
        ctx.strokeStyle = '#3333aa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(800, floorY);
        ctx.stroke();

        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, floorY + 4);
        ctx.lineTo(800, floorY + 4);
        ctx.stroke();
        ctx.globalAlpha = 1;

        const { player, enemy } = gameState.current;
        drawFighter(ctx, player);
        drawFighter(ctx, enemy);

        particles.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowBlur = p.life * 15;
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

        // Character Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = f.color;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        let headY = -70;
        let bodyY = -35;

        // Draw Limbs
        if (f.state === 'run') {
            const t = Date.now() / 80;
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(Math.sin(t) * 25, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(Math.sin(t + Math.PI) * 25, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(25, -40 + Math.sin(t) * 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-25, -40 - Math.sin(t) * 15); ctx.stroke();
        } else if (f.state === 'attack') {
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(-15, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(15, 0); ctx.stroke();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(60, -45); ctx.stroke();
        } else if (f.state === 'hit') {
            ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(-10, -5); ctx.stroke();
            ctx.strokeStyle = '#fff';
        } else if (f.state === 'dead') {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(10, 5); ctx.stroke();
        } else {
            // Idle / Jump
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(-15, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, bodyY); ctx.lineTo(15, 0); ctx.stroke();
            const armT = Math.sin(Date.now() / 200) * 5;
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(15, -30 + armT); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-15, -30 + armT); ctx.stroke();
        }

        // Body & Head
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(0, headY + 10); ctx.lineTo(0, bodyY); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, headY, 18, 0, Math.PI * 2); ctx.stroke();

        // Glowing Core
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, -50, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    return (
        <GameWrapper title="CYBER_STRIKE" onBack={onBack}>
            <div className={`relative w-full aspect-[16/9] bg-black overflow-hidden rounded-2xl arcade-glow ring-2 ring-[var(--primary)]/20 ${flash ? 'bg-white mix-blend-screen' : ''}`}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

                {/* White Flash Effect Overlay */}
                <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${flash ? 'opacity-30' : 'opacity-0'}`} />

                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

                <div className="absolute top-6 left-12 right-12 flex justify-between items-start pointer-events-none z-10">
                    {/* Player HP */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#00ccff] bg-black/50 flex items-center justify-center text-[#00ccff] font-bold text-lg shadow-[0_0_15px_#00ccff]">P1</div>
                            <div className="text-[#00ccff] font-black text-sm italic tracking-widest uppercase">CYBER_UNIT</div>
                        </div>
                        <div className="relative w-80 h-6 bg-black/60 border-2 border-[#00ccff]/40 rounded-sm overflow-hidden skew-x-[-15deg] shadow-[0_0_20px_rgba(0,204,255,0.2)]">
                            <motion.div
                                animate={{ width: `${(gameState.current.player.hp / gameState.current.player.maxHp) * 100}%` }}
                                className="h-full bg-gradient-to-r from-[#0066ff] to-[#00ccff] shadow-[0_0_15px_#00ccff]"
                            />
                            {/* HP Text */}
                            <div className="absolute inset-0 flex items-center justify-end pr-3 text-white font-mono text-[10px] uppercase font-bold tracking-tighter">
                                {Math.ceil(gameState.current.player.hp)} HP
                            </div>
                        </div>
                    </div>

                    {/* VS Center */}
                    <div className="mt-2 flex flex-col items-center">
                        <div className="text-white/40 font-black text-xl italic skew-x-[-15deg]">VS</div>
                    </div>

                    {/* Enemy HP */}
                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full border-2 border-[#ff3300] bg-black/50 flex items-center justify-center text-[#ff3300] font-bold text-lg shadow-[0_0_15px_#ff3300]">CPU</div>
                            <div className="text-[#ff3300] font-black text-sm italic tracking-widest uppercase">OVERLORD_V1</div>
                        </div>
                        <div className="relative w-80 h-6 bg-black/60 border-2 border-[#ff3300]/40 rounded-sm overflow-hidden skew-x-[15deg] shadow-[0_0_20px_rgba(255,51,0,0.2)]">
                            <motion.div
                                animate={{ width: `${(gameState.current.enemy.hp / gameState.current.enemy.maxHp) * 100}%` }}
                                className="h-full bg-gradient-to-l from-[#990000] to-[#ff3300] shadow-[0_0_15px_#ff3300] ml-auto"
                            />
                            {/* HP Text */}
                            <div className="absolute inset-0 flex items-center justify-start pl-3 text-white font-mono text-[10px] uppercase font-bold tracking-tighter">
                                {Math.ceil(gameState.current.enemy.hp)} HP
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ready / Fight Overlay */}
                <AnimatePresence>
                    {!isReady && !gameOver && (
                        <motion.div
                            initial={{ opacity: 0, scale: 2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, y: -100 }}
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                        >
                            <div className="text-center">
                                <motion.h1
                                    className="text-8xl font-black italic text-white drop-shadow-[0_0_30px_#00ccff] tracking-tighter skew-x-[-20deg]"
                                    style={{ WebkitTextStroke: '4px #000' }}
                                >
                                    READY?
                                </motion.h1>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: 600 }}
                                    className="h-2 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-4"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                <div className="absolute bottom-4 left-0 right-0 text-center text-white/30 font-mono text-[10px] pointer-events-none tracking-widest uppercase">
                    [WASD / ARROWS] MOVE • [SPACE] ATTACK • [ESC] PAUSE
                </div>
            </div>
        </GameWrapper>
    );
}
