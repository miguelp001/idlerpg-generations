import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

interface TutorialModalProps {
    onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="tutorial-modal-title">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
                <h2 id="tutorial-modal-title" className="text-3xl font-bold mb-6 text-primary text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>How to Play Idle RPG Generations</h2>

                <div className="space-y-6 text-on-background/90">
                    <section>
                        <h3 className="text-2xl font-semibold mb-3 text-secondary">Character Creation and Progression</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Create Your Character:</strong> Start by creating your first character. Choose a class (Warrior, Mage, Rogue, Cleric) and customize their appearance.</li>
                            <li><strong>Level Up:</strong> Your character will automatically gain experience and levels by engaging in activities.</li>
                            <li><strong>Stats and Equipment:</strong> As your character levels up, their stats will increase. Equip new items from your inventory or the shop to further boost your power. Pay attention to class affinities for bonus stats!</li>
                            <li><strong>Retirement:</strong> Once your character reaches a certain level, they can retire. Retiring a character allows them to pass on a powerful heirloom and a legacy bonus to their heir, making future generations stronger.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3 text-secondary">Adventures and Combat</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Dungeons:</strong> Send your character into dungeons to fight monsters, gain experience, and find loot. Dungeons have a recommended level and a boss at the end.</li>
                            <li><strong>Raids:</strong> For higher-level characters and guilds, raids offer greater challenges and rewards. You'll need to join or create a guild to participate in raids.</li>
                            <li><strong>Combat:</strong> Combat is automated. Your character and their party will fight enemies based on their stats and abilities.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3 text-secondary">Social Features</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Tavern:</strong> Visit the tavern to recruit new adventurers to join your party. A larger party means more combat power! You can refresh the available adventurers for a small gold cost.</li>
                            <li><strong>Relationships:</strong> Your character and their party members will develop relationships over time, which can influence various aspects of the game.</li>
                            <li><strong>Guilds:</strong> Create or join a guild to team up with other players (NPCs in this single-player version) for shared goals and raid progression. Donate gold to your guild to level it up.</li>
                            <li><strong>Shop:</strong> The shop offers a rotating selection of equipment. Items around your current level will be available, along with one rare, high-level item. You can refresh the shop's inventory for 200 gold.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3 text-secondary">Generations</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Heirs and Legacy:</strong> When a character retires, you can choose an heir from their potential offspring. The heir will inherit a powerful heirloom and a permanent legacy bonus based on the retired character's achievements.</li>
                            <li><strong>Building a Dynasty:</strong> Each new generation starts with advantages from their predecessors, allowing you to tackle increasingly difficult content and build a powerful family lineage.</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8 flex justify-center">
                    <Button onClick={onClose} variant="primary">Got It!</Button>
                </div>
            </Card>
        </div>
    );
};

export default TutorialModal; 