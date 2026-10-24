export class GridMap {
  constructor(width, height, cells) {
    this.width = width;
    this.height = height;
    this.cells = cells;
  }

  isWall(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return true;
    return this.cells[y * this.width + x] !== 0;
  }

  static squareRoom(size) {
    const cells = new Uint8Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x === 0 || y === 0 || x === size - 1 || y === size - 1) cells[y * size + x] = 1;
      }
    }
    return new GridMap(size, size, cells);
  }
}
