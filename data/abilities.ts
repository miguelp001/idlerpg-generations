
import { Ability } from '../types';

export const ABILITIES: { [id: string]: Ability } = {
    // === WARRIOR ===
    'warrior_power_slam': {
        id: 'warrior_power_slam',
        name: 'Power Slam',
        description: 'A powerful strike that deals 150% of Attack damage.',
        log_templates: [
            '[{caster}] channels their might into a Power Slam, crushing {target} for {damage} damage!',
            'With a mighty heave, [{caster}] brings their weapon down on {target} in a Power Slam, dealing {damage} damage.',
            '[{caster}] executes a perfect Power Slam, inflicting {damage} damage upon {target}.'
        ],
        type: 'active',
        class: 'warrior',
        levelRequirement: 3,
        manaCost: 10,
        cooldown: 3,
        effect: { type: 'damage', multiplier: 1.5, stat: 'attack' },
        target: 'enemy',
    },
    'warrior_endurance_training': {
        id: 'warrior_endurance_training',
        name: 'Endurance Training',
        description: 'Increases maximum Health.',
        log_templates: [],
        type: 'passive',
        class: 'warrior',
        levelRequirement: 3,
        bonus: { health: 50 },
    },
    'warrior_weapon_mastery': {
        id: 'warrior_weapon_mastery',
        name: 'Weapon Mastery',
        description: 'Increases Attack.',
        log_templates: [],
        type: 'passive',
        class: 'warrior',
        levelRequirement: 7,
        bonus: { attack: 10 },
    },
     'warrior_heroic_strike': {
        id: 'warrior_heroic_strike',
        name: 'Heroic Strike',
        description: 'A devastating blow that deals 220% of Attack damage.',
        log_templates: [
            '[{caster}] unleashes a Heroic Strike, carving into {target} for {damage} damage!',
            'A roar of fury! [{caster}]\'s Heroic Strike connects with {target} for a staggering {damage} damage.',
            'Precision and power meet as [{caster}] lands a Heroic Strike on {target}, dealing {damage} damage.'
        ],
        type: 'active',
        class: 'warrior',
        levelRequirement: 12,
        manaCost: 25,
        cooldown: 5,
        effect: { type: 'damage', multiplier: 2.2, stat: 'attack' },
        target: 'enemy',
    },
    'warrior_unyielding': {
        id: 'warrior_unyielding',
        name: 'Unyielding',
        description: 'Increases Defense.',
        log_templates: [],
        type: 'passive',
        class: 'warrior',
        levelRequirement: 18,
        bonus: { defense: 15 },
    },

    // === MAGE ===
    'mage_bolt': {
        id: 'mage_bolt',
        name: 'Bolt',
        description: 'Fires a quick bolt of energy, dealing 100% of Intelligence damage.',
        log_templates: [
            '[{caster}] hurls a Bolt of energy at {target} for {damage} damage!',
            'A crackle of arcane power as [{caster}] zaps {target} with a Bolt, dealing {damage} damage.',
            '[{caster}] unleashes a concentrated Bolt, striking {target} for {damage} damage.'
        ],
        type: 'active',
        class: 'mage',
        levelRequirement: 1,
        manaCost: 2,
        cooldown: 1,
        effect: { type: 'damage', multiplier: 1.0, stat: 'intelligence' },
        target: 'enemy',
    },
    'mage_fireball': {
        id: 'mage_fireball',
        name: 'Fireball',
        description: 'Hurls a ball of fire, dealing 200% of Intelligence as damage.',
        log_templates: [
            '[{caster}] conjures a roaring Fireball that engulfs {target} in flames for {damage} damage!',
            'A sphere of fire erupts from [{caster}]\'s hands, striking {target} for {damage} damage.',
            '[{caster}] chants an arcane word, launching a Fireball at {target} that explodes for {damage} damage.'
        ],
        type: 'active',
        class: 'mage',
        levelRequirement: 3,
        manaCost: 15,
        cooldown: 3,
        effect: { type: 'damage', multiplier: 2.0, stat: 'intelligence' },
        target: 'enemy',
    },
    'mage_arcane_intellect': {
        id: 'mage_arcane_intellect',
        name: 'Arcane Intellect',
        description: 'Increases Intelligence.',
        log_templates: [],
        type: 'passive',
        class: 'mage',
        levelRequirement: 3,
        bonus: { intelligence: 10 },
    },
    'mage_mana_font': {
        id: 'mage_mana_font',
        name: 'Mana Font',
        description: 'Increases maximum Mana.',
        log_templates: [],
        type: 'passive',
        class: 'mage',
        levelRequirement: 7,
        bonus: { mana: 50 },
    },
    'mage_arcane_blast': {
        id: 'mage_arcane_blast',
        name: 'Arcane Blast',
        description: 'Unleashes pure arcane energy, dealing 300% of Intelligence as damage.',
        log_templates: [
            'Pure energy erupts from [{caster}]! The Arcane Blast hits {target} for {damage} damage!',
            '[{caster}] tears a hole in reality, blasting {target} with arcane power for {damage} damage.',
            'A focused beam of energy, an Arcane Blast from [{caster}], sears {target} for {damage} damage.'
        ],
        type: 'active',
        class: 'mage',
        levelRequirement: 12,
        manaCost: 40,
        cooldown: 5,
        effect: { type: 'damage', multiplier: 3.0, stat: 'intelligence' },
        target: 'enemy',
    },
    'mage_arcane_fortitude': {
        id: 'mage_arcane_fortitude',
        name: 'Arcane Fortitude',
        description: 'Hardens the flesh with magic, increasing maximum Health.',
        log_templates: [],
        type: 'passive',
        class: 'mage',
        levelRequirement: 18,
        bonus: { health: 40 },
    },

    // === ROGUE ===
    'rogue_eviscerate': {
        id: 'rogue_eviscerate',
        name: 'Eviscerate',
        description: 'A vicious strike that deals 160% of Agility as damage.',
        log_templates: [
            'In a flash of steel, [{caster}] uses Eviscerate on {target}, dealing {damage} damage!',
            '[{caster}] finds an opening and brutally Eviscerates {target} for {damage} damage.',
            'A cruel and efficient strike! [{caster}]\'s Eviscerate leaves a deep wound on {target} for {damage} damage.'
        ],
        type: 'active',
        class: 'rogue',
        levelRequirement: 3,
        manaCost: 10,
        cooldown: 3,
        effect: { type: 'damage', multiplier: 1.6, stat: 'agility' },
        target: 'enemy',
    },
    'rogue_fleet_footed': {
        id: 'rogue_fleet_footed',
        name: 'Fleet Footed',
        description: 'Increases Agility.',
        log_templates: [],
        type: 'passive',
        class: 'rogue',
        levelRequirement: 3,
        bonus: { agility: 10 },
    },
    'rogue_lethality': {
        id: 'rogue_lethality',
        name: 'Lethality',
        description: 'Improves critical positioning, increasing Attack.',
        log_templates: [],
        type: 'passive',
        class: 'rogue',
        levelRequirement: 7,
        bonus: { attack: 10 },
    },
    'rogue_shadowstrike': {
        id: 'rogue_shadowstrike',
        name: 'Shadowstrike',
        description: 'Strikes from the shadows, dealing 250% of Agility as damage.',
        log_templates: [
            '[{caster}] melts into the darkness and reappears, hitting {target} with a Shadowstrike for {damage} damage!',
            'A blade from nowhere! [{caster}]\'s Shadowstrike pierces {target}\'s defense for {damage} damage.',
            'The shadows themselves seem to attack as [{caster}] delivers a devastating Shadowstrike to {target} for {damage} damage.'
        ],
        type: 'active',
        class: 'rogue',
        levelRequirement: 12,
        manaCost: 25,
        cooldown: 5,
        effect: { type: 'damage', multiplier: 2.5, stat: 'agility' },
        target: 'enemy',
    },
    'rogue_quick_reflexes': {
        id: 'rogue_quick_reflexes',
        name: 'Quick Reflexes',
        description: 'Improves dodging, increasing Defense.',
        log_templates: [],
        type: 'passive',
        class: 'rogue',
        levelRequirement: 18,
        bonus: { defense: 10 },
    },

    // === CLERIC ===
    'cleric_minor_heal': {
        id: 'cleric_minor_heal',
        name: 'Minor Heal',
        description: 'Heals a friendly target for 250% of Intelligence.',
        log_templates: [
            'A gentle light from [{caster}] envelops {target}, restoring {healing} health.',
            '[{caster}] invokes a Minor Heal, mending {target}\'s wounds for {healing} health.',
            'With a quiet prayer, [{caster}] channels holy energy to heal {target} for {healing} health.'
        ],
        type: 'active',
        class: 'cleric',
        levelRequirement: 3,
        manaCost: 15,
        cooldown: 3,
        effect: { type: 'heal', multiplier: 2.5, stat: 'intelligence' },
        target: 'ally',
    },
    'cleric_divine_blessing': {
        id: 'cleric_divine_blessing',
        name: 'Divine Blessing',
        description: 'Increases Intelligence and Mana.',
        log_templates: [],
        type: 'passive',
        class: 'cleric',
        levelRequirement: 3,
        bonus: { intelligence: 8, mana: 25 },
    },
    'cleric_faithful_resilience': {
        id: 'cleric_faithful_resilience',
        name: 'Faithful Resilience',
        description: 'The divine protects you, increasing Defense.',
        log_templates: [],
        type: 'passive',
        class: 'cleric',
        levelRequirement: 7,
        bonus: { defense: 10 },
    },
    'cleric_smite': {
        id: 'cleric_smite',
        name: 'Smite',
        description: 'Calls down holy fire, dealing 180% of Intelligence as damage.',
        log_templates: [
            '[{caster}] calls down a column of holy light to Smite {target} for {damage} damage!',
            'Righteous fire burns {target} as [{caster}] unleashes Smite for {damage} damage.',
            'The heavens answer [{caster}]\'s call! {target} is Smited for {damage} damage.'
        ],
        type: 'active',
        class: 'cleric',
        levelRequirement: 12,
        manaCost: 20,
        cooldown: 4,
        effect: { type: 'damage', multiplier: 1.8, stat: 'intelligence' },
        target: 'enemy',
    },
    'cleric_holy_vigor': {
        id: 'cleric_holy_vigor',
        name: 'Holy Vigor',
        description: 'Imbues the body with life, increasing maximum Health.',
        log_templates: [],
        type: 'passive',
        class: 'cleric',
        levelRequirement: 18,
        bonus: { health: 60 },
    },
};
