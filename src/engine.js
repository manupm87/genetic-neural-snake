import * as c from './constants'
import {Game} from './game'
import {Renderer} from './renderer'
import {SnakeList} from "./react_components/leaderboard.js"
import React from 'react'
import ReactDOM from 'react-dom'

function init() {

  var canvas = document.getElementById("canvas");
	var renderer = new Renderer(canvas);
  var game = new Game();
  setEvents(game);
  game.initialize();
  window.setInterval(function() {
		renderer.renderGame(game);
	}, c.RENDER_FREQ);
  window.setInterval(function() {
		ReactDOM.render(<SnakeList snakes={game.snakes} snakesType={c.SNAKE_TYPE_CHAMPION} listName="survivors"/>, document.getElementById('snake-list-champions'));
  	ReactDOM.render(<SnakeList snakes={game.snakes} snakesType={c.SNAKE_TYPE_CHILD} listName="children"/>, document.getElementById('snake-list-children'));
		ReactDOM.render(<SnakeList snakes={game.snakes} snakesType={c.SNAKE_TYPE_RANDOM} listName="random"/>, document.getElementById('snake-list-random'));
	}, 500);
  // ReactDOM.render(<leaderboard.SnakeList snakes={game.snakes}/>, document.getElementById('hello'));
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
  // document.getElementById("btn-left").ontouchstart = function () {
  //   g.pressLeft(true);
  // }
  // document.getElementById("btn-left").ontouchend = function () {
  //   g.pressLeft(false);
  // }
  // document.getElementById("btn-right").ontouchstart = function() {
  //   g.pressRight(true);
  // }
  // document.getElementById("btn-right").ontouchend = function() {
  //   g.pressRight(false);
  // }
}

window.onload = function() {
	init();
}
