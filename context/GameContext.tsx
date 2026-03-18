import React, { createContext, useReducer, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { GameState, Action, Character, DungeonState, RaidState, Equipment } from '../types';
import { SAVE_KEY, MAX_GOLD, API_URL } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'idlerpg_user_id';
const getUserId = () => {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
        id = uuidv4();
        localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
};

// Reducers
import { characterReducer } from './reducers/characterReducer';
import { combatReducer } from './reducers/combatReducer';
import { worldReducer } from './reducers/worldReducer';

// Services
import { saveGlobalMercenaries, addCorpse, pruneCorpses } from '../services/globalService';

const initialDungeonState: DungeonState = {
    status: 'idle',
    dungeonId: null,
    monsterId: null,
    currentMonsterHealth: null,
    currentMonsterIndex: -1,
    combatLog: [],
    xpGained: 0,
    goldGained: 0,
    lootFound: [],
    turnCount: 0,
    cooldowns: {},
    proceduralDungeonData: undefined,
    rooms: [],
    currentRoomIndex: -1,
};

const initialRaidState: RaidState = {
    status: 'idle',
    raidId: null,
    bossId: null,
    currentBossHealth: null,
    combatLog: [],
    goldGained: 0,
    lootFound: [],
    turnCount: 0,
    cooldowns: {},
};

const initialState: GameState = {
  characters: [],
  activeCharacterId: null,
  worldState: {
    day: 1,
    time: 'day',
    activeEvents: [],
    factionStandings: {
      'Trade_Consortium': 0,
      'Warrior_Keep': 0,
      'Explorer_League': 0
    },
    globalGoldMultiplier: 1,
    mercenaries: [],
    corpses: [],
  },
  settings: {
    volume: 0.5,
    autoSave: true,
    endlessAutoProgress: true,
  },
  dungeonState: initialDungeonState,
  raidState: initialRaidState,
  isLoaded: false,
  pendingGeneration: null,
  tavernAdventurers: [],
  guild: null,
  relationships: [],
  socialLog: [],
  isGrinding: false,
  shopItems: [],
  tutorialShown: false,
};

const gameReducer = (state: GameState, action: Action): GameState => {
    // Shared / Core Actions
    switch (action.type) {
        case 'LOAD_STATE': {
            let loadedState = { ...initialState, ...action.payload };
            
            // Deep merge worldState
            if (action.payload.worldState) {
                loadedState.worldState = { 
                    ...initialState.worldState, 
                    ...action.payload.worldState,
                    factionStandings: {
                        ...initialState.worldState.factionStandings,
                        ...(action.payload.worldState.factionStandings || {})
                    }
                };
            }

            // Deep merge settings
            if (action.payload.settings) {
                loadedState.settings = { ...initialState.settings, ...action.payload.settings };
            }

            // Deep merge dungeonState
            if (action.payload.dungeonState) {
                loadedState.dungeonState = { ...initialState.dungeonState, ...action.payload.dungeonState };
                if (loadedState.dungeonState.status !== 'idle' && loadedState.dungeonState.status !== 'paused') {
                    loadedState.dungeonState.status = 'paused';
                }
            }

            // Deep merge raidState
            if (action.payload.raidState) {
                loadedState.raidState = { ...initialState.raidState, ...action.payload.raidState };
            }

            // Ensure arrays and objects exist
            loadedState.characters = (loadedState.characters || []).map((char: Character) => {
                const migrateItem = (item: any) => {
                    if (!item) return null;
                    return {
                        ...item,
                        upgradeLevel: item.upgradeLevel ?? 0,
                        rarity: item.rarity ?? 'common',
                    };
                };

                return {
                    ...char,
                    inventory: (char.inventory || []).map(migrateItem),
                    equipment: (char.equipment || []).map(migrateItem),
                    accessorySlots: (char.accessorySlots || [null, null]).map(migrateItem) as [Equipment | null, Equipment | null],
                    party: (char.party || []).map((p: any) => ({
                        ...p,
                        accessorySlots: (p.accessorySlots || [null, null]).map(migrateItem),
                        equipment: (p.equipment || []).map(migrateItem)
                    })),
                    quests: char.quests || [],
                    completedQuests: char.completedQuests || [],
                    potentialHeirs: char.potentialHeirs || [],
                    activePassives: char.activePassives || [],
                    unlockedAchievements: char.unlockedAchievements || [],
                    materials: char.materials || {},
                    parentIds: char.parentIds || [],
                    children: char.children || [],
                    completedRaids: char.completedRaids || {},
                    endlessDungeonProgress: char.endlessDungeonProgress || 1,
                    gold: Math.min(char.gold || 0, MAX_GOLD),
                };
            });
            
            if (loadedState.guild) {
                loadedState.guild = {
                    ...loadedState.guild,
                    members: loadedState.guild.members || [],
                };
            }

            loadedState.tavernAdventurers = loadedState.tavernAdventurers || [];
            loadedState.shopItems = loadedState.shopItems || [];
            loadedState.relationships = loadedState.relationships || [];
            loadedState.socialLog = loadedState.socialLog || [];

            return { ...loadedState, isLoaded: true };
        }
        case 'UPDATE_SETTINGS': {
            return { ...state, settings: { ...state.settings, ...action.payload } };
        }
    }

    // Domain Delegation
    let newState = characterReducer(state, action);
    if (newState !== state) return newState;

    newState = combatReducer(state, action);
    if (newState !== state) return newState;

    newState = worldReducer(state, action);
    if (newState !== state) return newState;

    return state;
};

interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<Action>;
    activeCharacter: Character | null;
    saveGame: () => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        const loadInitialState = async () => {
            try {
                const userId = getUserId();
                const response = await fetch(`${API_URL}/state`, {
                    headers: { 'X-User-Id': userId }
                });
                
                if (response.ok) {
                    const gameState = await response.json();
                    if (gameState) {
                        dispatch({ type: 'LOAD_STATE', payload: gameState });
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to load game state from Cloudflare", error);
                
                // Fallback to local storage if server is down
                try {
                    const savedDataJSON = localStorage.getItem(SAVE_KEY);
                    if (savedDataJSON) {
                        const savedData = JSON.parse(savedDataJSON);
                        if (savedData.gameState) {
                            dispatch({ type: 'LOAD_STATE', payload: savedData.gameState });
                            return;
                        }
                    }
                } catch (localError) {
                    console.error("Failed to load from localStorage", localError);
                }
            }
            dispatch({ type: 'LOAD_STATE', payload: { ...initialState, tutorialShown: false } });
        };
        
        loadInitialState();
    }, []);

    // Sync state to backend on changes
    useEffect(() => {
        if (state.isLoaded) {
            const syncToBackend = async () => {
                try {
                    const userId = getUserId();
                    await fetch(`${API_URL}/action`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'X-User-Id': userId 
                        },
                        body: JSON.stringify({ type: 'SYNC_STATE', payload: state })
                    });
                } catch (error) {
                    console.error("Failed to sync state to backend", error);
                }
            };

            // Debounced sync or sync on critical actions
            const timeoutId = setTimeout(syncToBackend, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [state]);

    // Local Storage backup (legacy)
    useEffect(() => {
        if (state.isLoaded && state.settings.autoSave) {
            const saveData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                gameState: state
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        }
    }, [state]);

    const activeCharacter = useMemo(() => {
        if (!state.activeCharacterId) return null;
        return state.characters.find(c => c.id === state.activeCharacterId && c.status === 'active') || null;
    }, [state.activeCharacterId, state.characters]);

    const saveGame = useCallback(() => {
        if (!state.isLoaded) return;
        const saveData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            gameState: state,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }, [state]);

    const resetGame = useCallback(() => {
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
    }, []);

    // Global Engine Loop
    useEffect(() => {
        if (!state.isLoaded) return;

        const worldInterval = setInterval(() => {
            dispatch({ type: 'ADVANCE_WORLD_STATE' });
            pruneCorpses();
        }, 60000);

        const socialInterval = setInterval(() => {
            dispatch({ type: 'SIMULATE_SOCIAL_TURN' });
            saveGlobalMercenaries(state.worldState.mercenaries);
            // WorldDO handles corpses now
        }, 30000);

        return () => {
            clearInterval(worldInterval);
            clearInterval(socialInterval);
        };
    }, [state.isLoaded, dispatch, state.worldState.mercenaries, state.worldState.corpses]);

    const value = useMemo(() => ({
        state,
        dispatch,
        activeCharacter,
        saveGame,
        resetGame
    }), [state, activeCharacter, saveGame, resetGame]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
