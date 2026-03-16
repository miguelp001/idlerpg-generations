import { Character, GameStats, Equipment } from '../types';
import { CLASSES, GUILD_LEVEL_BONUS } from '../constants';
import { SETS } from '../data/sets';
import { getActivePassiveBonuses } from './abilityService';

export const recalculateStats = (character: Character, guildLevel: number = 0): { stats: GameStats, maxStats: GameStats } => {
    const baseStats = { ...CLASSES[character.class].baseStats };
    let newMaxStats: GameStats = { ...baseStats };

    for (const stat in newMaxStats) {
        (newMaxStats as any)[stat] = (baseStats as any)[stat] || 0;
    }

    for (const [stat, value] of Object.entries(character.legacyBonus || {})) {
        (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + value;
    }
    
    const passiveBonuses = getActivePassiveBonuses(character);
     for (const [stat, value] of Object.entries(passiveBonuses)) {
        (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + value;
    }

    for (const item of character.equipment) {
        const affinity = item.classAffinity?.[character.class] ?? 1.0;
        for (const [stat, value] of Object.entries(item.stats)) {
            (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + Math.round(value * affinity);
        }
    }

    for (const item of character.accessorySlots) {
        if (item) {
            const affinity = item.classAffinity?.[character.class] ?? 1.0;
            for (const [stat, value] of Object.entries(item.stats)) {
                (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + Math.round(value * affinity);
            }
        }
    }

    const equippedSets: Record<string, number> = {};
    for (const item of character.equipment) {
        if (item.setId) {
            equippedSets[item.setId] = (equippedSets[item.setId] || 0) + 1;
        }
    }

    for (const item of character.accessorySlots) {
        if (item && item.setId) {
            equippedSets[item.setId] = (equippedSets[item.setId] || 0) + 1;
        }
    }
    
    for (const [setId, count] of Object.entries(equippedSets)) {
        const set = SETS[setId];
        if (set) {
            for (const [requiredCount, bonus] of Object.entries(set.bonuses)) {
                if (count >= Number(requiredCount)) {
                    for (const [stat, value] of Object.entries(bonus)) {
                        (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + value;
                    }
                }
            }
        }
    }

    // Apply Guild Level Bonus if character is in a guild
    if (guildLevel > 0) {
        const bonusMultiplier = 1 + (guildLevel * GUILD_LEVEL_BONUS);
        for (const stat in newMaxStats) {
            (newMaxStats as any)[stat] = Math.round((newMaxStats as any)[stat] * bonusMultiplier);
        }
    }
    
    const currentHealthPercent = character.maxStats.health > 0 ? (character.currentHealth ?? character.stats.health) / character.maxStats.health : 1;
    const currentManaPercent = character.maxStats.mana > 0 ? (character.currentMana ?? character.stats.mana) / character.maxStats.mana : 1;
    
    const newCurrentHealth = Math.round(newMaxStats.health * currentHealthPercent);
    const newCurrentMana = Math.round(newMaxStats.mana * currentManaPercent);

    return { stats: { ...newMaxStats, health: newCurrentHealth, mana: newCurrentMana }, maxStats: newMaxStats };
};
