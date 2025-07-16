import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { RARITY_COLORS } from '../constants';
import { ALL_MONSTERS } from '../data/monsters';
import { DUNGEONS } from '../data/dungeons';
import { generateProceduralDungeon } from '../services/proceduralDungeonService';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
import Toggle from './ui/Toggle';
import { Adventurer, Character, CombatLogEntry } from '../types';
import { SwordIcon, StarIcon, TrophyIcon, SkullIcon, GoldIcon, BookOpenIcon, ShieldCheckIcon, SparklesIcon, HeartPulseIcon } from './ui/Icons';


const CombatLog: React.FC = () => {
    const { state } = useGame();
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [state.dungeonState.combatLog]);
    
    const getLogInfo = (log: CombatLogEntry): { color: string, icon: React.ReactNode } => {
        const info = { color: 'text-on-background/90', icon: <SwordIcon /> };

        switch(log.type) {
            case 'damage':
                info.color = log.actor === 'player' || log.actor === 'ally' ? 'text-cyan-400' : 'text-red-400';
                break;
            case 'victory':
                info.color = 'text-green-400 font-bold';
                info.icon = <TrophyIcon />;
                break;
            case 'defeat':
                info.color = 'text-gray-400 font-bold';
                info.icon = <SkullIcon />;
                break;
            case 'special':
                info.color = 'text-yellow-400';
                info.icon = <StarIcon />;
                break;
            case 'gold':
                info.color = 'text-yellow-500';
                info.icon = <GoldIcon />;
                break;
            case 'quest':
                info.color = 'text-purple-400';
                info.icon = <BookOpenIcon />;
                break;
            case 'ability':
                info.color = 'text-violet-400';
                info.icon = log.message.toLowerCase().includes('heal') ? <HeartPulseIcon /> : <SparklesIcon />;
                break;
            case 'dodge':
            case 'parry':
            case 'block':
                info.color = 'text-blue-400';
                info.icon = <ShieldCheckIcon />;
                break;
            case 'critical':
                info.color = 'text-orange-400 font-bold';
                break;
            default:
                info.color = 'text-on-background/70';
                info.icon = <SwordIcon />;
                break;
        }
        return info;
    }

    return (
        <div ref={logRef} className="h-64 bg-black/30 rounded-lg p-4 overflow-y-auto font-mono text-sm" aria-live="polite">
            {state.dungeonState.combatLog.map(log => {
                const { color, icon } = getLogInfo(log);
                return (
                    <p key={log.id} className={`animate-fade-in flex items-center gap-2 ${color}`}>
                        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
                        <span>&gt; {log.message}</span>
                    </p>
                )
            })}
        </div>
    )
}

const FleeConfirmationModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card className="w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Flee the Dungeon?</h2>
            <p className="text-on-background/80 mb-6">
                Are you sure you want to flee? You will forfeit all experience, gold, and loot gathered during this run.
            </p>
            <div className="mt-6 flex justify-end space-x-4">
                <Button variant="void" onClick={onCancel}>Stay and Fight</Button>
                <Button 
                    onClick={onConfirm}
                    className="bg-red-600 hover:bg-red-700 text-on-primary focus:ring-red-500"
                >
                    Confirm Flee
                </Button>
            </div>
        </Card>
    </div>
);


