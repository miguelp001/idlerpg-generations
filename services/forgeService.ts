import { Equipment, EquipmentRarity, ForgeOrder, GameStats } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
    RARITY_MULTIPLIER, 
    FORGE_BASE_STAT_VALUE, 
    FORGE_STAT_PER_LEVEL 
} from '../constants';

export const FORGE_MATERIAL_COSTS: Record<EquipmentRarity, { materialId: string; baseAmount: number }> = {
    common: { materialId: 'iron_ore', baseAmount: 5 },
    uncommon: { materialId: 'thick_hide', baseAmount: 10 },
    rare: { materialId: 'magic_essence', baseAmount: 15 },
    epic: { materialId: 'void_shard', baseAmount: 20 },
    legendary: { materialId: 'dragon_scale', baseAmount: 25 }
};

export const FORGE_GOLD_BASE_COST = 100;

export function calculateForgeCost(rarity: EquipmentRarity, stats: Partial<GameStats>, characterLevel: number): { materials: { materialId: string; amount: number }[]; gold: number } {
    const rarityMultiplier = RARITY_MULTIPLIER[rarity];
    const statValues = Object.values(stats);
    const statCount = statValues.length;
    
    // Standard stat limit for this level (base power)
    const basePower = FORGE_BASE_STAT_VALUE + (characterLevel * FORGE_STAT_PER_LEVEL);
    
    // Calculate "Magnitude" - how much power we are packing into the item
    // Power is now logarithmic, so we calculate magnitude based on the multiplier
    let totalMagnitude = 0;
    statValues.forEach(val => {
        const multiplier = val / basePower;
        if (multiplier > 1.1) { 
            // Beyond 1.1x, cost scales with power. For 1000x, we need extreme scaling but capped.
            // Using a power of 1.5 ensures 1000x power costs roughly 1000^1.5 = 31,622x base cost.
            totalMagnitude += Math.pow(multiplier, 1.5);
        } else {
            totalMagnitude += multiplier;
        }
    });

    // Material cost damping: materials shouldn't scale as aggressively as gold
    // We use a log-based damping for high material amounts
    const baseMaterial = FORGE_MATERIAL_COSTS[rarity];
    const rawMaterialAmount = baseMaterial.baseAmount * (1 + totalMagnitude * 0.5) * (1 + (statCount * 0.2));
    const materialAmount = Math.max(
        baseMaterial.baseAmount,
        Math.floor(rawMaterialAmount > 1000 ? 1000 + Math.log10(rawMaterialAmount - 999) * 100 : rawMaterialAmount)
    );
    
    // Gold cost calculation
    const goldCost = Math.floor(
        FORGE_GOLD_BASE_COST * 
        rarityMultiplier * 
        (1 + totalMagnitude * 2) * 
        (1 + (statCount * 0.5))
    );
    
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
