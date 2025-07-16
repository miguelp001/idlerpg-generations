
import { Character, Monster, CombatLogEntry, Adventurer, DungeonState, RaidState, Ability } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ABILITIES } from '../data/abilities';
import { COMBAT_LOG_MESSAGES } from '../data/combatLogMessages';

type Combatant = (Character | Adventurer) & { isPlayer?: boolean };

// A result object that captures all changes from a combat turn
export interface CombatTurnResult {
    logs: CombatLogEntry[];
    newMonsterHealth: number;
    updatedCombatants: { [id: string]: Partial<Combatant> }; // changes to health, mana
    updatedCooldowns: Record<string, number>;
}

const formatLog = (template: string, replacements: { [key: string]: string | number }): string => {
    let message = template;
    for (const key in replacements) {
        message = message.replace(new RegExp(`{${key}}`, 'g'), String(replacements[key]));
    }
    return message;
};

const getRandomLog = (messages: string[]): string => messages[Math.floor(Math.random() * messages.length)];


const useAbility = (
    caster: Combatant,
    ability: Ability,
    target: Combatant | Monster,
    _allies: Combatant[],
    logs: CombatLogEntry[]
): { damage: number; healing: number, selfHeal: number } => {
    let damage = 0;
    let healing = 0;
    let selfHeal = 0;

    if (!ability.effect) return { damage, healing, selfHeal };

    const power = Math.floor(caster.stats[ability.effect.stat] * ability.effect.multiplier);
    const logTemplate = getRandomLog(ability.log_templates);
    const casterActor = 'isPlayer' in caster && caster.isPlayer ? 'player' : 'ally';
    const casterName = 'generation' in caster ? 'You' : caster.name;

    if (ability.effect.type === 'damage') {
        const targetDefense = 'defense' in target.stats ? target.stats.defense : 0;
        damage = Math.max(0, power - targetDefense);
        logs.push({
            id: uuidv4(),
            type: 'ability',
            message: formatLog(logTemplate, { caster: casterName, target: target.name, damage }),
            actor: casterActor
        });
    } else if (ability.effect.type === 'heal') {
        if (target.id === caster.id) {
            selfHeal = power;
             logs.push({
                id: uuidv4(),
                type: 'ability',
                message: formatLog(logTemplate, { caster: casterName, target: 'themself', healing: selfHeal }),
                actor: casterActor
            });
        } else {
            healing = power;
            const targetName = 'generation' in target ? 'You' : target.name;
            logs.push({
                id: uuidv4(),
                type: 'ability',
                message: formatLog(logTemplate, { caster: casterName, target: targetName, healing }),
                actor: casterActor
            });
        }
    }
    return { damage, healing, selfHeal };
};

