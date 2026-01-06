/*===============================================================================
 * this file is to make sure I have a place to create, destroy, and modify spells
 *=============================================================================*/
import { buildWiz } from "./WizardCharacterSheet";

export interface spells{
    name: string
    dmgMod: number
    dmg: number
    effect: boolean
}

export function createSpell{
    const defualtSpell = {
        name: "spell",
        dmgMod: 1,
        dmg: 0,
        effect: false
    }

    const [spells, setSpells] = useState <spells>(defualtSpell)


    
}
export function destroySpell{}
export function editSpell{}