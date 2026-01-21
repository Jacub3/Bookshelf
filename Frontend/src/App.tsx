import { useEffect, useState, useRef, useMemo, useCallback, type ReactNode } from 'react'
import { BookList, type books } from './Components/Bookshelf.tsx'

import { 
  CHUNK_ROWS,
  CHUNK_COLS,
  getChunkKey, 
  ensureChunksAround, 
  generateEnemiesForChunk,
  type WorldMap, 
  type OverworldEnemy
} from './WorldGenerator'

import { Combat } from './Components/CombatTechnology' 
import WizardCharacterSheet from './Components/WizardCharacterSheet'
import Spellbook from './Components/SpellBook' 

import './App.css'

// ====WALLS==== //
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
import virticalWallLeft from './assets/Wall/virticalWallLeft.png'
import virticalWallRight from './assets/Wall/virticalWallRight.png'
import topL from './assets/Wall/TopL.png'
import topR from './assets/Wall/TopR.png'

import tree from './assets/appleTree.png'
import mountain from './assets/Mountain.png'

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
import goblinSprite from './assets/goblin.png';

const TILE_SIZE = 50;
const MOVEMENT_SPEED = 3.5; 
const ANIMATION_SPEED = 10; 
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;

const CHUNK_WIDTH_PX = CHUNK_COLS * TILE_SIZE;  
const CHUNK_HEIGHT_PX = CHUNK_ROWS * TILE_SIZE; 

const TILE_IMAGES: Record<number, string> = {
  1: horizontalWall, 2: GrassFlowers, 3: GrassBFlowers, 4: grass, 5: tree, 6: mountain, 19: BookshelfTile,
  20: rugCenter, 21: rugTL, 22: rugT, 23: rugTR, 24: rugL, 25: rugR, 26: rugBL, 27: rugB,
  28: rugBR, 40: horizontalbottomWall, 41: cornerBottomLeft, 42: cornerBottomRight,
  43: cornerTopLeft, 44: cornerTopRight, 45: horiTopBottom, 46: horiTopTop, 47: rightTopL,
  48: leftBotL, 49: middleTopL, 50: middleTopL, 51: middleBotL, 52: virticalWallLeft,
  53: virticalWallRight, 55: topL, 56: topR
};

const SPRITE_MAP = {
  down: {row: 2, col: 0, frames: 2},
  right: {row: 1, col: 0, frames: 3},
  left: {row: 1, col: 0, frames: 3},
  up: {row: 3, col: 2, frames: 2},
};

