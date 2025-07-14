import { Dungeon, Monster, Equipment } from '../types';
import { MONSTERS, RAID_BOSSES } from '../data/monsters';
import { generateScaledMonster } from './monsterScalingService';
import { generateProceduralLoot } from './lootGenerationService';

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
        bossTypes: ['basilisk', 'giant_scorpion', 'owlbear'],
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
        monsterTypes: ['harpy', 'centaur_archer'], // Limited celestial monsters in current set
        bossTypes: ['harpy', 'centaur_archer'],
        themes: ['Sanctum', 'Temple', 'Shrine', 'Cathedral', 'Ascension']
    },
    void: {
        name: 'Void-touched',
        description: 'Reality warps and bends in this space between worlds',
        monsterTypes: ['spectre', 'wraith', 'lich_acolyte'],
        bossTypes: ['wraith', 'lich_acolyte'],
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
    const monsterCount = 4 + Math.floor(floor / 10); // More monsters on deeper floors
    const monsters = generateMonsterList(biomeConfig.monsterTypes, monsterCount, targetLevel, difficulty);
    
    // Select and scale boss
    const bossId = biomeConfig.bossTypes[Math.floor(Math.random() * biomeConfig.bossTypes.length)];
    const scaledBoss = generateScaledMonster(bossId, targetLevel, difficulty * 1.5); // Bosses are stronger
    
    // Generate loot table
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
        boss: scaledBoss.id,
        lootTable,
        floor,
        biome,
        difficulty,
        isEndless: true
    };
}

function selectBiome(floor: number): DungeonBiome {
    const biomes: DungeonBiome[] = ['forest', 'cave', 'undead', 'elemental', 'demonic', 'celestial', 'void', 'draconic', 'giant', 'construct'];
    
    // Cycle through biomes with some randomness
    const baseIndex = Math.floor(floor / 5) % biomes.length;
    const randomOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const finalIndex = Math.max(0, Math.min(biomes.length - 1, baseIndex + randomOffset));
    
    return biomes[finalIndex];
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
        const scaledMonster = generateScaledMonster(randomMonster, targetLevel, difficulty);
        monsters.push(scaledMonster.id);
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
