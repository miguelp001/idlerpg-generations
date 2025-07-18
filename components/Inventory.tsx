import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentSlot, Character, Adventurer, CharacterClassType, EquipmentRarity } from '../types';
import { useGame } from '../context/GameContext';
import { RARITY_COLORS, UPGRADE_COST, SELL_PRICE, RARITY_ORDER } from '../constants';
import { SETS } from '../data/sets';
import Card from './ui/Card';
import Button from './ui/Button';
import { ExclamationTriangleIcon } from './ui/Icons';

const generateSimpleGiftResponse = (receiver: Adventurer, item: Equipment): { response: string; scoreChange: number; } => {
    let scoreChange = 5;
    let response = `Thank you for the ${item.name}!`;

    const rarityScore = {
        common: 5,
        uncommon: 8,
        rare: 12,
        epic: 18,
        legendary: 25,
    };
    scoreChange = rarityScore[item.rarity];

    switch (receiver.personality) {
        case 'greedy':
            scoreChange = Math.ceil(scoreChange * 1.5);
            response = `For me? Shiny! I'll put this to good use... very good use.`;
            if (item.rarity === 'common') {
                response = `This... trinket? I suppose it has a point. Thanks.`;
                scoreChange = 1;
            }
            break;
        case 'generous':
            scoreChange = Math.ceil(scoreChange * 1.2);
            response = `Oh, you shouldn't have! Thank you for your kindness!`;
            break;
        case 'serious':
            response = `This is a practical gift. It will serve its purpose. Thank you.`;
            break;
        case 'cautious':
            scoreChange = Math.floor(scoreChange * 0.8);
            response = `A gift? Why? Well... thank you. I will be sure to inspect it thoroughly.`;
            break;
        case 'jovial':
            response = `Ooh, a present! You're the best! I'll treasure it!`;
            break;
        case 'brave':
             response = `Excellent! This will serve me well in battle. My thanks!`;
             break;
    }

    return { response, scoreChange };
};

