import * as c from './constants'
import {Game, loopInterval} from './game'
import {Renderer} from './renderer'
import {SnakeList} from "./react_components/leaderboard.jsx"
import {Marker} from "./react_components/scores.jsx"
import React from 'react'
import ReactDOM from 'react-dom'

function init() {

  var canvas = document.getElementById("canvas");
	var renderer = new Renderer(canvas);
  var game = new Game();
  setEvents(game);
  game.initialize();

  function render(){
    if(c.RENDER_GAME){
      renderer.renderGame(game)
    }
    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
  window.setInterval(function() {
		ReactDOM.render(<SnakeList snakes={game.snakes} snakesType={c.SNAKE_TYPE_CHAMPION} listName="survivors"/>, document.getElementById('snake-list-champions'));
  	ReactDOM.render(<SnakeList snakes={game.snakes} snakesType={c.SNAKE_TYPE_CHILD} listName="children"/>, document.getElementById('snake-list-children'));
		ReactDOM.render(<SnakeList snakes={game.snakes} snakesType={c.SNAKE_TYPE_RANDOM} listName="random"/>, document.getElementById('snake-list-random'));


		ReactDOM.render(<Marker value={game.round} title="round"/>, document.getElementById('marker-round'));
    ReactDOM.render(<Marker value={game.scores.currentBest} title="current"/>, document.getElementById('marker-best-cur-round'));
    ReactDOM.render(<Marker value={game.scores.historicalBest} title="best"/>, document.getElementById('marker-best-historical'));
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

  document.getElementById("render-checkbox").onclick = function () {
    if(document.getElementById("render-checkbox").checked) {
      c.RENDER_GAME = true
      c.GAME_LOOP_T = c.dt
    }
    else {
      c.RENDER_GAME = false
      c.GAME_LOOP_T = 1
    }

    window.clearInterval(loopInterval)
    g.start()
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
