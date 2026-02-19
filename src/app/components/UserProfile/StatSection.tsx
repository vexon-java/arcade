import { motion } from 'motion/react';
import { Target, Clock, Zap } from 'lucide-react';
import { GameStats } from '@/app/data/userProfileData';

interface StatSectionProps {
    userData: any;
    gameStats: GameStats[];
}

export function StatSection({ userData, gameStats }: StatSectionProps) {
    return (
        <div className="space-y-6 flex flex-col h-full">
            {/* Mini Stats Card */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'ИГРЫ', value: userData.gamesPlayed, icon: <Target className="w-4 h-4" /> },
                    { label: 'ПОБЕДЫ', value: userData.totalWins, icon: <Zap className="w-4 h-4" /> },
                    { label: 'ВРЕМЯ', value: userData.playTime, icon: <Clock className="w-4 h-4" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-black border-2 border-[#00ff00]/30 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="text-[#00ff00]/50 mb-1">{stat.icon}</div>
                        <div className="text-lg text-[#00ff00]" style={{ fontFamily: "'Press Start 2P', cursive" }}>{stat.value}</div>
                        <div className="text-[8px] text-[#00ff00]/50 mt-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Game Stats Table */}
            <div className="flex-1 bg-black/50 border-2 border-[#00ff00]/30 rounded-xl p-6 overflow-hidden flex flex-col">
                <h3 className="text-sm text-[#00ff00] mb-6 flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    СТАТИСТИКА ИГР
                </h3>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {gameStats.map((stat, i) => {
                        const winRate = Math.round((stat.wins / stat.played) * 100);
                        return (
                            <div key={i} className="group border-2 border-[#00ff00]/10 p-4 rounded-lg hover:border-[#00ff00]/50 transition-all bg-black/40">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-[#00ff00] uppercase" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>
                                        {stat.game}
                                    </div>
                                    <div className="text-[10px] text-[#00ff00]/70">
                                        {stat.played} ИГР
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[8px] text-[#00ff00]/40 uppercase mb-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                            РЕКОРД
                                        </div>
                                        <div className="text-lg text-[#00ff00]/90" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                            {stat.highScore.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] text-[#00ff00]/40 uppercase mb-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                            WINRATE
                                        </div>
                                        <div className="text-lg text-[#00ff00]/90" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                            {winRate}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
