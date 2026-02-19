import { motion } from 'motion/react';

interface Settings {
    sound: boolean;
    music: boolean;
    effects: boolean;
    notifications: boolean;
}

interface SettingsViewProps {
    settings: Settings;
    onUpdate: (key: string) => void;
    onDone: () => void;
}

export function SettingsView({ settings, onUpdate, onDone }: SettingsViewProps) {
    return (
        <div className="w-full">
            <h3 className="text-xl text-[#00ff00] mb-6 flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                НАСТРОЙКИ
            </h3>
            <div className="space-y-4">
                {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border-2 border-[#00ff00]/30 rounded-lg hover:border-[#00ff00] transition-colors">
                        <span className="text-[#00ff00] uppercase" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }}>
                            {key === 'sound' ? 'ЗВУК' : key === 'music' ? 'МУЗЫКА' : key === 'effects' ? 'ЭФФЕКТЫ' : 'УВЕДОМЛЕНИЯ'}
                        </span>
                        <button
                            onClick={() => onUpdate(key)}
                            className={`w-12 h-6 border-2 rounded-full relative transition-colors ${value ? 'bg-[#00ff00] border-[#00ff00]' : 'bg-black border-[#00ff00]/30'}`}
                        >
                            <motion.div
                                animate={{ x: value ? 24 : 2 }}
                                className={`w-4 h-4 rounded-full mt-0.5 ${value ? 'bg-black' : 'bg-[#00ff00]/30'}`}
                            />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={onDone}
                className="mt-8 px-6 py-2 border-2 border-[#00ff00] text-[#00ff00] rounded hover:bg-[#00ff00]/10 transition-all font-bold arcade-glow"
                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.6rem' }}
            >
                ГОТОВО
            </button>
        </div>
    );
}
