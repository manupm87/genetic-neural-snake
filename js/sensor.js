KIND_FOOD = 0
KIND_WALL = 1
KIND_SELF = 2

function Sensor(kind, vision) {
  this.kind = kind;
  this.direction = 0;
  this.excitement = 0;
  this.vision = vision;
  this.mountPoint = {x: 0, y:0};
}

Sensor.prototype = {
  setDirection: function(d) {
    this.direction = d
  },
  getDirection: function() {
    return this.direction;
  },
  getValue: function() {
    return this.excitement;
  },
  setMountPoint: function(point) {
    this.mountPoint = {x: point.x, y: point.y}
  },
  scan: function(world) {
    if (this.kind == KIND_FOOD){
      for (var f in world.food) {
        this._computeValueForPos(f.pos);
      }
    }
    //TODO: Check walls and self body.
  },

  _computeValueForPos: function(pos) {
    if (this._isOnSight(pos)) {
      this.value += Math.exp(-0.1 * this.distance(pos))
    }
  },
  _isOnSight: function(pos) {
    dx = pos.x - this.mountPoint.x;
    dy = pos.y - this.mountPoint.y;
    alpha = Math.atan2(dy, dx) * 180 / Math.PI;
    if(this.direction - this.vision / 2 <= alpha <= this.direction + this.vision / 2){
      return true;
    }
    return false;
  },
  distance: function(pos) {
    dx = pos.x - this.mountPoint.x;
    dy = pos.y - this.mountPoint.y;
    return Math.sqrt(dx ** 2 + dy ** 2)
  }
}
