dt = 20 // milliseconds (rendering freq.)

function Game() {
  this.snakes = [];
  this.controls = {left: false, right: false}
}

Game.prototype = {
  initialize: function() {
    this.snakes.push(new Snake({x: 100, y: 50}, 0))
  },

  start: function() {
    othis = this;
    setInterval(function() {
      othis.snakes.forEach(function(s, i) {
        s.turn(othis.controls.right, othis.controls.left);
        s.moveForward();
      })
    }, dt)
  },

  pressRight: function(pressed) {
    this.controls.right = pressed;
  },
  pressLeft: function(pressed) {
    this.controls.left = pressed;
  }
}

function Renderer(canvas) {
	this.ctx = canvas.getContext('2d');
	this.center = canvas.width / 2;

}

Renderer.prototype = {
  renderCircle: function(p) {
		this.ctx.fillStyle = 'blue';
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'black';
		this.ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI, false);
		this.ctx.fill();
		this.ctx.lineWidth = 10 / 2;
		this.ctx.stroke();
	},
  clearCanvas : function() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
	},
	renderGame : function(game) {
    game.snakes.forEach(function(s, i){
      this.clearCanvas();
      this.renderCircle(s.head.pos)
    }, this);
	}
}
