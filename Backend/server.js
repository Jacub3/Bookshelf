/*==================================================================================================
 * All coments are made by Jacob Elliott
 *================================================================================================*/

import express from 'express'
import cors from 'cors'
import { 
    getBooks, 
    getBook, 
    createBook, 
    deleteBook,
    updateBook,
    getSpell, 
    addSpell, 
    deleteSpell, 
    updateSpell,
    getWizard,
    addExperience
} from './database/database.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json()) 
app.use(cors())

app.get("/books", async (req, res) => {
    const books = await getBooks()
    res.send(books)
})

app.get("/books/:id", async (req, res) => {
    const id = req.params.id
    const book = await getBook(id)
    res.send(book)
})

app.post("/books", async (req, res) => {
    const { title, author, contents, genre } = req.body
    const note = await createBook(title, author, contents, genre)
    res.status(201).send(note)
})
app.put("/books/:id", async (req, res) => {
    const id = req.params.id;
    const { title, author, contents, genre } = req.body;
    await updateBook(id, title, author, contents, genre);
    res.status(200).send({ message: "Book updated successfully" });
});
app.delete("/books/:id", async (req, res) => { 
    const id = req.params.id;
    await deleteBook(id);
    res.status(200).send({ message: "Book burned successfully" });
})

app.post("/spells", async (req, res) => {
    const { name, type, dmgMod, dmg, effect } = req.body;
    const id = await addSpell(name, type, dmgMod, dmg, effect);
    res.status(201).send({ id, name, type, dmgMod, dmg, effect });
});

app.delete("/spells/:id", async (req, res) => {
    const id = req.params.id;
    await deleteSpell(id);
    res.status(200).send({ message: "Spell destroyed" });
});

app.put("/spells/:id", async (req, res) => {
    const id = req.params.id;
    const { name, type, dmgMod, dmg, effect } = req.body;
    await updateSpell(id, name, type, dmgMod, dmg, effect);
    res.status(200).send({ message: "Spell updated" });
});
app.get("/wizards/:id", async (req, res) => {
    const id = req.params.id;
    const wizard = await getWizard(id);
    res.send(wizard);
});

// Add Experience (Level Up logic is handled in database.js)
app.post("/wizards/:id/experience", async (req, res) => {
    const id = req.params.id;
    const { amount } = req.body;
    const result = await addExperience(id, amount);
    res.send(result);
});
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})