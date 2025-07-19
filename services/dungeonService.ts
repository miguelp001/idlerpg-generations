import { Dungeon } from '../types';
import { DUNGEONS } from '../data/dungeons';
import { ALL_MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';

export const getSortedDungeonsByLevel = (): Dungeon[] => {
    const sortedDungeons = [...DUNGEONS].sort((a, b) => a.levelRequirement - b.levelRequirement);
    return sortedDungeons;
};

export const getBestAvailableDungeon = (characterLevel: number, currentDungeonId?: string, characterHealthPercent?: number): Dungeon | null => {
    const availableDungeons = getSortedDungeonsByLevel().filter(dungeon => 
        dungeon.levelRequirement <= characterLevel + 5 // Allow dungeons up to 5 levels above character
    );
    
    if (availableDungeons.length === 0) return null;
    
    // If we have a current dungeon, find the next higher level dungeon
    if (currentDungeonId) {
        const currentDungeon = availableDungeons.find(d => d.id === currentDungeonId);
        if (currentDungeon) {
            const higherDungeons = availableDungeons.filter(d => d.levelRequirement > currentDungeon.levelRequirement);
            if (higherDungeons.length > 0) {
                // Be more conservative when switching to higher level dungeons
                // Only switch if character health is above 80% or if the level difference is small
                const nextDungeon = higherDungeons.sort((a, b) => a.levelRequirement - b.levelRequirement)[0];
                const levelDifference = nextDungeon.levelRequirement - currentDungeon.levelRequirement;
                
                // If character health is low or level difference is large, stick with current dungeon
                if (characterHealthPercent !== undefined && characterHealthPercent < 0.8 && levelDifference > 2) {
                    return currentDungeon;
                }
                
                return nextDungeon;
            }
        }
    }
    
    // If no current dungeon or no higher dungeons available, return the highest level dungeon the character can access
    return availableDungeons[availableDungeons.length - 1];
};

export function validateAllDungeons() {
    let errors: string[] = [];
    for (const dungeon of DUNGEONS) {
        // Check monsters
        for (const monsterId of dungeon.monsters) {
            if (!ALL_MONSTERS[monsterId]) {
                errors.push(`Dungeon ${dungeon.id} (${dungeon.name}) has invalid monster ID: ${monsterId}`);
            }
        }
        // Check boss
        if (!ALL_MONSTERS[dungeon.boss]) {
            errors.push(`Dungeon ${dungeon.id} (${dungeon.name}) has invalid boss ID: ${dungeon.boss}`);
        }
        // Check lootTable
        for (const itemId of dungeon.lootTable) {
            if (!ITEMS[itemId]) {
                errors.push(`Dungeon ${dungeon.id} (${dungeon.name}) has invalid loot item ID: ${itemId}`);
            }
        }
    }
    if (errors.length === 0) {
        console.log('All dungeons validated successfully!');
    } else {
        console.error('Dungeon validation errors found:');
        for (const err of errors) {
            console.error(err);
        }
    }
    return errors;
} 