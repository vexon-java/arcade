import { useState, useEffect, useRef, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer, Zap, TrendingUp, Cpu, Timer, ShieldAlert, Sparkles } from 'lucide-react';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  value: string;
  isCrit: boolean;
}

export function ClickerGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [critChance, setCritChance] = useState(0); // 0 to 1
  const [timeDistortion, setTimeDistortion] = useState(0); // Boost level

  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [screenShake, setScreenShake] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const clickPowerCost = Math.floor(10 * Math.pow(1.5, clickPower));
  const autoClickerCost = Math.floor(50 * Math.pow(2, autoClickers));
  const multiplierCost = Math.floor(250 * Math.pow(2.5, multiplier));
  const critCost = Math.floor(1000 * Math.pow(4, critChance * 10 + 1));
  const timeCost = Math.floor(2000 * Math.pow(5, timeDistortion + 1));

  // Auto-clicker effect
  useEffect(() => {
    if (autoClickers > 0) {
      const baseTick = 1000 / (1 + timeDistortion * 0.5);
      const interval = setInterval(() => {
        setClicks(prev => prev + autoClickers * multiplier);
      }, baseTick);
      return () => clearInterval(interval);
    }
  }, [autoClickers, multiplier, timeDistortion]);

  // Screen shake decay
  useEffect(() => {
    if (screenShake > 0) {
      const timeout = setTimeout(() => setScreenShake(0), 100);
      return () => clearTimeout(timeout);
    }
  }, [screenShake]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const spawnParticle = (x: number, y: number, value: string, isCrit: boolean) => {
    const id = Date.now();
    setParticles(prev => [...prev, { id, x, y, value, isCrit }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const handleClick = (e: React.MouseEvent) => {
    const isCrit = Math.random() < critChance;
    const power = isCrit ? clickPower * 10 : clickPower;
    const gain = power * multiplier;

    setClicks(prev => prev + gain);

    if (isCrit) {
      setScreenShake(15);
    }

    spawnParticle(e.clientX, e.clientY, `+${gain}`, isCrit);
  };

  const buyUpgrade = (cost: number, setter: () => void) => {
    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setter();
    }
  };

  return (
    <GameWrapper title="NEON_CLICKER" onBack={onBack}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative flex flex-col items-center gap-8 w-full max-w-5xl px-4 py-8 overflow-hidden cursor-none"
      >

        {/* SCORE PANEL */}
        <motion.div
          animate={{ x: (Math.random() - 0.5) * screenShake, y: (Math.random() - 0.5) * screenShake }}
          className="relative px-12 py-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center"
        >
          <div className="text-[10px] text-[var(--primary)] font-mono tracking-[0.5em] uppercase opacity-50 mb-2">Neural_Assets_Detected</div>
          <div className="text-5xl font-black text-white flex items-baseline gap-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            <span className="text-[var(--primary)]" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)' }}>{clicks.toLocaleString()}</span>
            <span className="text-xs text-white/30">N_BYTES</span>
          </div>
          <div className="mt-4 flex gap-6 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-yellow-400" /> Yield: {clickPower * multiplier}</span>
            <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-[var(--primary)]" /> Passive: {autoClickers * multiplier}/s</span>
          </div>
        </motion.div>

        {/* MAIN CLICKER */}
        <div className="relative group">
          <AnimatePresence>
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: p.y - 100, x: p.x - 50, scale: 0.5 }}
                animate={{ opacity: 0, y: p.y - 250, scale: p.isCrit ? 2 : 1.2 }}
                className={`fixed pointer-events-none z-40 font-black text-2xl ${p.isCrit ? 'text-yellow-400 italic' : 'text-[var(--primary)]'}`}
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {p.value}
                {p.isCrit && <div className="text-[10px] uppercase tracking-tighter">CRITICAL_OVERRIDE</div>}
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.8 }}
            className="w-64 h-64 relative rounded-full flex items-center justify-center overflow-hidden border-4 border-[var(--primary)]/50 shadow-[0_0_40px_var(--primary)] bg-black/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] group-hover:opacity-100 opacity-50 transition-opacity" />

            {/* Inner Core */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 border border-[var(--primary)] rounded-full"
            />

            <Cpu className="w-24 h-24 text-[var(--primary)] drop-shadow-[0_0_15px_var(--primary)] z-10" />

            <div className="absolute bottom-8 text-[8px] font-mono text-[var(--primary)]/50 uppercase tracking-[0.3em]">Extract_Data_Stream</div>
          </motion.button>
        </div>

        {/* UPGRADES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {[
            { id: 'power', icon: MousePointer, label: 'Neural_Spike', cost: clickPowerCost, level: clickPower, desc: '+1 Yield', color: 'var(--primary)', action: () => setClickPower(p => p + 1) },
            { id: 'auto', icon: Zap, label: 'Ghost_Engine', cost: autoClickerCost, level: autoClickers, desc: '+1 Passive/s', color: 'purple', action: () => setAutoClickers(p => p + 1) },
            { id: 'mult', icon: TrendingUp, label: 'Data_Node', cost: multiplierCost, level: multiplier, desc: 'Yield Multiplier', color: 'lime', action: () => setMultiplier(p => p + 1) },
            { id: 'crit', icon: ShieldAlert, label: 'Crit_Override', cost: critCost, level: Math.round(critChance * 100), desc: '10x Click Chance', color: 'yellow', action: () => setCritChance(p => Math.min(0.5, p + 0.05)) },
            { id: 'time', icon: Timer, label: 'Time_Warp', cost: timeCost, level: timeDistortion, desc: 'Auto-Click Speed', color: 'red', action: () => setTimeDistortion(p => p + 1) }
          ].map((up) => (
            <button
              key={up.id}
              onClick={() => buyUpgrade(up.cost, up.action)}
              disabled={clicks < up.cost}
              className={`p-4 bg-black/40 backdrop-blur-md border-2 rounded-xl flex flex-col items-center gap-3 transition-all group
                        ${clicks >= up.cost ? `border-${up.color}-500/50 hover:bg-${up.color}-500/10 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)]` : 'border-white/5 opacity-40 grayscale'}
              `}
            >
              <div className={`p-2 rounded-lg bg-${up.color}-500/20 text-${up.color}-400 group-hover:scale-110 transition-transform`}>
                <up.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-black text-white uppercase tracking-tighter text-center">{up.label}</div>
              <div className="text-[8px] text-white/40 font-mono text-center uppercase">{up.desc}</div>

              <div className="mt-2 w-full pt-2 border-t border-white/5 flex flex-col items-center">
                <div className="text-[12px] font-bold text-white mb-1">{up.cost.toLocaleString()}</div>
                <div className={`text-[8px] font-mono px-2 py-0.5 rounded bg-${up.color}-500/10 text-${up.color}-400`}>LVL_{up.level}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
}
