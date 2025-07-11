
import React, { useState } from 'react';
import CharacterSheet from './components/CharacterSheet';
import GameLayout from './components/GameLayout';
import DungeonList from './components/DungeonList';
import DungeonView from './components/DungeonView';
import Inventory from './components/Inventory';
import FamilyTree from './components/FamilyTree';
import SocialView from './components/SocialView';
import GuildView from './components/GuildView';
import QuestView from './components/QuestView';
import AchievementsView from './components/AchievementsView';
import TutorialModal from './components/TutorialModal'; // Import the new TutorialModal
import { useGame } from './context/GameContext';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('character');
  const { state, dispatch } = useGame(); // Destructure dispatch from useGame

  const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);

  const [showTutorial, setShowTutorial] = useState(!state.tutorialShown); // State to control tutorial visibility

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    dispatch({ type: 'SET_TUTORIAL_SHOWN', payload: true }); // Mark tutorial as shown
  };

  if (!activeCharacter) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Error: Active character not found.</p>
        </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'character':
        return <CharacterSheet />;
      case 'inventory':
        return <Inventory />;
      case 'quests':
        return <QuestView />;
      case 'dungeon':
        return state.dungeonState.status === 'idle' 
            ? <DungeonList /> 
            : <DungeonView />;
      case 'social':
        return <SocialView />;
      case 'guild':
        return <GuildView />;
      case 'achievements':
        return <AchievementsView />;
      case 'family':
        return <FamilyTree />;
      default:
        return <CharacterSheet />;
    }
  };
  
  return (
    <GameLayout onTabChange={setActiveTab} activeTab={activeTab}>
      <div className="animate-fade-in">
        {renderContent()}
      </div>
      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
    </GameLayout>
  );
};

export default Dashboard;
