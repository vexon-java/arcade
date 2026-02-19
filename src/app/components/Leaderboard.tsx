import { motion } from 'motion/react';
import { Trophy, Medal, Award, Crown, ArrowLeft, SortAsc } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PixelButton } from '@/app/components/PixelButton';
import { getLeaderboardPlayers, getSortedPlayers, TimeFilter, SortBy, Player } from '@/app/data/leaderboardData';

interface LeaderboardProps {
  onBack: () => void;
  currentUserData: any;
  currentUsername: string;
}

export function Leaderboard({ onBack, currentUserData, currentUsername }: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboardPlayers(sortBy).then(data => {
      setPlayers(data);
      setLoading(false);
    });
  }, [sortBy]);

  const sortedPlayers = getSortedPlayers(
    players.map(p => ({
      ...p,
      isCurrentUser: p.id === currentUsername
    })),
    timeFilter,
    sortBy
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />;
    return <Trophy className="w-5 h-5 text-[var(--primary)]/50" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-start p-4 md:p-8 overflow-hidden bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-5xl h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <PixelButton onClick={onBack} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            МЕНЮ
          </PixelButton>

          <h1 className="text-2xl md:text-4xl text-[var(--primary)] text-center" style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 20px var(--primary)'
          }}>
            ЛИДЕРЫ
          </h1>

          <div className="w-24 md:w-32" />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2 p-1 bg-[var(--primary)]/5 border-2 border-[var(--primary)]/20 rounded-lg">
            {(['day', 'week', 'month', 'all'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`flex-1 py-2 text-[10px] rounded transition-all ${timeFilter === f ? 'bg-[var(--primary)] text-black font-bold' : 'text-[var(--primary)]/60 hover:text-[var(--primary)]'
                  }`}
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {f === 'day' ? 'ДЕНЬ' : f === 'week' ? 'НЕДЕЛЯ' : f === 'month' ? 'МЕСЯЦ' : 'ВСЕ'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center px-4 bg-[var(--primary)]/5 border-2 border-[var(--primary)]/20 rounded-lg">
            <SortAsc className="w-4 h-4 text-[var(--primary)]/50" />
            {(['score', 'level', 'wins'] as SortBy[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-2 text-[8px] transition-all ${sortBy === s ? 'text-[var(--primary)] underline decoration-2 underline-offset-4' : 'text-[var(--primary)]/40 hover:text-[var(--primary)]'
                  }`}
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {s === 'score' ? 'СЧЁТ' : s === 'level' ? 'УРОВЕНЬ' : 'ПОБЕДЫ'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-black/60 border-2 border-[var(--primary)]/20 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-black z-20">
              <tr className="border-b-2 border-[var(--primary)]/20">
                <th className="p-4 text-[10px] text-[var(--primary)]/50 font-normal" style={{ fontFamily: "'Press Start 2P', cursive" }}> РАНГ </th>
                <th className="p-4 text-[10px] text-[var(--primary)]/50 font-normal" style={{ fontFamily: "'Press Start 2P', cursive" }}> ИГРОК </th>
                <th className="p-4 text-[10px] text-[var(--primary)]/50 font-normal text-right" style={{ fontFamily: "'Press Start 2P', cursive" }}> СЧЁТ </th>
                <th className="p-4 text-[10px] text-[var(--primary)]/50 font-normal text-right hidden md:table-cell" style={{ fontFamily: "'Press Start 2P', cursive" }}> УРОВЕНЬ </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-[var(--primary)]/50 font-mono animate-pulse">ЗАГРУЗКА...</td></tr>
              ) : sortedPlayers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-[var(--primary)]/50 font-mono">НЕТ ДАННЫХ</td></tr>
              ) : sortedPlayers.map((player) => (
                <motion.tr
                  layout
                  key={player.id}
                  className={`border-b border-[var(--primary)]/10 transition-colors ${player.isCurrentUser ? 'bg-[var(--primary)]/10' : 'hover:bg-[var(--primary)]/5'
                    }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-[12px] text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                        #{player.rank}
                      </span>
                      {getRankIcon(player.rank)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center text-xl border-2 border-[var(--primary)]/30 rounded-lg bg-black">
                        {player.avatar}
                      </div>
                      <span className={`text-[12px] ${player.isCurrentUser ? 'text-[var(--primary)]' : 'text-white/80'}`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
                        {player.nickname}
                        {player.isCurrentUser && <span className="ml-2 text-[8px] opacity-50 underline">(ВЫ)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                      {player.score.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right hidden md:table-cell">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-white/60" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                        Ур. {player.level}
                      </span>
                      <div className="w-16 h-1 bg-black rounded-full mt-1 border border-[var(--primary)]/20">
                        <div className="h-full bg-[var(--primary)]" style={{ width: `${(player.level % 10) * 10}%` }} />
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
              }
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
