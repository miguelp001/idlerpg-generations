import { Dungeon, Monster, Equipment, EquipmentRarity, EquipmentSlot, CharacterClassType, GameStats } from '../types';
import { MONSTERS, RAID_BOSSES, ALL_MONSTERS } from '../data/monsters';
import { RARITY_MULTIPLIER } from '../constants';
import { generateScaledMonster } from './monsterScalingService';
import { 
    generateProceduralLoot, 
    generateMilestoneReward, 
    generateProceduralItem,
    calculateItemPrice,
    getSlotStatPreferences,
    getItemPrefixes,
    getItemBases,
    getItemSuffixes
} from './lootGenerationService';

export interface ProceduralDungeon extends Omit<Dungeon, 'id' | 'name' | 'description'> {
    id: string;
    name: string;
    description: string;
    floor: number;
    biome: DungeonBiome;
    difficulty: number;
    isEndless: true;
}

export type DungeonBiome = 
    | 'forest' 
    | 'cave' 
    | 'undead' 
    | 'elemental' 
    | 'demonic' 
    | 'celestial' 
    | 'void' 
    | 'draconic'
    | 'giant'
    | 'construct';

interface BiomeConfig {
    name: string;
    description: string;
    monsterTypes: string[];
    bossTypes: string[];
    themes: string[];
}

const BIOME_CONFIGS: Record<DungeonBiome, BiomeConfig> = {
    forest: {
        name: 'Verdant',
        description: 'A lush wilderness teeming with natural predators',
        monsterTypes: ['dire_wolf', 'wild_boar', 'forest_spider', 'grizzly_bear', 'owlbear', 'centaur_archer'],
        bossTypes: ['owlbear', 'grizzly_bear', 'centaur_archer'],
        themes: ['Grove', 'Thicket', 'Glade', 'Canopy', 'Undergrowth']
    },
    cave: {
        name: 'Subterranean',
        description: 'Dark tunnels echoing with the sounds of lurking creatures',
        monsterTypes: ['giant_rat', 'cave_bat', 'kobold_miner', 'giant_scorpion', 'basilisk'],
        bossTypes: ['basilisk', 'giant_scorpion', 'minotaur'],
        themes: ['Cavern', 'Depths', 'Tunnel', 'Grotto', 'Chasm']
    },
    undead: {
        name: 'Cursed',
        description: 'A realm where death holds no dominion over the restless',
        monsterTypes: ['skeleton_archer', 'zombie_shambler', 'ghoul', 'wight', 'spectre', 'mummy', 'wraith'],
        bossTypes: ['wight', 'spectre', 'mummy', 'wraith'],
        themes: ['Crypt', 'Tomb', 'Necropolis', 'Ossuary', 'Mausoleum']
    },
    elemental: {
        name: 'Primordial',
        description: 'Where the raw forces of creation clash in eternal conflict',
        monsterTypes: ['lesser_fire_elemental', 'lesser_water_elemental', 'lesser_earth_elemental', 'fire_elemental', 'water_elemental', 'earth_elemental', 'air_elemental'],
        bossTypes: ['fire_elemental', 'water_elemental', 'earth_elemental', 'air_elemental'],
        themes: ['Nexus', 'Confluence', 'Maelstrom', 'Crucible', 'Vortex']
    },
    demonic: {
        name: 'Infernal',
        description: 'A hellish landscape where demons plot the downfall of mortals',
        monsterTypes: ['imp', 'succubus', 'horned_devil', 'cultist_acolyte', 'cultist_champion'],
        bossTypes: ['horned_devil', 'succubus', 'cultist_champion'],
        themes: ['Pit', 'Abyss', 'Hellscape', 'Brimstone', 'Pandemonium']
    },
    celestial: {
        name: 'Divine',
        description: 'Sacred halls where celestial beings test mortal worth',
        monsterTypes: ['harpy', 'centaur_archer'],
        bossTypes: ['harpy', 'centaur_archer'],
        themes: ['Sanctum', 'Temple', 'Shrine', 'Cathedral', 'Ascension']
    },
    void: {
        name: 'Void-touched',
        description: 'Reality warps and bends in this space between worlds',
        monsterTypes: ['spectre', 'wraith', 'lich_acolyte', 'vampire_spawn'],
        bossTypes: ['wraith', 'lich_acolyte', 'vampire_spawn'],
        themes: ['Rift', 'Nexus', 'Anomaly', 'Distortion', 'Breach']
    },
    draconic: {
        name: 'Draconic',
        description: 'Ancient lairs where dragons and their kin hoard treasures',
        monsterTypes: ['young_green_dragon', 'drake_rider', 'wyvern'],
        bossTypes: ['young_green_dragon', 'wyvern'],
        themes: ['Lair', 'Roost', 'Hoard', 'Eyrie', 'Dominion']
    },
    giant: {
        name: 'Titanic',
        description: 'Massive structures built for beings of enormous size',
        monsterTypes: ['ogre_brute', 'hill_giant', 'frost_giant', 'fire_giant'],
        bossTypes: ['frost_giant', 'fire_giant', 'hill_giant'],
        themes: ['Stronghold', 'Citadel', 'Fortress', 'Bastion', 'Keep']
    },
    construct: {
        name: 'Mechanical',
        description: 'Ancient workshops where magical constructs still function',
        monsterTypes: ['iron_golem'],
        bossTypes: ['iron_golem'],
        themes: ['Foundry', 'Workshop', 'Laboratory', 'Manufactory', 'Assembly']
    }
};

