import React from 'react';
import { CharacterClassType, GameStats, Equipment, EquipmentRarity, PersonalityTrait, RelationshipStatus } from './types';
import { ShieldExclamationIcon, SparklesIcon, BoltIcon, HeartIcon } from './components/ui/Icons';


export const calculateXpForLevel = (level: number): number => {
    // XP requirement increases exponentially with each level, making it harder to level up over time.
    // The curve is base_xp * (level ^ 1.5).
    if (level === 0) return 1000; // Should not happen, but as a fallback
    return Math.floor(1000 * Math.pow(level, 1.5));
};
export const RETIREMENT_LEVEL = 5;
export const MAX_PARTY_SIZE = 4; // Player + 3 members
export const REFRESH_TAVERN_COST = 100;
export const SHOP_REFRESH_COST = 200; // New constant for shop refresh cost
export const GUILD_CREATE_COST = 5000;
export const GUILD_DONATION_GOLD = 500;
export const GUILD_DONATION_XP = 100;
export const GUILD_XP_TABLE: { [level: number]: number } = {
    1: 1000,
    2: 5000,
    3: 15000,
    4: 30000,
    5: 50000,
    6: 75000,
    7: 100000,
    8: 150000,
    9: 200000,
    10: 300000,
    11: 400000,
    12: 500000,
    13: 650000,
    14: 800000,
    15: 1000000,
    16: 1250000,
    17: 1500000,
    18: 1800000,
    19: 2100000,
    20: 2500000,
    21: 3000000,
    22: 3600000,
    23: 4300000,
    24: 5100000,
    25: 6000000,
    26: 7000000,
    27: 8100000,
    28: 9300000,
    29: 10600000,
    30: 12000000,
};
export const DANGEROUS_DUNGEON_LEVEL_OFFSET = 5;

export const CLASSES: { [key in CharacterClassType]: { name: string; description: string; baseStats: GameStats; icon: React.ReactNode; color: string } } = {
  warrior: {
    name: 'Warrior',
    description: 'A master of arms, excelling in physical combat and defense.',
    baseStats: { health: 120, mana: 30, attack: 15, defense: 12, agility: 8, intelligence: 5 },
    icon: <ShieldExclamationIcon />,
    color: 'text-red-400'
  },
  mage: {
    name: 'Mage',
    description: 'A wielder of arcane energies, devastating foes from a distance.',
    baseStats: { health: 80, mana: 100, attack: 5, defense: 6, agility: 7, intelligence: 18 },
    icon: <SparklesIcon />,
    color: 'text-blue-400'
  },
  rogue: {
    name: 'Rogue',
    description: 'A swift and cunning fighter, relying on speed and precision.',
    baseStats: { health: 90, mana: 50, attack: 12, defense: 8, agility: 18, intelligence: 7 },
    icon: <BoltIcon />,
    color: 'text-yellow-400'
  },
  cleric: {
    name: 'Cleric',
    description: 'A divine agent who balances healing arts with righteous combat.',
    baseStats: { health: 100, mana: 80, attack: 8, defense: 10, agility: 6, intelligence: 12 },
    icon: <HeartIcon />,
    color: 'text-green-400'
  },
};

export const PERSONALITY_TRAITS: { [key in PersonalityTrait]: { name: string, description: string, compatibility: { [key in PersonalityTrait]?: number } } } = {
    brave: { name: 'Brave', description: 'Eager to charge into danger.', compatibility: { brave: 2, jovial: 1, serious: -1, cautious: -2, generous: 1 } },
    cautious: { name: 'Cautious', description: 'Prefers to plan and avoid unnecessary risks.', compatibility: { cautious: 2, serious: 1, generous: 1, brave: -2, greedy: -1 } },
    jovial: { name: 'Jovial', description: 'Keeps spirits high with jokes and optimism.', compatibility: { jovial: 2, brave: 1, generous: 1, serious: -2 } },
    serious: { name: 'Serious', description: 'Focused on the mission, with little time for nonsense.', compatibility: { serious: 2, cautious: 1, brave: -1, jovial: -2, greedy: 1 } },
    greedy: { name: 'Greedy', description: 'Always has an eye on the loot.', compatibility: { greedy: 1, brave: 1, generous: -2, cautious: -1 } },
    generous: { name: 'Generous', description: 'Willing to share resources and help others.', compatibility: { generous: 2, jovial: 1, cautious: 1, brave: 1, greedy: -2 } },
};

export const RELATIONSHIP_THRESHOLDS: { [key in RelationshipStatus]: number } = {
    strangers: -Infinity,
    rivals: -25,
    acquaintances: 0,
    friendly: 25,
    best_friends: 75,
    dating: 100,
    married: 150,
};

export const RARITY_COLORS: { [key in EquipmentRarity]: string } = {
    common: 'text-rarity-common',
    uncommon: 'text-rarity-uncommon',
    rare: 'text-rarity-rare',
    epic: 'text-rarity-epic',
    legendary: 'text-rarity-legendary',
};

export const RARITY_ORDER: EquipmentRarity[] = [
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
];

