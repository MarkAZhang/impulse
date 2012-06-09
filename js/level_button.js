LevelButton.prototype = new WorldButton()

LevelButton.prototype.constructor = LevelButton


function LevelButton(level_name, size, x, y, w, h, color) {
  if(!level_name) return
  if(impulse_level_data[level_name]) {
    var this_action = function() {
      switch_game_state(new ImpulseGameState(ctx, level_name))
    }
    this.init(level_name, size, x, y, w, h, color, this_action)
  }
  else {
    this.init(level_name, size, x, y, w, h, color, null)
    this.setActive(false)
  }
}

