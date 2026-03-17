

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
    GUILD_CREATE_COST, 
    GUILD_DONATION_GOLD, 
    GUILD_DONATION_XP, 
    GUILD_XP_TABLE, 
    CLASSES, 
    GUILD_LEVEL_BONUS,
    GUILD_UPGRADE_BASE_COST,
    GUILD_UPGRADE_COST_MULTIPLIER,
    GUILD_BARRACKS_BONUS,
    GUILD_VAULT_BONUS,
    GUILD_LIBRARY_BONUS
} from '../constants';
import { RAIDS } from '../data/raids';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
import { ShieldCheckIcon, GoldIcon, BookOpenIcon } from './ui/Icons';

const CreateGuildView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const [guildName, setGuildName] = useState('');

    if (!activeCharacter) return null;

    const existingGuild = state.guild;
    const canAfford = activeCharacter.gold >= GUILD_CREATE_COST;

    const handleCreate = () => {
        if (!guildName.trim()) {
            alert('Guild name cannot be empty.');
            return;
        }
        dispatch({ type: 'CREATE_GUILD', payload: { characterId: activeCharacter.id, guildName } });
    };

    const handleJoin = () => {
        dispatch({ type: 'JOIN_GUILD', payload: { characterId: activeCharacter.id } });
    };

    return (
        <Card className="text-center">
            <h2 className="text-3xl font-bold text-secondary mb-4">Found a Guild</h2>
            <p className="text-on-background/80 mb-6">
                {existingGuild 
                    ? `A guild named "${existingGuild.name}" already exists. You can join it or found your own (if none existed).`
                    : "The world is dangerous. Forge an alliance to take on the greatest threats."}
            </p>
            
            <div className="max-w-md mx-auto space-y-6">
                {existingGuild ? (
                    <div className="p-6 bg-surface-2 rounded-lg border border-primary/20">
                        <h3 className="text-xl font-bold text-primary mb-2">{existingGuild.name}</h3>
                        <p className="text-sm text-on-background/70 mb-4 font-semibold text-secondary">Level {existingGuild.level}</p>
                        <Button onClick={handleJoin} className="w-full" variant="shadow">
                            Join This Guild
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={guildName}
                            onChange={(e) => setGuildName(e.target.value)}
                            placeholder="Enter Guild Name"
                            className="w-full px-4 py-2 bg-surface-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button onClick={handleCreate} disabled={!canAfford || !guildName.trim()} className="w-full">
                            Create Guild ({GUILD_CREATE_COST.toLocaleString()}G)
                        </Button>
                        {!canAfford && <p className="text-red-400">You don't have enough gold.</p>}
                    </div>
                )}
            </div>
        </Card>
    );
};

