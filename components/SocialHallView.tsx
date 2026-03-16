import React from 'react';
import { useGame } from '../context/GameContext';
import { CLASSES, RELATIONSHIP_THRESHOLDS } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

const SocialHallView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    
    if (!activeCharacter) return (
        <Card className="text-center py-12">
            <p className="text-on-background/60">Choose a character to start building relationships.</p>
        </Card>
    );

    const partyRelationships = activeCharacter.party.map(member => {
        const ids = [activeCharacter.id, member.id].sort();
        const relId = ids.join('-');
        const relationship = state.relationships.find(r => r.id === relId);
        return { member, relationship };
    });

    const handleMarry = (partnerId: string) => {
        if (window.confirm("Are you sure you want to marry this partner? This bond is permanent.")) {
            dispatch({ type: 'MARRY_PARTNER', payload: { characterId: activeCharacter.id, partnerId } });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>Social Hall</h1>
                <p className="text-on-background/70">Connect with your companions, build bonds, and secure your legacy.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                        <span className="text-red-400">❤️</span> Relationships
                    </h2>
                    
                    {partyRelationships.length > 0 ? (
                        partyRelationships.map(({ member, relationship }) => (
                            <Card key={member.id} className="relative overflow-hidden border-l-4 border-primary">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{member.name}</h3>
                                        <p className={`text-sm font-semibold ${CLASSES[member.class].color}`}>
                                            Lvl {member.level} {CLASSES[member.class].name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-surface-2 rounded-full text-xs font-bold uppercase tracking-wider text-secondary">
                                            {relationship?.status.replace('_', ' ') || 'Strangers'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <ProgressBar 
                                        label="Affinity Score" 
                                        value={relationship?.score || 0} 
                                        max={RELATIONSHIP_THRESHOLDS.married} 
                                        colorClass="bg-red-500" 
                                    />
                                    
                                    <div className="flex justify-between items-center text-xs text-on-background/60">
                                        <span>Gifts Given: {relationship?.giftCount || 0}</span>
                                        <span>Score: {Math.floor(relationship?.score || 0)}</span>
                                    </div>

                                    {relationship && relationship.status !== 'married' && relationship.score >= RELATIONSHIP_THRESHOLDS.married && !activeCharacter.partnerId && !member.partnerId && (
                                        <Button 
                                            onClick={() => handleMarry(member.id)} 
                                            className="w-full mt-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-none shadow-lg shadow-red-500/20"
                                        >
                                            💍 Propose Marriage
                                        </Button>
                                    )}

                                    {activeCharacter.partnerId === member.id && (
                                        <div className="w-full mt-2 py-2 text-center bg-red-500/10 border border-red-500/20 rounded text-red-400 font-bold text-sm">
                                            ❤️ Spouse
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="text-center py-8 bg-surface-2/50">
                            <p className="text-on-background/50 italic">No companions in your party. Recruit someone from the tavern to start building a bond!</p>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                        <span className="text-primary">📜</span> Social Logs
                    </h2>
                    <Card className="bg-surface-2/30 backdrop-blur-sm h-[500px] flex flex-col">
                        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {state.socialLog.length > 0 ? (
                                [...state.socialLog].reverse().map((log) => (
                                    <div key={log.id} className="p-3 bg-surface-2 rounded-lg border border-white/5 hover:border-primary/20 transition-colors">
                                        <p className="text-sm text-on-background/90 leading-relaxed">{log.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-on-background/40 italic">
                                    No social interactions recorded yet.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {activeCharacter.level >= 10 && (
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center py-10">
                    <h2 className="text-3xl font-bold text-on-background mb-4">Legacy & Heritage</h2>
                    <p className="max-w-2xl mx-auto text-on-background/80 mb-8">
                        Your journey will eventually come to an end, but your legacy can live on. 
                        Retiring allows you to pass your wealth and a portion of your strength to a worthy heir.
                    </p>
                    <Button variant="outline" className="px-10 py-3 border-2 hover:bg-primary/20">
                        View Heritage Options
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default SocialHallView;
