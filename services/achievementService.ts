
import { Character, GameState, EquipmentRarity } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { RAIDS } from '../data/raids';

const RARITY_ORDER: EquipmentRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const checkAllAchievements = (character: Character, gameState: GameState): string[] => {
    const newlyUnlocked: string[] = [];
    const unlockedSet = new Set(character.unlockedAchievements);

    for (const achievement of Object.values(ACHIEVEMENTS)) {
        if (unlockedSet.has(achievement.id)) {
            continue;
        }

        let isUnlocked = false;
        const { type, value } = achievement.unlock;

        switch (type) {
            case 'level':
                if (character.level >= (value as number)) {
                    // This case handles both simple level checks and custom checks gated by level 1
                    if (achievement.id.startsWith('level_')) {
                        isUnlocked = true;
                    } else if (achievement.id === 'full_party' && character.party.length >= 3) {
                        isUnlocked = true;
                    } else if (achievement.id === 'best_friends' && gameState.relationships.some(r => r.status === 'best_friends' && r.participantIds.includes(character.id))) {
                        isUnlocked = true;
                    } else if (achievement.id === 'rivals' && gameState.relationships.some(r => r.status === 'rivals' && r.participantIds.includes(character.id))) {
                        isUnlocked = true;
                    }
                }
                break;
            case 'gold':
                if (character.gold >= (value as number)) isUnlocked = true;
                break;
            case 'generation':
                if (character.generation >= (value as number)) isUnlocked = true;
                break;
            case 'quest':
                if (character.completedQuests.includes(value as string)) isUnlocked = true;
                break;
            case 'kill':
                // This will be checked inside the combat reducer when a monster is killed
                break;
            case 'raid':
                if (character.completedRaids[value as string]) {
                     // Special handling for heroic/mythic raids
                    if (value === 'raid_firelords_keep_heroic') {
                        const hasHeroic = Object.keys(character.completedRaids).some(id => RAIDS.find(r => r.id === id)?.name.includes('(Heroic)'));
                        if (hasHeroic) isUnlocked = true;
                    } else if (value === 'raid_firelords_keep_mythic') {
                        const hasMythic = Object.keys(character.completedRaids).some(id => RAIDS.find(r => r.id === id)?.name.includes('(Mythic)'));
                         if (hasMythic) isUnlocked = true;
                    } else {
                        isUnlocked = true;
                    }
                }
                break;
            case 'marriage':
                if (character.partnerId) isUnlocked = true;
                break;
            case 'guild_level':
                if (gameState.guild && gameState.guild.level >= (value as number)) isUnlocked = true;
                break;
            case 'upgrade_level':
                const hasUpgradedItem = [...character.equipment, ...character.inventory].some(
                    item => item.upgradeLevel >= (value as number)
                );
                if (hasUpgradedItem) isUnlocked = true;
                break;
            case 'item_rarity':
                 const requiredRarityIndex = RARITY_ORDER.indexOf(value as EquipmentRarity);
                 const hasItemOfRarity = character.equipment.some(item => 
                     RARITY_ORDER.indexOf(item.rarity) >= requiredRarityIndex
                 );
                 if(hasItemOfRarity) isUnlocked = true;
                 break;
        }

        if (isUnlocked) {
            newlyUnlocked.push(achievement.id);
        }
    }

    return newlyUnlocked;
};

// Specific check for when a monster is killed
export const checkKillAchievements = (monsterId: string, unlockedAchievements: Set<string>): string[] => {
    const newlyUnlocked: string[] = [];
    for (const achievement of Object.values(ACHIEVEMENTS)) {
        if (unlockedAchievements.has(achievement.id)) continue;
        if (achievement.unlock.type === 'kill' && achievement.unlock.value === monsterId) {
            newlyUnlocked.push(achievement.id);
        }
        // Handle generic giant slayer
        if (achievement.id === 'giant_slayer' && (monsterId === 'frost_giant' || monsterId === 'fire_giant')) {
            newlyUnlocked.push(achievement.id);
        }
    }
    return newlyUnlocked;
}
