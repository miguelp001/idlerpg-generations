
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { EquipmentRarity, EquipmentSlot, GameStats } from '../types';
import { MATERIALS } from '../data/materials';
import { calculateForgeCost } from '../services/forgeService';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { RARITY_COLORS } from '../constants';

const STAT_OPTIONS: (keyof GameStats)[] = ['health', 'mana', 'attack', 'defense', 'agility', 'intelligence'];
const RARITY_OPTIONS: EquipmentRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const SLOT_OPTIONS: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

export const ForgeView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>('weapon');
    const [selectedRarity, setSelectedRarity] = useState<EquipmentRarity>('common');
    const [selectedStats, setSelectedStats] = useState<Partial<GameStats>>({ attack: 5 });

    const forgeCost = useMemo(() => {
        return calculateForgeCost(selectedRarity, selectedStats);
    }, [selectedRarity, selectedStats]);

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
                newStats[stat] = 5; // Base value
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
                    <CardTitle>The Grand Forge</CardTitle>
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
                                <div className="grid grid-cols-2 gap-3">
                                    {STAT_OPTIONS.map(stat => (
                                        <div key={stat} className="flex flex-col gap-1">
                                            <Button 
                                                variant={selectedStats[stat] ? 'shadow' : 'void'} 
                                                size="sm"
                                                onClick={() => handleStatToggle(stat)}
                                                className="text-xs"
                                            >
                                                {stat}
                                            </Button>
                                            {selectedStats[stat] && (
                                                <input 
                                                    type="range" 
                                                    min="1" 
                                                    max="50" 
                                                    value={selectedStats[stat] as number} 
                                                    onChange={(e) => handleStatValueChange(stat, parseInt(e.target.value))}
                                                    className="w-full accent-red-600"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cost & Materials */}
                        <Card variant="bone" className="bg-black/20">
                            <h4 className="font-bold mb-4 border-b border-on-background/10 pb-2">Crafting Requirements</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-lg">
                                    <span>Gold:</span>
                                    <span className={activeCharacter.gold >= forgeCost.gold ? 'text-gold' : 'text-red-500'}>
                                        {forgeCost.gold}G
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
                                                    {held} / {m.amount}
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
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Object.entries(MATERIALS).map(([id, mat]) => (
                    <Card key={id} variant="bone" padding="sm" className="text-center bg-black/40">
                         <p className="text-xs font-bold text-on-background/60 uppercase">{mat.name}</p>
                         <p className="text-xl font-bold text-secondary mt-1">{activeCharacter.materials[id] || 0}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ForgeView;
