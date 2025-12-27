/*
Things I want:
  - slower movement
    - also decrease the movement from tile to tile to quarter tile to quarter tile
  - more zoomed in perspective
  - added detail to the library
  - added detail to the bookshelf
  - added detail to the outside
*/

import { useEffect, useState, useRef, type ReactNode } from 'react'
import { BookList, type books } from './Components/Buttons'
import { LEVEL_1 } from './levelData'
import './App.css'

// Character Image
import wizardIcon from './assets/Wizard.png'

// Rug Imports
import rugCenter from './assets/Rug.png';
import rugTL from './assets/TopLeftRug.png';
import rugT from './assets/TopRug.png';
import rugTR from './assets/TopRight.png'; 
import rugL from './assets/LeftRug.png';
import rugR from './assets/RightRug.png';
import rugBL from './assets/BottomLeftRug.png';
import rugB from './assets/BottomRug.png';
import rugBR from './assets/BottomRightRug.png';

const TILE_SIZE = 50;
const MOVE_SPEED_MS = 100;

// Map IDs to Images
const TILE_IMAGES: Record<number, string> = {
  20: rugCenter,
  21: rugTL,
  22: rugT,
  23: rugTR,
  24: rugL,
  25: rugR,
  26: rugBL,
  27: rugB,
  28: rugBR
};

function App() {
  const [book, setBook] = useState<books[]>([])
  const [playerPos, setPlayerPos] = useState({ col: 1, row: 1 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [showShelf, setShowShelf] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef<number>(0);

  useEffect (() => {
    fetch('http://localhost:8080/books')
      .then(res => res.json())
      .then(data => {
        setBook(data);
      })
      .catch(err => console.error("Had error fetching books", err));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);

      if (e.key === 'Escape'){
        setShowShelf(false);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

useEffect(() => {
    if (showShelf) return;

    const gameLoop = setInterval(() => {
      const now = Date.now();

      if (now - lastMoveTime.current < MOVE_SPEED_MS) return;

      const keys = keysPressed.current;
      let dx = 0;
      let dy = 0;

      if (keys.has('ArrowUp') || keys.has('w')) dy = -1;
      else if (keys.has('ArrowDown') || keys.has('s')) dy = 1;
      else if (keys.has('ArrowLeft') || keys.has('a')) dx = -1;
      else if (keys.has('ArrowRight') || keys.has('d')) dx = 1;

      if (keys.has('e') || keys.has('E')) {
        setPlayerPos((curr) => {
             const tile = LEVEL_1[curr.row][curr.col];
             if (tile >= 20 && tile <= 28) setShowShelf(true);
             return curr;
        });
        keysPressed.current.delete('e');
        keysPressed.current.delete('E');
      }

      if (dx === 0 && dy === 0) return;

      // PROCESS MOVEMENT
      setPlayerPos((prev) => {
        const newCol = prev.col + dx;
        const newRow = prev.row + dy;

        if (dx < 0) setFacingLeft(true);
        if (dx > 0) setFacingLeft(false);

        const targetTile = LEVEL_1[newRow]?.[newCol];
        if (targetTile === 1) return prev; // Wall

        lastMoveTime.current = Date.now();
        return { col: newCol, row: newRow };
      });

    }, 20);

    return () => clearInterval(gameLoop);
  }, [showShelf]);

  return (
    <>
      <h1>Library Map</h1>
      <p style={{textAlign:'center', color:'#ccc'}}>Walk to the Rug. Press 'E'.</p>

      <div 
        className="game-grid"
        style={{
          width: LEVEL_1[0].length * TILE_SIZE, 
          height: LEVEL_1.length * TILE_SIZE,
        }}
      >
        {LEVEL_1.map((row, rowIndex) => (
          row.map((tileType, colIndex) => {
             let content: ReactNode = null;
             let tileClass = 'tile-floor';
             if (tileType === 1) tileClass = 'tile-wall';
             if (tileType >= 20 && tileType <= 28) {
                tileClass = 'tile-rug'; 
                content = <img src={TILE_IMAGES[tileType]} className="pixel-art" style={{width: '100%', height:'100%'}} />;
             }
             return (
               <div key={`${rowIndex}-${colIndex}`} className={`tile ${tileClass}`}>
                  {content}
               </div>
             );
          })
        ))}

        {/* CHARACTER */}
        <div 
          className={`character ${facingLeft ? 'facing-left' : ''}`} // APPLY CLASS HERE
          style={{
            left: playerPos.col * TILE_SIZE,
            top: playerPos.row * TILE_SIZE,
          }}
        >
          <img src={wizardIcon} className="pixel-art" style={{width:'100%'}} />
        </div>

      </div>

      {showShelf && (
        <div id="ui-overlay-container" className="ui-overlay">
          <div className="ui-content">
            <button className="close-btn" onClick={() => setShowShelf(false)}>Close (Esc)</button>
            
            <h2 style={{fontFamily:'PlayfairDisplay', textAlign:'center'}}>The Bookshelf</h2>
            
            <div className='shelf'>
              <BookList book={book} setBook={setBook} />
            </div>

            <div style={{marginTop: '2rem'}}>
              {book.map((singleBook)=>(
                <div key={singleBook.id} className="book-card" style={{color: 'white', borderBottom:'1px solid #555', padding:'10px'}}>
                  <p style={{fontSize:'1.2em'}}><strong>{singleBook.title}</strong></p>
                  <p><em>by {singleBook.author}</em></p>
                  <p>{singleBook.contents}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default App