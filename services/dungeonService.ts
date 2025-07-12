import { Dungeon } from '../types';
import { DUNGEONS } from '../data/dungeons';

export const getSortedDungeonsByLevel = (): Dungeon[] => {
    const sortedDungeons = [...DUNGEONS].sort((a, b) => a.levelRequirement - b.levelRequirement);
    return sortedDungeons;
}; 