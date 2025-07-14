
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
        className={`group relative flex-1 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start p-2 md:px-4 md:py-3 text-center md:text-left text-xs md:text-sm font-bold transition-all duration-300 ease-out h-full md:h-auto rounded-lg md:rounded-r-none md:rounded-l-lg ${
            activeTab === tabName 
            ? 'text-red-300 bg-gradient-to-r from-red-900/40 to-red-800/20 border-t-2 md:border-t-0 md:border-r-4 border-red-500 shadow-lg shadow-red-900/30' 
            : 'text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 border-t-2 md:border-t-0 md:border-r-4 border-transparent hover:border-red-600/50'
        }`}
    >
        <div className={`transition-transform duration-300 ${activeTab === tabName ? 'scale-110' : 'group-hover:scale-105'}`}>
            {icon}
        </div>
        <span className={`mt-1 md:mt-0 md:ml-3 hidden lg:inline transition-all duration-300 font-serif ${
            activeTab === tabName ? 'font-bold' : 'group-hover:font-semibold'
        }`}>
            {label}
        </span>
        {activeTab === tabName && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-transparent rounded-lg md:rounded-r-none md:rounded-l-lg" />
        )}
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
      { label: 'Endless', tabName: 'endless', icon: <MapIcon/>, condition: (char?: Character | null) => !!char && char.level >= 1 },
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
      <nav className="order-last md:order-first w-full md:w-20 lg:w-64 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-md flex-shrink-0 md:border-r border-red-900/40
                      fixed bottom-0 md:relative z-20 border-t-2 md:border-t-0 shadow-2xl md:shadow-none
                      before:absolute before:inset-0 before:bg-gradient-to-b before:from-red-950/10 before:to-transparent before:pointer-events-none">
        
        {/* Desktop-only Header */}
        <div className="hidden md:block p-4 border-b border-red-900/50">
           <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent block md:hidden lg:block font-serif">
                IdleRPG
             </h1>
             {activeCharacter && (
                <div className="flex items-center font-bold text-yellow-300 bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm border border-red-800/50">
                    <GoldIcon />
                    <span className="inline md:hidden lg:inline ml-1">{activeCharacter.gold.toLocaleString()}</span>
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
                className={`md:hidden flex-1 flex flex-col items-center justify-center p-1 text-center text-xs font-bold transition-colors duration-200 h-full text-gray-300 hover:bg-gray-800/30 hover:text-gray-100 border-t-2 border-transparent hover:border-red-600/50`}
            >
                <SaveIcon />
                <span className="mt-1 font-serif">Save</span>
            </button>
        </div>

        {/* Desktop-only Save Button */}
        <div className="hidden md:block p-4 mt-auto absolute bottom-0 w-full md:w-20 lg:w-64 space-y-2">
            <Button variant="void" onClick={handleShowTutorial} className="w-full flex items-center justify-center lg:justify-start">
                <QuestionMarkCircleIcon />
                <span className="hidden lg:inline ml-2">Help</span>
            </Button>
            <Button variant="void" onClick={saveGame} className="w-full flex items-center justify-center lg:justify-start">
                <SaveIcon />
                <span className="hidden lg:inline ml-2">Save Game</span>
            </Button>
        </div>
      </nav>

      {/* This wrapper contains the main content AND the mobile-only header */}
      <div className="flex-1 flex flex-col">
          {/* Mobile-only Header */}
          <header className="md:hidden p-4 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md border-b border-red-900/50 flex justify-between items-center sticky top-0 z-10 shadow-lg">
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent font-serif">
                  IdleRPG
              </h1>
              {activeCharacter && (
                  <div className="flex items-center font-bold text-yellow-300 bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm border border-red-800/50">
                      <GoldIcon />
                      <span className="ml-1">{activeCharacter.gold.toLocaleString()}</span>
                  </div>
              )}
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-6">
            {children}
          </main>
      </div>
      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
    </div>
  );
};

export default GameLayout;
