import { motion } from 'motion/react';

interface Friend {
    id: string;
    name: string;
    avatar: string;
    status: string;
    level: number;
}

interface FriendListProps {
    friends: Friend[];
    onBack: () => void;
}

export function FriendList({ friends, onBack }: FriendListProps) {
    return (
        <div className="w-full">
            <h3 className="text-xl text-[#00ff00] mb-6 flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                СПИСОК ДРУЗЕЙ
            </h3>
            <div className="space-y-4">
                {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 border-2 border-[#00ff00]/30 rounded-lg bg-black/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center text-2xl border-2 border-[#00ff00] rounded-lg">
                                {friend.avatar}
                            </div>
                            <div>
                                <div className="text-[#00ff00]" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.7rem' }}>
                                    {friend.name}
                                </div>
                                <div className="text-[#00ff00]/50" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem' }}>
                                    УРОВЕНЬ {friend.level}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${friend.status === 'online' ? 'bg-[#00ff00]' : friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                            <span className="text-[#00ff00]/70 uppercase" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem' }}>
                                {friend.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBack}
                className="mt-8 px-6 py-2 border-2 border-[#00ff00] text-[#00ff00] rounded hover:bg-[#00ff00] hover:text-black transition-all"
                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.6rem' }}
            >
                НАЗАД
            </button>
        </div>
    );
}
