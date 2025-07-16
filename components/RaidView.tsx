
import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { CLASSES, RARITY_COLORS } from '../constants';
import { ALL_MONSTERS } from '../data/monsters';
import { RAIDS } from '../data/raids';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
import { Adventurer, Character, CombatLogEntry } from '../types';
import { SwordIcon, StarIcon, TrophyIcon, SkullIcon, GoldIcon, BookOpenIcon, ShieldCheckIcon, SparklesIcon, HeartPulseIcon } from './ui/Icons';


const RaidCombatLog: React.FC = () => {
    const { state } = useGame();
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [state.raidState.combatLog]);
    
     const getLogInfo = (log: CombatLogEntry): { color: string, icon: React.ReactNode } => {
        const info = { color: 'text-gray-200', icon: <SwordIcon /> };

        switch(log.type) {
            case 'damage':
                info.color = log.actor === 'player' || log.actor === 'ally' ? 'text-cyan-300' : 'text-red-400';
                break;
            case 'victory':
                info.color = 'text-yellow-300 font-bold text-lg';
                info.icon = <TrophyIcon />;
                break;
            case 'defeat':
                info.color = 'text-gray-400 font-bold text-lg';
                info.icon = <SkullIcon />;
                break;
            case 'special':
                info.color = 'text-purple-300';
                info.icon = <StarIcon />;
                break;
            case 'gold':
                info.color = 'text-yellow-400';
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
                info.color = 'text-gray-200';
                info.icon = <SwordIcon />;
                break;
        }
        return info;
    }


    return (
        <div ref={logRef} className="h-80 bg-black/50 rounded-lg p-4 overflow-y-auto font-mono text-sm shadow-inner" aria-live="polite">
            {state.raidState.combatLog.map(log => {
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

const RaidView: React.FC = () => {
    const { state, dispatch } = useGame();
    const { raidState } = state;
    const combatIntervalRef = useRef<number | null>(null);

    const character = state.characters.find(c => c.id === state.activeCharacterId);
    const raid = raidState.raidId ? RAIDS.find(r => r.id === raidState.raidId) : null;
    const boss = raidState.bossId ? ALL_MONSTERS[raidState.bossId] : null;
    
    useEffect(() => {
        const stopCombat = () => {
            if (combatIntervalRef.current) {
                clearInterval(combatIntervalRef.current);
                combatIntervalRef.current = null;
            }
        };

        if (raidState.status === 'fighting') {
            combatIntervalRef.current = window.setInterval(() => {
                dispatch({ type: 'DO_RAID_COMBAT_TURN' });
            }, 1800);
        } else {
            stopCombat();
        }
        
        return () => stopCombat();
    }, [raidState.status, dispatch]);

    if (!raid || !character || !boss) return <div className="h-screen flex items-center justify-center bg-black">Error: Raid data missing.</div>;
    
    const renderFightingView = () => {
         const partyWithPlayer = [character, ...character.party];
         return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-2 bg-black/30 border border-primary/50">
                    <h2 className="text-2xl font-bold mb-4">Your Party</h2>
                    <div className="mt-4 space-y-3">
                        {partyWithPlayer.map(p => {
                            if ('maxStats' in p) { // Player Character
                                const player = p as Character;
                                const isDefeated = (player.currentHealth ?? player.stats.health) <= 0;
                                const label = isDefeated ? `${player.name} (Defeated)` : player.name;
                                return (
                                    <ProgressBar key={player.id} label={label} value={isDefeated ? 0 : (player.currentHealth ?? player.stats.health)} max={player.maxStats.health} colorClass={`bg-${CLASSES[player.class].color.split('-')[1]}-500 ${isDefeated ? 'grayscale' : ''}`} />
                                );
                            } else { // Adventurer
                                const adventurer = p as Adventurer;
                                const isDefeated = (adventurer.currentHealth ?? adventurer.stats.health) <= 0;
                                const label = isDefeated ? `${adventurer.name} (Defeated)` : adventurer.name;
                                return (
                                    <ProgressBar key={adventurer.id} label={label} value={isDefeated ? 0 : (adventurer.currentHealth ?? adventurer.stats.health)} max={adventurer.stats.health} colorClass={`bg-${CLASSES[adventurer.class].color.split('-')[1]}-500 ${isDefeated ? 'grayscale' : ''}`} />
                                );
                            }
                        })}
                    </div>
                </Card>
                <Card className="lg:col-span-3 bg-black/30 border border-red-500/50">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-3xl font-bold text-red-400">{boss?.name}</h2>
                        {raidState.status === 'paused' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/50 border border-blue-500/50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-blue-400 font-semibold text-sm">PAUSED</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 space-y-3">
                        <ProgressBar label="Health" value={raidState.currentBossHealth!} max={boss?.stats.health!} colorClass="bg-red-600" />
                    </div>
                </Card>
            </div>
         );
    }
    
    const renderResultView = (isVictory: boolean) => (
        <Card className="text-center animate-slide-up bg-black/50 border border-yellow-400/50">
            <h1 className={`text-6xl font-bold mb-4 ${isVictory ? 'text-yellow-300' : 'text-gray-400'}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {isVictory ? 'Victory!' : 'Defeated'}
            </h1>
            <p className="text-xl mb-6">{isVictory ? `You have slain ${boss.name}!` : 'The raid has failed.'}</p>
            {isVictory && (
                <div className="p-6 bg-surface-2 rounded-lg inline-block mb-6 space-y-2 max-w-md mx-auto">
                    <p className="text-2xl font-bold text-yellow-400">Gold Gained: {raidState.goldGained.toLocaleString()}</p>
                    {raidState.lootFound.length > 0 && (
                         <div className="pt-4 mt-4 border-t border-surface-1">
                            <p className="text-xl font-bold text-secondary">Loot Found:</p>
                            {raidState.lootFound.map(item => (
                                <p key={item.id} className={`text-lg font-semibold ${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
                            ))}
                         </div>
                    )}
                </div>
            )}
            <Button onClick={() => dispatch({ type: 'END_RAID' })} className="w-full md:w-1/2 text-xl py-3" variant="shadow">
                Leave Raid
            </Button>
        </Card>
    );

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-red-900 via-gray-900 to-black animate-fade-in">
            <div className="w-full max-w-7xl mx-auto space-y-6">
                 <h1 className="text-5xl font-bold text-center text-white drop-shadow-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>{raid.name}</h1>
                
                {(raidState.status === 'victory' || raidState.status === 'defeat') 
                    ? renderResultView(raidState.status === 'victory')
                    : (
                        <>
                            {renderFightingView()}
                            {(raidState.status === 'fighting' || raidState.status === 'paused') && (
                                <div className="flex justify-center">
                                    <Button 
                                        variant="void"
                                        className={`border-blue-500 text-blue-400 hover:bg-blue-900/50 ${raidState.status === 'paused' ? 'bg-blue-900/30' : ''}`}
                                        onClick={() => dispatch({ type: raidState.status === 'fighting' ? 'PAUSE_RAID_COMBAT' : 'RESUME_RAID_COMBAT' })}
                                    >
                                        {raidState.status === 'fighting' ? 'Pause Combat' : 'Resume Combat'}
                                    </Button>
                                </div>
                            )}
                            <Card className="bg-black/30 border border-gray-700">
                                <h2 className="text-xl font-bold mb-4 text-primary">Combat Log</h2>
                                <RaidCombatLog />
                            </Card>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default RaidView;
