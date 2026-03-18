import { GameState, Action, Character, DungeonRoom, DungeonRoomType, DungeonCorpse, Equipment } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { DUNGEONS } from '../../data/dungeons';
import { ALL_MONSTERS } from '../../data/monsters';
import { processCombatTurn } from '../../services/combatService';
import { generateProceduralDungeon } from '../../services/proceduralDungeonService';
import { generateScaledMonster } from '../../services/monsterScalingService';
import { distributeEquipment } from '../../services/lootDistributionService';
import { getGlobalModifiers, getFactionModifiers } from '../../services/worldEventService';
import { 
    calculateXpForLevel, 
    MAX_GOLD, 
    GUILD_VAULT_BONUS, 
    GUILD_LIBRARY_BONUS 
} from '../../constants';
import { recalculateStats } from '../../services/statService';
import { checkKillAchievements, checkAllAchievements } from '../../services/achievementService';
import { RAIDS } from '../../data/raids';
import { instantiateItem } from '../../services/itemService';
import { generateMaterialDrops } from '../../services/lootGenerationService';
import { MATERIALS } from '../../data/materials';
import { ABILITIES } from '../../data/abilities';

const initialDungeonState = {
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

const initialRaidState = {
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

function resolveMonster(monsterId: string | null, state: GameState): any | null {
    if (!monsterId) return null;
    if (ALL_MONSTERS[monsterId]) return ALL_MONSTERS[monsterId];

    // Attempt to reconstruct if it's a scaled monster from procedural data
    if (monsterId.includes('_scaled_') && state.dungeonState.proceduralDungeonData) {
        const parts = monsterId.split('_scaled_');
        const baseId = parts[0];
        const procedural = state.dungeonState.proceduralDungeonData;
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        
        if (activeCharacter) {
            const monster = generateScaledMonster(
                baseId, 
                activeCharacter.level, 
                procedural.difficulty, 
                procedural.floor
            );
            // Re-inject into local cache for this session
            (ALL_MONSTERS as any)[monster.id] = monster;
            return monster;
        }
    }
    
    return null;
}

export const combatReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_DUNGEON': {
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        if (!activeCharacter) return state;
        const dungeon = DUNGEONS.find(d => d.id === action.payload.dungeonId);
        if (!dungeon) return state;

        const dungeonRooms: DungeonRoom[] = dungeon.rooms || [
            ...dungeon.monsters.map((mId, i) => ({ id: `room_m_${i}`, type: 'combat' as DungeonRoomType, monsterId: mId, isCleared: false })),
            { id: 'room_boss', type: 'boss' as DungeonRoomType, monsterId: dungeon.boss, isCleared: false }
        ];

        const firstRoom = dungeonRooms[0];
        const firstMonster = (firstRoom.type === 'combat' || firstRoom.type === 'boss') ? resolveMonster(firstRoom.monsterId || null, state) : null;

        const updatedCharacter = {
            ...activeCharacter,
            currentHealth: activeCharacter.maxStats.health,
            currentMana: activeCharacter.maxStats.mana,
            party: activeCharacter.party.map(p => ({ ...p, currentHealth: p.stats.health, currentMana: p.stats.mana }))
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...initialDungeonState,
                status: (firstRoom.type === 'combat' || firstRoom.type === 'boss') ? 'fighting' : (firstRoom.type === 'treasure' ? 'treasure_found' : (firstRoom.type === 'rest' ? 'resting' : 'event')) as any,
                dungeonId: dungeon.id,
                monsterId: firstMonster?.id || null,
                currentMonsterHealth: firstMonster?.stats.health || null,
                currentMonsterIndex: firstRoom.type === 'combat' ? 0 : -1,
                combatLog: [{ id: uuidv4(), type: 'info', message: `You have entered the ${dungeon.name}.`, actor: 'system' }],
                rooms: dungeonRooms,
                currentRoomIndex: 0,
            } as any,
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
                firstMonster = generateScaledMonster(firstRoom.monsterId!, activeCharacter.level, proceduralDungeon.difficulty, proceduralDungeon.floor);
                ALL_MONSTERS[firstMonster.id] = firstMonster;
            }

            const updatedCharacter = {
                ...activeCharacter,
                currentHealth: activeCharacter.maxStats.health,
                currentMana: activeCharacter.maxStats.mana,
                party: activeCharacter.party.map(p => ({ ...p, currentHealth: p.stats.health, currentMana: p.stats.mana }))
            };

            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                dungeonState: {
                    ...initialDungeonState,
                    status: (firstRoom.type === 'combat' || firstRoom.type === 'boss') ? 'fighting' : (firstRoom.type === 'treasure' ? 'treasure_found' : 'event') as any,
                    dungeonId: proceduralDungeon.id,
                    monsterId: firstMonster?.id || null,
                    currentMonsterHealth: firstMonster?.stats.health || null,
                    currentMonsterIndex: firstRoom.type === 'combat' ? 0 : -1,
                    combatLog: [{ id: uuidv4(), type: 'info', message: `You have entered ${proceduralDungeon.name}.`, actor: 'system' }],
                    proceduralDungeonData: proceduralDungeon,
                    rooms: proceduralDungeon.rooms,
                    currentRoomIndex: 0,
                } as any,
            };
        } catch (error) {
            console.error('Failed to start endless dungeon:', error);
            return state;
        }
    }

    case 'DO_COMBAT_TURN': {
        if (state.dungeonState.status !== 'fighting' || !state.activeCharacterId) return state;
        let activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const monster = resolveMonster(state.dungeonState.monsterId, state);
        if (!activeCharacter || !monster) return state;

        const newTurnCount = state.dungeonState.turnCount + 1;
        const turnResult = processCombatTurn(activeCharacter, activeCharacter.party, monster, { ...state.dungeonState, turnCount: newTurnCount });

        let updatedCharacter: Character = { ...activeCharacter };
        for (const id in turnResult.updatedCombatants) {
            const changes = turnResult.updatedCombatants[id];
            if (id === activeCharacter.id) {
                updatedCharacter.currentHealth = changes.currentHealth ?? updatedCharacter.currentHealth;
                updatedCharacter.currentMana = changes.currentMana ?? updatedCharacter.currentMana;
            } else {
                const pIdx = updatedCharacter.party.findIndex(p => p.id === id);
                if (pIdx > -1) {
                    updatedCharacter.party[pIdx] = { ...updatedCharacter.party[pIdx], ...changes };
                }
            }
        }
        
        let combatLogs = [...state.dungeonState.combatLog, ...turnResult.logs];

        if ((updatedCharacter.currentHealth ?? 0) <= 0) {
            const corpse: DungeonCorpse = {
                id: uuidv4(), playerName: updatedCharacter.name, characterClass: updatedCharacter.class,
                level: updatedCharacter.level, dungeonId: state.dungeonState.dungeonId || 'unknown',
                floor: state.dungeonState.proceduralDungeonData?.floor ?? 0,
                roomIndex: state.dungeonState.currentRoomIndex, timestamp: new Date().toISOString(),
                gold: Math.floor(updatedCharacter.gold * 0.1), materials: { ...updatedCharacter.materials },
            };
            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                dungeonState: { ...state.dungeonState, status: 'defeat', combatLog: [...combatLogs, { id: uuidv4(), type: 'defeat', message: "Defeat.", actor: 'system' }] } as any,
                worldState: { ...state.worldState, corpses: [...state.worldState.corpses, corpse] }
            };
        }

        if (turnResult.newMonsterHealth <= 0) {
            const newlyUnlocked = checkKillAchievements(monster.id, new Set(updatedCharacter.unlockedAchievements));
            if (newlyUnlocked.length > 0) {
                updatedCharacter.unlockedAchievements = Array.from(new Set([...updatedCharacter.unlockedAchievements, ...newlyUnlocked]));
            }
            
            const { goldGain = 1 } = getGlobalModifiers(state.worldState.activeEvents) || {};
            const vaultBonus = 1 + (state.guild?.upgrades?.vault || 0) * GUILD_VAULT_BONUS;
            const goldDropped = Math.floor((monster.goldDrop || 0) * (goldGain || 1) * vaultBonus) || 0;
            updatedCharacter.gold = Math.min((updatedCharacter.gold || 0) + goldDropped, MAX_GOLD);

            // Update Quest Progress for ANY monster kill
            updatedCharacter.quests = (updatedCharacter.quests || []).map(q => ({
                ...q,
                objectives: q.objectives.map(obj => 
                    obj.type === 'kill' && (obj.targetId === monster.originalId || obj.targetId === monster.id)
                        ? { ...obj, currentAmount: Math.min(obj.requiredAmount, obj.currentAmount + 1) }
                        : obj
                )
            }));

            const achievementUnlocked = checkAllAchievements(updatedCharacter, state);
            if (achievementUnlocked.length > 0) {
                updatedCharacter.unlockedAchievements = Array.from(new Set([...updatedCharacter.unlockedAchievements, ...achievementUnlocked]));
            }

            // Material Drops
            const materialDrops = generateMaterialDrops(monster);
            if (materialDrops.length > 0) {
                updatedCharacter.materials = { ...updatedCharacter.materials };
                materialDrops.forEach(drop => {
                    updatedCharacter.materials[drop.materialId] = (updatedCharacter.materials[drop.materialId] || 0) + drop.amount;
                    combatLogs.push({
                        id: uuidv4(),
                        type: 'gold', // Using gold type for loot highlight in log for now or 'special'
                        message: `Looted ${drop.amount}x ${MATERIALS[drop.materialId]?.name || drop.materialId}`,
                        actor: 'system'
                    });
                });
            }


            const isBoss = state.dungeonState.rooms[state.dungeonState.currentRoomIndex].type === 'boss';
            if (!isBoss) {
                return {
                    ...state,
                    characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                    dungeonState: {
                        ...state.dungeonState, status: 'room_cleared', goldGained: state.dungeonState.goldGained + goldDropped,
                        combatLog: [...combatLogs, { id: uuidv4(), type: 'victory', message: `${monster.name} defeated!`, actor: 'system' }],
                        cooldowns: turnResult.updatedCooldowns, turnCount: newTurnCount,
                        rooms: state.dungeonState.rooms.map((r, i) => i === state.dungeonState.currentRoomIndex ? { ...r, isCleared: true } : r)
                    } as any,
                };
            }

            // Dungeon Clear (Boss Defeated)
            const globalMods = getGlobalModifiers(state.worldState.activeEvents);
            const factionMods = getFactionModifiers(state.worldState.factionStandings);
            const libraryBonus = 1 + (state.guild?.upgrades?.library || 0) * GUILD_LIBRARY_BONUS;
            const totalXp = Math.floor(state.dungeonState.rooms.reduce((acc, r) => acc + (ALL_MONSTERS[r.monsterId!]?.xpReward || 0), 0) * globalMods.xpGain * factionMods.xpGain * libraryBonus);
            
            // Get loot from the dungeon's loot table
            const dungeon = state.dungeonState.proceduralDungeonData || DUNGEONS.find(d => d.id === state.dungeonState.dungeonId);
            const rawLoot = dungeon?.lootTable || [];
            
            // Instantiate items from IDs or use existing Equipment objects
            const lootFound: Equipment[] = rawLoot.map((lootItem: string | Equipment) => {
                if (typeof lootItem === 'string') {
                    return instantiateItem(lootItem);
                }
                return lootItem;
            }).filter((item: Equipment | null): item is Equipment => item !== null);
            
            // Distribute loot to party members or player
            const { playerItems, distributions } = distributeEquipment(lootFound, updatedCharacter, updatedCharacter.party);
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...playerItems];
            
            // Log loot findings
            lootFound.forEach(item => {
                const recipient = distributions.find(d => d.item.id === item.id)?.recipient;
                combatLogs.push({
                    id: uuidv4(),
                    type: 'treasure',
                    message: recipient 
                        ? `${recipient.name} received ${item.name}!` 
                        : `You found ${item.name}!`,
                    actor: 'system'
                });
            });
            
            // Level Up logic
            updatedCharacter.experience += totalXp;
            while (updatedCharacter.experience >= calculateXpForLevel(updatedCharacter.level)) {
                updatedCharacter.experience -= calculateXpForLevel(updatedCharacter.level);
                updatedCharacter.level++;
                updatedCharacter.activePassives = Object.values(ABILITIES)
                    .filter(a => a.class === updatedCharacter.class && a.type === 'passive' && updatedCharacter.level >= a.levelRequirement)
                    .map(a => a.id);
            }
            
            const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild);
            updatedCharacter.stats = stats;
            updatedCharacter.maxStats = maxStats;

            // Handle endless dungeon progress
            if (state.dungeonState.proceduralDungeonData) {
                const completedFloor = state.dungeonState.proceduralDungeonData.floor;
                if (completedFloor >= (updatedCharacter.endlessDungeonProgress || 1)) {
                    updatedCharacter.endlessDungeonProgress = completedFloor + 1;
                }
            }

            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                dungeonState: { ...state.dungeonState, status: 'victory', xpGained: totalXp, combatLog: combatLogs } as any,
                worldState: { ...state.worldState, factionStandings: { ...state.worldState.factionStandings, 'Warrior_Keep': (state.worldState.factionStandings['Warrior_Keep'] || 0) + 25 } }
            };
        }

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: { ...state.dungeonState, currentMonsterHealth: turnResult.newMonsterHealth, combatLog: combatLogs, cooldowns: turnResult.updatedCooldowns, turnCount: newTurnCount } as any,
        };
    }

    case 'NEXT_ROOM': {
        if (state.dungeonState.currentRoomIndex >= state.dungeonState.rooms.length - 1) return state;
        const nextRoomIndex = state.dungeonState.currentRoomIndex + 1;
        const nextRoom = state.dungeonState.rooms[nextRoomIndex];
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        if (!activeCharacter) return state;

        let monsterId = null;
        let monsterHealth = null;

        if (nextRoom.type === 'combat' || nextRoom.type === 'boss') {
            const monster = resolveMonster(nextRoom.monsterId || null, state);
            monsterId = monster?.id || null;
            monsterHealth = monster?.stats.health || null;
        }

        return {
            ...state,
            dungeonState: {
                ...state.dungeonState,
                status: (nextRoom.type === 'combat' || nextRoom.type === 'boss') ? 'fighting' : (nextRoom.type === 'treasure' ? 'treasure_found' : (nextRoom.type === 'rest' ? 'resting' : 'event')) as any,
                currentRoomIndex: nextRoomIndex,
                monsterId: monsterId,
                currentMonsterHealth: monsterHealth,
                combatLog: [...state.dungeonState.combatLog, { id: uuidv4(), type: 'info', message: `Entering ${nextRoom.type} room...`, actor: 'system' }]
            } as any
        };
    }

    case 'CLAIM_TREASURE': {
        const currentRoom = state.dungeonState.rooms[state.dungeonState.currentRoomIndex];
        if (currentRoom?.type !== 'treasure' || !currentRoom.treasure || !state.activeCharacterId) return state;

        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const { gold, items } = currentRoom.treasure;
        const newItems = items.map((lootItem: string | Equipment) => {
            if (typeof lootItem === 'string') {
                return instantiateItem(lootItem);
            }
            return lootItem;
        }).filter((item: Equipment | null): item is Equipment => item !== null);

        const updatedCharacter: Character = {
            ...activeCharacter,
            gold: Math.min((activeCharacter.gold || 0) + (gold || 0), MAX_GOLD),
            inventory: [...activeCharacter.inventory, ...newItems]
        };

        const newlyUnlocked = checkAllAchievements(updatedCharacter, state);
        if (newlyUnlocked.length > 0) {
            updatedCharacter.unlockedAchievements = Array.from(new Set([...updatedCharacter.unlockedAchievements, ...newlyUnlocked]));
        }

        const nextRoomExists = state.dungeonState.currentRoomIndex < state.dungeonState.rooms.length - 1;

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...state.dungeonState,
                status: nextRoomExists ? 'room_cleared' : 'victory',
                goldGained: state.dungeonState.goldGained + gold,
                lootFound: [...state.dungeonState.lootFound, ...items],
                combatLog: [...state.dungeonState.combatLog, { id: uuidv4(), type: 'gold', message: `Found ${gold} gold and ${items.length} items!`, actor: 'system' }]
            } as any
        };
    }

    case 'REST': {
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        if (!activeCharacter) return state;

        const updatedCharacter = {
            ...activeCharacter,
            currentHealth: Math.min(activeCharacter.maxStats.health, (activeCharacter.currentHealth || 0) + Math.floor(activeCharacter.maxStats.health * 0.3)),
            currentMana: Math.min(activeCharacter.maxStats.mana, (activeCharacter.currentMana || 0) + Math.floor(activeCharacter.maxStats.mana * 0.3)),
            party: activeCharacter.party.map(p => ({
                ...p,
                currentHealth: Math.min(p.stats.health, (p.currentHealth || 0) + Math.floor(p.stats.health * 0.3)),
                currentMana: Math.min(p.stats.mana, (p.currentMana || 0) + Math.floor(p.stats.mana * 0.3))
            }))
        };

        const nextRoomExists = state.dungeonState.currentRoomIndex < state.dungeonState.rooms.length - 1;

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            dungeonState: {
                ...state.dungeonState,
                status: nextRoomExists ? 'room_cleared' : 'victory',
                combatLog: [...state.dungeonState.combatLog, { id: uuidv4(), type: 'info', message: "The party takes a moment to rest and recover.", actor: 'system' }]
            } as any
        };
    }

    case 'LEAVE_DUNGEON': {
        return {
            ...state,
            dungeonState: { ...initialDungeonState } as any,
            isGrinding: false
        };
    }

    case 'PAUSE_COMBAT': {
        return {
            ...state,
            dungeonState: { ...state.dungeonState, status: 'paused' } as any
        };
    }

    case 'RESUME_COMBAT': {
        return {
            ...state,
            dungeonState: { ...state.dungeonState, status: 'fighting' } as any
        };
    }

    case 'START_RAID': {
        const raid = RAIDS.find(r => r.id === action.payload.raidId)!;
        const boss = ALL_MONSTERS[raid.bossId];
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId);
        if (!activeCharacter) return state;

        const updatedCharacter = {
            ...activeCharacter,
            currentHealth: activeCharacter.maxStats.health,
            currentMana: activeCharacter.maxStats.mana,
            party: activeCharacter.party.map(p => ({ ...p, currentHealth: p.stats.health, currentMana: p.stats.mana }))
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            raidState: {
                ...initialRaidState, status: 'fighting', raidId: raid.id, bossId: boss.id, currentBossHealth: boss.stats.health,
                combatLog: [{ id: uuidv4(), type: 'info', message: `Raid started against ${boss.name}!`, actor: 'system' }],
            } as any,
        };
    }

    case 'DO_RAID_COMBAT_TURN': {
        if (state.raidState.status !== 'fighting' || !state.activeCharacterId) return state;
        let activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const boss = ALL_MONSTERS[state.raidState.bossId!];
        if (!activeCharacter || !boss) return state;

        const newTurnCount = (state.raidState.turnCount || 0) + 1;
        const turnResult = processCombatTurn(activeCharacter, activeCharacter.party, boss, { ...state.raidState, turnCount: newTurnCount } as any);

        let updatedCharacter: Character = { ...activeCharacter };
        for (const id in turnResult.updatedCombatants) {
            const changes = turnResult.updatedCombatants[id];
            if (id === activeCharacter.id) {
                updatedCharacter.currentHealth = changes.currentHealth ?? updatedCharacter.currentHealth;
                updatedCharacter.currentMana = changes.currentMana ?? updatedCharacter.currentMana;
            } else {
                const pIdx = updatedCharacter.party.findIndex(p => p.id === id);
                if (pIdx > -1) {
                    updatedCharacter.party[pIdx] = { ...updatedCharacter.party[pIdx], ...changes };
                }
            }
        }
        
        let combatLogs = [...state.raidState.combatLog, ...turnResult.logs];

        if ((updatedCharacter.currentHealth ?? 0) <= 0) {
            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                raidState: { ...state.raidState, status: 'defeat', combatLog: [...combatLogs, { id: uuidv4(), type: 'defeat', message: "The raid party has fallen.", actor: 'system' }] } as any,
            };
        }

        if (turnResult.newMonsterHealth <= 0) {
            const raid = RAIDS.find(r => r.id === state.raidState.raidId)!;
            
            const globalMods = getGlobalModifiers(state.worldState.activeEvents);
            const vaultBonus = 1 + (state.guild?.upgrades?.vault || 0) * GUILD_VAULT_BONUS;
            const goldDropped = Math.floor(1000 * raid.guildLevelRequirement * globalMods.goldGain * vaultBonus);
            
            updatedCharacter.gold = Math.min((updatedCharacter.gold || 0) + goldDropped, MAX_GOLD);
            updatedCharacter.completedRaids = { ...updatedCharacter.completedRaids, [raid.id]: new Date().toISOString() };

            const rawLoot = raid.lootTable || [];
            const lootFound: Equipment[] = rawLoot.map(lootItem => {
                if (typeof lootItem === 'string') return instantiateItem(lootItem);
                return lootItem;
            }).filter((item): item is Equipment => item !== null);

            const { playerItems, distributions } = distributeEquipment(lootFound, updatedCharacter, updatedCharacter.party);
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...playerItems];

            distributions.forEach(d => {
                combatLogs.push({
                    id: uuidv4(),
                    type: 'treasure',
                    message: `${d.recipient.name} received ${d.item.name}!`,
                    actor: 'system'
                });
            });

            return {
                ...state,
                characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
                raidState: { 
                    ...state.raidState, 
                    status: 'victory', 
                    goldGained: goldDropped,
                    lootFound: lootFound,
                    combatLog: [...combatLogs, { id: uuidv4(), type: 'victory', message: `${boss.name} has been vanquished!`, actor: 'system' }] 
                } as any
            };
        }

        return {
            ...state,
            characters: state.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c),
            raidState: { 
                ...state.raidState, 
                currentBossHealth: turnResult.newMonsterHealth, 
                combatLog: combatLogs, 
                cooldowns: turnResult.updatedCooldowns, 
                turnCount: newTurnCount 
            } as any,
        };
    }

    case 'PAUSE_RAID_COMBAT': {
        return {
            ...state,
            raidState: { ...state.raidState, status: 'paused' } as any
        };
    }

    case 'RESUME_RAID_COMBAT': {
        return {
            ...state,
            raidState: { ...state.raidState, status: 'fighting' } as any
        };
    }

    case 'END_RAID': {
        return {
            ...state,
            raidState: { ...initialRaidState } as any
        };
    }

    case 'SET_GRINDING': {
        return {
            ...state,
            isGrinding: action.payload
        };
    }

    default:
      return state;
  }
};
