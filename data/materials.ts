import { Material } from '../types';

export const MATERIALS: { [id: string]: Material } = {
    'iron_ore': {
        id: 'iron_ore',
        name: 'Iron Ore',
        rarity: 'common',
        description: 'A basic building block for equipment.'
    },
    'thick_hide': {
        id: 'thick_hide',
        name: 'Thick Hide',
        rarity: 'uncommon',
        description: 'Tough leather used for durable armor.'
    },
    'magic_essence': {
        id: 'magic_essence',
        name: 'Magic Essence',
        rarity: 'rare',
        description: 'Pulsing energy used to imbue items with power.'
    },
    'void_shard': {
        id: 'void_shard',
        name: 'Void Shard',
        rarity: 'epic',
        description: 'A crystalline fragment of pure darkness.'
    },
    'dragon_scale': {
        id: 'dragon_scale',
        name: 'Dragon Scale',
        rarity: 'legendary',
        description: 'One of the hardest materials known to exist.'
    }
};
