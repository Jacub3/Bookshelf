/*================================================================================
 *  Defualt Wizard Stats:
 *      - name: Wiz
 *      - level: 1
 *      - experience: 0
 *      - weaponType: Grimoire
 *      
 *==============================================================================*/

/*================================================================================
 * Wizard Stats & Profile Component
 * - Fetches data from the 'wizards' table
 * - Visualizes Level, XP, and Weapon
 *==============================================================================*/
import { useState, useEffect } from 'react';

// Corrected interface name and matched it to schema.sql
export interface Wizard {
    id: number;
    name: string;
    level: number;
    experience: number; // Max is 10 based on database.js logic
    weapon_type: string; // Matches 'weapon_type' column in DB
}

export default function WizardCharacterSheet() {
    const [wizard, setWizard] = useState<Wizard | null>(null);

    // Fetch the wizard (Assuming ID 1 for the main character)
    useEffect(() => {
        fetch('http://localhost:8080/wizards/1')
            .then(res => res.json())
            .then(data => setWizard(data))
            .catch(err => console.error("Error fetching wizard:", err));
    }, []);

    if (!wizard) return <div>Summoning wizard details...</div>;

    // Calculate progress to next level (Assuming 10 XP per level)
    const xpProgress = (wizard.experience / 10) * 100;

    return (
        <div style={{ padding: '20px', border: '2px solid #4a0080', borderRadius: '10px', background: '#f4eaff', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#330066' }}>{wizard.name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                    <strong>Level:</strong> {wizard.level}
                </div>
                <div>
                    <strong>Weapon:</strong> {wizard.weapon_type}
                </div>
            </div>

            {/* XP Bar */}
            <div style={{ marginBottom: '10px' }}>
                <strong>Experience:</strong> {wizard.experience} / 10
                <div style={{ width: '100%', height: '10px', background: '#ccc', borderRadius: '5px', marginTop: '5px' }}>
                    <div style={{ 
                        width: `${xpProgress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #9933ff, #ff00cc)', 
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-in-out'
                    }}></div>
                </div>
            </div>
        </div>
    );
}