export const RARITY_MULTIPLIER: { [key in EquipmentRarity]: number } = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
};

export const UPGRADE_COST = (item: Equipment): number => {
    const baseCost = 50;
    const levelMultiplier = Math.pow(1.6, item.upgradeLevel);
    const rarityMultiplier = RARITY_MULTIPLIER[item.rarity];
    return Math.floor(baseCost * levelMultiplier * rarityMultiplier);
};

export const RARITY_SELL_VALUE: { [key in EquipmentRarity]: number } = {
    common: 5,
    uncommon: 20,
    rare: 75,
    epic: 250,
    legendary: 1000,
};

export const SELL_PRICE = (item: Equipment): number => {
    const baseValue = RARITY_SELL_VALUE[item.rarity];
    // Each upgrade level adds 20% of the base upgrade cost to the sell price
    const upgradeBonus = item.upgradeLevel * (UPGRADE_COST({ ...item, upgradeLevel: 0 }) * 0.2);
    return Math.floor(baseValue + upgradeBonus);
};

export const SHOP_ITEM_BASE_PRICE = 20; // Base price for common items in shop
export const SHOP_ITEM_PRICE_MULTIPLIER = 3; // Multiplier for rarity and level

export const ADVENTURER_FIRST_NAMES = [
    'Aric', 'Bryn', 'Cael', 'Dara', 'Erin', 'Finn', 'Gwen', 'Hale', 'Iris', 'Jorn', 'Kael', 'Lyra', 'Merek', 'Nia', 'Orin', 'Perrin', 'Quinn', 'Roric', 'Saria', 'Talon',
    // Additional first names
    'Alden', 'Briar', 'Corbin', 'Delia', 'Elias', 'Fiona', 'Gareth', 'Hazel', 'Ivan', 'Jade', 'Kaelen', 'Lira', 'Milo', 'Nola', 'Owen', 'Piper', 'Rhys', 'Sage', 'Thorne', 'Una',
    'Vance', 'Willow', 'Xavier', 'Yara', 'Zane', 'Anya', 'Blaine', 'Cinder', 'Dax', 'Elara', 'Flint', 'Glynnis', 'Harkin', 'Isolde', 'Jax', 'Kaelen', 'Larkin', 'Maelis', 'Niamh', 'Orrin',
    'Pippin', 'Quill', 'Riona', 'Seraphina', 'Taran', 'Ulysses', 'Vesper', 'Wren', 'Xylos', 'Ysabeau', 'Zephyr', 'Aella', 'Brandt', 'Cora', 'Dorian', 'Elara', 'Faelan', 'Gemma', 'Hagen',
    'Indira', 'Jareth', 'Keira', 'Lochlan', 'Maeve', 'Niall', 'Oona', 'Phelan', 'Quiana', 'Rohan', 'Saoirse', 'Tiernan', 'Urien', 'Valerius', 'Winona', 'Xanthus', 'Yara', 'Zephyrine',
    'Alaric', 'Bronte', 'Caspian', 'Delyth', 'Eira', 'Fenris', 'Gideon', 'Hadley', 'Imogen', 'Jareth', 'Kaelen', 'Lirael', 'Maelon', 'Nerys', 'Orion', 'Petra', 'Quentin', 'Rowan',
    'Silas', 'Tamsin', 'Uther', 'Vivian', 'Wyatt', 'Xenia', 'Ylva', 'Zoltan', 'Adair', 'Blair', 'Cade', 'Dahlia', 'Eamon', 'Faelan', 'Gareth', 'Bronte', 'Caspian', 'Delyth', 'Eira',
    'Fenris', 'Gideon', 'Hadley', 'Imogen', 'Jareth', 'Kaelen', 'Lirael', 'Maelon', 'Nerys', 'Orion', 'Petra', 'Quentin', 'Rowan', 'Silas', 'Tamsin', 'Uther', 'Vivian', 'Wyatt',
    'Xenia', 'Ylva', 'Zoltan', 'Adair', 'Blair', 'Cade', 'Dahlia', 'Eamon', 'Faelan', 'Gareth', 'Hamish', 'Iona', 'Jasper', 'Kiera', 'Lysander', 'Morgana', 'Niko', 'Olenna', 'Perrin',
    'Raina', 'Stellan', 'Theron', 'Ursula', 'Valerius', 'Willow', 'Xanthe', 'Yvain', 'Zelda', 'Asher', 'Briar', 'Corbin', 'Delia', 'Elias', 'Fiona', 'Gareth', 'Hazel', 'Ivan', 'Jade',
    'Kaelen', 'Lira', 'Milo', 'Nola', 'Owen', 'Piper', 'Rhys', 'Sage', 'Thorne', 'Una', 'Vance', 'Willow', 'Xavier', 'Yara', 'Zane', 'Anya', 'Blaine', 'Cinder', 'Dax', 'Elara',
    'Flint', 'Glynnis', 'Harkin', 'Isolde', 'Jax', 'Kaelen', 'Larkin', 'Maelis', 'Niamh', 'Orrin', 'Pippin', 'Quill', 'Riona', 'Seraphina', 'Taran', 'Ulysses', 'Vesper', 'Wren',
    'Xylos', 'Ysabeau', 'Zephyr', 'Aella', 'Brandt', 'Cora', 'Dorian', 'Elara', 'Faelan', 'Gemma', 'Hagen', 'Indira', 'Jareth', 'Keira', 'Lochlan', 'Maeve', 'Niall', 'Oona', 'Phelan',
    'Quiana', 'Rohan', 'Saoirse', 'Tiernan', 'Urien', 'Valerius', 'Winona', 'Xanthus', 'Yara', 'Zephyrine', 'Alaric', 'Bronte', 'Caspian', 'Delyth', 'Eira', 'Fenris', 'Gideon',
    'Hadley', 'Imogen', 'Jareth', 'Kaelen', 'Lirael', 'Maelon', 'Nerys', 'Orion', 'Petra', 'Quentin', 'Rowan', 'Silas', 'Tamsin', 'Uther', 'Vivian', 'Wyatt', 'Xenia', 'Ylva',
    'Zoltan', 'Adair', 'Blair', 'Cade', 'Dahlia', 'Eamon', 'Faelan', 'Gareth', 'Hamish', 'Iona', 'Jasper', 'Kiera', 'Lysander', 'Morgana', 'Niko', 'Olenna', 'Perrin', 'Raina',
    'Stellan', 'Theron', 'Ursula', 'Valerius', 'Willow', 'Xanthe', 'Yvain', 'Zelda'
];

