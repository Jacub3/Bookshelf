import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host: process.env.HOST,
    user:  process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}).promise()

export async function getBooks() {
    const [rows] = await pool.query('SELECT * FROM books')
    return rows
}

export async function getBook(id) {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id])
    return rows[0]
}

export async function createBook(title, author, contents) {
    const [result] = await pool.query('INSERT INTO books (title, author, contents) VALUES (?, ?, ?)', [title, author, contents])
    return result.insertId
}