const DungeonView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const { dungeonState, isGrinding } = state;
    const combatIntervalRef = useRef<number | null>(null);
    const [isFleeing, setIsFleeing] = useState(false);

    // Try to find dungeon in regular dungeons first, then generate procedural if not found
    let dungeon = dungeonState.dungeonId ? DUNGEONS.find(d => d.id === dungeonState.dungeonId) : null;
    console.log('DungeonView - dungeonId:', dungeonState.dungeonId, 'found in DUNGEONS:', !!dungeon);
    
    // If not found in regular dungeons, it might be a procedural dungeon
    if (!dungeon && dungeonState.dungeonId && activeCharacter) {
        console.log('Attempting to generate procedural dungeon for ID:', dungeonState.dungeonId);
        try {
            // Extract floor number from dungeon ID (format: procedural_1_forest_1752528762253)
            const floorMatch = dungeonState.dungeonId.match(/procedural_(\d+)_/);
            if (floorMatch) {
                const floor = parseInt(floorMatch[1]);
                console.log('Generating procedural dungeon for floor:', floor);
                dungeon = generateProceduralDungeon(floor, activeCharacter.level);
                console.log('Generated dungeon:', dungeon);
            } else {
                console.log('No floor match found for dungeon ID:', dungeonState.dungeonId);
            }
        } catch (error) {
            console.error('Failed to generate procedural dungeon for view:', error);
        }
    }
    
    const monster = dungeonState.monsterId ? ALL_MONSTERS[dungeonState.monsterId] : null;
    
    useEffect(() => {
        const stopCombat = () => {
            if (combatIntervalRef.current) {
                clearInterval(combatIntervalRef.current);
                combatIntervalRef.current = null;
            }
        };

        if (dungeonState.status === 'fighting') {
            combatIntervalRef.current = window.setInterval(() => {
                dispatch({ type: 'DO_COMBAT_TURN' });
            }, 1500);
        } else {
            stopCombat();
        }
        
        return () => stopCombat();
    }, [dungeonState.status, dispatch]);
    
    useEffect(() => {
        if (dungeonState.status === 'victory' && isGrinding && dungeonState.dungeonId) {
            const timer = setTimeout(() => {
                dispatch({ type: 'START_DUNGEON', payload: { dungeonId: dungeonState.dungeonId! } });
            }, 2000); // 2 second delay to show results

            return () => clearTimeout(timer);
        }
    }, [dungeonState.status, isGrinding, dungeonState.dungeonId, dispatch]);
    
    useEffect(() => {
        // This cleanup function will run when the component unmounts.
        return () => {
            if (state.isGrinding) {
                dispatch({ type: 'SET_GRINDING', payload: false });
            }
        };
    }, [state.isGrinding, dispatch]);


    const handleConfirmFlee = () => {
        dispatch({ type: 'LEAVE_DUNGEON' });
        setIsFleeing(false);
    };

    if (!dungeon || !activeCharacter) {
        console.log('DungeonView error - dungeon:', !!dungeon, 'activeCharacter:', !!activeCharacter);
        return <div>Error: Dungeon or character not found.</div>;
    }

    const renderFightingView = () => {
        const partyWithPlayer = [activeCharacter, ...activeCharacter.party];
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="bg-red-900/20 border border-red-500/50">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">{monster?.name}</h2>
                        {dungeonState.status === 'paused' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/50 border border-blue-500/50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-blue-400 font-semibold text-sm">PAUSED</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 space-y-3">
                         <ProgressBar label="Health" value={dungeonState.currentMonsterHealth!} max={monster?.stats.health!} colorClass="bg-red-500" />
                    </div>
                </Card>
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Your Party</h2>
                     <div className="mt-4 space-y-3">
                        {partyWithPlayer.map(p => {
                            if ('maxStats' in p) { // Player Character
                                const player = p as Character;
                                return (
                                   <div key={player.id} className="p-2 bg-surface-2 rounded-lg">
                                       <p className="font-bold">{player.name} <span className="text-sm text-on-background/70">(Lvl {player.level})</span></p>
                                       <ProgressBar value={player.currentHealth ?? player.stats.health} max={player.maxStats.health} colorClass="bg-green-500" />
                                       <ProgressBar value={player.currentMana ?? player.stats.mana} max={player.maxStats.mana} colorClass="bg-blue-500" />
                                   </div>
                                )
                            } else { // Adventurer
                                const adventurer = p as Adventurer;
                                const isDefeated = (adventurer.currentHealth ?? adventurer.stats.health) <= 0;
                                return (
                                   <div key={adventurer.id} className={`p-2 bg-surface-2 rounded-lg transition-opacity ${isDefeated ? 'opacity-50' : ''}`}>
                                       <p className="font-bold">
                                           {adventurer.name} <span className="text-sm text-on-background/70">(Lvl {adventurer.level})</span>
                                           {isDefeated && <span className="font-bold text-red-500 ml-2">(Defeated)</span>}
                                       </p>
                                       <ProgressBar value={isDefeated ? 0 : (adventurer.currentHealth ?? adventurer.stats.health)} max={adventurer.stats.health} colorClass="bg-green-500" />
                                       <ProgressBar value={isDefeated ? 0 : (adventurer.currentMana ?? adventurer.stats.mana)} max={adventurer.stats.mana} colorClass="bg-blue-500" />
                                   </div>
                                )
                            }
                        })}
                    </div>
                </Card>
            </div>
        )
    };
    
    const renderResultView = (isVictory: boolean) => {
        return (
            <Card className="text-center animate-slide-up">
                <h1 className={`text-5xl font-bold mb-4 ${isVictory ? 'text-green-400' : 'text-gray-400'}`}>
                    {isVictory ? 'Victory!' : 'Defeated'}
                </h1>
                <p className="text-xl mb-6">{isVictory ? `You have cleared the ${dungeon.name}!` : 'You fought bravely but were overcome.'}</p>
                {isVictory && (
                    <div className="p-4 bg-surface-2 rounded-lg inline-block mb-6 space-y-2">
                        <p className="text-xl font-bold text-yellow-400">XP Gained: {dungeonState.xpGained}</p>
                        <p className="text-xl font-bold text-yellow-500">Gold Gained: {dungeonState.goldGained}</p>
                        {dungeonState.lootFound.length > 0 && (
                             <div>
                                <p className="text-lg font-bold text-secondary mt-2">Loot Found:</p>
                                {dungeonState.lootFound.map(item => (
                                    <p key={item.id} className={`${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
                                ))}
                             </div>
                        )}
                    </div>
                )}
                <Button onClick={() => dispatch({ type: 'LEAVE_DUNGEON' })} className="w-full md:w-1/2">
                    Return to Dungeon Entrance
                </Button>
            </Card>
        )
    };


    return (
        <div className="space-y-6">
             {isFleeing && (
                <FleeConfirmationModal 
                    onConfirm={handleConfirmFlee}
                    onCancel={() => setIsFleeing(false)}
                />
            )}
             <h1 className="text-4xl font-bold text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>{dungeon.name}</h1>
            {dungeonState.status === 'fighting' && renderFightingView()}
            {(dungeonState.status === 'victory' || dungeonState.status === 'defeat') && renderResultView(dungeonState.status === 'victory')}

            {(dungeonState.status === 'fighting' || dungeonState.status === 'paused') && (
                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button 
                        variant="void" 
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-900/50" 
                        onClick={() => setIsFleeing(true)}
                    >
                        Flee Dungeon
                    </Button>
                    <Button 
                        variant="void"
                        className={`border-blue-500 text-blue-400 hover:bg-blue-900/50 ${dungeonState.status === 'paused' ? 'bg-blue-900/30' : ''}`}
                        onClick={() => dispatch({ type: dungeonState.status === 'fighting' ? 'PAUSE_COMBAT' : 'RESUME_COMBAT' })}
                    >
                        {dungeonState.status === 'fighting' ? 'Pause Combat' : 'Resume Combat'}
                    </Button>
                    <div className="flex items-center gap-x-3">
                        <label htmlFor="grind-toggle" className="font-semibold text-on-surface select-none cursor-pointer">
                            Auto Grind
                        </label>
                        <Toggle
                            id="grind-toggle"
                            checked={isGrinding}
                            onChange={(checked) => dispatch({ type: 'SET_GRINDING', payload: checked })}
                        />
                    </div>
                </div>
            )}
            <Card>
                <h2 className="text-xl font-bold mb-4 text-primary">Combat Log</h2>
                <CombatLog />
            </Card>
        </div>
    );
};

export default DungeonView;
