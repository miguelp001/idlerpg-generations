import { Monster, GameStats } from '../types';
import { MONSTERS, RAID_BOSSES, ALL_MONSTERS } from '../data/monsters';

export interface ScaledMonster extends Monster {
    originalId: string;
    scalingFactor: number;
    floor?: number;
}

// Cache for scaled monsters to avoid regenerating the same monster multiple times
const scaledMonsterCache = new Map<string, ScaledMonster>();

export function generateScaledMonster(baseId: string, targetLevel: number, difficulty: number = 1, floor?: number): ScaledMonster {
    const cacheKey = `${baseId}_${targetLevel}_${difficulty}_${floor || 0}`;
    
    if (scaledMonsterCache.has(cacheKey)) {
        return scaledMonsterCache.get(cacheKey)!;
    }

    const baseMonster = ALL_MONSTERS[baseId];
    if (!baseMonster) {
        throw new Error(`Monster with id ${baseId} not found`);
    }

    const scalingFactor = calculateScalingFactor(targetLevel, difficulty);
    const scaledStats = scaleStats(baseMonster.stats, scalingFactor);
    const scaledRewards = scaleRewards(baseMonster.xpReward, baseMonster.goldDrop, scalingFactor, targetLevel);

    const scaledMonster: ScaledMonster = {
        id: `${baseId}_scaled_${targetLevel}_${Math.round(difficulty * 100)}_${floor || 0}`,
        name: generateScaledName(baseMonster.name, difficulty, floor),
        stats: scaledStats,
        xpReward: scaledRewards.xp,
        goldDrop: scaledRewards.gold,
        isRaidBoss: baseMonster.isRaidBoss,
        originalId: baseId,
        scalingFactor,
        floor
    };

    scaledMonsterCache.set(cacheKey, scaledMonster);
    return scaledMonster;
}

function calculateScalingFactor(targetLevel: number, difficulty: number): number {
    // Base scaling increases with target level
    const levelScaling = Math.pow(targetLevel / 10, 1.2);
    
    // Difficulty multiplier
    const difficultyScaling = Math.pow(difficulty, 0.8);
    
    // Minimum scaling to ensure monsters are always somewhat challenging
    return Math.max(0.5, levelScaling * difficultyScaling);
}

function scaleStats(baseStats: GameStats, scalingFactor: number): GameStats {
    return {
        health: Math.round(baseStats.health * scalingFactor),
        mana: Math.round(baseStats.mana * scalingFactor),
        attack: Math.round(baseStats.attack * scalingFactor),
        defense: Math.round(baseStats.defense * scalingFactor),
        agility: Math.round(baseStats.agility * scalingFactor),
        intelligence: Math.round(baseStats.intelligence * scalingFactor)
    };
}

function scaleRewards(baseXp: number, baseGold: number, scalingFactor: number, targetLevel: number): { xp: number; gold: number } {
    // XP scaling should be more conservative to prevent power leveling
    const xpScaling = Math.pow(scalingFactor, 0.6);
    const goldScaling = scalingFactor;
    
    // Level-based bonus
    const levelBonus = 1 + (targetLevel * 0.05);
    
    return {
        xp: Math.round(baseXp * xpScaling * levelBonus),
        gold: Math.round(baseGold * goldScaling * levelBonus)
    };
}

function generateScaledName(baseName: string, difficulty: number, floor?: number): string {
    const prefixes = [];
    
    // Add difficulty-based prefixes
    if (difficulty >= 3) {
        prefixes.push('Apex');
    } else if (difficulty >= 2.5) {
        prefixes.push('Elite');
    } else if (difficulty >= 2) {
        prefixes.push('Veteran');
    } else if (difficulty >= 1.5) {
        prefixes.push('Hardened');
    }
    
    // Add floor-based prefixes for very deep floors
    if (floor && floor >= 100) {
        prefixes.push('Abyssal');
    } else if (floor && floor >= 50) {
        prefixes.push('Deep');
    }
    
    const prefix = prefixes.length > 0 ? prefixes.join(' ') + ' ' : '';
    return `${prefix}${baseName}`;
}

export function clearScaledMonsterCache(): void {
    scaledMonsterCache.clear();
}

export function getScaledMonsterCacheSize(): number {
    return scaledMonsterCache.size;
}

// Utility function to create monster variants for specific encounters
export function createMonsterVariant(baseId: string, variantName: string, statMultipliers: Partial<GameStats>, rewardMultiplier: number = 1): ScaledMonster {
    const baseMonster = ALL_MONSTERS[baseId];
    if (!baseMonster) {
        throw new Error(`Monster with id ${baseId} not found`);
    }

    const variantStats: GameStats = {
        health: Math.round(baseMonster.stats.health * (statMultipliers.health || 1)),
        mana: Math.round(baseMonster.stats.mana * (statMultipliers.mana || 1)),
        attack: Math.round(baseMonster.stats.attack * (statMultipliers.attack || 1)),
        defense: Math.round(baseMonster.stats.defense * (statMultipliers.defense || 1)),
        agility: Math.round(baseMonster.stats.agility * (statMultipliers.agility || 1)),
        intelligence: Math.round(baseMonster.stats.intelligence * (statMultipliers.intelligence || 1))
    };

    return {
        id: `${baseId}_variant_${variantName.toLowerCase().replace(/\s+/g, '_')}`,
        name: variantName,
        stats: variantStats,
        xpReward: Math.round(baseMonster.xpReward * rewardMultiplier),
        goldDrop: Math.round(baseMonster.goldDrop * rewardMultiplier),
        isRaidBoss: baseMonster.isRaidBoss,
        originalId: baseId,
        scalingFactor: rewardMultiplier
    };
}
