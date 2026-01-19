/*==============================================================================================*
 *  In this file I want to create a few key things about the enemy the user will be fighting 
 *  against.
 *  
 *  - Melle => Bruiser and tank
 *  - Range => Mage and Archer
 *  - Healer
 * 
 *  - Level: how proficient the enemy is at killing
 *  - dmgMod: How much proficiency enemies get (the type of character compared to dmg type)
 *      example: Mages are proficient with spells
 *  - 
 *==============================================================================================*/
/*==============================================================================================*
 * Combat Logic & Enemy Generation (Strict Purity Version)
 *==============================================================================================*/
import { useState } from 'react';
import goblinSprite from '../assets/goblin.png'

export interface Enemy {
    name: string;
    type: 'Melee' | 'Range' | 'Healer';
    level: number;
    hp: number;
    maxHp: number;
    dmg: number;
}

// --- PURE HELPER FUNCTIONS (Defined OUTSIDE the component) ---

// 1. Create Enemy (Safe)
function createGoblin(playerLevel: number): Enemy {
    const types: ('Melee' | 'Range' | 'Healer')[] = ['Melee', 'Range', 'Healer'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let hp = 20 + (playerLevel * 5);
    let dmg = 2 + (playerLevel);

    if (type === 'Melee') { hp *= 1.5; dmg *= 0.8; }
    else if (type === 'Range') { hp *= 0.7; dmg *= 1.5; }
    else if (type === 'Healer') { dmg *= 0.5; }

    return {
        name: `Goblin ${type}`,
        type,
        level: playerLevel,
        hp: Math.floor(hp),
        maxHp: Math.floor(hp),
        dmg: Math.floor(dmg)
    };
}

const getSpriteStyle = (type: 'Melee' | 'Range' | 'Healer') => {
    const spriteSize = 350; 
    let row = 0;

    switch (type) {
        case 'Melee':  row = 0; break; //
        case 'Range':  row = 1; break; //
        case 'Healer': row = 2; break; //
    }

    return {
        // USE THE IMPORTED VARIABLE HERE
        backgroundImage: `url(${goblinSprite})`, 
        backgroundRepeat: 'no-repeat',
        width: `${spriteSize}px`,
        height: `${spriteSize}px`,
        // Shift the background up to reveal the correct row
        backgroundPosition: `0px -${row * spriteSize}px`, 
        imageRendering: 'pixelated' as const 
    };
};

// 2. Calculate Damage (Safe)
function calculatePlayerDamage(): number {
    return Math.floor(Math.random() * 6) + 4;
}

// 3. Calculate Enemy Move (Safe)
function calculateEnemyMove(enemy: Enemy): { isHealing: boolean, healAmount: number } {
    const isHealing = enemy.type === 'Healer' && Math.random() > 0.6;
    return { isHealing, healAmount: 5 };
}


// --- MAIN COMPONENT ---
export function Combat() {
    const [enemy, setEnemy] = useState<Enemy | null>(null);
    const [playerHp, setPlayerHp] = useState(50);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [isFighting, setIsFighting] = useState(false);

    const startFight = () => {
        const newEnemy = createGoblin(1); 
        setEnemy(newEnemy);
        setPlayerHp(50);
        setCombatLog([`A wild ${newEnemy.name} appeared!`]);
        setIsFighting(true);
    };

    const handleAttack = async () => {
        if (!enemy) return;

        // ERROR FIX: We now call the external helper function
        const dmgDealt = calculatePlayerDamage(); 
        const newEnemyHp = enemy.hp - dmgDealt;
        
        // Log update
        setCombatLog(prev => [...prev, `You hit ${enemy.name} for ${dmgDealt} dmg.`]);

        if (newEnemyHp <= 0) {
            // Victory
            setEnemy({ ...enemy, hp: 0 });
            setCombatLog(prev => [...prev, `Victory! You defeated ${enemy.name}.`]);
            setIsFighting(false);
            await awardXp();
        } else {
            // Update Enemy HP
            setEnemy({ ...enemy, hp: newEnemyHp });
            
            // Pass the CURRENT ENEMY state to the timeout
            setTimeout(() => {
                enemyTurn(enemy, newEnemyHp);
            }, 500); 
        }
    };

    // This function receives the enemy data, so it doesn't need to read state directly
    const enemyTurn = (currentEnemy: Enemy, currentEnemyHp: number) => {
        // ERROR FIX: Calculate Random Move OUTSIDE the state updater
        const move = calculateEnemyMove(currentEnemy);

        if (move.isHealing) {
            setCombatLog(prev => [...prev, `${currentEnemy.name} healed itself for ${move.healAmount}.`]);
            setEnemy(prev => {
                if (!prev) return null;
                return { ...prev, hp: Math.min(prev.maxHp, currentEnemyHp + move.healAmount) };
            });
        } else {
            const dmgTaken = currentEnemy.dmg;
            setCombatLog(prev => [...prev, `${currentEnemy.name} hit you for ${dmgTaken} dmg.`]);
            
            setPlayerHp(prev => {
                const newVal = prev - dmgTaken;
                if (newVal <= 0) {
                     setCombatLog(l => [...l, "You were defeated..."]);
                     setIsFighting(false);
                }
                return newVal;
            });
        }
    };

    const awardXp = async () => {
        try {
            await fetch('http://localhost:8080/wizards/1/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 2 })
            });
            alert("Gained 2 Experience!");
        } catch (e) {
            console.error("Failed to add XP", e);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
            <h2>Combat Arena</h2>

            {!isFighting ? (
                <button onClick={startFight} style={{ padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Find Enemy
                </button>
            ) : (
                <div style={{marginBottom: '10px', color: 'red'}}>Fighting!</div>
            )}

            {enemy && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <div style={{ background: '#e3f2fd', padding: '10px' }}>
                        <h3>You</h3>
                        <p>HP: {playerHp} / 50</p>
                        {/* MAKE SURE THIS LINE HAS NO PARENTHESES AFTER handleAttack */}
                        {isFighting && <button onClick={handleAttack}>Cast Fireball</button>}
                    </div>

                    <div style={{ background: '#ffebee', padding: '10px' }}>
                        <h3>{enemy.name}</h3>
                        
                        {/* NEW SPRITE RENDERER */}
                        <div style={{ 
                            ...getSpriteStyle(enemy.type), 
                            margin: '0 auto 10px auto'
                        }} />

                        <p>Type: {enemy.type}</p>
                        <p>HP: {enemy.hp} / {enemy.maxHp}</p>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', background: '#333', color: '#fff', padding: '10px', height: '150px', overflowY: 'auto' }}>
                {combatLog.map((entry, i) => <div key={i}>{entry}</div>)}
            </div>
        </div>
    );
}