import { describe, it, expect } from 'vitest';
import { generateProceduralItem } from '../services/lootGenerationService';
import { generateShopItems } from '../services/shopService';
import { calculateForgeCost } from '../services/forgeService';
import { UPGRADE_COST } from '../constants';
import { characterReducer } from '../context/reducers/characterReducer';
import { GameState, Character, Equipment } from '../types';

describe('Scaling and Upgrade Logic', () => {
    describe('Loot Generation Stat Floor', () => {
        it('should generate higher base stats for higher level items', () => {
            const itemLvl1 = generateProceduralItem(1, 1, 1);
            const itemLvl100 = generateProceduralItem(100, 1, 1);
            
            // Average of stats should be higher
            const avgLvl1 = Object.values(itemLvl1.stats).reduce((a, b) => a + (b || 0), 0) / Object.keys(itemLvl1.stats).length;
            const avgLvl100 = Object.values(itemLvl100.stats).reduce((a, b) => a + (b || 0), 0) / Object.keys(itemLvl100.stats).length;
            
            expect(avgLvl100).toBeGreaterThan(avgLvl1);
            expect(itemLvl100.level).toBe(100);
        });
    });

    describe('Market Price Scaling', () => {
        it('should increase shop prices with player level', () => {
            const shopLvl1 = generateShopItems(1);
            const shopLvl50 = generateShopItems(50);
            
            const avgPriceLvl1 = shopLvl1.reduce((acc, i) => acc + i.price, 0) / shopLvl1.length;
            const avgPriceLvl50 = shopLvl50.reduce((acc, i) => acc + i.price, 0) / shopLvl50.length;
            
            expect(avgPriceLvl50).toBeGreaterThan(avgPriceLvl1);
        });
    });

    describe('Forge Cost Scaling', () => {
        it('should increase forge costs with character level for same relative power', () => {
            // Stats at lvl 1 (base power 7) -> 2x power is 14
            const costLvl1 = calculateForgeCost('common', { attack: 14 }, 1);
            // Stats at lvl 50 (base power 105) -> 2x power is 210
            const costLvl50 = calculateForgeCost('common', { attack: 210 }, 50);
            
            expect(costLvl50.gold).toBeGreaterThan(costLvl1.gold);
            expect(costLvl50.materials[0].amount).toBeGreaterThan(costLvl1.materials[0].amount);
        });
    });

    describe('Upgrade Cost Scaling', () => {
        it('should scale upgrade costs with upgrade level and item level', () => {
            const item: Equipment = {
                id: '1', baseId: 'sword', name: 'Sword', baseName: 'Sword', slot: 'weapon', 
                rarity: 'common', stats: { attack: 10 }, upgradeLevel: 0, level: 1, price: 10
            };
            
            const cost0 = UPGRADE_COST(item);
            const cost1 = UPGRADE_COST({ ...item, upgradeLevel: 1 });
            const costLvl50 = UPGRADE_COST({ ...item, level: 50 });
            
            expect(cost1).toBeGreaterThan(cost0);
            expect(costLvl50).toBeGreaterThan(cost0);
            // Check for slower exponential growth (1.25^3 is much less than 1.6^3)
            const oldStyleCost3 = Math.floor(50 * Math.pow(1.6, 3));
            const newStyleCost3 = UPGRADE_COST({ ...item, upgradeLevel: 3 });
            expect(newStyleCost3).toBeLessThan(oldStyleCost3);
        });
    });

    describe('UPGRADE_ITEM Action', () => {
        it('should increase all stats and item level', () => {
            const char: Character = {
                id: 'char1', name: 'Adventurer', class: 'warrior', level: 10, experience: 0,
                stats: { health: 100, mana: 100, attack: 10, defense: 10, agility: 10, intelligence: 10 },
                maxStats: { health: 100, mana: 100, attack: 10, defense: 10, agility: 10, intelligence: 10 },
                personality: 'brave', inventory: [{
                    id: 'item1', baseId: 'sword', name: 'Sword', baseName: 'Sword', slot: 'weapon',
                    rarity: 'common', stats: { attack: 10, agility: 5 }, upgradeLevel: 0, level: 5, price: 10
                }],
                equipment: [], accessorySlots: [null, null], gold: 1000, 
                generation: 1, parentIds: [], children: [], lastActive: new Date().toISOString(),
                status: 'active', legacyBonus: {}, party: [], completedRaids: {}, quests: [],
                completedQuests: [], potentialHeirs: [], activePassives: [], equippedTitle: null,
                endlessDungeonProgress: 1, materials: {}, unlockedAchievements: []
            };
            
            const initialState: GameState = {
                characters: [char], activeCharacterId: 'char1', guild: null, worldState: {} as any, 
                socialLog: [], dungeonState: {} as any, raidState: {} as any,
                settings: { volume: 50, autoSave: true, endlessAutoProgress: false },
                isLoaded: true, pendingGeneration: null, tavernAdventurers: [], relationships: [],
                isGrinding: false, shopItems: [], tutorialShown: true
            };
            
            const newState = characterReducer(initialState, { 
                type: 'UPGRADE_ITEM', 
                payload: { characterId: 'char1', itemId: 'item1' } 
            });
            
            const upgradedItem = newState.characters[0].inventory[0];
            expect(upgradedItem.upgradeLevel).toBe(1);
            expect(upgradedItem.level).toBe(6);
            expect(upgradedItem.stats.attack).toBeGreaterThan(10);
            expect(upgradedItem.stats.agility).toBeGreaterThan(5);
            expect(newState.characters[0].gold).toBeLessThan(1000);
        });
    });
});
