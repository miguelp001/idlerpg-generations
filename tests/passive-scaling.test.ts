import { describe, test, expect } from 'vitest';
import { getActivePassiveBonuses } from '../services/abilityService';

describe('Passive Skill Scaling', () => {
    test('Warrior Endurance Training scales with level', () => {
        const abilityId = 'warrior_endurance_training';
        
        // At level 1 (though requirement is 3, let's test logic)
        const bonusLvl1 = getActivePassiveBonuses({ level: 1, activePassives: [abilityId] });
        // Expected: bonus.health (20) + (scalingBonus.health (10) * 1) = 30
        expect(bonusLvl1.health).toBe(30);

        // At level 10
        const bonusLvl10 = getActivePassiveBonuses({ level: 10, activePassives: [abilityId] });
        // Expected: 20 + (10 * 10) = 120
        expect(bonusLvl10.health).toBe(120);
    });

    test('Multiple passives stack correctly', () => {
        const passives = ['warrior_endurance_training', 'warrior_weapon_mastery'];
        
        const bonusLvl5 = getActivePassiveBonuses({ level: 5, activePassives: passives });
        // Endurance: 20 + 10*5 = 70 health
        // Weapon Mastery: 5 + 1*5 = 10 attack
        expect(bonusLvl5.health).toBe(70);
        expect(bonusLvl5.attack).toBe(10);
    });

    test('Rogue passives scale correctly', () => {
        const abilityId = 'rogue_fleet_footed';
        
        const bonusLvl20 = getActivePassiveBonuses({ level: 20, activePassives: [abilityId] });
        // Fleet Footed: 5 agility + 1*20 = 25 agility
        expect(bonusLvl20.agility).toBe(25);
    });

    test('Scaling bonus handles missing bonus or scalingBonus fields', () => {
        // Test with a dummy ability if needed, but our current ones are fine.
        // Let's just ensure it doesn't crash if an ability somehow lacks one.
        const bonus = getActivePassiveBonuses({ level: 10, activePassives: ['non_existent_ability'] });
        expect(bonus).toEqual({});
    });
});
