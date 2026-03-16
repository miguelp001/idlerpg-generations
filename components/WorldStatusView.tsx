import React from 'react';
import { useGame } from '../context/GameContext';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

const WorldStatusView: React.FC = () => {
    const { state } = useGame();
    const { worldState } = state;

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'economic': return '💰';
            case 'combat': return '⚔️';
            case 'social': return '🤝';
            case 'favorable': return '✨';
            case 'catastrophe': return '🌑';
            default: return '🌍';
        }
    };

    const getModifierLabel = (key: string, value: number) => {
        const isPositive = value > 1;
        const percent = Math.round(Math.abs(value - 1) * 100);
        
        const labels: Record<string, string> = {
            shopPrices: isPositive ? 'Price Hike' : 'Discount',
            monsterStats: isPositive ? 'Stronger Foes' : 'Weaker Foes',
            xpGain: isPositive ? 'XP Boost' : 'XP Penalty',
            goldGain: isPositive ? 'Gold Boost' : 'Gold Penalty',
            relationshipGain: isPositive ? 'Social Boost' : 'Social Penalty',
        };

        return (
            <div key={key} className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                <span className={isPositive ? 'text-red-300' : 'text-green-300'}>
                    {labels[key] || key}: {isPositive ? '+' : '-'}{percent}%
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Events */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-800 bg-slate-800/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-100 font-serif">
                                <span className="text-2xl">🌍</span>
                                Active World Events
                            </CardTitle>
                            <div className="px-3 py-1 rounded-full border border-blue-400/30 text-blue-400 text-xs font-bold">
                                Day {worldState.day} - {worldState.time === 'day' ? 'Daytime' : 'Nighttime'}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {worldState.activeEvents.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">
                                The world is relatively peaceful right now.
                            </div>
                        ) : (
                            worldState.activeEvents.map((event) => (
                                <div key={event.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all group">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-900/50 text-xl">
                                                {getEventIcon(event.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-300 transition-colors font-serif">
                                                    {event.name}
                                                </h3>
                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                                            {event.duration} Days Left
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {Object.entries(event.modifiers).map(([key, val]) => 
                                            val !== 1 ? getModifierLabel(key, val) : null
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Faction Standings */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-800 bg-slate-800/20">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-100 font-serif">
                            <span className="text-2xl">👥</span>
                            Faction Reputations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {Object.keys(worldState.factionStandings).length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">
                                No faction relationships established yet.
                            </div>
                        ) : (
                            Object.entries(worldState.factionStandings).map(([factionId, rep]) => (
                                <div key={factionId} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-200 capitalize font-serif text-lg">
                                            {factionId.replace('_', ' ')}
                                        </span>
                                        <span className="text-slate-400 font-mono font-bold">
                                            {rep} / 1000
                                        </span>
                                    </div>
                                    <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-500 shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (rep / 1000) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500 tracking-wider font-semibold uppercase">
                                        <span>Neutral</span>
                                        <span>Friendly</span>
                                        <span>Exalted</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Global Multiplier Alert */}
            {worldState.globalGoldMultiplier !== 1 && (
                <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between shadow-lg shadow-yellow-900/20">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">💰</span>
                        <div>
                            <span className="font-bold text-yellow-100 block text-lg font-serif">World Charity Active!</span>
                            <span className="text-sm text-yellow-300">All characters are sharing {Math.round((1 - worldState.globalGoldMultiplier) * 100)}% of their gold to maintain world stability.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldStatusView;
