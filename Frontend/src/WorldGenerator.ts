// WorldGenerator.ts
import { LEVEL_1 } from './levelData';

// Dimensions based on your LEVEL_1 data (16 rows, 18 columns)
export const CHUNK_ROWS = 16;
export const CHUNK_COLS = 18;
export const TILE_SIZE = 50; // Needed for pixel positioning

// Tile IDs (matching your App.tsx)
const TILES = {
  GRASS_1: 2,
  GRASS_2: 3,
  GRASS_3: 4,
};

export type WorldMap = Record<string, number[][]>;
export interface EnemyCombatData {
    level: number;
}

export interface OverworldEnemy {
    id: string;
    x: number;
    y: number;
    chunkKey: string;
    combatData: EnemyCombatData; 
}

/**
 * Unique key for storing chunks: "x,y"
 */
export const getChunkKey = (x: number, y: number) => `${x},${y}`;

/**
 * Generates a chunk. 
 */
const generateChunkData = (chunkX: number, chunkY: number): number[][] => {
  if (chunkX === 0 && chunkY === 0) return LEVEL_1;

  const grid: number[][] = [];
  for (let row = 0; row < CHUNK_ROWS; row++) {
    const rowData: number[] = [];
    for (let col = 0; col < CHUNK_COLS; col++) {
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
 * NEW: Generates enemies for a specific chunk
 */
export const generateEnemiesForChunk = (chunkX: number, chunkY: number): OverworldEnemy[] => {
    // Constraint 1: They cannot spawn in the library (0,0)
    if (chunkX === 0 && chunkY === 0) return [];

    const enemies: OverworldEnemy[] = [];
    
    // Constraint 2: Randomly decide count (0 to 4)
    // Math.random() < 0.3 might mean 0 enemies, etc.
    // Let's force a roll between 0 and 4.
    const count = Math.floor(Math.random() * 5); // 0, 1, 2, 3, 4

    for (let i = 0; i < count; i++) {
        // Random tile position within the chunk
        // We add 1 or 2 to padding so they don't spawn literally on the edge seam
        const localCol = Math.floor(Math.random() * (CHUNK_COLS - 2)) + 1;
        const localRow = Math.floor(Math.random() * (CHUNK_ROWS - 2)) + 1;

        // Convert to Global Pixel Coordinates
        const globalX = (chunkX * CHUNK_COLS * TILE_SIZE) + (localCol * TILE_SIZE);
        const globalY = (chunkY * CHUNK_ROWS * TILE_SIZE) + (localRow * TILE_SIZE);

        enemies.push({
            id: `${chunkX}-${chunkY}-${i}-${Date.now()}`,
            chunkKey: getChunkKey(chunkX, chunkY),
            x: globalX,
            y: globalY,
            // Generate basic combat data placeholders (level 1 for now)
            combatData: { level: 1 } 
        });
    }

    return enemies;
};

/**
 * Ensures chunks exist around the player's current chunk coordinates.
 * Returns both the map updates AND a list of newly generated chunks so App.tsx can spawn mobs.
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
      const key = getChunkKey(targetX, targetY);

      if (!newMap[key]) {
        newMap[key] = generateChunkData(targetX, targetY);
        hasChanges = true;
        newChunkKeys.push({ x: targetX, y: targetY });
      }
    }
  }

  return { 
      updatedMap: hasChanges ? newMap : null, 
      newChunkKeys 
  };
};