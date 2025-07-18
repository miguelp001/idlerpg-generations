

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GUILD_CREATE_COST, GUILD_DONATION_GOLD, GUILD_DONATION_XP, GUILD_XP_TABLE, CLASSES } from '../constants';
import { RAIDS } from '../data/raids';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

const CreateGuildView: React.FC = () => {
    const { dispatch, activeCharacter } = useGame();
    const [guildName, setGuildName] = useState('');

    if (!activeCharacter) return null;

    const canAfford = activeCharacter.gold >= GUILD_CREATE_COST;

    const handleCreate = () => {
        if (!guildName.trim()) {
            alert('Guild name cannot be empty.');
            return;
        }
        dispatch({ type: 'CREATE_GUILD', payload: { characterId: activeCharacter.id, guildName } });
    };

    return (
        <Card className="text-center">
            <h2 className="text-3xl font-bold text-secondary mb-4">Found a Guild</h2>
            <p className="text-on-background/80 mb-6">The world is dangerous. Forge an alliance to take on the greatest threats.</p>
            <div className="max-w-md mx-auto space-y-4">
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
        </Card>
    );
};

const ManageGuildView: React.FC = () => {
    const { state, dispatch, activeCharacter } = useGame();
    const [donationAmount, setDonationAmount] = useState('');
    const guild = state.guild;

    if (!activeCharacter || !guild) return null;

    const handleDonate = () => {
        const amount = parseInt(donationAmount, 10);
        if (isNaN(amount) || amount <= 0 || amount > activeCharacter.gold) return;
        dispatch({ type: 'DONATE_TO_GUILD', payload: { characterId: activeCharacter.id, amount } });
        setDonationAmount('');
    };

    const handleStartRaid = (raidId: string) => {
        dispatch({ type: 'START_RAID', payload: { raidId } });
    };

        const xpForNextLevel = GUILD_XP_TABLE[guild.level] || null;

    const parsedDonation = parseInt(donationAmount, 10);
    const isDonationInvalid = isNaN(parsedDonation) || parsedDonation <= 0 || parsedDonation > activeCharacter.gold;
    const xpFromDonation = isNaN(parsedDonation) || parsedDonation <= 0 ? 0 : Math.floor(parsedDonation * (GUILD_DONATION_XP / GUILD_DONATION_GOLD));

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
                        <ProgressBar label="Guild XP" value={guild.xp} max={xpForNextLevel} colorClass="bg-purple-500" />
                    ) : (
                        <div className="text-center text-gold-400 font-semibold py-2">
                            Maximum Guild Level Reached!
                        </div>
                    )}
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
                    <h3 className="text-xl font-bold text-primary mb-4">Members</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center p-2 bg-surface-2 rounded">
                            <span className="font-bold text-on-surface flex-grow">{activeCharacter.name} (Leader)</span>
                            <span className={`text-sm font-semibold ${CLASSES[activeCharacter.class].color}`}>Lvl {activeCharacter.level} {CLASSES[activeCharacter.class].name}</span>
                        </li>
                        {activeCharacter.party.map(member => (
                            <li key={member.id} className="flex items-center p-2 bg-surface-2 rounded">
                                <span className="font-bold text-on-surface flex-grow">{member.name}</span>
                                <span className={`text-sm font-semibold ${CLASSES[member.class].color}`}>Lvl {member.level} {CLASSES[member.class].name}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-3xl font-bold text-secondary mb-4">Guild Raids</h2>
                    <div className="space-y-4">
                        {RAIDS.map(raid => {
                            const canEnter = guild.level >= raid.guildLevelRequirement;
                            const completedTimestamp = activeCharacter.completedRaids[raid.id];
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
            </div>
        </div>
    );
};


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
