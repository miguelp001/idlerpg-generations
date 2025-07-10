

export type CharacterClassType = 'warrior' | 'mage' | 'rogue' | 'cleric';

export interface GameStats {
  health: number;
  mana: number;
  attack: number;
  defense: number;
  agility: number;
  intelligence: number;
}

export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface Equipment {
  id: string; // Unique instance ID
  baseId: string; // ID from constants
  name: string; // "Rusty Dagger +1"
  baseName: string; // "Rusty Dagger"
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  stats: Partial<GameStats>;
  upgradeLevel: number;
  isHeirloom?: boolean;
  classAffinity?: { [key in CharacterClassType]?: number };
  setId?: string;
  price: number; // New property for shop items
}

export interface Ability {
    id: string;
    name: string;
    description: string;
    log_templates: string[];
    type: 'active' | 'passive';
    class: CharacterClassType;
    levelRequirement: number;
    manaCost?: number;
    cooldown?: number;
    effect?: {
        type: 'damage' | 'heal';
        multiplier: number;
        stat: keyof GameStats;
    };
    target?: 'enemy' | 'self' | 'ally';
    bonus?: Partial<GameStats>;
}

export interface ItemSet {
    id: string;
    name: string;
    bonuses: { [count: number]: Partial<GameStats> };
}


export type PersonalityTrait = 'brave' | 'cautious' | 'jovial' | 'serious' | 'greedy' | 'generous';
export type RelationshipStatus = 'strangers' | 'acquaintances' | 'friendly' | 'rivals' | 'best_friends' | 'dating' | 'married';

export interface Adventurer {
    id: string;
    name: string;
    class: CharacterClassType;
    level: number;
    experience: number;
    stats: GameStats;
    personality: PersonalityTrait;
    partnerId?: string;
    equipment: Equipment[];
    // Transient combat state
    currentHealth?: number;
    currentMana?: number;
}

export interface Guild {
    id: string;
    name: string;
    level: number;
    xp: number;
}

export interface QuestObjective {
    type: 'kill';
    targetId: string; // monsterId
    requiredAmount: number;
}

export interface PlayerQuestObjective extends QuestObjective {
    currentAmount: number;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    levelRequirement: number;
    objectives: QuestObjective[];
    rewards: {
        xp: number;
        gold: number;
        items?: string[]; // array of item baseIds
    };
    followUpQuestId?: string;
}

export interface PlayerQuest {
    questId: string;
    objectives: PlayerQuestObjective[];
}

export interface ParentInfo {
    id: string;
    name: string;
    class: CharacterClassType;
    stats: GameStats;
}

export interface PotentialHeir {
    childId: string;
    name: string;
    class: CharacterClassType;
    parents: [ParentInfo, ParentInfo];
    legacyBonus: Partial<GameStats>;
    baseStats: GameStats;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    title: string;
    isSecret?: boolean;
    unlock: {
        type: 'level' | 'gold' | 'generation' | 'quest' | 'kill' | 'raid' | 'marriage' | 'guild_level' | 'upgrade_level' | 'item_rarity';
        value: number | string;
    };
}

export interface Character {
  id:string;
  name: string;
  class: CharacterClassType;
  level: number;
  experience: number;
  stats: GameStats;
  maxStats: GameStats;
  equipment: Equipment[];
  inventory: Equipment[];
  generation: number;
  parentIds: string[];
  children: string[];
  lastActive: string; // ISO string
  gold: number;
  status: 'active' | 'retired';
  legacyBonus: Partial<GameStats>;
  party: Adventurer[];
  guildId?: string;
  completedRaids: Record<string, string>; // { [raidId]: timestamp }
  quests: PlayerQuest[];
  completedQuests: string[];
  potentialHeirs: PotentialHeir[];
  activePassives: string[];
  personality: PersonalityTrait;
  partnerId?: string;
  unlockedAchievements: string[];
  equippedTitle: string | null;
  // Transient combat state
  currentHealth?: number;
  currentMana?: number;
}

export interface Monster {
    id: string;
    name: string;
    stats: GameStats;
    xpReward: number;
    goldDrop: number;
    isRaidBoss?: boolean;
}

export interface Dungeon {
    id: string;
    name: string;
    description: string;
    levelRequirement: number;
    monsters: string[]; // array of monster ids
    boss: string; // monster id
    lootTable: string[]; // array of item baseIds
}

export interface Raid {
    id: string;
    name: string;
    description: string;
    guildLevelRequirement: number;
    bossId: string;
    lootTable: string[];
}

export interface CombatLogEntry {
    id: string;
    message: string;
    type: 'damage' | 'info' | 'victory' | 'defeat' | 'special' | 'gold' | 'quest' | 'banter' | 'ability' | 'dodge' | 'critical' | 'parry' | 'block';
    actor?: 'player' | 'ally' | 'enemy' | 'system';
}

export interface SocialLogEntry {
    id: string;
    message: string;
    participantIds?: [string, string];
}

export type DungeonStatus = 'idle' | 'fighting' | 'victory' | 'defeat';
export type RaidStatus = 'idle' | 'fighting' | 'victory' | 'defeat';

