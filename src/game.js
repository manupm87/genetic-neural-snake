import * as c from './constants.js'
import {Snake} from './snake.js'
import {Food} from './food'
import {NeuralNet} from './neural/neuralNet'

export var loopInterval = 0

export class Game {
  constructor(){
    this.snakes = [];
    this.food = [];
    this.controls = {left: false, right: false}
    this.round = 0
    this.scores = {
      historicalBest: 0,
      currentBest: 0
    }
  }

  initialize() {
    this.snakes = []
    for (let i = 0; i < c.POPULATION_SIZE; i++) {
      const SPAWN_R = 100
      let center = {x: c.WORLD_WIDTH / 2, y: c.WORLD_HEIGHT / 2}
      let alpha = i * 360 / c.POPULATION_SIZE
      center.x += SPAWN_R * Math.cos(alpha * Math.PI / 180)
      center.y += SPAWN_R * Math.sin(alpha * Math.PI / 180)
        let s = new Snake(center, alpha, i)
      s.mountSensors()
      s.initBrain()
      this.snakes.push(s)
    }
  }

  startRound() {
    this.snakes = this.snakes.sort((a, b) => (b.score  - a.score))
    this.round++
    this.scores.currentBest = 0
    this.snakes = this.snakes.slice(0, c.POPULATION_SIZE * c.GEN_SURVIVORS)
    for (let snake of this.snakes) {
      snake.setType(c.SNAKE_TYPE_CHAMPION)
    }

    let idx = this.snakes.length
    for (let i = 0; i < c.POPULATION_SIZE * c.GEN_CHILDREN; i++) {
      let s = new Snake({x: 100, y: 50}, 0, 1000*this.round + idx)
      //s.mountSensors()
      let parent1 = Math.floor(c.POPULATION_SIZE * c.GEN_SURVIVORS * Math.random())
      let parent2 = Math.floor(c.POPULATION_SIZE * c.GEN_SURVIVORS * Math.random())
      let new_brain = NeuralNet.reproduce(this.snakes[parent1].brain, this.snakes[parent2].brain, c.REPROD_RATE, c.PROB_MUTATION)
      s.brain = new_brain
      s.setType(c.SNAKE_TYPE_CHILD).setGeneration(this.round)
      this.snakes.push(s)
      idx++;
    }

    while(this.snakes.length < c.POPULATION_SIZE){
      let s = new Snake({x: 100, y: 50}, 0, 1000*this.round + idx)
      s.mountSensors()
      s.initBrain()
      s.setGeneration(this.round)
      this.snakes.push(s)
      idx++
    }

    // Reposition them
    for (let i = 0; i< this.snakes.length; i++){
      const SPAWN_R = 100
      let center = {x: c.WORLD_WIDTH / 2, y: c.WORLD_HEIGHT / 2}
      let alpha = i * 360 / c.POPULATION_SIZE
      center.x += SPAWN_R * Math.cos(alpha * Math.PI / 180)
      center.y += SPAWN_R * Math.sin(alpha * Math.PI / 180)
      this.snakes[i].rebirth(center, alpha)
      this.snakes[i].mountSensors()
    }
  }

// TODO: REFACTOR RESTART
  restart() {
    this.startRound()
    // this.gameLoop()
  }

  getScores() {
    return this.scores;
  }

  spawnFood(){
    let rand_x = 2 * c.WALL_THICKNESS + parseInt((c.WORLD_WIDTH - 4 * c.WALL_THICKNESS) * Math.random())
    let rand_y = 2 * c.WALL_THICKNESS + parseInt((c.WORLD_HEIGHT - 4 * c.WALL_THICKNESS) * Math.random())
    this.food.push(new Food({x: rand_x, y: rand_y}, 10))
  }

  start() {
    var othis = this;
    loopInterval = setInterval(function() {
      othis.gameLoop(othis)
    }, c.GAME_LOOP_T)
    // this.gameLoop(this)
  }

  gameLoop(othis) {
    let snakes_alive = false
    othis.snakes.forEach(function(s, i) {
      snakes_alive = s.isAlive || snakes_alive
      if(s.isAlive){

        othis.food.forEach(function(f, j) {
          if (othis._distance(s.head.pos, f.pos) < c.MOUTH_SIZE) {
            othis.food.splice(j, 1);
            s.grow();
            if(s.score > othis.scores.currentBest){
              othis.scores.currentBest = s.score
              if(s.score > othis.scores.historicalBest){
                othis.scores.historicalBest = s.score
              }
            }

          }
        }, othis)
        if(s.id=="Player"){
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
    }, othis)
    // Food loop:
    othis.food.forEach(function(f, i) {
      f.decreaseLifeTime(c.dt / 1000)
      if (f.life < 0){
        othis.food.splice(i, 1)
      }
    }, othis)

    while(othis.food.length < c.SIMULTANEUS_FOOD){
      othis.spawnFood()
    }

    if(!snakes_alive){
      othis.restart()
    }

    // window.setTimeout(this.gameLoop(this), 2000)

  }

  checkWalls(s) {
    if (s.head.pos.x < c.WALL_THICKNESS / 2 || s.head.pos.x > c.WORLD_WIDTH - c.WALL_THICKNESS / 2){
      s.die()
    }
    else if (s.head.pos.y < c.WALL_THICKNESS / 2 || s.head.pos.y > c.WORLD_HEIGHT - c.WALL_THICKNESS / 2) {
      s.die()
    }
  }

  checkSelf(s) {
    s.body.forEach(function(b, i){
      if (i > 1 && this._distance(s.head.pos, b.pos) < c.BONE_SIZE){
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
