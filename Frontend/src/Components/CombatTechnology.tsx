/*==============================================================================================*
 * Combat Logic & Enemy Generation
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

// --- PURE HELPER FUNCTIONS ---

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
    const scale = .5;
    let row = 0;

    switch (type) {
        case 'Melee':  row = 0; break; 
        case 'Range':  row = 1; break; 
        case 'Healer': row = 2; break; 
    }

    return {
        backgroundImage: `url(${goblinSprite})`, 
        backgroundRepeat: 'no-repeat',
        width: `${spriteSize}px`,
        height: `${spriteSize}px`,
        backgroundPosition: `0px -${row * spriteSize}px`, 
        imageRendering: 'pixelated' as const,

        transform: `scale(${scale})`, 
        transformOrigin: 'top left',
        marginBottom: `-${spriteSize * (1 - scale)}px`, // Optional: fixes the empty space left by scaling down
        marginRight: `-${spriteSize * (1 - scale)}px`
    };
};

function calculatePlayerDamage(): number {
    return Math.floor(Math.random() * 6) + 4;
}

function calculateEnemyMove(enemy: Enemy): { isHealing: boolean, healAmount: number } {
    const isHealing = enemy.type === 'Healer' && Math.random() > 0.6;
    return { isHealing, healAmount: 5 };
}

// --- COMPONENT ---

interface CombatProps {
    initialEnemyData?: { level: number };
    onVictory: () => void;
}

export function Combat({ initialEnemyData, onVictory }: CombatProps) {
    // 1. COMPUTE INITIAL STATE VALUES ONCE
    // This avoids using useEffect to "sync" state, preventing the error entirely.
    // We generate the enemy immediately if data is present.
    const startEnemy = initialEnemyData ? createGoblin(initialEnemyData.level) : null;
    
    // 2. INITIALIZE STATE
    const [enemy, setEnemy] = useState<Enemy | null>(startEnemy);
    const [playerHp, setPlayerHp] = useState(50);
    const [isFighting, setIsFighting] = useState(!!startEnemy);
    
    // Initialize log directly with the correct name using the computed 'startEnemy'
    const [combatLog, setCombatLog] = useState<string[]>(
        startEnemy ? [`A wild ${startEnemy.name} appeared!`] : []
    );

    const handleAttack = async () => {
        if (!enemy) return;

        const dmgDealt = calculatePlayerDamage(); 
        const newEnemyHp = enemy.hp - dmgDealt;
        
        setCombatLog(prev => [...prev, `You hit ${enemy.name} for ${dmgDealt} dmg.`]);

        if (newEnemyHp <= 0) {
            setEnemy({ ...enemy, hp: 0 });
            setCombatLog(prev => [...prev, `Victory! You defeated ${enemy.name}.`]);
            setIsFighting(false);
            await awardXp();
            setTimeout(onVictory, 1500);
        } else {
            setEnemy({ ...enemy, hp: newEnemyHp });
            
            setTimeout(() => {
                enemyTurn(enemy, newEnemyHp);
            }, 500); 
        }
    };

    const enemyTurn = (currentEnemy: Enemy, currentEnemyHp: number) => {
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
        } catch (e) {
            console.error("Failed to add XP", e);
        }
    };

    if (!enemy) return <div>Loading Combat...</div>;

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
            <h2>Combat Arena</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#e3f2fd', padding: '10px' }}>
                    <h3>You</h3>
                    <p>HP: {playerHp} / 50</p>
                    {isFighting && <button onClick={handleAttack}>Cast Fireball</button>}
                </div>

                <div style={{ background: '#ffebee', padding: '10px' }}>
                    <h3>{enemy.name}</h3>
                    
                    <div style={{ 
                        ...getSpriteStyle(enemy.type), 
                        margin: '0 auto 10px auto'
                    }} />

                    <p>Type: {enemy.type}</p>
                    <p>HP: {enemy.hp} / {enemy.maxHp}</p>
                </div>
            </div>

            <div style={{ marginTop: '20px', background: '#fbf9f9', color: '#040404', padding: '10px', height: '150px', overflowY: 'auto' }}>
                {combatLog.map((entry, i) => <div key={i}>{entry}</div>)}
            </div>
        </div>
    );
}