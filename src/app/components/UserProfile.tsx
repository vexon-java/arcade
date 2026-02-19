import { motion } from 'motion/react';
import { PixelButton } from '@/app/components/PixelButton';
import { Settings, Users, Trophy, Activity, Zap, Target } from 'lucide-react';
import { useState } from 'react';

// Sub-components
import { AvatarPicker } from './UserProfile/AvatarPicker';
import { AchievementGrid } from './UserProfile/AchievementGrid';
import { StatSection } from './UserProfile/StatSection';
import { FriendList } from './UserProfile/FriendList';
import { SettingsView } from './UserProfile/SettingsView';

// Data
import { achievements, gameStats, initialFriends } from '@/app/data/userProfileData';

interface UserProfileProps {
  onBack: () => void;
  onViewLeaderboard: () => void;
  userData: any;
  setUserData: (data: any) => void;
  username: string;
}

export function UserProfile({ onBack, onViewLeaderboard, userData, setUserData, username }: UserProfileProps) {
  const [activeView, setActiveView] = useState<'main' | 'avatars' | 'settings' | 'friends'>('main');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');

  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    effects: true,
    notifications: false,
  });

  const [friends] = useState(initialFriends);

  const handleStartEditNickname = () => {
    setTempNickname(userData.nickname);
    setIsEditingNickname(true);
  };

  const handleSaveNickname = () => {
    if (tempNickname.trim()) {
      setUserData({ ...userData, nickname: tempNickname.trim() });
    }
    setIsEditingNickname(false);
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  const progressPercentage = (userData.xp / userData.nextLevelXp) * 100;

  if (activeView === 'avatars') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black border-4 border-[var(--primary)] rounded-xl p-8 arcade-glow">
          <AvatarPicker
            currentAvatar={userData.avatar}
            onSelect={(avatar) => {
              setUserData({ ...userData, avatar });
              setActiveView('main');
            }}
            onCancel={() => setActiveView('main')}
          />
        </div>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black border-4 border-[var(--primary)] rounded-xl p-8 shadow-[0_0_30px_var(--primary)]">
          <SettingsView
            settings={settings}
            onUpdate={toggleSetting}
            onDone={() => setActiveView('main')}
          />
        </div>
      </div>
    );
  }

  if (activeView === 'friends') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black border-4 border-[var(--primary)] rounded-xl p-8 h-[80vh] flex flex-col shadow-[0_0_30px_var(--primary)]">
          <FriendList
            friends={friends}
            onBack={() => setActiveView('main')}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full h-full flex flex-col items-center justify-start p-8 overflow-y-auto custom-scrollbar"
    >
      <div className="w-full max-w-7xl">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-12 border-b-2 border-[var(--primary)]/20 pb-8">
          <div className="flex items-center gap-6">
            <PixelButton onClick={onBack} size="small" variant="secondary">
              BACK
            </PixelButton>
            <div>
              <h1 className="text-3xl font-black text-[var(--primary)] tracking-tighter italic uppercase" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                USER_DASHBOARD
              </h1>
              <p className="text-[10px] text-[var(--primary)]/40 font-mono tracking-widest mt-1">CONNECTED_AS: {username.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <PixelButton onClick={() => setActiveView('friends')} variant="secondary" size="small">
              <Users className="w-4 h-4 mr-2" />
              SOCIAL
            </PixelButton>
            <PixelButton onClick={() => setActiveView('settings')} variant="secondary" size="small">
              <Settings className="w-4 h-4 mr-2" />
              SYSTEM
            </PixelButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/80 border-2 border-[var(--primary)] rounded-2xl p-8 relative overflow-hidden arcade-glow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 -mr-16 -mt-16 rounded-full blur-3xl" />

              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveView('avatars')}
                  className="w-40 h-40 bg-black border-4 border-[var(--primary)] rounded-2xl flex items-center justify-center text-7xl mb-6 cursor-pointer group relative overflow-hidden"
                >
                  {userData.avatar}
                  <div className="absolute inset-0 bg-[var(--primary)]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <span className="text-[10px] text-white font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>MODIFY</span>
                  </div>
                </motion.div>

                <div className="text-center w-full">
                  {isEditingNickname ? (
                    <input
                      autoFocus
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      onBlur={handleSaveNickname}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                      className="bg-black border-2 border-[var(--primary)] text-[var(--primary)] outline-none text-center w-full p-2 mb-2 rounded font-mono text-lg"
                    />
                  ) : (
                    <h2
                      className="text-2xl text-[var(--primary)] font-black tracking-tighter mb-1 cursor-pointer hover:text-white transition-colors"
                      style={{ fontFamily: "'Press Start 2P', cursive" }}
                      onClick={handleStartEditNickname}
                    >
                      {userData.nickname.toUpperCase()}
                    </h2>
                  )}
                  <div className="inline-block px-3 py-1 bg-[var(--primary)] text-black font-black text-[10px] rounded mb-6 italic">
                    {userData.rank}
                  </div>
                </div>

                {/* Level Detail */}
                <div className="w-full p-4 bg-[var(--primary)]/5 border-2 border-[var(--primary)]/20 rounded-xl">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-[10px] text-[var(--primary)]/60 font-mono tracking-widest">POWER_LVL</div>
                    <div className="text-xl text-[var(--primary)] font-black italic">{userData.level}</div>
                  </div>
                  <div className="h-3 w-full bg-black border border-[var(--primary)]/20 rounded-full p-0.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className="h-full bg-[var(--primary)] rounded-full arcade-glow"
                    />
                  </div>
                  <div className="mt-2 text-[8px] text-right text-[var(--primary)]/40 font-mono uppercase">
                    {userData.nextLevelXp - userData.xp} XP to next evolution
                  </div>
                </div>
              </div>
            </div>

            <PixelButton onClick={onViewLeaderboard} className="w-full arcade-glow border-[var(--primary)] text-[var(--primary)]">
              <Trophy className="w-5 h-5 mr-3" />
              GLOBAL RANKINGS
            </PixelButton>
          </div>

          {/* Right: Data Streams */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'WINS', value: userData.totalWins, icon: Zap, color: 'var(--primary)' },
                { label: 'SCORE', value: userData.totalScore.toLocaleString(), icon: Target, color: 'var(--primary)' },
                { label: 'GAMES', value: userData.gamesPlayed, icon: Activity, color: 'var(--primary)' },
                { label: 'HOURS', value: userData.playTime, icon: Trophy, color: 'var(--primary)' },
              ].map((s, i) => (
                <div key={i} className="bg-black border-2 border-[var(--primary)]/10 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <s.icon className="w-4 h-4 mb-2 opacity-50" style={{ color: s.color }} />
                  <div className="text-lg font-black text-white">{s.value}</div>
                  <div className="text-[8px] text-[var(--primary)]/40 font-mono tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <StatSection userData={userData} gameStats={gameStats} />
            <AchievementGrid achievements={achievements} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}