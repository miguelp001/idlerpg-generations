import { GameState, Action, Character, Guild, PlayerQuest } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { 
    GUILD_CREATE_COST, 
    GUILD_DONATION_XP, 
    GUILD_DONATION_GOLD, 
    GUILD_XP_TABLE, 
    GUILD_UPGRADE_BASE_COST,
    GUILD_UPGRADE_COST_MULTIPLIER,
    calculateXpForLevel,
    MAX_GOLD 
} from '../../constants';
import { QUESTS } from '../../data/quests';
import { ITEMS } from '../../data/items';
import { updateActiveEvents, rollForNewEvent } from '../../services/worldEventService';
import { calculateForgeCost, generateForgeItem } from '../../services/forgeService';
import { checkAllAchievements } from '../../services/achievementService';
import { Equipment } from '../../types';

export const worldReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'ADVANCE_WORLD_STATE': {
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

    case 'CREATE_GUILD': {
        const { characterId, guildName } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        if (state.guild || (character.gold || 0) < GUILD_CREATE_COST) return state;
        
        const newGuild: Guild = { 
            id: uuidv4(), 
            name: guildName, 
            level: 1, 
            experience: 0, 
            members: [], 
            upgrades: { barracks: 0, vault: 0, library: 0 } 
        };
        const updatedCharacter = { ...character, gold: Math.max(0, (character.gold || 0) - GUILD_CREATE_COST), guildId: newGuild.id };

        return {
            ...state,
            guild: newGuild,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }

    case 'JOIN_GUILD': {
        const { characterId } = action.payload;
        const character = state.characters.find(c => c.id === characterId)!;
        if (!state.guild || character.guildId === state.guild.id) return state;

        const updatedCharacter = { ...character, guildId: state.guild.id };

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }

    case 'DONATE_TO_GUILD': {
        const { characterId, amount } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        if (!state.guild || character.gold < amount || amount <= 0) return state;

        const updatedCharacter = { ...character, gold: character.gold - amount };
        const xpGained = Math.floor(amount * (GUILD_DONATION_XP / GUILD_DONATION_GOLD));
        let newXp = state.guild.experience + xpGained;
        let newLevel = state.guild.level;
        let xpForNextLevel = GUILD_XP_TABLE[newLevel];
        
        while (xpForNextLevel && newXp >= xpForNextLevel) {
            newXp -= xpForNextLevel;
            newLevel++;
            xpForNextLevel = GUILD_XP_TABLE[newLevel];
        }

        return {
            ...state,
            guild: { ...state.guild, experience: newXp, level: newLevel },
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
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

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? { ...c, quests: [...c.quests, newPlayerQuest] } : c),
        };
    }

    case 'TURN_IN_QUEST': {
        const { characterId, questId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const questDef = QUESTS[questId];
        const playerQuest = character.quests.find(q => q.questId === questId);
        if (!questDef || !playerQuest) return state;

        if (!playerQuest.objectives.every(obj => obj.currentAmount >= obj.requiredAmount)) return state;
        
        let updatedCharacter = { ...character };
        updatedCharacter.experience += (questDef.rewards.xp || 0);
        updatedCharacter.gold = Math.min((updatedCharacter.gold || 0) + (questDef.rewards.gold || 0), MAX_GOLD);
        if (questDef.rewards.items) {
            const newItems = questDef.rewards.items.map(itemId => {
                const itemTemplate = ITEMS[itemId];
                if (!itemTemplate) return null;
                return { 
                    ...itemTemplate, 
                    id: uuidv4(), 
                    baseId: itemId, 
                    baseName: itemTemplate.name, 
                    upgradeLevel: 0, 
                    rarity: itemTemplate.rarity || 'common',
                    price: 0,
                    level: character.level 
                } as Equipment;
            }).filter((i): i is Equipment => i !== null);
            updatedCharacter.inventory = [...updatedCharacter.inventory, ...newItems];
        }

        while (updatedCharacter.experience >= calculateXpForLevel(updatedCharacter.level)) {
            updatedCharacter.experience -= calculateXpForLevel(updatedCharacter.level);
            updatedCharacter.level += 1;
        }

        updatedCharacter.quests = updatedCharacter.quests.filter(q => q.questId !== questId);
        updatedCharacter.completedQuests = [...updatedCharacter.completedQuests, questId];
        
        const newlyUnlocked = checkAllAchievements(updatedCharacter, state);
        if (newlyUnlocked.length > 0) {
            updatedCharacter.unlockedAchievements = Array.from(new Set([...updatedCharacter.unlockedAchievements, ...newlyUnlocked]));
        }

        return {
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
    }

    case 'REQUEST_FORGE': {
        const char = state.characters.find(c => c.id === action.payload.characterId);
        if (!char) return state;
        const { materials, gold } = calculateForgeCost(action.payload.order.rarity, action.payload.order.targetStats, char.level);
        
        if (char.gold < gold) return state;
        for (const req of materials) {
            if ((char.materials[req.materialId] || 0) < req.amount) return state;
        }

        const newMaterials = { ...char.materials };
        materials.forEach(req => { newMaterials[req.materialId] -= req.amount; });

        const updatedChar: Character = {
            ...char, gold: char.gold - gold, materials: newMaterials,
            activeForgeOrder: { ...action.payload.order, id: uuidv4(), requiredMaterials: materials, goldCost: gold }
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === char.id ? updatedChar : c),
            socialLog: [{ id: uuidv4(), timestamp: new Date().toISOString(), type: 'social_interaction' as const, content: `Forge order started: ${action.payload.order.rarity} ${action.payload.order.slot}.` }, ...state.socialLog].slice(0, 50),
        };
    }

    case 'CLAIM_FORGE': {
        const char = state.characters.find(c => c.id === action.payload.characterId);
        if (!char || !char.activeForgeOrder) return state;

        const forgedItem = generateForgeItem(char.activeForgeOrder);
        const updatedChar = { ...char, inventory: [...char.inventory, forgedItem], activeForgeOrder: undefined };

        return {
            ...state,
            characters: state.characters.map(c => c.id === char.id ? updatedChar : c),
            socialLog: [{ id: uuidv4(), timestamp: new Date().toISOString(), type: 'social_interaction' as const, content: `Claimed forged item: ${forgedItem.name}!` }, ...state.socialLog].slice(0, 50),
        };
    }

    case 'BLESS_CORPSE': {
        const { characterId, corpseId } = action.payload;
        const char = state.characters.find(c => c.id === characterId);
        const corpse = state.worldState.corpses.find(c => c.id === corpseId);
        if (!char || !corpse) return state;

        return {
            ...state,
            worldState: {
                ...state.worldState,
                factionStandings: { ...state.worldState.factionStandings, 'Explorer_League': (state.worldState.factionStandings['Explorer_League'] || 0) + 15 },
                corpses: state.worldState.corpses.filter(c => c.id !== corpseId)
            },
            socialLog: [{ id: uuidv4(), timestamp: new Date().toISOString(), type: 'social_interaction' as const, content: `${char.name} blessed the remains of ${corpse.playerName}.` }, ...state.socialLog].slice(0, 50)
        };
    }
    case 'UPGRADE_GUILD': {
        const { characterId, upgradeType } = action.payload;
        const char = state.characters.find(c => c.id === characterId);
        if (!char || !state.guild) return state;

        const currentLevel = state.guild.upgrades[upgradeType] || 0;
        const cost = Math.floor(GUILD_UPGRADE_BASE_COST * Math.pow(GUILD_UPGRADE_COST_MULTIPLIER, currentLevel));

        if (char.gold < cost) return state;

        const updatedGuild = {
            ...state.guild,
            upgrades: {
                ...state.guild.upgrades,
                [upgradeType]: currentLevel + 1
            }
        };

        const updatedChar = { ...char, gold: char.gold - cost };

        return {
            ...state,
            guild: updatedGuild,
            characters: state.characters.map(c => c.id === char.id ? updatedChar : c),
            socialLog: [{ 
                id: uuidv4(), 
                timestamp: new Date().toISOString(), 
                type: 'social_interaction' as const, 
                content: `Guild upgraded: ${upgradeType} Level ${currentLevel + 1}!` 
            }, ...state.socialLog].slice(0, 50),
        };
    }

    default:
      return state;
  }
};
