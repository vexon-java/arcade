import { motion } from 'motion/react';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { useState } from 'react';

interface LeaderboardProps {
  onBack: () => void;
}

interface Player {
  id: string;
  rank: number;
  avatar: string;
  nickname: string;
  score: number;
  level: number;
  gamesWon: number;
  isCurrentUser?: boolean;
}

type TimeFilter = 'day' | 'week' | 'month' | 'all';

export function Leaderboard({ onBack }: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<'score' | 'level' | 'wins'>('score');

  // Мок-данные игроков
  const allPlayers: Player[] = [
    { id: '1', rank: 1, avatar: '👑', nickname: 'PixelKing', score: 256890, level: 88, gamesWon: 534, isCurrentUser: false },
    { id: '2', rank: 2, avatar: '🔥', nickname: 'FireMaster', score: 234560, level: 82, gamesWon: 498, isCurrentUser: false },
    { id: '3', rank: 3, avatar: '⚡', nickname: 'SpeedRunner', score: 198750, level: 75, gamesWon: 445, isCurrentUser: false },
    { id: '4', rank: 4, avatar: '💎', nickname: 'DiamondPro', score: 176420, level: 68, gamesWon: 401, isCurrentUser: false },
    { id: '5', rank: 5, avatar: '🚀', nickname: 'RocketGamer', score: 165320, level: 64, gamesWon: 378, isCurrentUser: false },
    { id: '6', rank: 6, avatar: '🎯', nickname: 'BullsEye', score: 154280, level: 61, gamesWon: 356, isCurrentUser: false },
    { id: '7', rank: 7, avatar: '🎮', nickname: 'CyberGamer', score: 125680, level: 42, gamesWon: 156, isCurrentUser: true },
    { id: '8', rank: 8, avatar: '🌟', nickname: 'StarPlayer', score: 118450, level: 55, gamesWon: 298, isCurrentUser: false },
    { id: '9', rank: 9, avatar: '🎲', nickname: 'LuckyDice', score: 112340, level: 53, gamesWon: 287, isCurrentUser: false },
    { id: '10', rank: 10, avatar: '🏆', nickname: 'Champion', score: 108920, level: 51, gamesWon: 276, isCurrentUser: false },
    { id: '11', rank: 11, avatar: '🦾', nickname: 'CyberArm', score: 98750, level: 48, gamesWon: 245, isCurrentUser: false },
    { id: '12', rank: 12, avatar: '🎪', nickname: 'Showman', score: 92340, level: 46, gamesWon: 234, isCurrentUser: false },
    { id: '13', rank: 13, avatar: '🌈', nickname: 'Rainbow', score: 87650, level: 44, gamesWon: 223, isCurrentUser: false },
    { id: '14', rank: 14, avatar: '🔮', nickname: 'Mystic', score: 82190, level: 42, gamesWon: 212, isCurrentUser: false },
    { id: '15', rank: 15, avatar: '🎨', nickname: 'ArtistGamer', score: 76540, level: 40, gamesWon: 201, isCurrentUser: false },
  ];

  // Сортировка игроков
  const sortedPlayers = [...allPlayers].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'level') return b.level - a.level;
    if (sortBy === 'wins') return b.gamesWon - a.gamesWon;
    return 0;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-[#00ff00]" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-300 text-black';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-[#00ff00] text-black';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto"
    >
      {/* Заголовок */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <h1
          className="text-3xl md:text-4xl text-[#00ff00] mb-2"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
          }}
        >
          ЛИДЕРБОРД
        </h1>
        <p
          className="text-[#00ff00]/70 text-xs"
          style={{
            fontFamily: "'Press Start 2P', cursive",
          }}
        >
          ТОП ИГРОКОВ АРКАДЫ
        </p>
      </motion.div>

      {/* Фильтры */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 w-full max-w-4xl"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Временные фильтры */}
          <div className="flex gap-2 flex-wrap justify-center">
            {(['day', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  timeFilter === filter
                    ? 'bg-[#00ff00] text-black border-[#00ff00]'
                    : 'bg-black text-[#00ff00] border-[#00ff00]/50 hover:border-[#00ff00]'
                }`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.6rem',
                  boxShadow: timeFilter === filter ? '0 0 15px #00ff00' : 'none',
                }}
              >
                {filter === 'day' && 'ДЕНЬ'}
                {filter === 'week' && 'НЕДЕЛЯ'}
                {filter === 'month' && 'МЕСЯЦ'}
                {filter === 'all' && 'ВСЁ ВРЕМЯ'}
              </button>
            ))}
          </div>

          {/* Сортировка */}
          <div className="flex gap-2 flex-wrap justify-center">
            {(['score', 'level', 'wins'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  sortBy === sort
                    ? 'bg-[#00ff00] text-black border-[#00ff00]'
                    : 'bg-black text-[#00ff00] border-[#00ff00]/50 hover:border-[#00ff00]'
                }`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.6rem',
                  boxShadow: sortBy === sort ? '0 0 15px #00ff00' : 'none',
                }}
              >
                {sort === 'score' && 'СЧЁТ'}
                {sort === 'level' && 'УРОВЕНЬ'}
                {sort === 'wins' && 'ПОБЕДЫ'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Топ 3 - Подиум */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8 w-full max-w-4xl"
      >
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* 2 место */}
          <PodiumCard player={sortedPlayers[1]} rank={2} delay={0.4} />
          
          {/* 1 место */}
          <PodiumCard player={sortedPlayers[0]} rank={1} delay={0.5} isFirst />
          
          {/* 3 место */}
          <PodiumCard player={sortedPlayers[2]} rank={3} delay={0.6} />
        </div>
      </motion.div>

      {/* Таблица остальных игроков */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-4xl"
      >
        <div
          className="bg-black border-4 border-[#00ff00] rounded-xl p-4 md:p-6"
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)',
          }}
        >
          <div className="space-y-2">
            {sortedPlayers.slice(3).map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                  player.isCurrentUser
                    ? 'bg-[#00ff00]/20 border-[#00ff00] shadow-lg'
                    : 'bg-black/50 border-[#00ff00]/30 hover:border-[#00ff00]'
                }`}
                style={{
                  boxShadow: player.isCurrentUser ? '0 0 20px rgba(0, 255, 0, 0.5)' : '0 0 5px rgba(0, 255, 0, 0.2)',
                }}
              >
                {/* Ранг */}
                <div className="flex items-center justify-center w-12 md:w-16">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${getRankBadge(player.rank)} flex items-center justify-center`}
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: '0.8rem',
                      boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                    }}
                  >
                    #{player.rank}
                  </div>
                </div>

                {/* Аватар */}
                <div
                  className="w-12 h-12 md:w-14 md:h-14 bg-black border-2 border-[#00ff00] rounded-lg flex items-center justify-center text-2xl md:text-3xl flex-shrink-0"
                  style={{
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                  }}
                >
                  {player.avatar}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm md:text-base truncate ${
                      player.isCurrentUser ? 'text-[#00ff00]' : 'text-[#00ff00]/90'
                    }`}
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: '0.7rem',
                    }}
                  >
                    {player.nickname}
                    {player.isCurrentUser && (
                      <span className="ml-2 text-[#00ff00] text-xs">(ВЫ)</span>
                    )}
                  </div>
                  <div
                    className="text-[#00ff00]/60 mt-1 text-xs md:text-sm"
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: '0.5rem',
                    }}
                  >
                    LVL {player.level} • {player.gamesWon} побед
                  </div>
                </div>

                {/* Счёт */}
                <div
                  className="text-right text-[#00ff00] text-sm md:text-lg"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '0.7rem',
                  }}
                >
                  {player.score.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Кнопка назад */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8"
      >
        <button
          onClick={onBack}
          className="px-8 py-4 bg-black border-4 border-[#00ff00] rounded-xl text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.8rem',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
          }}
        >
          НАЗАД
        </button>
      </motion.div>
    </motion.div>
  );
}

// Компонент карточки на подиуме
function PodiumCard({
  player,
  rank,
  delay,
  isFirst = false,
}: {
  player: Player;
  rank: number;
  delay: number;
  isFirst?: boolean;
}) {
  const getRankColor = () => {
    if (rank === 1) return 'border-yellow-400 shadow-yellow-400/50';
    if (rank === 2) return 'border-gray-300 shadow-gray-300/50';
    if (rank === 3) return 'border-amber-600 shadow-amber-600/50';
    return 'border-[#00ff00]';
  };

  const getRankBg = () => {
    if (rank === 1) return 'bg-yellow-400';
    if (rank === 2) return 'bg-gray-300';
    if (rank === 3) return 'bg-amber-600';
    return 'bg-[#00ff00]';
  };

  const height = isFirst ? 'h-56' : 'h-48';

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
      className={`relative ${height}`}
    >
      <div
        className={`h-full bg-black border-4 ${getRankColor()} rounded-xl p-4 flex flex-col items-center justify-between relative overflow-hidden`}
        style={{
          boxShadow: `0 0 30px ${getRankColor().split('-')[1] === 'yellow' ? 'rgba(250, 204, 21, 0.5)' : getRankColor().split('-')[1] === 'gray' ? 'rgba(209, 213, 219, 0.5)' : 'rgba(217, 119, 6, 0.5)'}, inset 0 0 20px rgba(0, 255, 0, 0.1)`,
        }}
      >
        {/* Корона для первого места */}
        {rank === 1 && (
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-8 text-5xl"
          >
            👑
          </motion.div>
        )}

        {/* Ранг */}
        <div
          className={`w-12 h-12 ${getRankBg()} text-black rounded-lg flex items-center justify-center mb-2`}
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '1rem',
            boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
          }}
        >
          {rank}
        </div>

        {/* Аватар */}
        <div
          className="w-16 h-16 bg-black border-2 border-[#00ff00] rounded-lg flex items-center justify-center text-4xl mb-2"
          style={{
            boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
          }}
        >
          {player.avatar}
        </div>

        {/* Никнейм */}
        <div
          className="text-[#00ff00] text-center mb-1 truncate w-full px-1"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.6rem',
          }}
        >
          {player.nickname}
        </div>

        {/* Счёт */}
        <div
          className="text-[#00ff00] text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.8rem',
          }}
        >
          {player.score.toLocaleString()}
        </div>

        {/* Уровень */}
        <div
          className="text-[#00ff00]/70 text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.5rem',
          }}
        >
          LVL {player.level}
        </div>

        {/* Эффект свечения */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00ff00]/10 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
