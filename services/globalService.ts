import { MercenaryHeir, DungeonCorpse } from '../types';
import { API_URL } from '../constants';

export const getGlobalMercenaries = async (): Promise<MercenaryHeir[]> => {
    try {
        const response = await fetch(`${API_URL}/world/mercenaries`);
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return [];
};

export const saveGlobalMercenaries = async (mercenaries: MercenaryHeir[]) => {
    // Usually handled server-side now, but keeping for compatibility
};

export const getGlobalCorpses = async (): Promise<DungeonCorpse[]> => {
    try {
        const response = await fetch(`${API_URL}/world/corpses`);
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return [];
};

export const addMercenary = async (mercenary: MercenaryHeir) => {
    await fetch(`${API_URL}/world/mercenaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mercenary)
    });
};

export const addCorpse = async (corpse: DungeonCorpse) => {
    await fetch(`${API_URL}/world/corpses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpse)
    });
};

export const removeCorpse = async (corpseId: string) => {
    // Implementation for removing corpse via API
};

export const pruneCorpses = () => {
    // Handled by WorldDO tick now
};

export const updateMercenaryEarnings = async (mercenaryId: string, goldAmount: number) => {
     // Implementation for updating earnings via API
};
