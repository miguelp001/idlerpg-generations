import { GameState, Action } from '../../types';
// We'll need a simplified version of the reducers or import them if possible
// For this implementation, we'll assume we can share logic or mock it

export class PlayerDO implements DurableObject {
    state: DurableObjectState;
    gameState: GameState | null = null;
    env: any;

    constructor(state: DurableObjectState, env: any) {
        this.state = state;
        this.env = env;
        
        // Restore state from storage
        this.state.blockConcurrencyWhile(async () => {
            let stored = await this.state.storage.get<GameState>("gameState");
            this.gameState = stored || null;
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        
        if (url.pathname === "/action" && request.method === "POST") {
            const action: Action = await request.json();
            return this.handleAction(action, request);
        }

        if (url.pathname === "/state" && request.method === "GET") {
            const userId = request.headers.get("X-User-Id");
            if (userId) await this.persistToD1(userId); // Auto-save on load
            return new Response(JSON.stringify(this.gameState), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Not Found", { status: 404 });
    }

    async handleAction(action: Action, request: Request): Promise<Response> {
        if (!this.gameState && action.type !== 'CREATE_CHARACTER' && action.type !== 'LOAD_STATE') {
            return new Response("No game state", { status: 400 });
        }

        // Apply reducer logic (Simplified for this example)
        // In a real implementation, we'd import the actual reducers
        console.log("Handling action:", action.type);
        
        // Save to DO storage
        await this.state.storage.put("gameState", this.gameState);
        
        const userId = request.headers.get("X-User-Id");
        if (userId && (action.type === 'SAVE_GAME' || Math.random() < 0.1)) {
            await this.persistToD1(userId);
        }

        return new Response(JSON.stringify(this.gameState), {
             headers: { "Content-Type": "application/json" }
        });
    }

    async persistToD1(userId: string) {
        if (!this.gameState) return;
        const char = this.gameState.characters.find(c => c.id === this.gameState?.activeCharacterId);
        if (!char) return;

        // Ensure user exists
        await this.env.DB.prepare(
            "INSERT INTO users (id) VALUES (?) ON CONFLICT(id) DO UPDATE SET last_login=CURRENT_TIMESTAMP"
        ).bind(userId).run();

        // Update character
        await this.env.DB.prepare(
            "INSERT INTO characters (id, user_id, name, class, level, experience, gold, state_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET level=excluded.level, experience=excluded.experience, gold=excluded.gold, state_json=excluded.state_json"
        ).bind(
            char.id, userId, char.name, char.class, char.level, char.experience, char.gold, JSON.stringify(this.gameState)
        ).run();

        // Update achievements
        if (char.unlockedAchievements && char.unlockedAchievements.length > 0) {
            for (const achId of char.unlockedAchievements) {
                await this.env.DB.prepare(
                    "INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?) ON CONFLICT(user_id, achievement_id) DO NOTHING"
                ).bind(userId, achId).run();
            }
        }
    }
}
