import { motion } from 'motion/react';
import { Achievement } from '@/app/data/userProfileData';

interface AchievementGridProps {
    achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
    return (
        <div className="bg-black/50 border-2 border-[#00ff00]/30 rounded-xl p-6">
            <h3 className="text-sm text-[#00ff00] mb-6 flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                ДОСТИЖЕНИЯ
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {achievements.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 text-center transition-all ${item.unlocked ? 'border-[#00ff00] bg-[#00ff00]/10 shadow-[0_0_10px_#00ff00/20]' : 'border-[#00ff00]/10 grayscale opacity-40'
                            }`}
                    >
                        <div className="text-2xl">{item.icon}</div>
                        <div className="text-[#00ff00] uppercase" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>
                            {item.name}
                        </div>
                        <div className="text-[10px] text-[#00ff00]/70 leading-tight">
                            {item.description}
                        </div>
                        {item.date && (
                            <div className="text-[8px] text-[#00ff00]/40 mt-1">
                                {item.date}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
