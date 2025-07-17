import { Equipment, Adventurer, Character, CharacterClassType, GameStats } from '../types';

/**
 * Calculates the total stat value of an equipment piece for a specific character class
 */
function calculateEquipmentValue(equipment: Equipment, characterClass: CharacterClassType): number {
    let totalValue = 0;
    
    // Apply class affinity multiplier if present
    const affinityMultiplier = equipment.classAffinity?.[characterClass] ?? 1.0;
    
    // Calculate weighted stat values based on class preferences
    const classWeights = getClassStatWeights(characterClass);
    
    for (const [stat, value] of Object.entries(equipment.stats)) {
        const statKey = stat as keyof GameStats;
        const weight = classWeights[statKey] || 1;
        const effectiveValue = (value || 0) * affinityMultiplier * weight;
        totalValue += effectiveValue;
    }
    
    return totalValue;
}

/**
 * Returns stat weights for different character classes
 * Higher weights mean the stat is more valuable for that class
 */
function getClassStatWeights(characterClass: CharacterClassType): Partial<Record<keyof GameStats, number>> {
    switch (characterClass) {
        case 'warrior':
            return {
                attack: 1.5,
                defense: 1.4,
                health: 1.3,
                agility: 1.0,
                mana: 0.5,
                intelligence: 0.5
            };
        case 'mage':
            return {
                intelligence: 1.5,
                mana: 1.4,
                attack: 0.7,
                agility: 1.0,
                health: 1.1,
                defense: 0.8
            };
        case 'rogue':
            return {
                agility: 1.5,
                attack: 1.3,
                intelligence: 1.0,
                health: 1.1,
                defense: 0.9,
                mana: 0.8
            };
        case 'cleric':
            return {
                intelligence: 1.3,
                mana: 1.3,
                health: 1.2,
                defense: 1.1,
                attack: 1.0,
                agility: 0.9
            };
        default:
            return {
                health: 1,
                mana: 1,
                attack: 1,
                defense: 1,
                agility: 1,
                intelligence: 1
            };
    }
}

/**
 * Checks if a character can use a piece of equipment
 */
function canUseEquipment(equipment: Equipment, character: Adventurer | Character): boolean {
    // All characters can use all equipment types in this game
    // Class affinity affects effectiveness but doesn't prevent usage
    return true;
}

/**
 * Finds the best recipient for a piece of equipment among party members
 * Returns null if no one should take it (player keeps it)
 */
export function findBestRecipient(
    equipment: Equipment, 
    player: Character, 
    party: Adventurer[]
): Adventurer | null {
    let bestRecipient: Adventurer | null = null;
    let bestImprovement = 0;
    
    // Check each party member
    for (const member of party) {
        if (!canUseEquipment(equipment, member)) {
            continue;
        }
        
        // Find current equipment in the same slot
        let currentEquipment: Equipment | null = null;
        
        if (equipment.slot === 'accessory') {
            // For accessories, we don't have accessory slots for party members yet
            // Skip accessory distribution for now
            continue;
        } else {
            // For weapon and armor
            currentEquipment = member.equipment.find(e => e.slot === equipment.slot) || null;
        }
        
        // Calculate improvement
        const newValue = calculateEquipmentValue(equipment, member.class);
        const currentValue = currentEquipment ? calculateEquipmentValue(currentEquipment, member.class) : 0;
        const improvement = newValue - currentValue;
        
        // Only consider if it's an improvement
        if (improvement > bestImprovement) {
            bestImprovement = improvement;
            bestRecipient = member;
        }
    }
    
    // Also check if the player should keep it
    let playerCurrentEquipment: Equipment | null = null;
    
    if (equipment.slot === 'accessory') {
        // For accessories, check both accessory slots
        const slot1 = player.accessorySlots[0];
        const slot2 = player.accessorySlots[1];
        
        if (!slot1 || !slot2) {
            // Player has an empty accessory slot, they should keep it
            return null;
        }
        
        // Find the weaker accessory to potentially replace
        const slot1Value = calculateEquipmentValue(slot1, player.class);
        const slot2Value = calculateEquipmentValue(slot2, player.class);
        playerCurrentEquipment = slot1Value < slot2Value ? slot1 : slot2;
    } else {
        // For weapon and armor
        playerCurrentEquipment = player.equipment.find(e => e.slot === equipment.slot) || null;
    }
    
    const newValueForPlayer = calculateEquipmentValue(equipment, player.class);
    const currentValueForPlayer = playerCurrentEquipment ? calculateEquipmentValue(playerCurrentEquipment, player.class) : 0;
    const playerImprovement = newValueForPlayer - currentValueForPlayer;
    
    // If player improvement is better than best party member improvement, player keeps it
    if (playerImprovement >= bestImprovement) {
        return null;
    }
    
    return bestRecipient;
}

/**
 * Distributes a list of equipment items to the most appropriate party members
 * Returns the items that should go to the player's inventory
 */
export function distributeEquipment(
    equipment: Equipment[], 
    player: Character, 
    party: Adventurer[]
): {
    playerItems: Equipment[];
    distributions: Array<{ recipient: Adventurer; item: Equipment; replacedItem?: Equipment }>;
} {
    const playerItems: Equipment[] = [];
    const distributions: Array<{ recipient: Adventurer; item: Equipment; replacedItem?: Equipment }> = [];
    
    // Create a working copy of party members with their current equipment
    const workingParty = party.map(member => ({
        ...member,
        equipment: [...member.equipment]
    }));
    
    for (const item of equipment) {
        const bestRecipient = findBestRecipient(item, player, workingParty);
        
        if (!bestRecipient) {
            // Player keeps this item
            playerItems.push(item);
        } else {
            // Give item to the best recipient
            const recipient = workingParty.find(m => m.id === bestRecipient.id)!;
            
            let replacedItem: Equipment | undefined;
            
            if (item.slot === 'accessory') {
                // This shouldn't happen since we skip accessories for party members
                // But handle it just in case
                playerItems.push(item);
                continue;
            } else {
                // For weapon and armor
                const existingItemIndex = recipient.equipment.findIndex(e => e.slot === item.slot);
                if (existingItemIndex > -1) {
                    replacedItem = recipient.equipment[existingItemIndex];
                    recipient.equipment[existingItemIndex] = item;
                } else {
                    recipient.equipment.push(item);
                }
            }
            
            distributions.push({
                recipient: bestRecipient,
                item,
                replacedItem
            });
        }
    }
    
    return { playerItems, distributions };
}
