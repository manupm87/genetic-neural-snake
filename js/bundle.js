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
var snake = require('./snake')
var f = require('./food')

dt = 20 // milliseconds (rendering freq.)
SIMULTANEUS_FOOD = 5
MOUTH_SIZE = 20
WALL_THICKNESS = 20
POPULATION_SIZE = 21

class Game {
  constructor(){
    this.snakes = [];
    this.food = [];
    this.controls = {left: false, right: false}
  }

  initialize() {
    this.snakes = []
    for (var i = 0; i < POPULATION_SIZE; i++) {
      let s = new snake.Snake({x: 100, y: 50}, 0)
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
    let snakes_alive = false
    othis.snakes.forEach(function(s, i) {
      snakes_alive = s.isAlive || snakes_alive
      if(s.isAlive){
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
          s.turn(s.brain.output[1] > 0.4, s.brain.output[0] > 0.4)
        }
        s.scanWorld({food: othis.food, snake: s})
        s.moveForward();
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
    if (s.head.pos.x < WALL_THICKNESS / 2 || s.head.pos.x > WORLD_WIDTH - WALL_THICKNESS / 2)
      s.isAlive = false
    else if (s.head.pos.y < WALL_THICKNESS / 2 || s.head.pos.y > WORLD_HEIGHT - WALL_THICKNESS / 2) {
      s.isAlive = false
    }
  }

  checkSelf(s) {
    s.body.forEach(function(b, i){
      if (i > 2 && this._distance(s.head.pos, b.pos) < BONE_SIZE)
        s.isAlive = false
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
PLAYER = 0
BOT = 1

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
  renderSnake(s, controller) {
		if(controller == PLAYER){
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
		else {
			s.body.forEach(function(b, i){
	      if(i===0){
	        this.renderCircle(b.pos, 'rgba(200,250,250,0.3)', 'rgba(50,50,50,0.3)', 12, 5)
	      }
	      else {
	        this.renderCircle(b.pos, 'rgba(200,200,250,0.3)', 'rgba(50,50,50,0.3)', 10, 5)
	      }
	    }, this)
		}
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
			if(s.isAlive){
				if (i === 0){
					this.renderSnake(s, PLAYER)
				}
				else {
	      	this.renderSnake(s, BOT)
				}
			}
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
    console.log("ATE!")
  }
}

module.exports = {
    Snake: Snake,
    BodyPart: BodyPart
};

},{"./neural/neuralNet":5,"./sensor":8}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbmdpbmUuanMiLCJmb29kLmpzIiwiZ2FtZS5qcyIsIm5ldXJhbC9sYXllci5qcyIsIm5ldXJhbC9uZXVyYWxOZXQuanMiLCJuZXVyYWwvbmV1cm9uLmpzIiwicmVuZGVyZXIuanMiLCJzZW5zb3IuanMiLCJzbmFrZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGcgPSByZXF1aXJlKCcuL2dhbWUnKVxudmFyIHIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJylcblxuUkVOREVSX0ZSRVEgPSAyMDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuXHR2YXIgcmVuZGVyZXIgPSBuZXcgci5SZW5kZXJlcihjYW52YXMpO1xuICB2YXIgZ2FtZSA9IG5ldyBnLkdhbWUoKTtcbiAgc2V0RXZlbnRzKGdhbWUpO1xuICBnYW1lLmluaXRpYWxpemUoKTtcbiAgd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdHJlbmRlcmVyLnJlbmRlckdhbWUoZ2FtZSk7XG5cdH0sIFJFTkRFUl9GUkVRKTtcblxuICBnYW1lLnN0YXJ0KClcbn1cblxuZnVuY3Rpb24gc2V0RXZlbnRzKGcpIHtcbiAgZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICBpZiAoZS5rZXlDb2RlID09ICczNycpIHtcbiAgICAgICAvLyBsZWZ0IGFycm93XG4gICAgICAgZy5wcmVzc0xlZnQodHJ1ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICAgICBnLnByZXNzUmlnaHQodHJ1ZSk7XG4gICAgfVxuICB9XG4gIGRvY3VtZW50Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIGlmIChlLmtleUNvZGUgPT0gJzM3Jykge1xuICAgICAgIC8vIGxlZnQgYXJyb3dcbiAgICAgICBnLnByZXNzTGVmdChmYWxzZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICAgICBnLnByZXNzUmlnaHQoZmFsc2UpO1xuICAgIH1cbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sZWZ0XCIpLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBnLnByZXNzTGVmdCh0cnVlKTtcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sZWZ0XCIpLm9udG91Y2hlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZy5wcmVzc0xlZnQoZmFsc2UpO1xuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXJpZ2h0XCIpLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGcucHJlc3NSaWdodCh0cnVlKTtcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1yaWdodFwiKS5vbnRvdWNoZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgZy5wcmVzc1JpZ2h0KGZhbHNlKTtcbiAgfVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdGluaXQoKTtcbn1cbiIsIkZPT0RfSU5JVElBTF9MSUZFID0gMTBcblxuY2xhc3MgRm9vZCB7XG4gIGNvbnN0cnVjdG9yKHBvcywgbGlmZSl7XG4gICAgdGhpcy5wb3MgPSB7eDogcG9zLngsIHk6IHBvcy55fVxuICAgIHRoaXMubGlmZSA9IGxpZmU7XG4gIH1cblxuICBkZWNyZWFzZUxpZmVUaW1lKHRpbWUpIHtcbiAgICB0aGlzLmxpZmUgLT0gdGltZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBGb29kOiBGb29kXG59O1xuIiwidmFyIHNuYWtlID0gcmVxdWlyZSgnLi9zbmFrZScpXG52YXIgZiA9IHJlcXVpcmUoJy4vZm9vZCcpXG5cbmR0ID0gMjAgLy8gbWlsbGlzZWNvbmRzIChyZW5kZXJpbmcgZnJlcS4pXG5TSU1VTFRBTkVVU19GT09EID0gNVxuTU9VVEhfU0laRSA9IDIwXG5XQUxMX1RISUNLTkVTUyA9IDIwXG5QT1BVTEFUSU9OX1NJWkUgPSAyMVxuXG5jbGFzcyBHYW1lIHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLnNuYWtlcyA9IFtdO1xuICAgIHRoaXMuZm9vZCA9IFtdO1xuICAgIHRoaXMuY29udHJvbHMgPSB7bGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZX1cbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zbmFrZXMgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgUE9QVUxBVElPTl9TSVpFOyBpKyspIHtcbiAgICAgIGxldCBzID0gbmV3IHNuYWtlLlNuYWtlKHt4OiAxMDAsIHk6IDUwfSwgMClcbiAgICAgIHMubW91bnRTZW5zb3JzKClcbiAgICAgIHMuaW5pdEJyYWluKClcbiAgICAgIHRoaXMuc25ha2VzLnB1c2gocylcbiAgICB9XG4gIH1cblxuLy8gVE9ETzogUkVGQUNUT1IgUkVTVEFSVFxuICByZXN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBzcGF3bkZvb2QoKXtcbiAgICBsZXQgcmFuZF94ID0gMiAqIFdBTExfVEhJQ0tORVNTICsgcGFyc2VJbnQoKFdPUkxEX1dJRFRIIC0gNCAqIFdBTExfVEhJQ0tORVNTKSAqIE1hdGgucmFuZG9tKCkpXG4gICAgbGV0IHJhbmRfeSA9IDIgKiBXQUxMX1RISUNLTkVTUyArIHBhcnNlSW50KChXT1JMRF9IRUlHSFQgLSA0ICogV0FMTF9USElDS05FU1MpICogTWF0aC5yYW5kb20oKSlcbiAgICB0aGlzLmZvb2QucHVzaChuZXcgZi5Gb29kKHt4OiByYW5kX3gsIHk6IHJhbmRfeX0sIDEwKSlcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHZhciBvdGhpcyA9IHRoaXM7XG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBvdGhpcy5nYW1lTG9vcChvdGhpcylcbiAgICB9LCBkdClcbiAgfVxuXG4gIGdhbWVMb29wKG90aGlzKSB7XG4gICAgbGV0IHNuYWtlc19hbGl2ZSA9IGZhbHNlXG4gICAgb3RoaXMuc25ha2VzLmZvckVhY2goZnVuY3Rpb24ocywgaSkge1xuICAgICAgc25ha2VzX2FsaXZlID0gcy5pc0FsaXZlIHx8IHNuYWtlc19hbGl2ZVxuICAgICAgaWYocy5pc0FsaXZlKXtcbiAgICAgICAgb3RoaXMuY2hlY2tXYWxscyhzKVxuICAgICAgICBvdGhpcy5jaGVja1NlbGYocylcblxuICAgICAgICBvdGhpcy5mb29kLmZvckVhY2goZnVuY3Rpb24oZiwgaikge1xuICAgICAgICAgIGlmIChvdGhpcy5fZGlzdGFuY2Uocy5oZWFkLnBvcywgZi5wb3MpIDwgTU9VVEhfU0laRSkge1xuICAgICAgICAgICAgb3RoaXMuZm9vZC5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICBzLmdyb3coKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGlmKGk9PTApe1xuICAgICAgICAgIHMudHVybihvdGhpcy5jb250cm9scy5yaWdodCwgb3RoaXMuY29udHJvbHMubGVmdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICBzLnR1cm4ocy5icmFpbi5vdXRwdXRbMV0gPiAwLjQsIHMuYnJhaW4ub3V0cHV0WzBdID4gMC40KVxuICAgICAgICB9XG4gICAgICAgIHMuc2NhbldvcmxkKHtmb29kOiBvdGhpcy5mb29kLCBzbmFrZTogc30pXG4gICAgICAgIHMubW92ZUZvcndhcmQoKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmKCFzbmFrZXNfYWxpdmUpe1xuICAgICAgb3RoaXMucmVzdGFydCgpXG4gICAgfVxuICAgIC8vIEZvb2QgbG9vcDpcbiAgICBvdGhpcy5mb29kLmZvckVhY2goZnVuY3Rpb24oZiwgaSkge1xuICAgICAgZi5kZWNyZWFzZUxpZmVUaW1lKGR0IC8gMTAwMClcbiAgICAgIGlmIChmLmxpZmUgPCAwKXtcbiAgICAgICAgb3RoaXMuZm9vZC5zcGxpY2UoaSwgMSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgd2hpbGUob3RoaXMuZm9vZC5sZW5ndGggPCBTSU1VTFRBTkVVU19GT09EKXtcbiAgICAgIG90aGlzLnNwYXduRm9vZCgpXG4gICAgfVxuICB9XG5cbiAgY2hlY2tXYWxscyhzKSB7XG4gICAgaWYgKHMuaGVhZC5wb3MueCA8IFdBTExfVEhJQ0tORVNTIC8gMiB8fCBzLmhlYWQucG9zLnggPiBXT1JMRF9XSURUSCAtIFdBTExfVEhJQ0tORVNTIC8gMilcbiAgICAgIHMuaXNBbGl2ZSA9IGZhbHNlXG4gICAgZWxzZSBpZiAocy5oZWFkLnBvcy55IDwgV0FMTF9USElDS05FU1MgLyAyIHx8IHMuaGVhZC5wb3MueSA+IFdPUkxEX0hFSUdIVCAtIFdBTExfVEhJQ0tORVNTIC8gMikge1xuICAgICAgcy5pc0FsaXZlID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICBjaGVja1NlbGYocykge1xuICAgIHMuYm9keS5mb3JFYWNoKGZ1bmN0aW9uKGIsIGkpe1xuICAgICAgaWYgKGkgPiAyICYmIHRoaXMuX2Rpc3RhbmNlKHMuaGVhZC5wb3MsIGIucG9zKSA8IEJPTkVfU0laRSlcbiAgICAgICAgcy5pc0FsaXZlID0gZmFsc2VcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgcHJlc3NSaWdodChwcmVzc2VkKSB7XG4gICAgdGhpcy5jb250cm9scy5yaWdodCA9IHByZXNzZWQ7XG4gIH1cbiAgcHJlc3NMZWZ0KHByZXNzZWQpIHtcbiAgICB0aGlzLmNvbnRyb2xzLmxlZnQgPSBwcmVzc2VkO1xuICB9XG5cbiAgX2Rpc3RhbmNlKHAxLCBwMikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocDEueCAtIHAyLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAyLnksIDIpKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBHYW1lOiBHYW1lXG59XG4iLCJ2YXIgbmV1cm9uID0gcmVxdWlyZSgnLi9uZXVyb24nKVxuXG5jbGFzcyBMYXllciB7XG4gIGNvbnN0cnVjdG9yKGtpbmQpe1xuICAgIHRoaXMua2luZCA9IGtpbmRcbiAgICB0aGlzLm5ldXJvbnMgPSBbXVxuICB9XG5cbiAgYWRkTmV1cm9ucyhuKXtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgdGhpcy5uZXVyb25zLnB1c2gobmV3IG5ldXJvbi5OZXVyb24oKS5zZXRLaW5kKHRoaXMua2luZCkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkSW5wdXQoeCkge1xuICAgIHRoaXMubmV1cm9ucy5wdXNoKG5ldyBuZXVyb24uTmV1cm9uKCkuc2V0S2luZChUWVBFX0lOUFVUKS5zZXRPdXRwdXQoeCkpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRJbnB1dChpLCB4KSB7XG4gICAgdGhpcy5uZXVyb25zW2ldLnNldE91dHB1dCh4KVxuICB9XG5cbiAgY29ubmVjdChwcmV2X2xheWVyLCBjb25uZWN0aW9uKSB7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT09IENPTk5fRlVMTFlfQ09OTkVDVEVEKXtcbiAgICAgIHRoaXMubmV1cm9ucy5mb3JFYWNoKGZ1bmN0aW9uKG4sIGkpe1xuICAgICAgICBwcmV2X2xheWVyLm5ldXJvbnMuZm9yRWFjaChmdW5jdGlvbihwbiwgaikge1xuICAgICAgICAgIG4uYWRkSW5wdXQocG4pXG4gICAgICAgIH0sIHRoaXMpXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJhbmRvbWl6ZShhKSB7XG4gICAgaWYodGhpcy5raW5kICE9IFRZUEVfSU5QVVQpe1xuICAgICAgdGhpcy5uZXVyb25zLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICAgIG4ucmFuZG9taXplKGEpXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMubmV1cm9ucy5mb3JFYWNoKGZ1bmN0aW9uKG4sIGkpe1xuICAgICAgbi5hY3RpdmF0ZSgpXG4gICAgfSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBMYXllcjogTGF5ZXJcbn1cbiIsInZhciBsID0gcmVxdWlyZSgnLi9sYXllcicpXG5cbkNPTk5fRlVMTFlfQ09OTkVDVEVEID0gMFxuQUZfU0lHTU9JRCA9IDBcbkFGX1JFTFUgPSAxXG5BRl9UQU5IID0gMlxuXG5UWVBFX0lOUFVUID0gMFxuVFlQRV9ISURERU4gPSAxXG5UWVBFX09VVFBVVCA9IDJcblxuY2xhc3MgTmV1cmFsTmV0IHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLmlucHV0TGF5ZXIgPSBuZXcgbC5MYXllcihUWVBFX0lOUFVUKVxuICAgIHRoaXMuaGlkZGVuTGF5ZXJzID0gW11cbiAgICB0aGlzLm91dHB1dExheWVyID0gbnVsbFxuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgYWRkSW5wdXQoeCkge1xuICAgIHRoaXMuaW5wdXRMYXllci5hZGRJbnB1dCh4KVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0SW5wdXQoaSwgeCl7XG4gICAgdGhpcy5pbnB1dExheWVyLnNldElucHV0KGksIHgpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRIaWRkZW5MYXllcihuKSB7XG4gICAgLy9jb25zb2xlLmxvZyhuKVxuICAgIGxldCBobCA9IG5ldyBsLkxheWVyKFRZUEVfSElEREVOKVxuICAgIGhsLmFkZE5ldXJvbnMobilcbiAgICAvL2NvbnNvbGUubG9nKGhsKVxuICAgIHRoaXMuaGlkZGVuTGF5ZXJzLnB1c2goaGwpXG4gICAgaWYgKHRoaXMuaGlkZGVuTGF5ZXJzLmxlbmd0aCA9PSAxKXtcbiAgICAgIHRoaXMuaGlkZGVuTGF5ZXJzWzBdLmNvbm5lY3QodGhpcy5pbnB1dExheWVyLCBDT05OX0ZVTExZX0NPTk5FQ1RFRClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmhpZGRlbkxheWVyc1t0aGlzLmhpZGRlbkxheWVycy5sZW5ndGggLSAxXS5jb25uZWN0KHRoaXMuaGlkZGVuTGF5ZXJzW3RoaXMuaGlkZGVuTGF5ZXJzLmxlbmd0aCAtIDJdLCBDT05OX0ZVTExZX0NPTk5FQ1RFRClcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhobClcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZE91dHB1dExheWVyKG4pIHtcbiAgICB0aGlzLm91dHB1dExheWVyID0gbmV3IGwuTGF5ZXIoVFlQRV9PVVRQVVQpLmFkZE5ldXJvbnMobilcbiAgICBpZiAodGhpcy5oaWRkZW5MYXllcnMubGVuZ3RoID09IDApe1xuICAgICAgdGhpcy5vdXRwdXRMYXllci5jb25uZWN0KHRoaXMuaW5wdXRMYXllciwgQ09OTl9GVUxMWV9DT05ORUNURUQpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vdXRwdXRMYXllci5jb25uZWN0KHRoaXMuaGlkZGVuTGF5ZXJzW3RoaXMuaGlkZGVuTGF5ZXJzLmxlbmd0aCAtIDFdLCBDT05OX0ZVTExZX0NPTk5FQ1RFRClcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICB0aGlzLm91dHB1dC5wdXNoKDApXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5vdXRwdXRMYXllcilcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJhbmRvbWl6ZShhKSB7XG4gICAgdGhpcy5oaWRkZW5MYXllcnMuZm9yRWFjaChmdW5jdGlvbihsYXllciwgaSl7XG4gICAgICBsYXllci5yYW5kb21pemUoYSlcbiAgICB9KVxuICAgIHRoaXMub3V0cHV0TGF5ZXIucmFuZG9taXplKGEpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmhpZGRlbkxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgICBsYXllci5hY3RpdmF0ZSgpXG4gICAgfSlcbiAgICB0aGlzLm91dHB1dExheWVyLmFjdGl2YXRlKClcbiAgICB0aGlzLm91dHB1dExheWVyLm5ldXJvbnMuZm9yRWFjaChmdW5jdGlvbihuZXVyb24sIGkpe1xuICAgICAgdGhpcy5vdXRwdXRbaV0gPSBuZXVyb24ub3V0cHV0XG4gICAgfSwgdGhpcylcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBOZXVyYWxOZXQ6IE5ldXJhbE5ldFxufTtcbiIsImNsYXNzIE5ldXJvbiB7XG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5raW5kID0gVFlQRV9JTlBVVFxuICAgIHRoaXMuYmlhcyA9IDBcbiAgICB0aGlzLmFjdGl2X2YgPSBBRl9TSUdNT0lEXG4gICAgdGhpcy53ZWlnaHRzID0gW11cbiAgICB0aGlzLmlucHV0cyA9IFtdXG4gICAgdGhpcy5vdXRwdXQgPSAwXG4gIH1cblxuICBzZXRPdXRwdXQoeSl7XG4gICAgdGhpcy5vdXRwdXQgPSB5XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRLaW5kKGspe1xuICAgIHRoaXMua2luZCA9IGtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYWN0aXZhdGUoKXtcbiAgICBpZiAodGhpcy5raW5kID09PSBUWVBFX0lOUFVUKXtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBsZXQgcHJlX291dHB1dCA9IHRoaXMuYmlhc1xuICAgIHRoaXMud2VpZ2h0cy5mb3JFYWNoKGZ1bmN0aW9uKHcsIGkpe1xuICAgICAgcHJlX291dHB1dCArPSB0aGlzLmlucHV0c1tpXS5vdXRwdXQgKiB3XG4gICAgfSwgdGhpcylcbiAgICB0aGlzLm91dHB1dCA9IE5ldXJvbi5zaWdtb2lkKHByZV9vdXRwdXQpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdGF0aWMgc2lnbW9pZCh4KXtcbiAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKVxuICB9XG5cbiAgYWRkSW5wdXQobmV1cm9uKXtcbiAgICB0aGlzLmlucHV0cy5wdXNoKG5ldXJvbilcbiAgICB0aGlzLndlaWdodHMucHVzaCgxKVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmFuZG9taXplKGEpe1xuICAgIGlmKHRoaXMua2luZCAhPSBUWVBFX0lOUFVUKXtcbiAgICAgIHRoaXMud2VpZ2h0cy5mb3JFYWNoKGZ1bmN0aW9uKHcsaSl7XG4gICAgICAgIHRoaXMud2VpZ2h0c1tpXSA9IC1hICsgMiAqIGEgKiBNYXRoLnJhbmRvbSgpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgICB0aGlzLmJpYXMgPSAtYSArIDIgKiBhICogTWF0aC5yYW5kb20oKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBOZXVyb246IE5ldXJvblxufVxuIiwiUExBWUVSID0gMFxuQk9UID0gMVxuXG5jbGFzcyBSZW5kZXJlciB7XG5cdGNvbnN0cnVjdG9yKGNhbnZhcykge1xuXHRcdHRoaXMuY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0dGhpcy5jZW50ZXIgPSBjYW52YXMud2lkdGggLyAyO1xuXHR9XG5cbiAgcmVuZGVyQ2lyY2xlKHAsIGZpbGxDb2xvciwgc3Ryb2tlQ29sb3IsIHJhZGl1cywgbGluZVdpZHRoKSB7XG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xuXHRcdHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuXHRcdHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlQ29sb3I7XG5cdFx0dGhpcy5jdHguYXJjKHAueCwgcC55LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG5cdFx0dGhpcy5jdHguZmlsbCgpO1xuXHRcdHRoaXMuY3R4LmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcblx0XHR0aGlzLmN0eC5zdHJva2UoKTtcblx0fVxuICByZW5kZXJBcmMocCwgZmlsbENvbG9yLCBzdHJva2VDb2xvciwgcmFkaXVzLCBsaW5lV2lkdGgsIHN0YXJ0X2FscGhhLCBlbmRfYWxwaGEsIGNsb2Nrd2lzZSkge1xuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcblx0XHR0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZUNvbG9yO1xuXHRcdHRoaXMuY3R4LmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICAvLyB0aGlzLmN0eC5tb3ZlVG8ocC54LHAueSk7XG5cdFx0dGhpcy5jdHguYmVnaW5QYXRoKCk7XG5cdFx0dGhpcy5jdHguYXJjKHAueCwgcC55LCByYWRpdXMsIHN0YXJ0X2FscGhhLCBlbmRfYWxwaGEsIGNsb2Nrd2lzZSk7XG4gICAgdGhpcy5jdHgubGluZVRvKHAueCxwLnkpO1xuXHRcdHRoaXMuY3R4LmZpbGwoKTtcblx0XHR0aGlzLmN0eC5zdHJva2UoKTtcblx0fVxuICByZW5kZXJSZWN0YW5nbGUoc3RhcnQsIGVuZCwgZmlsbENvbG9yLCBzdHJva2VDb2xvciwgbGluZVdpZHRoKSB7XG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHgucmVjdChzdGFydC54LCBzdGFydC55LCBlbmQueCAtIHN0YXJ0LngsIGVuZC55IC0gc3RhcnQueSk7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VDb2xvcjtcbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgfVxuICByZW5kZXJTaXplKHNpemUpIHtcbiAgICB0aGlzLmN0eC5mb250PVwiMzAwcHggVmVyZGFuYVwiO1xuICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNSknO1xuICAgIHRoaXMuY3R4LmZpbGxUZXh0KHNpemUsIFdPUkxEX1dJRFRIIC8gMiwgV09STERfSEVJR0hUIC8gMiArIDEwMCk7XG4gIH1cbiAgY2xlYXJDYW52YXMoKSB7XG5cdFx0dGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3R4LmNhbnZhcy5jbGllbnRXaWR0aCwgdGhpcy5jdHguY2FudmFzLmNsaWVudEhlaWdodCk7XG5cdH1cbiAgcmVuZGVyU25ha2UocywgY29udHJvbGxlcikge1xuXHRcdGlmKGNvbnRyb2xsZXIgPT0gUExBWUVSKXtcblx0ICAgIHRoaXMucmVuZGVyU2Vuc29ycyhzKVxuXHQgICAgcy5ib2R5LmZvckVhY2goZnVuY3Rpb24oYiwgaSl7XG5cdCAgICAgIGlmKGk9PT0wKXtcblx0ICAgICAgICB0aGlzLnJlbmRlckNpcmNsZShiLnBvcywgJ2FxdWEnLCAnYmxhY2snLCAxMiwgNSlcblx0ICAgICAgfVxuXHQgICAgICBlbHNlIHtcblx0ICAgICAgICB0aGlzLnJlbmRlckNpcmNsZShiLnBvcywgJ2JsdWUnLCAnYmxhY2snLCAxMCwgNSlcblx0ICAgICAgfVxuXHQgICAgfSwgdGhpcylcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRzLmJvZHkuZm9yRWFjaChmdW5jdGlvbihiLCBpKXtcblx0ICAgICAgaWYoaT09PTApe1xuXHQgICAgICAgIHRoaXMucmVuZGVyQ2lyY2xlKGIucG9zLCAncmdiYSgyMDAsMjUwLDI1MCwwLjMpJywgJ3JnYmEoNTAsNTAsNTAsMC4zKScsIDEyLCA1KVxuXHQgICAgICB9XG5cdCAgICAgIGVsc2Uge1xuXHQgICAgICAgIHRoaXMucmVuZGVyQ2lyY2xlKGIucG9zLCAncmdiYSgyMDAsMjAwLDI1MCwwLjMpJywgJ3JnYmEoNTAsNTAsNTAsMC4zKScsIDEwLCA1KVxuXHQgICAgICB9XG5cdCAgICB9LCB0aGlzKVxuXHRcdH1cbiAgfVxuXHRyZW5kZXJTZW5zb3JzKHMpIHtcblx0XHRsZXQgc3RhcnRfYWxwaGEgPSAocy5kaXJlY3Rpb24gLSBTTkFLRV9WSVNJT04gLyAyKSAqIE1hdGguUEkgLyAxODBcblx0XHRsZXQgZW5kX2FscGhhID0gKHMuZGlyZWN0aW9uICsgU05BS0VfVklTSU9OIC8gMikgKiBNYXRoLlBJIC8gMTgwXG5cdFx0dmFyIGdyZD10aGlzLmN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudChzLmhlYWQucG9zLngsIHMuaGVhZC5wb3MueSwgNSwgcy5oZWFkLnBvcy54LCBzLmhlYWQucG9zLnksIDEwMCk7XG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgwLFwicmdiYSgyMDAsNTAsNTAsMC4zKVwiKTtcblx0XHRncmQuYWRkQ29sb3JTdG9wKDEsXCJyZ2JhKDIwMCw1MCw1MCwwKVwiKTtcblxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IGdyZDtcblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcblx0XHR0aGlzLmN0eC5hcmMocy5oZWFkLnBvcy54LCBzLmhlYWQucG9zLnksIDEwMCwgc3RhcnRfYWxwaGEsIGVuZF9hbHBoYSwgZmFsc2UpO1xuXHRcdHRoaXMuY3R4LmxpbmVUbyhzLmhlYWQucG9zLngsIHMuaGVhZC5wb3MueSk7XG5cdFx0dGhpcy5jdHguZmlsbCgpO1xuXG5cdFx0cy5zZW5zb3JzW1wiZm9vZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHNlbnNvciwgaSkge1xuICAgICAgdGhpcy5yZW5kZXJTZW5zb3Iocywgc2Vuc29yLCAncmdiYSgyMDAsMjUwLDI1MCwwLjYpJylcbiAgICB9LCB0aGlzKVxuXHRcdHMuc2Vuc29yc1tcIndhbGxcIl0uZm9yRWFjaChmdW5jdGlvbihzZW5zb3IsIGkpIHtcbiAgICAgIHRoaXMucmVuZGVyU2Vuc29yKHMsIHNlbnNvciwgJ3JnYmEoMjUwLDIwMCwyNTAsMC42KScpXG4gICAgfSwgdGhpcylcblx0XHRzLnNlbnNvcnNbXCJzZWxmXCJdLmZvckVhY2goZnVuY3Rpb24oc2Vuc29yLCBpKSB7XG4gICAgICB0aGlzLnJlbmRlclNlbnNvcihzLCBzZW5zb3IsICdyZ2JhKDI1MCwyNTAsMjAwLDAuNiknKVxuICAgIH0sIHRoaXMpXG5cdH1cbiAgcmVuZGVyRm9vZChmKSB7XG4gICAgdGhpcy5yZW5kZXJGb29kTGlmZShmKVxuICAgIHRoaXMucmVuZGVyQ2lyY2xlKGYucG9zLCAncmVkJywgJ3JlZCcsIDYsIDEpXG4gIH1cbiAgcmVuZGVyRm9vZExpZmUoZikge1xuICAgIHRoaXMucmVuZGVyQXJjKGYucG9zLCAncmdiYSgyMDAsNTAsNTAsMSknLCAncmdiYSgyMDAsNTAsNTAsMSknLCAxMCwgMSwgLU1hdGguUEkvMTgwICogOTAsIC1NYXRoLlBJLzE4MCAqIDkwIC0gMiAqIE1hdGguUEkgLyBGT09EX0lOSVRJQUxfTElGRSAqIGYubGlmZSwgdHJ1ZSlcbiAgfVxuICByZW5kZXJXYWxsKCkge1xuICAgIHRoaXMucmVuZGVyUmVjdGFuZ2xlKHt4OiAwLCB5OiAwfSwge3g6IFdBTExfVEhJQ0tORVNTLCB5OiBXT1JMRF9IRUlHSFR9LCAnYmxhY2snLCAnYmxhY2snLCAxKVxuICAgIHRoaXMucmVuZGVyUmVjdGFuZ2xlKHt4OiBXT1JMRF9XSURUSCAtIFdBTExfVEhJQ0tORVNTLCB5OiAwfSwge3g6IFdPUkxEX1dJRFRILCB5OiBXT1JMRF9IRUlHSFR9LCAnYmxhY2snLCAnYmxhY2snLCAxKVxuICAgIHRoaXMucmVuZGVyUmVjdGFuZ2xlKHt4OiAwLCB5OiAwfSwge3g6IFdPUkxEX1dJRFRILCB5OiBXQUxMX1RISUNLTkVTU30sICdibGFjaycsICdibGFjaycsIDEpXG4gICAgdGhpcy5yZW5kZXJSZWN0YW5nbGUoe3g6IDAsIHk6IFdPUkxEX0hFSUdIVCAtIFdBTExfVEhJQ0tORVNTfSwge3g6IFdPUkxEX1dJRFRILCB5OiBXT1JMRF9IRUlHSFR9LCAnYmxhY2snLCAnYmxhY2snLCAxKVxuICB9XG4gIHJlbmRlclNlbnNvcihzbmFrZSwgc2Vuc29yLCBjb2xvcikge1xuICAgIGxldCBzdGFydF9hbHBoYSA9IChzZW5zb3IuZ2V0RGlyZWN0aW9uKCkgLSBzZW5zb3IudmlzaW9uIC8gMikgKiBNYXRoLlBJIC8gMTgwXG4gICAgbGV0IGVuZF9hbHBoYSA9IChzZW5zb3IuZ2V0RGlyZWN0aW9uKCkgKyBzZW5zb3IudmlzaW9uIC8gMikgKiBNYXRoLlBJIC8gMTgwXG5cbiAgICB0aGlzLnJlbmRlckFyYyhzZW5zb3IubW91bnRQb2ludCwgY29sb3IsIGNvbG9yLCAxMDAgKiBzZW5zb3IuZXhjaXRlbWVudCwgMSwgc3RhcnRfYWxwaGEsIGVuZF9hbHBoYSwgZmFsc2UpXG4gIH1cblx0cmVuZGVyR2FtZShnYW1lKSB7XG4gICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIHRoaXMucmVuZGVyU2l6ZShnYW1lLnNuYWtlc1swXS5ib2R5Lmxlbmd0aClcbiAgICBnYW1lLnNuYWtlcy5mb3JFYWNoKGZ1bmN0aW9uKHMsIGkpe1xuXHRcdFx0aWYocy5pc0FsaXZlKXtcblx0XHRcdFx0aWYgKGkgPT09IDApe1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyU25ha2UocywgUExBWUVSKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHQgICAgICBcdHRoaXMucmVuZGVyU25ha2UocywgQk9UKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG4gICAgfSwgdGhpcyk7XG4gICAgZ2FtZS5mb29kLmZvckVhY2goZnVuY3Rpb24oZiwgaSl7XG4gICAgICB0aGlzLnJlbmRlckZvb2QoZik7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5yZW5kZXJXYWxsKCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFJlbmRlcmVyOiBSZW5kZXJlclxufVxuIiwiS0lORF9GT09EID0gMFxuS0lORF9XQUxMID0gMVxuS0lORF9TRUxGID0gMlxuXG5jbGFzcyBTZW5zb3Ige1xuICBjb25zdHJ1Y3RvciAocGFydCwgZGlyZWN0aW9uLCBraW5kLCB2aXNpb24pIHtcbiAgICB0aGlzLmtpbmQgPSBraW5kO1xuICAgIHRoaXMuaW5pX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBhcnQuZGlyZWN0aW9uICsgZGlyZWN0aW9uXG4gICAgdGhpcy5leGNpdGVtZW50ID0gMDtcbiAgICB0aGlzLnZpc2lvbiA9IHZpc2lvbjtcbiAgICB0aGlzLm1vdW50UG9pbnQgPSBwYXJ0LnBvcztcbiAgICB0aGlzLm1vdW50ID0gcGFydDtcbiAgfVxuXG4gIHNldERpcmVjdGlvbihkKSB7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXREaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xuICB9XG5cbiAgZ2V0VmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhjaXRlbWVudDtcbiAgfVxuXG4gIHNldE1vdW50UG9pbnQocG9pbnQpIHtcbiAgICB0aGlzLm1vdW50UG9pbnQgPSB7eDogcG9pbnQueCwgeTogcG9pbnQueX1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2Nhbih3b3JsZCkge1xuICAgIHRoaXMuZXhjaXRlbWVudCA9IDBcblxuICAgIC8vIEZPT0RcbiAgICBpZiAodGhpcy5raW5kID09IEtJTkRfRk9PRCl7XG4gICAgICB3b3JsZC5mb29kLmZvckVhY2goZnVuY3Rpb24oZiwgaSl7XG4gICAgICAgIHRoaXMuX2NvbXB1dGVWYWx1ZUZvclBvcyhmLnBvcyk7XG4gICAgICB9LCB0aGlzKVxuICAgIH1cblxuICAgIC8vIFdBTExTXG4gICAgaWYgKHRoaXMua2luZCA9PSBLSU5EX1dBTEwpIHtcbiAgICAgIGxldCBkID0gMiAqIChXT1JMRF9XSURUSCArIFdPUkxEX0hFSUdIVClcbiAgICAgIGlmICgwIDwgdGhpcy5kaXJlY3Rpb24gJiYgdGhpcy5kaXJlY3Rpb24gPCAxODApe1xuICAgICAgICBkID0gTWF0aC5taW4oZCwgdGhpcy5nZXREaXN0YW5jZVRvV2FsbChcImJvdHRvbVwiKSlcbiAgICAgIH1cbiAgICAgIGlmICg5MCA8IHRoaXMuZGlyZWN0aW9uICYmIHRoaXMuZGlyZWN0aW9uIDwgMjcwKXtcbiAgICAgICAgZCA9IE1hdGgubWluKGQsIHRoaXMuZ2V0RGlzdGFuY2VUb1dhbGwoXCJsZWZ0XCIpKVxuICAgICAgfVxuICAgICAgaWYgKDE4MDwgdGhpcy5kaXJlY3Rpb24gJiYgdGhpcy5kaXJlY3Rpb24gPCAzNjApe1xuICAgICAgICBkID0gTWF0aC5taW4oZCwgdGhpcy5nZXREaXN0YW5jZVRvV2FsbChcInRvcFwiKSlcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA+IDI3MCB8fCB0aGlzLmRpcmVjdGlvbiA8IDkwKXtcbiAgICAgICAgZCA9IE1hdGgubWluKGQsIHRoaXMuZ2V0RGlzdGFuY2VUb1dhbGwoXCJyaWdodFwiKSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZXhjaXRlbWVudCA9IE1hdGguZXhwKC1kIC8gMjAwKVxuICAgIH1cblxuICAgIC8vIFNFTEYgQk9EWVxuICAgIGlmICh0aGlzLmtpbmQgPT0gS0lORF9TRUxGKSB7XG4gICAgICB3b3JsZC5zbmFrZS5ib2R5LmZvckVhY2goZnVuY3Rpb24oYnAsIGkpe1xuICAgICAgICB0aGlzLl9jb21wdXRlVmFsdWVGb3JQb3MoYnAucG9zKTtcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuXG4gIH1cblxuICBnZXREaXN0YW5jZVRvV2FsbCh3YWxsKSB7XG4gICAgc3dpdGNoICh3YWxsKSB7XG4gICAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICAgIHJldHVybiAoV09STERfSEVJR0hUIC0gdGhpcy5tb3VudFBvaW50LnkpIC8gTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24gKiBNYXRoLlBJIC8gMTgwKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ0b3BcIjpcbiAgICAgICAgcmV0dXJuICgwIC0gdGhpcy5tb3VudFBvaW50LnkpIC8gTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24gKiBNYXRoLlBJIC8gMTgwKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJsZWZ0XCI6XG4gICAgICAgIHJldHVybiAoMCAtIHRoaXMubW91bnRQb2ludC54KSAvIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicmlnaHRcIjpcbiAgICAgICAgcmV0dXJuIChXT1JMRF9XSURUSCAtIHRoaXMubW91bnRQb2ludC54KSAvIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MClcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgfVxuICB9XG5cbiAgX2NvbXB1dGVWYWx1ZUZvclBvcyhwb3MpIHtcbiAgICBpZiAodGhpcy5faXNPblNpZ2h0KHBvcykpIHtcbiAgICAgIGxldCBleGNpdGVtZW50ID0gTWF0aC5leHAoLXRoaXMuZGlzdGFuY2UocG9zKSAvIDIwMClcbiAgICAgIC8vIHRoaXMuZXhjaXRlbWVudCArPSBleGNpdGVtZW50XG4gICAgICB0aGlzLmV4Y2l0ZW1lbnQgPSBNYXRoLm1heChleGNpdGVtZW50LCB0aGlzLmV4Y2l0ZW1lbnQpXG4gICAgfVxuICB9XG5cbiAgX2lzT25TaWdodChwb3MpIHtcbiAgICBsZXQgZHggPSBwb3MueCAtIHRoaXMubW91bnRQb2ludC54O1xuICAgIGxldCBkeSA9IHBvcy55IC0gdGhpcy5tb3VudFBvaW50Lnk7XG4gICAgaWYoIGR4ID09IDAgJiYgZHkgPT0gMCl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBhbHBoYSA9ICgzNjAgKyBNYXRoLmF0YW4yKGR5LCBkeCkgKiAxODAgLyBNYXRoLlBJKSAlIDM2MDtcbiAgICBsZXQgYV9zbWFsbCA9ICgzNjAgKyAodGhpcy5kaXJlY3Rpb24gLSB0aGlzLnZpc2lvbiAvIDIpKSAlIDM2MDtcbiAgICBsZXQgYV9iaWcgPSAoMzYwICsgKHRoaXMuZGlyZWN0aW9uICsgdGhpcy52aXNpb24gLyAyKSkgJSAzNjA7XG4gICAgaWYoYV9zbWFsbCA8PSBhbHBoYSAmJiBhbHBoYSA8PSBhX2JpZykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFfYmlnIDwgYV9zbWFsbCkge1xuICAgICAgcmV0dXJuIGFscGhhID49IGFfc21hbGwgfHwgYWxwaGEgPD0gYV9iaWc7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGRpc3RhbmNlKHBvcykge1xuICAgIGxldCBkeCA9IHBvcy54IC0gdGhpcy5tb3VudFBvaW50Lng7XG4gICAgbGV0IGR5ID0gcG9zLnkgLSB0aGlzLm1vdW50UG9pbnQueTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGR4LCAyKSArIE1hdGgucG93KGR5LCAyKSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFNlbnNvcjogU2Vuc29yXG59O1xuIiwidmFyIHMgPSByZXF1aXJlKCcuL3NlbnNvcicpXG5cbnZhciBuZXQgPSByZXF1aXJlKCcuL25ldXJhbC9uZXVyYWxOZXQnKVxuXG5OVU1fU0VOU09SUyA9IDEyXG5TTkFLRV9WSVNJT04gPSAyNDBcblNOQUtFX1NFTlNPUl9PVkVSTEFQID0gMC4wNVxuU05BS0VfU1BFRUQgPSAyMDAgLy9weCBwZXIgc2Vjb25kXG5TVEVFUklOR19TUEVFRCA9IDM2MCAvLyBkZWdyZWVzIHBlciBzZWNvbmRcbkJPTkVfU0laRSA9IDIwXG5TTkFLRV9MSUZFID0gMTBcblxuV09STERfV0lEVEg9NjAwXG5XT1JMRF9IRUlHSFQ9NDAwXG5cblxuY2xhc3MgQm9keVBhcnR7XG4gIGNvbnN0cnVjdG9yKHBvcywgZGlyKSB7XG4gICAgdGhpcy5wb3MgPSB7eDogcG9zLngsIHk6IHBvcy55fVxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyXG4gIH1cblxuICBtb3ZlRm9yd2FyZCgpIHtcbiAgICB0aGlzLnBvcy54ID0gKFdPUkxEX1dJRFRIICsgdGhpcy5wb3MueCArIFNOQUtFX1NQRUVEICogTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24gKiBNYXRoLlBJIC8gMTgwKSAqIChkdCAvIDEwMDApKSAlIFdPUkxEX1dJRFRIO1xuICAgIHRoaXMucG9zLnkgPSAoV09STERfSEVJR0hUICsgdGhpcy5wb3MueSArIFNOQUtFX1NQRUVEICogTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24gKiBNYXRoLlBJIC8gMTgwKSAqIChkdCAvIDEwMDApKSAlIFdPUkxEX0hFSUdIVDtcblxuICB9XG59XG5cblxuY2xhc3MgU25ha2Uge1xuICBjb25zdHJ1Y3Rvcihwb3MsIGRpcmVjdGlvbikge1xuICAgIHRoaXMuaGVhZCA9IG5ldyBCb2R5UGFydCh7eDogcG9zLngsIHk6IHBvcy55fSwgZGlyZWN0aW9uKTtcbiAgICB0aGlzLmJyYWluID0gbmV3IG5ldC5OZXVyYWxOZXQoKTtcbiAgICB0aGlzLnNlbnNvcnMgPSB7XCJmb29kXCI6IFtdLCBcIndhbGxcIjogW10sIFwic2VsZlwiOiBbXX1cbiAgICB0aGlzLmJvZHkgPSBbdGhpcy5oZWFkXVxuICAgIHRoaXMudGFpbCA9IG51bGxcbiAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB0aGlzLmlzQWxpdmUgPSB0cnVlXG4gIH1cblxuICBtb3VudFNlbnNvcnMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBOVU1fU0VOU09SUzsgaSsrKSB7XG4gICAgICBsZXQgdmlzaW9uID0gKFNOQUtFX1ZJU0lPTiAvIE5VTV9TRU5TT1JTKSAqICgxICsgU05BS0VfU0VOU09SX09WRVJMQVApXG4gICAgICBsZXQgZGlyID0gLSBTTkFLRV9WSVNJT04gLyAyICsgaSAqIFNOQUtFX1ZJU0lPTiAvIE5VTV9TRU5TT1JTICsgdmlzaW9uIC8gMlxuXG4gICAgICB0aGlzLnNlbnNvcnNbXCJmb29kXCJdLnB1c2gobmV3IHMuU2Vuc29yKHRoaXMuaGVhZCwgZGlyLCBLSU5EX0ZPT0QsIHZpc2lvbikpXG4gICAgICB0aGlzLnNlbnNvcnNbXCJ3YWxsXCJdLnB1c2gobmV3IHMuU2Vuc29yKHRoaXMuaGVhZCwgZGlyLCBLSU5EX1dBTEwsIHZpc2lvbikpXG4gICAgICB0aGlzLnNlbnNvcnNbXCJzZWxmXCJdLnB1c2gobmV3IHMuU2Vuc29yKHRoaXMuaGVhZCwgZGlyLCBLSU5EX1NFTEYsIHZpc2lvbikpXG5cbiAgICAgIC8vIFRPRE86IG1vdW50IG90aGVyIHNlbnNvcnNcbiAgICB9XG4gIH1cblxuICBpbml0QnJhaW4oKXtcbiAgICB0aGlzLnNlbnNvcnNbXCJmb29kXCJdLmZvckVhY2goZnVuY3Rpb24ocywgaSl7XG4gICAgICB0aGlzLmJyYWluLmFkZElucHV0KHMuZXhjaXRlbWVudClcbiAgICB9LCB0aGlzKVxuICAgIHRoaXMuc2Vuc29yc1tcIndhbGxcIl0uZm9yRWFjaChmdW5jdGlvbihzLCBpKXtcbiAgICAgIHRoaXMuYnJhaW4uYWRkSW5wdXQocy5leGNpdGVtZW50KVxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5zZW5zb3JzW1wic2VsZlwiXS5mb3JFYWNoKGZ1bmN0aW9uKHMsIGkpe1xuICAgICAgdGhpcy5icmFpbi5hZGRJbnB1dChzLmV4Y2l0ZW1lbnQpXG4gICAgfSwgdGhpcylcblxuICAgIHRoaXMuYnJhaW4uYWRkSGlkZGVuTGF5ZXIoMTApXG4gICAgdGhpcy5icmFpbi5hZGRIaWRkZW5MYXllcig1KVxuICAgIHRoaXMuYnJhaW4uYWRkT3V0cHV0TGF5ZXIoMilcbiAgICB0aGlzLmJyYWluLnJhbmRvbWl6ZSgxMClcbiAgfVxuXG4gIHNjYW5Xb3JsZCh3b3JsZCkge1xuICAgIHRoaXMuc2Vuc29yc1tcImZvb2RcIl0uZm9yRWFjaChmdW5jdGlvbiAocyxpKXtcbiAgICAgIHMuc2Nhbih3b3JsZClcbiAgICAgIHRoaXMuYnJhaW4uc2V0SW5wdXQoaSwgcy5leGNpdGVtZW50KVxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5zZW5zb3JzW1wid2FsbFwiXS5mb3JFYWNoKGZ1bmN0aW9uIChzLGkpe1xuICAgICAgcy5zY2FuKHdvcmxkKVxuICAgICAgdGhpcy5icmFpbi5zZXRJbnB1dChOVU1fU0VOU09SUyArIGksIHMuZXhjaXRlbWVudClcbiAgICB9LCB0aGlzKVxuICAgIHRoaXMuc2Vuc29yc1tcInNlbGZcIl0uZm9yRWFjaChmdW5jdGlvbiAocyxpKXtcbiAgICAgIHMuc2Nhbih3b3JsZClcbiAgICAgIHRoaXMuYnJhaW4uc2V0SW5wdXQoMiAqIE5VTV9TRU5TT1JTICsgaSwgcy5leGNpdGVtZW50KVxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5icmFpbi5hY3RpdmF0ZSgpXG4gIH1cblxuICB0dXJuKHJpZ2h0LCBsZWZ0KSB7XG4gICAgaWYgKHJpZ2h0ICYmICFsZWZ0KSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuaGVhZC5kaXJlY3Rpb24gPSAoMzYwICsgKHRoaXMuZGlyZWN0aW9uICsgKFNURUVSSU5HX1NQRUVEICogKGR0IC8gMTAwMCkpKSkgJSAzNjA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGxlZnQgJiYgIXJpZ2h0KSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuaGVhZC5kaXJlY3Rpb24gPSAoMzYwICsgKHRoaXMuZGlyZWN0aW9uIC0gKFNURUVSSU5HX1NQRUVEICogKGR0IC8gMTAwMCkpKSkgJSAzNjA7XG4gICAgfVxuICAgIHRoaXMuc2Vuc29yc1tcImZvb2RcIl0uZm9yRWFjaChmdW5jdGlvbihzLCBpKSB7XG4gICAgICBzLmRpcmVjdGlvbiA9ICgzNjAgKyAocy5pbmlfZGlyZWN0aW9uICsgdGhpcy5kaXJlY3Rpb24pKSAlIDM2MFxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5zZW5zb3JzW1wid2FsbFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHMsIGkpIHtcbiAgICAgIHMuZGlyZWN0aW9uID0gKDM2MCArIChzLmluaV9kaXJlY3Rpb24gKyB0aGlzLmRpcmVjdGlvbikpICUgMzYwXG4gICAgfSwgdGhpcylcbiAgICB0aGlzLnNlbnNvcnNbXCJzZWxmXCJdLmZvckVhY2goZnVuY3Rpb24ocywgaSkge1xuICAgICAgcy5kaXJlY3Rpb24gPSAoMzYwICsgKHMuaW5pX2RpcmVjdGlvbiArIHRoaXMuZGlyZWN0aW9uKSkgJSAzNjBcbiAgICB9LCB0aGlzKVxuICB9XG4gIG1vdmVGb3J3YXJkKCkge1xuICAgIHRoaXMuYm9keS5mb3JFYWNoKGZ1bmN0aW9uKGIsIGkpIHtcbiAgICAgIGlmKGkhPTApe1xuICAgICAgICBsZXQgcHJlX3Bvc194ID0gMFxuICAgICAgICBsZXQgcHJlX3Bvc195ID0gMFxuICAgICAgICBpZih0aGlzLmJvZHlbaS0xXS5wb3MueCAtIGIucG9zLnggPiAyICogQk9ORV9TSVpFKSAvLyBIRUFEIExFRlQgVE8gVEhFIFJJR0hUIFNJREVcbiAgICAgICAgICBwcmVfcG9zX3ggPSB0aGlzLmJvZHlbaS0xXS5wb3MueCAtIFdPUkxEX1dJRFRIXG4gICAgICAgIGVsc2UgaWYodGhpcy5ib2R5W2ktMV0ucG9zLnggLSBiLnBvcy54IDwgLTIgKiBCT05FX1NJWkUpIC8vIGhlYWQgbGVmdCB0byB0aGUgbGVmdCBTSURFXG4gICAgICAgICAgcHJlX3Bvc194ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnggKyBXT1JMRF9XSURUSFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBwcmVfcG9zX3ggPSB0aGlzLmJvZHlbaS0xXS5wb3MueFxuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuYm9keVtpLTFdLnBvcy55IC0gYi5wb3MueSA+IDIgKiBCT05FX1NJWkUpIC8vIEhFQUQgTEVGVCBUTyBUSEUgZG93biBTSURFXG4gICAgICAgICAgcHJlX3Bvc195ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnkgLSBXT1JMRF9IRUlHSFRcbiAgICAgICAgZWxzZSBpZih0aGlzLmJvZHlbaS0xXS5wb3MueSAtIGIucG9zLnkgPCAtMiAqIEJPTkVfU0laRSkgLy8gaGVhZCBsZWZ0IHRvIHRoZSB1cCBTSURFXG4gICAgICAgICAgcHJlX3Bvc195ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnkgKyBXT1JMRF9IRUlHSFRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcHJlX3Bvc195ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnlcbiAgICAgICAgfVxuICAgICAgICBsZXQgZHggPSBwcmVfcG9zX3ggLSBiLnBvcy54O1xuICAgICAgICBsZXQgZHkgPSBwcmVfcG9zX3kgLSBiLnBvcy55O1xuICAgICAgICBiLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoZHksIGR4KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgIGIucG9zLnggPSAoV09STERfV0lEVEggKyB0aGlzLmJvZHlbaS0xXS5wb3MueCAtIEJPTkVfU0laRSAqIE1hdGguY29zKGIuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MCkpICUgV09STERfV0lEVEhcbiAgICAgICAgYi5wb3MueSA9IChXT1JMRF9IRUlHSFQgKyB0aGlzLmJvZHlbaS0xXS5wb3MueSAtIEJPTkVfU0laRSAqIE1hdGguc2luKGIuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MCkpICUgV09STERfSEVJR0hUXG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBiLm1vdmVGb3J3YXJkKClcbiAgICAgIH1cblxuICAgIH0sIHRoaXMpXG4gIH1cbiAgZ3Jvdygpe1xuICAgIGxldCBsYXN0X2JvZHlfcGFydCA9IHRoaXMuYm9keS5zbGljZSgtMSkucG9wKClcbiAgICBsZXQgcG9zX3ggPSBsYXN0X2JvZHlfcGFydC5wb3MueCAtIEJPTkVfU0laRSAqIE1hdGguY29zKGxhc3RfYm9keV9wYXJ0LmRpcmVjdGlvbiAqIE1hdGguUEkgLyAxODApXG4gICAgbGV0IHBvc195ID0gbGFzdF9ib2R5X3BhcnQucG9zLnkgLSBCT05FX1NJWkUgKiBNYXRoLnNpbihsYXN0X2JvZHlfcGFydC5kaXJlY3Rpb24gKiBNYXRoLlBJIC8gMTgwKVxuICAgIHRoaXMuYm9keS5wdXNoKG5ldyBCb2R5UGFydCh7eDogcG9zX3gsIHk6IHBvc195fSwgbGFzdF9ib2R5X3BhcnQuZGlyZWN0aW9uKSlcbiAgICBjb25zb2xlLmxvZyhcIkFURSFcIilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBTbmFrZTogU25ha2UsXG4gICAgQm9keVBhcnQ6IEJvZHlQYXJ0XG59O1xuIl19
