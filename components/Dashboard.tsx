
import React, { useState, useMemo } from 'react';
import CharacterSheet from './CharacterSheet';
import GameLayout from './GameLayout';
import DungeonList from './DungeonList';
import DungeonView from './DungeonView';
import Inventory from './Inventory';
import FamilyTree from './FamilyTree';
import SocialView from './SocialView';
import GuildView from './GuildView';
import QuestView from './QuestView';
import AchievementsView from './AchievementsView';
import { useGame } from '../context/GameContext';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('character');
  const { state, activeCharacter } = useGame();

  if (!activeCharacter) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Error: Active character not found.</p>
        </div>
    );
  }

  const content = useMemo(() => {
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
  }, [activeTab, state.dungeonState.status]);
  
  return (
    <GameLayout onTabChange={setActiveTab} activeTab={activeTab}>
      <div className="animate-fade-in">
        {content}
      </div>
    </GameLayout>
  );
};

export default Dashboard;
