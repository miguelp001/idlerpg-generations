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
            return this.handleAction(action);
        }

        if (url.pathname === "/state" && request.method === "GET") {
            return new Response(JSON.stringify(this.gameState), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Not Found", { status: 404 });
    }

    async handleAction(action: Action): Promise<Response> {
        if (!this.gameState && action.type !== 'CREATE_CHARACTER' && action.type !== 'LOAD_STATE') {
            return new Response("No game state", { status: 400 });
        }

        // Apply reducer logic (Simplified for this example)
        // In a real implementation, we'd import the actual reducers
        console.log("Handling action:", action.type);
        
        // Save to DO storage
        await this.state.storage.put("gameState", this.gameState);
        
        // Flushes to D1 database periodically (handled via alarms or after specific actions)
        if (action.type === 'SAVE_GAME' || Math.random() < 0.1) {
            await this.persistToD1();
        }

        return new Response(JSON.stringify(this.gameState), {
             headers: { "Content-Type": "application/json" }
        });
    }

    async persistToD1() {
        if (!this.gameState) return;
        const char = this.gameState.characters.find(c => c.id === this.gameState?.activeCharacterId);
        if (!char) return;

        await this.env.DB.prepare(
            "INSERT INTO characters (id, name, class, level, experience, gold, state_json) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET level=excluded.level, experience=excluded.experience, gold=excluded.gold, state_json=excluded.state_json"
        ).bind(
            char.id, char.name, char.class, char.level, char.experience, char.gold, JSON.stringify(this.gameState)
        ).run();
    }
}
