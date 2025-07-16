import React, { useState } from 'react';
import { generateProceduralDungeon } from '../services/proceduralDungeonService';
import { Character } from '../types';
import { useGame } from '../context/GameContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Toggle from './ui/Toggle';

export const EndlessDungeonView: React.FC = () => {
    const { state, dispatch } = useGame();
    const [selectedFloor, setSelectedFloor] = useState<number>(1);
    
    const activeCharacter = state.characters.find((c: Character) => c.id === state.activeCharacterId);
    
    if (!activeCharacter) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Endless Dungeons</h2>
                <p className="text-gray-400">No active character selected.</p>
            </Card>
        );
    }

    const currentProgress = activeCharacter.endlessDungeonProgress || 1;
    const maxSelectableFloor = Math.max(1, currentProgress);
    const isInDungeon = state.dungeonState.status !== 'idle';
    
    const handleFloorSelect = (floor: number) => {
        setSelectedFloor(floor);
    };

    const handleStartEndlessDungeon = () => {
        if (isInDungeon) return;
        
        try {
            generateProceduralDungeon(selectedFloor, activeCharacter.level);
            
            // For now, we'll use the existing dungeon system by creating a temporary dungeon
            // In a full implementation, you'd want to extend the dungeon system to handle procedural dungeons
            dispatch({
                type: 'START_ENDLESS_DUNGEON',
                payload: {
                    characterId: activeCharacter.id,
                    floor: selectedFloor
                }
            });
        } catch (error) {
            console.error('Failed to generate procedural dungeon:', error);
        }
    };

    const renderFloorSelector = () => {
        const floors = [];
        const maxDisplayFloors = Math.min(maxSelectableFloor + 5, 100); // Show up to 100 floors or current + 5
        
        for (let i = 1; i <= maxDisplayFloors; i++) {
            const isUnlocked = i <= maxSelectableFloor;
            const isSelected = i === selectedFloor;
            const isMilestone = i % 5 === 0;
            
            floors.push(
                <button
                    key={i}
                    onClick={() => isUnlocked && handleFloorSelect(i)}
                    disabled={!isUnlocked}
                    className={`
                        px-3 py-2 m-1 rounded-lg text-sm font-bold transition-all duration-300 transform border-2
                        ${isSelected 
                            ? 'bg-gradient-to-b from-red-600 to-red-800 border-red-900 text-red-100 shadow-lg shadow-red-900/50 scale-105' 
                            : isUnlocked 
                                ? 'bg-gradient-to-b from-gray-700 to-gray-800 border-gray-600 text-gray-200 hover:from-gray-600 hover:to-gray-700 hover:scale-105 hover:shadow-md hover:border-red-700' 
                                : 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        }
                        ${isMilestone ? 'ring-2 ring-red-400 shadow-lg shadow-red-600/30' : ''}
                    `}
                >
                    {i}
                    {isMilestone && <span className="ml-1 text-yellow-400">★</span>}
                </button>
            );
        }
        
        return floors;
    };

    const getFloorPreview = () => {
        try {
            const preview = generateProceduralDungeon(selectedFloor, activeCharacter.level);
            return preview;
        } catch (error) {
            return null;
        }
    };

    const floorPreview = getFloorPreview();

    return (
        <div className="space-y-6">
            <Card variant="shadow" className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-center">Endless Dungeons</h2>
                <p className="text-gray-300 text-center mb-6">
                    Challenge yourself in procedurally generated dungeons that scale with your progress.
                    Each floor becomes progressively more difficult but offers better rewards.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-blue-400 mb-2">Current Progress</h3>
                        <div className="text-3xl font-bold text-white">{currentProgress}</div>
                        <p className="text-sm text-gray-400">Highest Floor Reached</p>
                    </div>
                    
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-green-400 mb-2">Character Level</h3>
                        <div className="text-3xl font-bold text-white">{activeCharacter.level}</div>
                        <p className="text-sm text-gray-400">Recommended for Floor {activeCharacter.level}</p>
                    </div>
                    
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-purple-400 mb-2">Next Milestone</h3>
                        <div className="text-3xl font-bold text-white">
                            {Math.ceil(currentProgress / 5) * 5}
                        </div>
                        <p className="text-sm text-gray-400">Guaranteed Rare+ Loot</p>
                    </div>
                </div>
            </Card>

            <Card variant="bone">
                <h3 className="text-xl font-bold mb-4">Select Floor</h3>
                <p className="text-gray-400 mb-4">
                    Choose which floor to challenge. Milestone floors (★) guarantee better loot!
                </p>
                
                <div className="max-h-40 overflow-y-auto border border-gray-600 rounded p-4 mb-4">
                    <div className="flex flex-wrap">
                        {renderFloorSelector()}
                    </div>
                </div>
                
                <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-blue-400 mb-1">Auto-Progression</h4>
                            <p className="text-sm text-gray-400">
                                Automatically advance to the next floor upon victory
                            </p>
                        </div>
                        <Toggle
                            checked={state.settings.endlessAutoProgress}
                            onChange={(checked) => dispatch({ 
                                type: 'UPDATE_SETTINGS', 
                                payload: { endlessAutoProgress: checked } 
                            })}
                        />
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        Selected Floor: <span className="text-white font-semibold">{selectedFloor}</span>
                        {selectedFloor % 5 === 0 && (
                            <span className="ml-2 text-yellow-400">★ Milestone Floor</span>
                        )}
                    </div>
                    
                    <Button
                        variant="shadow"
                        onClick={handleStartEndlessDungeon}
                        disabled={isInDungeon || selectedFloor > maxSelectableFloor}
                    >
                        {isInDungeon ? 'In Dungeon...' : `Enter Floor ${selectedFloor}`}
                    </Button>
                </div>
            </Card>

            {floorPreview && (
                <Card variant="obsidian">
                    <h3 className="text-xl font-bold mb-4">Floor {selectedFloor} Preview</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">{floorPreview.name}</h4>
                            <p className="text-gray-300 mb-4">{floorPreview.description}</p>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Biome:</span>
                                    <span className="text-white capitalize">{floorPreview.biome}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Difficulty:</span>
                                    <span className="text-white">{Math.round(floorPreview.difficulty * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Recommended Level:</span>
                                    <span className="text-white">{floorPreview.levelRequirement}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold text-green-400 mb-2">Expected Rewards</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Monster Count:</span>
                                    <span className="text-white">{floorPreview.monsters.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Loot Items:</span>
                                    <span className="text-white">{floorPreview.lootTable.length}</span>
                                </div>
                                {selectedFloor % 25 === 0 && (
                                    <div className="text-yellow-400 text-sm">
                                        ★ Guaranteed Legendary Item!
                                    </div>
                                )}
                                {selectedFloor % 10 === 0 && selectedFloor % 25 !== 0 && (
                                    <div className="text-purple-400 text-sm">
                                        ★ Guaranteed Epic Item!
                                    </div>
                                )}
                                {selectedFloor % 5 === 0 && selectedFloor % 10 !== 0 && (
                                    <div className="text-blue-400 text-sm">
                                        ★ Guaranteed Rare Item!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {selectedFloor > activeCharacter.level + 5 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="text-red-400 text-xl">⚠️</div>
                                <div>
                                    <p className="text-red-300 font-medium text-sm">
                                        Warning: This floor is significantly higher than your current level.
                                    </p>
                                    <p className="text-red-400/80 text-xs mt-1">
                                        Consider leveling up or improving your equipment first.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};
