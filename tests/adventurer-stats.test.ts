import { describe, it, expect } from 'vitest';
import { recalculateAdventurerStats } from '../services/statService';
import { Adventurer, Equipment } from '../types';

describe('Adventurer Stat Calculation', () => {
    const mockAdventurer: Adventurer = {
        id: 'test-adv',
        name: 'Test Warrior',
        class: 'warrior',
        level: 1,
        experience: 0,
        stats: { health: 120, mana: 30, attack: 15, defense: 12, agility: 8, intelligence: 5 },
        personality: 'brave',
        equipment: [],
        accessorySlots: [null, null],
        recruitmentCost: 100,
        activePassives: []
    };

    const healthAmulet: Equipment = {
        id: 'hp-amulet',
        baseId: 'hp-amulet',
        name: 'HP Amulet',
        baseName: 'HP Amulet',
        slot: 'accessory',
        rarity: 'rare',
        stats: { health: 100 },
        upgradeLevel: 0,
        price: 100,
        level: 1,
        classAffinity: { warrior: 1.0 }
    };

    it('should correctly apply 100% of stats for 1.0 affinity', () => {
        const advWithGear = { ...mockAdventurer, accessorySlots: [healthAmulet, null] as [Equipment | null, Equipment | null] };
        const updated = recalculateAdventurerStats(advWithGear);
        // Warrior base health is 120. Amulet gives 100 * 1.0 = 100. Total = 220.
        expect(updated.stats.health).toBe(220);
    });

    it('should correctly apply partial stats for lower affinity', () => {
        const lowAffinityAmulet = { ...healthAmulet, classAffinity: { warrior: 0.5 } };
        const advWithGear = { ...mockAdventurer, accessorySlots: [lowAffinityAmulet, null] as [Equipment | null, Equipment | null] };
        const updated = recalculateAdventurerStats(advWithGear);
        // 120 + (100 * 0.5) = 170
        expect(updated.stats.health).toBe(170);
    });

    it('should preserve health percentage after equipping a health-boosting item', () => {
        // Start at 50% health (60/120)
        const damagedAdv = { ...mockAdventurer, currentHealth: 60 };
        const advWithGear = { ...damagedAdv, accessorySlots: [healthAmulet, null] as [Equipment | null, Equipment | null] };
        
        const updated = recalculateAdventurerStats(advWithGear);
        
        // New max health is 220. 50% of 220 is 110.
        expect(updated.stats.health).toBe(220);
        expect(updated.currentHealth).toBe(110);
    });

    it('should handle missing currentHealth by defaulting to 100%', () => {
        const advWithGear = { ...mockAdventurer, accessorySlots: [healthAmulet, null] as [Equipment | null, Equipment | null] };
        const updated = recalculateAdventurerStats(advWithGear);
        
        expect(updated.currentHealth).toBe(220);
    });
});
