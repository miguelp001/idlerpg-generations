
import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import Button from './ui/Button';
import { Character } from '../types';
import { UserIcon, BackpackIcon, MapIcon, UsersIcon, UserGroupIcon, ShieldCheckIcon, BookOpenIcon, TrophyIcon, GoldIcon, SaveIcon, QuestionMarkCircleIcon } from './ui/Icons';
import TutorialModal from './TutorialModal';

interface GameLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItemProps {
    label: string;
    tabName: string;
    activeTab: string;
    onClick: (tab: string) => void;
    icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = React.memo(({ label, tabName, activeTab, onClick, icon }) => (
    <button
        title={label}
        onClick={() => onClick(tabName)}
        className={`flex-1 md:w-full flex flex-col items-center justify-center p-1 md:px-4 md:py-3 text-center md:text-left text-xs md:text-base font-semibold transition-colors duration-200 h-full md:h-auto ${
            activeTab === tabName 
            ? 'text-primary bg-primary/10 border-t-2 md:border-t-0 md:border-r-4 border-primary' 
            : 'text-on-background/70 hover:bg-surface-2 hover:text-on-surface border-t-2 md:border-t-0 md:border-r-4 border-transparent'
        }`}
    >
        {icon}
        <span className="mt-1 md:mt-0 md:ml-3 hidden lg:inline">{label}</span>
    </button>
));


const GameLayout: React.FC<GameLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { saveGame, activeCharacter, dispatch, state } = useGame(); // Destructure dispatch and state
  const [showTutorial, setShowTutorial] = React.useState(false); // State for tutorial modal visibility

  const handleShowTutorial = () => {
    setShowTutorial(true);
    dispatch({ type: 'SET_TUTORIAL_SHOWN', payload: true }); // Mark tutorial as shown when opened via button
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };
  
  const navItems = useMemo(() => {
    const allNavItems = [
      { label: 'Character', tabName: 'character', icon: <UserIcon/>, condition: (char?: Character | null) => true },
      { label: 'Inventory', tabName: 'inventory', icon: <BackpackIcon/>, condition: (char?: Character | null) => true },
      { label: 'Quests', tabName: 'quests', icon: <BookOpenIcon/>, condition: (char?: Character | null) => true },
      { label: 'Dungeon', tabName: 'dungeon', icon: <MapIcon/>, condition: (char?: Character | null) => true },
      { label: 'Social', tabName: 'social', icon: <UserGroupIcon/>, condition: (char?: Character | null) => !!char && char.level >= 1 },
      { label: 'Guild', tabName: 'guild', icon: <ShieldCheckIcon />, condition: (char?: Character | null) => !!char && char.level >= 20 },
      { label: 'Achievements', tabName: 'achievements', icon: <TrophyIcon />, condition: (char?: Character | null) => true },
      { label: 'Family Tree', tabName: 'family', icon: <UsersIcon/>, condition: (char?: Character | null) => !!char && char.generation >= 2 },
    ];
    return allNavItems.filter(item => item.condition(activeCharacter));
  }, [activeCharacter]);


  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="order-last md:order-first w-full md:w-20 lg:w-64 bg-surface-1 flex-shrink-0 md:border-r border-surface-2
                      fixed bottom-0 md:relative z-20 border-t-2 md:border-t-0">
        
        {/* Desktop-only Header */}
        <div className="hidden md:block p-4 border-b border-surface-2">
           <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-primary block md:hidden lg:block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                IdleRPG
             </h1>
             {activeCharacter && (
                <div className="flex items-center font-bold text-yellow-400 bg-black/20 px-3 py-1 rounded-full text-sm">
                    <GoldIcon />
                    <span className="inline md:hidden lg:inline">{activeCharacter.gold.toLocaleString()}</span>
                </div>
              )}
           </div>
        </div>

        {/* Nav Items container */}
        <div className="flex flex-row md:flex-col justify-around md:justify-start h-16 md:h-auto">
          {navItems.map(item => (
            <NavItem key={item.tabName} {...item} activeTab={activeTab} onClick={onTabChange} />
          ))}
          {/* Mobile-only Save Button */}
           <button
                title="Save Game"
                onClick={saveGame}
                className={`md:hidden flex-1 flex flex-col items-center justify-center p-1 text-center text-xs font-semibold transition-colors duration-200 h-full text-on-background/70 hover:bg-surface-2 hover:text-on-surface border-t-2 border-transparent`}
            >
                <SaveIcon />
                <span className="mt-1">Save</span>
            </button>
        </div>

        {/* Desktop-only Save Button */}
        <div className="hidden md:block p-4 mt-auto absolute bottom-0 w-full md:w-20 lg:w-64 space-y-2">
            <Button variant="ghost" onClick={handleShowTutorial} className="w-full flex items-center justify-center lg:justify-start">
                <QuestionMarkCircleIcon />
                <span className="hidden lg:inline ml-2">Help</span>
            </Button>
            <Button variant="ghost" onClick={saveGame} className="w-full flex items-center justify-center lg:justify-start">
                <SaveIcon />
                <span className="hidden lg:inline ml-2">Save Game</span>
            </Button>
        </div>
      </nav>

      {/* This wrapper contains the main content AND the mobile-only header */}
      <div className="flex-1 flex flex-col">
          {/* Mobile-only Header */}
          <header className="md:hidden p-3 bg-surface-1 border-b border-surface-2 flex justify-between items-center sticky top-0 z-10">
              <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  IdleRPG
              </h1>
              {activeCharacter && (
                  <div className="flex items-center font-bold text-yellow-400 bg-black/20 px-3 py-1 rounded-full text-sm">
                      <GoldIcon />
                      <span>{activeCharacter.gold.toLocaleString()}</span>
                  </div>
              )}
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background pb-20 md:pb-6">
            {children}
          </main>
      </div>
      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
    </div>
  );
};

export default GameLayout;
