(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
RENDER_FREQ = 20;

function init() {
  var canvas = document.getElementById("canvas");
	var renderer = new Renderer(canvas);
  var game = new Game();
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbmdpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlJFTkRFUl9GUkVRID0gMjA7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKTtcblx0dmFyIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKGNhbnZhcyk7XG4gIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgc2V0RXZlbnRzKGdhbWUpO1xuICBnYW1lLmluaXRpYWxpemUoKTtcbiAgd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdHJlbmRlcmVyLnJlbmRlckdhbWUoZ2FtZSk7XG5cdH0sIFJFTkRFUl9GUkVRKTtcblxuICBnYW1lLnN0YXJ0KClcbn1cblxuZnVuY3Rpb24gc2V0RXZlbnRzKGcpIHtcbiAgZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICBpZiAoZS5rZXlDb2RlID09ICczNycpIHtcbiAgICAgICAvLyBsZWZ0IGFycm93XG4gICAgICAgZy5wcmVzc0xlZnQodHJ1ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICAgICBnLnByZXNzUmlnaHQodHJ1ZSk7XG4gICAgfVxuICB9XG4gIGRvY3VtZW50Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIGlmIChlLmtleUNvZGUgPT0gJzM3Jykge1xuICAgICAgIC8vIGxlZnQgYXJyb3dcbiAgICAgICBnLnByZXNzTGVmdChmYWxzZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICAgICBnLnByZXNzUmlnaHQoZmFsc2UpO1xuICAgIH1cbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sZWZ0XCIpLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBnLnByZXNzTGVmdCh0cnVlKTtcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sZWZ0XCIpLm9udG91Y2hlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZy5wcmVzc0xlZnQoZmFsc2UpO1xuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXJpZ2h0XCIpLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGcucHJlc3NSaWdodCh0cnVlKTtcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1yaWdodFwiKS5vbnRvdWNoZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgZy5wcmVzc1JpZ2h0KGZhbHNlKTtcbiAgfVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdGluaXQoKTtcbn1cbiJdfQ==
