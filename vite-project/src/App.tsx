import { useEffect, useState, useRef } from 'react'
import { BookList, type books } from './Components/Buttons'
import './App.css'

function App() {
  const [book, setBook] = useState<books[]>([])
  const [charPos, setCharPos] = useState({ x: 100, y: 100 });

  const charPosRef = useRef({ x: 100, y: 100 });

  useEffect (() => {
    fetch('http://localhost:8080/books')
      .then(res => res.json())
      .then(data => {
        setBook(data);              // Set the data from the data saved in sql
      })
      .catch(err => console.error("Had error fetching books", err));
  }, []);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const step = 20;

        const newX = charPosRef.current.x;
        const newY = charPosRef.current.y;
        // 1. Handle Movement
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setCharPos(prev => ({ ...prev, y: prev.y - step }));
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setCharPos(prev => ({ ...prev, y: prev.y + step }));
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
          setCharPos(prev => ({ ...prev, x: prev.x - step }));
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
          setCharPos(prev => ({ ...prev, x: prev.x + step }));
        }

        charPosRef.current = { x: newX, y: newY };
        // Update State (Trigger Re-render)
        if (e.key === 'e' || e.key === 'E') {
                const btn = document.getElementById('create-book-btn');
                if (btn) {
                  const btnRect = btn.getBoundingClientRect();
                  
                  // Use the NEW coordinates calculated above
                  const btnCenterX = btnRect.left + btnRect.width / 2;
                  const btnCenterY = btnRect.top + btnRect.height / 2;
            
                  const dist = Math.sqrt(
                    Math.pow(newX - btnCenterX, 2) + Math.pow(newY - btnCenterY, 2)
                  );
            
                  // If within 100 pixels, click
                  if (dist < 100) {
                    btn.click();
                  }
                }
              }
      };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>

      <div 
          className="character" 
          style={{ left: charPos.x, top: charPos.y }}
        >
          🧙‍♂️
      </div>
      <h1> Bookshelf </h1>

      <div style={{textAlign: 'center', marginBottom: '10px', color: '#ccc'}}>
        <small>Use Arrow Keys to move. Press <strong>'e'</strong> near the brown book to write.</small>
      </div>

      <div className='shelf'>
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
