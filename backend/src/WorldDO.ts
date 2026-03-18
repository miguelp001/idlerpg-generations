import { WorldState } from '../../types';

export class WorldDO implements DurableObject {
    state: DurableObjectState;
    worldState: WorldState | null = null;
    env: any;

    constructor(state: DurableObjectState, env: any) {
        this.state = state;
        this.env = env;

        this.state.blockConcurrencyWhile(async () => {
            let stored = await this.state.storage.get<WorldState>("worldState");
            this.worldState = stored || null;
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === "/tick" && request.method === "POST") {
            return this.tick();
        }

        if (url.pathname === "/state" && request.method === "GET") {
            return new Response(JSON.stringify(this.worldState), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (url.pathname === "/mercenaries") {
            if (request.method === "GET") {
                return new Response(JSON.stringify(this.worldState?.mercenaries || []), {
                    headers: { "Content-Type": "application/json" }
                });
            }
            if (request.method === "POST") {
                const merc = await request.json();
                if (!this.worldState) this.worldState = { day: 1, time: 'day', activeEvents: [], factionStandings: {}, globalGoldMultiplier: 1, mercenaries: [], corpses: [] };
                const existingIndex = this.worldState.mercenaries.findIndex(m => m.id === merc.id);
                if (existingIndex > -1) {
                    this.worldState.mercenaries[existingIndex] = merc;
                } else {
                    this.worldState.mercenaries.push(merc);
                }
                await this.state.storage.put("worldState", this.worldState);
                return new Response("OK");
            }
        }

        if (url.pathname === "/corpses") {
             if (request.method === "GET") {
                return new Response(JSON.stringify(this.worldState?.corpses || []), {
                    headers: { "Content-Type": "application/json" }
                });
            }
            if (request.method === "POST") {
                const corpse = await request.json();
                if (!this.worldState) this.worldState = { day: 1, time: 'day', activeEvents: [], factionStandings: {}, globalGoldMultiplier: 1, mercenaries: [], corpses: [] };
                this.worldState.corpses.push(corpse);
                await this.state.storage.put("worldState", this.worldState);
                return new Response("OK");
            }
        }

        return new Response("Not Found", { status: 404 });
    }

    async tick(): Promise<Response> {
        // Advance time, roll for events (Logic from worldEventService)
        if (this.worldState) {
            this.worldState.day += 1;
            // More logic here...
        }

        await this.state.storage.put("worldState", this.worldState);
        await this.persistToD1();

        return new Response(JSON.stringify(this.worldState), {
            headers: { "Content-Type": "application/json" }
        });
    }

    async persistToD1() {
        if (!this.worldState) return;
        await this.env.DB.prepare(
            "INSERT INTO world_state (id, day, time, active_events_json) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET day=excluded.day, time=excluded.time, active_events_json=excluded.active_events_json"
        ).bind(
            this.worldState.day, this.worldState.time, JSON.stringify(this.worldState.activeEvents)
        ).run();
    }
}
