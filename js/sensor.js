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
    if (this.kind == KIND_FOOD){
      world.food.forEach(function(f, i){
        this._computeValueForPos(f.pos);
      }, this)
    }
    //TODO: Check walls and self body.
  }

  _computeValueForPos(pos) {
    if (this._isOnSight(pos)) {
      let excitement = Math.exp(-this.distance(pos) / 200)
      // this.excitement = Math.max(this.excitement, excitement)
      this.excitement += excitement
    }
  }

  _isOnSight(pos) {
    let dx = pos.x - this.mountPoint.x;
    let dy = pos.y - this.mountPoint.y;
    let alpha = (360 + Math.atan2(dy, dx) * 180 / Math.PI) % 360;
    if((360 + (this.direction - this.vision / 2)) % 360 <= alpha && alpha <= (360 + (this.direction + this.vision / 2)) % 360) {
      return true;
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
