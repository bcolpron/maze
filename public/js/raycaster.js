import { TEX_SIZE } from './textures.js';
import { E, W, N, S } from '/shared/map.js';

const FOV_SCALE = 0.75;
const AMBIENT = 0.1;
const FALLOFF = 0.03;
const SIDE_DIM = 0.72;
const MASK = TEX_SIZE - 1;

const light = (dist) => Math.max(AMBIENT, 1 / (1 + dist * dist * FALLOFF));

export class Raycaster {
  constructor(canvas, width, height, textures) {
    this.w = width;
    this.h = height;
    this.textures = textures;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d');
    this.image = this.ctx.createImageData(width, height);
    this.px = this.image.data;
    this.px.fill(255);
    this.depth = new Float32Array(width);
  }

  render(player, map) {
    this.drawFloorAndCeiling(player);
    this.drawWalls(player, map);
    this.ctx.putImageData(this.image, 0, 0);
  }

  drawFloorAndCeiling(player) {
    const { w, h, px } = this;
    const floor = this.textures.floor.data;
    const ceil = this.textures.ceiling.data;
    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const planeX = -dirY * FOV_SCALE;
    const planeY = dirX * FOV_SCALE;
    const rx0 = dirX - planeX;
    const ry0 = dirY - planeY;
    const half = h / 2;

    for (let y = h >> 1; y < h; y++) {
      const rowDist = half / (y - half + 0.5);
      const s = light(rowDist);
      const stepX = (rowDist * 2 * planeX) / w;
      const stepY = (rowDist * 2 * planeY) / w;
      let fx = player.x + rowDist * rx0;
      let fy = player.y + rowDist * ry0;
      let floorIdx = y * w * 4;
      let ceilIdx = (h - 1 - y) * w * 4;

      for (let x = 0; x < w; x++) {
        const t = ((((fy * TEX_SIZE) & MASK) * TEX_SIZE) + ((fx * TEX_SIZE) & MASK)) * 3;
        px[floorIdx] = floor[t] * s;
        px[floorIdx + 1] = floor[t + 1] * s;
        px[floorIdx + 2] = floor[t + 2] * s;
        px[ceilIdx] = ceil[t] * s;
        px[ceilIdx + 1] = ceil[t + 1] * s;
        px[ceilIdx + 2] = ceil[t + 2] * s;
        fx += stepX;
        fy += stepY;
        floorIdx += 4;
        ceilIdx += 4;
      }
    }
  }

  drawWalls(player, map) {
    const { w, h, px, depth } = this;
    const wall = this.textures.wall.data;
    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const planeX = -dirY * FOV_SCALE;
    const planeY = dirX * FOV_SCALE;
    const half = h / 2;

    for (let x = 0; x < w; x++) {
      const cameraX = (2 * x) / w - 1;
      const rayX = dirX + planeX * cameraX;
      const rayY = dirY + planeY * cameraX;
      const cellSize = map.cellSize;
      let mapX = Math.floor(player.x / cellSize);
      let mapY = Math.floor(player.y / cellSize);
      const deltaX = cellSize / Math.abs(rayX);
      const deltaY = cellSize / Math.abs(rayY);
      const stepX = rayX < 0 ? -1 : 1;
      const stepY = rayY < 0 ? -1 : 1;
      const edgeX = stepX < 0 ? W : E;
      const edgeY = stepY < 0 ? N : S;
      let sideX = (rayX < 0 ? player.x - mapX * cellSize : (mapX + 1) * cellSize - player.x) / Math.abs(rayX);
      let sideY = (rayY < 0 ? player.y - mapY * cellSize : (mapY + 1) * cellSize - player.y) / Math.abs(rayY);
      let side;
      let dist;

      // Walk cell boundaries; a hit is a wall on the edge being crossed.
      for (;;) {
        if (sideX < sideY) {
          if (map.hasWall(mapX, mapY, edgeX)) { side = 0; dist = sideX; break; }
          sideX += deltaX;
          mapX += stepX;
        } else {
          if (map.hasWall(mapX, mapY, edgeY)) { side = 1; dist = sideY; break; }
          sideY += deltaY;
          mapY += stepY;
        }
      }
      depth[x] = dist;

      const lineHeight = h / dist;
      const start = Math.max(0, Math.floor(half - lineHeight / 2));
      const end = Math.min(h - 1, Math.floor(half + lineHeight / 2));

      let wallX = side === 0 ? player.y + dist * rayY : player.x + dist * rayX;
      wallX -= Math.floor(wallX);
      let texX = Math.floor(wallX * TEX_SIZE);
      if ((side === 0 && rayX > 0) || (side === 1 && rayY < 0)) texX = MASK - texX;

      const texStep = TEX_SIZE / lineHeight;
      let texPos = (start - half + lineHeight / 2) * texStep;
      const s = light(dist) * (side === 1 ? SIDE_DIM : 1);

      let idx = (start * w + x) * 4;
      for (let y = start; y <= end; y++) {
        const t = (((texPos & MASK) * TEX_SIZE) + texX) * 3;
        texPos += texStep;
        px[idx] = wall[t] * s;
        px[idx + 1] = wall[t + 1] * s;
        px[idx + 2] = wall[t + 2] * s;
        idx += w * 4;
      }
    }
  }
}
