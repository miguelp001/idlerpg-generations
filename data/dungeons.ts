import { Dungeon } from '../types';

export const DUNGEONS: Dungeon[] = [
    // Level 1
    {
        id: 'dungeon_goblin_cave',
        name: 'Goblin Cave',
        description: 'A dark and damp cave teeming with pesky goblins. Rumor has it a brutish chief leads them.',
        levelRequirement: 1,
        monsters: ['goblin_scout', 'goblin_warrior', 'goblin_scout', 'goblin_scout', 'goblin_warrior', 'goblin_scout'],
        boss: 'goblin_chief',
        lootTable: ['rusty_dagger', 'tattered_cowl', 'chiefs_shoulder_guards'],
    },

    // Level 2
    {
        id: 'dungeon_rat_cellar',
        name: 'Rat-Infested Cellar',
        description: 'An old wine cellar now crawling with oversized, aggressive rats.',
        levelRequirement: 2,
        monsters: ['giant_rat', 'giant_rat', 'cave_bat', 'giant_rat', 'giant_rat', 'cave_bat'],
        boss: 'dire_wolf',
        lootTable: ['cracked_leather_gloves', 'chipped_beads'],
    },
    {
        id: 'dungeon_spider_woods',
        name: 'Tangled Spider Woods',
        description: 'The trees here are thick with webs, and their spinners are always hungry.',
        levelRequirement: 2,
        monsters: ['forest_spider', 'forest_spider', 'forest_spider', 'forest_spider', 'forest_spider', 'forest_spider'],
        boss: 'wild_boar',
        lootTable: ['splintered_shortbow', 'faded_wizard_hat'],
    },

    // Level 3
    {
        id: 'dungeon_kobold_mine',
        name: 'Kobold Mining Tunnel',
        description: 'These small creatures guard their territory fiercely. "You no take candle!"',
        levelRequirement: 3,
        monsters: ['kobold_miner', 'kobold_miner', 'giant_rat', 'kobold_miner', 'kobold_miner', 'giant_rat'],
        boss: 'bandit_thug',
        lootTable: ['iron_bangle', 'peasant_tunic'],
    },
    {
        id: 'dungeon_bandit_hideout',
        name: 'Bandit Hideout',
        description: 'A crude camp where local highwaymen stash their ill-gotten goods. Crimson Dawn cultists have been seen nearby.',
        levelRequirement: 3,
        monsters: ['bandit_thug', 'cultist_acolyte', 'dire_wolf', 'bandit_thug', 'cultist_acolyte', 'dire_wolf'],
        boss: 'bandit_thug', // A stronger one
        lootTable: ['gnarled_walking_stick', 'dented_pot_lid', 'shadow_mask'],
    },

    // Level 4
    {
        id: 'dungeon_boar_pen',
        name: 'Overgrown Boar Pen',
        description: 'A feral drove of boars have made this abandoned farm their own.',
        levelRequirement: 4,
        monsters: ['wild_boar', 'wild_boar', 'forest_spider', 'wild_boar', 'wild_boar', 'forest_spider'],
        boss: 'wild_boar',
        lootTable: ['roughspun_trousers', 'old_club'],
    },
    {
        id: 'dungeon_flooded_cave',
        name: 'Flooded Cave',
        description: 'Water drips from the ceiling, and strange, amphibious creatures lurk in the pools.',
        levelRequirement: 4,
        monsters: ['cave_bat', 'giant_rat', 'lizardfolk_warrior', 'cave_bat', 'giant_rat', 'lizardfolk_warrior'],
        boss: 'lizardfolk_warrior',
        lootTable: ['lucky_rabbit_foot', 'canvas_belt'],
    },

    // Level 5
    {
        id: 'dungeon_gnoll_outpost',
        name: 'Gnoll Scavenger Outpost',
        description: 'The cackling of hyena-men echoes from this crude, bone-strewn encampment.',
        levelRequirement: 5,
        monsters: ['gnoll_scavenger', 'gnoll_scavenger', 'dire_wolf', 'gnoll_scavenger', 'gnoll_scavenger', 'dire_wolf'],
        boss: 'gnoll_scavenger',
        lootTable: ['worn_boots', 'simple_ring'],
    },
    {
        id: 'dungeon_haunted_graveyard',
        name: 'Haunted Graveyard',
        description: 'The dead do not rest easy here. Skeletons claw their way from the earth.',
        levelRequirement: 5,
        monsters: ['skeleton_archer', 'zombie_shambler', 'skeleton_archer', 'skeleton_archer', 'zombie_shambler', 'skeleton_archer'],
        boss: 'ghoul',
        lootTable: ['sharpened_rock', 'studded_leather_vest', 'acolyte_circlet'],
    },
    {
        id: 'dungeon_wolf_den',
        name: 'The Wolf\'s Den',
        description: 'A massive pack of dire wolves are led by a particularly vicious alpha.',
        levelRequirement: 5,
        monsters: ['dire_wolf', 'dire_wolf', 'dire_wolf', 'dire_wolf', 'dire_wolf', 'dire_wolf'],
        boss: 'grizzly_bear',
        lootTable: ['hunters_longbow', 'acolyte_staff'],
    },
    {
        id: 'dungeon_ruined_watchtower',
        name: 'Ruined Watchtower',
        description: 'Gargoyles and harpies have claimed this crumbling stone tower, along with some strange robed figures.',
        levelRequirement: 5,
        monsters: ['harpy', 'cultist_acolyte', 'gnoll_scavenger', 'harpy', 'harpy', 'cultist_acolyte'],
        boss: 'harpy',
        lootTable: ['warriors_broadsword', 'ring_of_protection'],
    },

    // Level 6
    {
        id: 'dungeon_orcish_war_camp',
        name: 'Orcish War Camp',
        description: 'A forward camp for a larger orcish host. Full of grunts eager for battle.',
        levelRequirement: 6,
        monsters: ['orc_grunt', 'orc_grunt', 'gnoll_scavenger', 'orc_grunt', 'orc_grunt', 'gnoll_scavenger'],
        boss: 'orc_grunt',
        lootTable: ['amulet_of_wisdom', 'boots_of_speed'],
    },
    {
        id: 'dungeon_shambling_mound',
        name: 'Shambling Mound',
        description: 'The earth itself seems to move in this eerie, silent part of the swamp.',
        levelRequirement: 6,
        monsters: ['zombie_shambler', 'zombie_shambler', 'ghoul', 'zombie_shambler', 'zombie_shambler', 'ghoul'],
        boss: 'owlbear',
        lootTable: ['iron_greaves', 'cleric_mace'],
    },

    // Level 7
    {
        id: 'dungeon_owlbear_nest',
        name: 'Owlbear Nest',
        description: 'A clearing filled with the remains of hunters who got too close to the nest.',
        levelRequirement: 7,
        monsters: ['grizzly_bear', 'dire_wolf', 'owlbear', 'grizzly_bear', 'dire_wolf', 'owlbear'],
        boss: 'owlbear',
        lootTable: ['thiefs_bandana', 'glowing_crystal'],
    },
    {
        id: 'dungeon_crypt_of_the_restless',
        name: 'Crypt of the Restless',
        description: 'Ancient warriors, long dead, rise to defend their burial place.',
        levelRequirement: 7,
        monsters: ['skeleton_archer', 'ghoul', 'wight', 'skeleton_archer', 'ghoul', 'wight'],
        boss: 'wight',
        lootTable: ['orcish_choppa', 'chainmail_coif'],
    },

    // Level 8
    {
        id: 'dungeon_hobgoblin_barracks',
        name: 'Hobgoblin Barracks',
        description: 'A disciplined company of hobgoblins trains for war within this fortified structure.',
        levelRequirement: 8,
        monsters: ['hobgoblin_soldier', 'hobgoblin_soldier', 'orc_grunt', 'hobgoblin_soldier', 'hobgoblin_soldier', 'orc_grunt'],
        boss: 'hobgoblin_soldier',
        lootTable: ['trollhide_belt', 'enchanted_quiver'],
    },
    {
        id: 'dungeon_lizardfolk_marsh',
        name: 'Lizardfolk Marsh',
        description: 'The scaled hunters of the swamp defend their territory with primitive ferocity.',
        levelRequirement: 8,
        monsters: ['lizardfolk_warrior', 'lizardfolk_warrior', 'giant_scorpion', 'lizardfolk_warrior', 'lizardfolk_warrior', 'giant_scorpion'],
        boss: 'basilisk',
        lootTable: ['sorcerers_robes', 'steel_gauntlets'],
    },

    // Level 9
    {
        id: 'dungeon_scorpion_den',
        name: 'Scorpion Den',
        description: 'Giant, venomous arachnids scuttle through the sands of this desert cave.',
        levelRequirement: 9,
        monsters: ['giant_scorpion', 'giant_scorpion', 'harpy', 'giant_scorpion', 'giant_scorpion', 'harpy'],
        boss: 'giant_scorpion',
        lootTable: ['battle_harness', 'poisoned_stiletto'],
    },
    {
        id: 'dungeon_ogre_cavern',
        name: 'Ogre Cavern',
        description: 'A foul-smelling cavern home to a clan of dim-witted but powerful ogres.',
        levelRequirement: 9,
        monsters: ['ogre_brute', 'orc_grunt', 'ogre_brute', 'ogre_brute', 'orc_grunt', 'ogre_brute'],
        boss: 'cultist_champion',
        lootTable: ['healing_charm', 'kobold_pickaxe'],
    },

    // Level 10
    {
        id: 'dungeon_centaur_plains',
        name: 'Centaur Plains',
        description: 'The nomadic centaurs are wary of outsiders. Tread carefully.',
        levelRequirement: 10,
        monsters: ['centaur_archer', 'centaur_archer', 'grizzly_bear', 'centaur_archer', 'centaur_archer', 'grizzly_bear'],
        boss: 'centaur_archer',
        lootTable: ['spider_silk_cape', 'serpents_eye_ring'],
    },
    {
        id: 'dungeon_basilisk_canyon',
        name: 'Basilisk Canyon',
        description: 'Be careful where you look; the gaze of the beasts here can turn flesh to stone.',
        levelRequirement: 10,
        monsters: ['basilisk', 'giant_scorpion', 'lizardfolk_warrior', 'basilisk', 'giant_scorpion', 'lizardfolk_warrior'],
        boss: 'basilisk',
        lootTable: ['holy_symbol', 'gnoll_bone_armor'],
    },
    {
        id: 'dungeon_whispering_cairn',
        name: 'The Whispering Cairn',
        description: 'The wind howls with the voices of the dead. Spectres haunt this lonely hill.',
        levelRequirement: 10,
        monsters: ['spectre', 'wight', 'ghoul', 'spectre', 'wight', 'ghoul'],
        boss: 'spectre',
        lootTable: ['barbarian_axe', 'sandals_of_the_oasis', 'acolyte_gloves'],
    },

    // Level 11
    {
        id: 'dungeon_minotaur_maze',
        name: 'Minotaur\'s Maze',
        description: 'An ancient, high-walled maze where a hulking minotaur hunts its prey.',
        levelRequirement: 11,
        monsters: ['hobgoblin_soldier', 'ogre_brute', 'minotaur', 'hobgoblin_soldier', 'ogre_brute', 'minotaur'],
        boss: 'minotaur',
        lootTable: ['reinforced_tower_shield', 'warlock_pendant'],
    },
    {
        id: 'dungeon_elemental_shrine',
        name: 'Forgotten Elemental Shrine',
        description: 'A shrine where volatile lesser elementals have been bound.',
        levelRequirement: 11,
        monsters: ['lesser_fire_elemental', 'lesser_water_elemental', 'lesser_earth_elemental', 'lesser_fire_elemental', 'lesser_water_elemental', 'lesser_earth_elemental'],
        boss: 'lesser_fire_elemental',
        lootTable: ['dwarven_hammer', 'elven_chainmail'],
    },

    // Level 12
    {
        id: 'dungeon_harpy_peak',
        name: 'Harpy Peak',
        description: 'The shrieks of harpies echo from this high, windswept mountain peak.',
        levelRequirement: 12,
        monsters: ['harpy', 'harpy', 'centaur_archer', 'harpy', 'harpy', 'centaur_archer'],
        boss: 'air_elemental',
        lootTable: ['greatsword_of_valor', 'staff_of_lightning'],
    },

    // Level 13
    {
        id: 'dungeon_mummy_tomb',
        name: 'Tomb of the Mummy Lord',
        description: 'Ancient curses and bandaged horrors await in this forgotten desert tomb. Crimson Dawn champions have been spotted here.',
        levelRequirement: 13,
        monsters: ['mummy', 'spectre', 'cultist_champion', 'mummy', 'spectre', 'wight'],
        boss: 'mummy',
        lootTable: ['shadow_cloak', 'ring_of_regeneration'],
    },

    // Level 14
    {
        id: 'dungeon_troll_bridge',
        name: 'Troll Bridge',
        description: 'A massive troll demands a toll from any who would cross. It prefers payment in flesh.',
        levelRequirement: 14,
        monsters: ['troll_berserker', 'ogre_brute', 'orc_warlord', 'troll_berserker', 'ogre_brute', 'orc_warlord'],
        boss: 'troll_berserker',
        lootTable: ['troll_club', 'ring_of_strength'],
    },
    {
        id: 'dungeon_gorgon_cave',
        name: 'Gorgon\'s Lair',
        description: 'The air grows cold, and strange petrified statues line the path. Don\'t look them in the eye.',
        levelRequirement: 14,
        monsters: ['gorgon', 'basilisk', 'mummy', 'gorgon', 'basilisk', 'mummy'],
        boss: 'gorgon',
        lootTable: ['gorgon_scales', 'amulet_of_medusa'],
    },

    // Level 15
    {
        id: 'dungeon_fire_giant_forge',
        name: 'Fire Giant Forge',
        description: 'The heat is immense, and the clang of hammers echoes as massive fire giants craft their weapons.',
        levelRequirement: 15,
        monsters: ['fire_giant', 'fire_elemental', 'troll_berserker', 'fire_giant', 'fire_elemental', 'troll_berserker'],
        boss: 'fire_giant',
        lootTable: ['giant_plate_armor', 'flame_tongue_sword'],
    },
    {
        id: 'dungeon_vampire_castle',
        name: 'Vampire Lord\'s Castle',
        description: 'An ancient, decaying castle, home to a powerful vampire and their thralls.',
        levelRequirement: 15,
        monsters: ['vampire_spawn', 'spectre', 'ghoul', 'vampire_spawn', 'spectre', 'ghoul'],
        boss: 'vampire_lord',
        lootTable: ['vampiric_scepter', 'cloak_of_bat'],
    },

    // Level 16
    {
        id: 'dungeon_dragon_nest',
        name: 'Dragon\'s Nest',
        description: 'Mountains of gold and jewels, guarded by a slumbering dragon. Approach with extreme caution.',
        levelRequirement: 16,
        monsters: ['dragon_whelp', 'fire_giant', 'gorgon', 'dragon_whelp', 'fire_giant', 'gorgon'],
        boss: 'young_dragon',
        lootTable: ['dragon_hide_armor', 'dragon_tooth_necklace'],
    },

    // Level 17
    {
        id: 'dungeon_lich_crypt',
        name: 'Lich\'s Crypt',
        description: 'The air is thick with necromantic energy. This is the lair of an ancient lich.',
        levelRequirement: 17,
        monsters: ['lich_minion', 'wight', 'spectre', 'lich_minion', 'wight', 'spectre'],
        boss: 'lich',
        lootTable: ['lich_phylactery', 'staff_of_necromancy'],
    },

    // Level 18
    {
        id: 'dungeon_demon_portal',
        name: 'Demon Portal',
        description: 'A tear in reality, spewing forth horrors from the Abyss. Unspeakable evil dwells here.',
        levelRequirement: 18,
        monsters: ['demon_imp', 'demon_hound', 'demon_brute', 'demon_imp', 'demon_hound', 'demon_brute'],
        boss: 'demon_lord',
        lootTable: ['demonic_greatsword', 'amulet_of_damnation'],
    },

    // Level 19
    {
        id: 'dungeon_ancient_city',
        name: 'Ruins of an Ancient City',
        description: 'Long-lost secrets and powerful constructs guard the remnants of a fallen civilization.',
        levelRequirement: 19,
        monsters: ['ancient_construct', 'stone_golem', 'ancient_guardian', 'ancient_construct', 'stone_golem', 'ancient_guardian'],
        boss: 'ancient_guardian',
        lootTable: ['artifact_shard', 'ancient_knowledge_tome'],
    },

    // Level 20
    {
        id: 'dungeon_celestial_nexus',
        name: 'Celestial Nexus',
        description: 'A shimmering gateway to the heavens, guarded by powerful celestial beings.',
        levelRequirement: 20,
        monsters: ['celestial_watcher', 'celestial_guardian', 'celestial_champion', 'celestial_watcher', 'celestial_guardian', 'celestial_champion'],
        boss: 'celestial_avatar',
        lootTable: ['divine_essence', 'celestial_armor'],
    },

    // Level 21
    {
        id: 'dungeon_void_rift',
        name: 'Void Rift',
        description: 'Reality warps and shimmers here, where the very fabric of existence is tearing apart. Eldritch horrors spill forth.',
        levelRequirement: 21,
        monsters: ['void_spawn', 'void_fiend', 'void_abomination', 'void_spawn', 'void_fiend', 'void_abomination'],
        boss: 'void_lord',
        lootTable: ['void_shrouded_blade', 'abyssal_grimoire'],
    },

    // Level 22
    {
        id: 'dungeon_shadowfell_citadel',
        name: 'Shadowfell Citadel',
        description: 'A fortress of eternal night and despair, ruled by a master of shadows.',
        levelRequirement: 22,
        monsters: ['shadow_wraith', 'nightmare', 'shadow_assassin', 'shadow_wraith', 'nightmare', 'shadow_assassin'],
        boss: 'shadow_king',
        lootTable: ['shadow_blade', 'cloak_of_night'],
    },

    // Level 23
    {
        id: 'dungeon_cosmic_horror',
        name: 'Cosmic Horror\'s Domain',
        description: 'Beyond comprehension, a being of pure madness and cosmic power resides here, twisting minds and reality.',
        levelRequirement: 23,
        monsters: ['mind_flayer', 'beholder', 'aberrant_horror', 'mind_flayer', 'beholder', 'aberrant_horror'],
        boss: 'cosmic_entity',
        lootTable: ['madness_inducing_staff', 'cosmic_fragment'],
    },

    // Level 24
    {
        id: 'dungeon_infernal_abyss',
        name: 'Infernal Abyss',
        description: 'The deepest pits of hell, where arch-devils and demons wage eternal war.',
        levelRequirement: 24,
        monsters: ['arch_devil', 'pit_fiend', 'demon_titan', 'arch_devil', 'pit_fiend', 'demon_titan'],
        boss: 'satan',
        lootTable: ['infernal_greatsword', 'ring_of_damnation'],
    },

    // Level 25
    {
        id: 'dungeon_divine_ascension',
        name: 'Divine Ascension',
        description: 'The final trial. A path to true godhood, guarded by the most powerful beings in existence.',
        levelRequirement: 25,
        monsters: ['archangel', 'seraph', 'deity_fragment', 'archangel', 'seraph', 'deity_fragment'],
        boss: 'supreme_deity',
        lootTable: ['divine_relic', 'ascension_gem'],
    },

    // Level 28
    {
        id: 'dungeon_abyssal_rift',
        name: 'Abyssal Rift',
        description: 'A swirling vortex of chaos energy, guarded by the most powerful demons.',
        levelRequirement: 28,
        monsters: ['succubus', 'horned_devil', 'wraith', 'succubus', 'horned_devil', 'wraith'],
        boss: 'horned_devil',
        lootTable: ['world_serpent_buckle', 'sunfury_bow'],
    },

    // Level 30
    {
        id: 'dungeon_world_summit',
        name: 'Summit of the World',
        description: 'At the highest point of the world, ancient elementals and dragons vie for supremacy.',
        levelRequirement: 30,
        monsters: ['air_elemental', 'young_green_dragon', 'frost_giant', 'air_elemental', 'young_green_dragon', 'frost_giant'],
        boss: 'chimera',
        lootTable: ['titanforged_gauntlets', 'demonsoul_edge'],
    },

    // Level 31
    {
        id: 'dungeon_dragons_maw',
        name: 'Dragon\'s Maw',
        description: 'A cavern system so vast it is said to be the maw of a dead god-dragon.',
        levelRequirement: 31,
        monsters: ['young_green_dragon', 'drake_rider', 'fire_giant', 'young_green_dragon', 'drake_rider', 'fire_giant'],
        boss: 'hydra',
        lootTable: ['dragonscale_armor', 'frostmourne_replica']
    },

    // Level 32
    {
        id: 'dungeon_lich_phylactery',
        name: 'Lich\'s Phylactery',
        description: 'The inner sanctum where a powerful Lich guards its source of immortality.',
        levelRequirement: 32,
        monsters: ['lich_acolyte', 'wraith', 'horned_devil', 'lich_acolyte', 'wraith', 'horned_devil'],
        boss: 'lich_acolyte',
        lootTable: ['staff_of_the_archon', 'voidwalkers_shroud']
    },

    // Level 34
    {
        id: 'dungeon_titan_foundry',
        name: 'The Titan Foundry',
        description: 'An ancient forge where the very building blocks of the world were made.',
        levelRequirement: 34,
        monsters: ['iron_golem', 'fire_giant', 'earth_elemental', 'iron_golem', 'fire_giant', 'earth_elemental'],
        boss: 'iron_golem',
        lootTable: ['heart_of_the_phoenix', 'band_of_elemental_mastery']
    },

    // Level 35
    {
        id: 'dungeon_elemental_chaos',
        name: 'Plane of Elemental Chaos',
        description: 'A swirling vortex where all elements clash in a violent, unending storm.',
        levelRequirement: 35,
        monsters: ['fire_elemental', 'water_elemental', 'earth_elemental', 'air_elemental', 'fire_elemental', 'water_elemental', 'earth_elemental', 'air_elemental'],
        boss: 'chimera',
        lootTable: ['boots_of_the_comet', 'helm_of_the_behemoth'],
    },
    {
        id: 'dungeon_lair_firelord',
        name: 'Lair of the Firelord',
        description: "A quest-specific encounter. The Fire Lord Razorvane awaits within this molten chamber, his power corrupted by Olphia's influence.",
        levelRequirement: 35,
        monsters: ['fire_elemental', 'lesser_fire_elemental', 'fire_elemental', 'lesser_fire_elemental'],
        boss: 'firelord_razorvane',
        lootTable: ["firelords_blade", "crown_of_embers"],
    },

    // Level 36
    {
        id: 'dungeon_pit_of_the_damned',
        name: 'Pit of the Damned',
        description: 'A direct conduit to the lower planes, crawling with high-tier demons.',
        levelRequirement: 36,
        monsters: ['succubus', 'horned_devil', 'vampire_spawn', 'succubus', 'horned_devil', 'vampire_spawn'],
        boss: 'horned_devil',
        lootTable: ['scepter_of_divinity', 'soulreaver_daggers']
    },

    // Level 37
    {
        id: 'dungeon_lair_of_the_hydra',
        name: 'Lair of the Many-Headed',
        description: 'A sprawling, interconnected cave system where every tunnel seems to lead to another fanged maw.',
        levelRequirement: 37,
        monsters: ['hydra', 'chimera', 'hydra', 'hydra', 'chimera', 'hydra'],
        boss: 'hydra',
        lootTable: ['eye_of_the_maelstrom', 'world_serpent_buckle']
    },

    // Level 38
    {
        id: 'dungeon_giants_war',
        name: 'The Giant War',
        description: 'A frozen battlefield where the eternal war between Frost and Fire Giants rages.',
        levelRequirement: 38,
        monsters: ['frost_giant', 'fire_giant', 'frost_giant', 'frost_giant', 'fire_giant', 'frost_giant'],
        boss: 'fire_giant',
        lootTable: ['sunfury_bow', 'titanforged_gauntlets']
    },

    // Level 39
    {
        id: 'dungeon_dragons_roost',
        name: 'The Dragon\'s Roost',
        description: 'Multiple dragons of different colors vie for territory on this high, desolate peak.',
        levelRequirement: 39,
        monsters: ['young_green_dragon', 'wyvern', 'drake_rider', 'young_green_dragon', 'wyvern', 'drake_rider'],
        boss: 'young_green_dragon',
        lootTable: ['demonsoul_edge', 'razorvanes_heart']
    },

    // Level 40
    {
        id: 'dungeon_edge_of_reality',
        name: 'Edge of Reality',
        description: 'The last bastion before the void. The most powerful creatures are drawn here.',
        levelRequirement: 40,
        monsters: ['hydra', 'iron_golem', 'chimera', 'hydra', 'iron_golem', 'chimera'],
        boss: 'iron_golem',
        lootTable: ['thunderfury_blessed_blade', 'aegis_of_the_world_forger']
    },
    {
        id: 'dungeon_crypt_frost_lich',
        name: 'Crypt of the Frost Lich',
        description: "A quest-specific encounter. Koralon the Frost Lich reigns over this frozen tomb, his soul bound to Olphia's will.",
        levelRequirement: 40,
        monsters: ['lich_acolyte', 'wraith', 'lich_acolyte', 'wight'],
        boss: 'koralon_the_frost_lich',
        lootTable: ["frostmourne_replica", "orb_of_winter"],
    },

    // Level 45
    {
        id: 'dungeon_peak_stone_titan',
        name: 'Peak of the Stone Titan',
        description: "A quest-specific encounter. The ancient Stone Titan Terragor has been awakened and corrupted. It must be brought down.",
        levelRequirement: 45,
        monsters: ['earth_elemental', 'iron_golem', 'earth_elemental', 'iron_golem'],
        boss: 'terragor_the_stone_titan',
        lootTable: ["world_serpent_buckle", "golem_fist"],
    },

    // Level 50
    {
        id: 'dungeon_perch_sky_tyrant',
        name: 'Perch of the Sky Tyrant',
        description: "A quest-specific encounter. Aetherion, Tyrant of the Skies, commands a raging storm at Olphia's behest.",
        levelRequirement: 50,
        monsters: ['air_elemental', 'wyvern', 'drake_rider', 'air_elemental'],
        boss: 'aetherion_sky_tyrant',
        lootTable: ["staff_of_lightning", "stormcallers_focus"],
    },

    // Level 56
    {
        id: 'dungeon_trench_abyssal_horror',
        name: 'Trench of the Abyssal Horror',
        description: "A quest-specific encounter. In the crushing dark, Malakor, the Abyssal Horror, writhes with corrupting power.",
        levelRequirement: 56,
        monsters: ['water_elemental', 'hydra', 'succubus', 'horned_devil'],
        boss: 'malakor_abyssal_horror',
        lootTable: ["tome_of_forbidden_knowledge", "voidwalkers_shroud"],
    },

    // Level 62
    {
        id: 'dungeon_court_celestial_sentinel',
        name: 'Court of the Celestial Sentinel',
        description: "A quest-specific encounter. The once-pure light of Lumina has been twisted into a tool of despair.",
        levelRequirement: 62,
        monsters: ['vampire_spawn', 'wraith', 'spectre', 'wight'],
        boss: 'lumina_celestial_sentinel',
        lootTable: ["scepter_of_divinity", "blessed_warhammer"],
    },

    // Level 68
    {
        id: 'dungeon_sanctum_dread_king',
        name: 'Sanctum of the Dread King',
        description: "A quest-specific encounter. The Dread King Vexor revels in his newfound power, guarding a seal for his goddess.",
        levelRequirement: 68,
        monsters: ['lich_acolyte', 'wraith', 'lich_acolyte', 'wraith'],
        boss: 'vexor_the_dread_king',
        lootTable: ["kingslayers", "libram_of_souls"],
    },

    // Level 75
    {
        id: 'dungeon_crimson_sanctuary',
        name: 'Crimson Sanctuary',
        description: 'A hidden sanctuary where the Crimson Dawn trains its most elite champions.',
        levelRequirement: 75,
        monsters: ['cultist_champion', 'cultist_champion', 'cultist_champion', 'cultist_champion', 'cultist_champion'],
        boss: 'cultist_champion',
        lootTable: ['demonsoul_edge', 'heart_of_corruption'],
    },

    // Level 82
    {
        id: 'dungeon_prison_void_maw',
        name: 'Prison of the Void Maw',
        description: "A quest-specific encounter. Olphia has offered the world to Grommash, a being of endless hunger. Stop it before it devours everything.",
        levelRequirement: 82,
        monsters: ['horned_devil', 'chimera', 'horned_devil', 'hydra'],
        boss: 'grommash_the_void_maw',
        lootTable: ["greatsword_of_valor", "heart_of_the_phoenix"],
    },

    // Level 88
    {
        id: 'dungeon_foundry_automaton_prime',
        name: 'Foundry of the Automaton Prime',
        description: "A quest-specific encounter. The logic of Automaton Prime has been corrupted, its creations now instruments of despair.",
        levelRequirement: 88,
        monsters: ['iron_golem', 'iron_golem', 'iron_golem', 'iron_golem'],
        boss: 'automaton_prime',
        lootTable: ["bulwark_of_azzinoth", "titanforged_gauntlets"],
    },

    // Level 95
    {
        id: 'dungeon_timeless_conundrum',
        name: 'The Timeless Conundrum',
        description: "A quest-specific encounter. Chronos threatens to unravel history at Olphia's command. You must face him outside of time.",
        levelRequirement: 95,
        monsters: ['fire_giant', 'frost_giant', 'iron_golem', 'hydra'],
        boss: 'chronos_the_timeless',
        lootTable: ["atiyeh_greatstaff_of_the_guardian", "talisman_of_binding_shard"],
    },

    // Level 128
    {
        id: 'dungeon_weeping_chasm_final',
        name: 'The Weeping Chasm (Sanctum)',
        description: "The final confrontation. Olphia, the Fallen Goddess, awaits in the heart of her prison, guarded by her most powerful, corrupted lieutenants.",
        levelRequirement: 128,
        monsters: ['koralon_the_frost_lich', 'terragor_the_stone_titan', 'aetherion_sky_tyrant', 'malakor_abyssal_horror'],
        boss: 'olphia_the_fallen_goddess',
        lootTable: ['tears_of_olphia', 'talisman_of_binding_shard', 'aegis_of_the_world_forger', 'vestments_of_the_celestial'],
    },
];