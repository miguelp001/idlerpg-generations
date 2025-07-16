// Test script for procedural loot generation
const { generateProceduralDungeon } = require('./services/proceduralDungeonService.ts');

console.log('Testing Procedural Loot Generation...\n');

// Test different floors and levels
const testCases = [
    { floor: 1, level: 5 },
    { floor: 5, level: 10 },
    { floor: 10, level: 15 },
    { floor: 25, level: 25 },
    { floor: 50, level: 35 },
    { floor: 100, level: 50 }
];

testCases.forEach(({ floor, level }) => {
    console.log(`\n=== Floor ${floor}, Character Level ${level} ===`);
    
    try {
        const dungeon = generateProceduralDungeon(floor, level);
        
        console.log(`Dungeon: ${dungeon.name}`);
        console.log(`Biome: ${dungeon.biome}`);
        console.log(`Difficulty: ${(dungeon.difficulty * 100).toFixed(1)}%`);
        console.log(`Level Requirement: ${dungeon.levelRequirement}`);
        console.log(`Monsters: ${dungeon.monsters.join(', ')}`);
        console.log(`Boss: ${dungeon.boss}`);
        console.log(`Loot Items: ${dungeon.lootTable.length}`);
        console.log(`Loot Table: ${dungeon.lootTable.join(', ')}`);
        
    } catch (error) {
        console.error(`Error generating dungeon for floor ${floor}:`, error.message);
    }
});

console.log('\n=== Testing Deterministic Generation ===');

// Test that the same floor generates the same dungeon
const floor = 15;
const level = 20;
const dungeonId = 'test_dungeon_15';

try {
    const dungeon1 = generateConsistentProceduralDungeon(floor, 'forest', level, dungeonId);
    const dungeon2 = generateConsistentProceduralDungeon(floor, 'forest', level, dungeonId);
    
    console.log(`\nDungeon 1: ${dungeon1.name}`);
    console.log(`Loot 1: ${dungeon1.lootTable.join(', ')}`);
    
    console.log(`\nDungeon 2: ${dungeon2.name}`);
    console.log(`Loot 2: ${dungeon2.lootTable.join(', ')}`);
    
    const isIdentical = JSON.stringify(dungeon1) === JSON.stringify(dungeon2);
    console.log(`\nDeterministic generation working: ${isIdentical ? 'YES' : 'NO'}`);
    
} catch (error) {
    console.error('Error testing deterministic generation:', error.message);
}

console.log('\nProcedural loot generation test completed!');
