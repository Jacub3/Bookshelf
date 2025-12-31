/*
Things I want:
  - more zoomed in perspective
*/

import { useEffect, useState, useRef, type ReactNode } from 'react'
import { BookList, type books } from './Components/Buttons'
import { LEVEL_1 } from './levelData'
import './App.css'

// -- ASSETS --
import TheBookshelf from './assets/TheBookshelf.png'
import BookshelfTile from './assets/BookshelfTile.png'
import GrassFlowers from './assets/Grass1.png'
import GrassBFlowers from './assets/Grass2.png'
import grass from './assets/Grass3.png'
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
const MOVEMENT_SPEED = 2.5; 
const ANIMATION_SPEED = 10; 

const MAX_FRAMES = 10; 

const TILE_IMAGES: Record<number, string> = {
  2: GrassFlowers, 3: GrassBFlowers, 4: grass, 19: BookshelfTile,
  20: rugCenter, 21: rugTL, 22: rugT, 23: rugTR, 
  24: rugL, 25: rugR, 26: rugBL, 27: rugB, 28: rugBR
};

const SPRITE_MAP = {
  down: {row: 2, col: 1},
  right: {row: 1, col: 2},
  left: {row: 1, col: 2},
  up: {row: 3, col: 2},
};

function App() {
  const [book, setBook] = useState<books[]>([])
  
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [, setIsWalking] = useState(false); 
  const [animationFrame, setAnimationFrame] = useState(0);
  
  const [showShelf, setShowShelf] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const tickCount = useRef(0); 
  const animationReq = useRef<number>(0);

  const posRef = useRef(pos);
  const directionRef = useRef(direction);

  useEffect(() => { posRef.current = pos; }, [pos]);
  useEffect(() => { directionRef.current = direction; }, [direction]);

  useEffect (() => {
    fetch('http://localhost:8080/books')
      .then(res => res.json()).then(setBook)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysPressed.current.has(e.key)) return; 
      keysPressed.current.add(e.key);
      if (e.key === 'Escape') setShowShelf(false);
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

  const isWalkable = (x: number, y: number) => {
    const col = Math.floor((x + 25) / TILE_SIZE); 
    const row = Math.floor((y + 40) / TILE_SIZE); 
    if (row < 0 || row >= LEVEL_1.length || col < 0 || col >= LEVEL_1[0].length) return false;
    const tile = LEVEL_1[row][col];
    return tile !== 1 && tile !== 19;
  };

  const checkInteraction = (currentPos: {x: number, y: number}) => {
      const col = Math.floor((currentPos.x + 25) / TILE_SIZE);
      const row = Math.floor((currentPos.y + 25) / TILE_SIZE);
      const tile = LEVEL_1[row]?.[col];
      if (tile >= 20 && tile <= 28) {
          setShowShelf(true);
      }
  };

  // -- GAME LOOP --
  useEffect(() => {
    if (showShelf) return;

    const loop = () => {
      const currentPos = posRef.current;
      const currentDir = directionRef.current;
      const keys = keysPressed.current;

      let dx = 0;
      let dy = 0;

      if (keys.has('ArrowUp') || keys.has('w')) dy -= 1;
      if (keys.has('ArrowDown') || keys.has('s')) dy += 1;
      if (keys.has('ArrowLeft') || keys.has('a')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('d')) dx += 1;

      let newDirection = currentDir;
      if (dy > 0) newDirection = 'down';
      else if (dy < 0) newDirection = 'up';

      if (dx > 0) newDirection = 'right';
      else if (dx < 0) newDirection = 'left';

      if (keys.has('e') || keys.has('E')) {
        checkInteraction(currentPos);
        keysPressed.current.delete('e');
        keysPressed.current.delete('E');
      }

      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx*dx + dy*dy);
        const normDx = (dx / length) * MOVEMENT_SPEED;
        const normDy = (dy / length) * MOVEMENT_SPEED;

        let nextX = currentPos.x + normDx;
        let nextY = currentPos.y + normDy;

        if (!isWalkable(nextX, currentPos.y)) nextX = currentPos.x;
        if (!isWalkable(currentPos.x, nextY)) nextY = currentPos.y;
        if (!isWalkable(nextX, nextY)) { nextX = currentPos.x; nextY = currentPos.y; }

        setPos({ x: nextX, y: nextY });
        setDirection(newDirection);
        setIsWalking(true);

        tickCount.current++;
        if (tickCount.current > ANIMATION_SPEED) {
          setAnimationFrame(prev => (prev + 1) % MAX_FRAMES); 
          tickCount.current = 0;
        }
      } else {
        setIsWalking(false);
        setAnimationFrame(0);
      }

      animationReq.current = requestAnimationFrame(loop);
    };

    animationReq.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationReq.current!);
  }, [showShelf]); 

  const SPRITE_OFFSET_X = -35; 
  const SPRITE_OFFSET_Y = -26; 

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
             if ([2,3,4].includes(tileType)){
               tileClass = 'grass';
               content = <img src={TILE_IMAGES[tileType]} className="pixel-art" style={{width:'100%', height:'100%'}}/>;
             }
             if (tileType >= 20 && tileType <= 28) {
                tileClass = 'tile-rug'; 
                content = <img src={TILE_IMAGES[tileType]} className="pixel-art" style={{width: '100%', height:'100%'}} />;
             }
             if (tileType === 19){
                tileClass = 'Bookshelf';
                content = <img src={TILE_IMAGES[tileType]} />;
             }

             return (
               <div key={`${rowIndex}-${colIndex}`} className={`tile ${tileClass}`}>
                  {content}
               </div>
             );
          })
        ))}

        <div 
          className="character"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`, 
          }}
        >
           <div 
             className="character_sprite"
             style={{
               transform: direction === 'left' ? 'scaleX(-1)' : 'none',
               
               backgroundPosition: `
                ${-((SPRITE_MAP[direction].col + animationFrame) * 50) + SPRITE_OFFSET_X}px 
                 ${-(SPRITE_MAP[direction].row * 50) + SPRITE_OFFSET_Y}px
               `
             }}
           />
           <div className="character_shadow"></div>
        </div>

      </div>

      {showShelf && (
        <div id="ui-overlay-container" className="ui-overlay">
          <div className="ui-content">
            <button className="close-btn" onClick={() => setShowShelf(false)}>Close (Esc)</button>
            <h2 style={{fontFamily:'PlayfairDisplay', textAlign:'center'}}>The Bookshelf</h2>
            <div className="bookshelf-container">
              <img src={TheBookshelf} className="shelf-image" alt="Bookshelf" />
              <div className="shelf-slots">
                <BookList book={book} setBook={setBook} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App