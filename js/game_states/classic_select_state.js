ClassicSelectState.prototype = new GameState

ClassicSelectState.prototype.constructor = ClassicSelectState

function ClassicSelectState() {
  this.start_clicked = false
  this.buttons = []
  var _this = this
  this.buttons.push(new ImpulseButton("MAIN MENU", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.level_buttons = []
  this.set_world_buttons()
  
}

ClassicSelectState.prototype.process = function(dt) {

}

ClassicSelectState.prototype.set_world_buttons = function() {
  this.buttons = [this.buttons[0]]
  this.level_buttons = []
  var gap = 30
  var level_button_h = (canvasHeight/2 + 200 - 3 * gap)/2
  var level_button_w = (canvasWidth - 5 * gap)/4
  
  for(var i = 0; i < 8; i++) {
    this.level_buttons.push(new WorldButton("WORLD "+(i+1), 20, (gap + level_button_w) * (i%4) + gap + level_button_w/2, (gap + level_button_h) * Math.floor(i/4) +gap + level_button_h/2, level_button_w, level_button_h, "black", function(_this, i){return function(){setTimeout(function(){_this.set_level_buttons(i+1)}, 20)}}(this, i)))
  }

}

ClassicSelectState.prototype.set_level_buttons = function(world) {
  this.buttons.push(new ImpulseButton("WORLD SELECT", 20, canvasWidth/2, canvasHeight/2+220, 200, 50, function(_this){return function(){_this.set_world_buttons()}}(this)))
  this.level_buttons = []
  var gap = 30
  var level_button_h = (canvasHeight/2 + 200 - 3 * gap)/2
  var level_button_w = (canvasWidth - 5 * gap)/4
  
  for(var i = 0; i < 8; i++) {
    var temp_button = new LevelButton("LEVEL "+world+"-"+(i+1), 20, (gap + level_button_w) * (i%4) + gap + level_button_w/2, (gap + level_button_h) * Math.floor(i/4) +gap + level_button_h/2, level_button_w, level_button_h, "black")
    temp_button.set_float_panel_loc(400, 535, 740, 70)
    this.level_buttons.push(temp_button)
  }

  
}

ClassicSelectState.prototype.draw = function(ctx) {
  ctx.beginPath()

  draw_empty_star(ctx, canvasWidth - 20, canvasHeight - 20, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(player_data.stars, canvasWidth - 40, canvasHeight - 15)
  
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
    this.buttons[i].onMouseMove(x, y)
  }
  for(var i = 0; i < this.level_buttons.length; i++)
  {
    this.level_buttons[i].onMouseMove(x, y)
  }
}

ClassicSelectState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].onClick(x, y)
  }
   for(var i = 0; i < this.level_buttons.length; i++)
  {
    this.level_buttons[i].onClick(x, y)
  }
}

