import React from 'react';
import { useGame } from '../context/GameContext';
import Card from './ui/Card';
import { Character } from '../types';
import { CLASSES } from '../constants';

const CharacterNodeCard: React.FC<{ character: Character }> = ({ character }) => {
    const classInfo = CLASSES[character.class];
    const statusColor = character.status === 'active' ? 'border-green-500' : 'border-gray-500';
    const statusText = character.status === 'active' ? 'text-green-400' : 'text-gray-400';

    return (
        <Card className={`border-l-4 ${statusColor} w-full`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold">{character.name}</h3>
                    <p className={`font-semibold ${classInfo.color}`}>Gen {character.generation} {classInfo.name}</p>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                    <p className="text-xl font-bold">Lvl {character.level}</p>
                    <p className={`capitalize font-semibold ${statusText}`}>{character.status}</p>
                </div>
            </div>
        </Card>
    );
};

const FamilyNode: React.FC<{ characterId: string }> = ({ characterId }) => {
    const { state } = useGame();
    const character = state.characters.find(c => c.id === characterId);

    if (!character) return null;

    return (
        <li className="list-none">
            <CharacterNodeCard character={character} />
            {character.children && character.children.length > 0 && (
                <ul className="relative pl-8 md:pl-12 mt-4 space-y-4">
                    <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-surface-2" aria-hidden="true"></div>
                    {character.children.map(childId => (
                        <FamilyNode key={childId} characterId={childId} />
                    ))}
                </ul>
            )}
        </li>
    );
};


const FamilyTree: React.FC = () => {
    const { state } = useGame();

    // Find top-level ancestors (generation 1 characters)
    const rootCharacters = state.characters.filter(c => c.generation === 1);
    
    // Also include any orphans (characters with generation > 1 but whose parents aren't in the list for some reason)
    const childrenIds = new Set(state.characters.flatMap(c => c.children));
    const orphans = state.characters.filter(c => c.generation > 1 && !childrenIds.has(c.id));

    const displayedRoots = [...rootCharacters, ...orphans].sort((a,b) => a.generation - b.generation);


    return (
        <div className="animate-fade-in">
             <h1 className="text-4xl font-bold mb-6 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Family Tree</h1>
             <p className="text-lg text-on-background/80 mb-8">A history of your heroic lineage. Each generation builds upon the last, growing stronger over time.</p>
            
            {state.characters.length === 0 ? (
                <Card><p className="text-center p-8">Your lineage has not yet begun. Create your first hero!</p></Card>
            ) : (
                <ul className="space-y-6">
                    {displayedRoots.map(char => <FamilyNode key={char.id} characterId={char.id} />)}
                </ul>
            )}
        </div>
    );
};

export default FamilyTree;