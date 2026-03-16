import { GameState, Action, Character, Equipment, RelationshipStatus, Adventurer, CharacterClassType, MercenaryHeir, PotentialHeir, GameStats, ParentInfo } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { 
    CLASSES, 
    RETIREMENT_LEVEL, 
    REFRESH_TAVERN_COST, 
    SHOP_REFRESH_COST, 
    UPGRADE_COST, 
    SELL_PRICE,
    PERSONALITY_TRAITS,
    RELATIONSHIP_THRESHOLDS 
} from '../../constants';
import { ITEMS } from '../../data/items';
import { generateAdventurer } from '../../services/socialService';
import { generateShopItems } from '../../services/shopService';
import { recalculateStats } from '../../services/statService';
import { checkAllAchievements } from '../../services/achievementService';

export const characterReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'CREATE_CHARACTER': {
      let characterData = action.payload;
      
      let newCharacter: Character = {
        ...characterData,
        id: uuidv4(),
        potentialHeirs: [],
        activePassives: [],
        unlockedAchievements: [],
        equippedTitle: null,
        equipment: [],
        accessorySlots: [null, null],
        endlessDungeonProgress: 1,
        materials: {},
      };

      // Starting gear
      newCharacter.equipment.push({ ...ITEMS.worn_sword, id: uuidv4(), baseId: 'worn_sword', baseName: ITEMS.worn_sword.name, upgradeLevel: 0, price: 0 });
      newCharacter.equipment.push({ ...ITEMS.tattered_tunic, id: uuidv4(), baseId: 'tattered_tunic', baseName: ITEMS.tattered_tunic.name, upgradeLevel: 0, price: 0 });
      newCharacter.accessorySlots[0] = { ...ITEMS.simple_pendant, id: uuidv4(), baseId: 'simple_pendant', baseName: ITEMS.simple_pendant.name, upgradeLevel: 0, price: 0 };
      newCharacter.accessorySlots[1] = { ...ITEMS.plain_ring, id: uuidv4(), baseId: 'plain_ring', baseName: ITEMS.plain_ring.name, upgradeLevel: 0, price: 0 };

      let characters = [...state.characters];
      let newRelationships = [...state.relationships];
      let newGuild = state.guild;
      let newSocialLog = [...state.socialLog];
      
      if (state.pendingGeneration) {
        const { parentId, legacyBonus, heirloom } = state.pendingGeneration;
        const parent = state.characters.find(c => c.id === parentId);
        
        if (parent) {
          newCharacter.generation = parent.generation + 1;
          newCharacter.parentIds = [parentId, ...(characterData.heir?.parents.map((p: any) => p.id).filter((id: any) => id !== parentId) ?? [])];
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
        shopItems: generateShopItems(newCharacter.level),
        tutorialShown: false,
      };
      
      const newlyUnlocked = checkAllAchievements(newCharacter, newState);
      if (newlyUnlocked.length > 0) {
          newCharacter.unlockedAchievements = Array.from(new Set([...newCharacter.unlockedAchievements, ...newlyUnlocked]));
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
                if (newAccessorySlots[0]) newInventory.push(newAccessorySlots[0]);
                newAccessorySlots[0] = itemToEquip;
            }
        } else {
            const existingItemIndex = newEquipment.findIndex(i => i.slot === itemToEquip.slot);
            if (existingItemIndex > -1) {
                newInventory.push(newEquipment[existingItemIndex]);
                newEquipment.splice(existingItemIndex, 1);
            }
            newEquipment.push(itemToEquip);
        }

        let updatedCharacter: Character = { ...character, inventory: newInventory, equipment: newEquipment, accessorySlots: newAccessorySlots };
        const { stats, maxStats } = recalculateStats(updatedCharacter, state.guild?.level || 0);
        updatedCharacter = { ...updatedCharacter, stats, maxStats, currentHealth: stats.health, currentMana: stats.mana };

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }

    case 'UNEQUIP_ITEM': {
        const { characterId, itemId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        
        let newEquipment = [...character.equipment];
        let newInventory = [...character.inventory];
        let newAccessorySlots: [Equipment | null, Equipment | null] = [...character.accessorySlots];

        let itemToUnequip: Equipment | undefined;

        if (newAccessorySlots[0]?.id === itemId) {
            itemToUnequip = newAccessorySlots[0]!;
            newAccessorySlots[0] = null;
        } else if (newAccessorySlots[1]?.id === itemId) {
            itemToUnequip = newAccessorySlots[1]!;
            newAccessorySlots[1] = null;
        } else {
            const existingItemIndex = newEquipment.findIndex(i => i.id === itemId);
            if (existingItemIndex > -1) {
                itemToUnequip = newEquipment[existingItemIndex];
                newEquipment.splice(existingItemIndex, 1);
            }
        }

        if (!itemToUnequip) return state;

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
        if (firstStat && typeof newStats[firstStat] === 'number') {
            (newStats[firstStat] as any) += 1;
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
        
        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
        };
    }

    case 'RECRUIT_ADVENTURER': {
        const { characterId, adventurerId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const adventurer = state.tavernAdventurers.find(a => a.id === adventurerId)!;
        
        if (character.gold < (adventurer as any).recruitmentCost) return state;

        const updatedCharacter = {
            ...character,
            gold: character.gold - (adventurer as any).recruitmentCost,
            party: [...character.party, adventurer]
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c),
            tavernAdventurers: state.tavernAdventurers.filter(a => a.id !== adventurerId)
        };
    }

    case 'DISMISS_ADVENTURER': {
        const { characterId, adventurerId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        
        if (character.partnerId === adventurerId) return state;

        const updatedCharacter = {
            ...character,
            party: character.party.filter(p => p.id !== adventurerId)
        };

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? updatedCharacter : c)
        };
    }

    case 'REFRESH_TAVERN_ADVENTURERS': {
        const { characterId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        if (character.gold < REFRESH_TAVERN_COST) return state;

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? { ...c, gold: c.gold - REFRESH_TAVERN_COST } : c),
            tavernAdventurers: Array.from({ length: 5 }, () => generateAdventurer(character.level))
        };
    }

    case 'REFRESH_SHOP': {
        const { characterId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        if (character.gold < SHOP_REFRESH_COST) return state;

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? { ...c, gold: c.gold - SHOP_REFRESH_COST } : c),
            shopItems: generateShopItems(character.level)
        };
    }

    case 'BUY_ITEM': {
        const { characterId, itemId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const item = state.shopItems.find(i => i.id === itemId)!;
        
        if (character.gold < item.price) return state;

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? { ...c, gold: c.gold - item.price, inventory: [...c.inventory, item] } : c),
            shopItems: state.shopItems.filter(i => i.id !== itemId)
        };
    }

    case 'SELL_ITEM': {
        const { characterId, itemId } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const item = character.inventory.find(i => i.id === itemId)!;
        if (item.isHeirloom) return state;

        const goldValue = SELL_PRICE(item);

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? { ...c, gold: c.gold + goldValue, inventory: c.inventory.filter(i => i.id !== itemId) } : c)
        };
    }

    case 'GIVE_ITEM_TO_ADVENTURER': {
        const { characterId, adventurerId, itemId, giftResponse } = action.payload;
        let character = state.characters.find(c => c.id === characterId)!;
        const item = character.inventory.find(i => i.id === itemId)!;
        
        const ids = [characterId, adventurerId].sort();
        const relId = ids.join('-');
        
        const updatedRelationships = [...state.relationships];
        const relIndex = updatedRelationships.findIndex(r => r.id === relId);
        
        if (relIndex > -1) {
            const rel = updatedRelationships[relIndex];
            updatedRelationships[relIndex] = {
                ...rel,
                score: rel.score + giftResponse.scoreChange,
                giftCount: (rel.giftCount || 0) + 1
            };
        } else {
            updatedRelationships.push({
                id: relId,
                participantIds: ids as [string, string],
                score: giftResponse.scoreChange,
                status: 'acquaintances',
                giftCount: 1
            });
        }

        return {
            ...state,
            characters: state.characters.map(c => c.id === characterId ? { ...c, inventory: c.inventory.filter(i => i.id !== itemId) } : c),
            relationships: updatedRelationships,
            socialLog: [...state.socialLog, {
                id: uuidv4(),
                type: 'social_interaction',
                content: `${character.name} gave ${item.name} to ${adventurerId}. ${giftResponse.response}`,
                timestamp: new Date().toISOString(),
                participantIds: ids
            }]
        };
    }

    case 'SIMULATE_SOCIAL_TURN': {
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
                
                const compatibility = PERSONALITY_TRAITS[p1.personality].compatibility[p2.personality] || 0;
                relationship.score += compatibility * 0.1;

                let currentStatus = relationship.status;
                let newStatus: RelationshipStatus = 'acquaintances';
                const sortedThresholds = Object.entries(RELATIONSHIP_THRESHOLDS).sort(([, a], [, b]) => (b as number) - (a as number));

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
                        participantIds: ids as [string, string]
                    });
                }
            }
        }

        return { ...state, relationships: newRelationships, socialLog: newSocialLog.slice(-50), characters: charactersToUpdate };
    }

    case 'CREATE_HEIR': {
        const { characterId, parents } = action.payload;
        let activeCharacter = state.characters.find(c => c.id === characterId);
        if (!activeCharacter) return state;

        const [parent1, parent2] = parents;
        const childClass = Math.random() > 0.5 ? parent1.class : parent2.class;
        const childName = `${parent1.name.split(' ')[0]}-${parent2.name.split(' ')[0]} Legacy`;
        
        const legacyBonus: Partial<GameStats> = {};
        for (const stat in parent1.stats) {
            const key = stat as keyof GameStats;
            const val1 = parent1.stats[key];
            const val2 = parent2.stats[key];
            if (typeof val1 === 'number' && typeof val2 === 'number') {
                legacyBonus[key] = Math.floor((val1 + val2) * 0.05);
            }
        }

        const newHeir: PotentialHeir = {
            childId: uuidv4(),
            name: childName,
            class: childClass,
            parents: [parent1, parent2],
            legacyBonus,
            baseStats: CLASSES[childClass].baseStats,
        };

        return { 
            ...state, 
            characters: state.characters.map(c => c.id === characterId ? { ...c, potentialHeirs: [...c.potentialHeirs, newHeir] } : c) 
        };
    }

    default:
      return state;
  }
};
