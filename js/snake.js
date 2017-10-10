var s = require('./sensor')

var net = require('./neural/neuralNet')

NUM_SENSORS = 12
SNAKE_VISION = 240
SNAKE_SENSOR_OVERLAP = 0.05
SNAKE_SPEED = 200 //px per second
STEERING_SPEED = 360 // degrees per second
BONE_SIZE = 20
SNAKE_LIFE = 10

WORLD_WIDTH=600
WORLD_HEIGHT=400


class BodyPart{
  constructor(pos, dir) {
    this.pos = {x: pos.x, y: pos.y}
    this.direction = dir
  }

  moveForward() {
    this.pos.x = (WORLD_WIDTH + this.pos.x + SNAKE_SPEED * Math.cos(this.direction * Math.PI / 180) * (dt / 1000)) % WORLD_WIDTH;
    this.pos.y = (WORLD_HEIGHT + this.pos.y + SNAKE_SPEED * Math.sin(this.direction * Math.PI / 180) * (dt / 1000)) % WORLD_HEIGHT;

  }
}


class Snake {
  constructor(pos, direction) {
    this.head = new BodyPart({x: pos.x, y: pos.y}, direction);
    this.brain = new net.NeuralNet();
    this.sensors = {"food": [], "wall": [], "self": []}
    this.body = [this.head]
    this.tail = null
    this.direction = direction;
    this.isAlive = true
    this.score = 0
    this.life = SNAKE_LIFE
  }

  mountSensors() {
    for (var i = 0; i < NUM_SENSORS; i++) {
      let vision = (SNAKE_VISION / NUM_SENSORS) * (1 + SNAKE_SENSOR_OVERLAP)
      let dir = - SNAKE_VISION / 2 + i * SNAKE_VISION / NUM_SENSORS + vision / 2

      this.sensors["food"].push(new s.Sensor(this.head, dir, KIND_FOOD, vision))
      this.sensors["wall"].push(new s.Sensor(this.head, dir, KIND_WALL, vision))
      this.sensors["self"].push(new s.Sensor(this.head, dir, KIND_SELF, vision))

      // TODO: mount other sensors
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

  spendLife(){
    this.life -= (dt / 1000)
    if(this.life <= 0){
      this.isAlive = false
    }
  }

  scanWorld(world) {
    this.sensors["food"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(i, s.excitement)
    }, this)
    this.sensors["wall"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(NUM_SENSORS + i, s.excitement)
    }, this)
    this.sensors["self"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(2 * NUM_SENSORS + i, s.excitement)
    }, this)
    this.brain.activate()
  }

  turn(right, left) {
    if (right && !left) {
      this.direction = this.head.direction = (360 + (this.direction + (STEERING_SPEED * (dt / 1000)))) % 360;
    }
    else if (left && !right) {
      this.direction = this.head.direction = (360 + (this.direction - (STEERING_SPEED * (dt / 1000)))) % 360;
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
        if(this.body[i-1].pos.x - b.pos.x > 2 * BONE_SIZE) // HEAD LEFT TO THE RIGHT SIDE
          pre_pos_x = this.body[i-1].pos.x - WORLD_WIDTH
        else if(this.body[i-1].pos.x - b.pos.x < -2 * BONE_SIZE) // head left to the left SIDE
          pre_pos_x = this.body[i-1].pos.x + WORLD_WIDTH
        else {
          pre_pos_x = this.body[i-1].pos.x
        }
        if(this.body[i-1].pos.y - b.pos.y > 2 * BONE_SIZE) // HEAD LEFT TO THE down SIDE
          pre_pos_y = this.body[i-1].pos.y - WORLD_HEIGHT
        else if(this.body[i-1].pos.y - b.pos.y < -2 * BONE_SIZE) // head left to the up SIDE
          pre_pos_y = this.body[i-1].pos.y + WORLD_HEIGHT
        else {
          pre_pos_y = this.body[i-1].pos.y
        }
        let dx = pre_pos_x - b.pos.x;
        let dy = pre_pos_y - b.pos.y;
        b.direction = Math.atan2(dy, dx) * 180 / Math.PI;
        b.pos.x = (WORLD_WIDTH + this.body[i-1].pos.x - BONE_SIZE * Math.cos(b.direction * Math.PI / 180)) % WORLD_WIDTH
        b.pos.y = (WORLD_HEIGHT + this.body[i-1].pos.y - BONE_SIZE * Math.sin(b.direction * Math.PI / 180)) % WORLD_HEIGHT
      }
      else{
        b.moveForward()
      }

    }, this)
  }
  grow(){
    let last_body_part = this.body.slice(-1).pop()
    let pos_x = last_body_part.pos.x - BONE_SIZE * Math.cos(last_body_part.direction * Math.PI / 180)
    let pos_y = last_body_part.pos.y - BONE_SIZE * Math.sin(last_body_part.direction * Math.PI / 180)
    this.body.push(new BodyPart({x: pos_x, y: pos_y}, last_body_part.direction))
    this.life = SNAKE_LIFE
    this.score++
  }
}

module.exports = {
    Snake: Snake,
    BodyPart: BodyPart
};