export function generateProceduralDungeon(floor: number, targetLevel: number): ProceduralDungeon {
    const biome = selectBiome(floor);
    const biomeConfig = BIOME_CONFIGS[biome];
    const difficulty = calculateDifficulty(floor, targetLevel);
    
    // Generate monster composition - reduced scaling and max count
    const monsterCount = Math.min(5, 3 + Math.floor(floor / 15)); // More monsters on deeper floors, max 5
    const monsters = generateMonsterList(biomeConfig.monsterTypes, monsterCount, targetLevel, difficulty);
    
    // Select boss
    const bossId = biomeConfig.bossTypes[Math.floor(Math.random() * biomeConfig.bossTypes.length)];
    
    // Generate procedural loot table
    const lootTable = generateProceduralLoot(targetLevel, difficulty, floor);
    
    // Generate dungeon name and description
    const theme = biomeConfig.themes[Math.floor(Math.random() * biomeConfig.themes.length)];
    const name = `${biomeConfig.name} ${theme} - Floor ${floor}`;
    const description = `${biomeConfig.description}. Danger level: ${Math.round(difficulty * 100)}%`;
    
    return {
        id: `procedural_${floor}_${biome}_${Date.now()}`,
        name,
        description,
        levelRequirement: targetLevel,
        monsters,
        boss: bossId,
        lootTable,
        floor,
        biome,
        difficulty,
        isEndless: true
    };
}

export function generateConsistentProceduralDungeon(floor: number, biome: DungeonBiome, targetLevel: number, dungeonId: string): ProceduralDungeon {
    const biomeConfig = BIOME_CONFIGS[biome];
    const difficulty = calculateDifficulty(floor, targetLevel);
    
    // Use a simple hash of the dungeon ID to create deterministic randomness
    const seed = hashString(dungeonId);
    
    // Generate monster composition deterministically - reduced scaling and max count
    const monsterCount = Math.min(5, 3 + Math.floor(floor / 15)); // More monsters on deeper floors, max 5
    const monsters = generateDeterministicMonsterList(biomeConfig.monsterTypes, monsterCount, seed);
    
    // Select boss deterministically
    const bossIndex = seed % biomeConfig.bossTypes.length;
    const bossId = biomeConfig.bossTypes[bossIndex];
    
    // Generate deterministic procedural loot table
    const lootTable = generateDeterministicProceduralLoot(targetLevel, difficulty, floor, seed);
    
    // Generate dungeon name and description deterministically
    const themeIndex = Math.floor(seed / 100) % biomeConfig.themes.length;
    const theme = biomeConfig.themes[themeIndex];
    const name = `${biomeConfig.name} ${theme} - Floor ${floor}`;
    const description = `${biomeConfig.description}. Danger level: ${Math.round(difficulty * 100)}%`;
    
    return {
        id: dungeonId,
        name,
        description,
        levelRequirement: targetLevel,
        monsters,
        boss: bossId,
        lootTable,
        floor,
        biome,
        difficulty,
        isEndless: true
    };
}

