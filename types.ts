

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
export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Material {
  id: string;
  name: string;
  rarity: MaterialRarity;
  description: string;
}

export interface ForgeOrder {
  id: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  targetStats: Partial<GameStats>;
  requiredMaterials: { materialId: string; amount: number }[];
  goldCost: number;
}

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
    members: Adventurer[]; // Roster of adventurers in the guild
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
    factionId?: string;
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
  accessorySlots: [Equipment | null, Equipment | null]; // Two accessory slots
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
  endlessDungeonProgress: number; // Highest floor reached in endless dungeons
  materials: Record<string, number>;
  activeForgeOrder?: ForgeOrder;
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

export type DungeonRoomType = 'combat' | 'treasure' | 'event' | 'boss' | 'rest';

export interface DungeonRoom {
    id: string;
    type: DungeonRoomType;
    monsterId?: string; // For combat and boss rooms
    treasure?: {
        gold: number;
        items: string[]; // baseIds
    };
    event?: {
        description: string;
        choices: DungeonEventChoice[];
    };
    isCleared: boolean;
}

export interface DungeonEventChoice {
    id: string;
    label: string;
    description: string;
    outcomeId: string; // Handle in reducer
}

export interface Dungeon {
    id: string;
    name: string;
    description: string;
    levelRequirement: number;
    monsters: string[]; // array of monster ids (fallback/legacy)
    boss: string; // monster id (fallback/legacy)
    lootTable: string[]; // array of item baseIds (fallback/legacy)
    rooms?: DungeonRoom[]; // New room-based structure
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
    type: 'damage' | 'info' | 'victory' | 'defeat' | 'special' | 'gold' | 'quest' | 'banter' | 'ability' | 'dodge' | 'critical' | 'parry' | 'block' | 'treasure';
    actor?: 'player' | 'ally' | 'enemy' | 'system';
}

export interface SocialLogEntry {
    id: string;
    timestamp: string;
    type: 'social_interaction' | 'marriage' | 'retirement' | 'world_event' | 'quest';
    content: string;
    participantIds?: string[];
}

export type DungeonStatus = 'idle' | 'fighting' | 'paused' | 'victory' | 'defeat' | 'room_cleared' | 'treasure_found' | 'resting' | 'event';
export type RaidStatus = 'idle' | 'fighting' | 'paused' | 'victory' | 'defeat';

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
    cooldowns: Record<string, number>;
    proceduralDungeonData?: any; // Store the generated procedural dungeon data
    rooms: DungeonRoom[];
    currentRoomIndex: number;
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

export interface MercenaryHeir {
    id: string; // instance ID
    ownerId: string;
    ownerName: string;
    characterData: Adventurer;
    dailyRate: number;
    totalEarned: number;
    description: string;
    isRegistered: boolean;
}

export interface DungeonCorpse {
    id: string;
    playerName: string;
    characterClass: CharacterClassType;
    level: number;
    dungeonId: string;
    floor: number;
    roomIndex: number;
    timestamp: string; // ISO string
    gold: number;
    materials: Record<string, number>;
}

export type WorldEventType = 'economic' | 'combat' | 'social' | 'catastrophe' | 'favorable';

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: WorldEventType;
  duration: number; // in days
  modifiers: {
    shopPrices?: number; // multiplier, e.g., 0.8 for 20% discount
    monsterStats?: number; // multiplier
    xpGain?: number;
    goldGain?: number;
    relationshipGain?: number;
  };
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  alignment: 'order' | 'chaos' | 'neutral';
  reputation: number; // -100 to 100
  tier: number; // 0 to 5
  bonuses: string[];
}

export interface WorldState {
  day: number;
  time: 'day' | 'night';
  activeEvents: WorldEvent[];
  factionStandings: Record<string, number>;
  globalGoldMultiplier: number;
  mercenaries: MercenaryHeir[];
  corpses: DungeonCorpse[];
}

export interface GameSettings {
  volume: number;
  autoSave: boolean;
  endlessAutoProgress: boolean;
}

