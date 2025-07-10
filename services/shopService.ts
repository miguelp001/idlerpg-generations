import { Equipment, EquipmentRarity, CharacterClassType, GameStats } from '../types';
import { ITEMS, ItemDefinition } from '../data/items'; // Import ItemDefinition
import { v4 as uuidv4 } from 'uuid';
import { RARITY_MULTIPLIER, SHOP_ITEM_BASE_PRICE, SHOP_ITEM_PRICE_MULTIPLIER } from '../constants';

const RARITY_POOL: EquipmentRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const calculateItemPrice = (item: ItemDefinition): number => {
    const rarityMultiplier = RARITY_MULTIPLIER[item.rarity];
    const levelMultiplier = item.levelRequirement ? (item.levelRequirement / 5) + 1 : 1;
    return Math.floor(SHOP_ITEM_BASE_PRICE * rarityMultiplier * levelMultiplier * SHOP_ITEM_PRICE_MULTIPLIER);
}

export const generateShopItems = (playerLevel: number): Equipment[] => {
    const items: Equipment[] = [];
    const availableItems = Object.values(ITEMS) as ItemDefinition[]; // Explicitly cast to ItemDefinition[]

    // Generate 4 items around player's level
    for (let i = 0; i < 4; i++) {
        const levelVariance = Math.floor(Math.random() * 5) - 2; // -2 to +2 levels
        const targetLevel = Math.max(1, playerLevel + levelVariance);

        const suitableItems = availableItems.filter(item => 
            item.levelRequirement && 
            item.levelRequirement <= targetLevel + 2 && 
            item.levelRequirement >= targetLevel - 2
        );

        if (suitableItems.length > 0) {
            const randomItem = suitableItems[Math.floor(Math.random() * suitableItems.length)];
            items.push({
                ...randomItem,
                id: uuidv4(),
                baseId: randomItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_'), // Generate baseId from name
                baseName: randomItem.name,
                upgradeLevel: 0,
                price: calculateItemPrice(randomItem),
            });
        }
    }

    // Add one item far above player's level
    const veryHighLevel = playerLevel + 15; // 15 levels above player
    const highLevelItems = availableItems.filter(item => 
        item.levelRequirement && 
        item.levelRequirement >= veryHighLevel - 5 &&
        item.levelRequirement <= veryHighLevel + 5
    );

    if (highLevelItems.length > 0) {
        const randomHighItem = highLevelItems[Math.floor(Math.random() * highLevelItems.length)];
        items.push({
            ...randomHighItem,
            id: uuidv4(),
            baseId: randomHighItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            baseName: randomHighItem.name,
            upgradeLevel: 0,
            price: calculateItemPrice(randomHighItem),
        });
    } else if (availableItems.length > 0) {
        // Fallback: if no very high-level items, just pick a random high-rarity item
        const legendaries = availableItems.filter(item => item.rarity === 'legendary');
        const itemToPush = legendaries.length > 0 ? legendaries[Math.floor(Math.random() * legendaries.length)] : availableItems[Math.floor(Math.random() * availableItems.length)];
        items.push({ 
            ...itemToPush, 
            id: uuidv4(),
            baseId: itemToPush.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            baseName: itemToPush.name,
            upgradeLevel: 0,
            price: calculateItemPrice(itemToPush),
        });
    }

    return items;
}; 