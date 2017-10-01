NUM_SENSORS = 12
SNAKE_VISION = 240
SNAKE_SPEED = 100 //px per second
STEERING_SPEED = 180 // degrees per second
dt = 200 // milliseconds (rendering freq.)

WORLD_WIDTH=900
WORLD_HEIGHT=800


function BodyPart(pos) {
  this.pos = {x: pos.x, y: pos.y}
}


function Snake(pos, direction) {
  this.head = new BodyPart({x: pos.x, y: pos.y});
  this.body = []
  this.tail = null
  this.sensors = []
  this.direction = direction;

}

Snake.prototype = {
  turn: function(right, left) {
    if (right && !left) {
      this.direction = (this.direction + (STEERING_SPEED * (dt / 1000))) % 360;
    }
    else if (left && !right) {
      this.direction = (this.direction - (STEERING_SPEED * (dt / 1000))) % 360;
    }
  },
  moveForward: function() {
    this.head.pos.x = (WORLD_WIDTH + this.head.pos.x + SNAKE_SPEED * Math.cos(this.direction * Math.PI / 180) * (dt / 1000)) % WORLD_WIDTH;
    this.head.pos.y = (WORLD_HEIGHT + this.head.pos.y + SNAKE_SPEED * Math.sin(this.direction * Math.PI / 180) * (dt / 1000)) % WORLD_HEIGHT;
  }
}
