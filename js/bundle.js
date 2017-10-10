(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var g = require('./game')
var r = require('./renderer')

RENDER_FREQ = 20;

function init() {
  var canvas = document.getElementById("canvas");
	var renderer = new r.Renderer(canvas);
  var game = new g.Game();
  setEvents(game);
  game.initialize();
  window.setInterval(function() {
		renderer.renderGame(game);
	}, RENDER_FREQ);

  game.start()
}

function setEvents(g) {
  document.onkeydown = function(e) {
    e = e || window.event;
    if (e.keyCode == '37') {
       // left arrow
       g.pressLeft(true);
    }
    else if (e.keyCode == '39') {
       // right arrow
       g.pressRight(true);
    }
  }
  document.onkeyup = function(e) {
    e = e || window.event;
    if (e.keyCode == '37') {
       // left arrow
       g.pressLeft(false);
    }
    else if (e.keyCode == '39') {
       // right arrow
       g.pressRight(false);
    }
  }
  document.getElementById("btn-left").ontouchstart = function () {
    g.pressLeft(true);
  }
  document.getElementById("btn-left").ontouchend = function () {
    g.pressLeft(false);
  }
  document.getElementById("btn-right").ontouchstart = function() {
    g.pressRight(true);
  }
  document.getElementById("btn-right").ontouchend = function() {
    g.pressRight(false);
  }
}

window.onload = function() {
	init();
}

},{"./game":3,"./renderer":7}],2:[function(require,module,exports){
FOOD_INITIAL_LIFE = 10

class Food {
  constructor(pos, life){
    this.pos = {x: pos.x, y: pos.y}
    this.life = life;
  }

  decreaseLifeTime(time) {
    this.life -= time;
  }
}

module.exports = {
    Food: Food
};

},{}],3:[function(require,module,exports){
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
      if(i==0){
        s.turn(othis.controls.right, othis.controls.left);
      }
      else{
        s.turn()
      }
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

},{"./food":2,"./snake":9}],4:[function(require,module,exports){
var neuron = require('./neuron')

class Layer {
  constructor(kind){
    this.kind = kind
    this.neurons = []
  }

  addNeurons(n){
    for (var i = 0; i < n; i++) {
      this.neurons.push(new neuron.Neuron().setKind(this.kind))
    }
    return this;
  }

  addInput(x) {
    this.neurons.push(new neuron.Neuron().setKind(TYPE_INPUT).setOutput(x))
    return this;
  }

  setInput(i, x) {
    this.neurons[i].setOutput(x)
  }

  connect(prev_layer, connection) {
    if (connection === CONN_FULLY_CONNECTED){
      this.neurons.forEach(function(n, i){
        prev_layer.neurons.forEach(function(pn, j) {
          n.addInput(pn)
        }, this)
      }, this)
    }
    return this;
  }

  randomize(a) {
    if(this.kind != TYPE_INPUT){
      this.neurons.forEach(function(n, i){
        n.randomize(a)
      })
    }
    return this;
  }

  activate() {
    this.neurons.forEach(function(n, i){
      n.activate()
    })
  }

}

module.exports = {
  Layer: Layer
}

},{"./neuron":6}],5:[function(require,module,exports){
var l = require('./layer')

CONN_FULLY_CONNECTED = 0
AF_SIGMOID = 0
AF_RELU = 1
AF_TANH = 2

TYPE_INPUT = 0
TYPE_HIDDEN = 1
TYPE_OUTPUT = 2

class NeuralNet {
  constructor(){
    this.inputLayer = new l.Layer(TYPE_INPUT)
    this.hiddenLayers = []
    this.outputLayer = null
    this.output = null
  }

  addInput(x) {
    this.inputLayer.addInput(x)
    return this;
  }

  setInput(i, x){
    this.inputLayer.setInput(i, x)
    return this;
  }

  addHiddenLayer(n) {
    //console.log(n)
    let hl = new l.Layer(TYPE_HIDDEN)
    hl.addNeurons(n)
    //console.log(hl)
    this.hiddenLayers.push(hl)
    if (this.hiddenLayers.length == 1){
      this.hiddenLayers[0].connect(this.inputLayer, CONN_FULLY_CONNECTED)
    }
    else {
      this.hiddenLayers[this.hiddenLayers.length - 1].connect(this.hiddenLayers[this.hiddenLayers.length - 2], CONN_FULLY_CONNECTED)
    }
    //console.log(hl)
    return this;
  }

  addOutputLayer(n) {
    this.outputLayer = new l.Layer(TYPE_OUTPUT).addNeurons(n)
    if (this.hiddenLayers.length == 0){
      this.outputLayer.connect(this.inputLayer, CONN_FULLY_CONNECTED)
    }
    else {
      this.outputLayer.connect(this.hiddenLayers[this.hiddenLayers.length - 1], CONN_FULLY_CONNECTED)
    }
    this.output = []
    for (var i = 0; i < n; i++) {
      this.output.push(0)
    }
    //console.log(this.outputLayer)
    return this;
  }

  randomize(a) {
    this.hiddenLayers.forEach(function(layer, i){
      layer.randomize(a)
    })
    this.outputLayer.randomize(a)
    return this;
  }

  activate() {
    this.hiddenLayers.forEach(function(layer, i) {
      layer.activate()
    })
    this.outputLayer.activate()
    this.outputLayer.neurons.forEach(function(neuron, i){
      this.output[i] = neuron.output
    }, this)
    return this;
  }
}

module.exports = {
    NeuralNet: NeuralNet
};

},{"./layer":4}],6:[function(require,module,exports){
class Neuron {
  constructor(){
    this.kind = TYPE_INPUT
    this.bias = 0
    this.activ_f = AF_SIGMOID
    this.weights = []
    this.inputs = []
    this.output = 0
  }

  setOutput(y){
    this.output = y
    return this;
  }

  setKind(k){
    this.kind = k
    return this
  }

  activate(){
    if (this.kind === TYPE_INPUT){
      return this;
    }
    let pre_output = this.bias
    this.weights.forEach(function(w, i){
      pre_output += this.inputs[i].output * w
    }, this)
    this.output = Neuron.sigmoid(pre_output)
    return this;
  }

  static sigmoid(x){
    return 1 / (1 + Math.exp(-x))
  }

  addInput(neuron){
    this.inputs.push(neuron)
    this.weights.push(1)
    return this;
  }

  randomize(a){
    if(this.kind != TYPE_INPUT){
      this.weights.forEach(function(w,i){
        this.weights[i] = -a + 2 * a * Math.random()
      }, this)

      this.bias = -a + 2 * a * Math.random()
    }
    return this;
  }

}

module.exports = {
  Neuron: Neuron
}

},{}],7:[function(require,module,exports){
class Renderer {
	constructor(canvas) {
		this.ctx = canvas.getContext('2d');
		this.center = canvas.width / 2;
	}

  renderCircle(p, fillColor, strokeColor, radius, lineWidth) {
		this.ctx.fillStyle = fillColor;
		this.ctx.beginPath();
		this.ctx.strokeStyle = strokeColor;
		this.ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
		this.ctx.fill();
		this.ctx.lineWidth = lineWidth;
		this.ctx.stroke();
	}
  renderArc(p, fillColor, strokeColor, radius, lineWidth, start_alpha, end_alpha, clockwise) {
		this.ctx.fillStyle = fillColor;
		this.ctx.strokeStyle = strokeColor;
		this.ctx.lineWidth = lineWidth;
    // this.ctx.moveTo(p.x,p.y);
		this.ctx.beginPath();
		this.ctx.arc(p.x, p.y, radius, start_alpha, end_alpha, clockwise);
    this.ctx.lineTo(p.x,p.y);
		this.ctx.fill();
		this.ctx.stroke();
	}
  renderRectangle(start, end, fillColor, strokeColor, lineWidth) {
    this.ctx.beginPath();
    this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.stroke();
  }
  renderSize(size) {
    this.ctx.font="300px Verdana";
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.fillText(size, WORLD_WIDTH / 2, WORLD_HEIGHT / 2 + 100);
  }
  clearCanvas() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
	}
  renderSnake(s) {
    this.renderSensors(s)
    s.body.forEach(function(b, i){
      if(i===0){
        this.renderCircle(b.pos, 'aqua', 'black', 12, 5)
      }
      else {
        this.renderCircle(b.pos, 'blue', 'black', 10, 5)
      }
    }, this)
  }
	renderSensors(s) {
		let start_alpha = (s.direction - SNAKE_VISION / 2) * Math.PI / 180
		let end_alpha = (s.direction + SNAKE_VISION / 2) * Math.PI / 180
		var grd=this.ctx.createRadialGradient(s.head.pos.x, s.head.pos.y, 5, s.head.pos.x, s.head.pos.y, 100);
		grd.addColorStop(0,"rgba(200,50,50,0.3)");
		grd.addColorStop(1,"rgba(200,50,50,0)");

		this.ctx.fillStyle = grd;
		this.ctx.beginPath();
		this.ctx.arc(s.head.pos.x, s.head.pos.y, 100, start_alpha, end_alpha, false);
		this.ctx.lineTo(s.head.pos.x, s.head.pos.y);
		this.ctx.fill();

		s.sensors["food"].forEach(function(sensor, i) {
      this.renderSensor(s, sensor, 'rgba(200,250,250,0.6)')
    }, this)
		s.sensors["wall"].forEach(function(sensor, i) {
      this.renderSensor(s, sensor, 'rgba(250,200,250,0.6)')
    }, this)
		s.sensors["self"].forEach(function(sensor, i) {
      this.renderSensor(s, sensor, 'rgba(250,250,200,0.6)')
    }, this)
	}
  renderFood(f) {
    this.renderFoodLife(f)
    this.renderCircle(f.pos, 'red', 'red', 6, 1)
  }
  renderFoodLife(f) {
    this.renderArc(f.pos, 'rgba(200,50,50,1)', 'rgba(200,50,50,1)', 10, 1, -Math.PI/180 * 90, -Math.PI/180 * 90 - 2 * Math.PI / FOOD_INITIAL_LIFE * f.life, true)
  }
  renderWall() {
    this.renderRectangle({x: 0, y: 0}, {x: WALL_THICKNESS, y: WORLD_HEIGHT}, 'black', 'black', 1)
    this.renderRectangle({x: WORLD_WIDTH - WALL_THICKNESS, y: 0}, {x: WORLD_WIDTH, y: WORLD_HEIGHT}, 'black', 'black', 1)
    this.renderRectangle({x: 0, y: 0}, {x: WORLD_WIDTH, y: WALL_THICKNESS}, 'black', 'black', 1)
    this.renderRectangle({x: 0, y: WORLD_HEIGHT - WALL_THICKNESS}, {x: WORLD_WIDTH, y: WORLD_HEIGHT}, 'black', 'black', 1)
  }
  renderSensor(snake, sensor, color) {
    let start_alpha = (sensor.getDirection() - sensor.vision / 2) * Math.PI / 180
    let end_alpha = (sensor.getDirection() + sensor.vision / 2) * Math.PI / 180

    this.renderArc(sensor.mountPoint, color, color, 100 * sensor.excitement, 1, start_alpha, end_alpha, false)
  }
	renderGame(game) {
    this.clearCanvas();
    this.renderSize(game.snakes[0].body.length)
    game.snakes.forEach(function(s, i){
      this.renderSnake(s)
    }, this);
    game.food.forEach(function(f, i){
      this.renderFood(f);
    }, this);
    this.renderWall();
	}
}

module.exports = {
	Renderer: Renderer
}

},{}],8:[function(require,module,exports){
KIND_FOOD = 0
KIND_WALL = 1
KIND_SELF = 2

class Sensor {
  constructor (part, direction, kind, vision) {
    this.kind = kind;
    this.ini_direction = direction;
    this.direction = part.direction + direction
    this.excitement = 0;
    this.vision = vision;
    this.mountPoint = part.pos;
    this.mount = part;
  }

  setDirection(d) {
    this.direction = d
    return this;
  }

  getDirection() {
    return this.direction;
  }

  getValue() {
    return this.excitement;
  }

  setMountPoint(point) {
    this.mountPoint = {x: point.x, y: point.y}
    return this
  }

  scan(world) {
    this.excitement = 0

    // FOOD
    if (this.kind == KIND_FOOD){
      world.food.forEach(function(f, i){
        this._computeValueForPos(f.pos);
      }, this)
    }

    // WALLS
    if (this.kind == KIND_WALL) {
      let d = 2 * (WORLD_WIDTH + WORLD_HEIGHT)
      if (0 < this.direction && this.direction < 180){
        d = Math.min(d, this.getDistanceToWall("bottom"))
      }
      if (90 < this.direction && this.direction < 270){
        d = Math.min(d, this.getDistanceToWall("left"))
      }
      if (180< this.direction && this.direction < 360){
        d = Math.min(d, this.getDistanceToWall("top"))
      }
      if (this.direction > 270 || this.direction < 90){
        d = Math.min(d, this.getDistanceToWall("right"))
      }
      this.excitement = Math.exp(-d / 200)
    }

    // SELF BODY
    if (this.kind == KIND_SELF) {
      world.snake.body.forEach(function(bp, i){
        this._computeValueForPos(bp.pos);
      }, this)
    }

  }

  getDistanceToWall(wall) {
    switch (wall) {
      case "bottom":
        return (WORLD_HEIGHT - this.mountPoint.y) / Math.sin(this.direction * Math.PI / 180)
        break;
      case "top":
        return (0 - this.mountPoint.y) / Math.sin(this.direction * Math.PI / 180)
        break;
      case "left":
        return (0 - this.mountPoint.x) / Math.cos(this.direction * Math.PI / 180)
        break;
      case "right":
        return (WORLD_WIDTH - this.mountPoint.x) / Math.cos(this.direction * Math.PI / 180)
        break;
      default:
        return null

    }
  }

  _computeValueForPos(pos) {
    if (this._isOnSight(pos)) {
      let excitement = Math.exp(-this.distance(pos) / 200)
      // this.excitement += excitement
      this.excitement = Math.max(excitement, this.excitement)
    }
  }

  _isOnSight(pos) {
    let dx = pos.x - this.mountPoint.x;
    let dy = pos.y - this.mountPoint.y;
    if( dx == 0 && dy == 0){
      return false;
    }
    let alpha = (360 + Math.atan2(dy, dx) * 180 / Math.PI) % 360;
    let a_small = (360 + (this.direction - this.vision / 2)) % 360;
    let a_big = (360 + (this.direction + this.vision / 2)) % 360;
    if(a_small <= alpha && alpha <= a_big) {
      return true;
    }
    else if (a_big < a_small) {
      return alpha >= a_small || alpha <= a_big;
    }
    return false;
  }

  distance(pos) {
    let dx = pos.x - this.mountPoint.x;
    let dy = pos.y - this.mountPoint.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  }

}

module.exports = {
    Sensor: Sensor
};

},{}],9:[function(require,module,exports){
var s = require('./sensor')

var net = require('./neural/neuralNet')

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
    this.brain = new net.NeuralNet();
    this.sensors = {"food": [], "wall": [], "self": []}
    this.body = [this.head]
    this.tail = null
    this.direction = direction;
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

  scanWorld(world) {
    this.sensors["food"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(s.excitement)
    }, this)
    this.sensors["wall"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(s.excitement)
    }, this)
    this.sensors["self"].forEach(function (s,i){
      s.scan(world)
      this.brain.setInput(s.excitement)
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
    console.log("ATE!")
  }
}

module.exports = {
    Snake: Snake,
    BodyPart: BodyPart
};

},{"./neural/neuralNet":5,"./sensor":8}]},{},[1]);
