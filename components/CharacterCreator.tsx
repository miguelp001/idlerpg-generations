
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Character, CharacterClassType, Equipment, PotentialHeir, PersonalityTrait } from '../types';
import { CLASSES, RARITY_COLORS, PERSONALITY_TRAITS } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';

const HeirSelection: React.FC<{
    heirs: PotentialHeir[],
    onSelect: (id: string | null) => void,
    selectedId: string | null
}> = ({ heirs, onSelect, selectedId }) => {
    return (
        <div className="bg-surface-2 p-4 rounded-lg border border-secondary/50">
            <h3 className="text-xl font-bold text-secondary mb-4">Choose Your Heir</h3>
            <p className="text-sm text-on-background/80 mb-4">A child from your previous party is ready to continue the legacy.</p>
            <div className="space-y-3">
            {heirs.map(heir => {
                const classInfo = CLASSES[heir.class];
                return (
                    <div 
                        key={heir.childId} 
                        onClick={() => onSelect(heir.childId)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${selectedId === heir.childId ? 'border-primary bg-primary/10' : 'border-surface-1 hover:border-primary/50'}`}>
                        <p className={`text-lg font-bold ${classInfo.color}`}>{heir.name}</p>
                        <p className="text-sm">Child of {heir.parents[0].name} & {heir.parents[1].name}</p>
                        <p className="text-sm text-on-background/80">{classInfo.name}</p>
                    </div>
                );
            })}
             <div 
                onClick={() => onSelect(null)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${!selectedId ? 'border-primary bg-primary/10' : 'border-surface-1 hover:border-primary/50'}`}>
                <p className="text-lg font-bold">A New Beginning</p>
                <p className="text-sm text-on-background/80">Forge a completely new hero.</p>
            </div>
            </div>
        </div>
    )
}


const LegacyInfo: React.FC<{
    onSelectHeir: (id: string | null) => void,
    selectedHeirId: string | null
}> = ({ onSelectHeir, selectedHeirId }) => {
    const { state } = useGame();
    if (!state.pendingGeneration) return null;

    const { parentId, legacyBonus, heirloom, availableHeirs } = state.pendingGeneration;
    const parent = state.characters.find(c => c.id === parentId);
    const selectedHeir = availableHeirs?.find(h => h.childId === selectedHeirId);

    return (
        <Card className="bg-surface-2 mb-8 border border-primary/50 animate-fade-in">
            <h2 className="text-2xl font-bold text-secondary mb-4">A New Generation Begins</h2>
            {parent && <p className="mb-2">Your new hero follows in the footsteps of <strong className="text-primary">{parent.name}</strong> (Lvl {parent.level} {parent.class}), inheriting their legacy.</p>}
            
            {availableHeirs && availableHeirs.length > 0 && (
                <div className="my-4">
                    <HeirSelection heirs={availableHeirs} onSelect={onSelectHeir} selectedId={selectedHeirId} />
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Legacy Bonus</h3>
                     <ul className="list-disc list-inside space-y-1 text-green-400">
                        {(selectedHeir ? selectedHeir.legacyBonus : legacyBonus) && Object.entries(selectedHeir ? selectedHeir.legacyBonus : legacyBonus).map(([stat, value]) => (value as number) > 0 && (
                            <li key={stat}>+{value as number} <span className="capitalize text-on-background/80">{stat}</span></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Heirloom</h3>
                    <div className="bg-surface-1 p-3 rounded-lg">
                        <p className={`font-bold ${RARITY_COLORS[heirloom.rarity]}`}>{heirloom.name}</p>
                         <div className="text-sm mt-1">
                            {Object.entries(heirloom.stats).map(([stat, value]) => (
                                <p key={stat} className="text-green-400">
                                    +{value} <span className="capitalize text-on-background/70">{stat}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const CharacterCreator: React.FC = () => {
  const { state, dispatch } = useGame();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClassType>('warrior');
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityTrait>('brave');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHeirId, setSelectedHeirId] = useState<string | null>(
    (state.pendingGeneration?.availableHeirs && state.pendingGeneration.availableHeirs.length > 0)
    ? state.pendingGeneration.availableHeirs[0].childId
    : null
  );

  const selectedHeir = state.pendingGeneration?.availableHeirs?.find(h => h.childId === selectedHeirId);

  useEffect(() => {
      if(selectedHeir) {
          setName(selectedHeir.name);
          setSelectedClass(selectedHeir.class);
      } else {
          setName('');
      }
  }, [selectedHeir]);

  const handleCreateCharacter = () => {
    if (!name.trim() || isLoading) {
      return;
    }
    
    setIsLoading(true);

    const goldToInherit = state.pendingGeneration ? state.pendingGeneration.gold : 50;

    let newCharacter: Omit<Character, 'id' | 'potentialHeirs'> & { heir?: PotentialHeir };

    if(selectedHeir && state.pendingGeneration) {
        newCharacter = {
            name: selectedHeir.name,
            class: selectedHeir.class,
            personality: selectedPersonality, // Personality still selected by player
            level: 1,
            experience: 0,
            stats: selectedHeir.baseStats,
            maxStats: selectedHeir.baseStats,
            equipment: [],
            inventory: [],
            generation: (state.characters.find(c => c.id === state.pendingGeneration?.parentId)?.generation || 0) + 1,
            parentIds: [state.pendingGeneration.parentId],
            children: [],
            lastActive: new Date().toISOString(),
            gold: goldToInherit,
            status: 'active',
            legacyBonus: selectedHeir.legacyBonus,
            party: [],
            completedRaids: {},
            quests: [],
            completedQuests: [],
            activePassives: [],
            unlockedAchievements: [],
            equippedTitle: null,
            heir: selectedHeir,
        }
    } else {
        const classData = CLASSES[selectedClass];
        newCharacter = {
          name,
          class: selectedClass,
          personality: selectedPersonality,
          level: 1,
          experience: 0,
          stats: classData.baseStats,
          maxStats: classData.baseStats,
          equipment: [],
          inventory: [],
          generation: 1,
          parentIds: [],
          children: [],
          lastActive: new Date().toISOString(),
          gold: goldToInherit,
          status: 'active',
          legacyBonus: {},
          party: [],
          completedRaids: {},
          quests: [],
          completedQuests: [],
          activePassives: [],
          unlockedAchievements: [],
          equippedTitle: null,
        };
    }

    dispatch({ type: 'CREATE_CHARACTER', payload: newCharacter });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-surface-1 animate-fade-in">
      <Card className="w-full max-w-4xl animate-slide-up">
        <h1 className="text-4xl font-bold text-center mb-2 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Create Your Legacy</h1>
        <p className="text-center text-on-background mb-8">
            {state.pendingGeneration ? 'A new heir is born!' : 'Forge a new hero to begin your journey through generations.'}
        </p>

        {state.pendingGeneration && <LegacyInfo onSelectHeir={setSelectedHeirId} selectedHeirId={selectedHeirId} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Name, Class, Personality */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold mb-2 text-on-surface">Character Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your hero's name"
                className="w-full px-4 py-2 bg-surface-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!!selectedHeir}
              />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2 text-on-surface">Choose Your Class</h2>
              <div className={`grid grid-cols-2 gap-4 ${!!selectedHeir ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {Object.keys(CLASSES).map((key) => {
                  const classKey = key as CharacterClassType;
                  const c = CLASSES[classKey];
                  return (
                    <div
                      key={classKey}
                      onClick={() => !selectedHeir && setSelectedClass(classKey)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${!selectedHeir ? 'cursor-pointer' : ''} ${selectedClass === classKey ? 'border-primary bg-primary/10' : 'border-surface-2 hover:border-primary/50'}`}
                    >
                      <div className={`flex items-center justify-center mb-2 ${c.color}`}>{c.icon}</div>
                      <h3 className={`text-center font-bold ${c.color}`}>{c.name}</h3>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2 text-on-surface">Choose Your Personality</h2>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(PERSONALITY_TRAITS).map((key) => {
                  const traitKey = key as PersonalityTrait;
                  const trait = PERSONALITY_TRAITS[traitKey];
                  return (
                    <button
                      key={traitKey}
                      onClick={() => setSelectedPersonality(traitKey)}
                      className={`p-2 text-center rounded-lg border-2 transition-all duration-200 ${selectedPersonality === traitKey ? 'border-secondary bg-secondary/10' : 'border-surface-2 hover:border-secondary/50'}`}
                      title={trait.description}
                    >
                      <h3 className={`font-bold text-sm ${selectedPersonality === traitKey ? 'text-secondary' : ''}`}>{trait.name}</h3>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Side: Class Details */}
          <div className="flex flex-col">
            <Card className="bg-surface-2 flex-grow">
              <div className="text-center mb-4">
                <div className={`inline-block p-2 rounded-full bg-surface-1 ${CLASSES[selectedClass].color}`}>
                  {CLASSES[selectedClass].icon}
                </div>
                <h2 className={`text-2xl font-bold mt-2 ${CLASSES[selectedClass].color}`}>{CLASSES[selectedClass].name}</h2>
              </div>
              <p className="text-on-background text-center mb-4">{CLASSES[selectedClass].description}</p>
              <div className="text-sm space-y-1 text-on-background/80">
                {Object.entries(selectedHeir ? selectedHeir.baseStats : CLASSES[selectedClass].baseStats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between">
                    <span className="capitalize">{stat}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleCreateCharacter} disabled={!name.trim() || isLoading} isLoading={isLoading} className="w-full md:w-1/2 text-xl py-3">
            Begin Adventure
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CharacterCreator;
