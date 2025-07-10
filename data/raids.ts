
import { Raid } from '../types';

export const RAIDS: Raid[] = [
    // Original Raid
    {
        id: 'raid_firelords_keep',
        name: "Firelord's Keep",
        description: "A fortress of molten rock and shadow, home to the fearsome Fire Lord Razorvane.",
        guildLevelRequirement: 2,
        bossId: 'firelord_razorvane',
        lootTable: ["firelords_blade", "crown_of_embers", "demonsoul_edge"]
    },

    // Tier 1 Raids (GL 3-5)
    {
        id: 'raid_firelords_keep_heroic',
        name: "Firelord's Keep (Heroic)",
        description: "Return to the molten fortress to face a more powerful Fire Lord, burning with renewed rage.",
        guildLevelRequirement: 3,
        bossId: 'firelord_razorvane',
        lootTable: ["razorvanes_heart", "firelords_blade", "crown_of_embers"]
    },
    {
        id: 'raid_grove_wardens_glade',
        name: "Grove Warden's Glade",
        description: "An ancient, living forest where the warden Sylvanus judges all who enter. His wrath is legendary.",
        guildLevelRequirement: 4,
        bossId: 'sylvanus_grove_warden',
        lootTable: ["runic_longbow", "elven_chainmail", "sentinels_emblem"]
    },
    {
        id: 'raid_dune_sovereigns_tomb',
        name: "Dune Sovereign's Tomb",
        description: "The great tomb of Solaraq has been unsealed, unleashing a sandstorm of fury upon the desert.",
        guildLevelRequirement: 5,
        bossId: 'solaraq_dune_sovereign',
        lootTable: ["blade_of_the_assassin", "sunfury_bow", "boots_of_the_comet"]
    },

    // Tier 2 Raids (GL 6-10)
    {
        id: 'raid_magma_behemoths_core',
        name: "Magma Behemoth's Core",
        description: "Deep within the planet's core, the behemoth Ignis slumbers. Waking it would be catastrophic.",
        guildLevelRequirement: 6,
        bossId: 'ignis_magma_behemoth',
        lootTable: ["earthshaker_maul", "titanforged_gauntlets", "helm_of_the_behemoth"]
    },
    {
        id: 'raid_grove_wardens_glade_heroic',
        name: "Grove Warden's Glade (Heroic)",
        description: "Sylvanus's power has grown, intertwined with the very heart of the ancient woods.",
        guildLevelRequirement: 7,
        bossId: 'sylvanus_grove_warden',
        lootTable: ["thori_dal_the_stars_fury", "elven_chainmail", "sentinels_emblem"]
    },
    {
        id: 'raid_naga_empress_lair',
        name: "Naga Empress's Lair",
        description: "In a deep, underwater palace, the serpentine Empress Ssylth plots to drown the surface world.",
        guildLevelRequirement: 8,
        bossId: 'naga_empress_ssylth',
        lootTable: ["scepter_of_divinity", "soulreaver_daggers", "voidwalkers_shroud"]
    },
    {
        id: 'raid_dune_sovereigns_tomb_heroic',
        name: "Dune Sovereign's Tomb (Heroic)",
        description: "The true power of the Dune Sovereign is now unleashed, a maelstrom of sand and fury.",
        guildLevelRequirement: 9,
        bossId: 'solaraq_dune_sovereign',
        lootTable: ["kingslayers", "sunfury_bow", "boots_of_the_comet"]
    },
    {
        id: 'raid_mycelial_overminds_cavern',
        name: "Mycelial Overmind's Cavern",
        description: "A vast, sentient fungal network controls this entire cave system, with the Overmind at its psychic center.",
        guildLevelRequirement: 10,
        bossId: 'myconid_overmind',
        lootTable: ["staff_of_the_archon", "libram_of_souls", "orb_of_winter"]
    },
    {
        id: 'raid_firelords_keep_mythic',
        name: "Firelord's Keep (Mythic)",
        description: "The Fire Lord has become one with the volcano, a true avatar of destruction. Only legends can challenge him.",
        guildLevelRequirement: 10,
        bossId: 'firelord_razorvane',
        lootTable: ["razorvanes_heart", "demonsoul_edge", "atiyeh_greatstaff_of_the_guardian"]
    },

    // Tier 3 Raids (GL 11-15)
    {
        id: 'raid_sky_tyrants_perch',
        name: "Sky Tyrant's Perch",
        description: "High above the clouds, on a floating island, Aetherion the Sky Tyrant commands the winds and lightning.",
        guildLevelRequirement: 11,
        bossId: 'aetherion_sky_tyrant',
        lootTable: ["staff_of_lightning", "stormcallers_focus", "eye_of_the_maelstrom"]
    },
    {
        id: 'raid_magma_behemoths_core_heroic',
        name: "Magma Behemoth's Core (Heroic)",
        description: "The planetary core grows unstable as Ignis draws more power into itself.",
        guildLevelRequirement: 12,
        bossId: 'ignis_magma_behemoth',
        lootTable: ["shadowmourne", "titanforged_gauntlets", "helm_of_the_behemoth"]
    },
    {
        id: 'raid_naga_empress_lair_heroic',
        name: "Naga Empress's Lair (Heroic)",
        description: "Empress Ssylth wields the full might of the abyssal trenches, her power crushing and absolute.",
        guildLevelRequirement: 13,
        bossId: 'naga_empress_ssylth',
        lootTable: ["talisman_of_binding_shard", "scepter_of_divinity", "soulreaver_daggers"]
    },
    {
        id: 'raid_stone_titans_peak',
        name: "Stone Titan's Peak",
        description: "A mountain that walks. Terragor, a remnant of the world's creation, has awoken.",
        guildLevelRequirement: 14,
        bossId: 'terragor_the_stone_titan',
        lootTable: ["world_serpent_buckle", "golem_fist", "guardian_plate"]
    },
    {
        id: 'raid_mycelial_overminds_cavern_heroic',
        name: "Mycelial Overmind's Cavern (Heroic)",
        description: "The Overmind's psychic projections can now break even the strongest of wills.",
        guildLevelRequirement: 15,
        bossId: 'myconid_overmind',
        lootTable: ["eye_of_sargeras", "staff_of_the_archon", "libram_of_souls"]
    },
     {
        id: 'raid_grove_wardens_glade_mythic',
        name: "Grove Warden's Glade (Mythic)",
        description: "Sylvanus has become the vengeful soul of the forest. Every leaf and branch is his weapon.",
        guildLevelRequirement: 15,
        bossId: 'sylvanus_grove_warden',
        lootTable: ["thori_dal_the_stars_fury", "atiyeh_greatstaff_of_the_guardian", "sentinels_emblem"]
    },

    // Tier 4 Raids (GL 16-20)
    {
        id: 'raid_sky_tyrants_perch_heroic',
        name: "Sky Tyrant's Perch (Heroic)",
        description: "Aetherion's storm rages with the force of a thousand hurricanes.",
        guildLevelRequirement: 16,
        bossId: 'aetherion_sky_tyrant',
        lootTable: ["thunderfury_blessed_blade", "stormcallers_focus", "eye_of_the_maelstrom"]
    },
    {
        id: 'raid_frost_lichs_crypt',
        name: "Frost Lich's Crypt",
        description: "Koralon, a master of death and ice, freezes the very souls of those who enter his frozen sanctum.",
        guildLevelRequirement: 17,
        bossId: 'koralon_the_frost_lich',
        lootTable: ["frostmourne_replica", "orb_of_winter", "robes_of_the_oracle"]
    },
    {
        id: 'raid_automaton_primes_foundry',
        name: "Automaton Prime's Foundry",
        description: "The ultimate creation of a long-dead civilization, this automaton will defend its foundry to the last.",
        guildLevelRequirement: 18,
        bossId: 'automaton_prime',
        lootTable: ["bulwark_of_azzinoth", "titanforged_gauntlets", "helm_of_the_behemoth"]
    },
    {
        id: 'raid_stone_titans_peak_heroic',
        name: "Stone Titan's Peak (Heroic)",
        description: "Terragor's steps now crack the very foundation of the world.",
        guildLevelRequirement: 19,
        bossId: 'terragor_the_stone_titan',
        lootTable: ["aegis_of_the_world_forger", "world_serpent_buckle", "guardian_plate"]
    },
    {
        id: 'raid_abyssal_horrors_trench',
        name: "Abyssal Horror's Trench",
        description: "In the crushing dark of the deepest ocean trench, a being of pure nightmare awaits.",
        guildLevelRequirement: 20,
        bossId: 'malakor_abyssal_horror',
        lootTable: ["tome_of_forbidden_knowledge", "voidwalkers_shroud", "demonsoul_edge"]
    },
    {
        id: 'raid_dune_sovereigns_tomb_mythic',
        name: "Dune Sovereign's Tomb (Mythic)",
        description: "The desert itself has become Solaraq's weapon. He is the sand, the storm, the sun's burning rage.",
        guildLevelRequirement: 20,
        bossId: 'solaraq_dune_sovereign',
        lootTable: ["kingslayers", "thori_dal_the_stars_fury", "boots_of_the_comet"]
    },

    // Tier 5 Raids (GL 21-25)
    {
        id: 'raid_frost_lichs_crypt_heroic',
        name: "Frost Lich's Crypt (Heroic)",
        description: "The absolute zero of Koralon's power can shatter both steel and soul.",
        guildLevelRequirement: 21,
        bossId: 'koralon_the_frost_lich',
        lootTable: ["shadowmourne", "frostmourne_replica", "orb_of_winter"]
    },
    {
        id: 'raid_automaton_primes_foundry_heroic',
        name: "Automaton Prime's Foundry (Heroic)",
        description: "Automaton Prime's logic has concluded all life is a threat to be eliminated.",
        guildLevelRequirement: 22,
        bossId: 'automaton_prime',
        lootTable: ["bulwark_of_azzinoth", "aegis_of_the_world_forger", "titanforged_gauntlets"]
    },
    {
        id: 'raid_celestial_sentinels_court',
        name: "Celestial Sentinel's Court",
        description: "Lumina, a being of cosmic order, will judge the world for its imperfections. Do not be found wanting.",
        guildLevelRequirement: 23,
        bossId: 'lumina_celestial_sentinel',
        lootTable: ["vestments_of_the_celestial", "scepter_of_divinity", "blessed_warhammer"]
    },
    {
        id: 'raid_void_maws_prison',
        name: "Void Maw's Prison",
        description: "An ancient being of pure hunger, Grommash, strains against its eternal chains. Do not let it break free.",
        guildLevelRequirement: 24,
        bossId: 'grommash_the_void_maw',
        lootTable: ["greatsword_of_valor", "world_serpent_buckle", "heart_of_the_phoenix"]
    },
    {
        id: 'raid_abyssal_horrors_trench_heroic',
        name: "Abyssal Horror's Trench (Heroic)",
        description: "Malakor's whispers of madness can be heard even on the surface now.",
        guildLevelRequirement: 25,
        bossId: 'malakor_abyssal_horror',
        lootTable: ["eye_of_sargeras", "tome_of_forbidden_knowledge", "voidwalkers_shroud"]
    },
    {
        id: 'raid_dread_kings_sanctum',
        name: "Dread King's Sanctum",
        description: "The lich Vexor has achieved immense power and seeks to unmake creation. This is the final battleground.",
        guildLevelRequirement: 25,
        bossId: 'vexor_the_dread_king',
        lootTable: ["kingslayers", "libram_of_souls", "frostmourne_replica"]
    },

    // Tier 6 Raids (GL 26-30+) - The Ultimate Challenge
    {
        id: 'raid_magma_behemoths_core_mythic',
        name: "Magma Behemoth's Core (Mythic)",
        description: "The world's crust is cracking under the strain of Ignis's rage.",
        guildLevelRequirement: 26,
        bossId: 'ignis_magma_behemoth',
        lootTable: ["shadowmourne", "aegis_of_the_world_forger", "helm_of_the_behemoth"]
    },
    {
        id: 'raid_timeless_conundrum',
        name: "The Timeless Conundrum",
        description: "Chronos exists outside of time, and to defeat him, you must fight in the past, present, and future all at once.",
        guildLevelRequirement: 26,
        bossId: 'chronos_the_timeless',
        lootTable: ["atiyeh_greatstaff_of_the_guardian", "talisman_of_binding_shard", "eye_of_the_maelstrom"]
    },
    {
        id: 'raid_naga_empress_lair_mythic',
        name: "Naga Empress's Lair (Mythic)",
        description: "The oceans will boil and the lands will flood under the mythic power of Empress Ssylth.",
        guildLevelRequirement: 27,
        bossId: 'naga_empress_ssylth',
        lootTable: ["talisman_of_binding_shard", "shadowmourne", "soulreaver_daggers"]
    },
    {
        id: 'raid_celestial_sentinels_court_heroic',
        name: "Celestial Sentinel's Court (Heroic)",
        description: "Lumina's judgment is absolute. Only the truly perfect may survive.",
        guildLevelRequirement: 27,
        bossId: 'lumina_celestial_sentinel',
        lootTable: ["atiyeh_greatstaff_of_the_guardian", "vestments_of_the_celestial", "scepter_of_divinity"]
    },
    {
        id: 'raid_void_maws_prison_heroic',
        name: "Void Maw's Prison (Heroic)",
        description: "Grommash's chains are breaking. Its hunger could consume the stars.",
        guildLevelRequirement: 28,
        bossId: 'grommash_the_void_maw',
        lootTable: ["razorvanes_heart", "world_serpent_buckle", "greatsword_of_valor"]
    },
    {
        id: 'raid_dread_kings_sanctum_heroic',
        name: "Dread King's Sanctum (Heroic)",
        description: "Vexor's mastery over death is nearly complete.",
        guildLevelRequirement: 28,
        bossId: 'vexor_the_dread_king',
        lootTable: ["eye_of_sargeras", "kingslayers", "frostmourne_replica"]
    },
    {
        id: 'raid_mycelial_overminds_cavern_mythic',
        name: "Mycelial Overmind's Cavern (Mythic)",
        description: "The Overmind's psychic song has become a death knell for the entire world.",
        guildLevelRequirement: 29,
        bossId: 'myconid_overmind',
        lootTable: ["eye_of_sargeras", "atiyeh_greatstaff_of_the_guardian", "staff_of_the_archon"]
    },
     {
        id: 'raid_timeless_conundrum_heroic',
        name: "The Timeless Conundrum (Heroic)",
        description: "Chronos is actively unmaking history. Your own ancestors may cease to have existed.",
        guildLevelRequirement: 29,
        bossId: 'chronos_the_timeless',
        lootTable: ["talisman_of_binding_shard", "atiyeh_greatstaff_of_the_guardian", "eye_of_the_maelstrom"]
    },
    {
        id: 'raid_sky_tyrants_perch_mythic',
        name: "Sky Tyrant's Perch (Mythic)",
        description: "Aetherion has become the living storm, a god of wind and thunder.",
        guildLevelRequirement: 30,
        bossId: 'aetherion_sky_tyrant',
        lootTable: ["thunderfury_blessed_blade", "thori_dal_the_stars_fury", "eye_of_the_maelstrom"]
    },
    {
        id: 'raid_stone_titans_peak_mythic',
        name: "Stone Titan's Peak (Mythic)",
        description: "Terragor no longer walks; the continent moves at his command.",
        guildLevelRequirement: 30,
        bossId: 'terragor_the_stone_titan',
        lootTable: ["aegis_of_the_world_forger", "bulwark_of_azzinoth", "world_serpent_buckle"]
    },
    {
        id: 'raid_celestial_sentinels_court_mythic',
        name: "Celestial Sentinel's Court (Mythic)",
        description: "Lumina has begun the final purification. Reality itself is being cleansed.",
        guildLevelRequirement: 30,
        bossId: 'lumina_celestial_sentinel',
        lootTable: ["atiyeh_greatstaff_of_the_guardian", "vestments_of_the_celestial", "talisman_of_binding_shard"]
    },
    {
        id: 'raid_frost_lichs_crypt_mythic',
        name: "Frost Lich's Crypt (Mythic)",
        description: "Koralon's phylactery is powered by the frozen heart of a dead star. It must be shattered.",
        guildLevelRequirement: 30,
        bossId: 'koralon_the_frost_lich',
        lootTable: ["shadowmourne", "frostmourne_replica", "kingslayers"]
    },
    {
        id: 'raid_automaton_primes_foundry_mythic',
        name: "Automaton Prime's Foundry (Mythic)",
        description: "The foundry has been repurposed. Automaton Prime is no longer defending. It is building an army to replace all life.",
        guildLevelRequirement: 30,
        bossId: 'automaton_prime',
        lootTable: ["bulwark_of_azzinoth", "aegis_of_the_world_forger", "thunderfury_blessed_blade"]
    },
    {
        id: 'raid_abyssal_horrors_trench_mythic',
        name: "Abyssal Horror's Trench (Mythic)",
        description: "The bottom of the ocean is a gateway to the void, and Malakor holds the key.",
        guildLevelRequirement: 30,
        bossId: 'malakor_abyssal_horror',
        lootTable: ["eye_of_sargeras", "shadowmourne", "voidwalkers_shroud"]
    },
    {
        id: 'raid_void_maws_prison_mythic',
        name: "Void Maw's Prison (Mythic)",
        description: "Grommash is free. Its hunger is absolute. This is a battle not for victory, but for survival.",
        guildLevelRequirement: 30,
        bossId: 'grommash_the_void_maw',
        lootTable: ["razorvanes_heart", "talisman_of_binding_shard", "greatsword_of_valor"]
    },
    {
        id: 'raid_dread_kings_sanctum_mythic',
        name: "Dread King's Sanctum (Mythic)",
        description: "Vexor sits on a throne of conquered realities. Your world is next.",
        guildLevelRequirement: 30,
        bossId: 'vexor_the_dread_king',
        lootTable: ["eye_of_sargeras", "kingslayers", "shadowmourne"]
    },
    {
        id: 'raid_timeless_conundrum_mythic',
        name: "The Timeless Conundrum (Mythic)",
        description: "History is unraveling. You must defeat Chronos at the Big Bang itself to save all of existence.",
        guildLevelRequirement: 30,
        bossId: 'chronos_the_timeless',
        lootTable: ["atiyeh_greatstaff_of_the_guardian", "talisman_of_binding_shard", "thunderfury_blessed_blade"]
    },
    {
        id: 'raid_weeping_chasm',
        name: 'The Weeping Chasm',
        description: 'The ancient prison of the fallen goddess Olphia. Her despair seeps from the very walls of this reality-bending chasm.',
        guildLevelRequirement: 30,
        bossId: 'olphia_the_fallen_goddess',
        lootTable: ['tears_of_olphia', 'talisman_of_binding_shard', 'aegis_of_the_world_forger', 'vestments_of_the_celestial'],
    },
];
