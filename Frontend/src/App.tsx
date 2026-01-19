import { useEffect, useState, useRef, type ReactNode } from 'react'
import { BookList, type books } from './Components/Bookshelf.tsx'
import { LEVEL_1 } from './levelData'

import { Combat } from './Components/CombatTechnology' 
import WizardCharacterSheet from './Components/WizardCharacterSheet'

import Spellbook from './Components/SpellBook' 

import './App.css'

// == Walls ==
import horizontalWall from './assets/Wall/horizontalWall.png';
import horizontalbottomWall from './assets/Wall/bottomWallHorizontal.png'
import cornerBottomLeft from './assets/Wall/CornerLBottomLeft.png'
import cornerBottomRight from './assets/Wall/CornerLBottomRight.png'
import cornerTopLeft from './assets/Wall/CornerLTopLeft.png'
import cornerTopRight from './assets/Wall/CornerLTopRight.png'
import horiTopBottom from './assets/Wall/horiTopBottom.png'
import horiTopTop from './assets/Wall/horiTopTop.png'
import rightTopL from './assets/Wall/RightTopL.png'
import leftBotL from './assets/Wall/LeftBotL.png'
import middleTopL from './assets/Wall/MiddleTopL.png'
import middleBotL from './assets/Wall/MiddleBotL.png'


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

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;

const TILE_IMAGES: Record<number, string> = {
  1: horizontalWall, 2: GrassFlowers, 3: GrassBFlowers, 4: grass, 19: BookshelfTile,
  20: rugCenter, 21: rugTL, 22: rugT, 23: rugTR, 24: rugL, 25: rugR, 26: rugBL, 27: rugB,
  28: rugBR, 40: horizontalbottomWall, 41: cornerBottomLeft, 42: cornerBottomRight,
  43: cornerTopLeft, 44: cornerTopRight, 45: horiTopBottom, 46: horiTopTop, 47: rightTopL,
  48: leftBotL

};

const SPRITE_MAP = {
  down: {row: 2, col: 0, frames: 2},
  right: {row: 1, col: 0, frames: 3},
  left: {row: 1, col: 0, frames: 3},
  up: {row: 3, col: 2, frames: 2},
};

function App() {
  const [book, setBook] = useState<books[]>([])
  
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [, setIsWalking] = useState(false); 
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // -- UI STATES --
  const [showShelf, setShowShelf] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [showSpells, setShowSpells] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const tickCount = useRef(0); 
  const animationReq = useRef<number>(0);

  const posRef = useRef(pos);
  const directionRef = useRef(direction);

  let camX = -pos.x + (VIEWPORT_WIDTH / 2) - (TILE_SIZE / 2);
  let camY = -pos.y + (VIEWPORT_HEIGHT / 2) - (TILE_SIZE / 2);

  const mapWidth = LEVEL_1[0].length * TILE_SIZE;
  const mapHeight = LEVEL_1.length * TILE_SIZE;

  if (camX > 0) camX = 0;
  if (camX < -(mapWidth - VIEWPORT_WIDTH)) camX = -(mapWidth - VIEWPORT_WIDTH)

  if (camY > 0) camY = 0;
  if (camY < -(mapHeight - VIEWPORT_HEIGHT)) camY = -(mapHeight - VIEWPORT_HEIGHT);

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
      
      // Close overlays with Escape
      if (e.key === 'Escape') {
          setShowShelf(false);
          setShowCombat(false);
          setShowSpells(false);
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
      // Rug opens Bookshelf
      if (tile >= 20 && tile <= 28) {
          setShowShelf(true);
      }
  };

  // -- GAME LOOP --
  useEffect(() => {
    // Pause movement if any UI is open
    if (showShelf || showCombat || showSpells) return;

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
        const currentMaxFrames = SPRITE_MAP[newDirection]?.frames || 3;

        if (tickCount.current > ANIMATION_SPEED) {
          setAnimationFrame(prev => (prev + 1) % currentMaxFrames); 
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
  }, [showShelf, showCombat, showSpells]); // Added new states to dependency

  const SPRITE_OFFSET_X = -35; 
  const SPRITE_OFFSET_Y = -26; 

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '0 20px'}}>
        <div>
           <h1>Library Map</h1>
           <p style={{color:'#ccc'}}>Walk to the Rug & Press 'E'. Use buttons to Fight or manage Spells.</p>
        </div>
        
        {/* --- HUD: Character Sheet --- */}
        <div>
           <WizardCharacterSheet />
        </div>
      </div>

      {/* --- MENU BAR --- */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', justifyContent:'center' }}>
          <button onClick={() => setShowCombat(true)} style={{background: '#d32f2f', color: 'white'}}>
            Enter Combat Arena
          </button>
          <button onClick={() => setShowSpells(true)} style={{background: '#9c27b0', color: 'white'}}>
            Open Spellbook
          </button>
      </div>

      <div
        className="camera-viewport"
        style={{
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
          margin: '0 auto',
          position: 'relative', 
          overflow: 'hidden',
          border: '4px solid #333',
          borderRadius: '8px'
        }}
      >  
        <div 
          className="game-grid"
          style={{
            width: mapWidth, 
            height: mapHeight,
            transform: `translate(${camX}px, ${camY}px)`,
            transition: 'transform 0.1s linear', 
          }}
        >
          {LEVEL_1.map((row, rowIndex) => (
            row.map((tileType, colIndex) => {
               let content: ReactNode = null;
               let tileClass = 'tile-floor';
                if (tileType === 1) {
                  content = <img src={TILE_IMAGES[tileType]} className="pixel-art" style={{width:'100%', height:'100%'}}/>;
                }
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
                  ${-((SPRITE_MAP[direction].col + (animationFrame % SPRITE_MAP[direction].frames)) * 50) + SPRITE_OFFSET_X}px 
                  ${-(SPRITE_MAP[direction].row * 50) + SPRITE_OFFSET_Y}px
                 `
               }}
             />
          </div>
          <div className="character_shadow"></div>
        </div>
      </div>

      {/* --- OVERLAYS --- */}

      {/* 1. Bookshelf Overlay */}
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

      {/* 2. Combat Overlay */}
      {showCombat && (
        <div className="ui-overlay" style={{background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000}}>
          <div style={{background: 'white', padding: '20px', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflow: 'auto'}}>
             <button onClick={() => setShowCombat(false)} style={{float: 'right'}}>Close (Esc)</button>
             <Combat />
          </div>
        </div>
      )}

      {/* 3. Spellbook Overlay */}
      {showSpells && (
        <div className="ui-overlay" style={{background: 'rgba(50, 0, 50, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000}}>
          <div style={{background: '#fff0f5', padding: '20px', borderRadius: '8px', width: '800px', maxHeight: '90vh', overflow: 'auto'}}>
             <button onClick={() => setShowSpells(false)} style={{float: 'right'}}>Close (Esc)</button>
             <Spellbook />
          </div>
        </div>
      )}

    </>
  )
}

export default App