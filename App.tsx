
import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import CharacterCreator from './components/CharacterCreator';
import Dashboard from './components/Dashboard';
import RaidView from './components/RaidView';

const AppContent: React.FC = () => {
    const { state } = useGame();

    if (!state.isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-black">
                <div className="text-center">
                    <div className="relative">
                        {/* Dark magical spinning rune */}
                        <div className="w-20 h-20 border-4 border-red-800/60 rounded-full animate-spin border-t-red-600 shadow-2xl shadow-red-900/50"></div>
                        <div className="absolute inset-2 w-16 h-16 border-2 border-transparent rounded-full animate-pulse border-t-red-500/80"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-red-500 text-2xl animate-pulse">🗡️</div>
                        </div>
                    </div>
                    <p className="mt-8 text-xl text-red-200 font-bold font-serif">Loading Dark Grimoire...</p>
                    <div className="mt-4 w-40 h-2 bg-gray-800/80 rounded-full mx-auto overflow-hidden border border-red-900/50">
                        <div className="h-full bg-gradient-to-r from-red-700 to-red-600 rounded-full animate-pulse shadow-inner"></div>
                    </div>
                    <p className="mt-3 text-sm text-gray-400 font-serif italic">Awakening ancient evils...</p>
                </div>
            </div>
        );
    }

    if (state.raidState.status !== 'idle') {
        return <RaidView />;
    }

    const hasActiveCharacter = state.characters.some(c => c.id === state.activeCharacterId && c.status === 'active');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-serif">
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
