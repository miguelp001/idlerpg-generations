const { distributeEquipment, findBestRecipient } = require('./services/lootDistributionService');

// Mock data for testing
const mockPlayer = {
    id: 'player1',
    class: 'warrior',
    equipment: [
        {
            id: 'weapon1',
            slot: 'weapon',
            rarity: 'common',
            stats: { attack: 10 },
            upgradeLevel: 0
        }
    ],
    accessorySlots: [null, null]
};

const mockParty = [
    {
        id: 'party1',
        name: 'Aric',
        class: 'mage',
        equipment: [
            {
                id: 'weapon2',
                slot: 'weapon',
                rarity: 'common',
                stats: { intelligence: 5 },
                upgradeLevel: 0
            }
        ]
    },
    {
        id: 'party2',
        name: 'Bryn',
        class: 'rogue',
        equipment: []
    }
];

const mockLoot = [
    {
        id: 'loot1',
        name: 'Superior Sword',
        slot: 'weapon',
        rarity: 'rare',
        stats: { attack: 25 },
        upgradeLevel: 0
    },
    {
        id: 'loot2',
        name: 'Mystic Staff',
        slot: 'weapon',
        rarity: 'epic',
        stats: { intelligence: 30, mana: 20 },
        classAffinity: { mage: 1.5 },
        upgradeLevel: 0
    },
    {
        id: 'loot3',
        name: 'Leather Armor',
        slot: 'armor',
        rarity: 'uncommon',
        stats: { defense: 15, agility: 10 },
        upgradeLevel: 0
    },
    {
        id: 'loot4',
        name: 'Magic Ring',
        slot: 'accessory',
        rarity: 'rare',
        stats: { intelligence: 12, mana: 15 },
        upgradeLevel: 0
    }
];

console.log('Testing Loot Distribution System...\n');

// Test 1: Basic distribution
console.log('=== Test 1: Basic Distribution ===');
const result1 = distributeEquipment(mockLoot, mockPlayer, mockParty);
console.log('Player items:', result1.playerItems.map(i => `${i.name} (${i.slot})`));
console.log('Distributions:');
result1.distributions.forEach(d => {
    console.log(`  ${d.recipient.name} (${d.recipient.class}) gets: ${d.item.name}`);
    if (d.replacedItem) {
        console.log(`    Replaced: ${d.replacedItem.name}`);
    }
});

// Test 2: Class affinity preference
console.log('\n=== Test 2: Class Affinity Test ===');
const mageStaff = {
    id: 'mage_staff',
    name: 'Arcane Staff',
    slot: 'weapon',
    rarity: 'epic',
    stats: { intelligence: 20, mana: 25 },
    classAffinity: { mage: 2.0 }, // Strong mage affinity
    upgradeLevel: 0
};

const bestRecipient = findBestRecipient(mageStaff, mockPlayer, mockParty);
console.log(`Best recipient for ${mageStaff.name}:`, bestRecipient ? `${bestRecipient.name} (${bestRecipient.class})` : 'Player keeps it');

// Test 3: No improvement scenario
console.log('\n=== Test 3: No Improvement Scenario ===');
const weakWeapon = {
    id: 'weak_weapon',
    name: 'Rusty Dagger',
    slot: 'weapon',
    rarity: 'common',
    stats: { attack: 3 },
    upgradeLevel: 0
};

const bestRecipient2 = findBestRecipient(weakWeapon, mockPlayer, mockParty);
console.log(`Best recipient for ${weakWeapon.name}:`, bestRecipient2 ? `${bestRecipient2.name} (${bestRecipient2.class})` : 'Player keeps it');

console.log('\n=== Test Complete ===');
