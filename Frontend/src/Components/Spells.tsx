/*===============================================================================
 * this file is to make sure I have a place to create, destroy, and modify spells
 *=============================================================================*/
// import {useState} from 'react'
export interface spells{
    name: string
    dmgMod: number
    dmg: number
    effect: boolean
}

// export function createSpell(name, dmgMod, dmg, effect){
//     const defualtSpell = {
//         name: "spell",
//         dmgMod: 1,
//         dmg: 0,
//         effect: false
//     }

//     const [spell, setSpell] = useState <spells>(defualtSpell)

//     setSpell(prev => ([
//         ...prev,
//         {
//             name: name,
//             dmgMod: dmgMod,
//             dmg: dmg,
//             effect: effect,
//         }
//     ]))

// }
export function destroySpell(){}
export function editSpell(){}