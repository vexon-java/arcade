import { motion } from 'motion/react';
import { PixelButton } from '@/app/components/PixelButton';
import { User, Settings, Users, Trophy, Target, Clock, Zap } from 'lucide-react';
import { useState } from 'react';

interface UserProfileProps {
  onBack: () => void;
  onViewLeaderboard: () => void;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

interface GameStats {
  game: string;
  played: number;
  wins: number;
  highScore: number;
}

export function UserProfile({ onBack, onViewLeaderboard }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Мок-данные пользователя
  const userData = {
    avatar: '🎮',
    nickname: 'CyberGamer',
    level: 42,
    rank: 'МАСТЕР',
    xp: 8750,
    nextLevelXp: 10000,
    totalScore: 125680,
    gamesPlayed: 234,
    totalWins: 156,
    playTime: '48ч 32м',
  };

  const achievements: Achievement[] = [
    { id: '1', name: 'НОВИЧОК', icon: '🎯', description: 'Сыграть первую игру', unlocked: true, date: '01.02.2026' },
    { id: '2', name: 'ЧЕМПИОН', icon: '👑', description: 'Выиграть 100 игр', unlocked: true, date: '05.02.2026' },
    { id: '3', name: 'СКОРОСТЬ', icon: '⚡', description: 'Завершить игру за 30 сек', unlocked: true, date: '10.02.2026' },
    { id: '4', name: 'МАРАФОН', icon: '🏃', description: 'Играть 10 часов', unlocked: true, date: '12.02.2026' },
    { id: '5', name: 'ЛЕГЕНДА', icon: '🌟', description: 'Достичь уровня 50', unlocked: false },
    { id: '6', name: 'КОЛЛЕКЦИОНЕР', icon: '💎', description: 'Получить все достижения', unlocked: false },
  ];

  const gameStats: GameStats[] = [
    { game: 'Snake', played: 45, wins: 32, highScore: 12500 },
    { game: 'Tetris', played: 38, wins: 25, highScore: 98700 },
    { game: 'Checkers', played: 22, wins: 14, highScore: 1850 },
    { game: '2048', played: 31, wins: 19, highScore: 32768 },
    { game: 'Pong', played: 28, wins: 20, highScore: 15 },
  ];

  const progressPercentage = (userData.xp / userData.nextLevelXp) * 100;

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
          className="text-3xl md:text-4xl text-[#00ff00] mb-4"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
          }}
        >
          ПРОФИЛЬ
        </h1>
      </motion.div>

      {/* Контейнер профиля */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Левая колонка - Основная информация */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div
            className="bg-black border-4 border-[#00ff00] rounded-xl p-6 relative"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)',
            }}
          >
            {/* Аватар */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 bg-black border-4 border-[#00ff00] rounded-xl flex items-center justify-center text-6xl mb-4 relative overflow-hidden"
                style={{
                  boxShadow: '0 0 20px #00ff00, inset 0 0 10px rgba(0, 255, 0, 0.2)',
                }}
              >
                <span>{userData.avatar}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-[#00ff00]/20 to-transparent pointer-events-none" />
              </motion.div>
              
              {/* Никнейм */}
              <h2
                className="text-xl md:text-2xl text-[#00ff00] mb-2 text-center break-all"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  textShadow: '0 0 10px #00ff00',
                }}
              >
                {userData.nickname}
              </h2>
              
              {/* Ранг */}
              <div
                className="px-4 py-2 bg-[#00ff00] text-black rounded-lg border-2 border-[#00ff00]"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  boxShadow: '0 0 15px #00ff00',
                  fontSize: '0.7rem',
                }}
              >
                {userData.rank}
              </div>
            </div>

            {/* Уровень и XP */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span
                  className="text-[#00ff00]"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '0.7rem',
                  }}
                >
                  УРОВЕНЬ {userData.level}
                </span>
                <span
                  className="text-[#00ff00]/70"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '0.6rem',
                  }}
                >
                  {userData.xp}/{userData.nextLevelXp} XP
                </span>
              </div>
              
              {/* Прогресс бар */}
              <div className="w-full h-6 bg-black border-2 border-[#00ff00] rounded overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-[#00ff00] relative"
                  style={{
                    boxShadow: '0 0 10px #00ff00',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-3 bg-black border-2 border-[#00ff00] rounded-lg text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.65rem',
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                }}
              >
                <User className="w-4 h-4" />
                РЕДАКТИРОВАТЬ
              </button>
              
              <button
                className="w-full py-3 bg-black border-2 border-[#00ff00] rounded-lg text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.65rem',
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                }}
              >
                <Settings className="w-4 h-4" />
                НАСТРОЙКИ
              </button>
              
              <button
                className="w-full py-3 bg-black border-2 border-[#00ff00] rounded-lg text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.65rem',
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                }}
              >
                <Users className="w-4 h-4" />
                ДРУЗЬЯ
              </button>
            </div>
          </div>
        </motion.div>

        {/* Правая колонка - Достижения и Статистика */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          
          {/* Быстрая статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Trophy className="w-6 h-6" />} label="СЧЁТ" value={userData.totalScore.toLocaleString()} />
            <StatCard icon={<Target className="w-6 h-6" />} label="ИГР" value={userData.gamesPlayed} />
            <StatCard icon={<Zap className="w-6 h-6" />} label="ПОБЕД" value={userData.totalWins} />
            <StatCard icon={<Clock className="w-6 h-6" />} label="ВРЕМЯ" value={userData.playTime} />
          </div>

          {/* Достижения */}
          <div
            className="bg-black border-4 border-[#00ff00] rounded-xl p-6"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)',
            }}
          >
            <h3
              className="text-xl text-[#00ff00] mb-4"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                textShadow: '0 0 10px #00ff00',
              }}
            >
              ДОСТИЖЕНИЯ
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`relative p-4 rounded-lg border-2 ${
                    achievement.unlocked
                      ? 'border-[#00ff00] bg-[#00ff00]/10'
                      : 'border-[#00ff00]/30 bg-black/50 opacity-50'
                  }`}
                  style={{
                    boxShadow: achievement.unlocked ? '0 0 10px rgba(0, 255, 0, 0.3)' : 'none',
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div
                      className={`text-xs mb-1 ${achievement.unlocked ? 'text-[#00ff00]' : 'text-[#00ff00]/50'}`}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: '0.5rem',
                      }}
                    >
                      {achievement.name}
                    </div>
                    <div
                      className={`text-[0.5rem] ${achievement.unlocked ? 'text-[#00ff00]/70' : 'text-[#00ff00]/30'}`}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: '0.4rem',
                      }}
                    >
                      {achievement.description}
                    </div>
                    {achievement.unlocked && achievement.date && (
                      <div
                        className="text-[0.45rem] text-[#00ff00]/50 mt-1"
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                        }}
                      >
                        {achievement.date}
                      </div>
                    )}
                  </div>
                  
                  {achievement.unlocked && (
                    <div className="absolute top-1 right-1 text-[#00ff00] text-xs">✓</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Статистика по играм */}
          <div
            className="bg-black border-4 border-[#00ff00] rounded-xl p-6"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)',
            }}
          >
            <h3
              className="text-xl text-[#00ff00] mb-4"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                textShadow: '0 0 10px #00ff00',
              }}
            >
              СТАТИСТИКА ИГР
            </h3>
            
            <div className="space-y-3">
              {gameStats.map((stat, index) => (
                <motion.div
                  key={stat.game}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-black/50 border border-[#00ff00]/30 rounded-lg hover:border-[#00ff00] transition-all"
                  style={{
                    boxShadow: '0 0 5px rgba(0, 255, 0, 0.2)',
                  }}
                >
                  <div className="flex-1">
                    <div
                      className="text-[#00ff00] mb-1"
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: '0.7rem',
                      }}
                    >
                      {stat.game}
                    </div>
                    <div
                      className="text-[#00ff00]/70"
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: '0.5rem',
                      }}
                    >
                      Игр: {stat.played} • Побед: {stat.wins} • WR: {Math.round((stat.wins / stat.played) * 100)}%
                    </div>
                  </div>
                  <div
                    className="text-[#00ff00] text-right"
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: '0.65rem',
                    }}
                  >
                    {stat.highScore.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Кнопки навигации */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-4 mt-8 justify-center"
      >
        <button
          onClick={onViewLeaderboard}
          className="px-8 py-4 bg-black border-4 border-[#00ff00] rounded-xl text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.8rem',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
          }}
        >
          ЛИДЕРБОРД
        </button>
        
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

// Компонент карточки статистики
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-black border-2 border-[#00ff00] rounded-lg p-4 flex flex-col items-center justify-center"
      style={{
        boxShadow: '0 0 10px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1)',
      }}
    >
      <div className="text-[#00ff00] mb-2">{icon}</div>
      <div
        className="text-[#00ff00]/70 mb-1 text-center"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '0.5rem',
        }}
      >
        {label}
      </div>
      <div
        className="text-[#00ff00] text-center"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '0.8rem',
        }}
      >
        {value}
      </div>
    </motion.div>
  );
}