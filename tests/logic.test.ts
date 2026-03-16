import { describe, it, expect } from 'vitest';
import { characterReducer } from '../context/reducers/characterReducer';
import { combatReducer } from '../context/reducers/combatReducer';
import { worldReducer } from '../context/reducers/worldReducer';
import { GameState, Character } from '../types';

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
  inventory: [
    { id: 'item-1', baseId: 'rusty_dagger', name: 'Rusty Dagger', baseName: 'Rusty Dagger', slot: 'weapon', rarity: 'common', stats: { attack: 2 }, upgradeLevel: 0, price: 10 }
  ],
  generation: 1,
  parentIds: [],
  children: [],
  lastActive: new Date().toISOString(),
  gold: 100,
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
  currentMana: 50
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

describe('characterReducer', () => {
  it('should equip an item and update stats', () => {
    const action = { type: 'EQUIP_ITEM', payload: { characterId: 'char-1', itemId: 'item-1' } } as any;
    const newState = characterReducer(mockInitialState, action);
    const char = newState.characters[0];
    
    expect(char.equipment.length).toBe(1);
    expect(char.inventory.length).toBe(0);
    expect(char.equipment[0].baseId).toBe('rusty_dagger');
    // Stats should be recalculated (10 base + 2 from dagger)
    expect(char.stats.attack).toBeGreaterThan(10);
  });

  it(' should handle gold changes', () => {
      const action = { type: 'UPDATE_CHARACTER', payload: { id: 'char-1', gold: 200 } } as any;
      const newState = characterReducer(mockInitialState, action);
      expect(newState.characters[0].gold).toBe(200);
  });
});

describe('worldReducer', () => {
  it('should advance time from day to night', () => {
    const action = { type: 'ADVANCE_WORLD_STATE' } as any;
    const newState = worldReducer(mockInitialState, action);
    expect(newState.worldState.time).toBe('night');
    expect(newState.worldState.day).toBe(1);
  });

  it('should advance to next day and roll for event', () => {
    const nightState = { ...mockInitialState, worldState: { ...mockInitialState.worldState, time: 'night' } } as any;
    const action = { type: 'ADVANCE_WORLD_STATE' } as any;
    const newState = worldReducer(nightState, action);
    expect(newState.worldState.time).toBe('day');
    expect(newState.worldState.day).toBe(2);
  });
});

describe('combatReducer', () => {
    it('should initialize dungeon state', () => {
        const action = { type: 'START_DUNGEON', payload: { dungeonId: 'dungeon_goblin_cave' } } as any;
        const newState = combatReducer(mockInitialState, action);
        expect(newState.dungeonState.status).toBe('fighting');
        expect(newState.dungeonState.dungeonId).toBe('dungeon_goblin_cave');
        expect(newState.dungeonState.rooms.length).toBeGreaterThan(0);
    });
});
