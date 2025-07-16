
import React from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../data/achievements';
import Card from './ui/Card';
import Button from './ui/Button';

const TrophyIcon = ({ unlocked }: { unlocked: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
        stroke="currentColor"
        className={`w-10 h-10 ${unlocked ? 'text-yellow-400' : 'text-surface-2'}`}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1-4.875-1.928V9.375c0-2.454 1.341-4.695 3.526-5.882A9.734 9.734 0 0 1 12 3c2.39 0 4.63.858 6.349 2.493 2.185 1.187 3.526 3.428 3.526 5.882v7.447A9.75 9.75 0 0 1 16.5 18.75Zm-9-3.75h9" />
    </svg>
);


const AchievementsView: React.FC = () => {
    const { dispatch, activeCharacter } = useGame();
    if (!activeCharacter) return <div>Loading...</div>;

    const unlockedSet = new Set(activeCharacter.unlockedAchievements);

    const handleEquipTitle = (title: string) => {
        const newTitle = activeCharacter.equippedTitle === title ? null : title;
        dispatch({ type: 'EQUIP_TITLE', payload: { characterId: activeCharacter.id, title: newTitle } });
    };

    const achievementList = Object.values(ACHIEVEMENTS);

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Achievements</h1>
            <p className="text-lg text-on-background/80 mb-8">
                Your heroic deeds are recorded here. Equip a title to show off your accomplishments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {achievementList.map(ach => {
                    const isUnlocked = unlockedSet.has(ach.id);
                    const isEquipped = activeCharacter.equippedTitle === ach.title;

                    return (
                        <Card key={ach.id} className={`flex flex-col justify-between transition-all duration-300 ${isUnlocked ? 'bg-surface-2 border border-yellow-500/50' : 'bg-surface-1 opacity-70'}`}>
                            <div>
                                <div className="flex items-center gap-4 mb-3">
                                    <TrophyIcon unlocked={isUnlocked} />
                                    <div>
                                        <h2 className={`text-xl font-bold ${isUnlocked ? 'text-on-surface' : 'text-on-background/60'}`}>{ach.name}</h2>
                                        {isUnlocked && <p className="text-sm font-semibold text-yellow-400">Title: "{ach.title}"</p>}
                                    </div>
                                </div>
                                <p className="text-on-background/80 text-sm">{ach.description}</p>
                            </div>
                            <div className="mt-4">
                                {isUnlocked ? (
                                    <Button
                                        className="w-full"
                                        variant={isEquipped ? "bone" : "shadow"}
                                        onClick={() => handleEquipTitle(ach.title)}
                                    >
                                        {isEquipped ? "Title Equipped" : "Equip Title"}
                                    </Button>
                                ) : (
                                    <Button className="w-full" disabled>
                                        Locked
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsView;
