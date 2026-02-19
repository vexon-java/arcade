const API_URL = import.meta.env.VITE_API_URL || '';

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

export const getLeaderboardPlayers = async (sortBy: SortBy = 'score'): Promise<Player[]> => {
    try {
        const res = await fetch(`${API_URL}/api/leaderboard?sort=${sortBy}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return await res.json();
    } catch (err) {
        console.error('Leaderboard fetch error:', err);
        return [];
    }
};

export const getSortedPlayers = (players: Player[], timeFilter: TimeFilter, sortBy: SortBy) => {
    let filtered = [...players];

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
