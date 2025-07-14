
import React, { useState, useEffect, useCallback } from 'react';
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
import { EndlessDungeonView } from './components/EndlessDungeonView';
import TutorialModal from './components/TutorialModal'; // Import the new TutorialModal
import { useGame } from './context/GameContext';

const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering...');
  const [activeTab, setActiveTab] = useState('character');
  console.log('Dashboard initial activeTab:', activeTab);
  const { state, dispatch } = useGame(); // Destructure dispatch from useGame
  
  const handleTabChange = useCallback((tab: string) => {
    console.log('Dashboard handleTabChange called with:', tab);
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    console.log('Dashboard activeTab changed to:', activeTab);
  }, [activeTab]);

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
    console.log('Dashboard renderContent - activeTab:', activeTab);
    console.log('About to switch on activeTab:', activeTab, typeof activeTab);
    
    switch (activeTab) {
      case 'character':
        console.log('Rendering CharacterSheet');
        return <CharacterSheet />;
      case 'inventory':
        console.log('Rendering Inventory');
        return <Inventory />;
      case 'quests':
        console.log('Rendering QuestView');
        return <QuestView />;
      case 'dungeon':
        console.log('Rendering Dungeon');
        return state.dungeonState.status === 'idle' 
            ? <DungeonList /> 
            : <DungeonView />;
      case 'endless':
        console.log('Rendering EndlessDungeonView');
        return <EndlessDungeonView />;
      case 'social':
        console.log('Rendering SocialView');
        return <SocialView />;
      case 'guild':
        console.log('Rendering GuildView');
        return <GuildView />;
      case 'achievements':
        console.log('Rendering AchievementsView');
        return <AchievementsView />;
      case 'family':
        console.log('Rendering FamilyTree');
        return <FamilyTree />;
      default:
        console.log('Rendering default CharacterSheet');
        return <CharacterSheet />;
    }
  };
  
  console.log('Dashboard render - handleTabChange:', typeof handleTabChange, handleTabChange);
  
  return (
    <GameLayout onTabChange={handleTabChange} activeTab={activeTab}>
      <div className="animate-fade-in">
        {renderContent()}
      </div>
      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
    </GameLayout>
  );
};

export default Dashboard;
