import React from 'react';
import { useGame } from '../context/GameContext';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import { getGlobalModifiers, getFactionModifiers } from '../services/worldEventService';

// ─── Event Type Config ─────────────────────────────────────────────────────────

const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    economic:    { icon: '💰', color: 'text-yellow-300',  bg: 'bg-yellow-900/20',  border: 'border-yellow-500/30' },
    combat:      { icon: '⚔️', color: 'text-red-300',     bg: 'bg-red-900/20',     border: 'border-red-500/30'    },
    social:      { icon: '🤝', color: 'text-blue-300',    bg: 'bg-blue-900/20',    border: 'border-blue-500/30'   },
    favorable:   { icon: '✨', color: 'text-green-300',   bg: 'bg-green-900/20',   border: 'border-green-500/30'  },
    catastrophe: { icon: '🌑', color: 'text-purple-300',  bg: 'bg-purple-900/20',  border: 'border-purple-500/30' },
};

// ─── Faction Config ───────────────────────────────────────────────────────────

const FACTION_CONFIG: Record<string, { name: string; icon: string; color: string; description: string; milestones: { threshold: number; reward: string }[] }> = {
    Trade_Consortium: {
        name: 'Trade Consortium',
        icon: '🏛️',
        color: 'text-yellow-400',
        description: 'Merchant guilds controlling trade across the realm.',
        milestones: [
            { threshold: 100, reward: '5% shop discount unlocked' },
            { threshold: 300, reward: '10% shop discount unlocked' },
            { threshold: 500, reward: '20% shop discount (max)' },
        ],
    },
    Warrior_Keep: {
        name: 'Warrior Keep',
        icon: '🛡️',
        color: 'text-red-400',
        description: 'Elite knights sworn to protect the realm.',
        milestones: [
            { threshold: 100, reward: '+5% XP boost unlocked' },
            { threshold: 300, reward: '+10% XP boost unlocked' },
            { threshold: 500, reward: '+20% XP boost (max)' },
        ],
    },
    Explorer_League: {
        name: 'Explorer\'s League',
        icon: '🗺️',
        color: 'text-green-400',
        description: 'Adventurers mapping the wilds and discovering riches.',
        milestones: [
            { threshold: 100, reward: '+3% gold find unlocked' },
            { threshold: 300, reward: '+7% gold find unlocked' },
            { threshold: 500, reward: '+10% gold find (max)' },
        ],
    },
};

// ─── Modifier Badge ────────────────────────────────────────────────────────────

