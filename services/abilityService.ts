
import { Character, Ability, GameStats } from '../types';
import { ABILITIES } from '../data/abilities';

/**
 * Gets all abilities a character has unlocked based on their class and level.
 */
export const getUnlockedAbilities = (character: Character): Ability[] => {
    return Object.values(ABILITIES).filter(ability => 
        ability.class === character.class && character.level >= ability.levelRequirement
    );
};

/**
 * Calculates the total stat bonuses from a character's active passive abilities.
 */
export const getActivePassiveBonuses = (character: { level: number; activePassives: string[] }): Partial<GameStats> => {
    const totalBonuses: Partial<GameStats> = {};

    character.activePassives.forEach(abilityId => {
        const ability = ABILITIES[abilityId];
        if (ability && ability.type === 'passive') {
            // Base bonus
            if (ability.bonus) {
                for (const [stat, value] of Object.entries(ability.bonus)) {
                    const statKey = stat as keyof GameStats;
                    totalBonuses[statKey] = (totalBonuses[statKey] || 0) + value;
                }
            }
            // Scaling bonus: scalingBonus * level
            if (ability.scalingBonus) {
                for (const [stat, value] of Object.entries(ability.scalingBonus)) {
                    const statKey = stat as keyof GameStats;
                    const scaledVal = value * character.level;
                    totalBonuses[statKey] = (totalBonuses[statKey] || 0) + Math.floor(scaledVal);
                }
            }
        }
    });

    return totalBonuses;
};