export const processCombatTurn = (
    character: Character, 
    party: Adventurer[],
    monster: Monster, 
    combatState: DungeonState | RaidState
): CombatTurnResult => {
    const logs: CombatLogEntry[] = [];
    const currentEnemyHealth = 'currentMonsterHealth' in combatState ? combatState.currentMonsterHealth : combatState.currentBossHealth;
    let newMonsterHealth = currentEnemyHealth!;
    const updatedCooldowns = { ...combatState.cooldowns };

    // FIX: Use character's transient currentHealth/Mana as the source of truth, not stale stats from the character object.
    const playerCombatant: Combatant = { ...character, isPlayer: true, currentHealth: character.currentHealth ?? character.stats.health, currentMana: character.currentMana ?? character.stats.mana };
    const partyCombatants: Combatant[] = party.map(p => ({ ...p, equipment: p.equipment || [], currentHealth: p.currentHealth ?? p.stats.health, currentMana: p.currentMana ?? p.stats.mana }));
    const allCombatants: Combatant[] = [playerCombatant, ...partyCombatants];
    const updatedCombatants: { [id: string]: Partial<Combatant> } = {};

    // --- Player and Party Turn ---
    for (const combatant of allCombatants) {
        if (newMonsterHealth <= 0) break;
        if ((combatant.currentHealth ?? 0) <= 0) continue;

        const actorType = combatant.isPlayer ? 'player' : 'ally';
        const unlockedAbilities = Object.values(ABILITIES).filter(
            a => a.class === combatant.class && combatant.level >= a.levelRequirement && a.type === 'active'
        );

        let abilityUsed = false;
        
        // AI: Cleric Healing Logic
        if (combatant.class === 'cleric') {
            const healAbilities = unlockedAbilities.filter(a => a.effect?.type === 'heal');
            if (healAbilities.length > 0) {
                // Find ally with the lowest health percentage
                let lowestHealthAlly: Combatant | null = null;
                let lowestHealthPct = 0.6; // Don't heal above 60% health

                for (const ally of allCombatants) {
                     if ((ally.currentHealth ?? 0) <= 0) continue;
                    const maxHealth = 'maxStats' in ally && ally.maxStats ? ally.maxStats.health : ally.stats.health;
                    const healthPct = (ally.currentHealth ?? ally.stats.health) / maxHealth;
                    if (healthPct < lowestHealthPct) {
                        lowestHealthPct = healthPct;
                        lowestHealthAlly = ally;
                    }
                }
                
                if (lowestHealthAlly) {
                     for (const healAbility of healAbilities) {
                        const cdKey = `${combatant.id}-${healAbility.id}`;
                        if (((combatant.currentMana ?? 0) >= (healAbility.manaCost || 0)) && (!updatedCooldowns[cdKey] || combatState.turnCount >= updatedCooldowns[cdKey])) {
                            const { healing, selfHeal } = useAbility(combatant, healAbility, lowestHealthAlly, allCombatants, logs);
                            
                            const targetToUpdate = updatedCombatants[lowestHealthAlly.id] || { ...lowestHealthAlly };

                            const maxHealth = 'maxStats' in lowestHealthAlly && lowestHealthAlly.maxStats ? lowestHealthAlly.maxStats.health : lowestHealthAlly.stats.health;
                            const currentHealth = targetToUpdate.currentHealth ?? lowestHealthAlly.currentHealth ?? 0;

                            targetToUpdate.currentHealth = Math.min(maxHealth, currentHealth + healing + selfHeal);
                            updatedCombatants[lowestHealthAlly.id] = targetToUpdate;
                            
                            const casterToUpdate = updatedCombatants[combatant.id] || { ...combatant };
                            casterToUpdate.currentMana = (casterToUpdate.currentMana ?? combatant.currentMana ?? 0) - (healAbility.manaCost || 0);
                            updatedCombatants[combatant.id] = casterToUpdate;
                            
                            updatedCooldowns[cdKey] = combatState.turnCount + (healAbility.cooldown || 1);
                            abilityUsed = true;
                            break; // Use one heal ability per turn
                        }
                    }
                }
            }
        }

        // AI: Damage Ability Logic
        if (!abilityUsed) {
             const damageAbilities = unlockedAbilities.filter(a => a.effect?.type === 'damage').sort((a,b) => (b.effect?.multiplier || 0) - (a.effect?.multiplier || 0)); // a, b
             for (const ability of damageAbilities) {
                const cdKey = `${combatant.id}-${ability.id}`;
                if (((combatant.currentMana ?? 0) >= (ability.manaCost || 0)) && (!updatedCooldowns[cdKey] || combatState.turnCount >= updatedCooldowns[cdKey])) {
                     const { damage } = useAbility(combatant, ability, monster, allCombatants, logs);
                     newMonsterHealth -= damage;
                     
                     const casterToUpdate = updatedCombatants[combatant.id] || { ...combatant };
                     casterToUpdate.currentMana = (casterToUpdate.currentMana ?? combatant.currentMana ?? 0) - (ability.manaCost || 0);
                     updatedCombatants[combatant.id] = casterToUpdate;

                     updatedCooldowns[cdKey] = combatState.turnCount + (ability.cooldown || 1);
                     abilityUsed = true;
                     break; // Use one damage ability per turn
                }
             }
        }
        
        // Basic Attack if no ability was used
        if (!abilityUsed) {
            let damage = Math.max(0, Math.floor(combatant.stats.attack * (Math.random() * 0.2 + 0.9) - monster.stats.defense));
            const isCritical = Math.random() < (combatant.stats.agility / 200 + 0.05); // 5% base crit chance
            
            if (isCritical) {
                damage = Math.floor(damage * 1.5);
                damage = Math.max(1, damage); // Ensure critical hits always do at least 1 damage.
                const template = getRandomLog(combatant.isPlayer ? COMBAT_LOG_MESSAGES.player.crit : COMBAT_LOG_MESSAGES.adventurer.crit);
                logs.push({ id: uuidv4(), type: 'critical', message: formatLog(template, { caster: combatant.name, target: monster.name, damage }), actor: actorType });
            }

            if (damage > 0) {
                newMonsterHealth -= damage;
                if(!isCritical) {
                    const template = getRandomLog(combatant.isPlayer ? COMBAT_LOG_MESSAGES.player.hit : COMBAT_LOG_MESSAGES.adventurer.hit);
                    logs.push({ id: uuidv4(), type: 'damage', message: formatLog(template, { caster: combatant.name, target: monster.name, damage }), actor: actorType });
                }
            } else {
                const template = getRandomLog(combatant.isPlayer ? COMBAT_LOG_MESSAGES.player.miss : COMBAT_LOG_MESSAGES.adventurer.miss);
                logs.push({ id: uuidv4(), type: 'info', message: formatLog(template, { caster: combatant.name, target: monster.name }), actor: actorType });
            }
        }
    }

    if (newMonsterHealth <= 0) {
        const template = getRandomLog(COMBAT_LOG_MESSAGES.general.slain);
        logs.push({id: uuidv4(), type: 'info', message: formatLog(template, {target: monster.name}), actor: 'system'});
        return { logs, newMonsterHealth: 0, updatedCombatants, updatedCooldowns };
    }

    // --- Monster's Turn ---
    const livingCombatants = allCombatants.filter(c => ((updatedCombatants[c.id]?.currentHealth ?? c.currentHealth ?? 0) > 0));
    if (livingCombatants.length === 0) {
         return { logs, newMonsterHealth, updatedCombatants, updatedCooldowns };
    }
    
    const target = livingCombatants[Math.floor(Math.random() * livingCombatants.length)];
    const targetName = target.isPlayer ? 'You' : target.name;
    let monsterDamage = Math.max(0, Math.floor(monster.stats.attack * (Math.random() * 0.2 + 0.9) - target.stats.defense));
    
    // --- Defensive Checks ---
    const didDodge = Math.random() < (target.stats.agility / 300);
    let didParry = false;
    let didBlock = false;

    if (!didDodge) {
        let parryChance = 0.02 + (target.stats.attack / 600);
        if (target.class === 'warrior' || target.class === 'rogue') parryChance += 0.05;
        didParry = Math.random() < parryChance;
    }
    if (!didDodge && !didParry) {
        let blockChance = 0.02 + (target.stats.defense / 600);
        if (target.class === 'warrior' || target.class === 'cleric') blockChance += 0.05;
        didBlock = Math.random() < blockChance;
    }

    if(didDodge) {
        const template = getRandomLog(COMBAT_LOG_MESSAGES.monster.dodge);
        const dodgeActor = target.isPlayer ? 'player' : 'ally';
        logs.push({ id: uuidv4(), type: 'dodge', message: formatLog(template, { target: targetName, caster: monster.name }), actor: dodgeActor });
        monsterDamage = 0;
    } else if (didParry) {
        const template = getRandomLog(COMBAT_LOG_MESSAGES.general.parry);
        const parryActor = target.isPlayer ? 'player' : 'ally';
        logs.push({ id: uuidv4(), type: 'parry', message: formatLog(template, { parrier: targetName, attacker: monster.name }), actor: parryActor });
        monsterDamage = 0;
    } else if (didBlock) {
        const template = getRandomLog(COMBAT_LOG_MESSAGES.general.block);
        const blockActor = target.isPlayer ? 'player' : 'ally';
        logs.push({ id: uuidv4(), type: 'block', message: formatLog(template, { blocker: targetName, attacker: monster.name }), actor: blockActor });
        monsterDamage = 0;
    }


    if (monsterDamage > 0) {
        const targetToUpdate = updatedCombatants[target.id] || { ...target };
        // FIX: Use nullish coalescing to prevent resurrection bug when health is 0.
        const currentHealth = targetToUpdate.currentHealth ?? target.currentHealth!;
        const newHealth = currentHealth - monsterDamage;
        targetToUpdate.currentHealth = newHealth;
        updatedCombatants[target.id] = targetToUpdate;

        const template = getRandomLog(COMBAT_LOG_MESSAGES.monster.hit);
        logs.push({ id: uuidv4(), type: 'damage', message: formatLog(template, { caster: monster.name, target: targetName, damage: monsterDamage }), actor: 'enemy' });
        
        // Add defeat log for non-player characters
        if (newHealth <= 0 && !target.isPlayer) {
            logs.push({ id: uuidv4(), type: 'defeat', message: `${target.name} has been defeated!`, actor: 'system' });
        }
    } else if(!didDodge && !didParry && !didBlock) {
        const template = getRandomLog(COMBAT_LOG_MESSAGES.monster.miss);
        logs.push({ id: uuidv4(), type: 'info', message: formatLog(template, { caster: monster.name, target: targetName }), actor: 'enemy' });
    }
    
    // Ensure no one is below 0 health in the result
    for (const id in updatedCombatants) {
        if (updatedCombatants[id].currentHealth !== undefined) {
            updatedCombatants[id].currentHealth = Math.max(0, updatedCombatants[id].currentHealth!);
        }
    }

    return { logs, newMonsterHealth, updatedCombatants, updatedCooldowns };
};
