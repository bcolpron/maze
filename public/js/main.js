import { Player } from './player.js';
import { Input } from './input.js';
import { Raycaster } from './raycaster.js';
import { connectDungeon } from './dungeon-client.js';
import { createBrickTexture, createSandTexture, createCeilingTexture } from './textures.js';

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 300;

const { map, spawn } = await connectDungeon();
const player = new Player(spawn.x, spawn.y, spawn.angle);
const input = new Input();
const raycaster = new Raycaster(document.getElementById('view'), VIEW_WIDTH, VIEW_HEIGHT, {
  wall: createBrickTexture(),
  floor: createSandTexture(),
  ceiling: createCeilingTexture(),
});

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  player.update(dt, input, map);
  raycaster.render(player, map);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