const ManageGuildView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const [donationAmount, setDonationAmount] = useState('');
    const [activeTab, setActiveTab] = useState<'raids' | 'upgrades'>('raids');
    const guild = state.guild;

    if (!activeCharacter || !guild) return null;

    const handleDonate = () => {
        const amount = parseInt(donationAmount, 10);
        if (isNaN(amount) || amount <= 0 || amount > activeCharacter.gold) return;
        dispatch({ type: 'DONATE_TO_GUILD', payload: { characterId: activeCharacter.id, amount } });
        setDonationAmount('');
    };

    const handleUpgrade = (type: 'barracks' | 'vault' | 'library') => {
        dispatch({ type: 'UPGRADE_GUILD', payload: { characterId: activeCharacter.id, upgradeType: type } });
    };

    const handleStartRaid = (raidId: string) => {
        dispatch({ type: 'START_RAID', payload: { raidId } });
    };

    const xpForNextLevel = GUILD_XP_TABLE[guild.level] || null;

    const parsedDonation = parseInt(donationAmount, 10);
    const isDonationInvalid = isNaN(parsedDonation) || parsedDonation <= 0 || parsedDonation > activeCharacter.gold;
    const xpFromDonation = isNaN(parsedDonation) || parsedDonation <= 0 ? 0 : Math.floor(parsedDonation * (GUILD_DONATION_XP / GUILD_DONATION_GOLD));

    const getUpgradeCost = (level: number) => Math.floor(GUILD_UPGRADE_BASE_COST * Math.pow(GUILD_UPGRADE_COST_MULTIPLIER, level));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <h2 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>{guild.name}</h2>
                    <p className="text-xl font-semibold text-secondary mb-4">
                        Guild Level {guild.level}
                        {!xpForNextLevel && <span className="text-gold-400 ml-2">(MAX LEVEL)</span>}
                    </p>
                    {xpForNextLevel ? (
                        <ProgressBar label="Guild XP" value={guild.experience} max={xpForNextLevel} colorClass="bg-purple-500" />
                    ) : (
                        <div className="text-center text-gold-400 font-semibold py-2">
                            Maximum Guild Level Reached!
                        </div>
                    )}
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4">Passive Bonuses</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-surface-2 rounded">
                            <span className="text-on-background/80">Stat Increase</span>
                            <span className="text-green-400 font-bold">+{Math.round((guild.level * GUILD_LEVEL_BONUS + (guild.upgrades?.barracks || 0) * GUILD_BARRACKS_BONUS) * 100)}%</span>
                        </div>
                        {guild.upgrades?.vault > 0 && (
                            <div className="flex justify-between items-center p-2 bg-surface-2 rounded">
                                <span className="text-on-background/80">Gold Bonus</span>
                                <span className="text-yellow-400 font-bold">+{Math.round(guild.upgrades.vault * GUILD_VAULT_BONUS * 100)}%</span>
                            </div>
                        )}
                        {guild.upgrades?.library > 0 && (
                            <div className="flex justify-between items-center p-2 bg-surface-2 rounded">
                                <span className="text-on-background/80">XP Bonus</span>
                                <span className="text-blue-400 font-bold">+{Math.round(guild.upgrades.library * GUILD_LIBRARY_BONUS * 100)}%</span>
                            </div>
                        )}
                        <p className="text-xs text-on-background/60 italic">Applying to all guild members.</p>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-primary mb-4">Contribute</h3>
                    {xpForNextLevel ? (
                        <>
                            <p className="text-on-background/80 mb-4">Donate gold to help your guild grow and unlock new challenges. (100 XP per 500G)</p>
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="donation-amount" className="sr-only">Donation Amount</label>
                                    <input
                                        id="donation-amount"
                                        type="number"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        placeholder={`Max: ${activeCharacter.gold.toLocaleString()} G`}
                                        min="1"
                                        max={activeCharacter.gold}
                                        className="w-full px-4 py-2 bg-surface-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <p className="text-center text-secondary font-semibold">XP Gain: {xpFromDonation.toLocaleString()}</p>
                                <Button onClick={handleDonate} disabled={isDonationInvalid} className="w-full">
                                    Donate
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-on-background/60 py-4">
                            <p className="mb-2">Your guild has reached maximum level!</p>
                            <p className="text-sm">All raids and content are now available.</p>
                        </div>
                    )}
                </Card>
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-primary">Guild Hall members</h3>
                        <span className="text-sm text-on-background/60">{(guild.members?.length ?? 0) + 1} Members</span>
                    </div>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        <li className="flex items-center p-2 bg-surface-2/50 border border-secondary/20 rounded">
                            <span className="font-bold text-on-surface flex-grow">{activeCharacter.name} (Leader)</span>
                            <span className={`text-sm font-semibold ${CLASSES[activeCharacter.class].color}`}>Lvl {activeCharacter.level} {CLASSES[activeCharacter.class].name}</span>
                        </li>
                        {(guild.members ?? []).map(member => (
                            <li key={member.id} className="flex items-center p-2 bg-surface-2 rounded">
                                <span className="font-bold text-on-surface flex-grow">{member.name}</span>
                                <span className={`text-sm font-semibold ${CLASSES[member.class].color}`}>Lvl {member.level} {CLASSES[member.class].name}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-primary mb-4">Recruit to Guild</h3>
                    <p className="text-on-background/70 text-sm mb-4">Add talented travelers to your guild's roster to increase your collective power.</p>
                    <div className="space-y-3">
                        {state.tavernAdventurers.length > 0 ? (
                            state.tavernAdventurers.map(adventurer => (
                                <div key={adventurer.id} className="flex items-center justify-between p-2 bg-surface-2 rounded">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{adventurer.name}</span>
                                        <span className={`text-xs ${CLASSES[adventurer.class].color}`}>Lvl {adventurer.level} {CLASSES[adventurer.class].name}</span>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="void"
                                        onClick={() => dispatch({ type: 'RECRUIT_TO_GUILD', payload: { characterId: activeCharacter.id, adventurerId: adventurer.id } })}
                                    >
                                        Recruit
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-on-background/50 text-center py-2 italic text-sm">No travelers currently in the tavern.</p>
                        )}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="flex space-x-4 mb-4">
                    <button 
                        onClick={() => setActiveTab('raids')}
                        className={`px-6 py-2 rounded-t-lg font-bold transition-all ${activeTab === 'raids' ? 'bg-surface-1 text-primary border-b-2 border-primary' : 'bg-surface-2 text-on-background/50 hover:text-on-background'}`}
                    >
                        Guild Raids
                    </button>
                    <button 
                        onClick={() => setActiveTab('upgrades')}
                        className={`px-6 py-2 rounded-t-lg font-bold transition-all ${activeTab === 'upgrades' ? 'bg-surface-1 text-primary border-b-2 border-primary' : 'bg-surface-2 text-on-background/50 hover:text-on-background'}`}
                    >
                        Guild Upgrades
                    </button>
                </div>

                {activeTab === 'raids' ? (
                    <Card>
                        <h2 className="text-3xl font-bold text-secondary mb-4">Guild Raids</h2>
                        <div className="space-y-4">
                            {RAIDS.map(raid => {
                                const canEnter = guild.level >= raid.guildLevelRequirement;
                                const completedTimestamp = activeCharacter.completedRaids?.[raid.id];
                                const onCooldown = completedTimestamp && (new Date().getTime() - new Date(completedTimestamp).getTime()) < 7 * 24 * 60 * 60 * 1000;
                                const isLocked = !canEnter || onCooldown;

                                return (
                                    <Card key={raid.id} className={`bg-surface-2 ${isLocked ? 'opacity-60' : ''}`}>
                                        <h3 className="text-2xl font-bold">{raid.name}</h3>
                                        <p className="text-on-background/70 mb-2">{raid.description}</p>
                                        <p className="font-semibold mb-4">
                                            Required Guild Level: 
                                            <span className={guild.level >= raid.guildLevelRequirement ? 'text-green-400' : 'text-red-400'}> {raid.guildLevelRequirement}</span>
                                        </p>
                                        <Button onClick={() => handleStartRaid(raid.id)} disabled={!!isLocked} className="w-full">
                                            {onCooldown ? 'Completed this week' : (canEnter ? 'Enter Raid' : 'Guild Level Too Low')}
                                        </Button>
                                    </Card>
                                )
                            })}
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <h2 className="text-3xl font-bold text-secondary mb-6">Guild Facilities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <UpgradeCard 
                                title="Barracks" 
                                description="Improves combat training. Increases all stats for guild members."
                                level={guild.upgrades?.barracks || 0}
                                bonus={`+${Math.round((guild.upgrades?.barracks || 0) * GUILD_BARRACKS_BONUS * 100)}% Stats`}
                                cost={getUpgradeCost(guild.upgrades?.barracks || 0)}
                                canAfford={activeCharacter.gold >= getUpgradeCost(guild.upgrades?.barracks || 0)}
                                onUpgrade={() => handleUpgrade('barracks')}
                                icon={<ShieldCheckIcon className="w-10 h-10 text-primary" />}
                            />
                            <UpgradeCard 
                                title="Vault" 
                                description="Better gold management and storage. Increases gold found from enemies."
                                level={guild.upgrades?.vault || 0}
                                bonus={`+${Math.round((guild.upgrades?.vault || 0) * GUILD_VAULT_BONUS * 100)}% Gold`}
                                cost={getUpgradeCost(guild.upgrades?.vault || 0)}
                                canAfford={activeCharacter.gold >= getUpgradeCost(guild.upgrades?.vault || 0)}
                                onUpgrade={() => handleUpgrade('vault')}
                                icon={<GoldIcon className="w-10 h-10 text-yellow-400" />}
                            />
                            <UpgradeCard 
                                title="Library" 
                                description="A collection of ancient battle logs. Increases experience gained."
                                level={guild.upgrades?.library || 0}
                                bonus={`+${Math.round((guild.upgrades?.library || 0) * GUILD_LIBRARY_BONUS * 100)}% XP`}
                                cost={getUpgradeCost(guild.upgrades?.library || 0)}
                                canAfford={activeCharacter.gold >= getUpgradeCost(guild.upgrades?.library || 0)}
                                onUpgrade={() => handleUpgrade('library')}
                                icon={<BookOpenIcon className="w-10 h-10 text-blue-400" />}
                            />
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

const UpgradeCard: React.FC<{ 
    title: string; 
    description: string; 
    level: number; 
    bonus: string; 
    cost: number; 
    canAfford: boolean; 
    onUpgrade: () => void;
    icon: React.ReactNode;
}> = ({ title, description, level, bonus, cost, canAfford, onUpgrade, icon }) => (
    <div className="p-4 bg-surface-2 rounded-lg border border-secondary/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
            <div className="p-3 bg-surface-1 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold text-on-surface">{title}</h4>
                <p className="text-sm text-secondary font-semibold">Level {level}</p>
            </div>
        </div>
        <p className="text-on-background/70 text-sm mb-4 flex-grow">{description}</p>
        <div className="bg-surface-1/50 p-3 rounded mb-4">
            <p className="text-xs text-on-background/50 uppercase font-bold tracking-wider mb-1">Current Bonus</p>
            <p className="text-lg font-bold text-green-400">{bonus}</p>
        </div>
        <Button 
            onClick={onUpgrade} 
            disabled={!canAfford} 
            className="w-full mt-auto"
            variant={canAfford ? 'shadow' : 'void'}
        >
            Upgrade ({cost.toLocaleString()}G)
        </Button>
    </div>
);


const GuildView: React.FC = () => {
    const { state, activeCharacter } = useGame();

    const isInGuild = state.guild && activeCharacter?.guildId === state.guild.id;

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-8 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {isInGuild ? "Guild Hall" : "Guild Registrar"}
            </h1>
            {isInGuild ? <ManageGuildView /> : <CreateGuildView />}
        </div>
    );
};

export default GuildView;
