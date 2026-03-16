

import React, { createContext, useReducer, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { GameState, Action, Character, Equipment, GameStats, Adventurer, PlayerQuest, PotentialHeir, RelationshipStatus, DungeonState, RaidState, ParentInfo, DungeonStatus, RaidStatus, DungeonRoom, DungeonRoomType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { calculateXpForLevel, CLASSES, UPGRADE_COST, RETIREMENT_LEVEL, REFRESH_TAVERN_COST, SHOP_REFRESH_COST, GUILD_CREATE_COST, GUILD_DONATION_GOLD, GUILD_DONATION_XP, GUILD_XP_TABLE, SELL_PRICE, PERSONALITY_TRAITS, RELATIONSHIP_THRESHOLDS, RARITY_ORDER, GUILD_LEVEL_BONUS } from '../constants';
import { ITEMS } from '../data/items';
import { ALL_MONSTERS } from '../data/monsters';
import { DUNGEONS } from '../data/dungeons';
import { RAIDS } from '../data/raids';
import { QUESTS } from '../data/quests';
import { SETS } from '../data/sets';
import { processCombatTurn } from '../services/combatService';
import { generateAdventurer, getScaledStats, calculateMaxPartySize } from '../services/socialService';
import { getActivePassiveBonuses } from '../services/abilityService';
import { checkAllAchievements, checkKillAchievements } from '../services/achievementService';
import { ACHIEVEMENTS } from '../data/achievements';
import { OFFLINE_SOCIAL_EVENTS } from '../data/socialEvents';
import { rollForNewEvent, updateActiveEvents, getGlobalModifiers, getFactionModifiers } from '../services/worldEventService';
import { generateShopItems } from '../services/shopService';
import { generateMaterialDrops } from '../services/lootGenerationService';
import { calculateForgeCost, generateForgeItem } from '../services/forgeService';
import { generateProceduralDungeon } from '../services/proceduralDungeonService';
import { generateScaledMonster } from '../services/monsterScalingService';
import { generateProceduralItem } from '../services/lootGenerationService';
import { distributeEquipment } from '../services/lootDistributionService';

const SAVE_KEY = 'idleRpgSaveData';

const initialDungeonState: DungeonState = {
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
    proceduralDungeonData: undefined,
    rooms: [],
    currentRoomIndex: -1,
};

const initialRaidState: RaidState = {
    status: 'idle',
    raidId: null,
    bossId: null,
    currentBossHealth: null,
    combatLog: [],
    goldGained: 0,
    lootFound: [],
    turnCount: 0,
    cooldowns: {},
};

const initialState: GameState = {
  characters: [],
  activeCharacterId: null,
  worldState: {
    day: 1,
    time: 'day',
    activeEvents: [],
    factionStandings: {
      'Trade_Consortium': 0,
      'Warrior_Keep': 0,
      'Explorer_League': 0
    },
    globalGoldMultiplier: 1,
  },
  settings: {
    volume: 0.5,
    autoSave: true,
    endlessAutoProgress: true,
  },
  dungeonState: initialDungeonState,
  raidState: initialRaidState,
  isLoaded: false,
  pendingGeneration: null,
  tavernAdventurers: [],
  guild: null,
  relationships: [],
  socialLog: [],
  isGrinding: false,
  shopItems: [],
  tutorialShown: false, // Initialize tutorialShown to false
};

const recalculateStats = (character: Character, guildLevel: number = 0): { stats: GameStats, maxStats: GameStats } => {
    const baseStats = { ...CLASSES[character.class].baseStats };
    let newMaxStats: GameStats = { ...baseStats };

    for (const stat in newMaxStats) {
        (newMaxStats as any)[stat] = (baseStats as any)[stat] || 0;
    }

    for (const [stat, value] of Object.entries(character.legacyBonus || {})) {
        (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + value;
    }
    
    const passiveBonuses = getActivePassiveBonuses(character);
     for (const [stat, value] of Object.entries(passiveBonuses)) {
        (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + value;
    }

    console.log("Base Stats:", newMaxStats);

    for (const item of character.equipment) {
        const affinity = item.classAffinity?.[character.class] ?? 1.0;
        console.log(`Applying stats from ${item.name} (${item.slot}):`, item.stats);
        for (const [stat, value] of Object.entries(item.stats)) {
            (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + Math.round(value * affinity);
        }
    }

    for (const item of character.accessorySlots) {
        if (item) {
            const affinity = item.classAffinity?.[character.class] ?? 1.0;
            console.log(`Applying stats from accessory ${item.name}:`, item.stats);
            for (const [stat, value] of Object.entries(item.stats)) {
                (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + Math.round(value * affinity);
            }
        }
    }

    const equippedSets: Record<string, number> = {};
    for (const item of character.equipment) {
        if (item.setId) {
            equippedSets[item.setId] = (equippedSets[item.setId] || 0) + 1;
        }
    }

    for (const item of character.accessorySlots) {
        if (item && item.setId) {
            equippedSets[item.setId] = (equippedSets[item.setId] || 0) + 1;
        }
    }
    
    console.log("Equipped Sets Count:", equippedSets);

    for (const [setId, count] of Object.entries(equippedSets)) {
        const set = SETS[setId];
        if (set) {
            console.log(`Checking set ${set.name} with ${count} items equipped.`);
            for (const [requiredCount, bonus] of Object.entries(set.bonuses)) {
                console.log(`  Processing requiredCount: ${requiredCount}, Actual equipped count: ${count}, Bonus object:`, bonus);
                if (count >= Number(requiredCount)) {
                    console.log(`Applying ${requiredCount}-piece bonus for ${set.name}:`, bonus);
                    for (const [stat, value] of Object.entries(bonus)) {
                        (newMaxStats as any)[stat] = ((newMaxStats as any)[stat] || 0) + value;
                    }
                }
            }
        }
    }
    // Apply Guild Level Bonus if character is in a guild
    if (guildLevel > 0) {
        const bonusMultiplier = 1 + (guildLevel * GUILD_LEVEL_BONUS);
        for (const stat in newMaxStats) {
            (newMaxStats as any)[stat] = Math.round((newMaxStats as any)[stat] * bonusMultiplier);
        }
    }
    
    console.log("Final Stats after bonuses:", newMaxStats);

    const currentHealthPercent = character.maxStats.health > 0 ? (character.currentHealth ?? character.stats.health) / character.maxStats.health : 1;
    const currentManaPercent = character.maxStats.mana > 0 ? (character.currentMana ?? character.stats.mana) / character.maxStats.mana : 1;
    
    const newCurrentHealth = Math.round(newMaxStats.health * currentHealthPercent);
    const newCurrentMana = Math.round(newMaxStats.mana * currentManaPercent);

    return { stats: { ...newMaxStats, health: newCurrentHealth, mana: newCurrentMana }, maxStats: newMaxStats };
};


const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'LOAD_STATE': {
        let loadedState = action.payload;
        // Only reset dungeon state if not currently in a dungeon
        if (!loadedState.dungeonState || loadedState.dungeonState.status === 'idle') {
            loadedState.dungeonState = initialDungeonState;
        }
        loadedState.raidState = initialRaidState;
        loadedState.pendingGeneration = null; 
        loadedState.isGrinding = false;

        loadedState.characters = loadedState.characters.map(c => ({
            ...c,
            party: (c.party || []).map(p => ({ ...p, experience: p.experience ?? 0, equipment: p.equipment || [] })),
            completedRaids: c.completedRaids || {},
            quests: c.quests || [],
            completedQuests: c.completedQuests || [],
            potentialHeirs: c.potentialHeirs || [],
            activePassives: c.activePassives || [],
            personality: c.personality || 'brave',
            partnerId: c.partnerId,
            unlockedAchievements: c.unlockedAchievements || [],
            equippedTitle: c.equippedTitle || null,
            accessorySlots: c.accessorySlots || [null, null], // Initialize accessory slots
            endlessDungeonProgress: c.endlessDungeonProgress || 1, // Initialize endless dungeon progress
            materials: c.materials || {},
        }));
        
        const activeChar = loadedState.characters.find(c => c.id === loadedState.activeCharacterId);
        const playerLevelForTavern = activeChar ? activeChar.level : 1;
        loadedState.tavernAdventurers = loadedState.tavernAdventurers && loadedState.tavernAdventurers.length > 0
            ? loadedState.tavernAdventurers
            : Array.from({ length: 5 }, () => generateAdventurer(playerLevelForTavern));
        
        loadedState.relationships = (loadedState.relationships || []).map(r => ({ ...r, giftCount: r.giftCount || 0 }));
        loadedState.socialLog = loadedState.socialLog || [];
        loadedState.shopItems = loadedState.shopItems && loadedState.shopItems.length > 0
            ? loadedState.shopItems
            : generateShopItems(activeChar ? activeChar.level : 1); // Initialize shop items on load

        loadedState.tutorialShown = loadedState.tutorialShown ?? false; // Ensure tutorialShown is set

        return { ...loadedState, isLoaded: true };
    }
    case 'CREATE_CHARACTER': {
      let characterData = action.payload;
      
      let newCharacter: Character = {
        ...characterData,
        id: uuidv4(),
        potentialHeirs: [],
        activePassives: [],
        unlockedAchievements: [],
        equippedTitle: null,
        equipment: [], // Initialize equipment as empty
        accessorySlots: [null, null], // Initialize accessory slots as empty
        endlessDungeonProgress: 1, // Initialize endless dungeon progress
        materials: {},
      };

      // Equip starting gear
      const startingWeapon = { ...ITEMS.worn_sword, id: uuidv4(), baseId: 'worn_sword', baseName: ITEMS.worn_sword.name, upgradeLevel: 0, price: 0 };
      const startingArmor = { ...ITEMS.tattered_tunic, id: uuidv4(), baseId: 'tattered_tunic', baseName: ITEMS.tattered_tunic.name, upgradeLevel: 0, price: 0 };
      const startingAccessory1 = { ...ITEMS.simple_pendant, id: uuidv4(), baseId: 'simple_pendant', baseName: ITEMS.simple_pendant.name, upgradeLevel: 0, price: 0 };
      const startingAccessory2 = { ...ITEMS.plain_ring, id: uuidv4(), baseId: 'plain_ring', baseName: ITEMS.plain_ring.name, upgradeLevel: 0, price: 0 };

      newCharacter.equipment.push(startingWeapon);
      newCharacter.equipment.push(startingArmor);
      newCharacter.accessorySlots[0] = startingAccessory1;
      newCharacter.accessorySlots[1] = startingAccessory2;

      let characters = [...state.characters];
      let newRelationships = [...state.relationships];
      let newGuild = state.guild;
      let newSocialLog = [...state.socialLog];
      
      if (state.pendingGeneration) {
        const { parentId, legacyBonus, heirloom } = state.pendingGeneration;
        const parent = state.characters.find(c => c.id === parentId);
        
        if (parent) {
          newCharacter.generation = parent.generation + 1;
          newCharacter.parentIds = [parentId, ...(characterData.heir?.parents.map(p => p.id).filter(id => id !== parentId) ?? [])];
          newCharacter.guildId = parent.guildId;
          const updatedParent = { ...parent, children: [...parent.children, newCharacter.id] };
          characters = characters.map(c => c.id === parentId ? updatedParent : c);
        }
        
        newCharacter.legacyBonus = legacyBonus;
        newCharacter.inventory.push(heirloom);
        newRelationships = state.relationships.filter(r => !r.participantIds.includes(parentId));

      } else {
        newGuild = null;
        newRelationships = [];
        newSocialLog = [];
      }
      
      const { stats, maxStats } = recalculateStats(newCharacter, state.guild?.level || 0);
      newCharacter.stats = stats;
      newCharacter.currentHealth = stats.health;
      newCharacter.currentMana = stats.mana;
      newCharacter.maxStats = maxStats;
      
      const newTavernAdventurers = Array.from({ length: 5 }, () => generateAdventurer(newCharacter.level));
      
      let newState = {
        ...state,
        characters: [...characters, newCharacter],
        activeCharacterId: newCharacter.id,
        pendingGeneration: null,
        tavernAdventurers: newTavernAdventurers,
        guild: newGuild,
        relationships: newRelationships,
        socialLog: newSocialLog,
        shopItems: generateShopItems(newCharacter.level), // Initialize shop items for new character
        tutorialShown: false, // Set tutorialShown to false for a new game
      };
      
      const newlyUnlocked = checkAllAchievements(newCharacter, newState);
      if (newlyUnlocked.length > 0) {
        return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: newCharacter.id, achievementIds: newlyUnlocked } });
      }
      return newState;
    }
    case 'SET_ACTIVE_CHARACTER':
        return { ...state, activeCharacterId: action.payload };
    case 'UPDATE_CHARACTER':
        return {
            ...state,
            characters: state.characters.map(char =>
                char.id === action.payload.id ? { ...char, ...action.payload } : char
            ),
        };
    case 'START_DUNGEON': {
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        if (!activeCharacter) return state;
        const dungeon = DUNGEONS.find(d => d.id === action.payload.dungeonId);
        if (!dungeon) return state;

        // Initialize rooms for regular dungeons if they don't have them
        const dungeonRooms: DungeonRoom[] = dungeon.rooms || [
            ...dungeon.monsters.map((mId, i) => ({ id: `room_m_${i}`, type: 'combat' as DungeonRoomType, monsterId: mId, isCleared: false })),
            { id: 'room_boss', type: 'boss' as DungeonRoomType, monsterId: dungeon.boss, isCleared: false }
        ];

        const firstRoom = dungeonRooms[0];
        const firstMonster = firstRoom.type === 'combat' || firstRoom.type === 'boss' ? (firstRoom.monsterId ? ALL_MONSTERS[firstRoom.monsterId] : null) : null;

        const refreshedParty = activeCharacter.party.map(p => ({
            ...p,
            currentHealth: p.stats.health,
            currentMana: p.stats.mana,
        }));
        const updatedCharacter = {
            ...activeCharacter,
            currentHealth: activeCharacter.maxStats.health,
            currentMana: activeCharacter.maxStats.mana,
            party: refreshedParty
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...initialDungeonState,
                status: firstRoom.type === 'combat' ? 'fighting' : (firstRoom.type === 'treasure' ? 'treasure_found' : (firstRoom.type === 'rest' ? 'resting' : 'event')),
                dungeonId: dungeon.id,
                monsterId: firstMonster?.id || null,
                currentMonsterHealth: firstMonster?.stats.health || null,
                currentMonsterIndex: firstRoom.type === 'combat' ? 0 : -1,
                combatLog: [{ id: uuidv4(), type: 'info', message: `You have entered the ${dungeon.name}.`, actor: 'system' }],
                rooms: dungeonRooms,
                currentRoomIndex: 0,
            },
        };
    }
    case 'START_ENDLESS_DUNGEON': {
        const { characterId, floor } = action.payload;
        const activeCharacter = state.characters.find(c => c.id === characterId);
        if (!activeCharacter) return state;

        try {
            const proceduralDungeon = generateProceduralDungeon(floor, activeCharacter.level);
            
            const firstRoom = proceduralDungeon.rooms[0];
            let firstMonster = null;
            
            if (firstRoom.type === 'combat' || firstRoom.type === 'boss') {
                const baseMonster = ALL_MONSTERS[firstRoom.monsterId!];
                if (baseMonster) {
                    firstMonster = generateScaledMonster(
                        firstRoom.monsterId!, 
                        activeCharacter.level, 
                        proceduralDungeon.difficulty,
                        proceduralDungeon.floor
                    );
                    ALL_MONSTERS[firstMonster.id] = firstMonster;
                }
            }

            const refreshedParty = activeCharacter.party.map(p => ({
                ...p,
                currentHealth: p.stats.health,
                currentMana: p.stats.mana,
            }));
            const updatedCharacter = {
                ...activeCharacter,
                currentHealth: activeCharacter.maxStats.health,
                currentMana: activeCharacter.maxStats.mana,
                party: refreshedParty
            };

            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                dungeonState: {
                    ...initialDungeonState,
                    status: firstRoom.type === 'combat' ? 'fighting' : (firstRoom.type === 'treasure' ? 'treasure_found' : 'event'),
                    dungeonId: proceduralDungeon.id,
                    monsterId: firstMonster?.id || null,
                    currentMonsterHealth: firstMonster?.stats.health || null,
                    currentMonsterIndex: firstRoom.type === 'combat' ? 0 : -1,
                    combatLog: [{ id: uuidv4(), type: 'info', message: `You have entered ${proceduralDungeon.name}.`, actor: 'system' }],
                    proceduralDungeonData: proceduralDungeon,
                    rooms: proceduralDungeon.rooms,
                    currentRoomIndex: 0,
                },
            };
        } catch (error) {
            console.error('Failed to start endless dungeon:', error);
            return state;
        }
    }
    case 'DO_COMBAT_TURN': {
        if (state.dungeonState.status !== 'fighting' || !state.activeCharacterId) return state;
        
        let activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        
        // Handle both regular dungeons and procedural dungeons
        let dungeon;
        const dungeonId = state.dungeonState.dungeonId;
        if (dungeonId?.startsWith('procedural_')) {
            // For procedural dungeons, we should have stored the dungeon data when we started
            // If we don't have it stored, something went wrong, but we'll regenerate it consistently
            if (state.dungeonState.proceduralDungeonData) {
                dungeon = state.dungeonState.proceduralDungeonData;
            } else {
                // Fallback: Extract floor from procedural dungeon ID format: "procedural_[floor]_[biome]_[timestamp]"
                const parts = dungeonId.split('_');
                const floor = parseInt(parts[1]);
                dungeon = generateProceduralDungeon(floor, activeCharacter.level);
            }
        } else {
            dungeon = DUNGEONS.find(d => d.id === dungeonId);
        }
        
        const monster = state.dungeonState.monsterId ? ALL_MONSTERS[state.dungeonState.monsterId] : null;

        if (!activeCharacter || !dungeon || !monster) return state;

        const newTurnCount = state.dungeonState.turnCount + 1;
        const turnResult = processCombatTurn(activeCharacter, activeCharacter.party, monster, { ...state.dungeonState, turnCount: newTurnCount });

        let updatedCharacter: Character = { ...activeCharacter };
        let updatedParty: Adventurer[] = [...activeCharacter.party];

        for (const id in turnResult.updatedCombatants) {
            const changes = turnResult.updatedCombatants[id];
            if (id === activeCharacter.id) {
                updatedCharacter.currentHealth = changes.currentHealth ?? updatedCharacter.currentHealth;
                updatedCharacter.currentMana = changes.currentMana ?? updatedCharacter.currentMana;
            } else {
                const partyMemberIndex = updatedParty.findIndex(p => p.id === id);
                if (partyMemberIndex !== -1) {
                    const member = { ...updatedParty[partyMemberIndex] };
                    member.currentHealth = changes.currentHealth ?? member.currentHealth;
                    member.currentMana = changes.currentMana ?? member.currentMana;
                    updatedParty[partyMemberIndex] = member;
                }
            }
        }
        updatedCharacter.party = updatedParty.map(p => ({ ...p, currentHealth: p.currentHealth ?? p.stats.health, currentMana: p.currentMana ?? p.stats.mana }));

        let combatLogs = [...state.dungeonState.combatLog, ...turnResult.logs];

        if ((updatedCharacter.currentHealth ?? 0) <= 0) {
            combatLogs.push({ id: uuidv4(), type: 'defeat', message: "You have been defeated.", actor: 'system' });
            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                dungeonState: { ...state.dungeonState, status: 'defeat', combatLog: combatLogs },
            };
        }

        if (turnResult.newMonsterHealth <= 0) {
            const newlyUnlocked = checkKillAchievements(monster.id, new Set(updatedCharacter.unlockedAchievements));
            
            if (newlyUnlocked.length > 0) {
                updatedCharacter.unlockedAchievements = Array.from(new Set([...updatedCharacter.unlockedAchievements, ...newlyUnlocked]));
                newlyUnlocked.forEach(achievementId => {
                    const achievement = ACHIEVEMENTS[achievementId];
                    if (achievement) {
                        combatLogs.push({ id: uuidv4(), type: 'special', message: `ACHIEVEMENT UNLOCKED: ${achievement.name}!`, actor: 'system' });
                    }
                });
            }
            
            updatedCharacter.quests = updatedCharacter.quests.map(playerQuest => {
                const updatedObjectives = playerQuest.objectives.map(obj => {
                    if (obj.type === 'kill' && obj.targetId === monster.id && obj.currentAmount < obj.requiredAmount) {
                         combatLogs.push({ id: uuidv4(), type: 'quest', message: `Quest objective updated.`, actor: 'system' });
                        return { ...obj, currentAmount: obj.currentAmount + 1 };
                    }
                    return obj;
                });
                return { ...playerQuest, objectives: updatedObjectives };
            });

            const { goldGain } = getGlobalModifiers(state.worldState.activeEvents);
            const goldDropped = Math.floor((monster.goldDrop || 0) * goldGain);
            const newGoldGained = (state.dungeonState.goldGained || 0) + goldDropped;
            if (goldDropped > 0) {
                updatedCharacter.gold = (updatedCharacter.gold || 0) + goldDropped;
                combatLogs.push({ id: uuidv4(), type: 'gold', message: `You looted ${goldDropped}G.`, actor: 'system' });
            }

            const currentRoom = state.dungeonState.rooms[state.dungeonState.currentRoomIndex];
            const isBoss = currentRoom.type === 'boss';
            
            if (!isBoss) {
                return {
                    ...state,
                    characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                    dungeonState: {
                        ...state.dungeonState,
                        status: 'room_cleared',
                        goldGained: newGoldGained,
                        combatLog: [...combatLogs, { id: uuidv4(), type: 'victory', message: `${monster.name} defeated! Room cleared.`, actor: 'system' }],
                        cooldowns: turnResult.updatedCooldowns,
                        turnCount: newTurnCount,
                        rooms: state.dungeonState.rooms.map((r, i) => i === state.dungeonState.currentRoomIndex ? { ...r, isCleared: true } : r)
                    },
                };
            }

            // If boss room cleared, proceed to dungeon completion
            const allMonstersInRooms = state.dungeonState.rooms.filter(r => r.type === 'combat' || r.type === 'boss');
            const globalMods = getGlobalModifiers(state.worldState.activeEvents);
            const factionMods = getFactionModifiers(state.worldState.factionStandings);
            const xpGain = globalMods.xpGain * factionMods.xpGain;
            const totalXp = Math.floor(allMonstersInRooms.reduce((acc, room) => {
                const m = ALL_MONSTERS[room.monsterId!];
                return acc + (m ? m.xpReward : 0);
            }, 0) * xpGain);
            
            combatLogs.push({ id: uuidv4(), type: 'victory', message: `You have cleared the dungeon!`, actor: 'system' });
            combatLogs.push({ id: uuidv4(), type: 'special', message: `You and your party gained ${totalXp} XP!`, actor: 'system' });

            const lootFound: Equipment[] = [];
            // Pick one random item from dungeon loot table as final boss reward
            if (dungeon.lootTable.length > 0) {
                const droppedItemBaseId = dungeon.lootTable[Math.floor(Math.random() * dungeon.lootTable.length)];
                if (droppedItemBaseId.startsWith('proc_') && state.dungeonState.proceduralDungeonData) {
                    const proceduralItem = generateProceduralItem(
                        activeCharacter.level, 
                        state.dungeonState.proceduralDungeonData.difficulty, 
                        state.dungeonState.proceduralDungeonData.floor
                    );
                    lootFound.push(proceduralItem);
                    combatLogs.push({ id: uuidv4(), type: 'special', message: `You found: ${proceduralItem.name}!`, actor: 'system' });
                } else {
                    const itemTemplate = ITEMS[droppedItemBaseId];
                    if (itemTemplate) {
                        const newItem: Equipment = {
                            ...itemTemplate,
                            id: uuidv4(),
                            baseId: droppedItemBaseId,
                            baseName: itemTemplate.name,
                            upgradeLevel: 0,
                            price: 0,
                        };
                        lootFound.push(newItem);
                        combatLogs.push({ id: uuidv4(), type: 'special', message: `You found: ${newItem.name}!`, actor: 'system' });
                    }
                }
            }
            
            // Distribute loot intelligently to party members
            const { playerItems, distributions } = distributeEquipment(lootFound, updatedCharacter, updatedCharacter.party);
            
            // Add player items to inventory
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...playerItems];

            // --- Material Drops ---
            if (turnResult.newMonsterHealth <= 0) {
                const materialDrops = generateMaterialDrops(monster.xpReward);
                materialDrops.forEach(drop => {
                    updatedCharacter.materials[drop.materialId] = (updatedCharacter.materials[drop.materialId] || 0) + drop.amount;
                    combatLogs.push({ id: uuidv4(), type: 'info', message: `You found ${drop.amount}x ${drop.materialId.replace(/_/g, ' ')}!`, actor: 'system' });
                });
            }
            
            // Update party members with their new equipment
            updatedCharacter.party = updatedCharacter.party.map(member => {
                const distribution = distributions.find(d => d.recipient.id === member.id);
                if (distribution) {
                    let newEquipment = [...member.equipment];
                    
                    // Replace or add the new item
                    const existingIndex = newEquipment.findIndex(e => e.slot === distribution.item.slot);
                    if (existingIndex > -1) {
                        newEquipment[existingIndex] = distribution.item;
                        // Add replaced item to player inventory
                        if (distribution.replacedItem) {
                            updatedCharacter.inventory.push(distribution.replacedItem);
                        }
                    } else {
                        newEquipment.push(distribution.item);
                    }
                    
                    // Add distribution message to combat log
                    combatLogs.push({ 
                        id: uuidv4(), 
                        type: 'special', 
                        message: `${member.name} equipped: ${distribution.item.name}!`, 
                        actor: 'system' 
                    });
                    
                    return { ...member, equipment: newEquipment };
                }
                return member;
            });

            let currentExperience = updatedCharacter.experience + totalXp;
            let currentLevel = updatedCharacter.level;
            while (currentExperience >= calculateXpForLevel(currentLevel)) {
                currentExperience -= calculateXpForLevel(currentLevel);
                currentLevel += 1;
                combatLogs.push({ id: uuidv4(), type: 'victory', message: `LEVEL UP! You are now level ${currentLevel}!`, actor: 'system' });
            }
            updatedCharacter = { ...updatedCharacter, level: currentLevel, experience: currentExperience };

            const updatedPartyWithXP = updatedCharacter.party.map(member => {
                if ((member.currentHealth ?? member.stats.health) <= 0) return member;
                
                let memberXP = (member.experience ?? 0) + totalXp;
                let memberLevel = member.level;
                let memberLeveledUp = false;
                while (memberXP >= calculateXpForLevel(memberLevel)) {
                    memberXP -= calculateXpForLevel(memberLevel);
                    memberLevel++;
                    memberLeveledUp = true;
                }
                if (memberLeveledUp) {
                    const newStats = getScaledStats(memberLevel, member.class);
                    combatLogs.push({ id: uuidv4(), type: 'victory', message: `[${member.name}] LEVEL UP! Now level ${memberLevel}!`, actor: 'system' });
                    return { ...member, level: memberLevel, experience: memberXP, stats: newStats };
                }
                return { ...member, experience: memberXP };
            });
            updatedCharacter.party = updatedPartyWithXP;
            
            const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
            updatedCharacter.stats = { ...stats, health: updatedCharacter.currentHealth ?? stats.health, mana: updatedCharacter.currentMana ?? stats.mana };
            updatedCharacter.maxStats = maxStats;

            // Handle dungeon completion status
            let newState = {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                dungeonState: {
                    ...state.dungeonState,
                    status: 'victory' as DungeonStatus,
                    xpGained: totalXp,
                    goldGained: newGoldGained,
                    lootFound,
                    combatLog: combatLogs,
                }
            };

            const allNewlyUnlocked = checkAllAchievements(updatedCharacter, newState);
            if (allNewlyUnlocked.length > 0) {
                return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: allNewlyUnlocked } });
            }
            return newState;
        }

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...state.dungeonState,
                currentMonsterHealth: turnResult.newMonsterHealth,
                combatLog: combatLogs,
                cooldowns: turnResult.updatedCooldowns,
                turnCount: newTurnCount,
            },
        };
    }
    case 'NEXT_ROOM': {
        if (!state.activeCharacterId || state.dungeonState.status === 'idle') return state;
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const nextRoomIndex = state.dungeonState.currentRoomIndex + 1;
        
        if (nextRoomIndex >= state.dungeonState.rooms.length) {
            return {
                ...state,
                dungeonState: { ...state.dungeonState, status: 'victory' }
            };
        }

        const nextRoom = state.dungeonState.rooms[nextRoomIndex];
        let nextMonster = null;
        let status: DungeonStatus = 'event';

        if (nextRoom.type === 'combat' || nextRoom.type === 'boss') {
            status = 'fighting';
            const monsterId = nextRoom.monsterId!;
            const baseMonster = ALL_MONSTERS[monsterId];
            
            if (state.dungeonState.proceduralDungeonData) {
                const { monsterStats } = getGlobalModifiers(state.worldState.activeEvents);
                nextMonster = generateScaledMonster(
                    monsterId, 
                    activeCharacter.level, 
                    state.dungeonState.proceduralDungeonData.difficulty * monsterStats,
                    state.dungeonState.proceduralDungeonData.floor
                );
                ALL_MONSTERS[nextMonster.id] = nextMonster;
            } else {
                nextMonster = baseMonster;
            }
        } else if (nextRoom.type === 'treasure') {
            status = 'treasure_found';
        } else if (nextRoom.type === 'rest') {
            status = 'resting';
        }

        return {
            ...state,
            dungeonState: {
                ...state.dungeonState,
                status,
                monsterId: nextMonster?.id || null,
                currentMonsterHealth: nextMonster?.stats.health || null,
                currentRoomIndex: nextRoomIndex,
                combatLog: [...state.dungeonState.combatLog, { id: uuidv4(), type: 'info', message: `Entering room ${nextRoomIndex + 1}: ${nextRoom.type.charAt(0).toUpperCase() + nextRoom.type.slice(1)}`, actor: 'system' }]
            }
        };
    }
    case 'CLAIM_TREASURE': {
        if (!state.activeCharacterId || state.dungeonState.status !== 'treasure_found') return state;
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const currentRoom = state.dungeonState.rooms[state.dungeonState.currentRoomIndex];
        
        if (!currentRoom.treasure) return state;

        let updatedCharacter = { ...activeCharacter };
        const { goldGain } = getGlobalModifiers(state.worldState.activeEvents);
        const treasureGold = Math.floor(currentRoom.treasure.gold * goldGain);
        updatedCharacter.gold += treasureGold;
        
        const foundItems: Equipment[] = [];
        for (const itemBaseId of currentRoom.treasure.items) {
             if (itemBaseId.startsWith('proc_')) {
                const proceduralItem = generateProceduralItem(
                    activeCharacter.level, 
                    state.dungeonState.proceduralDungeonData?.difficulty || 1, 
                    state.dungeonState.proceduralDungeonData?.floor || 1
                );
                foundItems.push(proceduralItem);
            } else {
                const itemTemplate = ITEMS[itemBaseId];
                if (itemTemplate) {
                    foundItems.push({ ...itemTemplate, id: uuidv4(), baseId: itemBaseId, baseName: itemTemplate.name, upgradeLevel: 0, price: 0 });
                }
            }
        }

        updatedCharacter.inventory = [...updatedCharacter.inventory, ...foundItems];

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...state.dungeonState,
                status: 'room_cleared',
                goldGained: state.dungeonState.goldGained + treasureGold,
                lootFound: [...state.dungeonState.lootFound, ...foundItems],
                combatLog: [...state.dungeonState.combatLog, { id: uuidv4(), type: 'treasure', message: `Claimed ${treasureGold}G and ${foundItems.length} items!`, actor: 'system' }]
            }
        };
    }
    case 'REST': {
        if (!state.activeCharacterId || state.dungeonState.status !== 'resting') return state;
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        
        const healPercent = 0.3; // Restore 30% HP/MP
        const updatedCharacter = {
            ...activeCharacter,
            currentHealth: Math.min(activeCharacter.maxStats.health, (activeCharacter.currentHealth || 0) + Math.round(activeCharacter.maxStats.health * healPercent)),
            currentMana: Math.min(activeCharacter.maxStats.mana, (activeCharacter.currentMana || 0) + Math.round(activeCharacter.maxStats.mana * healPercent)),
            party: activeCharacter.party.map(p => ({
                ...p,
                currentHealth: Math.min(p.stats.health, (p.currentHealth || 0) + Math.round(p.stats.health * healPercent)),
                currentMana: Math.min(p.stats.mana, (p.currentMana || 0) + Math.round(p.stats.mana * healPercent)),
            }))
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...state.dungeonState,
                status: 'room_cleared',
                combatLog: [...state.dungeonState.combatLog, { id: uuidv4(), type: 'info', message: `You take a short rest, recovering some health and mana.`, actor: 'system' }]
            }
        };
    }
    case 'LEAVE_DUNGEON': {
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        if (!activeCharacter) return { ...state, dungeonState: initialDungeonState };

        const restoredParty = activeCharacter.party.map(p => ({ ...p, currentHealth: p.stats.health, currentMana: p.stats.mana }));
        const restoredCharacter = { ...activeCharacter, currentHealth: activeCharacter.maxStats.health, currentMana: activeCharacter.maxStats.mana, party: restoredParty };

        return {
            ...state,
            characters: state.characters.map(c => c.id === restoredCharacter.id ? restoredCharacter : c),
            dungeonState: initialDungeonState,
        };
    }
    case 'EQUIP_ITEM': {
        const { characterId, itemId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const itemToEquip = character.inventory.find(i => i.id === itemId)!;
        
        let newInventory = character.inventory.filter(i => i.id !== itemId);
        let newEquipment = [...character.equipment];
        let newAccessorySlots: [Equipment | null, Equipment | null] = [...character.accessorySlots];

        if (itemToEquip.slot === 'accessory') {
            if (newAccessorySlots[0] === null) {
                newAccessorySlots[0] = itemToEquip;
            } else if (newAccessorySlots[1] === null) {
                newAccessorySlots[1] = itemToEquip;
            } else {
                // Both accessory slots are occupied, unequip the first one and equip the new one in its place
                newInventory.push(newAccessorySlots[0]);
                newAccessorySlots[0] = itemToEquip;
            }
        } else {
            // For weapon and armor slots
            const existingItemIndex = newEquipment.findIndex(i => i.slot === itemToEquip.slot);
            if (existingItemIndex > -1) {
                const itemToUnequip = newEquipment[existingItemIndex];
                newEquipment.splice(existingItemIndex, 1);
                newInventory.push(itemToUnequip);
            }
            newEquipment.push(itemToEquip);
        }

        let updatedCharacter: Character = { ...character, inventory: newInventory, equipment: newEquipment, accessorySlots: newAccessorySlots };
        const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
        updatedCharacter = { ...updatedCharacter, stats, maxStats, currentHealth: stats.health, currentMana: stats.mana };

        let newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'UNEQUIP_ITEM': {
        const { characterId, itemId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        
        let newEquipment = [...character.equipment];
        let newInventory = [...character.inventory];
        let newAccessorySlots: [Equipment | null, Equipment | null] = [...character.accessorySlots];

        let itemToUnequip: Equipment | undefined;

        // Check accessory slots first
        if (newAccessorySlots[0]?.id === itemId) {
            itemToUnequip = newAccessorySlots[0];
            newAccessorySlots[0] = null;
        } else if (newAccessorySlots[1]?.id === itemId) {
            itemToUnequip = newAccessorySlots[1];
            newAccessorySlots[1] = null;
        } else {
            // If not in accessory slots, check other equipment slots
            const existingItemIndex = newEquipment.findIndex(i => i.id === itemId);
            if (existingItemIndex > -1) {
                itemToUnequip = newEquipment[existingItemIndex];
                newEquipment.splice(existingItemIndex, 1);
            }
        }

        if (!itemToUnequip) return state; // Item not found

        newInventory.push(itemToUnequip);
        
        let updatedCharacter: Character = { ...character, inventory: newInventory, equipment: newEquipment, accessorySlots: newAccessorySlots };
        const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
        updatedCharacter = { ...updatedCharacter, stats, maxStats, currentHealth: stats.health, currentMana: stats.mana };

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }
    case 'UPGRADE_ITEM': {
        const { characterId, itemId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        
        const findItem = (items: Equipment[]) => items.find(i => i.id === itemId);
        let item = findItem(character.inventory) || findItem(character.equipment);
        if (!item || item.isHeirloom) return state;

        const cost = UPGRADE_COST(item);
        if (character.gold < cost) return state;

        const newGold = character.gold - cost;
        const newUpgradeLevel = item.upgradeLevel + 1;
        const newStats = { ...item.stats };
        const firstStat = Object.keys(newStats)[0] as keyof GameStats;
        if (firstStat) {
            newStats[firstStat] = (newStats[firstStat] || 0) + 1;
        }

        const upgradedItem: Equipment = {
            ...item,
            upgradeLevel: newUpgradeLevel,
            name: `${item.baseName} +${newUpgradeLevel}`,
            stats: newStats,
        };

        const updateItemInList = (items: Equipment[]) => items.map(i => i.id === itemId ? upgradedItem : i);
        
        let updatedCharacter: Character = {
            ...character,
            gold: newGold,
            inventory: updateItemInList(character.inventory),
            equipment: updateItemInList(character.equipment),
        };

        if (character.equipment.some(i => i.id === itemId)) {
            const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
            updatedCharacter = { ...updatedCharacter, stats, maxStats, currentHealth: stats.health, currentMana: stats.mana };
        }
        
        const newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'SELL_ITEM': {
        const { characterId, itemId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        const itemToSell = character.inventory.find(i => i.id === itemId);
        if (!itemToSell || itemToSell.isHeirloom) return state;

        const price = SELL_PRICE(itemToSell);
        const newGold = character.gold + price;
        const newInventory = character.inventory.filter(i => i.id !== itemId);
        
        const updatedCharacter = { ...character, gold: newGold, inventory: newInventory };
        const newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'REFRESH_SHOP': {
        const { characterId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        if (character.gold < SHOP_REFRESH_COST) return state;

        const updatedCharacter = { ...character, gold: character.gold - SHOP_REFRESH_COST };
        const globalMods = getGlobalModifiers(state.worldState.activeEvents);
        const factionMods = getFactionModifiers(state.worldState.factionStandings);
        const shopPrices = globalMods.shopPrices * factionMods.shopPrices;
        const newShopItems = generateShopItems(updatedCharacter.level, shopPrices);
        

        const newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            shopItems: newShopItems,
        };
        return newState;
    }

    case 'REQUEST_FORGE': {
        const char = state.characters.find(c => c.id === action.payload.characterId);
        if (!char) return state;

        const { materials, gold } = calculateForgeCost(action.payload.order.rarity, action.payload.order.targetStats);
        
        if (char.gold < gold) return state;
        for (const req of materials) {
            if ((char.materials[req.materialId] || 0) < req.amount) return state;
        }

        const newMaterials = { ...char.materials };
        materials.forEach(req => {
            newMaterials[req.materialId] -= req.amount;
        });

        const updatedChar: Character = {
            ...char,
            gold: char.gold - gold,
            materials: newMaterials,
            activeForgeOrder: {
                ...action.payload.order,
                id: uuidv4(),
                requiredMaterials: materials,
                goldCost: gold,
            }
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === char.id ? updatedChar : c),
            socialLog: [{ 
                id: uuidv4(), 
                timestamp: new Date().toISOString(),
                type: 'social_interaction' as const,
                content: `The Blacksmith has started working on your ${action.payload.order.rarity} ${action.payload.order.slot}.`
            }, ...state.socialLog].slice(0, 50),
        };
    }

    case 'CANCEL_FORGE': {
        const char = state.characters.find(c => c.id === action.payload.characterId);
        if (!char || !char.activeForgeOrder) return state;

        const newMaterials = { ...char.materials };
        char.activeForgeOrder.requiredMaterials.forEach(req => {
            const refund = Math.floor(req.amount * 0.5);
            newMaterials[req.materialId] = (newMaterials[req.materialId] || 0) + refund;
        });

        const updatedChar: Character = {
            ...char,
            materials: newMaterials,
            activeForgeOrder: undefined,
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === char.id ? updatedChar : c),
            socialLog: [{ 
                id: uuidv4(), 
                timestamp: new Date().toISOString(),
                type: 'social_interaction' as const,
                content: `Forge order cancelled. Some materials were salvaged.`
            }, ...state.socialLog].slice(0, 50),
        };
    }

    case 'CLAIM_FORGE': {
        const char = state.characters.find(c => c.id === action.payload.characterId);
        if (!char || !char.activeForgeOrder) return state;

        const forgedItem = generateForgeItem(char.activeForgeOrder);
        
        const updatedChar: Character = {
            ...char,
            inventory: [...char.inventory, forgedItem],
            activeForgeOrder: undefined,
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === char.id ? updatedChar : c),
            socialLog: [{ 
                id: uuidv4(), 
                timestamp: new Date().toISOString(),
                type: 'social_interaction' as const,
                content: `You claimed your forged item: ${forgedItem.name}!`
            }, ...state.socialLog].slice(0, 50),
        };
    }
    case 'BUY_ITEM': {
        const { characterId, itemId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        const itemToBuy = state.shopItems.find(item => item.id === itemId);

        if (!itemToBuy || character.gold < itemToBuy.price) return state; // Assuming items have a 'price' property

        const updatedCharacter = {
            ...character,
            gold: character.gold - itemToBuy.price,
            inventory: [...character.inventory, itemToBuy],
        };

        const newShopItems = state.shopItems.filter(item => item.id !== itemId);

        const newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            shopItems: newShopItems,
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'SELL_ALL_BY_RARITY': {
        const { characterId, maxRarity } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        
        const maxRarityIndex = RARITY_ORDER.indexOf(maxRarity);
        if (maxRarityIndex === -1) return state;

        const raritiesToSell = new Set(RARITY_ORDER.slice(0, maxRarityIndex + 1));

        const itemsToSell = character.inventory.filter(item => 
            !item.isHeirloom && raritiesToSell.has(item.rarity)
        );

        if (itemsToSell.length === 0) return state;

        const totalSellPrice = itemsToSell.reduce((sum, item) => sum + SELL_PRICE(item), 0);
        const soldItemIds = new Set(itemsToSell.map(item => item.id));
        const newInventory = character.inventory.filter(item => !soldItemIds.has(item.id));

        const updatedCharacter = {
            ...character,
            gold: character.gold + totalSellPrice,
            inventory: newInventory
        };

        const newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
        
        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }

        return newState;
    }
    case 'RECRUIT_ADVENTURER': {
        const { characterId, adventurerId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        const adventurer = state.tavernAdventurers.find(a => a.id === adventurerId)!;
        
        const maxPartySize = calculateMaxPartySize(character.level);
        if (character.party.length >= maxPartySize - 1) return state;

        const newParty = [...character.party, adventurer];
        const updatedCharacter = { ...character, party: newParty };
        const newTavernAdventurers = state.tavernAdventurers.filter(a => a.id !== adventurerId);

        const newRelationships = [...state.relationships];
        for (const member of character.party) {
            const ids = [member.id, adventurer.id].sort();
            if (!newRelationships.some(r => r.id === `${ids[0]}-${ids[1]}`)) {
                newRelationships.push({ id: `${ids[0]}-${ids[1]}`, participantIds: ids as [string, string], score: 0, status: 'acquaintances', giftCount: 0 });
            }
        }
        const playerRelIds = [character.id, adventurer.id].sort();
        if (!newRelationships.some(r => r.id === playerRelIds.join('-'))) {
            newRelationships.push({ id: playerRelIds.join('-'), participantIds: playerRelIds as [string, string], score: 0, status: 'acquaintances', giftCount: 0 });
        }
        
        let newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            tavernAdventurers: newTavernAdventurers,
            relationships: newRelationships,
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'DISMISS_ADVENTURER': {
        const { characterId, adventurerId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        const newParty = character.party.filter(a => a.id !== adventurerId);
        const updatedCharacter = { ...character, party: newParty };
        
        const newRelationships = state.relationships.filter(r => !r.participantIds.includes(adventurerId));

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            relationships: newRelationships,
        };
    }
    case 'REFRESH_TAVERN_ADVENTURERS': {
        const { characterId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        if (character.gold < REFRESH_TAVERN_COST) return state;
        
        const updatedCharacter = { ...character, gold: character.gold - REFRESH_TAVERN_COST };
        const newTavernAdventurers = Array.from({ length: 5 }, () => generateAdventurer(character.level));

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            tavernAdventurers: newTavernAdventurers
        };
    }
    case 'CREATE_GUILD': {
        const { characterId, guildName } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        if (state.guild || character.gold < GUILD_CREATE_COST) return state;
        
        const newGuild = { id: uuidv4(), name: guildName, level: 1, xp: 0, members: [] };
        const updatedCharacter = { ...character, gold: character.gold - GUILD_CREATE_COST, guildId: newGuild.id };

        const newState = {
            ...state,
            guild: newGuild,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'DONATE_TO_GUILD': {
        const { characterId, amount } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        if (!state.guild || character.gold < amount || amount <= 0) return state;

        const updatedCharacter = { ...character, gold: character.gold - amount };
        const xpGained = Math.floor(amount * (GUILD_DONATION_XP / GUILD_DONATION_GOLD));
        let newXp = state.guild.xp + xpGained;
        let newLevel = state.guild.level;
        let xpForNextLevel = GUILD_XP_TABLE[newLevel];
        
        while (xpForNextLevel && newXp >= xpForNextLevel) {
            newXp -= xpForNextLevel;
            newLevel++;
            xpForNextLevel = GUILD_XP_TABLE[newLevel];
        }

        const updatedGuild = { ...state.guild, xp: newXp, level: newLevel };
        
        let newState = {
            ...state,
            guild: updatedGuild,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'RECRUIT_TO_GUILD': {
        const { adventurerId } = action.payload;
        const adventurer = state.tavernAdventurers.find(a => a.id === adventurerId)!;
        
        if (!state.guild || !adventurer) return state;

        // Add to guild roster
        const updatedGuild = {
            ...state.guild,
            members: [...state.guild.members, adventurer]
        };

        const newTavernAdventurers = state.tavernAdventurers.filter(a => a.id !== adventurerId);

        return {
            ...state,
            guild: updatedGuild,
            tavernAdventurers: newTavernAdventurers,
            socialLog: [...state.socialLog, { 
                id: uuidv4(), 
                timestamp: new Date().toISOString(),
                type: 'social_interaction' as const,
                content: `${adventurer.name} has joined ${state.guild.name}!`,
                participantIds: [adventurer.id]
            }]
        };
    }
    case 'START_RAID': {
        const { raidId } = action.payload;
        const raid = RAIDS.find(r => r.id === raidId)!;
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const boss = ALL_MONSTERS[raid.bossId];

        const refreshedParty = activeCharacter.party.map(p => ({ ...p, currentHealth: p.stats.health, currentMana: p.stats.mana }));
        const updatedCharacter = {
            ...activeCharacter,
            currentHealth: activeCharacter.maxStats.health,
            currentMana: activeCharacter.maxStats.mana,
            party: refreshedParty
        };
        
        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            raidState: {
                ...initialRaidState,
                status: 'fighting',
                raidId,
                bossId: boss.id,
                currentBossHealth: boss.stats.health,
                combatLog: [{ id: uuidv4(), type: 'info', message: `Your party confronts the mighty ${boss.name}!`, actor: 'system' }],
            },
        };
    }
    case 'DO_RAID_COMBAT_TURN': {
        if (state.raidState.status !== 'fighting' || !state.activeCharacterId) return state;

        let activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const boss = state.raidState.bossId ? ALL_MONSTERS[state.raidState.bossId] : null;
        if (!activeCharacter || !boss) return state;

        const newTurnCount = state.raidState.turnCount + 1;
        const turnResult = processCombatTurn(activeCharacter, activeCharacter.party, boss, { ...state.raidState, turnCount: newTurnCount });

        let updatedCharacter = { ...activeCharacter };
        let updatedParty = [...activeCharacter.party];

        for (const id in turnResult.updatedCombatants) {
            const changes = turnResult.updatedCombatants[id];
            if (id === activeCharacter.id) {
                updatedCharacter.currentHealth = changes.currentHealth ?? updatedCharacter.currentHealth;
                updatedCharacter.currentMana = changes.currentMana ?? updatedCharacter.currentMana;
            } else {
                 const partyMemberIndex = updatedParty.findIndex(p => p.id === id);
                if (partyMemberIndex !== -1) {
                    const member = { ...updatedParty[partyMemberIndex] };
                    member.currentHealth = changes.currentHealth ?? member.currentHealth;
                    member.currentMana = changes.currentMana ?? member.currentMana;
                    updatedParty[partyMemberIndex] = member;
                }
            }
        }
        updatedCharacter.party = updatedParty.map(p => ({ ...p, currentHealth: p.currentHealth ?? p.stats.health, currentMana: p.currentMana ?? p.stats.mana }));
        
        let combatLogs = [...state.raidState.combatLog, ...turnResult.logs];

        if ((updatedCharacter.currentHealth ?? 0) <= 0) {
            combatLogs.push({ id: uuidv4(), type: 'defeat', message: `Your party has been wiped out by ${boss.name}!`, actor: 'system' });
            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                raidState: { ...state.raidState, status: 'defeat', combatLog: combatLogs },
            };
        }

        if (turnResult.newMonsterHealth <= 0) {
            combatLogs.push({ id: uuidv4(), type: 'victory', message: `${boss.name} has been vanquished!`, actor: 'system' });
            
            const { goldGain } = getGlobalModifiers(state.worldState.activeEvents);
            const goldDropped = Math.floor((boss.goldDrop || 0) * goldGain);
            if (goldDropped > 0) {
                updatedCharacter.gold += goldDropped;
                combatLogs.push({ id: uuidv4(), type: 'gold', message: `You looted ${goldDropped}G.`, actor: 'system' });
            }

            const raid = RAIDS.find(r => r.id === state.raidState.raidId);
            const lootFound: Equipment[] = [];
            if (raid && raid.lootTable.length > 0) {
                const droppedItemBaseId = raid.lootTable[Math.floor(Math.random() * raid.lootTable.length)];
                const itemTemplate = ITEMS[droppedItemBaseId];
                if (itemTemplate) {
                     const newItem: Equipment = { ...itemTemplate, id: uuidv4(), baseId: droppedItemBaseId, baseName: itemTemplate.name, upgradeLevel: 0, price: 0 }; // Initialize price for newly found loot
                     lootFound.push(newItem);
                     combatLogs.push({ id: uuidv4(), type: 'special', message: `You found: ${newItem.name}!`, actor: 'system' });
                }
            }
            
            // Distribute raid loot intelligently to party members
            const { playerItems, distributions } = distributeEquipment(lootFound, updatedCharacter, updatedCharacter.party);
            
            // Add player items to inventory
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...playerItems];
            
            // Update party members with their new equipment
            updatedCharacter.party = updatedCharacter.party.map(member => {
                const distribution = distributions.find(d => d.recipient.id === member.id);
                if (distribution) {
                    let newEquipment = [...member.equipment];
                    
                    // Replace or add the new item
                    const existingIndex = newEquipment.findIndex(e => e.slot === distribution.item.slot);
                    if (existingIndex > -1) {
                        newEquipment[existingIndex] = distribution.item;
                        // Add replaced item to player inventory
                        if (distribution.replacedItem) {
                            updatedCharacter.inventory.push(distribution.replacedItem);
                        }
                    } else {
                        newEquipment.push(distribution.item);
                    }
                    
                    // Add distribution message to combat log
                    combatLogs.push({ 
                        id: uuidv4(), 
                        type: 'special', 
                        message: `${member.name} equipped: ${distribution.item.name}!`, 
                        actor: 'system' 
                    });
                    
                    return { ...member, equipment: newEquipment };
                }
                return member;
            });
            
            if (raid) {
                updatedCharacter.completedRaids = { ...updatedCharacter.completedRaids, [raid.id]: new Date().toISOString() };
            }
            
            const newState = {
                 ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                raidState: {
                    ...state.raidState,
                    status: 'victory' as RaidStatus,
                    goldGained: goldDropped,
                    lootFound,
                    combatLog: combatLogs,
                },
            };
            const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
            if (newlyUnlocked.length > 0) {
                return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
            }
            return newState;
        }

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            raidState: {
                ...state.raidState,
                currentBossHealth: turnResult.newMonsterHealth,
                combatLog: combatLogs,
                cooldowns: turnResult.updatedCooldowns,
                turnCount: newTurnCount,
            },
        };
    }
    case 'END_RAID': {
        let activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const restoredParty = activeCharacter.party.map(p => ({ ...p, currentHealth: p.stats.health, currentMana: p.stats.mana }));
        const restoredCharacter = { ...activeCharacter, currentHealth: activeCharacter.maxStats.health, currentMana: activeCharacter.maxStats.mana, party: restoredParty };
        
        return {
            ...state,
            characters: state.characters.map(c => c.id === restoredCharacter.id ? restoredCharacter : c),
            raidState: initialRaidState
        };
    }
    case 'ACCEPT_QUEST': {
        const { characterId, questId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const quest = QUESTS[questId];
        if (!character || !quest || character.quests.some(q => q.questId === questId)) return state;

        const newPlayerQuest: PlayerQuest = {
            questId: quest.id,
            objectives: quest.objectives.map(obj => ({ ...obj, currentAmount: 0 }))
        };

        const updatedCharacter = { ...character, quests: [...character.quests, newPlayerQuest] };
        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
        };
    }
    case 'TURN_IN_QUEST': {
        const { characterId, questId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const questDef = QUESTS[questId];
        const playerQuest = character.quests.find(q => q.questId === questId);
        if (!questDef || !playerQuest) return state;

        const isComplete = playerQuest.objectives.every(obj => obj.currentAmount >= obj.requiredAmount);
        if (!isComplete) return state;
        
        let updatedCharacter = { ...character };
        const { xp, gold, items } = questDef.rewards;
        updatedCharacter.experience += xp;
        updatedCharacter.gold += gold;
        if (items) {
            const newItems = items.map(itemId => {
                const itemTemplate = ITEMS[itemId];
                return { ...itemTemplate, id: uuidv4(), baseId: itemId, baseName: itemTemplate.name, upgradeLevel: 0, price: 0 }; // Initialize price for quest rewards
            });
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...newItems];
        }

        let levelUp = false;
        while (updatedCharacter.experience >= calculateXpForLevel(updatedCharacter.level)) {
            updatedCharacter.experience -= calculateXpForLevel(updatedCharacter.level);
            updatedCharacter.level += 1;
            levelUp = true;
        }

        if (levelUp) {
            const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
            updatedCharacter.stats = { ...stats, health: updatedCharacter.currentHealth ?? stats.health, mana: updatedCharacter.currentMana ?? stats.mana };
            updatedCharacter.maxStats = maxStats;
            updatedCharacter.currentHealth = maxStats.health;
            updatedCharacter.currentMana = maxStats.mana;
        }

        updatedCharacter.quests = updatedCharacter.quests.filter(q => q.questId !== questId);
        updatedCharacter.completedQuests = [...updatedCharacter.completedQuests, questId];
        
        let newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            worldState: {
                ...state.worldState,
                factionStandings: {
                    ...state.worldState.factionStandings,
                    ...(questDef.factionId ? { [questDef.factionId]: (state.worldState.factionStandings[questDef.factionId] || 0) + 10 } : {})
                }
            }
        };
        
        const newlyUnlocked = checkAllAchievements(updatedCharacter, newState);
        if (newlyUnlocked.length > 0) {
            newState = gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: updatedCharacter.id, achievementIds: newlyUnlocked } });
        }
        
        if (questDef.followUpQuestId) {
            return gameReducer(newState, { type: 'ACCEPT_QUEST', payload: { characterId, questId: questDef.followUpQuestId } });
        }
        return newState;
    }
     case 'SIMULATE_SOCIAL_TURN': {
        console.log("Simulating social turn...");
        const charIndex = state.characters.findIndex(c => c.id === state.activeCharacterId);
        if (charIndex === -1) return state;

        let charactersToUpdate = [...state.characters];
        let activeCharacter = { ...charactersToUpdate[charIndex] };
        let newRelationships = [...state.relationships];
        let newSocialLog = [...state.socialLog];

        const allParticipants = [activeCharacter, ...activeCharacter.party];

        for (let i = 0; i < allParticipants.length; i++) {
            for (let j = i + 1; j < allParticipants.length; j++) {
                const p1 = allParticipants[i];
                const p2 = allParticipants[j];
                const ids = [p1.id, p2.id].sort();
                const relId = ids.join('-');
                let relationship = newRelationships.find(r => r.id === relId);
                if (!relationship) continue;
                
                const { relationshipGain } = getGlobalModifiers(state.worldState.activeEvents);
                const compatibility = PERSONALITY_TRAITS[p1.personality].compatibility[p2.personality] || 0;
                relationship.score += compatibility * 0.1 * relationshipGain;

                let currentStatus = relationship.status;
                let newStatus: RelationshipStatus = 'acquaintances';
                const sortedThresholds = Object.entries(RELATIONSHIP_THRESHOLDS).sort(([, a], [, b]) => b - a);

                for (const [status, threshold] of sortedThresholds) {
                    if (relationship.score >= threshold) {
                        newStatus = status as RelationshipStatus;
                        break;
                    }
                }
                
                if (newStatus !== currentStatus) {
                    relationship.status = newStatus;
                    newSocialLog.push({ 
                        id: uuidv4(), 
                        timestamp: new Date().toISOString(),
                        type: 'social_interaction' as const,
                        content: `${p1.name} and ${p2.name} are now ${newStatus.replace('_', ' ')}.`, 
                        participantIds: ids
                    });
                    
                    if (newStatus === 'married' && !p1.partnerId && !p2.partnerId) {
                         const isPlayerInvolved = 'generation' in p1 || 'generation' in p2;
                         let parent1: ParentInfo, parent2: ParentInfo;
                         if (isPlayerInvolved) {
                            const player = ('generation' in p1 ? p1 : p2) as Character;
                            const adventurer = ('generation' in p1 ? p2 : p1) as Adventurer;
                            
                            player.partnerId = adventurer.id;
                            adventurer.partnerId = player.id;
                             parent1 = { id: player.id, name: player.name, class: player.class, stats: player.maxStats };
                             parent2 = { id: adventurer.id, name: adventurer.name, class: adventurer.class, stats: adventurer.stats };
                         } else {
                            // If player is not involved, both are adventurers
                            const adv1 = p1;
                            const adv2 = p2;
                            adv1.partnerId = adv2.id;
                            adv2.partnerId = adv1.id;
                             parent1 = { id: adv1.id, name: adv1.name, class: adv1.class, stats: adv1.stats };
                             parent2 = { id: adv2.id, name: adv2.name, class: adv2.class, stats: adv2.stats };
                         }
                        
                         activeCharacter.party = [...activeCharacter.party];
                         charactersToUpdate[charIndex] = activeCharacter;
                         return gameReducer({ ...state, relationships: newRelationships, socialLog: newSocialLog, characters: charactersToUpdate }, { type: 'CREATE_HEIR', payload: { characterId: activeCharacter.id, parents: [parent1, parent2] } });
                    }
                }
            }
        }

        if (Math.random() < 0.20 && activeCharacter.party.length > 0) {
            const participants = [activeCharacter, ...activeCharacter.party];
            const eventTypeRoll = Math.random();
            let message = '';
            if (eventTypeRoll < 0.35) { // Solo Event (35% chance)
                const p1 = participants[Math.floor(Math.random() * participants.length)];
                const eventTemplate = OFFLINE_SOCIAL_EVENTS.solo[Math.floor(Math.random() * OFFLINE_SOCIAL_EVENTS.solo.length)];
                message = eventTemplate.replace('[P1]', `${'generation' in p1 ? 'You' : p1.name}`);
            } else if (eventTypeRoll < 0.70 && participants.length > 1) { // Two-Person Event (35% chance)
                const p1_idx = Math.floor(Math.random() * participants.length);
                let p2_idx = Math.floor(Math.random() * (participants.length - 1));
                if (p2_idx >= p1_idx) p2_idx++;
                const p1 = participants[p1_idx];
                const p2 = participants[p2_idx];
                if (p1 && p2) {
                    const eventTemplate = OFFLINE_SOCIAL_EVENTS.twoPerson[Math.floor(Math.random() * OFFLINE_SOCIAL_EVENTS.twoPerson.length)];
                    message = eventTemplate.replace('[P1]', `${'generation' in p1 ? 'You' : p1.name}`).replace('[P2]', `${'generation' in p2 ? 'You' : p2.name}`);
                }
            } else if (eventTypeRoll < 0.90) { // Party Event (20% chance)
                const eventTemplate = OFFLINE_SOCIAL_EVENTS.party[Math.floor(Math.random() * OFFLINE_SOCIAL_EVENTS.party.length)];
                message = eventTemplate; 
            } else { // Personality Event (10% chance)
                 const p1 = participants[Math.floor(Math.random() * participants.length)];
                 const eventsForPersonality = OFFLINE_SOCIAL_EVENTS.personality; // Simplified for now
                 const eventTemplate = eventsForPersonality[Math.floor(Math.random() * eventsForPersonality.length)];
                 message = eventTemplate.replace('[P1]', `${'generation' in p1 ? 'You' : p1.name}`);
            }
            if (message) newSocialLog.push({ 
                id: uuidv4(), 
                timestamp: new Date().toISOString(),
                type: 'social_interaction' as const,
                content: message,
                participantIds: participants.map(p => p.id) 
            });
        }

        if (newSocialLog.length > 50) newSocialLog = newSocialLog.slice(newSocialLog.length - 50);

        const newState = { ...state, relationships: newRelationships, socialLog: newSocialLog, characters: charactersToUpdate };
        const newlyUnlocked = checkAllAchievements(activeCharacter, newState);
        if (newlyUnlocked.length > 0) {
            return gameReducer(newState, { type: 'ADD_ACHIEVEMENTS', payload: { characterId: activeCharacter.id, achievementIds: newlyUnlocked } });
        }
        return newState;
    }
    case 'CREATE_HEIR': {
        const { characterId, parents } = action.payload;
        let activeCharacter = state.characters.find(c => c.id === characterId);
        if (!activeCharacter) return state;

        const [parent1, parent2] = parents;
        const childClass = Math.random() > 0.5 ? parent1.class : parent2.class;
        const childName = `${parent1.name.split(' ')[0]}-${parent2.name.split(' ')[0]} ${parent1.name.split(' ')[1] || parent2.name.split(' ')[1]}`;
        const baseStats = { ...CLASSES[childClass].baseStats };

        const legacyBonus: Partial<GameStats> = {};
        for (const stat in baseStats) {
            const key = stat as keyof GameStats;
            legacyBonus[key] = Math.floor(((parent1.stats[key] ?? 0) + (parent2.stats[key] ?? 0)) * 0.1);
        }

        const newHeir: PotentialHeir = {
            childId: uuidv4(),
            name: childName,
            class: childClass,
            parents: [parent1, parent2],
            legacyBonus,
            baseStats,
        };

        const updatedCharacter = { ...activeCharacter, potentialHeirs: [...activeCharacter.potentialHeirs, newHeir] };
        const newCharacters = state.characters.map(c => c.id === characterId ? updatedCharacter : c);
        return { ...state, characters: newCharacters };
    }
    case 'GIVE_ITEM_TO_ADVENTURER': {
        const { characterId, adventurerId, itemId, giftResponse } = action.payload;
        const charIndex = state.characters.findIndex(c => c.id === characterId);
        if (charIndex === -1) return state;

        let character = { ...state.characters[charIndex] };
        const adventurerIndex = character.party.findIndex(p => p.id === adventurerId);
        const itemIndex = character.inventory.findIndex(i => i.id === itemId);
        if (adventurerIndex === -1 || itemIndex === -1) return state;

        let adventurer = { ...character.party[adventurerIndex] };
        const itemToGive = { ...character.inventory[itemIndex] };

        character.inventory = character.inventory.filter(i => i.id !== itemId);
        
        const existingItemIndex = adventurer.equipment.findIndex(e => e.slot === itemToGive.slot);
        if (existingItemIndex > -1) {
            const oldItem = adventurer.equipment[existingItemIndex];
            character.inventory.push(oldItem);
            adventurer.equipment[existingItemIndex] = itemToGive;
        } else {
            adventurer.equipment.push(itemToGive);
        }
        character.party[adventurerIndex] = adventurer;

        const ids = [characterId, adventurerId].sort();
        const relId = ids.join('-');
        let newRelationships = [...state.relationships];
        const relIndex = newRelationships.findIndex(r => r.id === relId);
        if (relIndex !== -1) {
            const newRel = { ...newRelationships[relIndex] };
            newRel.score += giftResponse.scoreChange;
            newRel.giftCount = (newRel.giftCount || 0) + 1;
            
            let newStatus: RelationshipStatus = 'acquaintances';
            const sortedThresholds = Object.entries(RELATIONSHIP_THRESHOLDS).sort(([, a], [, b]) => b - a);
            for (const [status, threshold] of sortedThresholds) {
                if (newRel.score >= threshold) {
                    newStatus = status as RelationshipStatus;
                    break;
                }
            }
            newRel.status = newStatus;
            newRelationships[relIndex] = newRel;
        }

        let newSocialLog = [...state.socialLog, {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: 'social_interaction' as const,
            content: `[You] give ${itemToGive.name} to ${adventurer.name}. ${adventurer.name}: "${giftResponse.response}"`,
            participantIds: [characterId, adventurerId]
        }];
        if (newSocialLog.length > 50) newSocialLog = newSocialLog.slice(newSocialLog.length - 50);

        const characters = [...state.characters];
        characters[charIndex] = character;
        return {
            ...state,
            characters,
            relationships: newRelationships,
            socialLog: newSocialLog,
        };
    }
    case 'MARRY_PARTNER': {
        const { characterId, partnerId } = action.payload;
        const charIndex = state.characters.findIndex(c => c.id === characterId);
        if (charIndex === -1) return state;

        let character = { ...state.characters[charIndex] };
        let partner = character.party.find(p => p.id === partnerId);
        if (!partner || character.partnerId || partner.partnerId) return state;

        const ids = [characterId, partnerId].sort();
        const relId = ids.join('-');
        const relIndex = state.relationships.findIndex(r => r.id === relId);
        if (relIndex === -1 || state.relationships[relIndex].score < 100) return state; // Threshold check

        character.partnerId = partnerId;
        partner.partnerId = characterId;
        
        const newRelationships = [...state.relationships];
        newRelationships[relIndex] = { ...newRelationships[relIndex], status: 'married' };

        const parent1: ParentInfo = { id: character.id, name: character.name, class: character.class, stats: character.maxStats };
        const parent2: ParentInfo = { id: partner.id, name: partner.name, class: partner.class, stats: partner.stats };

        const newState = {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? character : c),
            relationships: newRelationships,
            socialLog: [...state.socialLog, { 
                id: uuidv4(), 
                timestamp: new Date().toISOString(),
                type: 'social_interaction' as const,
                content: `${character.name} and ${partner.name} have tied the knot!`,
                participantIds: [characterId, partnerId]
            }]
        };

        return gameReducer(newState, { type: 'CREATE_HEIR', payload: { characterId, parents: [parent1, parent2] } });
    }
    case 'RETIRE_CHARACTER': {
        const { characterId, heirloomId } = action.payload;
        const character = state.characters.find(c => c.id === characterId);
        if (!character || character.level < RETIREMENT_LEVEL) return state; // Min level to retire

        const heirloom = character.inventory.find(i => i.id === heirloomId) || character.equipment.find(i => i.id === heirloomId);
        if (!heirloom) return state;

        const legacyBonus: Partial<GameStats> = {};
        for (const stat in character.maxStats) {
            const key = stat as keyof GameStats;
            legacyBonus[key] = Math.floor(character.maxStats[key] * 0.05); // 5% of parents stats as legacy bonus
        }

        return {
            ...state,
            pendingGeneration: {
                parentId: characterId,
                legacyBonus,
                heirloom: { ...heirloom, isHeirloom: true },
                availableHeirs: character.potentialHeirs,
                gold: Math.floor(character.gold * 0.2) // Pass down 20% gold
            },
            characters: state.characters.map(c => c.id === characterId ? { ...c, status: 'retired' } : c),
            activeCharacterId: null
        };
    }
    case 'SELECT_HEIR': {
        const { characterId, heirId } = action.payload;
        if (!state.pendingGeneration) return state;

        const chosenHeir = state.pendingGeneration.availableHeirs?.find(h => h.childId === heirId);
        if (!chosenHeir) return state;

        return gameReducer(state, {
            type: 'CREATE_CHARACTER',
            payload: {
                name: chosenHeir.name,
                class: chosenHeir.class,
                level: 1,
                experience: 0,
                stats: chosenHeir.baseStats,
                maxStats: chosenHeir.baseStats,
                equipment: [state.pendingGeneration.heirloom],
                accessorySlots: [null, null],
                inventory: [],
                generation: (state.characters.find(c => c.id === state.pendingGeneration?.parentId)?.generation || 1) + 1,
                parentIds: [state.pendingGeneration.parentId],
                children: [],
                materials: {},
                lastActive: new Date().toISOString(),
                gold: state.pendingGeneration.gold,
                status: 'active',
                legacyBonus: state.pendingGeneration.legacyBonus,
                party: [],
                completedRaids: {},
                quests: [],
                completedQuests: [],
                activePassives: [],
                personality: 'jovial', // Default or random
                unlockedAchievements: [],
                equippedTitle: null,
                endlessDungeonProgress: 0,
                heir: chosenHeir
            }
        });
    }
    case 'ADD_ACHIEVEMENTS': {
        const { characterId, achievementIds } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        const newUnlocked = new Set([...character.unlockedAchievements, ...achievementIds]);
        const updatedCharacter = { ...character, unlockedAchievements: Array.from(newUnlocked) };
        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }
    case 'EQUIP_TITLE': {
        const { characterId, title } = action.payload;
        const updatedCharacter = { ...state.characters.find(c => c.id === characterId)!, equippedTitle: title };
        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }
    case 'SET_GRINDING': {
        return { ...state, isGrinding: action.payload };
    }
    case 'TOGGLE_PASSIVE_ABILITY': {
        const { characterId, abilityId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        
        const currentPassives = new Set(character.activePassives);
        if (currentPassives.has(abilityId)) {
            currentPassives.delete(abilityId);
        } else {
            currentPassives.add(abilityId);
        }

        let updatedCharacter: Character = { ...character, activePassives: Array.from(currentPassives) };
        const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
        updatedCharacter = { ...updatedCharacter, stats, maxStats };

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }
    case 'SET_TUTORIAL_SHOWN': {
        return {
            ...state,
            tutorialShown: action.payload,
        };
    }
    case 'PAUSE_COMBAT': {
        return {
            ...state,
            dungeonState: {
                ...state.dungeonState,
                status: 'paused' as DungeonStatus,
            },
        };
    }
    case 'RESUME_COMBAT': {
        return {
            ...state,
            dungeonState: {
                ...state.dungeonState,
                status: 'fighting' as DungeonStatus,
            },
        };
    }
    case 'PAUSE_RAID_COMBAT': {
        return {
            ...state,
            raidState: {
                ...state.raidState,
                status: 'paused' as RaidStatus,
            },
        };
    }
    case 'RESUME_RAID_COMBAT': {
        return {
            ...state,
            raidState: {
                ...state.raidState,
                status: 'fighting' as RaidStatus,
            },
        };
    }
    case 'UPDATE_SETTINGS': {
        return {
            ...state,
            settings: {
                ...state.settings,
                ...action.payload,
            },
        };
    }
        case 'ADVANCE_WORLD_STATE': {
            console.log("Advancing world state...");
            const isNight = state.worldState.time === 'day';
            const newTime = isNight ? 'night' : 'day';
            let newDay = state.worldState.day;
            let activeEvents = [...state.worldState.activeEvents];

            if (!isNight) {
                newDay += 1;
                activeEvents = updateActiveEvents(activeEvents);
                const newEvent = rollForNewEvent(newDay);
                if (newEvent) {
                    activeEvents.push(newEvent);
                    // Add to social log
                    state.socialLog.push({
                        id: uuidv4(),
                        timestamp: new Date().toISOString(),
                        type: 'world_event' as const,
                        content: `New World Event: ${newEvent.name} - ${newEvent.description}`,
                        participantIds: []
                    });
                }
            }

            return {
                ...state,
                worldState: {
                    ...state.worldState,
                    time: newTime as 'day' | 'night',
                    day: newDay,
                    activeEvents
                }
            };
        }
        default:
        return state;
  }
};


interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<Action>;
    activeCharacter: Character | null;
    saveGame: () => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        try {
            const savedDataJSON = localStorage.getItem(SAVE_KEY);
            if (savedDataJSON) {
                const savedData = JSON.parse(savedDataJSON);
                if (savedData.gameState) {
                    dispatch({ type: 'LOAD_STATE', payload: savedData.gameState });
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to load game state from localStorage", error);
        }
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, tutorialShown: false } }); // Ensure tutorial is shown for new games
    }, []);

    useEffect(() => {
        if (state.isLoaded && state.settings.autoSave) {
            const saveData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                gameState: state
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        }
    }, [state]);

    const activeCharacter = useMemo(() => {
        if (!state.activeCharacterId) return null;
        return state.characters.find(c => c.id === state.activeCharacterId && c.status === 'active') || null;
    }, [state.activeCharacterId, state.characters]);

    const saveGame = useCallback(() => {
        if (!state.isLoaded) return;
        const saveData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            gameState: state,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log("Game saved!");
    }, [state]);

    const resetGame = useCallback(() => {
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
    }, []);

    // Global Engine Loop for World and Social features
    useEffect(() => {
        if (!state.isLoaded) return;

        console.log("Starting global world engine loop...");

        const worldInterval = setInterval(() => {
            dispatch({ type: 'ADVANCE_WORLD_STATE' });
        }, 60000); // Advance world state every 60 seconds

        const socialInterval = setInterval(() => {
            dispatch({ type: 'SIMULATE_SOCIAL_TURN' });
        }, 30000); // Simulate social turns every 30 seconds

        return () => {
            clearInterval(worldInterval);
            clearInterval(socialInterval);
        };
    }, [state.isLoaded, dispatch]);

    const value = {
        state,
        dispatch,
        activeCharacter,
        saveGame,
        resetGame
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
