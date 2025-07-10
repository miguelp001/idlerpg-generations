
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Adventurer, Relationship } from '../types';
import { CLASSES, REFRESH_TAVERN_COST, PERSONALITY_TRAITS } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';
import { calculateMaxPartySize } from '../services/socialService';

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
        <Card className="flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">{adventurer.name}</h3>
                        <p className={`font-semibold ${classInfo.color}`}>{classInfo.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">Lvl {adventurer.level}</p>
                         <p className="text-sm font-semibold text-secondary" title={personality.description}>{personality.name}</p>
                    </div>
                </div>
                 {(adventurer.partnerId && !isMarriedToPlayer) && <p className="text-sm text-pink-400 mt-2">Married</p>}
                 {isMarriedToPlayer && <p className="text-sm text-pink-400 mt-2">Married to You</p>}
            </div>
            <Button
                onClick={() => onAction(adventurer.id)}
                variant={action === 'recruit' ? 'primary' : 'ghost'}
                className="w-full mt-4"
                disabled={disabled}
            >
                {action === 'recruit' ? 'Recruit' : 'Dismiss'}
            </Button>
        </Card>
    );
});

const RelationshipDisplay: React.FC = () => {
    const { state, activeCharacter } = useGame();
    if (!activeCharacter || activeCharacter.party.length < 1) {
        return <p className="text-center p-8 text-on-background/70">Recruit adventurers to build relationships.</p>
    }
    
    const partyMembers = activeCharacter.party;
    const { relationships } = state;

    const getRelationship = (id1: string, id2: string): Relationship | undefined => {
        const ids = [id1, id2].sort();
        return relationships.find(r => r.participantIds[0] === ids[0] && r.participantIds[1] === ids[1]);
    }
    
    const renderRelCard = (p1Name: string, p2Name: string, rel: Relationship | undefined) => {
        if(!rel) return null;
        const statusColor = rel.score >= 100 ? 'text-pink-400' : rel.score > 25 ? 'text-green-400' : rel.score < -25 ? 'text-red-400' : 'text-yellow-400';
        return (
             <Card key={rel.id} className="bg-surface-2 p-4">
                 <div className="flex justify-between items-center">
                    <span className="font-bold">{p1Name} &harr; {p2Name}</span>
                    <span className={`font-bold capitalize ${statusColor}`}>{rel.status.replace('_', ' ')}</span>
                </div>
            </Card>
        )
    }

    const partyRelationships = useMemo(() => {
        return partyMembers.flatMap((p1, i) =>
            partyMembers.slice(i + 1).map(p2 => {
                const rel = getRelationship(p1.id, p2.id);
                return renderRelCard(p1.name, p2.name, rel);
            })
        ).filter(Boolean);
    }, [partyMembers, relationships]);

    return (
        <div className="space-y-6">
            <div>
                 <h3 className="text-xl font-semibold mb-2 text-primary">Your Relationships</h3>
                 <div className="space-y-4">
                    {partyMembers.map(p => {
                        const rel = getRelationship(activeCharacter.id, p.id);
                        return renderRelCard("You", p.name, rel);
                    })}
                 </div>
            </div>
            <div>
                 <h3 className="text-xl font-semibold mb-2 text-primary">Party Relationships</h3>
                 <div className="space-y-4">
                    {partyRelationships.length > 0 
                        ? partyRelationships 
                        : <p className="text-center p-4 text-on-background/70">Your party members are just getting to know each other.</p>
                    }
                 </div>
            </div>
        </div>
    );
};

const SocialLogDisplay: React.FC = () => {
    const { state } = useGame();
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [state.socialLog]);
    
    return (
        <div ref={logRef} className="h-96 bg-black/30 rounded-lg p-4 overflow-y-auto font-mono text-sm shadow-inner" aria-live="polite">
            {state.socialLog.map(log => (
                <p key={log.id} className="animate-fade-in text-on-background/90">
                    &gt; {log.message}
                </p>
            ))}
            {state.socialLog.length === 0 && <p className="text-on-background/70">&gt; The party is quiet for now...</p>}
        </div>
    )
}

