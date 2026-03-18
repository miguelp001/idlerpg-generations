import { PlayerDO } from './PlayerDO';
import { WorldDO } from './WorldDO';

export { PlayerDO, WorldDO };

export interface Env {
    PLAYER_DO: DurableObjectNamespace;
    WORLD_DO: DurableObjectNamespace;
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        
        // CORS headers
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
                }
            });
        }

        // Global World State Routing
        if (url.pathname.startsWith("/world")) {
            const id = env.WORLD_DO.idFromName("global");
            const obj = env.WORLD_DO.get(id);
            return obj.fetch(request);
        }

        // Player Actions Routing
        const userId = request.headers.get("X-User-Id");
        if (!userId) {
            return new Response("Missing X-User-Id header", { status: 401 });
        }

        const id = env.PLAYER_DO.idFromName(userId);
        const obj = env.PLAYER_DO.get(id);
        
        // Add CORS to response
        const response = await obj.fetch(request);
        const newResponse = new Response(response.body, response || {});
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        return newResponse;
    }
};
