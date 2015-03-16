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
  window.addEventListener('keydown', on_key_down, false);
  window.addEventListener('keyup', on_key_up, false);
  window.addEventListener('click', on_click, false);
  window.addEventListener('mousedown', on_mouse_down, false);
  window.addEventListener('mouseup', on_mouse_up, false);
  window.addEventListener('mousemove', on_mouse_move, false)
  window.addEventListener('resize', on_resize, false)
}
