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
    },
    'archmage_artifacts_set': {
        id: 'archmage_artifacts_set',
        name: "Archmage's Artifacts",
        bonuses: {
            2: { intelligence: 75, mana: 150 },
            3: { intelligence: 100, mana: 250, attack: 50 },
            4: { intelligence: 150, mana: 400, attack: 75, health: 150 }
        }
    },
    'dragonslayer_set': {
        id: 'dragonslayer_set',
        name: "Dragonslayer's Battlegear",
        bonuses: {
            2: { attack: 75, health: 200 },
            3: { attack: 100, health: 300, defense: 50 },
            4: { attack: 150, health: 500, defense: 75, agility: 20 }
        }
    },
    'shadowblade_rogue_set': {
        id: 'shadowblade_rogue_set',
        name: "Shadowblade's Assassin Gear",
        bonuses: {
            2: { agility: 75, attack: 50 },
            3: { agility: 100, attack: 75, defense: 30 },
            4: { agility: 150, attack: 100, defense: 50, health: 100 }
        }
    },
    'divine_protector_vestments': {
        id: 'divine_protector_vestments',
        name: "Divine Protector's Vestments",
        bonuses: {
            2: { defense: 10, intelligence: 10 },
            3: { health: 75, mana: 50 },
            4: { intelligence: 20, mana: 75, health: 50 },
        },
    },
};
