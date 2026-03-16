import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
    CLASSES, 
    RELATIONSHIP_THRESHOLDS, 
    PERSONALITY_TRAITS, 
    REFRESH_TAVERN_COST, 
    SHOP_REFRESH_COST, 
    RARITY_COLORS 
} from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';
import { 
    Equipment, 
    RelationshipStatus, 
    Adventurer, 
    CharacterClassType, 
    MercenaryHeir 
} from '../types';
import { calculateMaxPartySize } from '../services/socialService';
import { ExclamationTriangleIcon } from './ui/Icons';
import { SETS } from '../data/sets';
import ForgeView from './ForgeView';

// ─── Status UI Helpers ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RelationshipStatus, { label: string; color: string; bg: string; emoji: string }> = {
    strangers:     { label: 'Strangers',    color: 'text-gray-400',   bg: 'bg-gray-800/50',   emoji: '🤐' },
    rivals:        { label: 'Rivals',       color: 'text-red-400',    bg: 'bg-red-900/30',    emoji: '⚔️' },
    acquaintances: { label: 'Acquaintances',color: 'text-slate-300',  bg: 'bg-slate-800/50',  emoji: '👋' },
    friendly:      { label: 'Friendly',     color: 'text-green-400',  bg: 'bg-green-900/30',  emoji: '😊' },
    best_friends:  { label: 'Best Friends', color: 'text-blue-400',   bg: 'bg-blue-900/30',   emoji: '🤜' },
    dating:        { label: 'Dating',       color: 'text-pink-400',   bg: 'bg-pink-900/30',   emoji: '💕' },
    married:       { label: 'Married',      color: 'text-yellow-400', bg: 'bg-yellow-900/30', emoji: '💍' },
};


const LOG_TYPE_ICON: Record<string, string> = {
    social_interaction: '💬',
    marriage: '💍',
    retirement: '🏠',
    world_event: '🌍',
    quest: '📜',
};

// ─── Shared Card Components (Standardized UI) ──────────────────────────────────

