
import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import CharacterCreator from './components/CharacterCreator';
import Dashboard from './components/Dashboard';
import RaidView from './components/RaidView';

const AppContent: React.FC = () => {
    const { state } = useGame();

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="mt-4 text-lg text-on-background">Loading Game Data...</p>
                </div>
            </div>
        );
    }

    if (state.raidState.status !== 'idle') {
        return <RaidView />;
    }

    const hasActiveCharacter = state.characters.some(c => c.id === state.activeCharacterId && c.status === 'active');

    return (
        <div className="min-h-screen bg-background text-on-background font-sans">
            {hasActiveCharacter ? <Dashboard /> : <CharacterCreator />}
        </div>
    );
};


const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
