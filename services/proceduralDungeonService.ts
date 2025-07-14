import { Dungeon, Monster, Equipment } from '../types';
import { MONSTERS, RAID_BOSSES } from '../data/monsters';

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
    
    // Generate monster composition
    const monsterCount = Math.min(6, 3 + Math.floor(floor / 10)); // More monsters on deeper floors, max 6
    const monsters = generateMonsterList(biomeConfig.monsterTypes, monsterCount, targetLevel, difficulty);
    
    // Select boss
    const bossId = biomeConfig.bossTypes[Math.floor(Math.random() * biomeConfig.bossTypes.length)];
    
    // Generate basic loot table using existing item IDs
    const lootTable = generateBasicLootTable(targetLevel, floor);
    
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
    
    // Generate monster composition deterministically
    const monsterCount = Math.min(6, 3 + Math.floor(floor / 10)); // More monsters on deeper floors, max 6
    const monsters = generateDeterministicMonsterList(biomeConfig.monsterTypes, monsterCount, seed);
    
    // Select boss deterministically
    const bossIndex = seed % biomeConfig.bossTypes.length;
    const bossId = biomeConfig.bossTypes[bossIndex];
    
    // Generate deterministic loot table using existing item IDs
    const lootTable = generateDeterministicLootTable(targetLevel, floor, seed);
    
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
    // Base difficulty increases with floor
    const baseDifficulty = 1 + (floor * 0.1);
    
    // Adjust for target level vs floor relationship
    const levelAdjustment = Math.max(0.5, targetLevel / (floor + 10));
    
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

function generateBasicLootTable(targetLevel: number, floor: number): string[] {
    // Basic loot table using existing item IDs from the game
    const basicItems = [
        'worn_sword', 'iron_sword', 'steel_sword', 'enchanted_blade',
        'tattered_tunic', 'leather_armor', 'chain_mail', 'plate_armor',
        'simple_pendant', 'silver_ring', 'magic_amulet', 'plain_ring'
    ];
    
    const lootCount = Math.min(4, 2 + Math.floor(floor / 15)); // More loot on deeper floors
    const lootTable: string[] = [];
    
    for (let i = 0; i < lootCount; i++) {
        const randomItem = basicItems[Math.floor(Math.random() * basicItems.length)];
        lootTable.push(randomItem);
    }
    
    return lootTable;
}

function generateDeterministicLootTable(targetLevel: number, floor: number, seed: number): string[] {
    // Basic loot table using existing item IDs from the game
    const basicItems = [
        'worn_sword', 'iron_sword', 'steel_sword', 'enchanted_blade',
        'tattered_tunic', 'leather_armor', 'chain_mail', 'plate_armor',
        'simple_pendant', 'silver_ring', 'magic_amulet', 'plain_ring'
    ];
    
    const lootCount = Math.min(4, 2 + Math.floor(floor / 15)); // More loot on deeper floors
    const lootTable: string[] = [];
    
    for (let i = 0; i < lootCount; i++) {
        const index = (seed + i * 23) % basicItems.length; // Use different multiplier for each position
        lootTable.push(basicItems[index]);
    }
    
    return lootTable;
}
