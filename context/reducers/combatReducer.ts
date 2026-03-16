import { GameState, Action, Character, DungeonRoom, DungeonRoomType, DungeonCorpse, Equipment } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { DUNGEONS } from '../../data/dungeons';
import { ALL_MONSTERS } from '../../data/monsters';
import { processCombatTurn } from '../../services/combatService';
import { generateProceduralDungeon } from '../../services/proceduralDungeonService';
import { generateScaledMonster } from '../../services/monsterScalingService';
import { distributeEquipment } from '../../services/lootDistributionService';
import { getGlobalModifiers, getFactionModifiers } from '../../services/worldEventService';
import { calculateXpForLevel } from '../../constants';
import { recalculateStats } from '../../services/statService';
import { checkKillAchievements } from '../../services/achievementService';
import { RAIDS } from '../../data/raids';

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
        const firstMonster = firstRoom.type === 'combat' || firstRoom.type === 'boss' ? (firstRoom.monsterId ? ALL_MONSTERS[firstRoom.monsterId] : null) : null;

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
                status: firstRoom.type === 'combat' ? 'fighting' : (firstRoom.type === 'treasure' ? 'treasure_found' : (firstRoom.type === 'rest' ? 'resting' : 'event')) as any,
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
                    status: firstRoom.type === 'combat' ? 'fighting' : (firstRoom.type === 'treasure' ? 'treasure_found' : 'event') as any,
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
        const monster = state.dungeonState.monsterId ? ALL_MONSTERS[state.dungeonState.monsterId] : null;
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
            
            const { goldGain } = getGlobalModifiers(state.worldState.activeEvents);
            const goldDropped = Math.floor((monster.goldDrop || 0) * goldGain);
            updatedCharacter.gold += goldDropped;

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
            const totalXp = Math.floor(state.dungeonState.rooms.reduce((acc, r) => acc + (ALL_MONSTERS[r.monsterId!]?.xpReward || 0), 0) * globalMods.xpGain * factionMods.xpGain);
            
            const lootFound: Equipment[] = [];
            // Simplified loot logic for brevity
            
            const { playerItems } = distributeEquipment(lootFound, updatedCharacter, updatedCharacter.party);
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...playerItems];
            
            // Level Up logic
            updatedCharacter.experience += totalXp;
            while (updatedCharacter.experience >= calculateXpForLevel(updatedCharacter.level)) {
                updatedCharacter.experience -= calculateXpForLevel(updatedCharacter.level);
                updatedCharacter.level++;
            }
            
            const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
            updatedCharacter.stats = stats;
            updatedCharacter.maxStats = maxStats;

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

    case 'START_RAID': {
        const raid = RAIDS.find(r => r.id === action.payload.raidId)!;
        const activeCharacter = state.characters.find(c => c.id === state.activeCharacterId)!;
        const boss = ALL_MONSTERS[raid.bossId];

        return {
            ...state,
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

        const turnResult = processCombatTurn(activeCharacter, activeCharacter.party, boss, { ...state.raidState, turnCount: state.raidState.turnCount + 1 } as any);
        // Simplified same as dungeon combat for brevity...
        return state; // Placeholder for full implementation in final step
    }

    default:
      return state;
  }
};
