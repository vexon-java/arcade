import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GameStatusOverlayProps {
    type: 'victory' | 'defeat' | null;
    onFinished: () => void;
}

export function GameStatusOverlay({ type, onFinished }: GameStatusOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (type) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onFinished();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [type, onFinished]);

    return (
        <AnimatePresence>
            {isVisible && type && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"
                >
                    {/* Background Flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0],
                            scale: [0.8, 1.2, 1.5]
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`absolute inset-0 ${type === 'victory' ? 'bg-[#00ff00]/40' : 'bg-red-600/40'
                            }`}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.5, opacity: 0, y: -50 }}
                        className="relative flex flex-col items-center gap-4 bg-black/80 border-4 rounded-3xl p-12 arcade-glow-strong"
                        style={{
                            borderColor: type === 'victory' ? '#00ff00' : '#ef4444',
                            boxShadow: type === 'victory' ? '0 0 50px #00ff00/40' : '0 0 50px #ef4444/40'
                        }}
                    >
                        <motion.div
                            animate={{
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {type === 'victory' ? (
                                <Trophy className="w-24 h-24 text-[#00ff00]" />
                            ) : (
                                <Skull className="w-24 h-24 text-red-500" />
                            )}
                        </motion.div>

                        <h2
                            className={`text-4xl md:text-6xl font-bold tracking-tighter ${type === 'victory' ? 'text-[#00ff00] arcade-glow-text' : 'text-red-500 arcade-glow-red'
                                }`}
                            style={{ fontFamily: "'Press Start 2P', cursive" }}
                        >
                            {type === 'victory' ? 'ПОБЕДА!' : 'НЕУДАЧА!'}
                        </h2>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-2 rounded-full ${type === 'victory' ? 'bg-[#00ff00]' : 'bg-red-600'
                                }`}
                        />
                    </motion.div>

                    {/* Particles/Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
