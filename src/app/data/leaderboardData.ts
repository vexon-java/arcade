export interface Player {
    id: string;
    rank: number;
    avatar: string;
    nickname: string;
    score: number;
    level: number;
    gamesWon: number;
    isCurrentUser?: boolean;
}

export type TimeFilter = 'day' | 'week' | 'month' | 'all';
export type SortBy = 'score' | 'level' | 'wins';

export const getRegisteredPlayers = (): Player[] => {
    if (typeof window === 'undefined') return [];

    const usersJson = localStorage.getItem('arcade_users');
    if (!usersJson) return [];

    try {
        const users = JSON.parse(usersJson);
        return Object.entries(users).map(([username, user]: [string, any], index) => ({
            id: username,
            rank: index + 1,
            avatar: user.data.avatar,
            nickname: user.data.nickname,
            score: user.data.totalScore,
            level: user.data.level,
            gamesWon: user.data.totalWins,
            isCurrentUser: false // This will be set by the component
        }));
    } catch (e) {
        console.error('Error parsing arcade_users:', e);
        return [];
    }
};

export const getSortedPlayers = (players: Player[], timeFilter: TimeFilter, sortBy: SortBy) => {
    let filtered = [...players];

    // Note: Since we don't have historical score data per user yet, 
    // time filtering is mock-logic applied to current totals.
    if (timeFilter === 'day') {
        filtered = filtered.map(p => ({ ...p, score: Math.floor(p.score * 0.1), gamesWon: Math.floor(p.gamesWon * 0.1) }));
    } else if (timeFilter === 'week') {
        filtered = filtered.map(p => ({ ...p, score: Math.floor(p.score * 0.3), gamesWon: Math.floor(p.gamesWon * 0.3) }));
    } else if (timeFilter === 'month') {
        filtered = filtered.map(p => ({ ...p, score: Math.floor(p.score * 0.6), gamesWon: Math.floor(p.gamesWon * 0.6) }));
    }

    return filtered.sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'level') return b.level - a.level;
        if (sortBy === 'wins') return b.gamesWon - a.gamesWon;
        return 0;
    }).map((p, i) => ({ ...p, rank: i + 1 }));
};
