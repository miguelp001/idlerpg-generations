import { ItemSet } from '../types';

export const SETS: { [id: string]: ItemSet } = {
    'goblin_chief_set': {
        id: 'goblin_chief_set',
        name: "Goblin Chief's Regalia",
        bonuses: {
            2: { attack: 5, health: 20 }
        }
    },
    'shadow_garb': {
        id: 'shadow_garb',
        name: "Shadow Walker's Garb",
        bonuses: {
            2: { agility: 10 },
            3: { agility: 10, attack: 10 }
        }
    },
    'acolyte_vestments': {
        id: 'acolyte_vestments',
        name: "Acolyte's Vestments",
        bonuses: {
            2: { intelligence: 10 },
            3: { intelligence: 10, mana: 50 }
        }
    },
    'firelord_set': {
        id: 'firelord_set',
        name: "Firelord's Regalia",
        bonuses: {
            2: { attack: 20, intelligence: 20, health: 100 }
        }
    },
    'celestial_set': {
        id: 'celestial_set',
        name: "Celestial Vestments",
        bonuses: {
            2: { defense: 50, intelligence: 50 },
            3: { defense: 50, intelligence: 50, mana: 200 }
        }
    },
    'kingslayer_set': {
        id: 'kingslayer_set',
        name: "Kingslayer's Battlegear",
        bonuses: {
            2: { attack: 50, agility: 50 },
        }
    }
};
