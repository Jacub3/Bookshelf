// WorldGenerator.ts
import { LEVEL_1 } from './levelData';

// Dimensions
export const CHUNK_ROWS = 16;
export const CHUNK_COLS = 18;
export const TILE_SIZE = 50; 

// === WORLD CONFIGURATION ===
// PLAYABLE_RADIUS: How many chunks out from the center (0,0) the player can walk.
// 7 means the map goes from -7 to +7 (approx 200 chunks total area).
const PLAYABLE_RADIUS = 7; 

// BORDER_RADIUS: The chunk coordinate where the world ends.
// We make this 1 higher than playable so we can render a "wall" of mountains there.
const BORDER_RADIUS = PLAYABLE_RADIUS + 1; 

const TILES = {
  GRASS_1: 2,
  GRASS_2: 3,
  GRASS_3: 4,
  TREE: 5,
  MOUNTAIN: 6
};

export type WorldMap = Record<string, number[][]>;
export interface EnemyCombatData { level: number; }

export interface OverworldEnemy {
    id: string;
    x: number;
    y: number;
    chunkKey: string;
    combatData: EnemyCombatData; 
}

export const getChunkKey = (x: number, y: number) => `${x},${y}`;

/**
 * Helper to check if a coordinate is strictly at the border
 */
const isBorderChunk = (x: number, y: number) => {
    return Math.abs(x) === BORDER_RADIUS || Math.abs(y) === BORDER_RADIUS;
};

/**
 * Generates a chunk. 
 * If the chunk is on the border, it returns a solid block of mountains.
 */
const generateChunkData = (chunkX: number, chunkY: number): number[][] => {
  // 1. If it's the center, return the Library
  if (chunkX === 0 && chunkY === 0) return LEVEL_1;

  // 2. If it is a Border Chunk, return ALL MOUNTAINS (The World Edge)
  if (isBorderChunk(chunkX, chunkY)) {
      const mountainGrid: number[][] = [];
      for (let r = 0; r < CHUNK_ROWS; r++) {
          const row = new Array(CHUNK_COLS).fill(TILES.MOUNTAIN);
          mountainGrid.push(row);
      }
      return mountainGrid;
  }

  // 3. Otherwise, generate normal terrain
  const grid: number[][] = [];
  for (let row = 0; row < CHUNK_ROWS; row++) {
    const rowData: number[] = [];
    for (let col = 0; col < CHUNK_COLS; col++) {
      const rand = Math.random();
      let tile = TILES.GRASS_3; 
      if (rand > 0.8) tile = TILES.GRASS_1;
      else if (rand > 0.6) tile = TILES.GRASS_2;
      else if(rand > 0.5) tile = TILES.TREE;
      else if(rand > 0.45) tile = TILES.MOUNTAIN;
      else if(rand > 0.3) tile = TILES.GRASS_3; 
      rowData.push(tile);
    }
    grid.push(rowData);
  }
  return grid;
};

export const generateEnemiesForChunk = (chunkX: number, chunkY: number): OverworldEnemy[] => {
    // No enemies in Library OR in the Mountain Borders
    if ((chunkX === 0 && chunkY === 0) || isBorderChunk(chunkX, chunkY)) return [];

    const enemies: OverworldEnemy[] = [];
    const count = Math.floor(Math.random() * 5); 

    for (let i = 0; i < count; i++) {
        const localCol = Math.floor(Math.random() * (CHUNK_COLS - 2)) + 1;
        const localRow = Math.floor(Math.random() * (CHUNK_ROWS - 2)) + 1;
        const globalX = (chunkX * CHUNK_COLS * TILE_SIZE) + (localCol * TILE_SIZE);
        const globalY = (chunkY * CHUNK_ROWS * TILE_SIZE) + (localRow * TILE_SIZE);

        enemies.push({
            id: `${chunkX}-${chunkY}-${i}-${Date.now()}`,
            chunkKey: getChunkKey(chunkX, chunkY),
            x: globalX,
            y: globalY,
            combatData: { level: 1 } 
        });
    }
    return enemies;
};

/**
 * Ensures chunks exist. 
 * STRICTLY PREVENTS generating anything past BORDER_RADIUS.
 */
export const ensureChunksAround = (
  currentMap: WorldMap, 
  chunkX: number, 
  chunkY: number
): { updatedMap: WorldMap | null, newChunkKeys: {x: number, y: number}[] } => {
  
  const newMap = { ...currentMap };
  let hasChanges = false;
  const newChunkKeys: {x: number, y: number}[] = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const targetX = chunkX + dx;
      const targetY = chunkY + dy;

      // === BOUNDARY CHECK ===
      // If the target is beyond our border wall, DO NOT generate it.
      if (Math.abs(targetX) > BORDER_RADIUS || Math.abs(targetY) > BORDER_RADIUS) {
          continue;
      }

      const key = getChunkKey(targetX, targetY);

      if (!newMap[key]) {
        newMap[key] = generateChunkData(targetX, targetY);
        hasChanges = true;
        // Only spawn enemies if it's NOT a mountain border
        if (!isBorderChunk(targetX, targetY)) {
            newChunkKeys.push({ x: targetX, y: targetY });
        }
      }
    }
  }

  return { 
      updatedMap: hasChanges ? newMap : null, 
      newChunkKeys 
  };
};