function App() {
  const [book, setBook] = useState<books[]>([])
  
  const [world, setWorld] = useState<WorldMap>(() => {
    const initialMap = {};
    const { updatedMap } = ensureChunksAround(initialMap, 0, 0);
    return updatedMap || initialMap;
  });

  const [overworldEnemies, setOverworldEnemies] = useState<OverworldEnemy[]>([]);
  const [activeCombatEnemyId, setActiveCombatEnemyId] = useState<string | null>(null);

  const [pos, setPos] = useState({ 
    x: 8 * TILE_SIZE, 
    y: 6 * TILE_SIZE 
  });

  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [, setIsWalking] = useState(false); 
  const [animationFrame, setAnimationFrame] = useState(0);
  
  const [showShelf, setShowShelf] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [showSpells, setShowSpells] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const tickCount = useRef(0); 
  const animationReq = useRef<number>(0);
  const posRef = useRef(pos);
  const directionRef = useRef(direction);
  const worldRef = useRef(world); 

  const camX = -pos.x + (VIEWPORT_WIDTH / 2) - (TILE_SIZE / 2);
  const camY = -pos.y + (VIEWPORT_HEIGHT / 2) - (TILE_SIZE / 2);

  useEffect(() => { posRef.current = pos; }, [pos]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { worldRef.current = world; }, [world]);

  useEffect (() => {
    fetch('http://localhost:8080/books')
      .then(res => res.json()).then(setBook)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
      const isTyping = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'SELECT';

      if (isTyping) {
          return; 
      }

      const gameKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd']);
      
      if (gameKeys.has(e.key) || gameKeys.has(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (keysPressed.current.has(e.key)) return; 
      keysPressed.current.add(e.key);
      
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

  const getChunkAndTile = useCallback((x: number, y: number) => {
    const hitX = x + 25; 
    const hitY = y + 40;

    const chunkX = Math.floor(hitX / CHUNK_WIDTH_PX);
    const chunkY = Math.floor(hitY / CHUNK_HEIGHT_PX);

    const rawCol = Math.floor(hitX / TILE_SIZE) % CHUNK_COLS;
    const rawRow = Math.floor(hitY / TILE_SIZE) % CHUNK_ROWS;

    const col = rawCol < 0 ? rawCol + CHUNK_COLS : rawCol;
    const row = rawRow < 0 ? rawRow + CHUNK_ROWS : rawRow;

    return { chunkX, chunkY, col, row };
  }, []);

  const isWalkable = useCallback((x: number, y: number) => {
    const { chunkX, chunkY, col, row } = getChunkAndTile(x, y);
    const chunkKey = getChunkKey(chunkX, chunkY);
    const chunk = worldRef.current[chunkKey];

    if (!chunk) return false;

    const tile = chunk[row]?.[col];
    
    const isFloor = tile === 0;
    const isGrass = tile >= 2 && tile <= 4;
    const isRug = tile >= 20 && tile <= 28;

    return isFloor || isGrass || isRug;
  }, [getChunkAndTile]); 

  const checkInteraction = useCallback((currentPos: {x: number, y: number}) => {
    const { chunkX, chunkY, col, row } = getChunkAndTile(currentPos.x, currentPos.y - 15);

    const chunk = worldRef.current[getChunkKey(chunkX, chunkY)];
    const tile = chunk?.[row]?.[col];

    if (tile && tile >= 20 && tile <= 28) {
        setShowShelf(true);
    }
  }, [getChunkAndTile]);

  useEffect(() => {
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

        const chunkX = Math.floor(nextX / CHUNK_WIDTH_PX);
        const chunkY = Math.floor(nextY / CHUNK_HEIGHT_PX);
        
        const { updatedMap, newChunkKeys } = ensureChunksAround(worldRef.current, chunkX, chunkY);
        
        if (updatedMap) {
          setWorld(updatedMap);
          const newEnemies = newChunkKeys.flatMap(key => generateEnemiesForChunk(key.x, key.y));
          if (newEnemies.length > 0) {
              setOverworldEnemies(prev => [...prev, ...newEnemies]);
          }
        }

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

      const px = posRef.current.x + 25; 
      const py = posRef.current.y + 25; 

      overworldEnemies.forEach(enemy => {
          const ex = enemy.x + 25;
          const ey = enemy.y + 25;
          const dist = Math.sqrt( Math.pow(px - ex, 2) + Math.pow(py - ey, 2) );
          
          if (dist < 30) { 
              setIsWalking(false); 
              setActiveCombatEnemyId(enemy.id); 
              setShowCombat(true);
          }
      });

      animationReq.current = requestAnimationFrame(loop);
    };

    animationReq.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationReq.current!);
  }, [showShelf, showCombat, showSpells, isWalkable, checkInteraction, overworldEnemies]); 

  const handleVictory = () => {
    if (activeCombatEnemyId) {
        setOverworldEnemies(prev => prev.filter(e => e.id !== activeCombatEnemyId));
    }
    setActiveCombatEnemyId(null);
    setShowCombat(false);
  };

  const SPRITE_OFFSET_X = -35; 
  const SPRITE_OFFSET_Y = -26; 

  const renderedChunks = useMemo(() => {
    return Object.entries(world).map(([key, grid]) => {
      const [chunkX, chunkY] = key.split(',').map(Number);
      
      return (
        <div 
          key={key}
          className="map-chunk"
          style={{
            position: 'absolute',
            left: chunkX * CHUNK_WIDTH_PX,
            top: chunkY * CHUNK_HEIGHT_PX,
            width: CHUNK_WIDTH_PX,
            height: CHUNK_HEIGHT_PX,
          }}
        >
          {grid.map((row, rowIndex) => (
             row.map((tileType, colIndex) => {
               let content: ReactNode = null;
               let tileClass = 'tile-floor';

               if (TILE_IMAGES[tileType]) {
                  content = <img src={TILE_IMAGES[tileType]} className="pixel-art" style={{width:'100%', height:'100%'}} alt="" />;
                  if (tileType === 1 || (tileType >= 40 && tileType <= 56)) tileClass = 'tile-wall';
                  else if (tileType === 19) tileClass = 'Bookshelf';
                  else if (tileType >= 20 && tileType <= 28) tileClass = 'tile-rug';
                  else if (tileType >= 2 && tileType <= 4) tileClass = 'grass';
               }

               return (
                 <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`tile ${tileClass}`}
                    style={{
                      position: 'absolute',
                      left: colIndex * TILE_SIZE,
                      top: rowIndex * TILE_SIZE,
                      width: TILE_SIZE,
                      height: TILE_SIZE
                    }}
                 >
                    {content}
                 </div>
               );
            })
          ))}
        </div>
      );
    });
  }, [world]);

  const renderedEnemies = overworldEnemies.map(enemy => (
    <div 
      key={enemy.id}
      style={{
          position: 'absolute',
          left: enemy.x,
          top: enemy.y,
          width: '110px',
          height: '110px',
          backgroundImage: `url(${goblinSprite})`,
          backgroundPosition: '0px 0px', 
          backgroundSize: '350px',
          zIndex: 5
      }}
    />
  ));

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '0 20px'}}>
        <div>
           <h1>The Library</h1>
           <p style={{color:'#ccc'}}>
             POS: {Math.round(pos.x)}, {Math.round(pos.y)} | 
             CHUNK: {Math.floor(pos.x/CHUNK_WIDTH_PX)}, {Math.floor(pos.y/CHUNK_HEIGHT_PX)}
           </p>
        </div>
        <div><WizardCharacterSheet /></div>
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', justifyContent:'center' }}>
          <button onClick={() => setShowSpells(true)} style={{background: '#9c27b0', color: 'white'}}>Open Spellbook</button>
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
          borderRadius: '8px',
          background: '#0a0a0a'
        }}
      >  
        <div 
          className="game-world"
          style={{
            transform: `translate(${camX}px, ${camY}px)`,
            willChange: 'transform',
          }}
        >
          {renderedChunks}
          {renderedEnemies}

          <div 
            className="character"
            style={{
              position: 'absolute',
              transform: `translate(${pos.x}px, ${pos.y}px)`, 
              zIndex: 10
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
          <div className="character_shadow" style={{position:'absolute', transform: `translate(${pos.x}px, ${pos.y}px)`}}></div>
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

      {showCombat && (
        <div className="ui-overlay" style={{background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000}}>
          <div style={{background: 'white', padding: '20px', borderRadius: '8px', width: '800px', maxHeight: '90vh', overflow: 'auto'}}>
             <button onClick={() => setShowCombat(false)} style={{float: 'right'}}>Run Away (Esc)</button>
             <Combat 
                initialEnemyData={overworldEnemies.find(e => e.id === activeCombatEnemyId)?.combatData || { level: 1 }}
                onVictory={handleVictory} 
             />
          </div>
        </div>
      )}

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