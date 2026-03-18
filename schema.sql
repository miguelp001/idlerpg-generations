-- D1 Schema for Idle RPG Generations

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Characters Table
CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
    generation INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    state_json TEXT, -- Full GameState or Character object as JSON for quick recovery
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Global World State
CREATE TABLE IF NOT EXISTS world_state (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Singleton
    day INTEGER DEFAULT 1,
    time TEXT DEFAULT 'day',
    active_events_json TEXT, -- JSON array of active WorldEvents
    faction_standings_json TEXT, -- JSON map of standings
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Shared Mercenaries
CREATE TABLE IF NOT EXISTS mercenaries (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    data_json TEXT, -- Full MercenaryHeir object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Shared Corpses
CREATE TABLE IF NOT EXISTS corpses (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    dungeon_id TEXT,
    floor INTEGER,
    data_json TEXT, -- Full DungeonCorpse object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT,
    achievement_id TEXT,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
