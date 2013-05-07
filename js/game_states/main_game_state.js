ClassicSelectState.prototype = new GameState

ClassicSelectState.prototype.constructor = ClassicSelectState

function ClassicSelectState(world) {
  this.bg_drawn = false
  this.color = impulse_colors["impulse_blue"]


  this.buttons = []
  this.buttons.push(new SmallButton("MAIN MENU", 20, levelWidth/2, levelHeight/2+270, 200, 50, this.color, "blue", function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.level_buttons = []
  this.set_level_buttons(world)


  impulse_music.play_bg(imp_vars.songs["Menu"])
}

