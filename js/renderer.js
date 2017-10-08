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
  renderArc: function(p, fillColor, strokeColor, radius, lineWidth, start_alpha, end_alpha, clockwise) {
		this.ctx.fillStyle = fillColor;
		this.ctx.strokeStyle = strokeColor;
		this.ctx.lineWidth = lineWidth;
    // this.ctx.moveTo(p.x,p.y);
		this.ctx.beginPath();
		this.ctx.arc(p.x, p.y, radius, start_alpha, end_alpha, clockwise);
    this.ctx.lineTo(p.x,p.y);
		this.ctx.fill();
		this.ctx.stroke();
	},
  renderRectangle: function(start, end, fillColor, strokeColor, lineWidth) {
    this.ctx.beginPath();
    this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.stroke();
  },
  renderSize: function(size) {
    this.ctx.font="300px Verdana";
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.fillText(size, WORLD_WIDTH / 2, WORLD_HEIGHT / 2 + 100);
  },
  clearCanvas : function() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
	},
  renderSnake : function(s) {
    s.body.forEach(function(b, i){
      if(i===0){
        this.renderCircle(b.pos, 'aqua', 'black', 12, 5)
      }
      else {
        this.renderCircle(b.pos, 'blue', 'black', 10, 5)
      }
    }, this)
    s.sensors["food"].forEach(function(sensor, i) {
      this.renderSensor(s, sensor)
    }, this)
		s.sensors["wall"].forEach(function(sensor, i) {
      this.renderSensor(s, sensor)
    }, this)
  },
  renderFood : function(f) {
    this.renderFoodLife(f)
    this.renderCircle(f.pos, 'red', 'red', 6, 1)
  },
  renderFoodLife : function(f) {
    this.renderArc(f.pos, 'rgba(200,50,50,1)', 'rgba(200,50,50,1)', 10, 1, -Math.PI/180 * 90, -Math.PI/180 * 90 - 2 * Math.PI / FOOD_INITIAL_LIFE * f.life, true)
  },
  renderWall : function() {
    this.renderRectangle({x: 0, y: 0}, {x: WALL_THICKNESS, y: WORLD_HEIGHT}, 'black', 'black', 1)
    this.renderRectangle({x: WORLD_WIDTH - WALL_THICKNESS, y: 0}, {x: WORLD_WIDTH, y: WORLD_HEIGHT}, 'black', 'black', 1)
    this.renderRectangle({x: 0, y: 0}, {x: WORLD_WIDTH, y: WALL_THICKNESS}, 'black', 'black', 1)
    this.renderRectangle({x: 0, y: WORLD_HEIGHT - WALL_THICKNESS}, {x: WORLD_WIDTH, y: WORLD_HEIGHT}, 'black', 'black', 1)
  },
  renderSensor: function(snake, sensor) {
    let start_alpha = (sensor.getDirection() - sensor.vision / 2) * Math.PI / 180
    let end_alpha = (sensor.getDirection() + sensor.vision / 2) * Math.PI / 180
    var grd=this.ctx.createRadialGradient(sensor.mount.pos.x, sensor.mount.pos.y, 5, sensor.mount.pos.x, sensor.mount.pos.y, 100);
    grd.addColorStop(0,"rgba(200,50,50,0.3)");
    grd.addColorStop(1,"rgba(200,50,50,0)");

    this.ctx.fillStyle = grd;
		this.ctx.beginPath();
		this.ctx.arc(sensor.mount.pos.x, sensor.mount.pos.y, 100, start_alpha, end_alpha, false);
    this.ctx.lineTo(sensor.mount.pos.x,sensor.mount.pos.y);
		this.ctx.fill();
		//this.ctx.stroke();
    this.renderArc(sensor.mountPoint, 'rgba(200,250,250,0.3)', 'rgba(200,250,250,0.3)', 100 * sensor.excitement, 1, start_alpha, end_alpha, false)
  },
	renderGame : function(game) {
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