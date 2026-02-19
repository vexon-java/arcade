import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { MainMenu } from '@/app/components/MainMenu';
import { GameSelectionMenu } from '@/app/components/GameSelectionMenu';
import { InteractiveBackground } from '@/app/components/InteractiveBackground';

const API_URL = import.meta.env.VITE_API_URL || '';
import { CursorAura } from '@/app/components/CursorAura';
import { UserProfile } from '@/app/components/UserProfile';
import { Leaderboard } from '@/app/components/Leaderboard';
import { GameStatusOverlay } from '@/app/components/GameStatusOverlay';

// Import all games
import { SnakeGame } from '@/app/games/SnakeGame';
import { TicTacToeGame } from '@/app/games/TicTacToeGame';
import { TetrisGame } from '@/app/games/TetrisGame';

import { PongGame } from '@/app/games/PongGame';
import { ArkanoidGame } from '@/app/games/ArkanoidGame';
import { MazeGame } from '@/app/games/MazeGame';
import { MemoryGame } from '@/app/games/MemoryGame';
import { MinesweeperGame } from '@/app/games/MinesweeperGame';
import { CheckersGame } from '@/app/games/CheckersGame';
import { RacingGame } from '@/app/games/RacingGame';
import { ClickerGame } from '@/app/games/ClickerGame';
import { QuizGame } from '@/app/games/QuizGame';
import { PlatformerGame } from '@/app/games/PlatformerGame';
import { BattleshipGame } from '@/app/games/BattleshipGame';
import { StickmanGame } from '@/app/games/StickmanGame';
import { Auth } from '@/app/components/Auth';

