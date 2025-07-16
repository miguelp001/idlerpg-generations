// Test script for procedural shop items
const { generateShopItems } = require('./services/shopService.ts');

// Mock the required dependencies
const mockUuidv4 = () => `test-${Math.random().toString(36).substr(2, 9)}`;
const mockItems = {
    worn_sword: {
        name: 'Worn Sword',
        slot: 'weapon',
        rarity: 'common',
        stats: { attack: 5 },
        levelRequirement: 1
    },
    iron_armor: {
        name: 'Iron Armor',
        slot: 'armor',
        rarity: 'uncommon',
        stats: { defense: 8 },
        levelRequirement: 5
    }
};

const mockConstants = {
    RARITY_MULTIPLIER: {
        common: 1,
        uncommon: 2,
        rare: 4,
        epic: 8,
        legendary: 16
    },
    SHOP_ITEM_BASE_PRICE: 10,
    SHOP_ITEM_PRICE_MULTIPLIER: 1.5
};

const mockLootGeneration = {
    generateProceduralItem: (level, difficulty, floor) => ({
        id: mockUuidv4(),
        baseId: `proc_weapon_rare_${level}`,
        name: `Enchanted Blade of Level ${level}`,
        baseName: `Enchanted Blade of Level ${level}`,
        slot: 'weapon',
        rarity: 'rare',
        stats: { attack: level * 2, agility: level },
        upgradeLevel: 0,
        price: level * 20
    })
};

// Mock the imports
jest.mock('uuid', () => ({ v4: mockUuidv4 }));
jest.mock('./data/items', () => ({ ITEMS: mockItems }));
jest.mock('./constants', () => mockConstants);
jest.mock('./services/lootGenerationService', () => mockLootGeneration);

console.log('Testing shop item generation...');

try {
    // Test with different player levels
    const levels = [1, 10, 25, 50];
    
    levels.forEach(level => {
        console.log(`\n=== Testing Level ${level} ===`);
        const shopItems = generateShopItems(level);
        
        console.log(`Generated ${shopItems.length} items:`);
        shopItems.forEach((item, index) => {
            const isProceduralItem = item.baseId.startsWith('proc_');
            console.log(`${index + 1}. ${item.name} (${item.rarity}) - ${item.price}G ${isProceduralItem ? '[PROCEDURAL]' : '[STATIC]'}`);
        });
        
        // Count procedural vs static items
        const proceduralCount = shopItems.filter(item => item.baseId.startsWith('proc_')).length;
        const staticCount = shopItems.length - proceduralCount;
        console.log(`Procedural items: ${proceduralCount}, Static items: ${staticCount}`);
    });
    
    console.log('\n✅ Shop procedural item generation test completed successfully!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
}
