
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSortedDungeonsByLevel } from '../services/dungeonService';
import Card from './ui/Card';
import Button from './ui/Button';
import { DANGEROUS_DUNGEON_LEVEL_OFFSET } from '../constants';

const ConfirmationModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card className="w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Warning: Dangerous Dungeon</h2>
            <p className="text-on-background/80 mb-6">
                This dungeon is significantly higher level than you and poses a great risk. The monsters will be extremely tough. Are you sure you wish to proceed?
            </p>
            <div className="mt-6 flex justify-end space-x-4">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button 
                    onClick={onConfirm}
                    className="bg-yellow-600 hover:bg-yellow-700 text-on-primary focus:ring-yellow-500"
                >
                    Enter Anyway
                </Button>
            </div>
        </Card>
    </div>
);


const DungeonList: React.FC = () => {
    const { dispatch, activeCharacter } = useGame();
    const [confirmingDungeonId, setConfirmingDungeonId] = useState<string | null>(null);

    if (!activeCharacter) return <div>Loading character...</div>;

    const availableDungeons = getSortedDungeonsByLevel().filter(dungeon => 
        dungeon.levelRequirement <= activeCharacter.level + DANGEROUS_DUNGEON_LEVEL_OFFSET
    );

    const handleEnterClick = (dungeonId: string, isDangerous: boolean) => {
        if (isDangerous) {
            setConfirmingDungeonId(dungeonId);
        } else {
            dispatch({ type: 'START_DUNGEON', payload: { dungeonId } });
        }
    };

    const confirmEnterDungeon = () => {
        if (confirmingDungeonId) {
            dispatch({ type: 'START_DUNGEON', payload: { dungeonId: confirmingDungeonId } });
            setConfirmingDungeonId(null);
        }
    };

    const cancelEnterDungeon = () => {
        setConfirmingDungeonId(null);
    };

    return (
        <div className="animate-fade-in">
            {confirmingDungeonId && (
                <ConfirmationModal 
                    onConfirm={confirmEnterDungeon}
                    onCancel={cancelEnterDungeon}
                />
            )}

            <h1 className="text-4xl font-bold mb-6 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Dungeon Entrance</h1>
            <p className="text-lg text-on-background/80 mb-8">Select your challenge. Dungeons above your level are marked with a warning and offer greater risk for potentially greater reward.</p>
            {availableDungeons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableDungeons.map(dungeon => {
                        const isDangerous = activeCharacter.level < dungeon.levelRequirement;
                        
                        const levelColor = isDangerous ? 'text-yellow-400' : 'text-green-400';
                        const buttonText = isDangerous ? 'Enter (Dangerous)' : 'Enter Dungeon';
                        
                        return (
                            <Card key={dungeon.id} className="flex flex-col justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary mb-2">{dungeon.name}</h2>
                                    <p className="text-on-background/80 mb-4">{dungeon.description}</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <p className="font-semibold">
                                          Req. Level: 
                                          <span className={`${levelColor} font-bold text-lg`}> {dungeon.levelRequirement}</span>
                                      </p>
                                      {isDangerous && <span className="text-xs font-bold bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">WARNING</span>}
                                    </div>
                                    <Button 
                                        onClick={() => handleEnterClick(dungeon.id, isDangerous)}
                                        className={`w-full ${isDangerous ? 'bg-yellow-600 hover:bg-yellow-700 text-on-primary focus:ring-yellow-500' : ''}`}
                                    >
                                        {buttonText}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <p className="text-center p-8 text-on-background/70">There are no new dungeons available at your level. Keep exploring or complete quests to grow stronger!</p>
                </Card>
            )}
        </div>
    );
};

export default DungeonList;
