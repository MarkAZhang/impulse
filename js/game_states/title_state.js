TitleState.prototype = new GameState

TitleState.prototype.constructor = TitleState

function TitleState(start_clicked) {
  this.start_clicked = start_clicked
  this.buttons = []
  var _this = this
  if(start_clicked) {
    this.setup_main_menu()
  }
  else
    this.buttons.push(new ImpulseButton("CLICK TO BEGIN", 20, canvasWidth/2, canvasHeight/2+150, 200, 50, function(){setTimeout(function(){_this.setup_main_menu()}, 20)}))
}

TitleState.prototype.process = function(dt) {

}

TitleState.prototype.draw = function(ctx) {
  ctx.beginPath()
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", canvasWidth/2, canvasHeight/2)
  
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  draw_empty_star(ctx, canvasWidth - 20, canvasHeight - 20, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(player_data.stars, canvasWidth - 40, canvasHeight - 15)
}

TitleState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].onMouseMove(x, y)
  }
}

TitleState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].onClick(x, y)
  }
}

TitleState.prototype.setup_main_menu = function() {
  this.buttons = []
  this.buttons.push(new ImpulseButton("CLASSIC", 20, canvasWidth/2, canvasHeight/2+70, 200, 50, function(){switch_game_state(new ClassicSelectState())}))
  this.buttons.push(new ImpulseButton("SURVIVAL", 20, canvasWidth/2, canvasHeight/2+120, 200, 50, function(){switch_game_state(new ImpulseGameState(ctx, "SURVIVAL"))}))
  this.buttons.push(new ImpulseButton("ENEMIES", 20, canvasWidth/2, canvasHeight/2+170, 200, 50, function(){}))
  this.buttons.push(new ImpulseButton("CREDITS", 20, canvasWidth/2, canvasHeight/2+220, 200, 50, function(){switch_game_state(new CreditsState())}))
  this.buttons[2].setActive(false)
}
