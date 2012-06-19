EnemiesInfoState.prototype = new GameState

EnemiesInfoState.prototype.constructor = EnemiesInfoState

function EnemiesInfoState() {

    this.buttons = []
    this.buttons.push(new SmallButton("MAIN MENU", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
    this.enemy_buttons = []
    this.set_enemy_buttons()

    play_song("right")

}

EnemiesInfoState.prototype.process = function(dt) {

}

EnemiesInfoState.prototype.set_enemy_buttons = function() {
  this.enemy_buttons = []
  var gap = 30
  var num_per_row = 6
  var level_button_w = (canvasWidth - (num_per_row + 1) * gap)/(num_per_row)
  var level_button_h = level_button_w

  var i = 0
  for(enemy_name in impulse_enemy_stats) {
    if(enemy_name == "fighter_bullet") continue
    var temp_button = new EnemyButton(enemy_name, 15, (gap + level_button_w) * (i%num_per_row) + gap + level_button_w/2, (gap + level_button_h) * Math.floor(i/num_per_row) +gap + level_button_h/2, level_button_w, level_button_h, "black")

    this.enemy_buttons.push(temp_button)
    i+=1
  }
  
}

EnemiesInfoState.prototype.draw = function(ctx) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.enemy_buttons.length; i++)
  {
    this.enemy_buttons[i].draw(ctx)
  }
}

EnemiesInfoState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  for(var i = 0; i < this.enemy_buttons.length; i++)
  {
    this.enemy_buttons[i].on_mouse_move(x, y)
  }
}

EnemiesInfoState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
   for(var i = 0; i < this.enemy_buttons.length; i++)
  {
    this.enemy_buttons[i].on_click(x, y)
  }
}