const AdventurerCard: React.FC<{
    adventurer: Adventurer;
    action: 'recruit' | 'dismiss';
    onAction: (id: string) => void;
    disabled?: boolean;
    isMarriedToPlayer?: boolean;
}> = React.memo(({ adventurer, action, onAction, disabled = false, isMarriedToPlayer = false }) => {
    const classInfo = CLASSES[adventurer.class];
    const personality = PERSONALITY_TRAITS[adventurer.personality];
    return (
        <Card className="flex flex-col justify-between border-white/5 hover:border-primary/30 transition-all">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">{adventurer.name}</h3>
                        <p className={`font-semibold ${classInfo.color}`}>{classInfo.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">Lvl {adventurer.level}</p>
                         <p className="text-sm font-semibold text-on-background/60" title={personality.description}>{personality.name}</p>
                    </div>
                </div>
                 {(adventurer.partnerId && !isMarriedToPlayer) && <p className="text-sm text-pink-400 mt-2 flex items-center gap-1">💍 Married</p>}
                 {isMarriedToPlayer && <p className="text-sm text-pink-400 mt-2 flex items-center gap-1">💖 Married to You</p>}
            </div>
            <Button
                onClick={() => onAction(adventurer.id)}
                variant={action === 'recruit' ? 'shadow' : 'void'}
                className="w-full mt-4"
                disabled={disabled}
            >
                {action === 'recruit' ? 'Recruit' : 'Dismiss'}
            </Button>
        </Card>
    );
});

const MercenaryCard: React.FC<{ mercenary: MercenaryHeir; onHire: (id: string) => void; disabled?: boolean }> = React.memo(({ mercenary, onHire, disabled = false }) => {
    const classInfo = CLASSES[mercenary.characterData.class];
    const personality = PERSONALITY_TRAITS[mercenary.characterData.personality];
    return (
        <Card className="flex flex-col justify-between border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-primary">{mercenary.characterData.name}</h3>
                        <p className="text-xs text-on-background/40">Registered by {mercenary.ownerName}</p>
                        <p className={`font-semibold mt-1 ${classInfo.color}`}>{classInfo.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">Lvl {mercenary.characterData.level}</p>
                        <p className="text-sm font-semibold text-on-background/60">{personality.name}</p>
                    </div>
                </div>
                <p className="text-sm mt-3 italic text-on-background/80 bg-black/20 p-2 rounded">"{mercenary.description}"</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {mercenary.characterData.equipment.slice(0, 3).map(e => (
                        <span key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded bg-surface-3 ${RARITY_COLORS[e.rarity]}`}>
                            {e.name}
                        </span>
                    ))}
                </div>
            </div>
            <Button
                onClick={() => onHire(mercenary.id)}
                variant="shadow"
                className="w-full mt-4"
                disabled={disabled}
            >
                Hire ({mercenary.dailyRate}G)
            </Button>
        </Card>
    );
});

const ItemCard: React.FC<{
    item: Equipment;
    onAction: () => void;
    actionLabel: string;
    characterClass: CharacterClassType;
}> = React.memo(({ item, onAction, actionLabel, characterClass }) => {
    const affinity = item.classAffinity?.[characterClass] ?? 1.0;
    const hasLowAffinity = affinity < 0.7;
    const affinityTitle = hasLowAffinity ? `Ineffective for your class (${Math.round((1 - affinity) * 100)}% penalty)` : undefined;

    return (
        <Card className="flex flex-col justify-between h-full bg-surface-2/50 border-white/5 hover:border-primary/20 border transition-all">
            <div>
                <p className={`font-bold ${RARITY_COLORS[item.rarity]} ${item.isHeirloom ? 'underline decoration-secondary' : ''} ${hasLowAffinity ? 'text-on-background/60' : ''}`} title={affinityTitle}>
                    {item.name} {hasLowAffinity && <ExclamationTriangleIcon />}
                </p>
                {item.setId && <p className="text-xs text-purple-400 font-semibold">{SETS[item.setId].name}</p>}
                <p className="text-xs capitalize text-on-background/60 mt-0.5">
                    {item.slot} {item.upgradeLevel > 0 && <span className="text-secondary">(+{item.upgradeLevel})</span>}
                </p>
                <div className="text-xs mt-3 space-y-1 bg-black/10 p-2 rounded">
                    {Object.entries(item.stats).map(([stat, value]) => (
                        <p key={stat} className="text-green-400 flex justify-between">
                            <span className="capitalize text-on-background/60">{stat}</span>
                            <span>+{Math.round(value * affinity)}</span>
                        </p>
                    ))}
                </div>
            </div>
            <Button onClick={onAction} variant="void" className="text-xs py-1.5 mt-4 w-full border-primary/20 hover:bg-primary/20">
                {actionLabel}
            </Button>
        </Card>
    );
});

// ─── Gift Logic Helpers ───────────────────────────────────────────────────────

const getGiftResponse = (adventurerPersonality: string, itemRarity: string): { response: string; scoreChange: number } => {
    const rarityBonus: Record<string, number> = { common: 2, uncommon: 5, rare: 10, epic: 18, legendary: 30 };
    const base = rarityBonus[itemRarity] ?? 2;

    const responses: Record<string, { positive: string[]; negative?: string[] }> = {
        brave:     { positive: [`"This will serve me well in battle!"`, `"A worthy gift for a warrior!"`] },
        cautious:  { positive: [`"I appreciate the thought... I'll keep this safe."`, `"Thank you, this could come in handy."`] },
        jovial:    { positive: [`"Haha, brilliant! You're too kind!"`, `"This is wonderful, thank you!"`] },
        serious:   { positive: [`"This is... actually quite useful. Thank you."`, `"Acceptable. I will put this to good use."`] },
        greedy:    { positive: [`"Oh this is NICE. I won't forget this!"`, `"Now THIS is what I call generosity!"`] },
        generous:  { positive: [`"You didn't have to, but I'm grateful."`, `"Thank you, truly. This means a lot."`] },
    };

    const pool = responses[adventurerPersonality]?.positive ?? [`"Thank you!"`];
    return {
        response: pool[Math.floor(Math.random() * pool.length)],
        scoreChange: base,
    };
};

// ─── Inner Components ─────────────────────────────────────────────────────────

const GiftPanel: React.FC<{ adventurerId: string; adventurerName: string; adventurerPersonality: string }> = ({
    adventurerId, adventurerName, adventurerPersonality
}) => {
    const { dispatch, activeCharacter } = useGame();
    const [open, setOpen] = useState(false);

    if (!activeCharacter) return null;

    const giftableItems = activeCharacter.inventory.filter(i => !i.isHeirloom);

    const handleGift = (item: Equipment) => {
        const giftResponse = getGiftResponse(adventurerPersonality, item.rarity);
        dispatch({
            type: 'GIVE_ITEM_TO_ADVENTURER',
            payload: { characterId: activeCharacter.id, adventurerId, itemId: item.id, giftResponse }
        });
        setOpen(false);
    };

    return (
        <div>
            <Button
                size="sm"
                variant="void"
                onClick={() => setOpen(!open)}
                className="w-full text-yellow-400 border-yellow-500/40 hover:bg-yellow-900/20"
            >
                🎁 Give Gift {giftableItems.length === 0 && '(No Items)'}
            </Button>
            {open && giftableItems.length > 0 && (
                <div className="mt-2 p-3 bg-surface-2 rounded-lg border border-yellow-500/30 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-on-background/60 font-semibold">Select an item to gift to {adventurerName}:</p>
                    {giftableItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleGift(item)}
                            className="w-full text-left px-3 py-2 rounded bg-surface-1 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-colors text-sm"
                        >
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-xs ml-2 text-on-background/50 capitalize">[{item.rarity}]</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const RelationshipCard: React.FC<{ memberId: string; onDismiss: (id: string) => void }> = ({ memberId, onDismiss }) => {
    const { state, dispatch, activeCharacter } = useGame();
    if (!activeCharacter) return null;

    const member = activeCharacter.party.find(p => p.id === memberId);
    if (!member) return null;

    const ids = [activeCharacter.id, member.id].sort();
    const relationshipId = ids.join('-');
    const relationship = state.relationships.find(r => r.id === relationshipId);
    const status = relationship?.status ?? 'strangers';
    const score = relationship?.score ?? 0;
    const config = STATUS_CONFIG[status];
    const classInfo = CLASSES[member.class];
    const personality = PERSONALITY_TRAITS[member.personality];
    const isRival = status === 'rivals';

    const positiveStatuses: RelationshipStatus[] = ['acquaintances', 'friendly', 'best_friends', 'dating', 'married'];
    const currentPositiveIdx = positiveStatuses.indexOf(status);
    const nextStatus = positiveStatuses[currentPositiveIdx + 1] as RelationshipStatus | undefined;
    const nextThreshold = nextStatus ? RELATIONSHIP_THRESHOLDS[nextStatus] : RELATIONSHIP_THRESHOLDS.married;
    const currentThreshold = RELATIONSHIP_THRESHOLDS[status] ?? 0;
    const progressToNext = nextThreshold > currentThreshold
        ? Math.min(100, ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
        : 100;

    const handleMarry = () => {
        if (window.confirm(`Are you sure you want to propose to ${member.name}? This bond is permanent.`)) {
            dispatch({ type: 'MARRY_PARTNER', payload: { characterId: activeCharacter.id, partnerId: member.id } });
        }
    };

    return (
        <Card className={`relative overflow-hidden border-l-4 ${isRival ? 'border-red-600' : 'border-primary'} ${config.bg}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span>{config.emoji}</span> {member.name}
                    </h3>
                    <p className={`text-sm font-semibold ${classInfo.color}`}>
                        Lvl {member.level} {classInfo.name}
                    </p>
                    <p className="text-xs text-on-background/50 mt-0.5" title={personality.description}>
                        🧠 {personality.name} personality
                    </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color} ${config.bg} border border-current/30`}>
                    {config.label}
                </span>
            </div>

            {!isRival && nextStatus && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-on-background/60 mb-1">
                        <span>{config.label}</span>
                        <span className="text-primary">{nextStatus.replace('_', ' ')} →</span>
                    </div>
                    <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700 rounded-full"
                            style={{ width: `${progressToNext}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-on-background/40 mt-1">
                        <span>{Math.floor(score)} pts</span>
                        <span>{nextThreshold} needed</span>
                    </div>
                </div>
            )}

            {isRival && (
                <div className="mb-3 p-2 bg-red-900/20 rounded border border-red-500/30 text-xs text-red-300">
                    ⚠️ This adventurer is your rival. Gift them items to mend the bond.
                </div>
            )}

            <div className="text-xs text-on-background/50 mb-3">
                🎁 Gifts given: <span className="font-bold text-on-background/70">{relationship?.giftCount ?? 0}</span>
            </div>

            <div className="space-y-2">
                <GiftPanel
                    adventurerId={member.id}
                    adventurerName={member.name}
                    adventurerPersonality={member.personality}
                />
                {relationship && relationship.status !== 'married' && relationship.score >= RELATIONSHIP_THRESHOLDS.married &&
                    !activeCharacter.partnerId && !member.partnerId && (
                    <Button
                        onClick={handleMarry}
                        className="w-full bg-gradient-to-r from-pink-600 to-red-500 hover:from-pink-700 hover:to-red-600 border-none shadow-lg shadow-pink-900/30"
                    >
                        💍 Propose Marriage
                    </Button>
                )}
                {activeCharacter.partnerId === member.id && (
                    <p className="text-center text-pink-400 text-sm mt-2">💖 Married to You</p>
                )}
            </div>

            {/* Dismiss Button */}
            {!isRival && (
                <Button 
                    variant="void" 
                    size="sm" 
                    className="w-full mt-2 text-red-400 border-red-900/40 hover:bg-red-900/20"
                    onClick={() => onDismiss(member.id)}
                >
                    Dismiss from Party
                </Button>
            )}
        </Card>
    );
};

// ─── Main View ───────────────────────────────────────────────────────────────

const SocialHallView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const [activeTab, setActiveTab] = useState<'bonds' | 'tavern' | 'shop' | 'forge' | 'market'>('bonds');
    const [logFilter, setLogFilter] = useState<string>('all');

    if (!activeCharacter) return (
        <Card className="text-center py-12">
            <p className="text-on-background/60">Choose a character to entry the Social Hall.</p>
        </Card>
    );

    // Group party members
    const rivals = activeCharacter.party.filter(m => {
        const ids = [activeCharacter.id, m.id].sort();
        const rel = state.relationships.find(r => r.id === ids.join('-'));
        return rel?.status === 'rivals';
    });
    const others = activeCharacter.party.filter(m => {
        const ids = [activeCharacter.id, m.id].sort();
        const rel = state.relationships.find(r => r.id === ids.join('-'));
        return rel?.status !== 'rivals';
    });

    // tavern logic
    const handleRecruit = (adventurerId: string) => dispatch({ type: 'RECRUIT_ADVENTURER', payload: { characterId: activeCharacter.id, adventurerId } });
    const handleDismiss = (adventurerId: string) => {
        const isSpouse = adventurerId === activeCharacter.partnerId;
        if (isSpouse) {
            alert("You cannot dismiss your spouse!");
            return;
        }
        dispatch({ type: 'DISMISS_ADVENTURER', payload: { characterId: activeCharacter.id, adventurerId } });
    }
    const handleRefreshTavern = () => dispatch({ type: 'REFRESH_TAVERN_ADVENTURERS', payload: { characterId: activeCharacter.id } });
    
    // shop logic
    const handleRefreshShop = () => dispatch({ type: 'REFRESH_SHOP', payload: { characterId: activeCharacter.id } });
    const handleBuyItem = (itemId: string) => dispatch({ type: 'BUY_ITEM', payload: { characterId: activeCharacter.id, itemId } });

    const maxPartySize = calculateMaxPartySize(activeCharacter.level);
    const isPartyFull = activeCharacter.party.length >= maxPartySize - 1;

    // ─── Renderers ────────────────────────────────────────────────────────────

    const renderBonds = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                    ❤️ Party Bonds
                    <span className="text-sm font-normal text-on-background/50">({activeCharacter.party.length} companions)</span>
                </h2>
                {rivals.length > 0 && (
                    <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                        ⚔️ <span>You have <strong>{rivals.length}</strong> rivals. Gift them items to mend bonds!</span>
                    </div>
                )}
                {activeCharacter.party.length === 0 ? (
                    <Card className="text-center py-8 bg-surface-2/30">
                        <p className="text-on-background/50 italic">Traveling alone...</p>
                        <p className="text-on-background/30 text-sm mt-1">Visit the Tavern to recruit companions.</p>
                    </Card>
                    ) : (
                        <div className="space-y-4">
                            {rivals.map(m => <RelationshipCard key={m.id} memberId={m.id} onDismiss={handleDismiss} />)}
                            {others.map(m => <RelationshipCard key={m.id} memberId={m.id} onDismiss={handleDismiss} />)}
                        </div>
                    )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-secondary">📜 Social Log</h2>
                    <select
                        value={logFilter}
                        onChange={e => setLogFilter(e.target.value)}
                        className="text-xs px-2 py-1 bg-surface-2 rounded border border-white/10 text-on-background/70 focus:outline-none"
                    >
                        <option value="all">All Events</option>
                        <option value="social_interaction">Social</option>
                        <option value="world_event">World Events</option>
                        <option value="marriage">Marriage</option>
                        <option value="quest">Quests</option>
                    </select>
                </div>
                <Card className="bg-surface-2/30 h-[450px] flex flex-col p-4 overflow-y-auto custom-scrollbar">
                    {state.socialLog.length > 0 ? (
                        [...state.socialLog].filter(l => logFilter === 'all' || l.type === logFilter).reverse().map(log => (
                            <div key={log.id} className="p-3 rounded border border-white/5 bg-black/10 mb-2 last:mb-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm text-on-background/90">
                                        <span className="mr-2">{LOG_TYPE_ICON[log.type] ?? '📌'}</span>
                                        {log.content}
                                    </p>
                                    <span className="text-[10px] text-on-background/30 font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="m-auto text-on-background/40 italic">Nothing recorded yet.</p>
                    )}
                </Card>
            </div>
        </div>
    );

    const renderTavern = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface-2/40 p-4 rounded-xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-secondary">Looking for Work</h2>
                    <p className="text-sm text-on-background/60">Recruit adventurers. Your party: {activeCharacter.party.length + 1} / {maxPartySize}</p>
                </div>
                <Button onClick={handleRefreshTavern} disabled={activeCharacter.gold < REFRESH_TAVERN_COST}>
                    Buy a Round ({REFRESH_TAVERN_COST}G)
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.tavernAdventurers.map(a => (
                    <AdventurerCard 
                        key={a.id} 
                        adventurer={a} 
                        action="recruit" 
                        onAction={handleRecruit} 
                        disabled={isPartyFull}
                    />
                ))}
            </div>
            {isPartyFull && <p className="text-center text-yellow-400 font-semibold bg-yellow-900/10 p-4 rounded border border-yellow-700/20">Your party is currently full.</p>}
        </div>
    );

    const renderShop = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface-2/40 p-4 rounded-xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-secondary">The Merchant's Table</h2>
                    <p className="text-sm text-on-background/60">Equip your party with the finest gear. Gold: {activeCharacter.gold}G</p>
                </div>
                <Button onClick={handleRefreshShop} disabled={activeCharacter.gold < SHOP_REFRESH_COST}>
                    Refresh Stock ({SHOP_REFRESH_COST}G)
                </Button>
            </div>
            {state.shopItems.length === 0 ? (
                <Card className="text-center py-12 bg-surface-2/20">The shop is empty. Refresh to see new gear!</Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {state.shopItems.map(item => (
                        <ItemCard 
                            key={item.id} 
                            item={item} 
                            onAction={() => handleBuyItem(item.id)} 
                            actionLabel={`Buy (${item.price}G)`}
                            characterClass={activeCharacter.class}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const renderMarket = () => (
        <div className="space-y-6">
            <header className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <h2 className="text-2xl font-bold text-primary">Mercenary Market</h2>
                <p className="text-on-background/70 mt-1">Hire legendary characters retired by players across the network.</p>
            </header>
            {state.worldState.mercenaries.length === 0 ? (
                <Card className="text-center py-12 text-on-background/40">The market is currently quiet.</Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.worldState.mercenaries.map(m => (
                        <MercenaryCard 
                            key={m.id} 
                            mercenary={m} 
                            onHire={(id) => dispatch({ type: 'HIRE_MERCENARY', payload: { characterId: activeCharacter.id, mercenaryId: id } })}
                            disabled={isPartyFull || activeCharacter.gold < m.dailyRate}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-fade-in max-w-[1400px] mx-auto">
            <nav className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                {[
                    { id: 'bonds', label: '❤️ Bonds', active: activeTab === 'bonds' },
                    { id: 'tavern', label: '🍺 Tavern', active: activeTab === 'tavern' },
                    { id: 'shop', label: '💰 Shop', active: activeTab === 'shop' },
                    { id: 'forge', label: '⚒️ Forge', active: activeTab === 'forge' },
                    { id: 'market', label: '🤝 Market', active: activeTab === 'market' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                            tab.active 
                                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                                : 'bg-surface-2 text-on-background/60 hover:bg-surface-3 hover:text-on-background'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main>
                {activeTab === 'bonds' && renderBonds()}
                {activeTab === 'tavern' && renderTavern()}
                {activeTab === 'shop' && renderShop()}
                {activeTab === 'forge' && <ForgeView />}
                {activeTab === 'market' && renderMarket()}
            </main>

            {/* Legacy Section at bottom of main view if applicable */}
            {activeCharacter.level >= 10 && activeTab === 'bonds' && (
                <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold font-serif">Legacy & Heritage</h2>
                        <p className="text-on-background/70 mt-2 max-w-xl">
                            Pass your strength to the next generation. Retiring creates a permanent legacy bonus for your heirs.
                        </p>
                    </div>
                    {activeCharacter.potentialHeirs.length > 0 ? (
                        <Button 
                            variant="shadow" 
                            className="px-10 py-4"
                            onClick={() => {
                                const heirloom = activeCharacter.equipment[0] || activeCharacter.inventory[0];
                                if (!heirloom) {
                                    alert("Equip or carry an item to pass down as an heirloom!");
                                    return;
                                }
                                if (window.confirm("Retire this adventurer? They will become a permanent part of your legacy.")) {
                                    dispatch({ type: 'RETIRE_CHARACTER', payload: { characterId: activeCharacter.id, heirloomId: heirloom.id } });
                                }
                            }}
                        >
                            Establish Heritage ({activeCharacter.potentialHeirs.length} Heirs)
                        </Button>
                    ) : (
                        <p className="text-yellow-400/80 italic text-sm">Requires marriage and an available heir.</p>
                    )}
                </Card>
            )}
        </div>
    );
};

export default SocialHallView;
