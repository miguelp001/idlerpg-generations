import { WorldEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const EVENT_TEMPLATES: Omit<WorldEvent, 'id' | 'duration'>[] = [
    {
        name: "Merchant's Festival",
        description: "A grand festival has brought merchants from all over. Shop prices are significantly reduced!",
        type: 'economic',
        modifiers: { shopPrices: 0.7 }
    },
    {
        name: "Monster Migration",
        description: "A seasonal migration has filled the dungeons with dangerous beasts. Monsters are stronger but carry more gold.",
        type: 'combat',
        modifiers: { monsterStats: 1.25, goldGain: 1.5 }
    },
    {
        name: "Celestial Alignment",
        description: "The stars have aligned, granting a boon to all adventurers. XP gain is increased.",
        type: 'favorable',
        modifiers: { xpGain: 1.3 }
    },
    {
        name: "Dark Omen",
        description: "A shadow hangs over the land. Monsters are more aggressive.",
        type: 'catastrophe',
        modifiers: { monsterStats: 1.5, relationshipGain: 0.8 }
    },
    {
        name: "Bardic Inspiration",
        description: "Tales of heroism are being sung in every tavern. Social bonds form more easily.",
        type: 'social',
        modifiers: { relationshipGain: 1.5 }
    },
    {
        name: "Economic Depression",
        description: "Resources are scarce. Shop prices are high, and gold find is low.",
        type: 'economic',
        modifiers: { shopPrices: 1.5, goldGain: 0.7 }
    }
];

export const rollForNewEvent = (_currentDay: number): WorldEvent | null => {
    // 20% chance for a new event each day if none are active
    if (Math.random() > 0.2) return null;

    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const duration = Math.floor(Math.random() * 4) + 2; // 2-5 days

    return {
        ...template,
        id: uuidv4(),
        duration
    };
};

export const updateActiveEvents = (activeEvents: WorldEvent[]): WorldEvent[] => {
    return activeEvents
        .map(event => ({ ...event, duration: event.duration - 1 }))
        .filter(event => event.duration > 0);
};

export const getGlobalModifiers = (activeEvents: WorldEvent[]) => {
    const modifiers = {
        shopPrices: 1,
        monsterStats: 1,
        xpGain: 1,
        goldGain: 1,
        relationshipGain: 1
    };

    activeEvents.forEach(event => {
        if (event.modifiers.shopPrices) modifiers.shopPrices *= event.modifiers.shopPrices;
        if (event.modifiers.monsterStats) modifiers.monsterStats *= event.modifiers.monsterStats;
        if (event.modifiers.xpGain) modifiers.xpGain *= event.modifiers.xpGain;
        if (event.modifiers.goldGain) modifiers.goldGain *= event.modifiers.goldGain;
        if (event.modifiers.relationshipGain) modifiers.relationshipGain *= event.modifiers.relationshipGain;
    });

    return modifiers;
};

export const getFactionModifiers = (standings: Record<string, number>) => {
    const mods = {
        shopPrices: 1,
        xpGain: 1,
        goldGain: 1,
    };

    if ((standings['Trade_Consortium'] || 0) >= 500) mods.shopPrices *= 0.8;
    if ((standings['Warrior_Keep'] || 0) >= 500) mods.xpGain *= 1.2;
    if ((standings['Explorer_League'] || 0) >= 500) mods.goldGain *= 1.1;

    return mods;
};
