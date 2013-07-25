var GameState = function() {
  //empty constructor since GameState should not be constructed
}

GameState.prototype.process = function(dt) {}
GameState.prototype.draw = function(ctx) {}
GameState.prototype.on_mouse_move = function(x, y) {}
GameState.prototype.on_click = function(x, y) {}
GameState.prototype.on_mouse_down = function(x, y) {}
GameState.prototype.on_mouse_up = function(x, y) {}
GameState.prototype.on_right_click = function(x, y) {}
GameState.prototype.on_right_mouse_down = function(x, y) {}
GameState.prototype.on_right_mouse_up = function(x, y) {}
GameState.prototype.on_key_down = function(keyCode) {}
GameState.prototype.on_key_up = function(keyCode) {}

GameState.prototype.on_visibility_change = function(event_type) {
  console.log("VISIBILITY "+event_type)
}