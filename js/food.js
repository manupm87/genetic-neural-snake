function Food(pos, life) {
  this.pos = {x: pos.x, y: pos.y}
  this.life = time;
}

Food.prototype = {
  decreaseLifeTime: function() {
    this.life--;
  }
}
