import { Equipment, EquipmentRarity, EquipmentSlot, CharacterClassType, GameStats } from '../types';
import { RARITY_MULTIPLIER } from '../constants';

export function generateProceduralLoot(targetLevel: number, difficulty: number, floor: number): string[] {
    const lootTable: string[] = [];
    const lootCount = Math.min(8, 3 + Math.floor(floor / 20)); // More loot on deeper floors, max 8
    
    for (let i = 0; i < lootCount; i++) {
        const item = generateProceduralItem(targetLevel, difficulty, floor);
        lootTable.push(item.baseId);
    }
    
    return lootTable;
}

export function generateProceduralItem(targetLevel: number, difficulty: number, floor: number): Equipment {
    const rarity = selectRarity(difficulty, floor);
    const slot = selectSlot();
    const classAffinity = selectClassAffinity();
    
    const baseStats = generateBaseStats(targetLevel, rarity, slot);
    const name = generateItemName(slot, rarity, floor);
    const price = calculateItemPrice(targetLevel, rarity);
    
    const item: Equipment = {
        id: `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        baseId: `proc_${slot}_${rarity}_${targetLevel}`,
        name,
        baseName: name,
        slot,
        rarity,
        stats: baseStats,
        upgradeLevel: 0,
        classAffinity,
        price
    };
    
    return item;
}

function selectRarity(difficulty: number, floor: number): EquipmentRarity {
    // Base rarity chances
    let rarityWeights = {
        common: 50,
        uncommon: 30,
        rare: 15,
        epic: 4,
        legendary: 1
    };
    
    // Difficulty increases rare item chances
    const difficultyBonus = Math.max(0, difficulty - 1);
    rarityWeights.rare += difficultyBonus * 5;
    rarityWeights.epic += difficultyBonus * 2;
    rarityWeights.legendary += difficultyBonus * 0.5;
    
    // Floor milestones guarantee better loot
    if (floor % 25 === 0) { // Every 25th floor
        rarityWeights.legendary += 10;
        rarityWeights.epic += 15;
    } else if (floor % 10 === 0) { // Every 10th floor
        rarityWeights.epic += 8;
        rarityWeights.rare += 12;
    } else if (floor % 5 === 0) { // Every 5th floor
        rarityWeights.rare += 10;
        rarityWeights.uncommon += 15;
    }
    
    // Deep floor bonuses
    if (floor >= 100) {
        rarityWeights.legendary += 5;
        rarityWeights.epic += 10;
    } else if (floor >= 50) {
        rarityWeights.epic += 5;
        rarityWeights.rare += 10;
    }
    
    return weightedRandomSelect(rarityWeights);
}

function selectSlot(): EquipmentSlot {
    const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
    return slots[Math.floor(Math.random() * slots.length)];
}

function selectClassAffinity(): { [key in CharacterClassType]?: number } | undefined {
    // 60% chance of having class affinity
    if (Math.random() > 0.6) return undefined;
    
    const classes: CharacterClassType[] = ['warrior', 'mage', 'rogue', 'cleric'];
    const selectedClass = classes[Math.floor(Math.random() * classes.length)];
    const affinityBonus = 5 + Math.floor(Math.random() * 15); // 5-20 bonus
    
    return { [selectedClass]: affinityBonus };
}

function generateBaseStats(targetLevel: number, rarity: EquipmentRarity, slot: EquipmentSlot): Partial<GameStats> {
    const rarityMultiplier = RARITY_MULTIPLIER[rarity];
    const levelMultiplier = Math.max(1, targetLevel / 5);
    const baseMultiplier = rarityMultiplier * levelMultiplier;
    
    const stats: Partial<GameStats> = {};
    
    // Slot-based stat preferences
    const slotPreferences = getSlotStatPreferences(slot);
    
    // Generate 2-4 stats per item
    const statCount = 2 + Math.floor(Math.random() * 3);
    const availableStats: (keyof GameStats)[] = ['health', 'mana', 'attack', 'defense', 'agility', 'intelligence'];
    
    for (let i = 0; i < statCount; i++) {
        const statIndex = Math.floor(Math.random() * availableStats.length);
        const stat = availableStats[statIndex];
        availableStats.splice(statIndex, 1); // Remove to avoid duplicates
        
        const preference = slotPreferences[stat] || 1;
        const baseValue = Math.floor((5 + Math.random() * 15) * baseMultiplier * preference);
        
        if (baseValue > 0) {
            stats[stat] = baseValue;
        }
    }
    
    return stats;
}

export function getSlotStatPreferences(slot: EquipmentSlot): Partial<Record<keyof GameStats, number>> {
    switch (slot) {
        case 'weapon':
            return {
                attack: 1.5,
                agility: 1.2,
                intelligence: 1.2,
                health: 0.8,
                defense: 0.7
            };
        case 'armor':
            return {
                health: 1.5,
                defense: 1.4,
                mana: 1.1,
                attack: 0.7,
                agility: 0.8
            };
        case 'accessory':
            return {
                intelligence: 1.3,
                mana: 1.3,
                agility: 1.2,
                health: 1.1,
                attack: 1.1,
                defense: 1.1
            };
        default:
            return {};
    }
}

function generateItemName(slot: EquipmentSlot, rarity: EquipmentRarity, floor: number): string {
    const prefixes = getItemPrefixes(rarity, floor);
    const bases = getItemBases(slot);
    const suffixes = getItemSuffixes(rarity);
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const base = bases[Math.floor(Math.random() * bases.length)];
    const suffix = Math.random() > 0.7 ? ` ${suffixes[Math.floor(Math.random() * suffixes.length)]}` : '';
    
    return `${prefix} ${base}${suffix}`;
}

export function getItemPrefixes(rarity: EquipmentRarity, floor: number): string[] {
    const basePrefixes = {
        common: ['Worn', 'Simple', 'Basic', 'Plain', 'Crude'],
        uncommon: ['Sturdy', 'Fine', 'Quality', 'Improved', 'Enhanced'],
        rare: ['Superior', 'Masterwork', 'Exceptional', 'Refined', 'Pristine'],
        epic: ['Legendary', 'Mythical', 'Heroic', 'Fabled', 'Renowned'],
        legendary: ['Godlike', 'Divine', 'Transcendent', 'Eternal', 'Omnipotent']
    };
    
    const floorPrefixes = [];
    if (floor >= 100) floorPrefixes.push('Abyssal', 'Void-touched', 'Reality-warped');
    else if (floor >= 50) floorPrefixes.push('Deep', 'Ancient', 'Forgotten');
    else if (floor >= 25) floorPrefixes.push('Mysterious', 'Enchanted', 'Arcane');
    
    return [...basePrefixes[rarity], ...floorPrefixes];
}

export function getItemBases(slot: EquipmentSlot): string[] {
    switch (slot) {
        case 'weapon':
            return ['Blade', 'Sword', 'Axe', 'Mace', 'Staff', 'Bow', 'Dagger', 'Hammer', 'Spear', 'Wand'];
        case 'armor':
            return ['Armor', 'Plate', 'Mail', 'Vest', 'Robe', 'Cloak', 'Tunic', 'Garb', 'Vestment', 'Harness'];
        case 'accessory':
            return ['Ring', 'Amulet', 'Pendant', 'Charm', 'Talisman', 'Medallion', 'Brooch', 'Circlet', 'Band', 'Ornament'];
        default:
            return ['Item'];
    }
}

export function getItemSuffixes(rarity: EquipmentRarity): string[] {
    const suffixes = {
        common: ['of Durability', 'of Stability', 'of Endurance'],
        uncommon: ['of Power', 'of Skill', 'of Fortune', 'of Vigor'],
        rare: ['of Excellence', 'of Mastery', 'of Supremacy', 'of Glory'],
        epic: ['of the Champion', 'of the Hero', 'of the Legend', 'of Destiny'],
        legendary: ['of the Gods', 'of Eternity', 'of Transcendence', 'of Omnipotence']
    };
    
    return suffixes[rarity];
}

export function calculateItemPrice(targetLevel: number, rarity: EquipmentRarity): number {
    const basePrice = 20;
    const levelMultiplier = Math.max(1, targetLevel / 2);
    const rarityMultiplier = RARITY_MULTIPLIER[rarity];
    
    return Math.floor(basePrice * levelMultiplier * rarityMultiplier);
}

function weightedRandomSelect<T extends string>(weights: Record<T, number>): T {
    const totalWeight = Object.values(weights).reduce((sum: number, weight) => sum + (weight as number), 0);
    let random = Math.random() * totalWeight;
    
    for (const [item, weight] of Object.entries(weights) as [T, number][]) {
        random -= weight;
        if (random <= 0) {
            return item;
        }
    }
    
    return Object.keys(weights)[0] as T;
}