const GiftModal: React.FC<{
    item: Equipment;
    onClose: () => void;
}> = ({ item, onClose }) => {
    const { dispatch, activeCharacter } = useGame();

    const handleGiveItem = async (adventurerId: string) => {
        if (!activeCharacter) return;
        const adventurer = activeCharacter.party.find(p => p.id === adventurerId);
        if (!adventurer) return;

        const giftResponse = generateSimpleGiftResponse(adventurer, item);
        
        dispatch({
            type: 'GIVE_ITEM_TO_ADVENTURER',
            payload: {
                characterId: activeCharacter.id,
                adventurerId,
                itemId: item.id,
                giftResponse,
            }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="gift-modal-title">
            <Card className="w-full max-w-md animate-slide-up">
                <h2 id="gift-modal-title" className="text-2xl font-bold mb-4 text-primary">Give Item</h2>
                <p className="mb-2">Give <span className={`${RARITY_COLORS[item.rarity]}`}>{item.name}</span> to:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activeCharacter && activeCharacter.party.length > 0 ? (
                        activeCharacter.party.map(adventurer => (
                            <Button key={adventurer.id} variant="void" className="w-full text-left justify-start" onClick={() => handleGiveItem(adventurer.id)}>
                                {adventurer.name}
                            </Button>
                        ))
                    ) : (
                        <p className="text-on-background/70">You have no one in your party to give items to.</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="bone" onClick={onClose}>Cancel</Button>
                </div>
            </Card>
        </div>
    );
};

interface ItemCardProps {
    item: Equipment;
    onAction: () => void;
    actionLabel: string;
    onUpgrade: () => void;
    canAffordUpgrade: boolean;
    upgradeCost: number;
    onSell?: () => void;
    sellPrice?: number;
    onGive?: () => void;
    characterClass: CharacterClassType;
}

const ItemCard: React.FC<ItemCardProps> = React.memo(({ item, onAction, actionLabel, onUpgrade, canAffordUpgrade, upgradeCost, onSell, sellPrice, onGive, characterClass }) => {
    const affinity = item.classAffinity?.[characterClass] ?? 1.0;
    const hasLowAffinity = affinity < 0.7;
    const affinityTitle = hasLowAffinity ? `Ineffective for your class (${Math.round((1 - affinity) * 100)}% penalty)` : undefined;

    return (
        <div className="bg-surface-2 p-2 rounded-lg flex flex-col justify-between h-full text-xs sm:text-sm">
            <div>
                <p className={`font-bold ${RARITY_COLORS[item.rarity]} ${item.isHeirloom ? 'underline decoration-secondary' : ''} ${hasLowAffinity ? 'text-on-background/60' : ''}`} title={affinityTitle}>
                    {item.name} {hasLowAffinity && <ExclamationTriangleIcon />}
                </p>
                {item.setId && <p className="text-xs text-purple-400">{SETS[item.setId].name}</p>}
                <p className="text-xs capitalize text-on-background/70">
                    {item.slot} {item.upgradeLevel > 0 && <span className="text-secondary">(+{item.upgradeLevel})</span>}
                </p>
                <div className="text-xs mt-1 space-y-0.5">
                    {Object.entries(item.stats).map(([stat, value]) => (
                        <p key={stat} className="text-green-400">
                            +{Math.round(value * affinity)} <span className="capitalize text-on-background/70">{stat}</span>
                        </p>
                    ))}
                </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
                <Button onClick={onUpgrade} variant="bone" className="flex-1 text-xs py-1 min-w-[48%]" disabled={!canAffordUpgrade || !!item.isHeirloom} title={item.isHeirloom ? "Heirlooms cannot be upgraded" : ""}>
                    {item.isHeirloom ? "Heirloom" : `Upgrade (${upgradeCost}G)`}
                </Button>
                 <Button onClick={onAction} variant="void" className="flex-1 text-xs py-1 min-w-[48%] ">
                    {actionLabel}
                </Button>
                {onGive && (
                    <Button onClick={onGive} variant="void" className="flex-1 text-xs py-1 text-green-400 hover:bg-green-900/50 min-w-full">
                        Give
                    </Button>
                )}
                {onSell && sellPrice !== undefined && (
                    <Button onClick={onSell} variant="void" className="flex-1 text-xs py-1 text-red-400 hover:bg-red-900/50 min-w-full" disabled={!!item.isHeirloom} title={item.isHeirloom ? "Priceless heirlooms cannot be sold" : `Sell for ${sellPrice}G`}>
                        {item.isHeirloom ? "Priceless" : `Sell (${sellPrice}G)`}
                    </Button>
                )}
            </div>
        </div>
    );
});

interface EquipmentSlotDisplayProps {
    slot: EquipmentSlot;
    item: Equipment | undefined;
    onUnequip: (itemId: string) => void;
    onUpgrade: (itemId: string) => void;
    character: Character;
    slotIndex?: number; // Optional prop to differentiate accessory slots
}

const EquipmentSlotDisplay: React.FC<EquipmentSlotDisplayProps> = React.memo(({ slot, item, onUnequip, onUpgrade, character, slotIndex }) => (
    <Card className="h-48 sm:h-56 flex flex-col justify-between p-2">
        <h3 className="text-md sm:text-lg font-semibold capitalize text-primary text-center border-b border-surface-2 pb-1 sm:pb-2">
            {slot === 'accessory' && slotIndex !== undefined ? `Accessory ${slotIndex + 1}` : slot}
        </h3>
        <div className="flex-grow flex items-center justify-center p-1 sm:p-2">
            {item ? (
                <ItemCard
                    item={item}
                    onAction={() => onUnequip(item.id)}
                    actionLabel="Unequip"
                    onUpgrade={() => onUpgrade(item.id)}
                    canAffordUpgrade={character.gold >= UPGRADE_COST(item)}
                    upgradeCost={UPGRADE_COST(item)}
                    characterClass={character.class}
                />
            ) : (
                <p className="text-on-background/50 text-sm sm:text-base">Empty</p>
            )}
        </div>
    </Card>
));

const SellConfirmationModal: React.FC<{
    item: Equipment;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ item, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="sell-confirm-title">
        <Card className="w-full max-w-md animate-slide-up">
            <h2 id="sell-confirm-title" className="text-2xl font-bold mb-4 text-yellow-400">Confirm Sale</h2>
            <p className="text-on-background/80 mb-6">
                Are you sure you want to sell{' '}
                <span className={`${RARITY_COLORS[item.rarity]} font-bold`}>{item.name}</span> for{' '}
                <span className="text-yellow-400 font-bold">{SELL_PRICE(item)}G</span>?
            </p>
            <div className="mt-6 flex justify-end space-x-4">
                <Button variant="void" onClick={onCancel}>Cancel</Button>
                <Button 
                    onClick={onConfirm}
                    className="bg-red-600 hover:bg-red-700 text-on-primary focus:ring-red-500"
                >
                    Sell Item
                </Button>
            </div>
        </Card>
    </div>
);

const SellAllConfirmationModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
    itemCount: number;
    goldValue: number;
    rarity: EquipmentRarity;
}> = ({ onConfirm, onCancel, itemCount, goldValue, rarity }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="sell-all-confirm-title">
        <Card className="w-full max-w-lg animate-slide-up">
            <h2 id="sell-all-confirm-title" className="text-2xl font-bold mb-4 text-yellow-400">Confirm Bulk Sale</h2>
            <p className="text-on-background/80 mb-6">
                Are you sure you want to sell all{' '}
                <strong className="font-bold text-on-surface">{itemCount}</strong> non-heirloom items of rarity{' '}
                <strong className={`capitalize ${RARITY_COLORS[rarity]}`}>{rarity}</strong> and below for a total of{' '}
                <strong className="text-yellow-400 font-bold">{goldValue.toLocaleString()}G</strong>?
            </p>
            <div className="mt-6 flex justify-end space-x-4">
                <Button variant="void" onClick={onCancel}>Cancel</Button>
                <Button 
                    onClick={onConfirm}
                    className="bg-red-600 hover:bg-red-700 text-on-primary focus:ring-red-500"
                >
                    Sell Items
                </Button>
            </div>
        </Card>
    </div>
);


const Inventory: React.FC = () => {
    const { dispatch, activeCharacter } = useGame();
    const [itemToSell, setItemToSell] = useState<Equipment | null>(null);
    const [itemToGive, setItemToGive] = useState<Equipment | null>(null);
    const [selectedBulkSellRarity, setSelectedBulkSellRarity] = useState<EquipmentRarity>('rare');
    const [isSellAllModalOpen, setSellAllModalOpen] = useState(false);
    
    if (!activeCharacter) return <div>Loading inventory...</div>

    const handleEquip = (itemId: string) => {
        dispatch({ type: 'EQUIP_ITEM', payload: { characterId: activeCharacter.id, itemId } });
    };

    const handleUnequip = (itemId: string) => {
        dispatch({ type: 'UNEQUIP_ITEM', payload: { characterId: activeCharacter.id, itemId } });
    };
    
    const handleUpgrade = (itemId: string) => {
        dispatch({ type: 'UPGRADE_ITEM', payload: { characterId: activeCharacter.id, itemId } });
    };

    const handleSellClick = (item: Equipment) => {
        setItemToSell(item);
    };

    const confirmSell = () => {
        if (itemToSell) {
            dispatch({ type: 'SELL_ITEM', payload: { characterId: activeCharacter.id, itemId: itemToSell.id } });
            setItemToSell(null);
        }
    };

    const cancelSell = () => {
        setItemToSell(null);
    };

    const handleGiveClick = (item: Equipment) => {
        setItemToGive(item);
    };

    const { itemsToBulkSell, bulkSellValue } = useMemo(() => {
        if (!activeCharacter) return { itemsToBulkSell: [], bulkSellValue: 0 };
        
        const maxRarityIndex = RARITY_ORDER.indexOf(selectedBulkSellRarity);
        const raritiesToSell = new Set(RARITY_ORDER.slice(0, maxRarityIndex + 1));

        const items = activeCharacter.inventory.filter(item => 
            !item.isHeirloom && raritiesToSell.has(item.rarity)
        );

        const value = items.reduce((sum, item) => sum + SELL_PRICE(item), 0);

        return { itemsToBulkSell: items, bulkSellValue: value };
    }, [activeCharacter, selectedBulkSellRarity]);


    const handleBulkSellClick = () => {
        if (itemsToBulkSell.length > 0) {
            setSellAllModalOpen(true);
        }
    };

    const confirmBulkSell = () => {
        if (!activeCharacter) return;
        dispatch({ type: 'SELL_ALL_BY_RARITY', payload: { characterId: activeCharacter.id, maxRarity: selectedBulkSellRarity } });
        setSellAllModalOpen(false);
    };

    const equippedWeapon = activeCharacter.equipment.find(i => i.slot === 'weapon');
    const equippedArmor = activeCharacter.equipment.find(i => i.slot === 'armor');

    const calculateTotalBonus = (item: Equipment, characterClass: CharacterClassType): number => {
        const affinity = item.classAffinity?.[characterClass] ?? 1.0;
        return Object.values(item.stats).reduce((total, value) => total + (value * affinity), 0);
    };

    const groupedInventory = useMemo(() => {
        const grouped: Record<EquipmentSlot, Equipment[]> = {
            weapon: [],
            armor: [],
            accessory: [],
        };
        activeCharacter.inventory.forEach(item => {
            grouped[item.slot]?.push(item);
        });
        
        // Sort each group by total bonus (greatest first)
        Object.keys(grouped).forEach(slot => {
            grouped[slot as EquipmentSlot].sort((a, b) => 
                calculateTotalBonus(b, activeCharacter.class) - calculateTotalBonus(a, activeCharacter.class)
            );
        });
        
        return grouped;
    }, [activeCharacter.inventory, activeCharacter.class]);

    return (
        <div className="space-y-8">
            {itemToSell && (
                <SellConfirmationModal 
                    item={itemToSell}
                    onConfirm={confirmSell}
                    onCancel={cancelSell}
                />
            )}
            {itemToGive && (
                <GiftModal item={itemToGive} onClose={() => setItemToGive(null)} />
            )}
            {isSellAllModalOpen && (
                <SellAllConfirmationModal
                    onConfirm={confirmBulkSell}
                    onCancel={() => setSellAllModalOpen(false)}
                    itemCount={itemsToBulkSell.length}
                    goldValue={bulkSellValue}
                    rarity={selectedBulkSellRarity}
                />
            )}

            <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Equipment</h1>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    <EquipmentSlotDisplay slot="weapon" item={equippedWeapon} onUnequip={handleUnequip} onUpgrade={handleUpgrade} character={activeCharacter} />
                    <EquipmentSlotDisplay slot="armor" item={equippedArmor} onUnequip={handleUnequip} onUpgrade={handleUpgrade} character={activeCharacter} />
                    <EquipmentSlotDisplay slot="accessory" item={activeCharacter.accessorySlots[0] || undefined} onUnequip={handleUnequip} onUpgrade={handleUpgrade} character={activeCharacter} slotIndex={0} />
                    <EquipmentSlotDisplay slot="accessory" item={activeCharacter.accessorySlots[1] || undefined} onUnequip={handleUnequip} onUpgrade={handleUpgrade} character={activeCharacter} slotIndex={1} />
                </div>
            </div>

            <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>Inventory ({activeCharacter.gold.toLocaleString()} G)</h1>
                <Card>
                    {activeCharacter.inventory.length === 0 ? (
                        <p className="text-center p-8 text-on-background/70">Your bags are empty. Go find some loot!</p>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            {Object.entries(groupedInventory).map(([slot, items]) => (
                                items.length > 0 && (
                                    <div key={slot}>
                                        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 capitalize text-secondary">{slot}s</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {items.map(item => {
                                                const upgradeCost = UPGRADE_COST(item);
                                                const sellPrice = SELL_PRICE(item);
                                                return (
                                                    <ItemCard
                                                        key={item.id}
                                                        item={item}
                                                        onAction={() => handleEquip(item.id)}
                                                        actionLabel="Equip"
                                                        onUpgrade={() => handleUpgrade(item.id)}
                                                        canAffordUpgrade={activeCharacter.gold >= upgradeCost}
                                                        upgradeCost={upgradeCost}
                                                        onSell={() => handleSellClick(item)}
                                                        sellPrice={sellPrice}
                                                        onGive={() => handleGiveClick(item)}
                                                        characterClass={activeCharacter.class}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </Card>
            </div>
            
            <div>
                <Card>
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">Bulk Sell</h2>
                    <p className="text-on-background/80 mb-4">Quickly sell all non-heirloom items up to a chosen rarity.</p>
                    <div className="flex flex-wrap items-center gap-4 p-2 bg-surface-2 rounded-lg">
                        <label htmlFor="rarity-select" className="font-semibold text-on-surface">Sell items of rarity:</label>
                        <select
                            id="rarity-select"
                            value={selectedBulkSellRarity}
                            onChange={(e) => setSelectedBulkSellRarity(e.target.value as EquipmentRarity)}
                            className="px-4 py-2 bg-surface-1 border border-surface-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                        >
                            {RARITY_ORDER.map(rarity => (
                                <option key={rarity} value={rarity} className="capitalize">{rarity}</option>
                            ))}
                        </select>
                        <span>and below</span>
                        <Button 
                            onClick={handleBulkSellClick}
                            disabled={itemsToBulkSell.length === 0}
                            className="bg-red-600 hover:bg-red-700 text-on-primary focus:ring-red-500 ml-auto"
                        >
                            Sell {itemsToBulkSell.length} Items ({bulkSellValue.toLocaleString()}G)
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Inventory;
