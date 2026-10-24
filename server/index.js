import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

// Multiplayer: attach a WebSocket / socket.io server to this http server.
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Maze running at http://localhost:${port}`);
});
