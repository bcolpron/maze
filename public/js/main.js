import { Player } from './player.js';
import { Input } from './input.js';
import { Raycaster } from './raycaster.js';
import { connectDungeon } from './dungeon-client.js';
import { createBrickTexture, createSandTexture, createCeilingTexture } from './textures.js';

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 300;

const SEND_INTERVAL_MS = 50;

const { map, spawn, sendPosition } = await connectDungeon();
const player = new Player(spawn.x, spawn.y, spawn.angle);
const input = new Input();
const raycaster = new Raycaster(document.getElementById('view'), VIEW_WIDTH, VIEW_HEIGHT, {
  wall: createBrickTexture(),
  floor: createSandTexture(),
  ceiling: createCeilingTexture(),
});

let last = performance.now();
let lastSent = { time: -Infinity, x: NaN, y: NaN, angle: NaN };

function syncPosition(now) {
  const moved = player.x !== lastSent.x || player.y !== lastSent.y || player.angle !== lastSent.angle;
  if (!moved || now - lastSent.time < SEND_INTERVAL_MS) return;
  lastSent = { time: now, x: player.x, y: player.y, angle: player.angle };
  sendPosition(player.x, player.y, player.angle);
}

sendPosition(player.x, player.y, player.angle);

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  player.update(dt, input, map);
  syncPosition(now);
  raycaster.render(player, map);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
