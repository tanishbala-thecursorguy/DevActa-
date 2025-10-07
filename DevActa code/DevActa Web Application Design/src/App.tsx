import React, { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider, useUser, UserProfile } from "./contexts/UserContext";
import { Navigation } from "./components/Navigation";
import { FuturisticLandingPage } from "./components/FuturisticLandingPage";
import { ProfileSetupSurvey } from "./components/ProfileSetupSurvey";
import { FeedPage } from "./components/FeedPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { ArcadeGamesPage } from "./components/ArcadeGamesPage";
import { HackathonsPage } from "./components/HackathonsPage";
import { ChallengesPage } from "./components/ChallengesPage";
import { ProfilePage } from "./components/ProfilePage";
import { HiringPage } from "./components/HiringPage";
import { SettingsPage } from "./components/SettingsPage";
import { MapPage } from "./components/MapPage";
import { RetroGameInterface } from "./components/RetroGameInterface";

function AppContent() {
  const [appState, setAppState] = useState<'landing' | 'survey' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState("feed");
  const [selectedGame, setSelectedGame] = useState<{ id: number; title: string } | null>(null);
  const [gameState, setGameState] = useState<'games' | 'retro-interface'>('games');
  const { setUserProfile } = useUser();

  const handleGetStarted = () => {
    setAppState('survey');
  };

  const handleProfileComplete = (profileData: UserProfile) => {
    setUserProfile(profileData);
    setAppState('app');
  };

  const handlePageChange = (page: string) => {
    console.log("Page changing to:", page);
    setCurrentPage(page);
    // Reset game state when navigating away from games
    if (page !== 'games') {
      setGameState('games');
      setSelectedGame(null);
    }
  };

  const handleGameSelect = (gameId: number, gameTitle: string) => {
    setSelectedGame({ id: gameId, title: gameTitle });
    setGameState('retro-interface');
  };

  const handleBackToGames = () => {
    setGameState('games');
    setSelectedGame(null);
  };

  const handleStartGame = () => {
    // Games now play within the RetroGameInterface, no need to change state
    console.log('Game started within arcade interface');
  };

  const renderPage = () => {
    console.log("Rendering page:", currentPage);
    
    // Handle games page with different states
    if (currentPage === "games") {
      if (gameState === 'retro-interface' && selectedGame) {
        return (
          <RetroGameInterface
            gameTitle={selectedGame.title}
            onBack={handleBackToGames}
            onStartGame={handleStartGame}
          />
        );
      } else {
        return <ArcadeGamesPage onGameSelect={handleGameSelect} />;
      }
    }
    
    // Handle other pages
    switch (currentPage) {
      case "feed":
        return <FeedPage onPageChange={handlePageChange} />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "map":
        return <MapPage />;
      case "hackathons":
        return <HackathonsPage />;
      case "challenges":
        return <ChallengesPage />;
      case "profile":
        return <ProfilePage />;
      case "hiring":
        return <HiringPage onPageChange={handlePageChange} />;
      case "settings":
        return <SettingsPage />;
      default:
        return <FeedPage onPageChange={handlePageChange} />;
    }
  };

  // Render based on app state
  if (appState === 'landing') {
    return <FuturisticLandingPage onGetStarted={handleGetStarted} />;
  }

  if (appState === 'survey') {
    return <ProfileSetupSurvey onComplete={handleProfileComplete} />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Show navigation when not in retro interface */}
        {!(currentPage === 'games' && gameState === 'retro-interface') && (
          <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
        )}
        {renderPage()}
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}