KIND_FOOD = 0
KIND_WALL = 1
KIND_SELF = 2

class Sensor {
  constructor (part, direction, kind, vision) {
    this.kind = kind;
    this.ini_direction = direction;
    this.direction = part.direction + direction
    this.excitement = 0;
    this.vision = vision;
    this.mountPoint = part.pos;
    this.mount = part;
  }

  setDirection(d) {
    this.direction = d
    return this;
  }

  getDirection() {
    return this.direction;
  }

  getValue() {
    return this.excitement;
  }

  setMountPoint(point) {
    this.mountPoint = {x: point.x, y: point.y}
    return this
  }

  scan(world) {
    this.excitement = 0

    // FOOD
    if (this.kind == KIND_FOOD){
      world.food.forEach(function(f, i){
        this._computeValueForPos(f.pos);
      }, this)
    }

    // WALLS
    if (this.kind == KIND_WALL) {
      let d = 2 * (WORLD_WIDTH + WORLD_HEIGHT)
      if (0 < this.direction && this.direction < 180){
        d = Math.min(d, this.getDistanceToWall("bottom"))
      }
      if (90 < this.direction && this.direction < 270){
        d = Math.min(d, this.getDistanceToWall("left"))
      }
      if (180< this.direction && this.direction < 360){
        d = Math.min(d, this.getDistanceToWall("top"))
      }
      if (this.direction > 270 || this.direction < 90){
        d = Math.min(d, this.getDistanceToWall("right"))
      }
      this.excitement = Math.exp(-d / 200)
    }

    // SELF BODY
    if (this.kind == KIND_SELF) {
      world.snake.body.forEach(function(bp, i){
        this._computeValueForPos(bp.pos);
      }, this)
    }

  }

  getDistanceToWall(wall) {
    switch (wall) {
      case "bottom":
        return (WORLD_HEIGHT - this.mountPoint.y) / Math.sin(this.direction * Math.PI / 180)
        break;
      case "top":
        return (0 - this.mountPoint.y) / Math.sin(this.direction * Math.PI / 180)
        break;
      case "left":
        return (0 - this.mountPoint.x) / Math.cos(this.direction * Math.PI / 180)
        break;
      case "right":
        return (WORLD_WIDTH - this.mountPoint.x) / Math.cos(this.direction * Math.PI / 180)
        break;
      default:
        return null

    }
  }

  _computeValueForPos(pos) {
    if (this._isOnSight(pos)) {
      let excitement = Math.exp(-this.distance(pos) / 200)
      // this.excitement += excitement
      this.excitement = Math.max(excitement, this.excitement)
    }
  }

  _isOnSight(pos) {
    let dx = pos.x - this.mountPoint.x;
    let dy = pos.y - this.mountPoint.y;
    if( dx == 0 && dy == 0){
      return false;
    }
    let alpha = (360 + Math.atan2(dy, dx) * 180 / Math.PI) % 360;
    let a_small = (360 + (this.direction - this.vision / 2)) % 360;
    let a_big = (360 + (this.direction + this.vision / 2)) % 360;
    if(a_small <= alpha && alpha <= a_big) {
      return true;
    }
    else if (a_big < a_small) {
      return alpha >= a_small || alpha <= a_big;
    }
    return false;
  }

  distance(pos) {
    let dx = pos.x - this.mountPoint.x;
    let dy = pos.y - this.mountPoint.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  }

}

module.exports = {
    Sensor: Sensor
};
