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
				if (s.id === 0){
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