// Simple hash function to create deterministic randomness from a string
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Generate monster list deterministically based on seed
function generateDeterministicMonsterList(monsterTypes: string[], count: number, seed: number): string[] {
    const monsters: string[] = [];
    
    for (let i = 0; i < count; i++) {
        const index = (seed + i * 17) % monsterTypes.length; // Use different multiplier for each position
        monsters.push(monsterTypes[index]);
    }
    
    return monsters;
}

function selectBiome(floor: number): DungeonBiome {
    const biomes: DungeonBiome[] = ['forest', 'cave', 'undead', 'elemental', 'demonic', 'celestial', 'void', 'draconic', 'giant', 'construct'];
    
    // Cycle through biomes consistently every 5 floors
    const index = Math.floor(floor / 5) % biomes.length;
    
    return biomes[index];
}

function calculateDifficulty(floor: number, targetLevel: number): number {
    // Base difficulty increases with floor - reduced from 0.1 to 0.05 per floor
    const baseDifficulty = 1 + (floor * 0.05);
    
    // Adjust for target level vs floor relationship - made more forgiving
    const levelAdjustment = Math.max(0.7, targetLevel / (floor + 5));
    
    return baseDifficulty * levelAdjustment;
}

function generateMonsterList(monsterTypes: string[], count: number, targetLevel: number, difficulty: number): string[] {
    const monsters: string[] = [];
    
    for (let i = 0; i < count; i++) {
        const randomMonster = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
        // For now, just use the base monster ID - scaling will be handled during combat
        monsters.push(randomMonster);
    }
    
    return monsters;
}

export function getEndlessDungeonProgress(characterId: string): number {
    // This would be stored in character data or separate progress tracking
    // For now, return a default value
    return 1;
}

export function setEndlessDungeonProgress(characterId: string, floor: number): void {
    // This would update the character's endless dungeon progress
    // Implementation would depend on how we want to store this data
}

// Generate deterministic procedural loot using seed for consistency
function generateDeterministicProceduralLoot(targetLevel: number, difficulty: number, floor: number, seed: number): string[] {
    const lootTable: string[] = [];
    const lootCount = Math.min(8, 3 + Math.floor(floor / 20)); // More loot on deeper floors, max 8
    
    // Use seed to create deterministic randomness
    let currentSeed = seed;
    
    for (let i = 0; i < lootCount; i++) {
        // Create a deterministic "random" value for this item
        currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
        const normalizedSeed = currentSeed / 0x7fffffff;
        
        const item = generateDeterministicProceduralItem(targetLevel, difficulty, floor, normalizedSeed, i);
        lootTable.push(item.baseId);
    }
    
    return lootTable;
}

// Generate a single procedural item deterministically
function generateDeterministicProceduralItem(targetLevel: number, difficulty: number, floor: number, seedValue: number, itemIndex: number): Equipment {
    // Use seedValue and itemIndex to create deterministic choices
    const rarity = selectDeterministicRarity(difficulty, floor, seedValue);
    const slot = selectDeterministicSlot(seedValue + itemIndex * 0.1);
    const classAffinity = selectDeterministicClassAffinity(seedValue + itemIndex * 0.2);
    
    const baseStats = generateDeterministicBaseStats(targetLevel, rarity, slot, seedValue + itemIndex * 0.3);
    const name = generateDeterministicItemName(slot, rarity, floor, seedValue + itemIndex * 0.4);
    const price = calculateItemPrice(targetLevel, rarity);
    
    const item: Equipment = {
        id: `proc_det_${floor}_${itemIndex}_${Math.floor(seedValue * 1000000)}`,
        baseId: `proc_${slot}_${rarity}_${targetLevel}_${floor}`,
        name,
        baseName: name,
        slot,
        rarity,
        stats: baseStats,
        upgradeLevel: 0,
        classAffinity,
        price
    };
    
    return item;
}

