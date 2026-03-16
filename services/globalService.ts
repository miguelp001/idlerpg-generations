import { MercenaryHeir, DungeonCorpse } from '../types';

const MERCENARY_KEY = 'idlerpg_mercenaries';
const CORPSE_KEY = 'idlerpg_corpses';

export const getGlobalMercenaries = (): MercenaryHeir[] => {
    const data = localStorage.getItem(MERCENARY_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveGlobalMercenaries = (mercenaries: MercenaryHeir[]) => {
    localStorage.setItem(MERCENARY_KEY, JSON.stringify(mercenaries));
};

export const getGlobalCorpses = (): DungeonCorpse[] => {
    const data = localStorage.getItem(CORPSE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveGlobalCorpses = (corpses: DungeonCorpse[]) => {
    localStorage.setItem(CORPSE_KEY, JSON.stringify(corpses));
};

export const addMercenary = (mercenary: MercenaryHeir) => {
    const mercenaries = getGlobalMercenaries();
    const existingIndex = mercenaries.findIndex(m => m.id === mercenary.id);
    if (existingIndex > -1) {
        mercenaries[existingIndex] = mercenary;
    } else {
        mercenaries.push(mercenary);
    }
    saveGlobalMercenaries(mercenaries);
};

export const addCorpse = (corpse: DungeonCorpse) => {
    const corpses = getGlobalCorpses();
    corpses.push(corpse);
    saveGlobalCorpses(corpses);
};

export const removeCorpse = (corpseId: string) => {
    const corpses = getGlobalCorpses().filter(c => c.id !== corpseId);
    saveGlobalCorpses(corpses);
};

export const pruneCorpses = () => {
    const now = Date.now();
    const hourMs = 3600000;
    const corpses = getGlobalCorpses().filter(c => {
        const timestamp = new Date(c.timestamp).getTime();
        return now - timestamp < hourMs;
    });
    saveGlobalCorpses(corpses);
};

export const updateMercenaryEarnings = (mercenaryId: string, goldAmount: number) => {
    const mercenaries = getGlobalMercenaries();
    const index = mercenaries.findIndex(m => m.id === mercenaryId);
    if (index > -1) {
        mercenaries[index].totalEarned += goldAmount;
        saveGlobalMercenaries(mercenaries);
    }
};
