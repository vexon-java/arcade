import { useState } from 'react';
import { MainMenu } from '@/app/components/MainMenu';
import { GameSelectionMenu } from '@/app/components/GameSelectionMenu';
import { BackgroundEffect } from '@/app/components/BackgroundEffect';
import { CursorAura } from '@/app/components/CursorAura';
import { UserProfile } from '@/app/components/UserProfile';
import { Leaderboard } from '@/app/components/Leaderboard';

// Import all games
import { SnakeGame } from '@/app/games/SnakeGame';
import { TicTacToeGame } from '@/app/games/TicTacToeGame';
import { TetrisGame } from '@/app/games/TetrisGame';
import { Game2048 } from '@/app/games/Game2048';
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

type Screen = 'main' | 'game-selection' | 'game' | 'profile' | 'leaderboard';
type GameId = 'snake' | 'tictactoe' | 'tetris' | '2048' | 'pong' | 'arkanoid' | 'maze' | 'memory' | 'minesweeper' | 'checkers' | 'racing' | 'clicker' | 'quiz' | 'platformer' | 'battleship';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const handlePlay = () => {
    setCurrentScreen('game-selection');
  };

  const handleExit = () => {
    console.log('Выход из приложения');
    if (confirm('Вы уверены, что хотите выйти?')) {
      window.close();
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

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId as GameId);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('game-selection');
    setSelectedGame(null);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'snake':
        return <SnakeGame onBack={handleBackToMenu} />;
      case 'tictactoe':
        return <TicTacToeGame onBack={handleBackToMenu} />;
      case 'tetris':
        return <TetrisGame onBack={handleBackToMenu} />;
      case '2048':
        return <Game2048 onBack={handleBackToMenu} />;
      case 'pong':
        return <PongGame onBack={handleBackToMenu} />;
      case 'arkanoid':
        return <ArkanoidGame onBack={handleBackToMenu} />;
      case 'maze':
        return <MazeGame onBack={handleBackToMenu} />;
      case 'memory':
        return <MemoryGame onBack={handleBackToMenu} />;
      case 'minesweeper':
        return <MinesweeperGame onBack={handleBackToMenu} />;
      case 'checkers':
        return <CheckersGame onBack={handleBackToMenu} />;
      case 'racing':
        return <RacingGame onBack={handleBackToMenu} />;
      case 'clicker':
        return <ClickerGame onBack={handleBackToMenu} />;
      case 'quiz':
        return <QuizGame onBack={handleBackToMenu} />;
      case 'platformer':
        return <PlatformerGame onBack={handleBackToMenu} />;
      case 'battleship':
        return <BattleshipGame onBack={handleBackToMenu} />;
      default:
        return <div>Игра не найдена</div>;
    }
  };

  return (
    <div className="size-full bg-black text-[#00ff00] relative overflow-hidden">
      <BackgroundEffect />
      <CursorAura />
      
      <div className="relative z-10 size-full flex items-center justify-center">
        {currentScreen === 'main' && (
          <MainMenu 
            onPlay={handlePlay} 
            onExit={handleExit}
            onProfile={handleProfile}
            onLeaderboard={handleLeaderboard}
          />
        )}
        
        {currentScreen === 'game-selection' && (
          <GameSelectionMenu onBack={handleBack} onSelectGame={handleSelectGame} />
        )}
        
        {currentScreen === 'game' && renderGame()}
        
        {currentScreen === 'profile' && (
          <UserProfile 
            onBack={handleBack}
            onViewLeaderboard={handleLeaderboard}
          />
        )}
        
        {currentScreen === 'leaderboard' && (
          <Leaderboard onBack={handleBack} />
        )}
      </div>
    </div>
  );
}