import { Dungeon } from '../types';
import { DUNGEONS } from '../data/dungeons';
import { ALL_MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';

export const getSortedDungeonsByLevel = (): Dungeon[] => {
    const sortedDungeons = [...DUNGEONS].sort((a, b) => a.levelRequirement - b.levelRequirement);
    return sortedDungeons;
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