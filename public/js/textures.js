export const TEX_SIZE = 64;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x, y, seed) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Tileable bilinear value noise on a cells x cells lattice.
function tileableNoise(rand, cells) {
  const lattice = Array.from({ length: cells * cells }, rand);
  return (u, v) => {
    const x = u * cells;
    const y = v * cells;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const at = (ix, iy) => lattice[(iy % cells) * cells + (ix % cells)];
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };
}

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

function build(fill) {
  const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 3);
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const [r, g, b] = fill(x, y);
      const i = (y * TEX_SIZE + x) * 3;
      data[i] = clamp255(r);
      data[i + 1] = clamp255(g);
      data[i + 2] = clamp255(b);
    }
  }
  return { size: TEX_SIZE, data };
}

export function createBrickTexture() {
  const rand = mulberry32(1337);
  const grain = tileableNoise(rand, 8);
  const BRICK_H = 16;
  const BRICK_W = 32;
  const MORTAR = 2;
  return build((x, y) => {
    const row = Math.floor(y / BRICK_H);
    const sx = (x + (row % 2 ? BRICK_W / 2 : 0)) % TEX_SIZE;
    const col = Math.floor(sx / BRICK_W);
    const bx = sx % BRICK_W;
    const by = y % BRICK_H;
    const noise = (hash2(x, y, 7) - 0.5) * 22;
    const blotch = (grain(x / TEX_SIZE, y / TEX_SIZE) - 0.5) * 30;

    if (bx < MORTAR || by < MORTAR) {
      const m = 105 + noise + blotch * 0.5;
      return [m, m - 4, m - 10];
    }

    const tint = hash2(row, col, 3) - 0.5;
    let r = 150 + tint * 55 + noise + blotch;
    let g = 62 + tint * 24 + noise * 0.6 + blotch * 0.5;
    let b = 42 + tint * 14 + noise * 0.5 + blotch * 0.4;
    if (by === MORTAR || bx === MORTAR) { r += 22; g += 10; b += 6; }
    if (by === BRICK_H - 1 || bx === BRICK_W - 1) { r -= 28; g -= 14; b -= 10; }
    return [r, g, b];
  });
}

export function createSandTexture() {
  const rand = mulberry32(4242);
  const low = tileableNoise(rand, 4);
  const mid = tileableNoise(rand, 8);
  const pebbles = [];
  for (let i = 0; i < 18; i++) {
    pebbles.push({ x: Math.floor(rand() * TEX_SIZE), y: Math.floor(rand() * TEX_SIZE), r: rand() < 0.3 ? 2 : 1, shade: rand() });
  }
  const pebbleAt = (x, y) => {
    for (const p of pebbles) {
      const dx = Math.min(Math.abs(x - p.x), TEX_SIZE - Math.abs(x - p.x));
      const dy = Math.min(Math.abs(y - p.y), TEX_SIZE - Math.abs(y - p.y));
      if (dx * dx + dy * dy <= p.r * p.r) return p;
    }
    return null;
  };
  return build((x, y) => {
    const u = x / TEX_SIZE;
    const v = y / TEX_SIZE;
    const n = (low(u, v) - 0.5) * 36 + (mid(u, v) - 0.5) * 22 + (hash2(x, y, 11) - 0.5) * 26;
    const p = pebbleAt(x, y);
    if (p) {
      const s = 95 + p.shade * 45 + n * 0.4;
      return [s, s - 6, s - 16];
    }
    return [196 + n, 168 + n * 0.92, 118 + n * 0.75];
  });
}

export function createCeilingTexture() {
  const rand = mulberry32(99);
  const low = tileableNoise(rand, 4);
  return build((x, y) => {
    const n = (low(x / TEX_SIZE, y / TEX_SIZE) - 0.5) * 14 + (hash2(x, y, 5) - 0.5) * 8;
    const seam = x % 32 === 0 || y % 32 === 0 ? -8 : 0;
    return [34 + n + seam, 31 + n + seam, 38 + n + seam];
  });
}
