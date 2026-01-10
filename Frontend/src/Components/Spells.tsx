/*===============================================================================
 * this file is to make sure I have a place to create, destroy, and modify spells
 *=============================================================================*/
import { type SetStateAction, type Dispatch } from 'react'
export interface spell{
    id: number
    name: string
    dmgMod: number
    type: string
    dmg: number
    effect: boolean
}
interface spellListProps{
    spells: spell[],
    setSpells: Dispatch<SetStateAction<spell[]>>
}
// function to create a new instance of a spell
export function createSpell(
    newSpellData: Omit<spell, 'id'>,
    { spells, setSpells }: spellListProps
) {
    // In a real app, you would POST to the server here, get the DB ID back, then set state.
    // For now, we simulate a local ID.
    const tempId = Date.now(); 
    const spellToAdd: spell = { ...newSpellData, id: tempId };

    setSpells([...spells, spellToAdd]);
}

// function to take away an existing spell based on the name
export function destroySpell(idToRemove: number, { spells, setSpells }: spellListProps){
    const updateSpells = spells.filter((spell) => spell.id !== idToRemove)
    setSpells(updateSpells)
}

// function to make changes to existing spells
export function editSpell(updatedSpell: spell, { spells, setSpells }: spellListProps){
    const updatedList = spells.map((spell) =>
        spell.id === updatedSpell.id ? updatedSpell: spell
    )
    setSpells(updatedList)
}