const ModifierBadge: React.FC<{ label: string; value: number; invert?: boolean }> = ({ label, value, invert = false }) => {
    const percent = Math.round(Math.abs(value - 1) * 100);
    if (percent === 0) return null;
    // For "invert", positive means bad (e.g. shopPrices going up = bad)
    const isGood = invert ? value < 1 : value > 1;
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${isGood ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'}`}>
            {isGood ? '▲' : '▼'} {label}: {isGood ? '+' : '-'}{percent}%
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const WorldStatusView: React.FC = () => {
    const { state } = useGame();
    const { worldState } = state;

    const globalMods = getGlobalModifiers(worldState.activeEvents);
    const factionMods = getFactionModifiers(worldState.factionStandings);

    const hasMods = Object.values(globalMods).some(v => v !== 1);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-primary font-serif">World Status</h1>
                    <p className="text-on-background/60 mt-1">Day {worldState.day} · {worldState.time === 'day' ? '☀️ Daytime' : '🌙 Nighttime'}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-on-background/50">Active Events</p>
                    <p className="text-3xl font-bold text-secondary">{worldState.activeEvents.length}</p>
                </div>
            </div>

            {/* Active Modifier Summary Banner */}
            {hasMods && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 shadow-lg">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-background/50 mb-2">Current World Modifiers</p>
                    <div className="flex flex-wrap gap-2">
                        <ModifierBadge label="Shop Prices" value={globalMods.shopPrices} invert />
                        <ModifierBadge label="Monster Power" value={globalMods.monsterStats} invert />
                        <ModifierBadge label="XP Gain" value={globalMods.xpGain} />
                        <ModifierBadge label="Gold Find" value={globalMods.goldGain} />
                        <ModifierBadge label="Social Bonds" value={globalMods.relationshipGain} />
                        <ModifierBadge label="Shop Prices (Faction)" value={factionMods.shopPrices} invert />
                        <ModifierBadge label="XP (Faction)" value={factionMods.xpGain} />
                        <ModifierBadge label="Gold (Faction)" value={factionMods.goldGain} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Events Panel */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-800 bg-slate-800/20">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-100 font-serif">
                            <span className="text-2xl">🌍</span> Active World Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {(worldState?.activeEvents || []).length === 0 ? (
                            <div className="text-center py-10 space-y-2">
                                <p className="text-4xl">🕊️</p>
                                <p className="text-slate-400 italic">The world is peaceful today.</p>
                                <p className="text-slate-500 text-sm">Events may arise as the days pass...</p>
                            </div>
                        ) : (
                            worldState.activeEvents.map(event => {
                                const cfg = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.favorable;
                                return (
                                    <div
                                        key={event.id}
                                        className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border} transition-all group`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-black/20 text-xl`}>
                                                    {cfg.icon}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-lg ${cfg.color} font-serif`}>{event.name}</h3>
                                                    <p className="text-sm text-slate-400 leading-relaxed">{event.description}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border} shrink-0 ml-2`}>
                                                {event.duration}d left
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {event.modifiers?.shopPrices    && <ModifierBadge label="Shop Prices" value={event.modifiers.shopPrices} invert />}
                                            {event.modifiers?.monsterStats  && <ModifierBadge label="Monster Power" value={event.modifiers.monsterStats} invert />}
                                            {event.modifiers?.xpGain        && <ModifierBadge label="XP Gain" value={event.modifiers.xpGain} />}
                                            {event.modifiers?.goldGain      && <ModifierBadge label="Gold Find" value={event.modifiers.goldGain} />}
                                            {event.modifiers?.relationshipGain && <ModifierBadge label="Social Bonds" value={event.modifiers.relationshipGain} />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Faction Standings Panel */}
                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-800 bg-slate-800/20">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-100 font-serif">
                            <span className="text-2xl">⚖️</span> Faction Reputations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {Object.entries(FACTION_CONFIG).map(([factionId, cfg]) => {
                            const rep = worldState?.factionStandings?.[factionId] ?? 0;
                            const maxRep = 1000;
                            const progressPct = Math.min(100, (rep / maxRep) * 100);
                            const nextMilestone = cfg.milestones.find(m => rep < m.threshold);
                            const currentMilestone = [...cfg.milestones].reverse().find(m => rep >= m.threshold);

                            return (
                                <div key={factionId} className="space-y-3">
                                    {/* Faction Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{cfg.icon}</span>
                                            <div>
                                                <p className={`font-bold ${cfg.color} font-serif`}>{cfg.name}</p>
                                                <p className="text-xs text-slate-500">{cfg.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-200 font-mono font-bold text-lg">{rep}</span>
                                            <span className="text-slate-500 text-xs">/{maxRep}</span>
                                        </div>
                                    </div>

                                    {/* Rep Bar */}
                                    <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                                                rep >= 500 ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' :
                                                rep >= 300 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                                                             'bg-gradient-to-r from-slate-600 to-slate-400'
                                            }`}
                                            style={{ width: `${progressPct}%` }}
                                        />
                                        {/* Milestone Markers */}
                                        {cfg.milestones.map(m => (
                                            <div
                                                key={m.threshold}
                                                className="absolute top-0 bottom-0 w-0.5 bg-white/20"
                                                style={{ left: `${(m.threshold / maxRep) * 100}%` }}
                                                title={`${m.threshold}: ${m.reward}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Milestone Labels */}
                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                        <span>Neutral</span>
                                        <span>Friendly</span>
                                        <span>Exalted</span>
                                    </div>

                                    {/* Current Bonus / Next Milestone */}
                                    <div className="flex items-center justify-between text-xs">
                                        {currentMilestone ? (
                                            <span className="text-green-400">✅ {currentMilestone.reward}</span>
                                        ) : (
                                            <span className="text-slate-500 italic">No bonuses yet</span>
                                        )}
                                        {nextMilestone && (
                                            <span className="text-slate-400">🎯 Next: {nextMilestone.threshold} rep → {nextMilestone.reward}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* How to gain faction rep */}
            <Card className="bg-slate-900/30 border-slate-800 p-5">
                <h3 className="font-bold text-slate-200 font-serif mb-3">📚 How to Earn Faction Reputation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-400">
                    <div className="flex items-start gap-2">
                        <span className="text-xl">🏛️</span>
                        <div>
                            <p className="font-semibold text-yellow-400">Trade Consortium</p>
                            <p>Complete merchant quests and trade-focused missions</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-xl">🛡️</span>
                        <div>
                            <p className="font-semibold text-red-400">Warrior Keep</p>
                            <p>Defeat dungeon bosses and complete combat quests</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-xl">🗺️</span>
                        <div>
                            <p className="font-semibold text-green-400">Explorer's League</p>
                            <p>Explore new dungeons and bless fallen adventurers</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Global Gold Multiplier Alert */}
            {worldState.globalGoldMultiplier !== 1 && (
                <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between shadow-lg shadow-yellow-900/20">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">💰</span>
                        <div>
                            <span className="font-bold text-yellow-100 block text-lg font-serif">World Charity Active!</span>
                            <span className="text-sm text-yellow-300">
                                All characters are sharing {Math.round((1 - worldState.globalGoldMultiplier) * 100)}% of their gold to maintain world stability.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldStatusView;
