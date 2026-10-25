import { GridMap } from './map.js';

const ROOM_SIZE = 8;
const CELL_SIZE = 2;
const BLOCKS = [[2, 2], [5, 1], [1, 5], [5, 5]];
const SPAWN_CELL = [4, 4];

export function createDungeon() {
  const map = GridMap.squareRoom(ROOM_SIZE, CELL_SIZE);
  for (const [x, y] of BLOCKS) map.closeCell(x, y);

  const [cx, cy] = SPAWN_CELL;
  return { map, spawn: { x: (cx + 0.5) * CELL_SIZE, y: (cy + 0.5) * CELL_SIZE, angle: 0 } };
}
