var snake = require('./snake')
var f = require('./food')
var leaderboard = require("./react_components/leaderboard.js")
var React = require('react')
var ReactDOM = require('react-dom')

dt = 30 // milliseconds (rendering freq.)
SIMULTANEUS_FOOD = 5
MOUTH_SIZE = 20
WALL_THICKNESS = 20
POPULATION_SIZE = 51

class Game {
  constructor(){
    this.snakes = [];
    this.food = [];
    this.controls = {left: false, right: false}
  }

  initialize() {
    this.snakes = []
    for (var i = 0; i < POPULATION_SIZE; i++) {
      let s = new snake.Snake({x: 100, y: 50}, 0, i)
      s.mountSensors()
      s.initBrain()
      this.snakes.push(s)
    }
  }

// TODO: REFACTOR RESTART
  restart() {
    this.initialize()
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
    ReactDOM.render(<leaderboard.SnakeList snakes={othis.snakes}/>, document.getElementById('hello'));
    let snakes_alive = false
    othis.snakes.forEach(function(s, i) {
      snakes_alive = s.isAlive || snakes_alive
      if(s.isAlive){

        othis.food.forEach(function(f, j) {
          if (othis._distance(s.head.pos, f.pos) < MOUTH_SIZE) {
            othis.food.splice(j, 1);
            s.grow();
          }
        })
        if(i==0){
          s.turn(othis.controls.right, othis.controls.left);
        }
        else{
          s.turn(s.brain.output[1] > 0.4, s.brain.output[0] > 0.4)
        }
        s.scanWorld({food: othis.food, snake: s})
        s.moveForward();
        s.spendLife()

        othis.checkWalls(s)
        othis.checkSelf(s)
      }
    })
    if(!snakes_alive){
      othis.restart()
    }
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
    if (s.head.pos.x < WALL_THICKNESS / 2 || s.head.pos.x > WORLD_WIDTH - WALL_THICKNESS / 2){
      s.die()
    }
    else if (s.head.pos.y < WALL_THICKNESS / 2 || s.head.pos.y > WORLD_HEIGHT - WALL_THICKNESS / 2) {
      s.die()
    }
  }

  checkSelf(s) {
    s.body.forEach(function(b, i){
      if (i > 2 && this._distance(s.head.pos, b.pos) < BONE_SIZE){
        s.die()
      }
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
