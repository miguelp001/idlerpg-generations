
import React, { useState, useMemo } from 'react';
import { Equipment, Adventurer, Ability, EquipmentSlot, GameStats, Character } from '../types';
import { calculateXpForLevel, CLASSES, RARITY_COLORS, RETIREMENT_LEVEL, GUILD_XP_TABLE, PERSONALITY_TRAITS } from '../constants';
import { SETS } from '../data/sets';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';
import Toggle from './ui/Toggle';
import { useGame } from '../context/GameContext';
import { getUnlockedAbilities } from '../services/abilityService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const EquipmentDisplay: React.FC<{ items: Equipment[], onSelect?: (id: string) => void, selectedId?: string | null, isSelectionMode?: boolean }> = React.memo(({ items, onSelect, selectedId, isSelectionMode = false }) => {
    if (items.length === 0) {
        return (
            <div className="text-center p-8 text-on-background/70">
                <p>No equipment to display.</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${isSelectionMode ? 'p-2 bg-black/20 rounded-lg' : ''}`}>
            {items.map(item => (
                <div 
                    key={item.id} 
                    className={`bg-surface-2 p-3 rounded-lg border-2 ${isSelectionMode ? 'cursor-pointer' : ''} ${selectedId === item.id ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => onSelect && onSelect(item.id)}
                >
                    <p className={`font-bold ${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
                    <p className="text-sm capitalize text-on-background/70">{item.slot}</p>
                    <div className="text-sm mt-1">
                        {Object.entries(item.stats).map(([stat, value]) => (
                            <p key={stat} className="text-green-400">
                                +{value} <span className="capitalize text-on-background/70">{stat}</span>
                            </p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
});

const RetirementModal: React.FC<{ characterId: string, equipment: Equipment[], onclose: () => void }> = ({ characterId, equipment, onclose }) => {
    const { dispatch } = useGame();
    const [selectedHeirloomId, setSelectedHeirloomId] = useState<string | null>(null);

    const handleConfirmRetirement = () => {
        if (!selectedHeirloomId) return;
        dispatch({ type: 'RETIRE_CHARACTER', payload: { characterId, heirloomId: selectedHeirloomId } });
        onclose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="w-full max-w-2xl animate-slide-up">
                <h2 className="text-3xl font-bold mb-4 text-primary">Retire and Pass the Mantle</h2>
                <p className="text-on-background/80 mb-6">Your hero's journey comes to an end, but their legacy will empower the next generation. Select one piece of your currently equipped gear to become a timeless Heirloom.</p>
                
                <h3 className="text-xl font-semibold mb-2">Select Heirloom</h3>
                <EquipmentDisplay items={equipment} onSelect={setSelectedHeirloomId} selectedId={selectedHeirloomId} isSelectionMode={true}/>
                
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="ghost" onClick={onclose}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmRetirement} disabled={!selectedHeirloomId}>
                        Confirm Retirement
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const AbilityDisplay: React.FC<{ ability: Ability, characterId: string, isActive: boolean, isPassive: boolean }> = React.memo(({ ability, characterId, isActive, isPassive }) => {
    const { dispatch } = useGame();
    
    const handleToggle = () => {
        dispatch({ type: 'TOGGLE_PASSIVE_ABILITY', payload: { characterId, abilityId: ability.id } });
    }

    return (
        <div className="flex justify-between items-start bg-surface-2 p-3 rounded-lg">
            <div className="flex-1">
                <p className="font-bold text-on-surface">{ability.name}</p>
                <p className="text-sm text-on-background/70">{ability.description}</p>
                <div className="text-xs mt-1 text-secondary">
                    {ability.manaCost && <span>Cost: {ability.manaCost} Mana</span>}
                    {ability.cooldown && <span className="ml-2">CD: {ability.cooldown} Turns</span>}
                </div>
            </div>
            {isPassive && (
                <Toggle
                    checked={isActive}
                    onChange={handleToggle}
                />
            )}
        </div>
    )
});

const AdventurerEquipmentDisplay: React.FC<{ adventurer: Adventurer }> = React.memo(({ adventurer }) => {
    const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
    return (
        <div className="mt-2 grid grid-cols-3 gap-1">
            {slots.map(slot => {
                const item = adventurer.equipment.find(e => e.slot === slot);
                return (
                    <div key={slot} className="bg-black/20 p-1 rounded text-center h-16 flex items-center justify-center" title={item ? `${item.name} (+${Object.values(item.stats)[0]} ${Object.keys(item.stats)[0]})` : `No ${slot} equipped`}>
                        {item ? (
                            <span className={`text-xs ${RARITY_COLORS[item.rarity]}`}>{item.name}</span>
                        ) : (
                            <span className="text-xs text-on-background/40">{slot}</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
});

const SetBonusDisplay: React.FC<{ equipment: Equipment[], accessorySlots: (Equipment | null)[] }> = React.memo(({ equipment, accessorySlots }) => {
    const equippedSets: Record<string, { count: number, max: number }> = {};
    
    // Count items from main equipment
    for (const item of equipment) {
        if (item.setId) {
            if (!equippedSets[item.setId]) {
                const setMax = Math.max(...Object.keys(SETS[item.setId].bonuses).map(Number));
                equippedSets[item.setId] = { count: 0, max: setMax };
            }
            equippedSets[item.setId].count++;
        }
    }

    // Count items from accessory slots
    for (const item of accessorySlots) {
        if (item && item.setId) {
            if (!equippedSets[item.setId]) {
                const setMax = Math.max(...Object.keys(SETS[item.setId].bonuses).map(Number));
                equippedSets[item.setId] = { count: 0, max: setMax };
            }
            equippedSets[item.setId].count++;
        }
    }

    const activeBonuses = Object.entries(equippedSets).filter(([, { count }]) => {
        const set = SETS[Object.keys(equippedSets).find(k => k === Object.keys(equippedSets)[0])!]; // Bit of a hack to get the set
        return Object.keys(set.bonuses).some(req => count >= Number(req));
    });

    if (activeBonuses.length === 0) {
        return null;
    }

    const formatBonus = (bonus: Partial<GameStats>) => {
        return Object.entries(bonus)
            .map(([stat, value]) => `+${value} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`)
            .join(', ');
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-primary">Set Bonuses</h2>
            <div className="space-y-3">
                {Object.entries(equippedSets).map(([setId, { count, max }]) => {
                    const set = SETS[setId];
                    if (!set) return null;
                    return (
                        <div key={setId}>
                            <p className="font-bold text-purple-400">{set.name} ({count}/{max})</p>
                            <ul className="list-disc list-inside ml-2 text-sm">
                                {Object.entries(set.bonuses).map(([req, bonus]) => (
                                    <li key={req} className={count >= Number(req) ? 'text-green-400' : 'text-on-background/60'}>
                                        <span className="font-semibold">({req})</span> {formatBonus(bonus)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
});


const CharacterSheet: React.FC = () => {
    const { state, resetGame, activeCharacter } = useGame();
    const [isRetireModalOpen, setRetireModalOpen] = useState(false);
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    
    const character = activeCharacter;
    const guild = state.guild && character?.guildId === state.guild.id ? state.guild : null;

    const unlockedAbilities = useMemo(() => character ? getUnlockedAbilities(character) : [], [character]);
    const activeAbilities = useMemo(() => unlockedAbilities.filter(a => a.type === 'active'), [unlockedAbilities]);
    const passiveAbilities = useMemo(() => unlockedAbilities.filter(a => a.type === 'passive'), [unlockedAbilities]);

    const statsData = useMemo(() => {
        if (!character) return [];
        return [
            { subject: 'Attack', A: character.stats.attack, fullMark: character.maxStats.attack * 1.5 },
            { subject: 'Defense', A: character.stats.defense, fullMark: character.maxStats.defense * 1.5 },
            { subject: 'Agility', A: character.stats.agility, fullMark: character.maxStats.agility * 1.5 },
            { subject: 'Int.', A: character.stats.intelligence, fullMark: character.maxStats.intelligence * 1.5 },
        ];
    }, [character?.stats, character?.maxStats]);

    if (!character) return null;

    const classInfo = CLASSES[character.class];
    const personalityInfo = PERSONALITY_TRAITS[character.personality];
    const partner = character.partnerId ? character.party.find(p => p.id === character.partnerId) || state.characters.find(c => c.id === character.partnerId) : null;
    
  return (
    <>
      {isResetModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
              <Card className="w-full max-w-lg animate-slide-up">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-red-500">Destroy Legacy?</h2>
                  <p className="text-sm sm:text-base text-on-background/80 mb-4 sm:mb-6">
                      Are you absolutely sure? This action will permanently delete all of your progress, including all characters, items, achievements, and guild progress. 
                      <strong className="text-red-400"> This cannot be undone.</strong>
                  </p>
                  <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-4">
                      <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
                      <Button 
                          onClick={resetGame}
                          className="bg-red-600 hover:bg-red-700 text-on-primary focus:ring-red-500"
                      >
                          Yes, Start a New Legacy
                      </Button>
                  </div>
              </Card>
          </div>
      )}
      {isRetireModalOpen && (
        <RetirementModal 
            characterId={character.id}
            equipment={character.equipment}
            onclose={() => setRetireModalOpen(false)}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Character Info */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <Card>
              <div className="flex flex-col items-center text-center p-3 sm:p-4">
                  <div className={`p-3 sm:p-4 bg-surface-2 rounded-full mb-3 sm:mb-4 ${classInfo.color}`}>
                      {classInfo.icon}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{character.name}</h1>
                  {character.equippedTitle && <p className="text-xl sm:text-2xl text-yellow-400 font-semibold mt-0.5 sm:mt-1">"{character.equippedTitle}"</p>}
                  <p className={`text-lg sm:text-xl font-semibold ${classInfo.color} mt-1 sm:mt-2`}>{classInfo.name} - Level {character.level}</p>
                  <p className="text-sm text-on-background/70">Generation {character.generation}</p>
                   <p className="text-xs sm:text-sm font-semibold text-secondary mt-0.5 sm:mt-1" title={personalityInfo.description}>{personalityInfo.name}</p>
                    {partner && (
                        <p className="text-sm sm:text-base text-pink-400 mt-1 sm:mt-2">
                            Married to {partner.name}
                        </p>
                    )}
              </div>
          </Card>
          <Card>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Progression</h2>
              <div className="space-y-3 sm:space-y-4">
                  <ProgressBar label="XP" value={character.experience} max={calculateXpForLevel(character.level)} colorClass="bg-yellow-500" />
                  <ProgressBar label="Health" value={character.currentHealth ?? character.stats.health} max={character.maxStats.health} colorClass="bg-red-500" />
                  <ProgressBar label="Mana" value={character.currentMana ?? character.stats.mana} max={character.maxStats.mana} colorClass="bg-blue-500" />
              </div>
          </Card>
           <SetBonusDisplay equipment={character.equipment} accessorySlots={character.accessorySlots} />
          {guild && (
              <Card>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Guild</h2>
                  <p className="text-xl sm:text-2xl font-bold text-secondary">{guild.name}</p>
                  <p className="text-md sm:text-lg font-semibold mb-2 sm:mb-3">Level {guild.level}</p>
                  <ProgressBar label="Guild XP" value={guild.xp} max={GUILD_XP_TABLE[guild.level] || guild.xp} colorClass="bg-purple-500" />
              </Card>
          )}
          {character.level >= RETIREMENT_LEVEL && (
              <Card>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-2 text-primary">Legacy</h2>
                  <p className="text-sm sm:text-base text-on-background/80 mb-3 sm:mb-4">Your hero is ready to retire and pass on their legacy.</p>
                  <Button variant="secondary" className="w-full" onClick={() => setRetireModalOpen(true)}>
                      Retire Hero
                  </Button>
              </Card>
          )}
        </div>

        {/* Right Column: Stats & Equipment */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Core Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                              <PolarGrid stroke="#444" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#e0e0e0', fontSize: 12 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} />
                              <Radar name={character.name} dataKey="A" stroke="#bb86fc" fill="#bb86fc" fillOpacity={0.6} />
                              <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444' }}/>
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-md sm:text-lg">
                      {Object.entries(character.stats).map(([stat, value]) => {
                          const displayValue = stat === 'health' ? character.currentHealth : stat === 'mana' ? character.currentMana : value;
                          return (
                            <div key={stat} className="flex justify-between p-1 sm:p-2 bg-surface-2 rounded">
                                <span className="capitalize font-semibold text-on-surface">{stat}</span>
                                <span className="text-secondary font-mono">{displayValue}</span>
                            </div>
                          )
                      })}
                  </div>
              </div>
          </Card>
           <Card>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Abilities</h2>
              <div className="space-y-3 sm:space-y-4">
                  <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-secondary">Active Abilities</h3>
                      <div className="space-y-2">
                        {activeAbilities.length > 0 ? activeAbilities.map(ability => (
                            <AbilityDisplay key={ability.id} ability={ability} characterId={character.id} isPassive={false} isActive={false} />
                        )) : <p className="text-on-background/70 text-sm sm:text-base">No active abilities learned.</p>}
                      </div>
                  </div>
                  <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-secondary">Passive Abilities</h3>
                       <div className="space-y-2">
                        {passiveAbilities.length > 0 ? passiveAbilities.map(ability => (
                            <AbilityDisplay key={ability.id} ability={ability} characterId={character.id} isPassive={true} isActive={character.activePassives.includes(ability.id)} />
                        )) : <p className="text-on-background/70 text-sm sm:text-base">No passive abilities learned.</p>}
                      </div>
                  </div>
              </div>
          </Card>
          <Card>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Party</h2>
              {character.party.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {character.party.map((member: Adventurer) => (
                        <div key={member.id} className="bg-surface-2 p-3 rounded-lg">
                            <p className="font-bold text-on-surface text-base sm:text-lg">{member.name}</p>
                            <p className={`text-sm ${CLASSES[member.class].color}`}>Lvl {member.level} {CLASSES[member.class].name}</p>
                            <AdventurerEquipmentDisplay adventurer={member} />
                        </div>
                    ))}
                </div>
              ) : (
                <p className="text-on-background/70 text-center py-4 text-sm sm:text-base">Your party is empty. Visit the Tavern to recruit members.</p>
              )}
          </Card>
          <Card>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Equipment</h2>
              <EquipmentDisplay items={character.equipment} />
          </Card>
        </div>
      </div>
      <div className="mt-4 sm:mt-6">
        <Card>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-red-500">Danger Zone</h2>
            <p className="text-on-background/80 mb-3 sm:mb-4">Start over from the very beginning. This will wipe all saved data.</p>
            <Button
                className="w-full bg-red-600 hover:bg-red-700 text-on-primary focus:ring-red-500"
                onClick={() => setResetModalOpen(true)}
            >
                Start New Legacy
            </Button>
        </Card>
      </div>
    </>
  );
};

export default CharacterSheet;
