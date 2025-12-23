import { useEffect, useState } from 'react'
import { BookList, type books } from './Components/Buttons'
import './App.css'

function App() {
  const [book, setBook] = useState<books[]>([])

  useEffect (() => {
    fetch('http://localhost:8080/books')
      .then(res => res.json())
      .then(data => {
        setBook(data);              // Set the data from the data saved in sql
      })
      .catch(err => console.error("Had error fetching books", err));
  }, []);

  return (
    <>
      <h1> Bookshelf </h1>
      <div className='book-set-area'>
        <BookList book = {book} setBook = {setBook}></BookList>
      </div>
      <div>
        {book.map((singleBook)=>(
          <div key = {singleBook.id} className = "book-card">
            <p>{singleBook.title}</p>
            <p><strong> Author </strong>{singleBook.author}</p>
            <div>
              <p>{singleBook.contents}</p>
            </div>
            <small>ID: {singleBook.id}</small>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
