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
        s.spendLife()
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
	    // this.renderSensors(s)
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
    this.renderSize(game.snakes[0].score)
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

},{"./neural/neuralNet":5,"./sensor":8}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbmdpbmUuanMiLCJmb29kLmpzIiwiZ2FtZS5qcyIsIm5ldXJhbC9sYXllci5qcyIsIm5ldXJhbC9uZXVyYWxOZXQuanMiLCJuZXVyYWwvbmV1cm9uLmpzIiwicmVuZGVyZXIuanMiLCJzZW5zb3IuanMiLCJzbmFrZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGcgPSByZXF1aXJlKCcuL2dhbWUnKVxudmFyIHIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJylcblxuUkVOREVSX0ZSRVEgPSAyMDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuXHR2YXIgcmVuZGVyZXIgPSBuZXcgci5SZW5kZXJlcihjYW52YXMpO1xuICB2YXIgZ2FtZSA9IG5ldyBnLkdhbWUoKTtcbiAgc2V0RXZlbnRzKGdhbWUpO1xuICBnYW1lLmluaXRpYWxpemUoKTtcbiAgd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdHJlbmRlcmVyLnJlbmRlckdhbWUoZ2FtZSk7XG5cdH0sIFJFTkRFUl9GUkVRKTtcblxuICBnYW1lLnN0YXJ0KClcbn1cblxuZnVuY3Rpb24gc2V0RXZlbnRzKGcpIHtcbiAgZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICBpZiAoZS5rZXlDb2RlID09ICczNycpIHtcbiAgICAgICAvLyBsZWZ0IGFycm93XG4gICAgICAgZy5wcmVzc0xlZnQodHJ1ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICAgICBnLnByZXNzUmlnaHQodHJ1ZSk7XG4gICAgfVxuICB9XG4gIGRvY3VtZW50Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIGlmIChlLmtleUNvZGUgPT0gJzM3Jykge1xuICAgICAgIC8vIGxlZnQgYXJyb3dcbiAgICAgICBnLnByZXNzTGVmdChmYWxzZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICAgICBnLnByZXNzUmlnaHQoZmFsc2UpO1xuICAgIH1cbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sZWZ0XCIpLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBnLnByZXNzTGVmdCh0cnVlKTtcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sZWZ0XCIpLm9udG91Y2hlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZy5wcmVzc0xlZnQoZmFsc2UpO1xuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXJpZ2h0XCIpLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGcucHJlc3NSaWdodCh0cnVlKTtcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1yaWdodFwiKS5vbnRvdWNoZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgZy5wcmVzc1JpZ2h0KGZhbHNlKTtcbiAgfVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdGluaXQoKTtcbn1cbiIsIkZPT0RfSU5JVElBTF9MSUZFID0gMTBcblxuY2xhc3MgRm9vZCB7XG4gIGNvbnN0cnVjdG9yKHBvcywgbGlmZSl7XG4gICAgdGhpcy5wb3MgPSB7eDogcG9zLngsIHk6IHBvcy55fVxuICAgIHRoaXMubGlmZSA9IGxpZmU7XG4gIH1cblxuICBkZWNyZWFzZUxpZmVUaW1lKHRpbWUpIHtcbiAgICB0aGlzLmxpZmUgLT0gdGltZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBGb29kOiBGb29kXG59O1xuIiwidmFyIHNuYWtlID0gcmVxdWlyZSgnLi9zbmFrZScpXG52YXIgZiA9IHJlcXVpcmUoJy4vZm9vZCcpXG5cbmR0ID0gMjAgLy8gbWlsbGlzZWNvbmRzIChyZW5kZXJpbmcgZnJlcS4pXG5TSU1VTFRBTkVVU19GT09EID0gNVxuTU9VVEhfU0laRSA9IDIwXG5XQUxMX1RISUNLTkVTUyA9IDIwXG5QT1BVTEFUSU9OX1NJWkUgPSA1MVxuXG5jbGFzcyBHYW1lIHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLnNuYWtlcyA9IFtdO1xuICAgIHRoaXMuZm9vZCA9IFtdO1xuICAgIHRoaXMuY29udHJvbHMgPSB7bGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZX1cbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zbmFrZXMgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgUE9QVUxBVElPTl9TSVpFOyBpKyspIHtcbiAgICAgIGxldCBzID0gbmV3IHNuYWtlLlNuYWtlKHt4OiAxMDAsIHk6IDUwfSwgMClcbiAgICAgIHMubW91bnRTZW5zb3JzKClcbiAgICAgIHMuaW5pdEJyYWluKClcbiAgICAgIHRoaXMuc25ha2VzLnB1c2gocylcbiAgICB9XG4gIH1cblxuLy8gVE9ETzogUkVGQUNUT1IgUkVTVEFSVFxuICByZXN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBzcGF3bkZvb2QoKXtcbiAgICBsZXQgcmFuZF94ID0gMiAqIFdBTExfVEhJQ0tORVNTICsgcGFyc2VJbnQoKFdPUkxEX1dJRFRIIC0gNCAqIFdBTExfVEhJQ0tORVNTKSAqIE1hdGgucmFuZG9tKCkpXG4gICAgbGV0IHJhbmRfeSA9IDIgKiBXQUxMX1RISUNLTkVTUyArIHBhcnNlSW50KChXT1JMRF9IRUlHSFQgLSA0ICogV0FMTF9USElDS05FU1MpICogTWF0aC5yYW5kb20oKSlcbiAgICB0aGlzLmZvb2QucHVzaChuZXcgZi5Gb29kKHt4OiByYW5kX3gsIHk6IHJhbmRfeX0sIDEwKSlcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHZhciBvdGhpcyA9IHRoaXM7XG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBvdGhpcy5nYW1lTG9vcChvdGhpcylcbiAgICB9LCBkdClcbiAgfVxuXG4gIGdhbWVMb29wKG90aGlzKSB7XG4gICAgbGV0IHNuYWtlc19hbGl2ZSA9IGZhbHNlXG4gICAgb3RoaXMuc25ha2VzLmZvckVhY2goZnVuY3Rpb24ocywgaSkge1xuICAgICAgc25ha2VzX2FsaXZlID0gcy5pc0FsaXZlIHx8IHNuYWtlc19hbGl2ZVxuICAgICAgaWYocy5pc0FsaXZlKXtcbiAgICAgICAgb3RoaXMuY2hlY2tXYWxscyhzKVxuICAgICAgICBvdGhpcy5jaGVja1NlbGYocylcblxuICAgICAgICBvdGhpcy5mb29kLmZvckVhY2goZnVuY3Rpb24oZiwgaikge1xuICAgICAgICAgIGlmIChvdGhpcy5fZGlzdGFuY2Uocy5oZWFkLnBvcywgZi5wb3MpIDwgTU9VVEhfU0laRSkge1xuICAgICAgICAgICAgb3RoaXMuZm9vZC5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICBzLmdyb3coKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGlmKGk9PTApe1xuICAgICAgICAgIHMudHVybihvdGhpcy5jb250cm9scy5yaWdodCwgb3RoaXMuY29udHJvbHMubGVmdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICBzLnR1cm4ocy5icmFpbi5vdXRwdXRbMV0gPiAwLjQsIHMuYnJhaW4ub3V0cHV0WzBdID4gMC40KVxuICAgICAgICB9XG4gICAgICAgIHMuc2NhbldvcmxkKHtmb29kOiBvdGhpcy5mb29kLCBzbmFrZTogc30pXG4gICAgICAgIHMubW92ZUZvcndhcmQoKTtcbiAgICAgICAgcy5zcGVuZExpZmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYoIXNuYWtlc19hbGl2ZSl7XG4gICAgICBvdGhpcy5yZXN0YXJ0KClcbiAgICB9XG4gICAgLy8gRm9vZCBsb29wOlxuICAgIG90aGlzLmZvb2QuZm9yRWFjaChmdW5jdGlvbihmLCBpKSB7XG4gICAgICBmLmRlY3JlYXNlTGlmZVRpbWUoZHQgLyAxMDAwKVxuICAgICAgaWYgKGYubGlmZSA8IDApe1xuICAgICAgICBvdGhpcy5mb29kLnNwbGljZShpLCAxKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB3aGlsZShvdGhpcy5mb29kLmxlbmd0aCA8IFNJTVVMVEFORVVTX0ZPT0Qpe1xuICAgICAgb3RoaXMuc3Bhd25Gb29kKClcbiAgICB9XG4gIH1cblxuICBjaGVja1dhbGxzKHMpIHtcbiAgICBpZiAocy5oZWFkLnBvcy54IDwgV0FMTF9USElDS05FU1MgLyAyIHx8IHMuaGVhZC5wb3MueCA+IFdPUkxEX1dJRFRIIC0gV0FMTF9USElDS05FU1MgLyAyKVxuICAgICAgcy5pc0FsaXZlID0gZmFsc2VcbiAgICBlbHNlIGlmIChzLmhlYWQucG9zLnkgPCBXQUxMX1RISUNLTkVTUyAvIDIgfHwgcy5oZWFkLnBvcy55ID4gV09STERfSEVJR0hUIC0gV0FMTF9USElDS05FU1MgLyAyKSB7XG4gICAgICBzLmlzQWxpdmUgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrU2VsZihzKSB7XG4gICAgcy5ib2R5LmZvckVhY2goZnVuY3Rpb24oYiwgaSl7XG4gICAgICBpZiAoaSA+IDIgJiYgdGhpcy5fZGlzdGFuY2Uocy5oZWFkLnBvcywgYi5wb3MpIDwgQk9ORV9TSVpFKVxuICAgICAgICBzLmlzQWxpdmUgPSBmYWxzZVxuICAgIH0sIHRoaXMpXG4gIH1cblxuICBwcmVzc1JpZ2h0KHByZXNzZWQpIHtcbiAgICB0aGlzLmNvbnRyb2xzLnJpZ2h0ID0gcHJlc3NlZDtcbiAgfVxuICBwcmVzc0xlZnQocHJlc3NlZCkge1xuICAgIHRoaXMuY29udHJvbHMubGVmdCA9IHByZXNzZWQ7XG4gIH1cblxuICBfZGlzdGFuY2UocDEsIHAyKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEdhbWU6IEdhbWVcbn1cbiIsInZhciBuZXVyb24gPSByZXF1aXJlKCcuL25ldXJvbicpXG5cbmNsYXNzIExheWVyIHtcbiAgY29uc3RydWN0b3Ioa2luZCl7XG4gICAgdGhpcy5raW5kID0ga2luZFxuICAgIHRoaXMubmV1cm9ucyA9IFtdXG4gIH1cblxuICBhZGROZXVyb25zKG4pe1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICB0aGlzLm5ldXJvbnMucHVzaChuZXcgbmV1cm9uLk5ldXJvbigpLnNldEtpbmQodGhpcy5raW5kKSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRJbnB1dCh4KSB7XG4gICAgdGhpcy5uZXVyb25zLnB1c2gobmV3IG5ldXJvbi5OZXVyb24oKS5zZXRLaW5kKFRZUEVfSU5QVVQpLnNldE91dHB1dCh4KSlcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldElucHV0KGksIHgpIHtcbiAgICB0aGlzLm5ldXJvbnNbaV0uc2V0T3V0cHV0KHgpXG4gIH1cblxuICBjb25uZWN0KHByZXZfbGF5ZXIsIGNvbm5lY3Rpb24pIHtcbiAgICBpZiAoY29ubmVjdGlvbiA9PT0gQ09OTl9GVUxMWV9DT05ORUNURUQpe1xuICAgICAgdGhpcy5uZXVyb25zLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICAgIHByZXZfbGF5ZXIubmV1cm9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBuLCBqKSB7XG4gICAgICAgICAgbi5hZGRJbnB1dChwbilcbiAgICAgICAgfSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmFuZG9taXplKGEpIHtcbiAgICBpZih0aGlzLmtpbmQgIT0gVFlQRV9JTlBVVCl7XG4gICAgICB0aGlzLm5ldXJvbnMuZm9yRWFjaChmdW5jdGlvbihuLCBpKXtcbiAgICAgICAgbi5yYW5kb21pemUoYSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5uZXVyb25zLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICBuLmFjdGl2YXRlKClcbiAgICB9KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIExheWVyOiBMYXllclxufVxuIiwidmFyIGwgPSByZXF1aXJlKCcuL2xheWVyJylcblxuQ09OTl9GVUxMWV9DT05ORUNURUQgPSAwXG5BRl9TSUdNT0lEID0gMFxuQUZfUkVMVSA9IDFcbkFGX1RBTkggPSAyXG5cblRZUEVfSU5QVVQgPSAwXG5UWVBFX0hJRERFTiA9IDFcblRZUEVfT1VUUFVUID0gMlxuXG5jbGFzcyBOZXVyYWxOZXQge1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuaW5wdXRMYXllciA9IG5ldyBsLkxheWVyKFRZUEVfSU5QVVQpXG4gICAgdGhpcy5oaWRkZW5MYXllcnMgPSBbXVxuICAgIHRoaXMub3V0cHV0TGF5ZXIgPSBudWxsXG4gICAgdGhpcy5vdXRwdXQgPSBudWxsXG4gIH1cblxuICBhZGRJbnB1dCh4KSB7XG4gICAgdGhpcy5pbnB1dExheWVyLmFkZElucHV0KHgpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRJbnB1dChpLCB4KXtcbiAgICB0aGlzLmlucHV0TGF5ZXIuc2V0SW5wdXQoaSwgeClcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZEhpZGRlbkxheWVyKG4pIHtcbiAgICAvL2NvbnNvbGUubG9nKG4pXG4gICAgbGV0IGhsID0gbmV3IGwuTGF5ZXIoVFlQRV9ISURERU4pXG4gICAgaGwuYWRkTmV1cm9ucyhuKVxuICAgIC8vY29uc29sZS5sb2coaGwpXG4gICAgdGhpcy5oaWRkZW5MYXllcnMucHVzaChobClcbiAgICBpZiAodGhpcy5oaWRkZW5MYXllcnMubGVuZ3RoID09IDEpe1xuICAgICAgdGhpcy5oaWRkZW5MYXllcnNbMF0uY29ubmVjdCh0aGlzLmlucHV0TGF5ZXIsIENPTk5fRlVMTFlfQ09OTkVDVEVEKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuaGlkZGVuTGF5ZXJzW3RoaXMuaGlkZGVuTGF5ZXJzLmxlbmd0aCAtIDFdLmNvbm5lY3QodGhpcy5oaWRkZW5MYXllcnNbdGhpcy5oaWRkZW5MYXllcnMubGVuZ3RoIC0gMl0sIENPTk5fRlVMTFlfQ09OTkVDVEVEKVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKGhsKVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkT3V0cHV0TGF5ZXIobikge1xuICAgIHRoaXMub3V0cHV0TGF5ZXIgPSBuZXcgbC5MYXllcihUWVBFX09VVFBVVCkuYWRkTmV1cm9ucyhuKVxuICAgIGlmICh0aGlzLmhpZGRlbkxheWVycy5sZW5ndGggPT0gMCl7XG4gICAgICB0aGlzLm91dHB1dExheWVyLmNvbm5lY3QodGhpcy5pbnB1dExheWVyLCBDT05OX0ZVTExZX0NPTk5FQ1RFRClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm91dHB1dExheWVyLmNvbm5lY3QodGhpcy5oaWRkZW5MYXllcnNbdGhpcy5oaWRkZW5MYXllcnMubGVuZ3RoIC0gMV0sIENPTk5fRlVMTFlfQ09OTkVDVEVEKVxuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIHRoaXMub3V0cHV0LnB1c2goMClcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm91dHB1dExheWVyKVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmFuZG9taXplKGEpIHtcbiAgICB0aGlzLmhpZGRlbkxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKGxheWVyLCBpKXtcbiAgICAgIGxheWVyLnJhbmRvbWl6ZShhKVxuICAgIH0pXG4gICAgdGhpcy5vdXRwdXRMYXllci5yYW5kb21pemUoYSlcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuaGlkZGVuTGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obGF5ZXIsIGkpIHtcbiAgICAgIGxheWVyLmFjdGl2YXRlKClcbiAgICB9KVxuICAgIHRoaXMub3V0cHV0TGF5ZXIuYWN0aXZhdGUoKVxuICAgIHRoaXMub3V0cHV0TGF5ZXIubmV1cm9ucy5mb3JFYWNoKGZ1bmN0aW9uKG5ldXJvbiwgaSl7XG4gICAgICB0aGlzLm91dHB1dFtpXSA9IG5ldXJvbi5vdXRwdXRcbiAgICB9LCB0aGlzKVxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE5ldXJhbE5ldDogTmV1cmFsTmV0XG59O1xuIiwiY2xhc3MgTmV1cm9uIHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLmtpbmQgPSBUWVBFX0lOUFVUXG4gICAgdGhpcy5iaWFzID0gMFxuICAgIHRoaXMuYWN0aXZfZiA9IEFGX1NJR01PSURcbiAgICB0aGlzLndlaWdodHMgPSBbXVxuICAgIHRoaXMuaW5wdXRzID0gW11cbiAgICB0aGlzLm91dHB1dCA9IDBcbiAgfVxuXG4gIHNldE91dHB1dCh5KXtcbiAgICB0aGlzLm91dHB1dCA9IHlcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEtpbmQoayl7XG4gICAgdGhpcy5raW5kID0ga1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhY3RpdmF0ZSgpe1xuICAgIGlmICh0aGlzLmtpbmQgPT09IFRZUEVfSU5QVVQpe1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGxldCBwcmVfb3V0cHV0ID0gdGhpcy5iaWFzXG4gICAgdGhpcy53ZWlnaHRzLmZvckVhY2goZnVuY3Rpb24odywgaSl7XG4gICAgICBwcmVfb3V0cHV0ICs9IHRoaXMuaW5wdXRzW2ldLm91dHB1dCAqIHdcbiAgICB9LCB0aGlzKVxuICAgIHRoaXMub3V0cHV0ID0gTmV1cm9uLnNpZ21vaWQocHJlX291dHB1dClcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN0YXRpYyBzaWdtb2lkKHgpe1xuICAgIHJldHVybiAxIC8gKDEgKyBNYXRoLmV4cCgteCkpXG4gIH1cblxuICBhZGRJbnB1dChuZXVyb24pe1xuICAgIHRoaXMuaW5wdXRzLnB1c2gobmV1cm9uKVxuICAgIHRoaXMud2VpZ2h0cy5wdXNoKDEpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByYW5kb21pemUoYSl7XG4gICAgaWYodGhpcy5raW5kICE9IFRZUEVfSU5QVVQpe1xuICAgICAgdGhpcy53ZWlnaHRzLmZvckVhY2goZnVuY3Rpb24odyxpKXtcbiAgICAgICAgdGhpcy53ZWlnaHRzW2ldID0gLWEgKyAyICogYSAqIE1hdGgucmFuZG9tKClcbiAgICAgIH0sIHRoaXMpXG5cbiAgICAgIHRoaXMuYmlhcyA9IC1hICsgMiAqIGEgKiBNYXRoLnJhbmRvbSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE5ldXJvbjogTmV1cm9uXG59XG4iLCJQTEFZRVIgPSAwXG5CT1QgPSAxXG5cbmNsYXNzIFJlbmRlcmVyIHtcblx0Y29uc3RydWN0b3IoY2FudmFzKSB7XG5cdFx0dGhpcy5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHR0aGlzLmNlbnRlciA9IGNhbnZhcy53aWR0aCAvIDI7XG5cdH1cblxuICByZW5kZXJDaXJjbGUocCwgZmlsbENvbG9yLCBzdHJva2VDb2xvciwgcmFkaXVzLCBsaW5lV2lkdGgpIHtcblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XG5cdFx0dGhpcy5jdHguYmVnaW5QYXRoKCk7XG5cdFx0dGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VDb2xvcjtcblx0XHR0aGlzLmN0eC5hcmMocC54LCBwLnksIHJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcblx0XHR0aGlzLmN0eC5maWxsKCk7XG5cdFx0dGhpcy5jdHgubGluZVdpZHRoID0gbGluZVdpZHRoO1xuXHRcdHRoaXMuY3R4LnN0cm9rZSgpO1xuXHR9XG4gIHJlbmRlckFyYyhwLCBmaWxsQ29sb3IsIHN0cm9rZUNvbG9yLCByYWRpdXMsIGxpbmVXaWR0aCwgc3RhcnRfYWxwaGEsIGVuZF9hbHBoYSwgY2xvY2t3aXNlKSB7XG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xuXHRcdHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlQ29sb3I7XG5cdFx0dGhpcy5jdHgubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIC8vIHRoaXMuY3R4Lm1vdmVUbyhwLngscC55KTtcblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcblx0XHR0aGlzLmN0eC5hcmMocC54LCBwLnksIHJhZGl1cywgc3RhcnRfYWxwaGEsIGVuZF9hbHBoYSwgY2xvY2t3aXNlKTtcbiAgICB0aGlzLmN0eC5saW5lVG8ocC54LHAueSk7XG5cdFx0dGhpcy5jdHguZmlsbCgpO1xuXHRcdHRoaXMuY3R4LnN0cm9rZSgpO1xuXHR9XG4gIHJlbmRlclJlY3RhbmdsZShzdGFydCwgZW5kLCBmaWxsQ29sb3IsIHN0cm9rZUNvbG9yLCBsaW5lV2lkdGgpIHtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eC5yZWN0KHN0YXJ0LngsIHN0YXJ0LnksIGVuZC54IC0gc3RhcnQueCwgZW5kLnkgLSBzdGFydC55KTtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XG4gICAgdGhpcy5jdHguZmlsbCgpO1xuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZUNvbG9yO1xuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICB9XG4gIHJlbmRlclNpemUoc2l6ZSkge1xuICAgIHRoaXMuY3R4LmZvbnQ9XCIzMDBweCBWZXJkYW5hXCI7XG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC41KSc7XG4gICAgdGhpcy5jdHguZmlsbFRleHQoc2l6ZSwgV09STERfV0lEVEggLyAyLCBXT1JMRF9IRUlHSFQgLyAyICsgMTAwKTtcbiAgfVxuICBjbGVhckNhbnZhcygpIHtcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jdHguY2FudmFzLmNsaWVudFdpZHRoLCB0aGlzLmN0eC5jYW52YXMuY2xpZW50SGVpZ2h0KTtcblx0fVxuICByZW5kZXJTbmFrZShzLCBjb250cm9sbGVyKSB7XG5cdFx0aWYoY29udHJvbGxlciA9PSBQTEFZRVIpe1xuXHQgICAgdGhpcy5yZW5kZXJTZW5zb3JzKHMpXG5cdCAgICBzLmJvZHkuZm9yRWFjaChmdW5jdGlvbihiLCBpKXtcblx0ICAgICAgaWYoaT09PTApe1xuXHQgICAgICAgIHRoaXMucmVuZGVyQ2lyY2xlKGIucG9zLCAnYXF1YScsICdibGFjaycsIDEyLCA1KVxuXHQgICAgICB9XG5cdCAgICAgIGVsc2Uge1xuXHQgICAgICAgIHRoaXMucmVuZGVyQ2lyY2xlKGIucG9zLCAnYmx1ZScsICdibGFjaycsIDEwLCA1KVxuXHQgICAgICB9XG5cdCAgICB9LCB0aGlzKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0ICAgIC8vIHRoaXMucmVuZGVyU2Vuc29ycyhzKVxuXHRcdFx0cy5ib2R5LmZvckVhY2goZnVuY3Rpb24oYiwgaSl7XG5cdCAgICAgIGlmKGk9PT0wKXtcblx0ICAgICAgICB0aGlzLnJlbmRlckNpcmNsZShiLnBvcywgJ3JnYmEoMjAwLDI1MCwyNTAsMC4zKScsICdyZ2JhKDUwLDUwLDUwLDAuMyknLCAxMiwgNSlcblx0ICAgICAgfVxuXHQgICAgICBlbHNlIHtcblx0ICAgICAgICB0aGlzLnJlbmRlckNpcmNsZShiLnBvcywgJ3JnYmEoMjAwLDIwMCwyNTAsMC4zKScsICdyZ2JhKDUwLDUwLDUwLDAuMyknLCAxMCwgNSlcblx0ICAgICAgfVxuXHQgICAgfSwgdGhpcylcblx0XHR9XG4gIH1cblx0cmVuZGVyU2Vuc29ycyhzKSB7XG5cdFx0bGV0IHN0YXJ0X2FscGhhID0gKHMuZGlyZWN0aW9uIC0gU05BS0VfVklTSU9OIC8gMikgKiBNYXRoLlBJIC8gMTgwXG5cdFx0bGV0IGVuZF9hbHBoYSA9IChzLmRpcmVjdGlvbiArIFNOQUtFX1ZJU0lPTiAvIDIpICogTWF0aC5QSSAvIDE4MFxuXHRcdHZhciBncmQ9dGhpcy5jdHguY3JlYXRlUmFkaWFsR3JhZGllbnQocy5oZWFkLnBvcy54LCBzLmhlYWQucG9zLnksIDUsIHMuaGVhZC5wb3MueCwgcy5oZWFkLnBvcy55LCAxMDApO1xuXHRcdGdyZC5hZGRDb2xvclN0b3AoMCxcInJnYmEoMjAwLDUwLDUwLDAuMylcIik7XG5cdFx0Z3JkLmFkZENvbG9yU3RvcCgxLFwicmdiYSgyMDAsNTAsNTAsMClcIik7XG5cblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBncmQ7XG5cdFx0dGhpcy5jdHguYmVnaW5QYXRoKCk7XG5cdFx0dGhpcy5jdHguYXJjKHMuaGVhZC5wb3MueCwgcy5oZWFkLnBvcy55LCAxMDAsIHN0YXJ0X2FscGhhLCBlbmRfYWxwaGEsIGZhbHNlKTtcblx0XHR0aGlzLmN0eC5saW5lVG8ocy5oZWFkLnBvcy54LCBzLmhlYWQucG9zLnkpO1xuXHRcdHRoaXMuY3R4LmZpbGwoKTtcblxuXHRcdHMuc2Vuc29yc1tcImZvb2RcIl0uZm9yRWFjaChmdW5jdGlvbihzZW5zb3IsIGkpIHtcbiAgICAgIHRoaXMucmVuZGVyU2Vuc29yKHMsIHNlbnNvciwgJ3JnYmEoMjAwLDI1MCwyNTAsMC42KScpXG4gICAgfSwgdGhpcylcblx0XHRzLnNlbnNvcnNbXCJ3YWxsXCJdLmZvckVhY2goZnVuY3Rpb24oc2Vuc29yLCBpKSB7XG4gICAgICB0aGlzLnJlbmRlclNlbnNvcihzLCBzZW5zb3IsICdyZ2JhKDI1MCwyMDAsMjUwLDAuNiknKVxuICAgIH0sIHRoaXMpXG5cdFx0cy5zZW5zb3JzW1wic2VsZlwiXS5mb3JFYWNoKGZ1bmN0aW9uKHNlbnNvciwgaSkge1xuICAgICAgdGhpcy5yZW5kZXJTZW5zb3Iocywgc2Vuc29yLCAncmdiYSgyNTAsMjUwLDIwMCwwLjYpJylcbiAgICB9LCB0aGlzKVxuXHR9XG4gIHJlbmRlckZvb2QoZikge1xuICAgIHRoaXMucmVuZGVyRm9vZExpZmUoZilcbiAgICB0aGlzLnJlbmRlckNpcmNsZShmLnBvcywgJ3JlZCcsICdyZWQnLCA2LCAxKVxuICB9XG4gIHJlbmRlckZvb2RMaWZlKGYpIHtcbiAgICB0aGlzLnJlbmRlckFyYyhmLnBvcywgJ3JnYmEoMjAwLDUwLDUwLDEpJywgJ3JnYmEoMjAwLDUwLDUwLDEpJywgMTAsIDEsIC1NYXRoLlBJLzE4MCAqIDkwLCAtTWF0aC5QSS8xODAgKiA5MCAtIDIgKiBNYXRoLlBJIC8gRk9PRF9JTklUSUFMX0xJRkUgKiBmLmxpZmUsIHRydWUpXG4gIH1cbiAgcmVuZGVyV2FsbCgpIHtcbiAgICB0aGlzLnJlbmRlclJlY3RhbmdsZSh7eDogMCwgeTogMH0sIHt4OiBXQUxMX1RISUNLTkVTUywgeTogV09STERfSEVJR0hUfSwgJ2JsYWNrJywgJ2JsYWNrJywgMSlcbiAgICB0aGlzLnJlbmRlclJlY3RhbmdsZSh7eDogV09STERfV0lEVEggLSBXQUxMX1RISUNLTkVTUywgeTogMH0sIHt4OiBXT1JMRF9XSURUSCwgeTogV09STERfSEVJR0hUfSwgJ2JsYWNrJywgJ2JsYWNrJywgMSlcbiAgICB0aGlzLnJlbmRlclJlY3RhbmdsZSh7eDogMCwgeTogMH0sIHt4OiBXT1JMRF9XSURUSCwgeTogV0FMTF9USElDS05FU1N9LCAnYmxhY2snLCAnYmxhY2snLCAxKVxuICAgIHRoaXMucmVuZGVyUmVjdGFuZ2xlKHt4OiAwLCB5OiBXT1JMRF9IRUlHSFQgLSBXQUxMX1RISUNLTkVTU30sIHt4OiBXT1JMRF9XSURUSCwgeTogV09STERfSEVJR0hUfSwgJ2JsYWNrJywgJ2JsYWNrJywgMSlcbiAgfVxuICByZW5kZXJTZW5zb3Ioc25ha2UsIHNlbnNvciwgY29sb3IpIHtcbiAgICBsZXQgc3RhcnRfYWxwaGEgPSAoc2Vuc29yLmdldERpcmVjdGlvbigpIC0gc2Vuc29yLnZpc2lvbiAvIDIpICogTWF0aC5QSSAvIDE4MFxuICAgIGxldCBlbmRfYWxwaGEgPSAoc2Vuc29yLmdldERpcmVjdGlvbigpICsgc2Vuc29yLnZpc2lvbiAvIDIpICogTWF0aC5QSSAvIDE4MFxuXG4gICAgdGhpcy5yZW5kZXJBcmMoc2Vuc29yLm1vdW50UG9pbnQsIGNvbG9yLCBjb2xvciwgMTAwICogc2Vuc29yLmV4Y2l0ZW1lbnQsIDEsIHN0YXJ0X2FscGhhLCBlbmRfYWxwaGEsIGZhbHNlKVxuICB9XG5cdHJlbmRlckdhbWUoZ2FtZSkge1xuICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICB0aGlzLnJlbmRlclNpemUoZ2FtZS5zbmFrZXNbMF0uc2NvcmUpXG4gICAgZ2FtZS5zbmFrZXMuZm9yRWFjaChmdW5jdGlvbihzLCBpKXtcblx0XHRcdGlmKHMuaXNBbGl2ZSl7XG5cdFx0XHRcdGlmIChpID09PSAwKXtcblx0XHRcdFx0XHR0aGlzLnJlbmRlclNuYWtlKHMsIFBMQVlFUilcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0ICAgICAgXHR0aGlzLnJlbmRlclNuYWtlKHMsIEJPVClcblx0XHRcdFx0fVxuXHRcdFx0fVxuICAgIH0sIHRoaXMpO1xuICAgIGdhbWUuZm9vZC5mb3JFYWNoKGZ1bmN0aW9uKGYsIGkpe1xuICAgICAgdGhpcy5yZW5kZXJGb29kKGYpO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMucmVuZGVyV2FsbCgpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRSZW5kZXJlcjogUmVuZGVyZXJcbn1cbiIsIktJTkRfRk9PRCA9IDBcbktJTkRfV0FMTCA9IDFcbktJTkRfU0VMRiA9IDJcblxuY2xhc3MgU2Vuc29yIHtcbiAgY29uc3RydWN0b3IgKHBhcnQsIGRpcmVjdGlvbiwga2luZCwgdmlzaW9uKSB7XG4gICAgdGhpcy5raW5kID0ga2luZDtcbiAgICB0aGlzLmluaV9kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBwYXJ0LmRpcmVjdGlvbiArIGRpcmVjdGlvblxuICAgIHRoaXMuZXhjaXRlbWVudCA9IDA7XG4gICAgdGhpcy52aXNpb24gPSB2aXNpb247XG4gICAgdGhpcy5tb3VudFBvaW50ID0gcGFydC5wb3M7XG4gICAgdGhpcy5tb3VudCA9IHBhcnQ7XG4gIH1cblxuICBzZXREaXJlY3Rpb24oZCkge1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZFxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0RGlyZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbjtcbiAgfVxuXG4gIGdldFZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLmV4Y2l0ZW1lbnQ7XG4gIH1cblxuICBzZXRNb3VudFBvaW50KHBvaW50KSB7XG4gICAgdGhpcy5tb3VudFBvaW50ID0ge3g6IHBvaW50LngsIHk6IHBvaW50Lnl9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNjYW4od29ybGQpIHtcbiAgICB0aGlzLmV4Y2l0ZW1lbnQgPSAwXG5cbiAgICAvLyBGT09EXG4gICAgaWYgKHRoaXMua2luZCA9PSBLSU5EX0ZPT0Qpe1xuICAgICAgd29ybGQuZm9vZC5mb3JFYWNoKGZ1bmN0aW9uKGYsIGkpe1xuICAgICAgICB0aGlzLl9jb21wdXRlVmFsdWVGb3JQb3MoZi5wb3MpO1xuICAgICAgfSwgdGhpcylcbiAgICB9XG5cbiAgICAvLyBXQUxMU1xuICAgIGlmICh0aGlzLmtpbmQgPT0gS0lORF9XQUxMKSB7XG4gICAgICBsZXQgZCA9IDIgKiAoV09STERfV0lEVEggKyBXT1JMRF9IRUlHSFQpXG4gICAgICBpZiAoMCA8IHRoaXMuZGlyZWN0aW9uICYmIHRoaXMuZGlyZWN0aW9uIDwgMTgwKXtcbiAgICAgICAgZCA9IE1hdGgubWluKGQsIHRoaXMuZ2V0RGlzdGFuY2VUb1dhbGwoXCJib3R0b21cIikpXG4gICAgICB9XG4gICAgICBpZiAoOTAgPCB0aGlzLmRpcmVjdGlvbiAmJiB0aGlzLmRpcmVjdGlvbiA8IDI3MCl7XG4gICAgICAgIGQgPSBNYXRoLm1pbihkLCB0aGlzLmdldERpc3RhbmNlVG9XYWxsKFwibGVmdFwiKSlcbiAgICAgIH1cbiAgICAgIGlmICgxODA8IHRoaXMuZGlyZWN0aW9uICYmIHRoaXMuZGlyZWN0aW9uIDwgMzYwKXtcbiAgICAgICAgZCA9IE1hdGgubWluKGQsIHRoaXMuZ2V0RGlzdGFuY2VUb1dhbGwoXCJ0b3BcIikpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPiAyNzAgfHwgdGhpcy5kaXJlY3Rpb24gPCA5MCl7XG4gICAgICAgIGQgPSBNYXRoLm1pbihkLCB0aGlzLmdldERpc3RhbmNlVG9XYWxsKFwicmlnaHRcIikpXG4gICAgICB9XG4gICAgICB0aGlzLmV4Y2l0ZW1lbnQgPSBNYXRoLmV4cCgtZCAvIDIwMClcbiAgICB9XG5cbiAgICAvLyBTRUxGIEJPRFlcbiAgICBpZiAodGhpcy5raW5kID09IEtJTkRfU0VMRikge1xuICAgICAgd29ybGQuc25ha2UuYm9keS5mb3JFYWNoKGZ1bmN0aW9uKGJwLCBpKXtcbiAgICAgICAgdGhpcy5fY29tcHV0ZVZhbHVlRm9yUG9zKGJwLnBvcyk7XG4gICAgICB9LCB0aGlzKVxuICAgIH1cblxuICB9XG5cbiAgZ2V0RGlzdGFuY2VUb1dhbGwod2FsbCkge1xuICAgIHN3aXRjaCAod2FsbCkge1xuICAgICAgY2FzZSBcImJvdHRvbVwiOlxuICAgICAgICByZXR1cm4gKFdPUkxEX0hFSUdIVCAtIHRoaXMubW91bnRQb2ludC55KSAvIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwidG9wXCI6XG4gICAgICAgIHJldHVybiAoMCAtIHRoaXMubW91bnRQb2ludC55KSAvIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgICByZXR1cm4gKDAgLSB0aGlzLm1vdW50UG9pbnQueCkgLyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbiAqIE1hdGguUEkgLyAxODApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInJpZ2h0XCI6XG4gICAgICAgIHJldHVybiAoV09STERfV0lEVEggLSB0aGlzLm1vdW50UG9pbnQueCkgLyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbiAqIE1hdGguUEkgLyAxODApXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgIH1cbiAgfVxuXG4gIF9jb21wdXRlVmFsdWVGb3JQb3MocG9zKSB7XG4gICAgaWYgKHRoaXMuX2lzT25TaWdodChwb3MpKSB7XG4gICAgICBsZXQgZXhjaXRlbWVudCA9IE1hdGguZXhwKC10aGlzLmRpc3RhbmNlKHBvcykgLyAyMDApXG4gICAgICAvLyB0aGlzLmV4Y2l0ZW1lbnQgKz0gZXhjaXRlbWVudFxuICAgICAgdGhpcy5leGNpdGVtZW50ID0gTWF0aC5tYXgoZXhjaXRlbWVudCwgdGhpcy5leGNpdGVtZW50KVxuICAgIH1cbiAgfVxuXG4gIF9pc09uU2lnaHQocG9zKSB7XG4gICAgbGV0IGR4ID0gcG9zLnggLSB0aGlzLm1vdW50UG9pbnQueDtcbiAgICBsZXQgZHkgPSBwb3MueSAtIHRoaXMubW91bnRQb2ludC55O1xuICAgIGlmKCBkeCA9PSAwICYmIGR5ID09IDApe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBsZXQgYWxwaGEgPSAoMzYwICsgTWF0aC5hdGFuMihkeSwgZHgpICogMTgwIC8gTWF0aC5QSSkgJSAzNjA7XG4gICAgbGV0IGFfc21hbGwgPSAoMzYwICsgKHRoaXMuZGlyZWN0aW9uIC0gdGhpcy52aXNpb24gLyAyKSkgJSAzNjA7XG4gICAgbGV0IGFfYmlnID0gKDM2MCArICh0aGlzLmRpcmVjdGlvbiArIHRoaXMudmlzaW9uIC8gMikpICUgMzYwO1xuICAgIGlmKGFfc21hbGwgPD0gYWxwaGEgJiYgYWxwaGEgPD0gYV9iaWcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChhX2JpZyA8IGFfc21hbGwpIHtcbiAgICAgIHJldHVybiBhbHBoYSA+PSBhX3NtYWxsIHx8IGFscGhhIDw9IGFfYmlnO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBkaXN0YW5jZShwb3MpIHtcbiAgICBsZXQgZHggPSBwb3MueCAtIHRoaXMubW91bnRQb2ludC54O1xuICAgIGxldCBkeSA9IHBvcy55IC0gdGhpcy5tb3VudFBvaW50Lnk7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhkeCwgMikgKyBNYXRoLnBvdyhkeSwgMikpXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBTZW5zb3I6IFNlbnNvclxufTtcbiIsInZhciBzID0gcmVxdWlyZSgnLi9zZW5zb3InKVxuXG52YXIgbmV0ID0gcmVxdWlyZSgnLi9uZXVyYWwvbmV1cmFsTmV0JylcblxuTlVNX1NFTlNPUlMgPSAxMlxuU05BS0VfVklTSU9OID0gMjQwXG5TTkFLRV9TRU5TT1JfT1ZFUkxBUCA9IDAuMDVcblNOQUtFX1NQRUVEID0gMjAwIC8vcHggcGVyIHNlY29uZFxuU1RFRVJJTkdfU1BFRUQgPSAzNjAgLy8gZGVncmVlcyBwZXIgc2Vjb25kXG5CT05FX1NJWkUgPSAyMFxuU05BS0VfTElGRSA9IDEwXG5cbldPUkxEX1dJRFRIPTYwMFxuV09STERfSEVJR0hUPTQwMFxuXG5cbmNsYXNzIEJvZHlQYXJ0e1xuICBjb25zdHJ1Y3Rvcihwb3MsIGRpcikge1xuICAgIHRoaXMucG9zID0ge3g6IHBvcy54LCB5OiBwb3MueX1cbiAgICB0aGlzLmRpcmVjdGlvbiA9IGRpclxuICB9XG5cbiAgbW92ZUZvcndhcmQoKSB7XG4gICAgdGhpcy5wb3MueCA9IChXT1JMRF9XSURUSCArIHRoaXMucG9zLnggKyBTTkFLRV9TUEVFRCAqIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MCkgKiAoZHQgLyAxMDAwKSkgJSBXT1JMRF9XSURUSDtcbiAgICB0aGlzLnBvcy55ID0gKFdPUkxEX0hFSUdIVCArIHRoaXMucG9zLnkgKyBTTkFLRV9TUEVFRCAqIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MCkgKiAoZHQgLyAxMDAwKSkgJSBXT1JMRF9IRUlHSFQ7XG5cbiAgfVxufVxuXG5cbmNsYXNzIFNuYWtlIHtcbiAgY29uc3RydWN0b3IocG9zLCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmhlYWQgPSBuZXcgQm9keVBhcnQoe3g6IHBvcy54LCB5OiBwb3MueX0sIGRpcmVjdGlvbik7XG4gICAgdGhpcy5icmFpbiA9IG5ldyBuZXQuTmV1cmFsTmV0KCk7XG4gICAgdGhpcy5zZW5zb3JzID0ge1wiZm9vZFwiOiBbXSwgXCJ3YWxsXCI6IFtdLCBcInNlbGZcIjogW119XG4gICAgdGhpcy5ib2R5ID0gW3RoaXMuaGVhZF1cbiAgICB0aGlzLnRhaWwgPSBudWxsXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgdGhpcy5pc0FsaXZlID0gdHJ1ZVxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5saWZlID0gU05BS0VfTElGRVxuICB9XG5cbiAgbW91bnRTZW5zb3JzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTlVNX1NFTlNPUlM7IGkrKykge1xuICAgICAgbGV0IHZpc2lvbiA9IChTTkFLRV9WSVNJT04gLyBOVU1fU0VOU09SUykgKiAoMSArIFNOQUtFX1NFTlNPUl9PVkVSTEFQKVxuICAgICAgbGV0IGRpciA9IC0gU05BS0VfVklTSU9OIC8gMiArIGkgKiBTTkFLRV9WSVNJT04gLyBOVU1fU0VOU09SUyArIHZpc2lvbiAvIDJcblxuICAgICAgdGhpcy5zZW5zb3JzW1wiZm9vZFwiXS5wdXNoKG5ldyBzLlNlbnNvcih0aGlzLmhlYWQsIGRpciwgS0lORF9GT09ELCB2aXNpb24pKVxuICAgICAgdGhpcy5zZW5zb3JzW1wid2FsbFwiXS5wdXNoKG5ldyBzLlNlbnNvcih0aGlzLmhlYWQsIGRpciwgS0lORF9XQUxMLCB2aXNpb24pKVxuICAgICAgdGhpcy5zZW5zb3JzW1wic2VsZlwiXS5wdXNoKG5ldyBzLlNlbnNvcih0aGlzLmhlYWQsIGRpciwgS0lORF9TRUxGLCB2aXNpb24pKVxuXG4gICAgICAvLyBUT0RPOiBtb3VudCBvdGhlciBzZW5zb3JzXG4gICAgfVxuICB9XG5cbiAgaW5pdEJyYWluKCl7XG4gICAgdGhpcy5zZW5zb3JzW1wiZm9vZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHMsIGkpe1xuICAgICAgdGhpcy5icmFpbi5hZGRJbnB1dChzLmV4Y2l0ZW1lbnQpXG4gICAgfSwgdGhpcylcbiAgICB0aGlzLnNlbnNvcnNbXCJ3YWxsXCJdLmZvckVhY2goZnVuY3Rpb24ocywgaSl7XG4gICAgICB0aGlzLmJyYWluLmFkZElucHV0KHMuZXhjaXRlbWVudClcbiAgICB9LCB0aGlzKVxuICAgIHRoaXMuc2Vuc29yc1tcInNlbGZcIl0uZm9yRWFjaChmdW5jdGlvbihzLCBpKXtcbiAgICAgIHRoaXMuYnJhaW4uYWRkSW5wdXQocy5leGNpdGVtZW50KVxuICAgIH0sIHRoaXMpXG5cbiAgICB0aGlzLmJyYWluLmFkZEhpZGRlbkxheWVyKDEwKVxuICAgIHRoaXMuYnJhaW4uYWRkSGlkZGVuTGF5ZXIoNSlcbiAgICB0aGlzLmJyYWluLmFkZE91dHB1dExheWVyKDIpXG4gICAgdGhpcy5icmFpbi5yYW5kb21pemUoMTApXG4gIH1cblxuICBzcGVuZExpZmUoKXtcbiAgICB0aGlzLmxpZmUgLT0gKGR0IC8gMTAwMClcbiAgICBpZih0aGlzLmxpZmUgPD0gMCl7XG4gICAgICB0aGlzLmlzQWxpdmUgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHNjYW5Xb3JsZCh3b3JsZCkge1xuICAgIHRoaXMuc2Vuc29yc1tcImZvb2RcIl0uZm9yRWFjaChmdW5jdGlvbiAocyxpKXtcbiAgICAgIHMuc2Nhbih3b3JsZClcbiAgICAgIHRoaXMuYnJhaW4uc2V0SW5wdXQoaSwgcy5leGNpdGVtZW50KVxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5zZW5zb3JzW1wid2FsbFwiXS5mb3JFYWNoKGZ1bmN0aW9uIChzLGkpe1xuICAgICAgcy5zY2FuKHdvcmxkKVxuICAgICAgdGhpcy5icmFpbi5zZXRJbnB1dChOVU1fU0VOU09SUyArIGksIHMuZXhjaXRlbWVudClcbiAgICB9LCB0aGlzKVxuICAgIHRoaXMuc2Vuc29yc1tcInNlbGZcIl0uZm9yRWFjaChmdW5jdGlvbiAocyxpKXtcbiAgICAgIHMuc2Nhbih3b3JsZClcbiAgICAgIHRoaXMuYnJhaW4uc2V0SW5wdXQoMiAqIE5VTV9TRU5TT1JTICsgaSwgcy5leGNpdGVtZW50KVxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5icmFpbi5hY3RpdmF0ZSgpXG4gIH1cblxuICB0dXJuKHJpZ2h0LCBsZWZ0KSB7XG4gICAgaWYgKHJpZ2h0ICYmICFsZWZ0KSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuaGVhZC5kaXJlY3Rpb24gPSAoMzYwICsgKHRoaXMuZGlyZWN0aW9uICsgKFNURUVSSU5HX1NQRUVEICogKGR0IC8gMTAwMCkpKSkgJSAzNjA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGxlZnQgJiYgIXJpZ2h0KSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuaGVhZC5kaXJlY3Rpb24gPSAoMzYwICsgKHRoaXMuZGlyZWN0aW9uIC0gKFNURUVSSU5HX1NQRUVEICogKGR0IC8gMTAwMCkpKSkgJSAzNjA7XG4gICAgfVxuICAgIHRoaXMuc2Vuc29yc1tcImZvb2RcIl0uZm9yRWFjaChmdW5jdGlvbihzLCBpKSB7XG4gICAgICBzLmRpcmVjdGlvbiA9ICgzNjAgKyAocy5pbmlfZGlyZWN0aW9uICsgdGhpcy5kaXJlY3Rpb24pKSAlIDM2MFxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5zZW5zb3JzW1wid2FsbFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHMsIGkpIHtcbiAgICAgIHMuZGlyZWN0aW9uID0gKDM2MCArIChzLmluaV9kaXJlY3Rpb24gKyB0aGlzLmRpcmVjdGlvbikpICUgMzYwXG4gICAgfSwgdGhpcylcbiAgICB0aGlzLnNlbnNvcnNbXCJzZWxmXCJdLmZvckVhY2goZnVuY3Rpb24ocywgaSkge1xuICAgICAgcy5kaXJlY3Rpb24gPSAoMzYwICsgKHMuaW5pX2RpcmVjdGlvbiArIHRoaXMuZGlyZWN0aW9uKSkgJSAzNjBcbiAgICB9LCB0aGlzKVxuICB9XG4gIG1vdmVGb3J3YXJkKCkge1xuICAgIHRoaXMuYm9keS5mb3JFYWNoKGZ1bmN0aW9uKGIsIGkpIHtcbiAgICAgIGlmKGkhPTApe1xuICAgICAgICBsZXQgcHJlX3Bvc194ID0gMFxuICAgICAgICBsZXQgcHJlX3Bvc195ID0gMFxuICAgICAgICBpZih0aGlzLmJvZHlbaS0xXS5wb3MueCAtIGIucG9zLnggPiAyICogQk9ORV9TSVpFKSAvLyBIRUFEIExFRlQgVE8gVEhFIFJJR0hUIFNJREVcbiAgICAgICAgICBwcmVfcG9zX3ggPSB0aGlzLmJvZHlbaS0xXS5wb3MueCAtIFdPUkxEX1dJRFRIXG4gICAgICAgIGVsc2UgaWYodGhpcy5ib2R5W2ktMV0ucG9zLnggLSBiLnBvcy54IDwgLTIgKiBCT05FX1NJWkUpIC8vIGhlYWQgbGVmdCB0byB0aGUgbGVmdCBTSURFXG4gICAgICAgICAgcHJlX3Bvc194ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnggKyBXT1JMRF9XSURUSFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBwcmVfcG9zX3ggPSB0aGlzLmJvZHlbaS0xXS5wb3MueFxuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuYm9keVtpLTFdLnBvcy55IC0gYi5wb3MueSA+IDIgKiBCT05FX1NJWkUpIC8vIEhFQUQgTEVGVCBUTyBUSEUgZG93biBTSURFXG4gICAgICAgICAgcHJlX3Bvc195ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnkgLSBXT1JMRF9IRUlHSFRcbiAgICAgICAgZWxzZSBpZih0aGlzLmJvZHlbaS0xXS5wb3MueSAtIGIucG9zLnkgPCAtMiAqIEJPTkVfU0laRSkgLy8gaGVhZCBsZWZ0IHRvIHRoZSB1cCBTSURFXG4gICAgICAgICAgcHJlX3Bvc195ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnkgKyBXT1JMRF9IRUlHSFRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcHJlX3Bvc195ID0gdGhpcy5ib2R5W2ktMV0ucG9zLnlcbiAgICAgICAgfVxuICAgICAgICBsZXQgZHggPSBwcmVfcG9zX3ggLSBiLnBvcy54O1xuICAgICAgICBsZXQgZHkgPSBwcmVfcG9zX3kgLSBiLnBvcy55O1xuICAgICAgICBiLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoZHksIGR4KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgIGIucG9zLnggPSAoV09STERfV0lEVEggKyB0aGlzLmJvZHlbaS0xXS5wb3MueCAtIEJPTkVfU0laRSAqIE1hdGguY29zKGIuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MCkpICUgV09STERfV0lEVEhcbiAgICAgICAgYi5wb3MueSA9IChXT1JMRF9IRUlHSFQgKyB0aGlzLmJvZHlbaS0xXS5wb3MueSAtIEJPTkVfU0laRSAqIE1hdGguc2luKGIuZGlyZWN0aW9uICogTWF0aC5QSSAvIDE4MCkpICUgV09STERfSEVJR0hUXG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBiLm1vdmVGb3J3YXJkKClcbiAgICAgIH1cblxuICAgIH0sIHRoaXMpXG4gIH1cbiAgZ3Jvdygpe1xuICAgIGxldCBsYXN0X2JvZHlfcGFydCA9IHRoaXMuYm9keS5zbGljZSgtMSkucG9wKClcbiAgICBsZXQgcG9zX3ggPSBsYXN0X2JvZHlfcGFydC5wb3MueCAtIEJPTkVfU0laRSAqIE1hdGguY29zKGxhc3RfYm9keV9wYXJ0LmRpcmVjdGlvbiAqIE1hdGguUEkgLyAxODApXG4gICAgbGV0IHBvc195ID0gbGFzdF9ib2R5X3BhcnQucG9zLnkgLSBCT05FX1NJWkUgKiBNYXRoLnNpbihsYXN0X2JvZHlfcGFydC5kaXJlY3Rpb24gKiBNYXRoLlBJIC8gMTgwKVxuICAgIHRoaXMuYm9keS5wdXNoKG5ldyBCb2R5UGFydCh7eDogcG9zX3gsIHk6IHBvc195fSwgbGFzdF9ib2R5X3BhcnQuZGlyZWN0aW9uKSlcbiAgICB0aGlzLmxpZmUgPSBTTkFLRV9MSUZFXG4gICAgdGhpcy5zY29yZSsrXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgU25ha2U6IFNuYWtlLFxuICAgIEJvZHlQYXJ0OiBCb2R5UGFydFxufTtcbiJdfQ==
