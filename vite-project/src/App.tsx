import { useState } from 'react'
import { BookList, type books } from './Components/Buttons'
import './App.css'

function App() {
  const [book, setBook] = useState<books[]>([])
  return (
    <>
      <h1> Bookshelf </h1>
      <div className='book set area'>
        <BookList book = {book} setBook = {setBook}></BookList>
      </div>
    </>
  )
}

export default App