const SocialView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const [activeTab, setActiveTab] = useState('tavern');

    if (!activeCharacter) return <div>Loading...</div>;

    const handleRecruit = (adventurerId: string) => {
        dispatch({ type: 'RECRUIT_ADVENTURER', payload: { characterId: activeCharacter.id, adventurerId } });
    };

    const handleDismiss = (adventurerId: string) => {
        dispatch({ type: 'DISMISS_ADVENTURER', payload: { characterId: activeCharacter.id, adventurerId } });
    };
    
    const handleRefresh = () => {
        dispatch({ type: 'REFRESH_TAVERN_ADVENTURERS', payload: { characterId: activeCharacter.id } });
    };

    const maxPartySize = calculateMaxPartySize(activeCharacter.level);
    const isPartyFull = activeCharacter.party.length >= maxPartySize - 1;
    const canAffordRefresh = activeCharacter.gold >= REFRESH_TAVERN_COST;

    const renderTavern = () => (
         <div className="space-y-8">
            {/* Current Party */}
            <div>
                <h2 className="text-3xl font-bold mb-4 text-secondary">Your Party ({activeCharacter.party.length + 1} / {maxPartySize})</h2>
                 <Card>
                    {activeCharacter.party.length === 0 ? (
                        <p className="text-center p-8 text-on-background/70">You are traveling alone.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCharacter.party.map(adventurer => (
                                <AdventurerCard
                                    key={adventurer.id}
                                    adventurer={adventurer}
                                    action="dismiss"
                                    onAction={handleDismiss}
                                    isMarriedToPlayer={adventurer.id === activeCharacter.partnerId}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Available Adventurers */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-secondary">Looking for Work</h2>
                    <Button onClick={handleRefresh} disabled={!canAffordRefresh} title={!canAffordRefresh ? `You need ${REFRESH_TAVERN_COST}G` : ''}>
                        Buy a Round ({REFRESH_TAVERN_COST}G)
                    </Button>
                </div>
                <Card>
                    {state.tavernAdventurers.length === 0 ? (
                        <p className="text-center p-8 text-on-background/70">The tavern is quiet for now.</p>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {state.tavernAdventurers.map(adventurer => (
                                <AdventurerCard
                                    key={adventurer.id}
                                    adventurer={adventurer}
                                    action="recruit"
                                    onAction={handleRecruit}
                                    disabled={isPartyFull}
                                />
                            ))}
                        </div>
                    )}
                    {isPartyFull && (
                        <p className="text-center text-yellow-400 font-semibold mt-6">Your party is full.</p>
                    )}
                </Card>
            </div>
        </div>
    );
    
    const renderRelationships = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-3xl font-bold mb-4 text-secondary">Party Dynamics</h2>
                <RelationshipDisplay />
            </div>
             <div>
                <h2 className="text-3xl font-bold mb-4 text-secondary">Social Log</h2>
                <SocialLogDisplay />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold mb-2 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Social Hub</h1>
                <p className="text-lg text-on-background/80">Manage your party, witness their bonds, and find new companions.</p>
            </div>

             <div className="flex space-x-2 border-b-2 border-surface-2">
                <button 
                    onClick={() => setActiveTab('tavern')} 
                    className={`px-6 py-2 text-lg font-semibold transition-colors ${activeTab === 'tavern' ? 'text-primary border-b-2 border-primary' : 'text-on-background/70'}`}
                >
                    Tavern
                </button>
                <button 
                    onClick={() => setActiveTab('relationships')} 
                    className={`px-6 py-2 text-lg font-semibold transition-colors ${activeTab === 'relationships' ? 'text-primary border-b-2 border-primary' : 'text-on-background/70'}`}
                >
                    Relationships
                </button>
            </div>

            {activeTab === 'tavern' ? renderTavern() : renderRelationships()}
            
        </div>
    );
};

export default SocialView;
