var dom = require('./dom.js');
var game_engine = require('../core/game_engine.js');
var utils = require('../core/utils.js');

var io = {};

function on_mouse_move(event) {
  var mPos = utils.getCursorPosition(event)

  game_engine.on_mouse_move(mPos);
}

function on_mouse_down(event) {
  event.preventDefault()

  var mPos = utils.getCursorPosition(event)
  if(event.button == 0) {
    game_engine.on_mouse_down(mPos);
  } else if(event.button == 2) {
    game_engine.on_right_mouse_down(mPos);
  }
}

function on_mouse_up(event) {
  event.preventDefault()

  var mPos = utils.getCursorPosition(event)

  if(event.button == 0) {
    game_engine.on_mouse_up(mPos);
  } else if(event.button == 2) {
    game_engine.on_right_mouse_up(mPos);
  }
}

function on_click(event) {

  event.preventDefault()

  var mPos = utils.getCursorPosition(event)

  if(event.button == 0) {
    game_engine.on_click(mPos);
  } else if(event.button == 2) {
    game_engine.on_right_click(mPos);
  }
}

function on_key_down(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  game_engine.on_key_down(keyCode);
}

function on_key_up(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  game_engine.on_key_up(keyCode);
}

function on_resize(event) {
  dom.centerCanvas();
}

io.set_up_listeners = function () {
  document.addEventListener('keydown', on_key_down);
  document.addEventListener('keyup', on_key_up);
  document.addEventListener('click', on_click);
  document.addEventListener('mousedown', on_mouse_down);
  document.addEventListener('mouseup', on_mouse_up);
  document.addEventListener('mousemove', on_mouse_move)
  document.addEventListener('resize', on_resize)
}

module.exports = io;