function selectDeterministicRarity(difficulty: number, floor: number, seedValue: number): EquipmentRarity {
    // Base rarity chances
    let rarityWeights = {
        common: 50,
        uncommon: 30,
        rare: 15,
        epic: 4,
        legendary: 1
    };
    
    // Apply same bonuses as regular rarity selection
    const difficultyBonus = Math.max(0, difficulty - 1);
    rarityWeights.rare += difficultyBonus * 5;
    rarityWeights.epic += difficultyBonus * 2;
    rarityWeights.legendary += difficultyBonus * 0.5;
    
    // Floor milestones guarantee better loot
    if (floor % 25 === 0) {
        rarityWeights.legendary += 10;
        rarityWeights.epic += 15;
    } else if (floor % 10 === 0) {
        rarityWeights.epic += 8;
        rarityWeights.rare += 12;
    } else if (floor % 5 === 0) {
        rarityWeights.rare += 10;
        rarityWeights.uncommon += 15;
    }
    
    // Deep floor bonuses
    if (floor >= 100) {
        rarityWeights.legendary += 5;
        rarityWeights.epic += 10;
    } else if (floor >= 50) {
        rarityWeights.epic += 5;
        rarityWeights.rare += 10;
    }
    
    return weightedDeterministicSelect(rarityWeights, seedValue);
}

function selectDeterministicSlot(seedValue: number): EquipmentSlot {
    const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
    const index = Math.floor(seedValue * slots.length);
    return slots[index];
}

function selectDeterministicClassAffinity(seedValue: number): { [key in CharacterClassType]?: number } | undefined {
    // 60% chance of having class affinity
    if (seedValue > 0.6) return undefined;
    
    const classes: CharacterClassType[] = ['warrior', 'mage', 'rogue', 'cleric'];
    const selectedClass = classes[Math.floor(seedValue * classes.length)];
    const affinityBonus = 5 + Math.floor((seedValue * 4) * 15); // 5-20 bonus
    
    return { [selectedClass]: affinityBonus };
}

function generateDeterministicBaseStats(targetLevel: number, rarity: EquipmentRarity, slot: EquipmentSlot, seedValue: number): Partial<GameStats> {
    const rarityMultiplier = RARITY_MULTIPLIER[rarity];
    const levelMultiplier = Math.max(1, targetLevel / 5);
    const baseMultiplier = rarityMultiplier * levelMultiplier;
    
    const stats: Partial<GameStats> = {};
    
    // Slot-based stat preferences (same as original)
    const slotPreferences = getSlotStatPreferences(slot);
    
    // Generate 2-4 stats per item deterministically
    const statCount = 2 + Math.floor(seedValue * 3);
    const availableStats: (keyof GameStats)[] = ['health', 'mana', 'attack', 'defense', 'agility', 'intelligence'];
    
    // Use seedValue to deterministically select stats
    let currentSeed = seedValue;
    for (let i = 0; i < statCount && availableStats.length > 0; i++) {
        currentSeed = (currentSeed * 7 + 0.1) % 1; // Simple deterministic "random"
        const statIndex = Math.floor(currentSeed * availableStats.length);
        const stat = availableStats[statIndex];
        availableStats.splice(statIndex, 1); // Remove to avoid duplicates
        
        const preference = slotPreferences[stat] || 1;
        const baseValue = Math.floor((5 + (currentSeed * 15)) * baseMultiplier * preference);
        
        if (baseValue > 0) {
            stats[stat] = baseValue;
        }
    }
    
    return stats;
}

function generateDeterministicItemName(slot: EquipmentSlot, rarity: EquipmentRarity, floor: number, seedValue: number): string {
    const prefixes = getItemPrefixes(rarity, floor);
    const bases = getItemBases(slot);
    const suffixes = getItemSuffixes(rarity);
    
    const prefix = prefixes[Math.floor(seedValue * prefixes.length)];
    const base = bases[Math.floor((seedValue * 2) % 1 * bases.length)];
    const suffix = (seedValue * 3) % 1 > 0.7 ? ` ${suffixes[Math.floor((seedValue * 4) % 1 * suffixes.length)]}` : '';
    
    return `${prefix} ${base}${suffix}`;
}

function weightedDeterministicSelect<T extends string>(weights: Record<T, number>, seedValue: number): T {
    const totalWeight = Object.values(weights).reduce((sum: number, weight) => sum + (weight as number), 0);
    let target = seedValue * totalWeight;
    
    for (const [item, weight] of Object.entries(weights) as [T, number][]) {
        target -= weight;
        if (target <= 0) {
            return item;
        }
    }
    
    // Fallback to first item if something goes wrong
    return Object.keys(weights)[0] as T;
}
