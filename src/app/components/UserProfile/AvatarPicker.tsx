import { motion } from 'motion/react';
import { availableAvatars } from '@/app/data/userProfileData';

interface AvatarPickerProps {
    currentAvatar: string;
    onSelect: (avatar: string) => void;
    onCancel: () => void;
}

export function AvatarPicker({ currentAvatar, onSelect, onCancel }: AvatarPickerProps) {
    return (
        <div className="w-full">
            <h3 className="text-xl text-[#00ff00] mb-6 flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                ВЫБОР АВАТАРА
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {availableAvatars.map((avatar) => (
                    <motion.button
                        key={avatar}
                        whileHover={{ scale: 1.1, boxShadow: '0 0 15px #00ff00' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSelect(avatar)}
                        className={`w-16 h-16 flex items-center justify-center text-3xl border-2 rounded-lg bg-black ${currentAvatar === avatar ? 'border-[#00ff00] shadow-[0_0_10px_#00ff00]' : 'border-[#00ff00]/30 hover:border-[#00ff00]'
                            }`}
                    >
                        {avatar}
                    </motion.button>
                ))}
            </div>
            <button
                onClick={onCancel}
                className="mt-8 px-6 py-2 border-2 border-[#00ff00] text-[#00ff00] rounded hover:bg-[#00ff00] hover:text-black transition-all"
                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.6rem' }}
            >
                ОТМЕНА
            </button>
        </div>
    );
}
