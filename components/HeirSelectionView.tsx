import React from 'react';
import { useGame } from '../context/GameContext';
import { CLASSES } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';

const HeirSelectionView: React.FC = () => {
    const { state, dispatch } = useGame();
    const generation = state.pendingGeneration;

    if (!generation || !generation.availableHeirs) return null;

    const handleSelect = (heirId: string) => {
        dispatch({ type: 'SELECT_HEIR', payload: { characterId: generation.parentId, heirId } });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 overflow-y-auto">
            <div className="max-w-5xl w-full space-y-8 py-12">
                <header className="text-center animate-fade-in-down">
                    <h1 className="text-5xl font-bold text-primary mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>Choose Your Heir</h1>
                    <p className="text-xl text-on-background/70">Your former hero has retired. Select their successor to carry on the family name.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {generation.availableHeirs.map((heir) => (
                        <Card key={heir.childId} className="hover:scale-105 transition-transform border-none bg-gradient-to-b from-surface-2 to-surface-1 shadow-2xl">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-secondary">{heir.name}</h2>
                                <p className={`text-lg font-semibold ${CLASSES[heir.class].color}`}>{CLASSES[heir.class].name}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-on-background/40">Starting Stats (with Heritage Bonus)</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(heir.baseStats).map(([stat, value]) => (
                                        <div key={stat} className="flex justify-between p-2 bg-black/20 rounded">
                                            <span className="capitalize text-on-background/60">{stat}</span>
                                            <span className="text-green-400 font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mb-8">
                                <p className="text-xs text-on-background/60 italic leading-relaxed">
                                    Inherits the Ancestral <span className="text-primary font-bold">{generation.heirloom.name}</span> and <span className="text-gold-400 font-bold">{generation.gold.toLocaleString()}G</span>.
                                </p>
                            </div>

                            <Button onClick={() => handleSelect(heir.childId)} className="w-full py-4 text-lg font-bold">
                                Select This Heir
                            </Button>
                        </Card>
                    ))}
                </div>

                <div className="text-center text-on-background/40 pt-12 animate-fade-in">
                    <p>The legacy of House {generation.availableHeirs[0].name.split(' ').slice(-1)[0]} will never fade.</p>
                </div>
            </div>
        </div>
    );
};

export default HeirSelectionView;