type Screen = 'main' | 'game-selection' | 'game' | 'profile' | 'leaderboard';
type GameId = 'snake' | 'tictactoe' | 'tetris' | 'stickman' | 'pong' | 'arkanoid' | 'maze' | 'memory' | 'minesweeper' | 'checkers' | 'racing' | 'clicker' | 'quiz' | 'platformer' | 'battleship';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>('currentUser', null);
  const [theme, setTheme] = useLocalStorage<'cyan' | 'green' | 'red'>('app_theme', 'cyan');

  // Default initial data for new users
  const defaultUserData = {
    avatar: '🎮',
    nickname: 'CyberGamer',
    level: 1,
    rank: 'НОВИЧОК',
    xp: 0,
    nextLevelXp: 1000,
    totalScore: 0,
    gamesPlayed: 0,
    totalWins: 0,
    playTime: '0ч 0м',
  };

  const [userData, setUserData] = useState(defaultUserData);

  const syncUserData = async (username: string, data: any) => {
    try {
      await fetch(`${API_URL}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Failed to sync data with server:', err);
    }
  };

  // Sync userData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const usersJson = localStorage.getItem('arcade_users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        if (users[currentUser]) {
          setUserData(users[currentUser].data);
        }
      }
    }
  }, [currentUser]);

  // Wrapper for updating user data and persisting it
  const updateUserData = (updater: any) => {
    setUserData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      if (currentUser) {
        syncUserData(currentUser, newData);
      }
      return newData;
    });
  };

  const handleLogin = (data: any, username: string) => {
    setUserData(data);
    setCurrentUser(username);
    setCurrentScreen('main');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('main');
  };

  const handlePlay = () => {
    setCurrentScreen('game-selection');
  };

  const handleExit = () => {
    if (confirm('Вы уверены, что хотите выйти из учетной записи?')) {
      handleLogout();
    }
  };

  const handleProfile = () => {
    setCurrentScreen('profile');
  };

  const handleLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBack = () => {
    setCurrentScreen('main');
    setSelectedGame(null);
  };

  const [gameStatus, setGameStatus] = useState<'victory' | 'defeat' | null>(null);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId as GameId);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('game-selection');
    setSelectedGame(null);
  };

  const handleGameOver = (score: number, type: 'victory' | 'defeat' = 'defeat') => {
    setGameStatus(type);
    updateUserData((prev: any) => {
      const xpGained = Math.floor(score / 10) + (type === 'victory' ? 50 : 0);
      let newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let newNextLevelXp = prev.nextLevelXp;

      // Level up logic
      while (newXp >= newNextLevelXp) {
        newXp -= newNextLevelXp;
        newLevel += 1;
        newNextLevelXp = Math.floor(newNextLevelXp * 1.2);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextLevelXp,
        totalScore: prev.totalScore + score,
        gamesPlayed: prev.gamesPlayed + 1,
        totalWins: type === 'victory' ? prev.totalWins + 1 : prev.totalWins,
      };
    });
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'snake':
        return <SnakeGame onBack={handleBackToMenu} onGameOver={handleGameOver} theme={theme} />;
      case 'tictactoe':
        return <TicTacToeGame onBack={handleBackToMenu} theme={theme} />;
      case 'tetris':
        return <TetrisGame onBack={handleBackToMenu} theme={theme} />;
      case 'stickman':
        return <StickmanGame onBack={handleBackToMenu} theme={theme} />;
      case 'pong':
        return <PongGame onBack={handleBackToMenu} theme={theme} />;
      case 'arkanoid':
        return <ArkanoidGame onBack={handleBackToMenu} theme={theme} />;
      case 'maze':
        return <MazeGame onBack={handleBackToMenu} theme={theme} />;
      case 'memory':
        return <MemoryGame onBack={handleBackToMenu} theme={theme} />;
      case 'minesweeper':
        return <MinesweeperGame onBack={handleBackToMenu} theme={theme} />;
      case 'checkers':
        return <CheckersGame onBack={handleBackToMenu} theme={theme} />;
      case 'racing':
        return <RacingGame onBack={handleBackToMenu} theme={theme} />;
      case 'clicker':
        return <ClickerGame onBack={handleBackToMenu} theme={theme} />;
      case 'quiz':
        return <QuizGame onBack={handleBackToMenu} theme={theme} />;
      case 'platformer':
        return <PlatformerGame onBack={handleBackToMenu} onGameOver={handleGameOver} theme={theme} />;
      case 'battleship':
        return <BattleshipGame onBack={handleBackToMenu} onGameOver={handleGameOver} theme={theme} />;
      default:
        return <div>Игра не найдена</div>;
    }
  };

  return (
    <div className={`size-full text-foreground relative overflow-hidden bg-black font-mono crt-screen theme-${theme}`}>
      <InteractiveBackground theme={theme} />
      <CursorAura />

      <div className="relative z-10 size-full flex items-center justify-center">
        {!currentUser ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <AnimatePresence mode="wait">
            {currentScreen === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="size-full"
              >
                <MainMenu
                  onPlay={handlePlay}
                  onExit={handleLogout}
                  onProfile={handleProfile}
                  onLeaderboard={handleLeaderboard}
                  nickname={userData.nickname}
                  currentTheme={theme}
                  onThemeChange={setTheme}
                />
              </motion.div>
            )}

            {currentScreen === 'game-selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="size-full"
              >
                <GameSelectionMenu onBack={handleBack} onSelectGame={handleSelectGame} />
              </motion.div>
            )}

            {currentScreen === 'game' && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="size-full"
              >
                {renderGame()}
              </motion.div>
            )}

            {currentScreen === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="size-full"
              >
                <UserProfile
                  onBack={handleBack}
                  onViewLeaderboard={handleLeaderboard}
                  userData={userData}
                  setUserData={updateUserData}
                  username={currentUser}
                />
              </motion.div>
            )}

            {currentScreen === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="size-full"
              >
                <Leaderboard onBack={handleBack} currentUserData={userData} currentUsername={currentUser!} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <GameStatusOverlay
        type={gameStatus}
        onFinished={() => setGameStatus(null)}
      />
    </div>
  );
}