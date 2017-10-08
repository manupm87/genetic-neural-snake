NUM_SENSORS = 12
SNAKE_VISION = 240
SNAKE_SENSOR_OVERLAP = 0.05
SNAKE_SPEED = 200 //px per second
STEERING_SPEED = 360 // degrees per second
BONE_SIZE = 20
dt = 200 // milliseconds (rendering freq.)

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
    this.sensors = {"food": [], "wall": [], "self": []}
    this.body = [this.head]
    this.tail = null
    this.direction = direction;
  }

  mountSensors() {
    for (var i = 0; i < NUM_SENSORS; i++) {
      let vision = (SNAKE_VISION / NUM_SENSORS) * (1 + SNAKE_SENSOR_OVERLAP)
      let dir = - SNAKE_VISION / 2 + i * SNAKE_VISION / NUM_SENSORS + vision / 2

      this.sensors["food"].push(new Sensor(this.head, dir, KIND_FOOD, vision))

      this.sensors["wall"].push(new Sensor(this.head, dir, KIND_WALL, vision))

      // TODO: mount other sensors
    }
  }

  scanWorld(world) {
    this.sensors["food"].forEach(function (s,i){
      s.scan(world)
    })
    this.sensors["wall"].forEach(function (s,i){
      s.scan(world)
    })
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
    console.log("ATE!")
  }
}

module.exports = {
    Snake: Snake,
    BodyPart: BodyPart
};
