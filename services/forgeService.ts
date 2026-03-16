import { Equipment, EquipmentRarity, ForgeOrder, GameStats } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { RARITY_MULTIPLIER } from '../constants';

export const FORGE_MATERIAL_COSTS: Record<EquipmentRarity, { materialId: string; baseAmount: number }> = {
    common: { materialId: 'iron_ore', baseAmount: 5 },
    uncommon: { materialId: 'thick_hide', baseAmount: 10 },
    rare: { materialId: 'magic_essence', baseAmount: 15 },
    epic: { materialId: 'void_shard', baseAmount: 20 },
    legendary: { materialId: 'dragon_scale', baseAmount: 25 }
};

export const FORGE_GOLD_BASE_COST = 100;

export function calculateForgeCost(rarity: EquipmentRarity, stats: Partial<GameStats>): { materials: { materialId: string; amount: number }[]; gold: number } {
    const rarityMultiplier = RARITY_MULTIPLIER[rarity];
    const statCount = Object.keys(stats).length;
    
    // Base material cost from rarity
    const baseMaterial = FORGE_MATERIAL_COSTS[rarity];
    const materialAmount = Math.floor(baseMaterial.baseAmount * (1 + (statCount * 0.2)));
    
    // Gold cost based on rarity and power (represented by stat count and values)
    const goldCost = Math.floor(FORGE_GOLD_BASE_COST * rarityMultiplier * (1 + (statCount * 0.5)));
    
    return {
        materials: [{ materialId: baseMaterial.materialId, amount: materialAmount }],
        gold: goldCost
    };
}

export function generateForgeItem(order: ForgeOrder): Equipment {
    const name = `Forged ${order.slot.charAt(0).toUpperCase() + order.slot.slice(1)} of Power`;
    
    return {
        id: `forged_${uuidv4()}`,
        baseId: `forged_${order.slot}_${order.rarity}`,
        name,
        baseName: name,
        slot: order.slot,
        rarity: order.rarity,
        stats: order.targetStats,
        upgradeLevel: 0,
        price: order.goldCost * 0.5 // Sell price is half the forge gold cost
    };
}
