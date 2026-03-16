import { Dungeon, DungeonRoom, DungeonRoomType } from '../types';
import { generateProceduralLoot } from './lootGenerationService';

export interface ProceduralDungeon extends Omit<Dungeon, 'id' | 'name' | 'description'> {
    id: string;
    name: string;
    description: string;
    floor: number;
    biome: DungeonBiome;
    difficulty: number;
    isEndless: true;
    rooms: DungeonRoom[];
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
    
    // Generate room sequence
    const roomCount = 5 + Math.floor(floor / 10); // Dungeon length scales with floor
    const rooms = generateRooms(roomCount, biomeConfig, targetLevel, difficulty, floor);
    
    // Legacy support (though we should favor rooms)
    const monsters = rooms.filter(r => r.type === 'combat').map(r => r.monsterId!);
    const bossId = rooms.find(r => r.type === 'boss')?.monsterId || biomeConfig.bossTypes[0];
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
        rooms,
        floor,
        biome,
        difficulty,
        isEndless: true
    };
}

function generateRooms(count: number, config: BiomeConfig, targetLevel: number, difficulty: number, floor: number): DungeonRoom[] {
    const rooms: DungeonRoom[] = [];
    
    for (let i = 0; i < count; i++) {
        let type: DungeonRoomType;
        
        if (i === 0) {
            type = 'combat'; // Always start with combat
        } else if (i === count - 1) {
            type = 'boss'; // Always end with boss
        } else {
            // Weighted random for middle rooms
            const rand = Math.random();
            if (rand < 0.6) type = 'combat';
            else if (rand < 0.8) type = 'treasure';
            else if (rand < 0.9) type = 'rest';
            else type = 'event';
        }
        
        const room: DungeonRoom = {
            id: `room_${i}_${Date.now()}`,
            type,
            isCleared: false
        };
        
        if (type === 'combat' || type === 'boss') {
            const types = type === 'boss' ? config.bossTypes : config.monsterTypes;
            room.monsterId = types[Math.floor(Math.random() * types.length)];
        } else if (type === 'treasure') {
            room.treasure = {
                gold: Math.floor(50 * difficulty * (1 + floor / 10)),
                items: generateProceduralLoot(targetLevel, difficulty, floor).slice(0, 1) // One item in treasure rooms
            };
        } else if (type === 'event') {
            room.event = generateRandomEvent(floor);
        }
        
        rooms.push(room);
    }
    
    return rooms;
}

function generateRandomEvent(_floor: number) {
    const events = [
        {
            description: "You find a mysterious altar glowing with soft blue light.",
            choices: [
                { id: 'pray', label: 'Pray at the altar', description: 'Seek a blessing from the ancient spirits.', outcomeId: 'event_altar_pray' },
                { id: 'ignore', label: 'Ignore it', description: 'Better safe than sorry.', outcomeId: 'event_ignore' }
            ]
        },
        {
            description: "A suspicious-looking merchant waves you over from the shadows.",
            choices: [
                { id: 'trade', label: 'Trade with him', description: 'See what he has to offer.', outcomeId: 'event_merchant_trade' },
                { id: 'refuse', label: 'Walk away', description: 'He looks untrustworthy.', outcomeId: 'event_ignore' }
            ]
        }
    ];
    
    return events[Math.floor(Math.random() * events.length)];
}

function selectBiome(floor: number): DungeonBiome {
    const biomes: DungeonBiome[] = ['forest', 'cave', 'undead', 'elemental', 'demonic', 'celestial', 'void', 'draconic', 'giant', 'construct'];
    
    // Cycle through biomes consistently every 5 floors
    const index = Math.floor(floor / 5) % biomes.length;
    
    return biomes[index];
}

function calculateDifficulty(floor: number, targetLevel: number): number {
    // Base difficulty increases with floor - made much steeper for endless mode
    const baseDifficulty = 2 + (floor * 1.2);
    
    // Adjust for target level vs floor relationship - made much less forgiving
    const levelAdjustment = Math.max(4.5, targetLevel / (floor + 1));
    
    return baseDifficulty * levelAdjustment;
}

export function getEndlessDungeonProgress(_characterId: string): number {
    return 1;
}

export function setEndlessDungeonProgress(_characterId: string, _floor: number): void {
}
