KIND_FOOD = 0
KIND_WALL = 1
KIND_SELF = 2

class Sensor {
  constructor (kind, vision) {
    this.kind = kind;
    this.direction = 0;
    this.excitement = 0;
    this.vision = vision;
    this.mountPoint = {x: 0, y:0};
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
    if (this.kind == KIND_FOOD){
      world.food.forEach(function(f, i){
        this._computeValueForPos(f.pos);
      }, this)
    }
    //TODO: Check walls and self body.
  }

  _computeValueForPos(pos) {
    if (this._isOnSight(pos)) {
      this.excitement += Math.exp(-0.1 * this.distance(pos))
    }
  }

  _isOnSight(pos) {
    let dx = pos.x - this.mountPoint.x;
    let dy = pos.y - this.mountPoint.y;
    let alpha = Math.atan2(dy, dx) * 180 / Math.PI;
    if((this.direction - this.vision / 2) <= alpha && alpha <= (this.direction + this.vision / 2)){
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
