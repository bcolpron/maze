import { io } from '/socket.io/socket.io.esm.min.js';
import { GridMap } from '/shared/map.js';

// Resolves once the server has sent the dungeon. The returned map and players
// are kept in sync with the server's; onChange fires after every update.
export function connectDungeon({ onChange } = {}) {
  const socket = io();
  const players = new Map();
  let lastPosition = null;

  return new Promise((resolve) => {
    let map = null;

    socket.on('connect', () => {
      if (lastPosition) socket.emit('player:update', lastPosition);
    });

    socket.on('dungeon:state', (state) => {
      if (map) {
        map.cells.set(state.cells);
        onChange?.();
        return;
      }
      map = GridMap.fromState(state);
      resolve({
        map,
        spawn: state.spawn,
        players,
        toggleEdge: (x, y, dir) => socket.emit('dungeon:toggleEdge', { x, y, dir }),
        sendPosition: (x, y, angle) => {
          lastPosition = { x, y, angle };
          socket.emit('player:update', lastPosition);
        },
      });
    });

    socket.on('dungeon:edge', ({ x, y, dir, closed }) => {
      if (!map) return;
      map.setEdge(x, y, dir, closed);
      onChange?.();
    });

    socket.on('players:state', (list) => {
      players.clear();
      for (const { id, ...position } of list) players.set(id, position);
      onChange?.();
    });

    socket.on('player:update', ({ id, ...position }) => {
      players.set(id, position);
      onChange?.();
    });

    socket.on('player:left', (id) => {
      players.delete(id);
      onChange?.();
    });
  });
}
