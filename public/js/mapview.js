import { connectDungeon } from './dungeon-client.js';
import { N, E, S, W } from '/shared/map.js';

const CELL_PX = 80;
const MARGIN = 24;
const WALL_PX = 6;

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

let hover = null;

const { map, spawn, toggleEdge } = await connectDungeon({ onChange: () => draw() });

canvas.width = map.width * CELL_PX + MARGIN * 2;
canvas.height = map.height * CELL_PX + MARGIN * 2;

const cellX = (x) => MARGIN + x * CELL_PX;
const cellY = (y) => MARGIN + y * CELL_PX;
const isClosed = (x, y) => [N, E, S, W].every((dir) => map.hasWall(x, y, dir));

function edgeSegment(x, y, dir) {
  const left = cellX(x);
  const top = cellY(y);
  const right = left + CELL_PX;
  const bottom = top + CELL_PX;
  if (dir === N) return [left, top, right, top];
  if (dir === S) return [left, bottom, right, bottom];
  if (dir === W) return [left, top, left, bottom];
  return [right, top, right, bottom];
}

function strokeSegment([x1, y1, x2, y2]) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function draw() {
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
  for (let i = 0; i <= map.width; i++) strokeSegment([cellX(i), cellY(0), cellX(i), cellY(map.height)]);
  for (let i = 0; i <= map.height; i++) strokeSegment([cellX(0), cellY(i), cellX(map.width), cellY(i)]);

  ctx.strokeStyle = '#2a1510';
  ctx.lineWidth = WALL_PX;
  ctx.lineCap = 'square';
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      for (const dir of [N, S, W, E]) {
        if (map.hasWall(x, y, dir)) strokeSegment(edgeSegment(x, y, dir));
      }
    }
  }

  if (hover) {
    ctx.strokeStyle = 'rgba(58, 130, 220, 0.85)';
    ctx.lineWidth = WALL_PX;
    strokeSegment(edgeSegment(hover.x, hover.y, hover.dir));
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
  strokeSegment([px, py, px + Math.cos(spawn.angle) * 22, py + Math.sin(spawn.angle) * 22]);
}

// The edge of the clicked cell that is nearest to the pointer, or null when
// the pointer is off the grid or the edge is a dungeon limit.
function edgeAt(event) {
  const rect = canvas.getBoundingClientRect();
  const px = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const py = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const x = Math.floor((px - MARGIN) / CELL_PX);
  const y = Math.floor((py - MARGIN) / CELL_PX);
  if (!map.inBounds(x, y)) return null;

  const lx = (px - MARGIN) / CELL_PX - x;
  const ly = (py - MARGIN) / CELL_PX - y;
  const candidates = [[ly, N], [1 - ly, S], [lx, W], [1 - lx, E]];
  const [, dir] = candidates.reduce((best, c) => (c[0] < best[0] ? c : best));
  return map.isBoundaryEdge(x, y, dir) ? null : { x, y, dir };
}

canvas.addEventListener('mousemove', (event) => {
  hover = edgeAt(event);
  canvas.style.cursor = hover ? 'pointer' : 'default';
  draw();
});

canvas.addEventListener('mouseleave', () => {
  hover = null;
  draw();
});

canvas.addEventListener('click', (event) => {
  const edge = edgeAt(event);
  if (edge) toggleEdge(edge.x, edge.y, edge.dir);
});

draw();
