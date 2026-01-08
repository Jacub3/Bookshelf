// /*===============================================================================
//  * this file is to make sure I have a place to create, destroy, and modify spells
//  *=============================================================================*/
// import { useState, type SetStateAction, type Dispatch } from 'react'
// export interface spell{
//     name: string
//     dmgMod: number
//     dmg: number
//     effect: boolean
// }
// interface spellListProps{
//     spells: spell[],
//     setSpells: Dispatch<SetStateAction<spell[]>>
// }
// // function to create a new instance of a spell
// export function createSpell({setSpells}: spellListProps){
//     const defualtSpell = {
//         name: "spell",
//         dmgMod: 1,
//         dmg: 0,
//         effect: false
//     }

//     const [spell, setSpell] = useState <spells>(defualtSpell)


// }

// // function to take away an existing spell based on the name
// export function destroySpell(){}

// // function to make changes to existing spells
// export function editSpell(){}