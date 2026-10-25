export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

const DIRECTIONS = [N, E, S, W];
const OPPOSITE = { [N]: S, [E]: W, [S]: N, [W]: E };
const STEP = { [N]: [0, -1], [E]: [1, 0], [S]: [0, 1], [W]: [-1, 0] };

// Each cell stores a bitmask of the walls on its four sides, so two adjacent
// cells can be separated by a wall without needing a wall cell in between.
export class GridMap {
  constructor(width, height, cellSize = 2) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cells = new Uint8Array(width * height);
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  hasWall(x, y, dir) {
    if (!this.inBounds(x, y)) return true;
    return (this.cells[y * this.width + x] & dir) !== 0;
  }

  isBoundaryEdge(x, y, dir) {
    const [dx, dy] = STEP[dir];
    return !this.inBounds(x + dx, y + dy);
  }

  // Walls are shared: the facing side of the neighbouring cell is kept in sync.
  // The dungeon limits can never be opened; returns false when nothing was applied.
  setEdge(x, y, dir, closed) {
    if (!this.inBounds(x, y)) return false;
    if (!closed && this.isBoundaryEdge(x, y, dir)) return false;
    const [dx, dy] = STEP[dir];
    this.#apply(x, y, dir, closed);
    this.#apply(x + dx, y + dy, OPPOSITE[dir], closed);
    return true;
  }

  setWall(x, y, dir) {
    this.setEdge(x, y, dir, true);
  }

  #apply(x, y, dir, closed) {
    if (!this.inBounds(x, y)) return;
    const i = y * this.width + x;
    if (closed) this.cells[i] |= dir;
    else this.cells[i] &= ~dir;
  }

  toState() {
    return { width: this.width, height: this.height, cellSize: this.cellSize, cells: Array.from(this.cells) };
  }

  static fromState(state) {
    const map = new GridMap(state.width, state.height, state.cellSize);
    map.cells.set(state.cells);
    return map;
  }

  closeCell(x, y) {
    for (const dir of DIRECTIONS) this.setWall(x, y, dir);
  }

  // True if a circle of the given radius centred on world position (x, y)
  // touches a wall or leaves the map.
  collides(x, y, radius) {
    const size = this.cellSize;
    const cx = Math.floor(x / size);
    const cy = Math.floor(y / size);
    if (!this.inBounds(cx, cy)) return true;
    const r2 = radius * radius;

    for (let iy = cy - 1; iy <= cy + 1; iy++) {
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        if (!this.inBounds(ix, iy)) continue;
        const left = ix * size;
        const top = iy * size;
        const right = left + size;
        const bottom = top + size;
        if (this.hasWall(ix, iy, N) && segmentDist2(x, y, left, top, right, top) < r2) return true;
        if (this.hasWall(ix, iy, S) && segmentDist2(x, y, left, bottom, right, bottom) < r2) return true;
        if (this.hasWall(ix, iy, W) && segmentDist2(x, y, left, top, left, bottom) < r2) return true;
        if (this.hasWall(ix, iy, E) && segmentDist2(x, y, right, top, right, bottom) < r2) return true;
      }
    }
    return false;
  }

  static squareRoom(size, cellSize) {
    const map = new GridMap(size, size, cellSize);
    for (let i = 0; i < size; i++) {
      map.setWall(i, 0, N);
      map.setWall(i, size - 1, S);
      map.setWall(0, i, W);
      map.setWall(size - 1, i, E);
    }
    return map;
  }
}

// Squared distance from point (px, py) to an axis-aligned segment.
function segmentDist2(px, py, x1, y1, x2, y2) {
  const cx = Math.min(Math.max(px, x1), x2);
  const cy = Math.min(Math.max(py, y1), y2);
  return (px - cx) ** 2 + (py - cy) ** 2;
}
