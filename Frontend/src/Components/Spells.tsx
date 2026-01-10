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

const API_URL = "http://localhost:8080/spells";

// function to create a new instance of a spell
export async function createSpell(
    newSpellData: Omit<spell, 'id'>,
    { spells, setSpells }: spellListProps
) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSpellData)
        });

        if (!response.ok) throw new Error("Failed to create spell");

        const createdSpell = await response.json();
        setSpells([...spells, createdSpell]);
    } catch (error) {
        console.error("Error creating spell:", error);
    }
}

// function to take away an existing spell based on the name
export async function destroySpell(idToRemove: number, { spells, setSpells }: spellListProps){
    try {
        const response = await fetch(`${API_URL}/${idToRemove}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Failed to destroy spell");

        // Optimistically update the UI only if the server deleted it
        const updatedSpells = spells.filter((spell) => spell.id !== idToRemove);
        setSpells(updatedSpells);
    } catch (error) {
        console.error("Error destroying spell:", error);
    }
}

// function to make changes to existing spells
export async function editSpell(updatedSpell: spell, { spells, setSpells }: spellListProps){
    try {
        const response = await fetch(`${API_URL}/${updatedSpell.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSpell)
        });

        if (!response.ok) throw new Error("Failed to update spell");

        // Update local state with the edited version
        const updatedList = spells.map((spell) => 
            spell.id === updatedSpell.id ? updatedSpell : spell
        );
        setSpells(updatedList);
    } catch (error) {
        console.error("Error editing spell:", error);
    }
}

export async function fetchSpells(setSpells: Dispatch<SetStateAction<spell[]>>) {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setSpells(data);
    } catch (error) {
        console.error("Error fetching spells:", error);
    }
}