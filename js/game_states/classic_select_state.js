ClassicSelectState.prototype = new GameState

ClassicSelectState.prototype.constructor = ClassicSelectState

function ClassicSelectState(world) {
  this.bg_drawn = false
  if(!world) {
    this.buttons = []
    this.buttons.push(new SmallButton("MAIN MENU", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
    this.level_buttons = []
    this.set_world_buttons()
  }
  else {
    this.buttons = []
    this.buttons.push(new SmallButton("MAIN MENU", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
    this.level_buttons = []
    this.set_level_buttons(world)
  }

  impulse_music.play_bg(imp_vars.songs["Menu"])
}

ClassicSelectState.prototype.process = function(  at) {

}

ClassicSelectState.prototype.set_world_buttons = function() {
  this.buttons = [this.buttons[0]]
  this.level_buttons = []
  var gap = 30
  var level_button_h = (canvasHeight/2 + 140 - gap)/2
  var level_button_w = (canvasWidth - 3 * gap)/2
  
  for(var i = 0; i < 4; i++) {

    this.level_buttons.push(new WorldButton((i+1), 20, (gap + level_button_w) * (i%2) + gap + level_button_w/2, (gap + level_button_h) * Math.floor(i/2) +gap + level_button_h/2, level_button_w, level_button_h, "black", function(_this, i){return function(){setTimeout(function(){_this.set_level_buttons(i+1)}, 20)}}(this, i)))
  }

}

ClassicSelectState.prototype.set_level_buttons = function(world) {
  this.buttons.push(new SmallButton("WORLD SELECT", 20, canvasWidth/2, canvasHeight/2+220, 200, 50, function(_this){return function(){_this.set_world_buttons()}}(this)))
  this.level_buttons = []
  var gap = 30
  var level_button_h = (canvasHeight/2 + 200 - 3 * gap)/2
  var level_button_w = (canvasWidth - 5 * gap)/4
  
  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(world) : "LEVEL "+world+"-"+(i+1)
    
    var temp_button = new LevelButton(title, 20, (gap + level_button_w) * (i%4) + gap + level_button_w/2, (gap + level_button_h) * Math.floor(i/4) +gap + level_button_h/2, level_button_w, level_button_h, "black", world)
    temp_button.set_float_panel_loc(400, 535, 740, 70)

    this.level_buttons.push(temp_button)
  }

  
}

ClassicSelectState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "white"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }

  ctx.beginPath()

  ctx.font = '20px Century Gothic'
  draw_empty_star(ctx, canvasWidth - 20, canvasHeight - 15, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(player_data.stars, canvasWidth - 40, canvasHeight - 10)
  
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.level_buttons.length; i++)
  {
    this.level_buttons[i].draw(ctx)
  }
}

ClassicSelectState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  for(var i = 0; i < this.level_buttons.length; i++)
  {
    this.level_buttons[i].on_mouse_move(x, y)
  }
}

ClassicSelectState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
   for(var i = 0; i < this.level_buttons.length; i++)
  {
    this.level_buttons[i].on_click(x, y)
  }
}

