import { LEVEL_1 } from './levelData';

// Dimensions based on your LEVEL_1 data (16 rows, 18 columns)
export const CHUNK_ROWS = 16;
export const CHUNK_COLS = 18;

// Tile IDs (matching your App.tsx)
const TILES = {
  FLOOR: 0,
  GRASS_1: 2,
  GRASS_2: 3,
  GRASS_3: 4,
  RUG_CENTER: 20, 
};

export type WorldMap = Record<string, number[][]>;

/**
 * Unique key for storing chunks: "x,y"
 */
export const getChunkKey = (x: number, y: number) => `${x},${y}`;

/**
 * Generates a chunk. 
 * If (0,0), returns the prebuilt LEVEL_1.
 * Otherwise, generates random terrain.
 */
const generateChunkData = (chunkX: number, chunkY: number): number[][] => {
  // --- THE SPAWN CHUNK ---
  if (chunkX === 0 && chunkY === 0) {
    return LEVEL_1;
  }

  // --- PROCEDURAL CHUNKS ---
  const grid: number[][] = [];

  for (let row = 0; row < CHUNK_ROWS; row++) {
    const rowData: number[] = [];
    for (let col = 0; col < CHUNK_COLS; col++) {
      // 1. Basic terrain noise
      const rand = Math.random();
      let tile = TILES.GRASS_3; 

      if (rand > 0.8) tile = TILES.GRASS_1;
      else if (rand > 0.6) tile = TILES.GRASS_2;


      rowData.push(tile);
    }
    grid.push(rowData);
  }
  return grid;
};

/**
 * Ensures chunks exist around the player's current chunk coordinates.
 */
export const ensureChunksAround = (
  currentMap: WorldMap, 
  chunkX: number, 
  chunkY: number
): WorldMap | null => {
  const newMap = { ...currentMap };
  let hasChanges = false;

  // Generate 3x3 grid around player
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const targetX = chunkX + dx;
      const targetY = chunkY + dy;
      const key = getChunkKey(targetX, targetY);

      if (!newMap[key]) {
        newMap[key] = generateChunkData(targetX, targetY);
        hasChanges = true;
      }
    }
  }

  return hasChanges ? newMap : null;
};