import { Character, GameStats, Equipment, Adventurer, CharacterClassType, Guild } from '../types';
import { CLASSES, GUILD_LEVEL_BONUS, GUILD_BARRACKS_BONUS } from '../constants';
import { SETS } from '../data/sets';
import { getActivePassiveBonuses } from './abilityService';

const applyEquipmentStats = (stats: GameStats, equipment: Equipment[], accessorySlots: (Equipment | null)[], characterClass: CharacterClassType) => {
    const newStats = { ...stats };
    
    for (const item of equipment) {
        const affinityBonus = item.classAffinity?.[characterClass] ?? 0;
        const affinityMultiplier = 1 + (affinityBonus / 100);
        for (const [stat, value] of Object.entries(item.stats)) {
            (newStats as any)[stat] = ((newStats as any)[stat] || 0) + Math.round(value * affinityMultiplier);
        }
    }

    for (const item of accessorySlots) {
        if (item) {
            const affinityBonus = item.classAffinity?.[characterClass] ?? 0;
            const affinityMultiplier = 1 + (affinityBonus / 100);
            for (const [stat, value] of Object.entries(item.stats)) {
                (newStats as any)[stat] = ((newStats as any)[stat] || 0) + Math.round(value * affinityMultiplier);
            }
        }
    }

    const equippedSets: Record<string, number> = {};
    for (const item of equipment) {
        if (item.setId) {
            equippedSets[item.setId] = (equippedSets[item.setId] || 0) + 1;
        }
    }

    for (const item of accessorySlots) {
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
                        (newStats as any)[stat] = ((newStats as any)[stat] || 0) + (value as number);
                    }
                }
            }
        }
    }

    return newStats;
};

export const recalculateStats = (character: Character, guild: Guild | null = null): { stats: GameStats, maxStats: GameStats } => {
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

    newMaxStats = applyEquipmentStats(newMaxStats, character.equipment, character.accessorySlots, character.class);

    // Apply Guild Level Bonus and Upgrades
    if (guild) {
        const guildLevelBonus = guild.level * GUILD_LEVEL_BONUS;
        const barracksBonus = (guild.upgrades?.barracks || 0) * GUILD_BARRACKS_BONUS;
        const totalMultiplier = 1 + guildLevelBonus + barracksBonus;
        
        for (const stat in newMaxStats) {
            (newMaxStats as any)[stat] = Math.round((newMaxStats as any)[stat] * totalMultiplier);
        }
    }
    
    const currentHealthPercent = (character.maxStats && character.maxStats.health > 0) ? (character.currentHealth ?? character.stats.health) / character.maxStats.health : 1;
    const currentManaPercent = (character.maxStats && character.maxStats.mana > 0) ? (character.currentMana ?? character.stats.mana) / character.maxStats.mana : 1;
    
    const newCurrentHealth = Math.round(newMaxStats.health * currentHealthPercent);
    const newCurrentMana = Math.round(newMaxStats.mana * currentManaPercent);

    return { stats: { ...newMaxStats, health: newCurrentHealth, mana: newCurrentMana }, maxStats: newMaxStats };
};

export const recalculateAdventurerStats = (adventurer: Adventurer): Adventurer => {
    // Start with scaled base stats for their level
    const baseStats = CLASSES[adventurer.class].baseStats;
    const scaledStats: GameStats = { ...baseStats };

    for (const key in baseStats) {
        const statKey = key as keyof GameStats;
        const growth = (baseStats[statKey] * 0.15) * (adventurer.level - 1);
        scaledStats[statKey] += Math.floor(growth);
    }

    const finalStats = applyEquipmentStats(scaledStats, adventurer.equipment, adventurer.accessorySlots || [null, null], adventurer.class);
    
    return {
        ...adventurer,
        stats: finalStats
    };
};
