import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { createDungeon } from '../shared/dungeon.js';
import { N, E, S, W } from '../shared/map.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/shared', express.static(path.join(__dirname, '..', 'shared')));

const server = http.createServer(app);
const io = new Server(server);

const { map, spawn } = createDungeon();
const DIRECTIONS = [N, E, S, W];

io.on('connection', (socket) => {
  socket.emit('dungeon:state', { ...map.toState(), spawn });

  socket.on('dungeon:toggleEdge', ({ x, y, dir } = {}) => {
    if (!Number.isInteger(x) || !Number.isInteger(y) || !DIRECTIONS.includes(dir)) return;
    const closed = !map.hasWall(x, y, dir);
    if (map.setEdge(x, y, dir, closed)) io.emit('dungeon:edge', { x, y, dir, closed });
  });
});

server.listen(port, () => {
  console.log(`Maze running at http://localhost:${port}`);
});
