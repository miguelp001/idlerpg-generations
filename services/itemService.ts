import { v4 as uuidv4 } from 'uuid';
import { Equipment } from '../types';
import { ITEMS } from '../data/items';
import { RARITY_MULTIPLIER, SHOP_ITEM_BASE_PRICE, SHOP_ITEM_PRICE_MULTIPLIER } from '../constants';

/**
 * Calculates a base price for an item definition
 */
export function calculateItemPrice(rarity: string, levelRequirement?: number): number {
    const rarityMultiplier = RARITY_MULTIPLIER[rarity as keyof typeof RARITY_MULTIPLIER] || 1;
    const levelMultiplier = levelRequirement ? (levelRequirement / 5) + 1 : 1;
    return Math.floor(SHOP_ITEM_BASE_PRICE * rarityMultiplier * levelMultiplier * SHOP_ITEM_PRICE_MULTIPLIER);
}

/**
 * Instantiates a concrete Equipment object from a base item ID
 */
export function instantiateItem(baseId: string): Equipment | null {
    const itemDef = ITEMS[baseId];
    if (!itemDef) {
        console.error(`Item definition not found for ID: ${baseId}`);
        return null;
    }

    return {
        ...itemDef,
        id: uuidv4(),
        baseId: baseId,
        baseName: itemDef.name,
        upgradeLevel: 0,
        price: calculateItemPrice(itemDef.rarity, itemDef.levelRequirement),
        level: itemDef.levelRequirement || 1
    };
}
