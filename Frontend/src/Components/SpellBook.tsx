import { useState, useEffect } from 'react';
import { 
    type spell, 
    createSpell, 
    destroySpell, 
    editSpell,
    fetchSpells
} from './Spells';

export default function Spellbook() {
    // 1. Main State: The list of spells
    const [spells, setSpells] = useState<spell[]>([]);

    useEffect(() => {
    fetchSpells(setSpells);
    }, []);

    // 2. Form State: For creating a new spell
    const [form, setForm] = useState({
        name: '',
        type: 'Destruction',
        dmgMod: 1,
        dmg: 0,
        effect: false
    });

    // 3. Edit State: Track which spell ID is currently being edited
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<spell | null>(null);

    // --- Handlers ---

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault(); // Stop page refresh
        createSpell(form, { spells, setSpells });
        // Reset form
        setForm({ name: '', type: 'Destruction', dmgMod: 1, dmg: 0, effect: false });
    };

    const handleDelete = (id: number) => {
        destroySpell(id, { spells, setSpells });
    };

    const startEditing = (spell: spell) => {
        setEditingId(spell.id);
        setEditForm(spell); // Load current spell data into the edit inputs
    };

    const saveEdit = () => {
        if (editForm) {
            editSpell(editForm, { spells, setSpells });
            setEditingId(null); // Exit edit mode
            setEditForm(null);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Wizard's Spellbook</h1>

            {/* --- CREATE SPELL FORM --- */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>Inscribe New Spell</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                    
                    <input 
                        placeholder="Spell Name" 
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        required
                    />
                    
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                        <option value="Destruction">Destruction</option>
                        <option value="Restoration">Restoration</option>
                        <option value="Alteration">Alteration</option>
                    </select>

                    <label>
                        Damage: 
                        <input 
                            type="number" 
                            value={form.dmg} 
                            onChange={e => setForm({...form, dmg: parseInt(e.target.value) || 0})}
                            style={{ marginLeft: '10px', width: '60px'}}
                        />
                    </label>

                    <label>
                        Has Effect? 
                        <input 
                            type="checkbox" 
                            checked={form.effect} 
                            onChange={e => setForm({...form, effect: e.target.checked})}
                            style={{ marginLeft: '10px'}}
                        />
                    </label>

                    <button type="submit" style={{ gridColumn: 'span 2', padding: '8px', background: '#4CAF50', color: 'white', border: 'none' }}>
                        Add Spell
                    </button>
                </form>
            </div>

            {/* --- SPELL LIST --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {spells.map((spell) => (
                    <div key={spell.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px', background: '#f9f9f9' }}>
                        
                        {/* VIEW MODE vs EDIT MODE */}
                        {editingId === spell.id ? (
                            // --- EDIT MODE VIEW ---
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <input 
                                    value={editForm?.name} 
                                    onChange={e => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)} 
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={saveEdit} style={{ background: '#2196F3', color: 'white' }}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            // --- NORMAL VIEW ---
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{spell.name}</h3>
                                    <small style={{ color: '#666' }}>{spell.type} | Dmg: {spell.dmg}</small>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => startEditing(spell)}>Edit</button>
                                    <button onClick={() => handleDelete(spell.id)} style={{ background: '#ff4444', color: 'white' }}>
                                        Destroy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}