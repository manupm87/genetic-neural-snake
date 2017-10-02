class Food {
  constructor(pos, life){
    this.pos = {x: pos.x, y: pos.y}
    this.life = life;
  }

  decreaseLifeTime() {
    this.life--;
  }
}

module.exports = {
    Food: Food
};