export const ADVENTURER_LAST_NAMES = [
    'Stonehand', 'Silverwood', 'Stormcaller', 'Blackwater', 'Ironhelm', 'Sunstrider', 'Shadowend', 'Swiftwind', 'Fireheart', 'Winterfall',
    // Additional last names
    'Axehammer', 'Brightblade', 'Deepriver', 'Fairwind', 'Grimfang', 'Hardrock', 'Lightfoot', 'Moonwhisper', 'Oakhart', 'Proudfoot',
    'Redshield', 'Strongarm', 'Truearrow', 'Whisperwind', 'Wilder', 'Ashwood', 'Boulderfist', 'Cinderfall', 'Darkwood', 'Emberglow',
    'Fellhammer', 'Goldenshield', 'Ironhide', 'Keeneye', 'Longstride', 'Mistwalker', 'Nightshade', 'Oakhaven', 'Proudbeard', 'Ravenscroft',
    'Shadowbrook', 'Silentfoot', 'Stonemarch', 'Thornwood', 'Trueheart', 'Vancroft', 'Whitewater', 'Windrider', 'Wyvernfall', 'Youngblood',
    'Barrelbottom', 'Blackbriar', 'Brightwood', 'Caskwick', 'Deepdelve', 'Everlight', 'Farhaven', 'Frostbeard', 'Grimstone', 'Hallowell',
    'Ironfoot', 'Kindlewood', 'Lightbringer', 'Moonbrook', 'Nighthaven', 'Olden', 'Proudhand', 'Quickstep', 'Riverbend', 'Shadowglen',
    'Silverstream', 'Stoutarm', 'Thistlewick', 'Trueblood', 'Underhill', 'Valeford', 'Whisperwood', 'Wilds', 'Winterborne', 'Woodcutter',
    'Ashfall', 'Blackaxe', 'Brightstone', 'Cinderbrook', 'Darkheart', 'Emberwind', 'Fellstone', 'Goldhand', 'Ironwood', 'Keenblade',
    'Longriver', 'Mistborn', 'Nightfall', 'Oakhaven', 'Proudfoot', 'Ravenswood', 'Shadowfen', 'Silentstep', 'Stonewick', 'Thornhill',
    'Truegrip', 'Underwood', 'Valiant', 'Whispervale', 'Wildheart', 'Winterglen', 'Wolfsbane', 'Wyvernwood', 'Youngheart', 'Zweihander',
    'Ashworth', 'Blackpine', 'Brightshield', 'Cinderwood', 'Darkmoon', 'Emberheart', 'Fellwater', 'Goldengate', 'Ironclad', 'Keenheart',
    'Longshadow', 'Mistvale', 'Nightwhisper', 'Oakenshield', 'Proudstrike', 'Ravenshadow', 'Shadowmoon', 'Silentwood', 'Stonewall', 'Thornblade',
    'Truevalor', 'Underfall', 'Valerius', 'Whisperwind', 'Wildfire', 'Wintermoon', 'Wolfheart', 'Wyvernclaw', 'Youngblood', 'Zemlin',
    'Ashcroft', 'Blackthorn', 'Brightsun', 'Cinderstone', 'Darkwater', 'Emberstone', 'Fellglen', 'Goldwood', 'Ironwill', 'Keenwood',
    'Longwood', 'Mistwood', 'Nightwood', 'Oakwood', 'Proudwood', 'Ravensong', 'Shadowwood', 'Silentriver', 'Stonewood', 'Thornbush',
    'Trueshot', 'Underbright', 'Valor', 'Whisperdale', 'Wildsong', 'Winterlight', 'Wolfsong', 'Wyvernwing', 'Youngwood', 'Zorn'
];
