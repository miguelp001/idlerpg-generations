
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { QUESTS } from '../data/quests';
import { ALL_MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';
import { RARITY_COLORS } from '../constants';
import { PlayerQuest } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

const QuestCard: React.FC<{
    questId: string;
    playerQuest: PlayerQuest | undefined;
    isCompleted: boolean;
    onAccept: (id: string) => void;
    onTurnIn: (id: string) => void;
}> = React.memo(({ questId, playerQuest, isCompleted, onAccept, onTurnIn }) => {
    const quest = QUESTS[questId];
    if (!quest) return null;

    const renderObjectives = () => {
        return (
            <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-on-surface">Objectives:</h4>
                {quest.objectives.map((obj, index) => {
                    const playerObj = playerQuest?.objectives[index];
                    const targetName = obj.type === 'kill' ? ALL_MONSTERS[obj.targetId]?.name : 'Unknown';
                    const progress = playerObj?.currentAmount || 0;
                    return (
                        <div key={index}>
                            <p className="text-on-background/90"> - Slay {targetName} ({progress} / {obj.requiredAmount})</p>
                            <ProgressBar value={progress} max={obj.requiredAmount} colorClass="bg-secondary" />
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderRewards = () => (
        <div className="mt-4 pt-2 border-t border-surface-2">
            <h4 className="font-semibold text-on-surface">Rewards:</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-yellow-400">
                <span>{quest.rewards.xp} XP</span>
                <span>{quest.rewards.gold} Gold</span>
                {quest.rewards.items?.map(itemId => {
                    const item = ITEMS[itemId];
                    return item && <span key={itemId} className={RARITY_COLORS[item.rarity]}>{item.name}</span>
                })}
            </div>
        </div>
    );

    return (
        <Card className="flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-bold text-secondary">{quest.title}</h3>
                <p className="text-sm text-on-background/70 mb-2">Required Level: {quest.levelRequirement}</p>
                <p className="text-on-background/90">{quest.description}</p>
                {playerQuest && renderObjectives()}
            </div>
            <div className="mt-4">
                {!playerQuest && (
                    <Button onClick={() => onAccept(quest.id)} className="w-full">
                        Accept Quest
                    </Button>
                )}
                {isCompleted && (
                    <Button onClick={() => onTurnIn(quest.id)} variant="secondary" className="w-full">
                        Complete Quest
                    </Button>
                )}
                {playerQuest && !isCompleted && renderRewards()}
            </div>
        </Card>
    );
});


const QuestView: React.FC = () => {
    const { dispatch, activeCharacter } = useGame();
    const [activeTab, setActiveTab] = useState('active');
    
    if (!activeCharacter) return <div>Loading...</div>;

    const handleAcceptQuest = (questId: string) => {
        dispatch({ type: 'ACCEPT_QUEST', payload: { characterId: activeCharacter.id, questId } });
    };

    const handleTurnInQuest = (questId: string) => {
        dispatch({ type: 'TURN_IN_QUEST', payload: { characterId: activeCharacter.id, questId } });
    };

    const availableQuests = useMemo(() => Object.values(QUESTS).filter(q => 
        q.levelRequirement <= activeCharacter.level &&
        !activeCharacter.quests.some(pq => pq.questId === q.id) &&
        !activeCharacter.completedQuests.includes(q.id)
    ), [activeCharacter.level, activeCharacter.quests, activeCharacter.completedQuests]);
    
    const activeQuests = activeCharacter.quests;

    const checkCompletion = (playerQuest: PlayerQuest) => {
        return playerQuest.objectives.every(obj => obj.currentAmount >= obj.requiredAmount);
    };
    
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-bold mb-2 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Adventurer's Log</h1>
                <p className="text-lg text-on-background/80">Track your heroic deeds and seek out new opportunities for glory.</p>
            </div>

            <div className="flex space-x-2 border-b-2 border-surface-2">
                <button 
                    onClick={() => setActiveTab('active')} 
                    className={`px-6 py-2 text-lg font-semibold transition-colors ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-on-background/70'}`}
                >
                    My Quests ({activeQuests.length})
                </button>
                <button 
                    onClick={() => setActiveTab('available')} 
                    className={`px-6 py-2 text-lg font-semibold transition-colors ${activeTab === 'available' ? 'text-primary border-b-2 border-primary' : 'text-on-background/70'}`}
                >
                    Available Quests ({availableQuests.length})
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'active' && (
                    activeQuests.length > 0 ? activeQuests.map(pq => (
                        <QuestCard
                            key={pq.questId}
                            questId={pq.questId}
                            playerQuest={pq}
                            isCompleted={checkCompletion(pq)}
                            onAccept={handleAcceptQuest}
                            onTurnIn={handleTurnInQuest}
                        />
                    )) : <p className="text-on-background/70 md:col-span-2 lg:col-span-3 text-center py-8">You have no active quests. Visit the quest board to find work!</p>
                )}

                {activeTab === 'available' && (
                     availableQuests.length > 0 ? availableQuests.map(quest => (
                        <QuestCard
                            key={quest.id}
                            questId={quest.id}
                            playerQuest={undefined}
                            isCompleted={false}
                            onAccept={handleAcceptQuest}
                            onTurnIn={handleTurnInQuest}
                        />
                    )) : <p className="text-on-background/70 md:col-span-2 lg:col-span-3 text-center py-8">There are no new quests available for you at this time.</p>
                )}
            </div>
        </div>
    );
};

export default QuestView;
