import { GridMap } from './map.js';

const ROOM_SIZE = 8;
const CELL_SIZE = 2;
const BLOCKS = [[2, 2], [5, 1], [1, 5], [5, 5]];

export function createDungeon() {
  const map = GridMap.squareRoom(ROOM_SIZE, CELL_SIZE);
  for (const [x, y] of BLOCKS) map.closeCell(x, y);

  const worldSize = ROOM_SIZE * CELL_SIZE;
  return { map, spawn: { x: worldSize / 2, y: worldSize / 2, angle: 0 } };
}
