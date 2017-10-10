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
