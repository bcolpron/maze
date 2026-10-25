import { io } from '/socket.io/socket.io.esm.min.js';
import { GridMap } from '/shared/map.js';

// Resolves once the server has sent the dungeon. The returned map is kept in
// sync with the server's; onChange fires after every update.
export function connectDungeon({ onChange } = {}) {
  const socket = io();
  return new Promise((resolve) => {
    let map = null;

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
        toggleEdge: (x, y, dir) => socket.emit('dungeon:toggleEdge', { x, y, dir }),
      });
    });

    socket.on('dungeon:edge', ({ x, y, dir, closed }) => {
      if (!map) return;
      map.setEdge(x, y, dir, closed);
      onChange?.();
    });
  });
}
