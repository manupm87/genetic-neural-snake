dt = 20 // milliseconds (rendering freq.)
SIMULTANEUS_FOOD = 5
MOUTH_SIZE = 20

class Game {
  constructor(){
    this.snakes = [];
    this.food = [];
    this.controls = {left: false, right: false}
  }

  initialize() {
    this.snakes.push(new Snake({x: 100, y: 50}, 0))
  }

  spawnFood(){
    let rand_x = parseInt(WORLD_WIDTH * Math.random())
    let rand_y = parseInt(WORLD_HEIGHT * Math.random())
    this.food.push(new Food({x: rand_x, y: rand_y}, 10))
  }

  start() {
    var othis = this;
    setInterval(function() {
      othis.gameLoop(othis)
    }, dt)
  }

  gameLoop(othis) {
    othis.snakes.forEach(function(s, i) {
      othis.food.forEach(function(f, j) {
        if (othis._distance(s.head.pos, f.pos) < MOUTH_SIZE) {
          othis.food.splice(j, 1);
          s.grow();
        }
      })
      s.turn(othis.controls.right, othis.controls.left);
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

function Renderer(canvas) {
	this.ctx = canvas.getContext('2d');
	this.center = canvas.width / 2;

}

Renderer.prototype = {
  renderCircle: function(p, fillColor, strokeColor, radius, lineWidth) {
		this.ctx.fillStyle = fillColor;
		this.ctx.beginPath();
		this.ctx.strokeStyle = strokeColor;
		this.ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
		this.ctx.fill();
		this.ctx.lineWidth = lineWidth;
		this.ctx.stroke();
	},
  clearCanvas : function() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
	},
  renderSnake : function(s) {
    this.renderCircle(s.head.pos, 'blue', 'black', 10, 5)
  },
  renderFood : function(f) {
    this.renderCircle(f.pos, 'red', 'red', 6, 1)
  },
	renderGame : function(game) {
    this.clearCanvas();
    game.snakes.forEach(function(s, i){
      this.renderSnake(s)
    }, this);
    game.food.forEach(function(f, i){
      this.renderFood(f);
    }, this)
	}
}
