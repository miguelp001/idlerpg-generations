import { GameStats, ParentInfo, PotentialHeir, CharacterClassType, Equipment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { CLASSES } from '../constants';

/**
 * Generates a potential heir based on two parents.
 */
export const generateHeir = (p1: ParentInfo, p2: ParentInfo): PotentialHeir => {
    const childClass = Math.random() > 0.5 ? p1.class : p2.class;
    
    // Simple naming logic: combine parents' names
    const firstName = p1.name.split(' ')[0];
    const lastName = p2.name.split(' ').slice(-1)[0];
    const childName = `${firstName} ${lastName}`;

    const baseStats = { ...CLASSES[childClass].baseStats };
    
    // Heritage Bonus: 10% of parents' average stats added to base stats
    const legacyBonus: Partial<GameStats> = {};
    for (const stat in baseStats) {
        const key = stat as keyof GameStats;
        legacyBonus[key] = Math.floor(((p1.stats[key] ?? 0) + (p2.stats[key] ?? 0)) * 0.05);
    }

    return {
        childId: uuidv4(),
        name: childName,
        class: childClass,
        parents: [p1, p2],
        legacyBonus,
        baseStats: calculateInitialStats(baseStats, legacyBonus)
    };
};

/**
 * Combines base stats with legacy bonuses.
 */
const calculateInitialStats = (base: GameStats, bonus: Partial<GameStats>): GameStats => {
    return {
        health: base.health + (bonus.health || 0),
        mana: base.mana + (bonus.mana || 0),
        attack: base.attack + (bonus.attack || 0),
        defense: base.defense + (bonus.defense || 0),
        agility: base.agility + (bonus.agility || 0),
        intelligence: base.intelligence + (bonus.intelligence || 0),
    };
};

/**
 * Prepares an heirloom for inheritance.
 */
export const prepareHeirloom = (item: Equipment): Equipment => {
    return {
        ...item,
        isHeirloom: true,
        name: `Ancestral ${item.baseName}`,
        rarity: 'epic' // Heirlooms are always at least epic quality
    };
};
