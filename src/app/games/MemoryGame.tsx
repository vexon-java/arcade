import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import {
  Zap, Circle, Heart, Skull, Star, Crown, Target, Infinity as InfinityIcon,
  RotateCcw, Trophy, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Card {
  id: number;
  iconId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOL_DATA = [
  { icon: Zap, color: '#00f3ff' },
  { icon: Circle, color: '#00ff00' },
  { icon: Heart, color: '#ff0033' },
  { icon: Skull, color: '#ffffff' },
  { icon: Star, color: '#ffff00' },
  { icon: Crown, color: '#ff9900' },
  { icon: Target, color: '#ff00ff' },
  { icon: InfinityIcon, color: '#0066ff' },
];

export function MemoryGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeGame = useCallback(() => {
    // Generate pairs of icon indices
    const iconIndices = SYMBOL_DATA.map((_, i) => i);
    const pairs = [...iconIndices, ...iconIndices];

    // Fisher-Yates Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    const newCards = pairs.map((iconId, index) => ({
      id: index,
      iconId,
      isFlipped: false,
      isMatched: false
    }));

    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (id: number) => {
    if (isProcessing || flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].iconId === cards[second].iconId) {
        setIsProcessing(true);
        setTimeout(() => {
          setCards(prev => {
            const matched = [...prev];
            matched[first].isMatched = true;
            matched[second].isMatched = true;
            return matched;
          });
          setFlippedCards([]);
          setMatches(m => m + 1);
          setIsProcessing(false);
        }, 600);
      } else {
        setIsProcessing(true);
        setTimeout(() => {
          setCards(prev => {
            const unflipped = [...prev];
            unflipped[first].isFlipped = false;
            unflipped[second].isFlipped = false;
            return unflipped;
          });
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const isGameWon = matches === SYMBOL_DATA.length;

  return (
    <GameWrapper title="NEURAL_MATCH" onBack={onBack}>
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">

        {/* HUD */}
        <div className="flex justify-between items-center w-full px-6 py-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--primary)]/50 font-mono tracking-widest uppercase">Synapse_Links</span>
            <div className="text-2xl font-black text-[var(--primary)] arcade-glow-text" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {matches}/{SYMBOL_DATA.length}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Cycles</span>
            <div className="text-2xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {moves.toString().padStart(3, '0')}
            </div>
          </div>
        </div>

        {/* BOARD */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(#fff 1px, transparent 1px) 0 0 / 20px 20px' }} />

          {cards.map(card => {
            const { icon: Icon, color } = SYMBOL_DATA[card.iconId];
            return (
              <div key={card.id} className="perspective-1000 w-24 h-24">
                <motion.div
                  className="relative w-full h-full preserve-3d cursor-pointer"
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  onClick={() => handleCardClick(card.id)}
                >
                  {/* FRONT (HIDDEN) */}
                  <div className="absolute inset-0 backface-hidden bg-black/80 border-2 border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 opacity-20 text-white">
                      <BrainCircuit className="w-full h-full" />
                    </div>
                    {/* Corner accents */}
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/20" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/20" />
                  </div>

                  {/* BACK (REVEALED) */}
                  <div
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-black border-2 rounded-xl flex items-center justify-center"
                    style={{
                      borderColor: color + '44',
                      boxShadow: card.isMatched ? `0 0 20px ${color}44` : 'none'
                    }}
                  >
                    <Icon
                      className="w-10 h-10 transition-all duration-500"
                      style={{
                        color,
                        filter: `drop-shadow(0 0 8px ${color})`,
                        opacity: card.isMatched ? 0.4 : 1
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* WIN OVERLAY */}
        <AnimatePresence>
          {isGameWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            >
              <div className="text-center p-8 bg-black border-4 border-[var(--primary)] rounded-3xl shadow-[0_0_50px_var(--primary)]">
                <Trophy className="w-20 h-20 text-[var(--primary)] mx-auto mb-6 arcade-glow-lime" />
                <h2 className="text-3xl font-black text-[var(--primary)] mb-2 italic tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>NEURAL_SYNC_COMPLETE</h2>
                <p className="text-white/60 font-mono mb-8">Efficiency Index: {Math.round((SYMBOL_DATA.length / moves) * 100)}%</p>

                <button
                  onClick={initializeGame}
                  className="group relative px-10 py-4 bg-black border-2 border-[var(--primary)] flex items-center gap-4 mx-auto overflow-hidden hover:scale-105 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-5 h-5 text-[var(--primary)] group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[var(--primary)] font-black text-xs" style={{ fontFamily: "'Press Start 2P', cursive" }}>REBOOT_CORE</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4 items-center">
          {!isGameWon && (
            <button
              onClick={initializeGame}
              className="px-8 py-3 bg-black border-2 border-white/20 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all font-bold rounded-lg flex items-center gap-2 text-[10px]"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              <RotateCcw size={14} /> RESTART_SEQUENCE
            </button>
          )}

          <div className="text-[8px] text-white/20 font-mono tracking-[0.3em] uppercase">
            Synchronize dual neural nodes for system access
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </GameWrapper>
  );
}
