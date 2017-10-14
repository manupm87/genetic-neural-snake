import * as c from './constants.js'
import {Sensor} from './sensor'

import {NeuralNet} from './neural/neuralNet'

export class BodyPart{
  constructor(pos, dir) {
    this.pos = {x: pos.x, y: pos.y}
    this.direction = dir
  }

  moveForward() {
    this.pos.x = (c.WORLD_WIDTH + this.pos.x + c.SNAKE_SPEED * Math.cos(this.direction * Math.PI / 180) * (c.dt / 1000)) % c.WORLD_WIDTH;
    this.pos.y = (c.WORLD_HEIGHT + this.pos.y + c.SNAKE_SPEED * Math.sin(this.direction * Math.PI / 180) * (c.dt / 1000)) % c.WORLD_HEIGHT;

  }
}


export class Snake {
  constructor(pos, direction, id) {
    this.id = id
    this.head = new BodyPart({x: pos.x, y: pos.y}, direction);
    this.brain = new NeuralNet();
    this.sensors = {"food": [], "wall": [], "self": []}
    this.body = [this.head]
    this.tail = null
    this.direction = direction;
    this.isAlive = true
    this.score = 0
    this.life = c.SNAKE_LIFE
    this.type = c.SNAKE_TYPE_RANDOM
    this.generation = 0
  }

  setType(type){
    this.type = type
    return this
  }

  setGeneration(generation){
    this.generation = generation
    return this
  }

  mountSensors() {
    for (var i = 0; i < c.NUM_SENSORS; i++) {
      let vision = (c.SNAKE_VISION / c.NUM_SENSORS) * (1 + c.SNAKE_SENSOR_OVERLAP)
      let dir = - c.SNAKE_VISION / 2 + i * c.SNAKE_VISION / c.NUM_SENSORS + vision / 2

      this.sensors["food"].push(new Sensor(this.head, dir, c.KIND_FOOD, vision))
      this.sensors["wall"].push(new Sensor(this.head, dir, c.KIND_WALL, vision))
      this.sensors["self"].push(new Sensor(this.head, dir, c.KIND_SELF, vision))

    }
  }

  initBrain(){
    this.sensors["food"].forEach(function(s, i){
      this.brain.addInput(s.excitement)
    }, this)
    this.sensors["wall"].forEach(function(s, i){
      this.brain.addInput(s.excitement)
    }, this)
    this.sensors["self"].forEach(function(s, i){
      this.brain.addInput(s.excitement)
    }, this)

    this.brain.addHiddenLayer(10)
    this.brain.addHiddenLayer(5)
    this.brain.addOutputLayer(2)
    this.brain.randomize(10)
  }

  rebirth(pos, direction) {
    this.head = new BodyPart({x: pos.x, y: pos.y}, direction);
    this.sensors = {"food": [], "wall": [], "self": []}
    this.body = [this.head]
    this.direction = direction;
    this.isAlive = true
    this.score = 0
    this.life = c.SNAKE_LIFE
  }

  spendLife(){
    this.life -= (c.dt / 1000)
    if(this.life <= 0){
      this.die()
    }
  }

  die(){
    this.isAlive = false
    this.life = 0
  }

  scanWorld(world) {
    this.sensors["food"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(i, s.excitement)
    }, this)
    this.sensors["wall"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(c.NUM_SENSORS + i, s.excitement)
    }, this)
    this.sensors["self"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(2 * c.NUM_SENSORS + i, s.excitement)
    }, this)
    this.brain.activate()
  }

  turn(right, left) {
    if (right && !left) {
      this.direction = this.head.direction = (360 + (this.direction + (c.STEERING_SPEED * (c.dt / 1000)))) % 360;
    }
    else if (left && !right) {
      this.direction = this.head.direction = (360 + (this.direction - (c.STEERING_SPEED * (c.dt / 1000)))) % 360;
    }
    this.sensors["food"].forEach(function(s, i) {
      s.direction = (360 + (s.ini_direction + this.direction)) % 360
    }, this)
    this.sensors["wall"].forEach(function(s, i) {
      s.direction = (360 + (s.ini_direction + this.direction)) % 360
    }, this)
    this.sensors["self"].forEach(function(s, i) {
      s.direction = (360 + (s.ini_direction + this.direction)) % 360
    }, this)
  }
  moveForward() {
    this.body.forEach(function(b, i) {
      if(i!=0){
        let pre_pos_x = 0
        let pre_pos_y = 0
        if(this.body[i-1].pos.x - b.pos.x > 2 * c.BONE_SIZE) // HEAD LEFT TO THE RIGHT SIDE
          pre_pos_x = this.body[i-1].pos.x - c.WORLD_WIDTH
        else if(this.body[i-1].pos.x - b.pos.x < -2 * c.BONE_SIZE) // head left to the left SIDE
          pre_pos_x = this.body[i-1].pos.x + c.WORLD_WIDTH
        else {
          pre_pos_x = this.body[i-1].pos.x
        }
        if(this.body[i-1].pos.y - b.pos.y > 2 * c.BONE_SIZE) // HEAD LEFT TO THE down SIDE
          pre_pos_y = this.body[i-1].pos.y - c.WORLD_HEIGHT
        else if(this.body[i-1].pos.y - b.pos.y < -2 * c.BONE_SIZE) // head left to the up SIDE
          pre_pos_y = this.body[i-1].pos.y + c.WORLD_HEIGHT
        else {
          pre_pos_y = this.body[i-1].pos.y
        }
        let dx = pre_pos_x - b.pos.x;
        let dy = pre_pos_y - b.pos.y;
        b.direction = Math.atan2(dy, dx) * 180 / Math.PI;
        b.pos.x = (c.WORLD_WIDTH + this.body[i-1].pos.x - c.BONE_SIZE * Math.cos(b.direction * Math.PI / 180)) % c.WORLD_WIDTH
        b.pos.y = (c.WORLD_HEIGHT + this.body[i-1].pos.y - c.BONE_SIZE * Math.sin(b.direction * Math.PI / 180)) % c.WORLD_HEIGHT
      }
      else{
        b.moveForward()
      }

    }, this)
  }
  grow(){
    let last_body_part = this.body.slice(-1).pop()
    let pos_x = last_body_part.pos.x - c.BONE_SIZE * Math.cos(last_body_part.direction * Math.PI / 180)
    let pos_y = last_body_part.pos.y - c.BONE_SIZE * Math.sin(last_body_part.direction * Math.PI / 180)
    this.body.push(new BodyPart({x: pos_x, y: pos_y}, last_body_part.direction))
    this.life = c.SNAKE_LIFE
    this.score++
  }
}
