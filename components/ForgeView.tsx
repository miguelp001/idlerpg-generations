
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Equipment, EquipmentRarity, EquipmentSlot, GameStats } from '../types';
import { MATERIALS } from '../data/materials';
import { calculateForgeCost } from '../services/forgeService';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { RARITY_COLORS, FORGE_BASE_STAT_VALUE, FORGE_STAT_PER_LEVEL } from '../constants';

const STAT_OPTIONS: (keyof GameStats)[] = ['health', 'mana', 'attack', 'defense', 'agility', 'intelligence'];
const RARITY_OPTIONS: EquipmentRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const SLOT_OPTIONS: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

export const ForgeView: React.FC = () => {
    const { activeCharacter, dispatch } = useGame();
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>('weapon');
    const [selectedRarity, setSelectedRarity] = useState<EquipmentRarity>('common');
    const [selectedStats, setSelectedStats] = useState<Partial<GameStats>>({ attack: 5 });

    const maxStatValue = useMemo(() => {
        if (!activeCharacter) return 10;
        return FORGE_BASE_STAT_VALUE + (activeCharacter.level * FORGE_STAT_PER_LEVEL);
    }, [activeCharacter?.level]);

    const forgeCost = useMemo(() => {
        if (!activeCharacter) return { materials: [], gold: 0 };
        return calculateForgeCost(selectedRarity, selectedStats, activeCharacter.level);
    }, [selectedRarity, selectedStats, activeCharacter?.level]);

    const currentlyEquipped = useMemo(() => {
        if (!activeCharacter) return null;
        if (selectedSlot === 'weapon') return activeCharacter.equipment.find(i => i.slot === 'weapon');
        if (selectedSlot === 'armor') return activeCharacter.equipment.find(i => i.slot === 'armor');
        return activeCharacter.accessorySlots[0]; // Compare against first accessory for simplicity
    }, [activeCharacter, selectedSlot]);

    if (!activeCharacter) return null;

    const canAfford = activeCharacter.gold >= forgeCost.gold && 
        forgeCost.materials.every(req => (activeCharacter.materials[req.materialId] || 0) >= req.amount);

    const handleStatToggle = (stat: keyof GameStats) => {
        const newStats = { ...selectedStats };
        if (newStats[stat]) {
            delete newStats[stat];
        } else {
            // Limit to 3 stats for forging
            if (Object.keys(newStats).length < 3) {
                newStats[stat] = Math.max(1, Math.floor(maxStatValue * 0.5)); // Start at 50% of current quality
            }
        }
        setSelectedStats(newStats);
    };

    const handleStatValueChange = (stat: keyof GameStats, val: number) => {
        setSelectedStats(prev => ({ ...prev, [stat]: val }));
    };

    const handleRequestForge = () => {
        dispatch({
            type: 'REQUEST_FORGE',
            payload: {
                characterId: activeCharacter.id,
                order: {
                    slot: selectedSlot,
                    rarity: selectedRarity,
                    targetStats: selectedStats
                }
            }
        });
    };

    const handleCancelForge = () => {
        dispatch({ type: 'CANCEL_FORGE', payload: { characterId: activeCharacter.id } });
    };

    const handleClaimForge = () => {
        dispatch({ type: 'CLAIM_FORGE', payload: { characterId: activeCharacter.id } });
    };

    if (activeCharacter.activeForgeOrder) {
        const order = activeCharacter.activeForgeOrder;
        return (
            <div className="space-y-6">
                <Card variant="obsidian">
                    <CardHeader>
                        <CardTitle>Active Forge Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xl font-bold">
                                    <span style={{ color: RARITY_COLORS[order.rarity] }}>{order.rarity.toUpperCase()}</span> {order.slot.toUpperCase()}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-secondary">
                                    {Object.entries(order.targetStats).map(([stat, val]) => (
                                        <p key={stat} className="capitalize">{stat}: +{val}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-secondary">Cost:</p>
                                <p className="text-gold font-bold">{order.goldCost}G</p>
                                {order.requiredMaterials.map(m => (
                                     <p key={m.materialId} className="text-xs text-on-background/70">{MATERIALS[m.materialId]?.name}: {m.amount}</p>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <Button variant="blood" onClick={handleCancelForge} className="flex-1">Cancel Order (50% Refund)</Button>
                            <Button variant="shadow" onClick={handleClaimForge} className="flex-1">Claim Item</Button>
                        </div>
                        <p className="mt-4 text-xs text-center text-on-background/50">Custom forging is instantaneous (for now!).</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card variant="obsidian">
                <CardHeader>
                    <div className="flex justify-between items-end">
                        <CardTitle>The Grand Forge</CardTitle>
                        <p className="text-xs text-on-background/60 font-mono">Expertise: Lvl {activeCharacter.level} (Stat Limit: {maxStatValue})</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-secondary mb-6 italic">"State your desires, adventurer. For the right materials and coin, I can craft anything."</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Options */}
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-bold mb-2 uppercase text-on-background/60">Select Slot</p>
                                <div className="flex flex-wrap gap-2">
                                    {SLOT_OPTIONS.map(slot => (
                                        <Button 
                                            key={slot} 
                                            variant={selectedSlot === slot ? 'shadow' : 'void'} 
                                            size="sm"
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold mb-2 uppercase text-on-background/60">Select Rarity</p>
                                <div className="flex flex-wrap gap-2">
                                    {RARITY_OPTIONS.map(rarity => (
                                        <Button 
                                            key={rarity} 
                                            variant={selectedRarity === rarity ? 'shadow' : 'void'} 
                                            size="sm"
                                            onClick={() => setSelectedRarity(rarity)}
                                            style={{ borderColor: selectedRarity === rarity ? RARITY_COLORS[rarity] : undefined }}
                                        >
                                            <span style={{ color: RARITY_COLORS[rarity] }}>{rarity}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold mb-2 uppercase text-on-background/60">Select Stats (Max 3)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {STAT_OPTIONS.map(stat => {
                                        const val = selectedStats[stat];
                                        const equippedVal = currentlyEquipped?.stats?.[stat] || 0;
                                        const delta = val ? val - equippedVal : -equippedVal;
                                        const isExtreme = val && val > maxStatValue;

                                        return (
                                            <div key={stat} className="flex flex-col gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <Button 
                                                        variant={selectedStats[stat] ? 'shadow' : 'void'} 
                                                        size="sm"
                                                        onClick={() => handleStatToggle(stat)}
                                                        className="text-xs py-0 px-2 h-7"
                                                    >
                                                        {stat}
                                                    </Button>
                                                    {val && (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold ${isExtreme ? 'text-yellow-400' : 'text-on-background/70'}`}>
                                                                {val}
                                                            </span>
                                                            <span className={`text-[10px] font-bold px-1 rounded ${delta >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                                                                {delta > 0 ? `+${delta}` : delta}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedStats[stat] && (
                                                    <input 
                                                        type="range" 
                                                        min="1" 
                                                        max={maxStatValue * 1.5} // Allow 50% over standard limit for "Extreme" gear
                                                        value={selectedStats[stat] as number} 
                                                        onChange={(e) => handleStatValueChange(stat, parseInt(e.target.value))}
                                                        className="w-full h-1.5 accent-red-600 rounded-lg appearance-none cursor-pointer bg-surface-2"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Cost & Materials */}
                        <div className="space-y-4">
                            <Card variant="bone" className="bg-black/20">
                                <h4 className="font-bold mb-4 border-b border-on-background/10 pb-2 flex justify-between">
                                    <span>Crafting Requirements</span>
                                    {Object.values(selectedStats).some(v => v! > maxStatValue) && (
                                        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded animate-pulse">EXTREME POWER</span>
                                    )}
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-lg">
                                        <span>Gold:</span>
                                        <span className={activeCharacter.gold >= forgeCost.gold ? 'text-gold' : 'text-red-500'}>
                                            {forgeCost.gold.toLocaleString()}G
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-secondary">Materials:</p>
                                        {forgeCost.materials.map(m => {
                                            const held = activeCharacter.materials[m.materialId] || 0;
                                            const material = MATERIALS[m.materialId];
                                            return (
                                                <div key={m.materialId} className="flex justify-between items-center text-sm">
                                                    <span>{material?.name || m.materialId}:</span>
                                                    <span className={held >= m.amount ? 'text-green-400' : 'text-red-500'}>
                                                        {held.toLocaleString()} / {m.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-on-background/10">
                                        <Button 
                                            variant="blood" 
                                            className="w-full" 
                                            disabled={!canAfford}
                                            onClick={handleRequestForge}
                                        >
                                            Place Order
                                        </Button>
                                        {!canAfford && (
                                            <p className="text-[10px] text-center mt-2 text-red-400 uppercase tracking-wider">Insufficient Resources</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Stat Summary Comparison */}
                            <div className="p-3 bg-surface-2/50 rounded-lg border border-white/5 space-y-2">
                                <p className="text-xs font-bold text-on-background/50 uppercase tracking-widest">Projection vs Equipped {selectedSlot}</p>
                                {STAT_OPTIONS.map(stat => {
                                    const val = selectedStats[stat] || 0;
                                    const equippedVal = currentlyEquipped?.stats?.[stat] || 0;
                                    if (val === 0 && equippedVal === 0) return null;
                                    const delta = val - equippedVal;
                                    return (
                                        <div key={stat} className="flex justify-between items-center text-xs">
                                            <span className="capitalize">{stat}</span>
                                            <div className="flex gap-3">
                                                <span className="text-on-background/40">{equippedVal} → {val}</span>
                                                <span className={`font-bold min-w-[3rem] text-right ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {delta > 0 ? `+${delta}` : delta}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Object.entries(MATERIALS).map(([id, mat]) => (
                    <Card key={id} variant="bone" padding="sm" className="text-center bg-black/40">
                         <p className="text-xs font-bold text-on-background/60 uppercase">{mat.name}</p>
                         <p className="text-xl font-bold text-secondary mt-1">{(activeCharacter.materials[id] || 0).toLocaleString()}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ForgeView;
