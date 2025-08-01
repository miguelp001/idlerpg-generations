import { Equipment } from '../types';

export type ItemDefinition = Omit<Equipment, 'id' | 'baseId' | 'upgradeLevel' | 'baseName' | 'price'> & { levelRequirement?: number };

const WARRIOR_AFFINITY = { warrior: 1.0, rogue: 0.7, cleric: 0.8, mage: 0.1 };
const MAGE_AFFINITY = { mage: 1.0, cleric: 0.7, warrior: 0.1, rogue: 0.2 };
const ROGUE_AFFINITY = { rogue: 1.0, warrior: 0.6, cleric: 0.4, mage: 0.3 };
const CLERIC_AFFINITY = { cleric: 1.0, mage: 0.6, warrior: 0.7, rogue: 0.3 };
const UNIVERSAL_AFFINITY = { warrior: 1.0, mage: 1.0, rogue: 1.0, cleric: 1.0 };


export const ITEMS: { [id: string]: ItemDefinition } = {
    // Original Items
    'rusty_dagger': {
        name: 'Rusty Dagger',
        slot: 'weapon',
        rarity: 'common',
        stats: { attack: 2 },
        classAffinity: { rogue: 1.0, warrior: 0.8, cleric: 0.5, mage: 0.2 },
        levelRequirement: 1,
    },
    'tattered_cowl': {
        name: 'Tattered Cowl',
        slot: 'armor',
        rarity: 'common',
        stats: { defense: 1, intelligence: 1 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 1,
    },
    'chiefs_cleaver': {
        name: "Chief's Cleaver",
        slot: 'weapon',
        rarity: 'uncommon',
        stats: { attack: 5, health: 10 },
        classAffinity: WARRIOR_AFFINITY,
        setId: 'goblin_chief_set',
        levelRequirement: 2,
    },
    'chiefs_shoulder_guards': {
        name: "Chief's Shoulder Guards",
        slot: 'armor',
        rarity: 'uncommon',
        stats: { defense: 8, attack: 2 },
        classAffinity: WARRIOR_AFFINITY,
        setId: 'goblin_chief_set',
        levelRequirement: 2,
    },
    'firelords_blade': {
        name: "Firelord's Blade",
        slot: 'weapon',
        rarity: 'epic',
        stats: { attack: 50, health: 100 },
        classAffinity: UNIVERSAL_AFFINITY,
        setId: 'firelord_set',
        levelRequirement: 15,
    },
    'crown_of_embers': {
        name: "Crown of Embers",
        slot: 'armor',
        rarity: 'epic',
        stats: { defense: 25, mana: 150 },
        classAffinity: UNIVERSAL_AFFINITY,
        setId: 'firelord_set',
        levelRequirement: 15,
    },
    'razorvanes_heart': {
        name: "Razorvane's Heart",
        slot: 'accessory',
        rarity: 'legendary',
        stats: { health: 500, attack: 25, defense: 25 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 20,
    },

    // --- New & Updated Items ---

    // Common (15)
    'cracked_leather_gloves': { name: 'Cracked Leather Gloves', slot: 'armor', rarity: 'common', stats: { defense: 1 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 1 },
    'splintered_shortbow': { name: 'Splintered Shortbow', slot: 'weapon', rarity: 'common', stats: { attack: 2, agility: 1 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 1 },
    'faded_wizard_hat': { name: 'Faded Wizard Hat', slot: 'armor', rarity: 'common', stats: { mana: 5 }, classAffinity: MAGE_AFFINITY, levelRequirement: 1 },
    'chipped_beads': { name: 'Chipped Beads', slot: 'accessory', rarity: 'common', stats: { intelligence: 1 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'iron_bangle': { name: 'Iron Bangle', slot: 'accessory', rarity: 'common', stats: { health: 5 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'peasant_tunic': { name: 'Peasant Tunic', slot: 'armor', rarity: 'common', stats: { health: 10 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'gnarled_walking_stick': { name: 'Gnarled Walking Stick', slot: 'weapon', rarity: 'common', stats: { intelligence: 2 }, classAffinity: MAGE_AFFINITY, levelRequirement: 1 },
    'dented_pot_lid': { name: 'Dented Pot Lid', slot: 'accessory', rarity: 'common', stats: { defense: 2 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'roughspun_trousers': { name: 'Roughspun Trousers', slot: 'armor', rarity: 'common', stats: { defense: 1, agility: 1 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'old_club': { name: 'Old Club', slot: 'weapon', rarity: 'common', stats: { attack: 3 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 1 },
    'lucky_rabbit_foot': { name: 'Lucky Rabbit Foot', slot: 'accessory', rarity: 'common', stats: { agility: 1 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'canvas_belt': { name: 'Canvas Belt', slot: 'accessory', rarity: 'common', stats: { health: 8 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'worn_boots': { name: 'Worn Boots', slot: 'armor', rarity: 'common', stats: { agility: 1, defense: 1 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'simple_ring': { name: 'Simple Ring', slot: 'accessory', rarity: 'common', stats: { mana: 3 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },
    'sharpened_rock': { name: 'Sharpened Rock', slot: 'weapon', rarity: 'common', stats: { attack: 1 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 1 },

    // Uncommon (30)
    'studded_leather_vest': { name: 'Studded Leather Vest', slot: 'armor', rarity: 'uncommon', stats: { defense: 8, agility: 2 }, classAffinity: ROGUE_AFFINITY, setId: 'shadow_garb', levelRequirement: 3 },
    'hunters_longbow': { name: 'Hunter\'s Longbow', slot: 'weapon', rarity: 'uncommon', stats: { attack: 8, agility: 5 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 4 },
    'acolyte_staff': { name: 'Acolyte Staff', slot: 'weapon', rarity: 'uncommon', stats: { intelligence: 8, mana: 20 }, classAffinity: MAGE_AFFINITY, setId: 'acolyte_vestments', levelRequirement: 3 },
    'warriors_broadsword': { name: 'Warrior\'s Broadsword', slot: 'weapon', rarity: 'uncommon', stats: { attack: 10, health: 15 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 4 },
    'ring_of_protection': { name: 'Ring of Protection', slot: 'accessory', rarity: 'uncommon', stats: { defense: 5 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 3 },
    'amulet_of_wisdom': { name: 'Amulet of Wisdom', slot: 'accessory', rarity: 'uncommon', stats: { intelligence: 5, mana: 10 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 3 },
    'boots_of_speed': { name: 'Boots of Speed', slot: 'armor', rarity: 'uncommon', stats: { agility: 7 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 5 },
    'iron_greaves': { name: 'Iron Greaves', slot: 'armor', rarity: 'uncommon', stats: { defense: 10, health: 5 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 5 },
    'cleric_mace': { name: 'Cleric Mace', slot: 'weapon', rarity: 'uncommon', stats: { attack: 7, intelligence: 3 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 4 },
    'thiefs_bandana': { name: 'Thief\'s Bandana', slot: 'armor', rarity: 'uncommon', stats: { agility: 4, defense: 2 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 3 },
    'glowing_crystal': { name: 'Glowing Crystal', slot: 'accessory', rarity: 'uncommon', stats: { mana: 25 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 4 },
    'orcish_choppa': { name: 'Orcish Choppa', slot: 'weapon', rarity: 'uncommon', stats: { attack: 12 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 6 },
    'chainmail_coif': { name: 'Chainmail Coif', slot: 'armor', rarity: 'uncommon', stats: { defense: 9 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 5 },
    'trollhide_belt': { name: 'Trollhide Belt', slot: 'accessory', rarity: 'uncommon', stats: { health: 30, defense: 2 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 6 },
    'enchanted_quiver': { name: 'Enchanted Quiver', slot: 'accessory', rarity: 'uncommon', stats: { agility: 5, attack: 2 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 5 },
    'sorcerers_robes': { name: 'Sorcerer\'s Robes', slot: 'armor', rarity: 'uncommon', stats: { intelligence: 6, mana: 15 }, classAffinity: MAGE_AFFINITY, levelRequirement: 5 },
    'steel_gauntlets': { name: 'Steel Gauntlets', slot: 'armor', rarity: 'uncommon', stats: { attack: 2, defense: 6 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 4 },
    'battle_harness': { name: 'Battle Harness', slot: 'accessory', rarity: 'uncommon', stats: { health: 20, attack: 3 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 6 },
    'poisoned_stiletto': { name: 'Poisoned Stiletto', slot: 'weapon', rarity: 'uncommon', stats: { attack: 8, agility: 3 }, classAffinity: ROGUE_AFFINITY, setId: 'shadow_garb', levelRequirement: 3 },
    'healing_charm': { name: 'Healing Charm', slot: 'accessory', rarity: 'uncommon', stats: { health: 10, intelligence: 4 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 4 },
    'kobold_pickaxe': { name: 'Kobold Pickaxe', slot: 'weapon', rarity: 'uncommon', stats: { attack: 9 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 3 },
    'spider_silk_cape': { name: 'Spider Silk Cape', slot: 'armor', rarity: 'uncommon', stats: { agility: 5, defense: 3 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 4 },
    'serpents_eye_ring': { name: 'Serpent\'s Eye Ring', slot: 'accessory', rarity: 'uncommon', stats: { agility: 6 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 5 },
    'holy_symbol': { name: 'Holy Symbol', slot: 'accessory', rarity: 'uncommon', stats: { intelligence: 7 }, classAffinity: CLERIC_AFFINITY, setId: 'acolyte_vestments', levelRequirement: 3 },
    'gnoll_bone_armor': { name: 'Gnoll Bone Armor', slot: 'armor', rarity: 'uncommon', stats: { defense: 12 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 6 },
    'barbarian_axe': { name: 'Barbarian Axe', slot: 'weapon', rarity: 'uncommon', stats: { attack: 11, health: 5 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 5 },
    'sandals_of_the_oasis': { name: 'Sandals of the Oasis', slot: 'armor', rarity: 'uncommon', stats: { mana: 10, agility: 4 }, classAffinity: MAGE_AFFINITY, levelRequirement: 4 },
    'reinforced_tower_shield': { name: 'Reinforced Tower Shield', slot: 'accessory', rarity: 'uncommon', stats: { defense: 10 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 6 },
    'warlock_pendant': { name: 'Warlock Pendant', slot: 'accessory', rarity: 'uncommon', stats: { intelligence: 6, attack: 2 }, classAffinity: MAGE_AFFINITY, levelRequirement: 5 },
    'dwarven_hammer': { name: 'Dwarven Hammer', slot: 'weapon', rarity: 'uncommon', stats: { attack: 10, defense: 2 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 6 },
    'shadow_mask': { name: 'Shadow Mask', slot: 'armor', rarity: 'uncommon', stats: { agility: 6, defense: 3 }, classAffinity: ROGUE_AFFINITY, setId: 'shadow_garb', levelRequirement: 3 },
    'acolyte_gloves': { name: 'Acolyte Gloves', slot: 'armor', rarity: 'uncommon', stats: { intelligence: 4, defense: 2 }, classAffinity: MAGE_AFFINITY, setId: 'acolyte_vestments', levelRequirement: 3 },
    
    // Rare (30)
    'elven_chainmail': { name: 'Elven Chainmail', slot: 'armor', rarity: 'rare', stats: { defense: 20, agility: 10 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 8 },
    'greatsword_of_valor': { name: 'Greatsword of Valor', slot: 'weapon', rarity: 'rare', stats: { attack: 25, health: 50 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 9 },
    'staff_of_lightning': { name: 'Staff of Lightning', slot: 'weapon', rarity: 'rare', stats: { intelligence: 20, mana: 50 }, classAffinity: MAGE_AFFINITY, levelRequirement: 8 },
    'shadow_cloak': { name: 'Shadow Cloak', slot: 'armor', rarity: 'rare', stats: { agility: 18, defense: 12 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 10 },
    'ring_of_regeneration': { name: 'Ring of Regeneration', slot: 'accessory', rarity: 'rare', stats: { health: 100 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 7 },
    'amulet_of_power': { name: 'Amulet of Power', slot: 'accessory', rarity: 'rare', stats: { attack: 10, intelligence: 10 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 7 },
    'dragonhide_boots': { name: 'Dragonhide Boots', slot: 'armor', rarity: 'rare', stats: { defense: 15, agility: 8 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 9 },
    'plate_helm_of_command': { name: 'Plate Helm of Command', slot: 'armor', rarity: 'rare', stats: { defense: 22, health: 30 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 10 },
    'blessed_warhammer': { name: 'Blessed Warhammer', slot: 'weapon', rarity: 'rare', stats: { attack: 22, intelligence: 10 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 8 },
    'daggers_of_silence': { name: 'Daggers of Silence', slot: 'weapon', rarity: 'rare', stats: { attack: 18, agility: 15 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 9 },
    'orb_of_winter': { name: 'Orb of Winter', slot: 'accessory', rarity: 'rare', stats: { intelligence: 18, mana: 40 }, classAffinity: MAGE_AFFINITY, levelRequirement: 11 },
    'golem_fist': { name: 'Golem Fist', slot: 'weapon', rarity: 'rare', stats: { attack: 30, defense: 5 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 12 },
    'phoenix_down_mantle': { name: 'Phoenix Down Mantle', slot: 'armor', rarity: 'rare', stats: { defense: 18, health: 50 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 10 },
    'giants_belt': { name: 'Giant\'s Belt', slot: 'accessory', rarity: 'rare', stats: { health: 120, attack: 5 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 11 },
    'runic_longbow': { name: 'Runic Longbow', slot: 'weapon', rarity: 'rare', stats: { attack: 20, agility: 12, intelligence: 5 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 12 },
    'archmage_robes': { name: 'Archmage Robes', slot: 'armor', rarity: 'rare', stats: { intelligence: 15, mana: 80, defense: 10 }, classAffinity: MAGE_AFFINITY, levelRequirement: 11 },
    'vampiric_gauntlets': { name: 'Vampiric Gauntlets', slot: 'armor', rarity: 'rare', stats: { attack: 8, health: 40 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 9 },
    'sentinels_emblem': { name: 'Sentinel\'s Emblem', slot: 'accessory', rarity: 'rare', stats: { defense: 18, health: 60 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 12 },
    'blade_of_the_assassin': { name: 'Blade of the Assassin', slot: 'weapon', rarity: 'rare', stats: { attack: 22, agility: 18 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 10 },
    'libram_of_souls': { name: 'Libram of Souls', slot: 'accessory', rarity: 'rare', stats: { intelligence: 20, health: -20 }, classAffinity: MAGE_AFFINITY, levelRequirement: 13 },
    'minotaur_labrys': { name: 'Minotaur Labrys', slot: 'weapon', rarity: 'rare', stats: { attack: 28, defense: -5 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 14 },
    'wyvern_scale_shield': { name: 'Wyvern Scale Shield', slot: 'accessory', rarity: 'rare', stats: { defense: 25, agility: 5 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 13 },
    'diadem_of_the_savant': { name: 'Diadem of the Savant', slot: 'armor', rarity: 'rare', stats: { intelligence: 16, mana: 30 }, classAffinity: MAGE_AFFINITY, levelRequirement: 10 },
    'stormcallers_focus': { name: 'Stormcaller\'s Focus', slot: 'accessory', rarity: 'rare', stats: { intelligence: 22 }, classAffinity: MAGE_AFFINITY, levelRequirement: 14 },
    'earthshaker_maul': { name: 'Earthshaker Maul', slot: 'weapon', rarity: 'rare', stats: { attack: 35 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 15 },
    'robes_of_the_oracle': { name: 'Robes of the Oracle', slot: 'armor', rarity: 'rare', stats: { intelligence: 18, health: 40 }, classAffinity: CLERIC_AFFINITY, levelRequirement: 13 },
    'ring_of_the_marksman': { name: 'Ring of the Marksman', slot: 'accessory', rarity: 'rare', stats: { agility: 15, attack: 5 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 14 },
    'tome_of_forbidden_knowledge': { name: 'Tome of Forbidden Knowledge', slot: 'accessory', rarity: 'rare', stats: { intelligence: 25 }, classAffinity: MAGE_AFFINITY, levelRequirement: 15 },
    'spiders_fang_dagger': { name: 'Spider\'s Fang Dagger', slot: 'weapon', rarity: 'rare', stats: { attack: 20, agility: 10 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 13 },
    'guardian_plate': { name: 'Guardian Plate', slot: 'armor', rarity: 'rare', stats: { defense: 30, health: 50 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 14 },

    // Epic (15)
    'dragonscale_armor': { name: 'Dragonscale Armor', slot: 'armor', rarity: 'epic', stats: { defense: 50, health: 150 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 18 },
    'frostmourne_replica': { name: 'Frostmourne Replica', slot: 'weapon', rarity: 'epic', stats: { attack: 60, intelligence: 25, health: 100 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 20 },
    'staff_of_the_archon': { name: 'Staff of the Archon', slot: 'weapon', rarity: 'epic', stats: { intelligence: 70, mana: 200 }, classAffinity: MAGE_AFFINITY, levelRequirement: 19 },
    'voidwalkers_shroud': { name: 'Voidwalker\'s Shroud', slot: 'armor', rarity: 'epic', stats: { agility: 50, defense: 30, mana: 50 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 21 },
    'heart_of_the_phoenix': { name: 'Heart of the Phoenix', slot: 'accessory', rarity: 'epic', stats: { health: 300, defense: 20 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 17 },
    'band_of_elemental_mastery': { name: 'Band of Elemental Mastery', slot: 'accessory', rarity: 'epic', stats: { attack: 20, intelligence: 40 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 18 },
    'boots_of_the_comet': { name: 'Boots of the Comet', slot: 'armor', rarity: 'epic', stats: { agility: 60, defense: 15 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 20 },
    'helm_of_the_behemoth': { name: 'Helm of the Behemoth', slot: 'armor', rarity: 'epic', stats: { defense: 45, health: 120, attack: 10 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 22 },
    'scepter_of_divinity': { name: 'Scepter of Divinity', slot: 'weapon', rarity: 'epic', stats: { attack: 40, intelligence: 60 }, classAffinity: CLERIC_AFFINITY, setId: 'celestial_set', levelRequirement: 19 },
    'soulreaver_daggers': { name: 'Soulreaver Daggers', slot: 'weapon', rarity: 'epic', stats: { attack: 45, agility: 45 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 20 },
    'eye_of_the_maelstrom': { name: 'Eye of the Maelstrom', slot: 'accessory', rarity: 'epic', stats: { intelligence: 50, attack: 15, agility: 15 }, classAffinity: MAGE_AFFINITY, levelRequirement: 23 },
    'world_serpent_buckle': { name: 'World Serpent Buckle', slot: 'accessory', rarity: 'epic', stats: { health: 250, defense: 25 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 24 },
    'sunfury_bow': { name: 'Sunfury Bow', slot: 'weapon', rarity: 'epic', stats: { attack: 55, agility: 30 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 22 },
    'titanforged_gauntlets': { name: 'Titanforged Gauntlets', slot: 'armor', rarity: 'epic', stats: { attack: 25, defense: 35 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 23 },
    'demonsoul_edge': { name: 'Demonsoul Edge', slot: 'weapon', rarity: 'epic', stats: { attack: 75, health: -50 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 25 },
    'heart_of_corruption': { name: 'Heart of Corruption', slot: 'accessory', rarity: 'epic', stats: { health: 150, attack: 15, intelligence: 15 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 24 },

    // Legendary (10)
    'thunderfury_blessed_blade': { name: 'Thunderfury, Blessed Blade', slot: 'weapon', rarity: 'legendary', stats: { attack: 100, agility: 75 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 30 },
    'atiyeh_greatstaff_of_the_guardian': { name: 'Atiyesh, Greatstaff of the Guardian', slot: 'weapon', rarity: 'legendary', stats: { intelligence: 120, mana: 300, health: 100 }, classAffinity: MAGE_AFFINITY, levelRequirement: 32 },
    'bulwark_of_azzinoth': { name: 'Bulwark of Azzinoth', slot: 'accessory', rarity: 'legendary', stats: { defense: 100, health: 500 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 35 },
    'shadowmourne': { name: 'Shadowmourne', slot: 'weapon', rarity: 'legendary', stats: { attack: 150, health: 200 }, classAffinity: WARRIOR_AFFINITY, levelRequirement: 40 },
    'vestments_of_the_celestial': { name: 'Vestments of the Celestial', slot: 'armor', rarity: 'legendary', stats: { defense: 80, intelligence: 80, mana: 250 }, classAffinity: CLERIC_AFFINITY, setId: 'celestial_set', levelRequirement: 33 },
    'thori_dal_the_stars_fury': { name: 'Thori\'dal, the Stars\' Fury', slot: 'weapon', rarity: 'legendary', stats: { attack: 90, agility: 120 }, classAffinity: ROGUE_AFFINITY, levelRequirement: 36 },
    'talisman_of_binding_shard': { name: 'Talisman of Binding Shard', slot: 'accessory', rarity: 'legendary', stats: { attack: 50, intelligence: 50, agility: 50 }, classAffinity: UNIVERSAL_AFFINITY, setId: 'celestial_set', levelRequirement: 38 },
    'kingslayers': { name: 'The Kingslayers', slot: 'weapon', rarity: 'legendary', stats: { attack: 80, agility: 100, defense: -20 }, classAffinity: ROGUE_AFFINITY, setId: 'kingslayer_set', levelRequirement: 42 },
    'aegis_of_the_world_forger': { name: 'Aegis of the World-Forger', slot: 'armor', rarity: 'legendary', stats: { defense: 120, health: 400 }, classAffinity: WARRIOR_AFFINITY, setId: 'kingslayer_set', levelRequirement: 45 },
    'eye_of_sargeras': { name: 'Eye of Sargeras', slot: 'accessory', rarity: 'legendary', stats: { intelligence: 150, health: -100 }, classAffinity: MAGE_AFFINITY, levelRequirement: 50 },
    'tears_of_olphia': { name: 'Tears of Olphia', slot: 'weapon', rarity: 'legendary', stats: { attack: 120, intelligence: 120, health: 300 }, classAffinity: UNIVERSAL_AFFINITY, levelRequirement: 50 },
    // Archmage's Artifacts Set (Level 50 Mage)
    'archmage_staff_of_aether': {
        name: 'Archmage Staff of Aether',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { intelligence: 80, mana: 250, attack: 20 },
        classAffinity: MAGE_AFFINITY,
        setId: 'archmage_artifacts_set',
        levelRequirement: 50,
    },
    'robe_of_the_cosmic_weaver': {
        name: 'Robe of the Cosmic Weaver',
        slot: 'armor',
        rarity: 'legendary',
        stats: { intelligence: 70, mana: 200, defense: 40, health: 80 },
        classAffinity: MAGE_AFFINITY,
        setId: 'archmage_artifacts_set',
        levelRequirement: 50,
    },
    'amulet_of_arcane_mastery': {
        name: 'Amulet of Arcane Mastery',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { intelligence: 50, mana: 150, health: 50 },
        classAffinity: MAGE_AFFINITY,
        setId: 'archmage_artifacts_set',
        levelRequirement: 50,
    },
    'ring_of_infinite_knowledge': {
        name: 'Ring of Infinite Knowledge',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { intelligence: 40, mana: 100, agility: 20 },
        classAffinity: MAGE_AFFINITY,
        setId: 'archmage_artifacts_set',
        levelRequirement: 50,
    },
    // Dragonslayer's Battlegear Set (Level 50 Warrior)
    'dragons_breath_greatsword': {
        name: 'Dragon\'s Breath Greatsword',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { attack: 100, health: 150, defense: 30 },
        classAffinity: WARRIOR_AFFINITY,
        setId: 'dragonslayer_set',
        levelRequirement: 50,
    },
    'dragonskin_plate_armor': {
        name: 'Dragonskin Plate Armor',
        slot: 'armor',
        rarity: 'legendary',
        stats: { defense: 80, health: 250, attack: 20 },
        classAffinity: WARRIOR_AFFINITY,
        setId: 'dragonslayer_set',
        levelRequirement: 50,
    },
    'girdle_of_dragon_might': {
        name: 'Girdle of Dragon Might',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { attack: 40, health: 100, defense: 20 },
        classAffinity: WARRIOR_AFFINITY,
        setId: 'dragonslayer_set',
        levelRequirement: 50,
    },
    'dragons_tooth_charm': {
        name: 'Dragon\'s Tooth Charm',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { attack: 30, health: 80, agility: 10 },
        classAffinity: WARRIOR_AFFINITY,
        setId: 'dragonslayer_set',
        levelRequirement: 50,
    },
    // Shadowblade's Assassin Gear Set (Level 50 Rogue)
    'shadowblade_daggers_of_venom': {
        name: 'Shadowblade Daggers of Venom',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { attack: 80, agility: 100 },
        classAffinity: ROGUE_AFFINITY,
        setId: 'shadowblade_rogue_set',
        levelRequirement: 50,
    },
    'shadow_silk_armor': {
        name: 'Shadow Silk Armor',
        slot: 'armor',
        rarity: 'legendary',
        stats: { agility: 90, defense: 30, health: 100 },
        classAffinity: ROGUE_AFFINITY,
        setId: 'shadowblade_rogue_set',
        levelRequirement: 50,
    },
    'cloak_of_obscurity': {
        name: 'Cloak of Obscurity',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { agility: 60, attack: 20, defense: 10 },
        classAffinity: ROGUE_AFFINITY,
        setId: 'shadowblade_rogue_set',
        levelRequirement: 50,
    },
    'ring_of_stealth': {
        name: 'Ring of Stealth',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { agility: 50, health: 50, mana: 50 },
        classAffinity: ROGUE_AFFINITY,
        setId: 'shadowblade_rogue_set',
        levelRequirement: 50,
    },
    // Divine Protector's Vestments Set (Level 50 Cleric)
    'staff_of_divine_light': {
        name: "Staff of Divine Light",
        slot: "weapon",
        rarity: "legendary",
        stats: { attack: 70, intelligence: 100, mana: 80 },
        setId: "divine_protector_vestments",
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 50,
    },
    'robe_of_sacred_threads': {
        name: "Robe of Sacred Threads",
        slot: "armor",
        rarity: "legendary",
        stats: { defense: 60, intelligence: 70, health: 120 },
        setId: "divine_protector_vestments",
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 50,
    },
    'blessed_amulet_of_faith': {
        name: "Blessed Amulet of Faith",
        slot: "accessory",
        rarity: "legendary",
        stats: { intelligence: 50, mana: 70, health: 80 },
        setId: "divine_protector_vestments",
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 50,
    },
    'ring_of_healing_prayers': {
        name: "Ring of Healing Prayers",
        slot: "accessory",
        rarity: "legendary",
        stats: { intelligence: 40, mana: 60, health: 100 },
        setId: "divine_protector_vestments",
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 50,
    },
    // Starting Gear Set (Level 1 Universal)
    'worn_sword': {
        name: "Worn Sword",
        slot: "weapon",
        rarity: "common",
        stats: { attack: 3 },
        setId: "starting_gear_set",
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 1,
    },
    'tattered_tunic': {
        name: "Tattered Tunic",
        slot: "armor",
        rarity: "common",
        stats: { defense: 2, health: 5 },
        setId: "starting_gear_set",
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 1,
    },
    'simple_pendant': {
        name: "Simple Pendant",
        slot: "accessory",
        rarity: "common",
        stats: { intelligence: 1, mana: 5 },
        setId: "starting_gear_set",
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 1,
    },
    'plain_ring': {
        name: "Plain Ring",
        slot: "accessory",
        rarity: "common",
        stats: { agility: 1, health: 3 },
        setId: "starting_gear_set",
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 1,
    },
    // Missing items from dungeon loot tables
    'acolyte_circlet': {
        name: 'Acolyte Circlet',
        slot: 'armor',
        rarity: 'uncommon',
        stats: { intelligence: 5, mana: 15 },
        classAffinity: CLERIC_AFFINITY,
        setId: 'acolyte_vestments',
        levelRequirement: 3,
    },
    'troll_club': {
        name: 'Troll Club',
        slot: 'weapon',
        rarity: 'rare',
        stats: { attack: 35, health: 50 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 14,
    },
    'ring_of_strength': {
        name: 'Ring of Strength',
        slot: 'accessory',
        rarity: 'rare',
        stats: { attack: 15, health: 30 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 14,
    },
    'gorgon_scales': {
        name: 'Gorgon Scales',
        slot: 'armor',
        rarity: 'rare',
        stats: { defense: 25, agility: -5 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 14,
    },
    'amulet_of_medusa': {
        name: 'Amulet of Medusa',
        slot: 'accessory',
        rarity: 'rare',
        stats: { intelligence: 20, agility: 10 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 14,
    },
    'giant_plate_armor': {
        name: 'Giant Plate Armor',
        slot: 'armor',
        rarity: 'epic',
        stats: { defense: 60, health: 200 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 15,
    },
    'flame_tongue_sword': {
        name: 'Flame Tongue Sword',
        slot: 'weapon',
        rarity: 'epic',
        stats: { attack: 55, intelligence: 20 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 15,
    },
    'vampiric_scepter': {
        name: 'Vampiric Scepter',
        slot: 'weapon',
        rarity: 'epic',
        stats: { attack: 45, intelligence: 30, health: 100 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 15,
    },
    'cloak_of_bat': {
        name: 'Cloak of Bat',
        slot: 'armor',
        rarity: 'epic',
        stats: { agility: 40, defense: 20 },
        classAffinity: ROGUE_AFFINITY,
        levelRequirement: 15,
    },
    'dragon_hide_armor': {
        name: 'Dragon Hide Armor',
        slot: 'armor',
        rarity: 'epic',
        stats: { defense: 55, health: 150, attack: 10 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 16,
    },
    'dragon_tooth_necklace': {
        name: 'Dragon Tooth Necklace',
        slot: 'accessory',
        rarity: 'epic',
        stats: { attack: 25, health: 80 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 16,
    },
    'lich_phylactery': {
        name: 'Lich Phylactery',
        slot: 'accessory',
        rarity: 'epic',
        stats: { intelligence: 60, mana: 200, health: -50 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 17,
    },
    'staff_of_necromancy': {
        name: 'Staff of Necromancy',
        slot: 'weapon',
        rarity: 'epic',
        stats: { intelligence: 70, mana: 150, attack: 30 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 17,
    },
    'demonic_greatsword': {
        name: 'Demonic Greatsword',
        slot: 'weapon',
        rarity: 'epic',
        stats: { attack: 80, health: -30 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 18,
    },
    'amulet_of_damnation': {
        name: 'Amulet of Damnation',
        slot: 'accessory',
        rarity: 'epic',
        stats: { attack: 30, intelligence: 30, health: -20 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 18,
    },
    'artifact_shard': {
        name: 'Artifact Shard',
        slot: 'accessory',
        rarity: 'epic',
        stats: { intelligence: 40, attack: 20, defense: 20 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 19,
    },
    'ancient_knowledge_tome': {
        name: 'Ancient Knowledge Tome',
        slot: 'accessory',
        rarity: 'epic',
        stats: { intelligence: 50, mana: 100 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 19,
    },
    'divine_essence': {
        name: 'Divine Essence',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { intelligence: 80, health: 200, mana: 200 },
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 20,
    },
    'celestial_armor': {
        name: 'Celestial Armor',
        slot: 'armor',
        rarity: 'legendary',
        stats: { defense: 70, intelligence: 60, health: 150 },
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 20,
    },
    'void_shrouded_blade': {
        name: 'Void Shrouded Blade',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { attack: 90, agility: 50, health: -40 },
        classAffinity: ROGUE_AFFINITY,
        levelRequirement: 21,
    },
    'abyssal_grimoire': {
        name: 'Abyssal Grimoire',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { intelligence: 100, mana: 300, health: -80 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 21,
    },
    'shadow_blade': {
        name: 'Shadow Blade',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { attack: 85, agility: 60 },
        classAffinity: ROGUE_AFFINITY,
        levelRequirement: 22,
    },
    'cloak_of_night': {
        name: 'Cloak of Night',
        slot: 'armor',
        rarity: 'legendary',
        stats: { agility: 70, defense: 40 },
        classAffinity: ROGUE_AFFINITY,
        levelRequirement: 22,
    },
    'madness_inducing_staff': {
        name: 'Madness Inducing Staff',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { intelligence: 110, attack: 40, health: -60 },
        classAffinity: MAGE_AFFINITY,
        levelRequirement: 23,
    },
    'cosmic_fragment': {
        name: 'Cosmic Fragment',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { intelligence: 90, attack: 30, agility: 30 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 23,
    },
    'infernal_greatsword': {
        name: 'Infernal Greatsword',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { attack: 130, health: 100 },
        classAffinity: WARRIOR_AFFINITY,
        levelRequirement: 24,
    },
    'ring_of_damnation': {
        name: 'Ring of Damnation',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { attack: 40, intelligence: 40, health: -30 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 24,
    },
    'divine_relic': {
        name: 'Divine Relic',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { intelligence: 120, health: 300, mana: 250 },
        classAffinity: CLERIC_AFFINITY,
        levelRequirement: 25,
    },
    'ascension_gem': {
        name: 'Ascension Gem',
        slot: 'accessory',
        rarity: 'legendary',
        stats: { attack: 50, intelligence: 50, agility: 50, defense: 50 },
        classAffinity: UNIVERSAL_AFFINITY,
        levelRequirement: 25,
    },
};