export interface GameState {
  characters: Character[];
  activeCharacterId: string | null;
  worldState: WorldState;
  settings: GameSettings;
  dungeonState: DungeonState;
  raidState: RaidState;
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
  relationships: Relationship[];
  socialLog: SocialLogEntry[];
  isGrinding: boolean;
  shopItems: Equipment[];
  tutorialShown: boolean; // New flag to track if the tutorial has been shown
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
  | { type: 'START_ENDLESS_DUNGEON'; payload: { characterId: string; floor: number } }
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
  | { type: 'RECRUIT_TO_GUILD'; payload: { characterId: string; adventurerId: string; } }
  | { type: 'START_RAID'; payload: { raidId: string } }
  | { type: 'DO_RAID_COMBAT_TURN' }
  | { type: 'END_RAID' }
  | { type: 'ACCEPT_QUEST'; payload: { characterId: string; questId: string } }
  | { type: 'TURN_IN_QUEST'; payload: { characterId: string; questId: string } }
  | { type: 'SIMULATE_SOCIAL_TURN' }
  | { type: 'CREATE_HEIR'; payload: { characterId: string, parents: [ParentInfo, ParentInfo] } }
  | { type: 'GIVE_ITEM_TO_ADVENTURER'; payload: { characterId: string; adventurerId: string; itemId: string; giftResponse: { response: string; scoreChange: number; } } }
  | { type: 'MARRY_PARTNER'; payload: { characterId: string; partnerId: string; } }
  | { type: 'ADD_COMBAT_BANTER'; payload: { message: string } }
  | { type: 'ADD_SOCIAL_LOG'; payload: { message: string; participantIds?: [string, string]; } }
  | { type: 'ADD_ACHIEVEMENTS'; payload: { characterId: string; achievementIds: string[] } }
  | { type: 'EQUIP_TITLE'; payload: { characterId: string; title: string | null; } }
  | { type: 'TOGGLE_PASSIVE_ABILITY'; payload: { characterId: string; abilityId: string; } }
  | { type: 'SET_GRINDING'; payload: boolean }
  | { type: 'SELL_ALL_BY_RARITY'; payload: { characterId: string; maxRarity: EquipmentRarity; } }
  | { type: 'SET_SHOP_ITEMS'; payload: Equipment[]; }
  | { type: 'REFRESH_SHOP'; payload: { characterId: string; } }
  | { type: 'BUY_ITEM'; payload: { characterId: string; itemId: string; } }
  | { type: 'REQUEST_FORGE'; payload: { characterId: string; order: Omit<ForgeOrder, 'id' | 'requiredMaterials' | 'goldCost'> } }
  | { type: 'CANCEL_FORGE'; payload: { characterId: string } }
  | { type: 'CLAIM_FORGE'; payload: { characterId: string } }
  | { type: 'SET_TUTORIAL_SHOWN'; payload: boolean }
  | { type: 'PAUSE_COMBAT' }
  | { type: 'RESUME_COMBAT' }
  | { type: 'PAUSE_RAID_COMBAT' }
  | { type: 'RESUME_RAID_COMBAT' }
  | { type: 'CLAIM_TREASURE' }
  | { type: 'REST' }
  | { type: 'NEXT_ROOM' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'MARRY_PARTNER'; payload: { characterId: string; partnerId: string; } }
  | { type: 'SELECT_HEIR'; payload: { characterId: string; heirId: string; } }
  | { type: 'ADVANCE_WORLD_STATE' }
  | { type: 'REGISTER_MERCENARY'; payload: { characterId: string; rate: number; description: string } }
  | { type: 'HIRE_MERCENARY'; payload: { characterId: string; mercenaryId: string } }
  | { type: 'CLAIM_MERCENARY_REWARDS'; payload: { characterId: string } }
  | { type: 'DROP_CORPSE'; payload: { characterId: string; dungeonId: string; floor: number; roomIndex: number } }
  | { type: 'LOOT_CORPSE'; payload: { characterId: string; corpseId: string } }
  | { type: 'BLESS_CORPSE'; payload: { characterId: string; corpseId: string } }
  | { type: 'PRUNE_WORLD_STATE' };
