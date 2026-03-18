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

        // Achievement Stats Routing
        if (url.pathname === "/achievements/stats" && request.method === "GET") {
            const totalUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{count: number}>();
            const counts = await env.DB.prepare(
                "SELECT achievement_id, COUNT(*) as count FROM user_achievements GROUP BY achievement_id"
            ).all<{achievement_id: string, count: number}>();

            const stats: Record<string, number> = {};
            if (totalUsers && totalUsers.count > 0) {
                counts.results.forEach(row => {
                    stats[row.achievement_id] = Math.round((row.count / totalUsers.count) * 100);
                });
            }

            return new Response(JSON.stringify(stats), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*" 
                }
            });
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
