EnemiesInfoState.prototype = new GameState

EnemiesInfoState.prototype.constructor = EnemiesInfoState

function EnemiesInfoState() {
  this.bg_drawn = false

  this.buttons = []
  this.buttons.push(new SmallButton("MAIN MENU", 20, levelWidth/2, levelHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.enemy_buttons = []
  this.enemies_with_info = [
    "stunner", "spear", "tank", "mote", "goo", "harpoon", "wisp", "disabler",
    "fighter", "slingshot", "troll", "deathray", "first boss", "second boss", "third boss", "fourth boss"
  ]
  this.set_enemy_buttons()



}

EnemiesInfoState.prototype.process = function(dt) {

}

EnemiesInfoState.prototype.set_enemy_buttons = function() {
  this.enemy_buttons = []
  var gap = 30
  var num_per_row = 6
  var level_button_w = (levelWidth - (num_per_row + 1) * gap)/(num_per_row)
  var level_button_h = level_button_w

  var i = 0
  for(e in this.enemies_with_info) {
    var enemy_name = this.enemies_with_info[e]
    var temp_button = new EnemyButton(enemy_name, 15, (gap + level_button_w) * (i%num_per_row) + gap + level_button_w/2, (gap + level_button_h) * Math.floor(i/num_per_row) +gap + level_button_h/2, level_button_w, level_button_h, "black")

    this.enemy_buttons.push(temp_button)
    i+=1
  }

}

EnemiesInfoState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "white"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.enemy_buttons.length; i++)
  {
    this.enemy_buttons[i].draw(ctx)
  }
  ctx.fillStyle = "black"
  ctx.font = "20px Century Gothic"
  ctx.textAlign = "center"
  ctx.fillText("BONUS SLAYER STARS: "+player_data.kill_stars+"/12", levelWidth/2, 440)
  draw_progress_bar(ctx ,400, 470, 400, 15, player_data.kill_stars/12, impulse_colors["gold"])

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

