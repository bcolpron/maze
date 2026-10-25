const MOVE_SPEED = 3.0;
const STRAFE_SPEED = 2.5;
const TURN_SPEED = 2.4;
const RADIUS = 0.35;

export class Player {
  constructor(x, y, angle = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  update(dt, input, map) {
    let turn = 0;
    let strafe = 0;
    let move = 0;
    if (input.left) { if (input.shift) strafe -= 1; else turn -= 1; }
    if (input.right) { if (input.shift) strafe += 1; else turn += 1; }
    if (input.up) move += 1;
    if (input.backward) move -= 1;

    this.angle += turn * TURN_SPEED * dt;

    const dirX = Math.cos(this.angle);
    const dirY = Math.sin(this.angle);
    let dx = dirX * move * MOVE_SPEED - dirY * strafe * STRAFE_SPEED;
    let dy = dirY * move * MOVE_SPEED + dirX * strafe * STRAFE_SPEED;
    const speed = Math.hypot(dx, dy);
    const max = move !== 0 ? MOVE_SPEED : STRAFE_SPEED;
    if (speed > max) { dx *= max / speed; dy *= max / speed; }

    // A wall can be closed on top of the player; let them walk out of it.
    const embedded = map.collides(this.x, this.y, RADIUS);
    const nx = this.x + dx * dt;
    if (embedded || !map.collides(nx, this.y, RADIUS)) this.x = nx;
    const ny = this.y + dy * dt;
    if (embedded || !map.collides(this.x, ny, RADIUS)) this.y = ny;
  }
}
