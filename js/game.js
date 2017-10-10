var s = require('./snake')
var f = require('./food')

dt = 20 // milliseconds (rendering freq.)
SIMULTANEUS_FOOD = 5
MOUTH_SIZE = 20
WALL_THICKNESS = 20

class Game {
  constructor(){
    this.snakes = [];
    this.food = [];
    this.controls = {left: false, right: false}
  }

  initialize() {
    this.snakes.push(new s.Snake({x: 100, y: 50}, 0))
    this.snakes[0].mountSensors()
  }

  restart() {
    this.snakes[0] = new s.Snake({x: 100, y: 50}, 0)
    this.snakes[0].mountSensors()
  }

  spawnFood(){
    let rand_x = 2 * WALL_THICKNESS + parseInt((WORLD_WIDTH - 4 * WALL_THICKNESS) * Math.random())
    let rand_y = 2 * WALL_THICKNESS + parseInt((WORLD_HEIGHT - 4 * WALL_THICKNESS) * Math.random())
    this.food.push(new f.Food({x: rand_x, y: rand_y}, 10))
  }

  start() {
    var othis = this;
    setInterval(function() {
      othis.gameLoop(othis)
    }, dt)
  }

  gameLoop(othis) {
    othis.snakes.forEach(function(s, i) {

      othis.checkWalls(s)
      othis.checkSelf(s)

      othis.food.forEach(function(f, j) {
        if (othis._distance(s.head.pos, f.pos) < MOUTH_SIZE) {
          othis.food.splice(j, 1);
          s.grow();
        }
      })
      s.turn(othis.controls.right, othis.controls.left);
      s.scanWorld({food: othis.food, snake: s})
      s.moveForward();
    })
    // Food loop:
    othis.food.forEach(function(f, i) {
      f.decreaseLifeTime(dt / 1000)
      if (f.life < 0){
        othis.food.splice(i, 1)
      }
    })

    while(othis.food.length < SIMULTANEUS_FOOD){
      othis.spawnFood()
    }
  }

  checkWalls(s) {
    if (s.head.pos.x < WALL_THICKNESS / 2 || s.head.pos.x > WORLD_WIDTH - WALL_THICKNESS / 2)
      this.restart()
    else if (s.head.pos.y < WALL_THICKNESS / 2 || s.head.pos.y > WORLD_HEIGHT - WALL_THICKNESS / 2) {
      this.restart()
    }
  }

  checkSelf(s) {
    s.body.forEach(function(b, i){
      if (i > 2 && this._distance(s.head.pos, b.pos) < BONE_SIZE)
        this.restart()
    }, this)
  }

  pressRight(pressed) {
    this.controls.right = pressed;
  }
  pressLeft(pressed) {
    this.controls.left = pressed;
  }

  _distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }
}

module.exports = {
  Game: Game
}
