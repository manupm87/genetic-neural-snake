import * as c from './constants.js'
import {Snake} from './snake.js'
import {Food} from './food'
import {NeuralNet} from './neural/neuralNet'


export class Game {
  constructor(){
    this.snakes = [];
    this.food = [];
    this.controls = {left: false, right: false}
    this.round = 0
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
    this.round++
    this.snakes = this.snakes.slice(0, c.POPULATION_SIZE * c.GEN_SURVIVORS)

    for (let i = 0; i < c.POPULATION_SIZE * c.GEN_CHILDREN; i++) {
      let s = new Snake({x: 100, y: 50}, 0, 10000*this.round + 100*i)
      //s.mountSensors()
      let parent1 = Math.floor(c.POPULATION_SIZE * c.GEN_SURVIVORS * Math.random())
      let parent2 = Math.floor(c.POPULATION_SIZE * c.GEN_SURVIVORS * Math.random())
      let new_brain = NeuralNet.reproduce(this.snakes[parent1].brain, this.snakes[parent2].brain, c.REPROD_RATE, c.PROB_MUTATION)
      s.brain = new_brain
      this.snakes.push(s)
    }
    let i = 0
    while(this.snakes.length < c.POPULATION_SIZE){
      let s = new Snake({x: 100, y: 50}, 0, 10000*this.round + 200*i)
      s.mountSensors()
      s.initBrain()
      this.snakes.push(s)
      i++
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
  }

  spawnFood(){
    let rand_x = 2 * c.WALL_THICKNESS + parseInt((c.WORLD_WIDTH - 4 * c.WALL_THICKNESS) * Math.random())
    let rand_y = 2 * c.WALL_THICKNESS + parseInt((c.WORLD_HEIGHT - 4 * c.WALL_THICKNESS) * Math.random())
    this.food.push(new Food({x: rand_x, y: rand_y}, 10))
  }

  start() {
    var othis = this;
    setInterval(function() {
      othis.gameLoop(othis)
    }, c.dt)
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
          }
        })
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
    })
    if(!snakes_alive){
      othis.restart()
    }
    // Food loop:
    othis.food.forEach(function(f, i) {
      f.decreaseLifeTime(c.dt / 1000)
      if (f.life < 0){
        othis.food.splice(i, 1)
      }
    })

    while(othis.food.length < c.SIMULTANEUS_FOOD){
      othis.spawnFood()
    }
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
      if (i > 2 && this._distance(s.head.pos, b.pos) < c.BONE_SIZE){
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
