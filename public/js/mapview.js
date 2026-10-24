import { createDungeon } from './dungeon.js';
import { N, E, S, W } from './map.js';

const CELL_PX = 80;
const MARGIN = 24;
const WALL_PX = 6;

const { map, spawn } = createDungeon();
const canvas = document.getElementById('map');
const size = map.width * CELL_PX + MARGIN * 2;
canvas.width = size;
canvas.height = map.height * CELL_PX + MARGIN * 2;
const ctx = canvas.getContext('2d');

const cellX = (x) => MARGIN + x * CELL_PX;
const cellY = (y) => MARGIN + y * CELL_PX;
const isClosed = (x, y) => [N, E, S, W].every((dir) => map.hasWall(x, y, dir));

ctx.fillStyle = '#14110f';
ctx.fillRect(0, 0, canvas.width, canvas.height);

for (let y = 0; y < map.height; y++) {
  for (let x = 0; x < map.width; x++) {
    ctx.fillStyle = isClosed(x, y) ? '#7a3624' : '#c4a876';
    ctx.fillRect(cellX(x), cellY(y), CELL_PX, CELL_PX);
  }
}

ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
ctx.lineWidth = 1;
for (let i = 0; i <= map.width; i++) {
  ctx.beginPath();
  ctx.moveTo(cellX(i), cellY(0));
  ctx.lineTo(cellX(i), cellY(map.height));
  ctx.stroke();
}
for (let i = 0; i <= map.height; i++) {
  ctx.beginPath();
  ctx.moveTo(cellX(0), cellY(i));
  ctx.lineTo(cellX(map.width), cellY(i));
  ctx.stroke();
}

ctx.strokeStyle = '#2a1510';
ctx.lineWidth = WALL_PX;
ctx.lineCap = 'square';
for (let y = 0; y < map.height; y++) {
  for (let x = 0; x < map.width; x++) {
    const left = cellX(x);
    const top = cellY(y);
    const right = left + CELL_PX;
    const bottom = top + CELL_PX;
    const sides = [
      [N, left, top, right, top],
      [S, left, bottom, right, bottom],
      [W, left, top, left, bottom],
      [E, right, top, right, bottom],
    ];
    for (const [dir, x1, y1, x2, y2] of sides) {
      if (!map.hasWall(x, y, dir)) continue;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

const scale = CELL_PX / map.cellSize;
const px = MARGIN + spawn.x * scale;
const py = MARGIN + spawn.y * scale;
ctx.fillStyle = '#3aa655';
ctx.beginPath();
ctx.arc(px, py, 8, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = '#3aa655';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(px, py);
ctx.lineTo(px + Math.cos(spawn.angle) * 22, py + Math.sin(spawn.angle) * 22);
ctx.stroke();
