export interface Achievement {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    date?: string;
}

export interface GameStats {
    game: string;
    played: number;
    wins: number;
    highScore: number;
}

export const availableAvatars = ['🎮', '🕹️', '👾', '🚀', '👽', '🤖', '💀', '👻', '🎃', '🧙', '🥷', '🦸', '🦹', '🐲', '🐉', '🦖'];

export const initialFriends = [
    { id: '1', name: 'NeonKnight', avatar: '🤖', status: 'online', level: 38 },
    { id: '2', name: 'PixelQueen', avatar: '👑', status: 'offline', level: 45 },
    { id: '3', name: 'RetroMaster', avatar: '🕹️', status: 'online', level: 52 },
    { id: '4', name: 'CyberShark', avatar: '🦈', status: 'away', level: 29 },
];

export const achievements: Achievement[] = [
    { id: '1', name: 'НОВИЧОК', icon: '🎯', description: 'Сыграть первую игру', unlocked: true, date: '01.02.2026' },
    { id: '2', name: 'ЧЕМПИОН', icon: '👑', description: 'Выиграть 100 игр', unlocked: true, date: '05.02.2026' },
    { id: '3', name: 'СКОРОСТЬ', icon: '⚡', description: 'Завершить игру за 30 сек', unlocked: true, date: '10.02.2026' },
    { id: '4', name: 'МАРАФОН', icon: '🏃', description: 'Играть 10 часов', unlocked: true, date: '12.02.2026' },
    { id: '5', name: 'ЛЕГЕНДА', icon: '🌟', description: 'Достичь уровня 50', unlocked: false },
    { id: '6', name: 'КОЛЛЕКЦИОНЕР', icon: '💎', description: 'Получить все достижения', unlocked: false },
];

export const gameStats: GameStats[] = [
    { game: 'Snake', played: 45, wins: 32, highScore: 12500 },
    { game: 'Tetris', played: 38, wins: 25, highScore: 98700 },
    { game: 'Checkers', played: 22, wins: 14, highScore: 1850 },
    { game: '2048', played: 31, wins: 19, highScore: 32768 },
    { game: 'Pong', played: 28, wins: 20, highScore: 15 },
];
