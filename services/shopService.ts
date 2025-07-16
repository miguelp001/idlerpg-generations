import { Equipment } from '../types';
import { ITEMS, ItemDefinition } from '../data/items'; // Import ItemDefinition
import { v4 as uuidv4 } from 'uuid';
import { RARITY_MULTIPLIER, SHOP_ITEM_BASE_PRICE, SHOP_ITEM_PRICE_MULTIPLIER } from '../constants';
import { generateProceduralItem } from './lootGenerationService';


const calculateItemPrice = (item: ItemDefinition): number => {
    const rarityMultiplier = RARITY_MULTIPLIER[item.rarity];
    const levelMultiplier = item.levelRequirement ? (item.levelRequirement / 5) + 1 : 1;
    return Math.floor(SHOP_ITEM_BASE_PRICE * rarityMultiplier * levelMultiplier * SHOP_ITEM_PRICE_MULTIPLIER);
}

export const generateShopItems = (playerLevel: number): Equipment[] => {
    const items: Equipment[] = [];
    const availableItems = Object.values(ITEMS) as ItemDefinition[]; // Explicitly cast to ItemDefinition[]

    // Generate 2-3 static items around player's level (reduced from 4 to make room for procedural items)
    const staticItemCount = 2 + Math.floor(Math.random() * 2); // 2-3 static items
    for (let i = 0; i < staticItemCount; i++) {
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

    // Generate 2-3 procedural items around player's level
    const proceduralItemCount = 2 + Math.floor(Math.random() * 2); // 2-3 procedural items
    for (let i = 0; i < proceduralItemCount; i++) {
        const levelVariance = Math.floor(Math.random() * 6) - 3; // -3 to +3 levels for more variety
        const targetLevel = Math.max(1, playerLevel + levelVariance);
        
        // Calculate difficulty based on level difference (higher level = higher difficulty)
        const difficulty = 1.0 + Math.max(0, levelVariance) * 0.2;
        
        // Use a simulated floor based on player level for procedural generation
        const simulatedFloor = Math.max(1, playerLevel * 2 + Math.floor(Math.random() * 10) - 5);
        
        const proceduralItem = generateProceduralItem(targetLevel, difficulty, simulatedFloor);
        
        // Adjust price for shop (procedural items might be more expensive)
        const shopPriceMultiplier = 1.2 + (proceduralItem.rarity === 'legendary' ? 0.5 : 
                                          proceduralItem.rarity === 'epic' ? 0.3 : 
                                          proceduralItem.rarity === 'rare' ? 0.2 : 0.1);
        proceduralItem.price = Math.floor(proceduralItem.price * shopPriceMultiplier);
        
        items.push(proceduralItem);
    }

    // Add one high-level item (could be static or procedural)
    if (Math.random() < 0.6) {
        // 60% chance for a high-level static item
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
    } else {
        // 40% chance for a high-level procedural item
        const highLevel = playerLevel + 10 + Math.floor(Math.random() * 10); // 10-20 levels above
        const highDifficulty = 2.0 + Math.random() * 1.0; // Higher difficulty for better stats
        const highFloor = Math.max(50, playerLevel * 3); // Simulate deep dungeon floor
        
        const highProceduralItem = generateProceduralItem(highLevel, highDifficulty, highFloor);
        
        // Premium pricing for high-level procedural items
        const premiumMultiplier = 2.0 + (highProceduralItem.rarity === 'legendary' ? 1.0 : 
                                        highProceduralItem.rarity === 'epic' ? 0.7 : 0.5);
        highProceduralItem.price = Math.floor(highProceduralItem.price * premiumMultiplier);
        
        items.push(highProceduralItem);
    }

    return items;
};