export interface DungeonState {
  status: DungeonStatus;
  dungeonId: string | null;
  monsterId: string | null;
  currentMonsterHealth: number | null;
  currentMonsterIndex: number;
  combatLog: CombatLogEntry[];
  xpGained: number;
  goldGained: number;
  lootFound: Equipment[];
  turnCount: number;
  cooldowns: Record<string, number>; // key: charId-abilityId, value: turn available
}

export interface RaidState {
  status: RaidStatus;
  raidId: string | null;
  bossId: string | null;
  currentBossHealth: number | null;
  combatLog: CombatLogEntry[];
  goldGained: number;
  lootFound: Equipment[];
  turnCount: number;
  cooldowns: Record<string, number>; // key: charId-abilityId, value: turn available
}

export interface Relationship {
    id: string; // composite key like "id1-id2"
    participantIds: [string, string];
    score: number;
    status: RelationshipStatus;
    giftCount: number;
}

export interface WorldState {
  day: number;
  time: 'day' | 'night';
}

export interface GameSettings {
  volume: number;
  autoSave: boolean;
}

export interface GameState {
  characters: Character[];
  activeCharacterId: string | null;
  worldState: WorldState;
  settings: GameSettings;
  dungeonState: DungeonState;
  isLoaded: boolean;
  pendingGeneration: {
    parentId: string;
    legacyBonus: Partial<GameStats>;
    heirloom: Equipment;
    availableHeirs?: PotentialHeir[];
    gold: number;
  } | null;
  tavernAdventurers: Adventurer[];
  guild: Guild | null;
  raidState: RaidState;
  relationships: Relationship[];
  socialLog: SocialLogEntry[];
  isGrinding: boolean;
  shopItems: Equipment[]; // New state for shop items
}

export interface SaveData {
  version: string;
  timestamp: string;
  gameState: GameState;
}

// Reducer Action Types
export type Action =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'CREATE_CHARACTER'; payload: Omit<Character, 'id' | 'potentialHeirs'> & { heir?: PotentialHeir } }
  | { type: 'SET_ACTIVE_CHARACTER'; payload: string }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> & { id: string } }
  | { type: 'START_DUNGEON'; payload: { dungeonId: string } }
  | { type: 'DO_COMBAT_TURN' }
  | { type: 'LEAVE_DUNGEON' }
  | { type: 'EQUIP_ITEM'; payload: { characterId: string; itemId: string; } }
  | { type: 'UNEQUIP_ITEM'; payload: { characterId: string; itemId: string; } }
  | { type: 'UPGRADE_ITEM'; payload: { characterId: string; itemId:string; } }
  | { type: 'SELL_ITEM'; payload: { characterId: string; itemId: string; } }
  | { type: 'RETIRE_CHARACTER'; payload: { characterId: string; heirloomId: string; } }
  | { type: 'RECRUIT_ADVENTURER'; payload: { characterId: string; adventurerId: string; } }
  | { type: 'DISMISS_ADVENTURER'; payload: { characterId: string; adventurerId: string; } }
  | { type: 'REFRESH_TAVERN_ADVENTURERS'; payload: { characterId: string } }
  | { type: 'CREATE_GUILD'; payload: { characterId: string; guildName: string; } }
  | { type: 'DONATE_TO_GUILD'; payload: { characterId: string; amount: number; } }
  | { type: 'START_RAID'; payload: { raidId: string } }
  | { type: 'DO_RAID_COMBAT_TURN' }
  | { type: 'END_RAID' }
  | { type: 'ACCEPT_QUEST'; payload: { characterId: string; questId: string } }
  | { type: 'TURN_IN_QUEST'; payload: { characterId: string; questId: string } }
  | { type: 'SIMULATE_SOCIAL_TURN' }
  | { type: 'CREATE_HEIR'; payload: { characterId: string, parents: [ParentInfo, ParentInfo] } }
  | { type: 'GIVE_ITEM_TO_ADVENTURER'; payload: { characterId: string; adventurerId: string; itemId: string; giftResponse: { response: string; scoreChange: number; } } }
  | { type: 'ADD_COMBAT_BANTER'; payload: { message: string } }
  | { type: 'ADD_SOCIAL_LOG'; payload: { message: string; participantIds?: [string, string]; } }
  | { type: 'ADD_ACHIEVEMENTS'; payload: { characterId: string; achievementIds: string[] } }
  | { type: 'EQUIP_TITLE'; payload: { characterId: string; title: string | null; } }
  | { type: 'TOGGLE_PASSIVE_ABILITY'; payload: { characterId: string; abilityId: string; } }
  | { type: 'SET_GRINDING'; payload: boolean }
  | { type: 'SELL_ALL_BY_RARITY'; payload: { characterId: string; maxRarity: EquipmentRarity; } }
  | { type: 'SET_SHOP_ITEMS'; payload: Equipment[]; }
  | { type: 'REFRESH_SHOP'; payload: { characterId: string; } }
  | { type: 'BUY_ITEM'; payload: { characterId: string; itemId: string; } };