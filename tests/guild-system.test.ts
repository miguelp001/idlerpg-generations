import { describe, it, expect } from 'vitest';
import { characterReducer } from '../context/reducers/characterReducer';
import { worldReducer } from '../context/reducers/worldReducer';
import { GameState, Character, Guild } from '../types';
import { v4 as uuidv4 } from 'uuid';

const mockCharacter: Character = {
  id: 'char-1',
  name: 'Test Hero',
  class: 'warrior',
  level: 1,
  experience: 0,
  stats: { health: 100, mana: 50, attack: 10, defense: 10, agility: 5, intelligence: 5 },
  maxStats: { health: 100, mana: 50, attack: 10, defense: 10, agility: 5, intelligence: 5 },
  equipment: [],
  accessorySlots: [null, null],
  inventory: [],
  generation: 1,
  parentIds: [],
  children: [],
  lastActive: new Date().toISOString(),
  gold: 100000,
  status: 'active',
  legacyBonus: {},
  party: [],
  completedRaids: {},
  completedQuests: [],
  quests: [],
  potentialHeirs: [],
  activePassives: [],
  personality: 'brave',
  unlockedAchievements: [],
  equippedTitle: null,
  endlessDungeonProgress: 1,
  materials: {},
  currentHealth: 100,
  currentMana: 50,
  guildId: null
};

const mockInitialState: GameState = {
  characters: [mockCharacter],
  activeCharacterId: 'char-1',
  worldState: {
    day: 1,
    time: 'day',
    activeEvents: [],
    factionStandings: {},
    globalGoldMultiplier: 1,
    mercenaries: [],
    corpses: []
  },
  settings: { volume: 0.5, autoSave: true, endlessAutoProgress: true },
  dungeonState: {
    status: 'idle',
    dungeonId: null,
    monsterId: null,
    currentMonsterHealth: null,
    currentMonsterIndex: -1,
    combatLog: [],
    xpGained: 0,
    goldGained: 0,
    lootFound: [],
    turnCount: 0,
    cooldowns: {},
    rooms: [],
    currentRoomIndex: -1
  },
  raidState: {
    status: 'idle',
    raidId: null,
    bossId: null,
    currentBossHealth: null,
    combatLog: [],
    goldGained: 0,
    lootFound: [],
    turnCount: 0,
    cooldowns: {}
  },
  isLoaded: true,
  pendingGeneration: null,
  tavernAdventurers: [],
  guild: null,
  relationships: [],
  socialLog: [],
  isGrinding: false,
  shopItems: [],
  tutorialShown: true
};

describe('Guild System Integration', () => {
  it('should create a guild and link it to the character', () => {
    const action = { type: 'CREATE_GUILD', payload: { characterId: 'char-1', guildName: 'Test Guild' } } as any;
    const stateWithGuild = worldReducer(mockInitialState, action);
    
    expect(stateWithGuild.guild).not.toBeNull();
    expect(stateWithGuild.guild?.name).toBe('Test Guild');
    expect(stateWithGuild.guild?.upgrades.barracks).toBe(0);
    
    // Check character has the guildId
    const char = stateWithGuild.characters.find(c => c.id === 'char-1');
    expect(char?.guildId).toBe(stateWithGuild.guild?.id);
    expect(char?.gold).toBeLessThan(100000);
  });

  it('should upgrade guild facilities', () => {
    const guild: Guild = {
      id: 'guild-1',
      name: 'Test Guild',
      level: 1,
      experience: 0,
      members: [],
      upgrades: { barracks: 0, vault: 0, library: 0 }
    };
    
    const initialState = { ...mockInitialState, guild, characters: [ { ...mockCharacter, guildId: 'guild-1' } ] };
    const action = { type: 'UPGRADE_GUILD', payload: { characterId: 'char-1', upgradeType: 'barracks' } } as any;
    
    const stateAfterUpgrade = worldReducer(initialState, action);
    expect(stateAfterUpgrade.guild?.upgrades.barracks).toBe(1);
    
    const char = stateAfterUpgrade.characters[0];
    expect(char.gold).toBeLessThan(100000);
  });

  it('should persist guild membership across retirement', () => {
    const guildId = 'guild-1';
    const heirloom: any = { id: 'heir-1', baseId: 'rusty_dagger', name: 'Heirloom Dagger', baseName: 'Rusty Dagger', slot: 'weapon', rarity: 'common', stats: { attack: 2 }, upgradeLevel: 1, price: 10 };
    const guild: Guild = {
      id: guildId,
      name: 'Test Guild',
      level: 5,
      experience: 100,
      members: [],
      upgrades: { barracks: 2, vault: 2, library: 2 }
    };
    
    const stateWithGuild = { ...mockInitialState, guild, characters: [ { ...mockCharacter, guildId: guildId, equipment: [heirloom] } ] };
    
    // Retire character
    const retireAction = { type: 'RETIRE_CHARACTER', payload: { characterId: 'char-1', heirloomId: 'heir-1' } } as any;
    const stateAfterRetirement = characterReducer(stateWithGuild, retireAction);
    
    expect(stateAfterRetirement.pendingGeneration).not.toBeNull();
    
    // Create new character (heir)
    const createHeirAction = { 
        type: 'CREATE_CHARACTER', 
        payload: { 
            name: 'Heir Hero', 
            class: 'warrior', 
            personality: 'brave' 
        } 
    } as any;
    
    const stateWithHeir = characterReducer(stateAfterRetirement, createHeirAction);
    const heir = stateWithHeir.characters.find(c => c.name === 'Heir Hero');
    
    expect(stateWithHeir.guild).not.toBeNull();
    expect(stateWithHeir.guild?.id).toBe(guildId);
    expect(heir?.guildId).toBe(guildId); // Persistence Check!
    expect(heir?.stats.attack).toBeGreaterThan(10); // Check if stats include guild level bonus
  });
});
