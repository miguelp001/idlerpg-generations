import { Achievement } from '../types';

export const ACHIEVEMENTS: { [id: string]: Achievement } = {
    // Leveling Achievements
    'level_5': { id: 'level_5', name: 'Novice Adventurer', description: 'Reach level 5.', title: 'the Novice', unlock: { type: 'level', value: 5 } },
    'level_10': { id: 'level_10', name: 'Seasoned Adventurer', description: 'Reach level 10.', title: 'the Seasoned', unlock: { type: 'level', value: 10 } },
    'level_20': { id: 'level_20', name: 'Veteran Adventurer', description: 'Reach level 20.', title: 'the Veteran', unlock: { type: 'level', value: 20 } },
    'level_30': { id: 'level_30', name: 'Elite Adventurer', description: 'Reach level 30.', title: 'the Elite', unlock: { type: 'level', value: 30 } },
    'level_40': { id: 'level_40', name: 'Champion of the Realm', description: 'Reach level 40.', title: 'Champion', unlock: { type: 'level', value: 40 } },

    // Combat & Dungeon Achievements
    'goblin_chief_slayer': { id: 'goblin_chief_slayer', name: 'Chief Slayer', description: 'Defeat the Goblin Chief.', title: 'Goblin Bane', unlock: { type: 'kill', value: 'goblin_chief' } },
    'first_dungeon': { id: 'first_dungeon', name: 'Dungeon Crawler', description: 'Clear your first dungeon.', title: 'Dungeon Crawler', unlock: { type: 'kill', value: 'goblin_chief' } }, // Re-using goblin chief as a proxy for first dungeon clear
    'raid_pioneer': { id: 'raid_pioneer', name: 'Raid Pioneer', description: 'Defeat Fire Lord Razorvane.', title: 'Raid Pioneer', unlock: { type: 'raid', value: 'raid_firelords_keep' } },
    'raid_conqueror': { id: 'raid_conqueror', name: 'Raid Conqueror', description: 'Clear a Heroic raid.', title: 'Conqueror', unlock: { type: 'raid', value: 'raid_firelords_keep_heroic' } },
    'mythic_challenger': { id: 'mythic_challenger', name: 'Mythic Challenger', description: 'Clear a Mythic raid.', title: 'Mythic', unlock: { type: 'raid', value: 'raid_firelords_keep_mythic' } },
    'undead_purger': { id: 'undead_purger', name: 'Undead Purger', description: 'Defeat a Lich Acolyte.', title: 'Purifier', unlock: { type: 'kill', value: 'lich_acolyte' } },
    'giant_slayer': { id: 'giant_slayer', name: 'Giant Slayer', description: 'Defeat a Frost or Fire Giant.', title: 'Giant Slayer', unlock: { type: 'kill', value: 'frost_giant' } },
    'dragon_slayer': { id: 'dragon_slayer', name: 'Dragon Slayer', description: 'Defeat a Young Green Dragon.', title: 'Dragon Slayer', unlock: { type: 'kill', value: 'young_green_dragon' } },
    'demon_hunter': { id: 'demon_hunter', name: 'Demon Hunter', description: 'Defeat a Horned Devil.', title: 'Demon Hunter', unlock: { type: 'kill', value: 'horned_devil' } },
    'olphia_slayer': { id: 'olphia_slayer', name: 'Goddess Slayer', description: 'Defeat the fallen goddess Olphia.', title: 'Godslayer', unlock: { type: 'kill', value: 'olphia_the_fallen_goddess' } },

    // Quest Achievements
    'goblin_menace_completed': { id: 'goblin_menace_completed', name: 'Goblin Menace', description: 'Complete the Goblin Menace quest chain.', title: 'the Unstoppable', unlock: { type: 'quest', value: 'goblin_menace_3' } },
    'beast_hunt_completed': { id: 'beast_hunt_completed', name: 'Master Hunter', description: 'Complete the Beast Hunter quest chain.', title: 'Master Hunter', unlock: { type: 'quest', value: 'beast_hunt_5' } },
    'undead_scourge_completed': { id: 'undead_scourge_completed', name: 'Scourge of the Undead', description: 'Complete the Undead Scourge quest chain.', title: 'Hallowed', unlock: { type: 'quest', value: 'undead_scourge_4' } },
    'orc_threat_completed': { id: 'orc_threat_completed', name: 'Orcbane', description: 'Complete the Orcish Threat quest chain.', title: 'Orcbane', unlock: { type: 'quest', value: 'orc_threat_4' } },
    'crimson_crusader': { id: 'crimson_crusader', name: 'Crimson Crusader', description: 'Complete the Crimson Corruption quest chain.', title: 'the Uncorrupted', unlock: { type: 'quest', value: 'crimson_corruption_25' } },


    // Economic & Item Achievements
    'moneybags': { id: 'moneybags', name: 'Moneybags', description: 'Accumulate 10,000 gold.', title: 'Moneybags', unlock: { type: 'gold', value: 10000 } },
    'one_percenter': { id: 'one_percenter', name: 'One Percenter', description: 'Accumulate 100,000 gold.', title: 'the Affluent', unlock: { type: 'gold', value: 100000 } },
    'epic_gear': { id: 'epic_gear', name: 'Well-Geared', description: 'Equip an Epic item.', title: 'Epic', unlock: { type: 'item_rarity', value: 'epic' } },
    'legendary_owner': { id: 'legendary_owner', name: 'Legendary', description: 'Equip a Legendary item.', title: 'Legendary', unlock: { type: 'item_rarity', value: 'legendary' } },
    'master_crafter': { id: 'master_crafter', name: 'Master Crafter', description: 'Upgrade an item to +5.', title: 'the Master Crafter', unlock: { type: 'upgrade_level', value: 5 } },
    'heirloom_hoarder': { id: 'heirloom_hoarder', name: 'Heirloom Hoarder', description: 'Possess an heirloom item.', title: 'the Inheritor', unlock: { type: 'generation', value: 2 } }, // Proxy for having an heirloom

    // Social & Generational Achievements
    'full_party': { id: 'full_party', name: 'Full House', description: 'Recruit a full party of 3 adventurers.', title: 'the Leader', unlock: { type: 'level', value: 1 } }, // Will be triggered by a custom check
    'first_retirement': { id: 'first_retirement', name: 'A New Generation', description: 'Retire your first character.', title: 'the Progenitor', unlock: { type: 'generation', value: 2 } },
    'fifth_generation': { id: 'fifth_generation', name: 'Enduring Legacy', description: 'Reach the 5th generation.', title: 'the Enduring', unlock: { type: 'generation', value: 5 } },
    'guild_founder': { id: 'guild_founder', name: 'Guild Founder', description: 'Create a guild.', title: 'Founder', unlock: { type: 'guild_level', value: 1 } },
    'guild_master': { id: 'guild_master', name: 'Guild Master', description: 'Lead your guild to level 5.', title: 'Guild Master', unlock: { type: 'guild_level', value: 5 } },
    'happily_married': { id: 'happily_married', name: 'Happily Married', description: 'Get married to a party member.', title: 'the Beloved', unlock: { type: 'marriage', value: 1 } },
    'best_friends': { id: 'best_friends', name: 'Best Friends', description: 'Reach "best friends" status with an adventurer.', title: 'the Friendly', unlock: { type: 'level', value: 1 } }, // Custom check
    'rivals': { id: 'rivals', name: 'Worthy Rival', description: 'Develop a rivalry with an adventurer.', title: 'the Rival', unlock: { type: 'level', value: 1 } }, // Custom check
};
