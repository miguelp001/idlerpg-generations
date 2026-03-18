
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { EquipmentRarity, EquipmentSlot, GameStats } from '../types';
import { MATERIALS } from '../data/materials';
import { calculateForgeCost } from '../services/forgeService';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { RARITY_COLORS, FORGE_BASE_STAT_VALUE, FORGE_STAT_PER_LEVEL } from '../constants';

const STAT_OPTIONS: (keyof GameStats)[] = ['health', 'mana', 'attack', 'defense', 'agility', 'intelligence'];
const RARITY_OPTIONS: EquipmentRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const SLOT_OPTIONS: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

// Helper for logarithmic mapping
// slider 0-1000 -> multiplier 1 to (10^exponent)
// Exponent scales with level: 3.0 at lvl 1, 4.0 at lvl 100, etc.
const getExponent = (level: number) => 3.0 + (level / 100);
const sliderToMultiplier = (slider: number, level: number) => Math.pow(10, (slider / 1000) * getExponent(level));
const multiplierToSlider = (mult: number, level: number) => (Math.log10(mult) / getExponent(level)) * 1000;

export const ForgeView: React.FC = () => {
    const { activeCharacter, dispatch } = useGame();
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>('weapon');
    const [selectedRarity, setSelectedRarity] = useState<EquipmentRarity>('common');
    
    // We store the multipliers (1 to 1000) instead of raw stats
    const [selectedMultipliers, setSelectedMultipliers] = useState<Partial<Record<keyof GameStats, number>>>({ attack: 1 });

    const baseStatValue = useMemo(() => {
        if (!activeCharacter) return 10;
        return FORGE_BASE_STAT_VALUE + (activeCharacter.level * FORGE_STAT_PER_LEVEL);
    }, [activeCharacter?.level]);

    const selectedStats = useMemo(() => {
        const stats: Partial<GameStats> = {};
        Object.entries(selectedMultipliers).forEach(([stat, mult]) => {
            stats[stat as keyof GameStats] = Math.max(1, Math.floor(baseStatValue * mult!));
        });
        return stats;
    }, [baseStatValue, selectedMultipliers]);

    const forgeCost = useMemo(() => {
        if (!activeCharacter) return { materials: [], gold: 0 };
        return calculateForgeCost(selectedRarity, selectedStats, activeCharacter.level);
    }, [selectedRarity, selectedStats, activeCharacter?.level]);

    const currentlyEquipped = useMemo(() => {
        if (!activeCharacter) return null;
        if (selectedSlot === 'weapon') return activeCharacter.equipment.find(i => i.slot === 'weapon');
        if (selectedSlot === 'armor') return activeCharacter.equipment.find(i => i.slot === 'armor');
        return activeCharacter.accessorySlots[0];
    }, [activeCharacter, selectedSlot]);

    if (!activeCharacter) return null;

    const canAfford = activeCharacter.gold >= forgeCost.gold && 
        forgeCost.materials.every(req => (activeCharacter.materials[req.materialId] || 0) >= req.amount);

    const handleStatToggle = (stat: keyof GameStats) => {
        const newMults = { ...selectedMultipliers };
        if (newMults[stat]) {
            delete newMults[stat];
        } else {
            if (Object.keys(newMults).length < 3) {
                newMults[stat] = 1; // Default to 1x
            }
        }
        setSelectedMultipliers(newMults);
    };

    const handleMultiplierChange = (stat: keyof GameStats, sliderVal: number) => {
        const level = activeCharacter?.level || 1;
        setSelectedMultipliers(prev => ({ ...prev, [stat]: sliderToMultiplier(sliderVal, level) }));
    };

    const handleRequestForge = () => {
        dispatch({
            type: 'REQUEST_FORGE',
            payload: {
                characterId: activeCharacter.id,
                order: {
                    slot: selectedSlot,
                    rarity: selectedRarity,
                    targetStats: selectedStats,
                    level: activeCharacter.level
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
                        <div className="flex justify-between items-center text-on-background">
                            <div>
                                <p className="text-xl font-bold">
                                    <span style={{ color: RARITY_COLORS[order.rarity] }}>{order.rarity.toUpperCase()}</span> {order.slot.toUpperCase()}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-secondary">
                                    {Object.entries(order.targetStats).map(([stat, val]) => (
                                        <p key={stat} className="capitalize">{stat}: +{val?.toLocaleString()}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-secondary">Cost:</p>
                                <p className="text-gold font-bold">{order.goldCost.toLocaleString()}G</p>
                                {order.requiredMaterials.map(m => (
                                     <p key={m.materialId} className="text-xs text-on-background/70">{MATERIALS[m.materialId]?.name}: {m.amount.toLocaleString()}</p>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <Button variant="blood" onClick={handleCancelForge} className="flex-1">Cancel Order (50% Refund)</Button>
                            <Button variant="shadow" onClick={handleClaimForge} className="flex-1">Claim Item</Button>
                        </div>
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
                        <p className="text-xs text-on-background/60 font-mono">Expertise: Lvl {activeCharacter.level} (Base: {baseStatValue})</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-secondary mb-6 italic">"Massive power requires a massive price. Choose your multiplier wisely."</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Options */}
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-bold mb-2 uppercase text-on-background/60">Selected Slot & Rarity</p>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                                        {SLOT_OPTIONS.map(slot => (
                                            <Button 
                                                key={slot} 
                                                variant={selectedSlot === slot ? 'shadow' : 'void'} 
                                                size="sm"
                                                onClick={() => setSelectedSlot(slot)}
                                                className="text-[10px] uppercase h-8"
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                                        {RARITY_OPTIONS.map(rarity => (
                                            <Button 
                                                key={rarity} 
                                                variant={selectedRarity === rarity ? 'shadow' : 'void'} 
                                                size="sm"
                                                onClick={() => setSelectedRarity(rarity)}
                                                className="text-[10px] uppercase h-8"
                                                style={{ borderColor: selectedRarity === rarity ? RARITY_COLORS[rarity] : undefined }}
                                            >
                                                <span style={{ color: RARITY_COLORS[rarity] }}>{rarity[0]}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold mb-2 uppercase text-on-background/60">Statistical Multipliers (Max 3)</p>
                                <div className="grid grid-cols-1 gap-4">
                                    {STAT_OPTIONS.map(stat => {
                                        const mult = selectedMultipliers[stat];
                                        const finalVal = selectedStats[stat] || 0;
                                        const equippedVal = currentlyEquipped?.stats?.[stat] || 0;
                                        const delta = finalVal - equippedVal;

                                        return (
                                            <div key={stat} className="flex flex-col gap-2 p-3 bg-black/30 rounded-lg border border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <Button 
                                                        variant={mult ? 'shadow' : 'void'} 
                                                        size="sm"
                                                        onClick={() => handleStatToggle(stat)}
                                                        className="text-xs py-0 px-2 h-7 min-w-[5rem]"
                                                    >
                                                        {stat}
                                                    </Button>
                                                    {mult && (
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-yellow-400 font-mono">x{mult.toFixed(1)} Pwr</span>
                                                                <span className="text-sm font-bold text-on-background">
                                                                    {finalVal.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[9px] font-bold ${delta >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                                                {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {mult && (
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max="1000" 
                                                        step="1"
                                                        value={multiplierToSlider(mult, activeCharacter.level)} 
                                                        onChange={(e) => handleMultiplierChange(stat, parseInt(e.target.value))}
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
                                    <span>Requirements</span>
                                    {Object.values(selectedMultipliers).some(m => m! > 10) && (
                                        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded animate-pulse uppercase">Artifact Power</span>
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

                            <div className="p-3 bg-surface-2/50 rounded-lg border border-white/5 space-y-2 text-on-background">
                                <p className="text-[10px] font-bold text-on-background/40 uppercase tracking-widest">Projection vs Equipped</p>
                                {STAT_OPTIONS.map(stat => {
                                    const val = selectedStats[stat] || 0;
                                    const equippedVal = currentlyEquipped?.stats?.[stat] || 0;
                                    if (val === 0 && equippedVal === 0) return null;
                                    const delta = val - equippedVal;
                                    return (
                                        <div key={stat} className="flex justify-between items-center text-[11px]">
                                            <span className="capitalize text-secondary">{stat}</span>
                                            <div className="flex gap-2">
                                                <span className="text-on-background/50 font-mono">{equippedVal.toLocaleString()} → {val.toLocaleString()}</span>
                                                <span className={`font-bold min-w-[3.5rem] text-right ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()}
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
