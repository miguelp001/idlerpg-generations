
import { v4 as uuidv4 } from 'uuid';
import { Adventurer, CharacterClassType, GameStats, PersonalityTrait } from '../types';
import { CLASSES, ADVENTURER_FIRST_NAMES, ADVENTURER_LAST_NAMES, PERSONALITY_TRAITS } from '../constants';

export const getScaledStats = (level: number, classKey: CharacterClassType): GameStats => {
    const baseStats = CLASSES[classKey].baseStats;
    const scaledStats: GameStats = { ...baseStats };

    // Simple scaling: add 15% of base stats for each level above 1
    for (const key in baseStats) {
        const statKey = key as keyof GameStats;
        const growth = (baseStats[statKey] * 0.15) * (level - 1);
        scaledStats[statKey] += Math.floor(growth);
    }
    return scaledStats;
};

export const generateAdventurer = (playerLevel: number): Adventurer => {
    const classKeys = Object.keys(CLASSES) as CharacterClassType[];
    const randomClass = classKeys[Math.floor(Math.random() * classKeys.length)];
    
    // Generate a level within a reasonable range of the player's level
    const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);
    
    const name = `${ADVENTURER_FIRST_NAMES[Math.floor(Math.random() * ADVENTURER_FIRST_NAMES.length)]} ${ADVENTURER_LAST_NAMES[Math.floor(Math.random() * ADVENTURER_LAST_NAMES.length)]}`;

    const personalityKeys = Object.keys(PERSONALITY_TRAITS) as PersonalityTrait[];
    const randomPersonality = personalityKeys[Math.floor(Math.random() * personalityKeys.length)];

    return {
        id: uuidv4(),
        name,
        class: randomClass,
        level,
        experience: 0,
        stats: getScaledStats(level, randomClass),
        personality: randomPersonality,
        equipment: [],
    };
};

export const calculateMaxPartySize = (level: number): number => {
    if (level >= 10) {
        return 4;
    }
    if (level >= 5) {
        return 3;
    }
    return 2; // Starts with Player + 1 Adventurer
};