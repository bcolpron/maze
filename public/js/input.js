const HANDLED = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);

export class Input {
  constructor(target = window) {
    this.down = new Set();
    target.addEventListener('keydown', (e) => {
      if (!HANDLED.has(e.code)) return;
      e.preventDefault();
      this.down.add(e.code);
    });
    target.addEventListener('keyup', (e) => {
      if (!HANDLED.has(e.code)) return;
      e.preventDefault();
      this.down.delete(e.code);
    });
    target.addEventListener('blur', () => this.down.clear());
  }

  get up() { return this.down.has('ArrowUp'); }
  get backward() { return this.down.has('ArrowDown'); }
  get left() { return this.down.has('ArrowLeft'); }
  get right() { return this.down.has('ArrowRight'); }
  get shift() { return this.down.has('ShiftLeft') || this.down.has('ShiftRight'); }
}
