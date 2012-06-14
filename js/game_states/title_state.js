TitleState.prototype = new GameState

TitleState.prototype.constructor = TitleState

function TitleState(start_clicked) {
  this.start_clicked = start_clicked
  this.buttons = []
  var _this = this
  this.image = new Image()

  this.image.src = 'impulse_logo.png'
  if(start_clicked) {
    this.setup_main_menu()
  }
  else
    this.buttons.push(new SmallButton("CLICK TO BEGIN", 20, canvasWidth/2, canvasHeight/2+150, 200, 50, function(){setTimeout(function(){_this.setup_main_menu()}, 20)}))
}

TitleState.prototype.process = function(dt) {

}

TitleState.prototype.draw = function(ctx) {
  ctx.globalAlpha = .3
  ctx.drawImage(this.image, canvasWidth/2 - this.image.width/2, canvasHeight/2 - 100 - this.image.height/2 - 15)
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = '40px Century Gothic'
  ctx.fillStyle = 'blue'
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", canvasWidth/2, canvasHeight/2 - 100)
  
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  ctx.font = '20px Century Gothic'
  draw_empty_star(ctx, canvasWidth - 20, canvasHeight - 15, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(player_data.stars, canvasWidth - 40, canvasHeight - 10)

  ctx.textAlign = 'left'
  ctx.fillText("ver "+version_num, 10, canvasHeight - 10)
}

TitleState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

TitleState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

TitleState.prototype.setup_main_menu = function() {
  if(player_data.first_time) {
    switch_game_state(new HowToPlayState())
  }

  this.buttons = []
  this.buttons.push(new SmallButton("CLASSIC", 20, canvasWidth/2, canvasHeight/2+20, 200, 50, function(){switch_game_state(new ClassicSelectState())}))
  this.buttons.push(new SmallButton("FIFTEEN SECOND GAME", 20, canvasWidth/2,
        canvasHeight/2+70, 200, 50, function(){switch_game_state(new
          ImpulseGameState(ctx, "SURVIVAL"))}))
  this.buttons.push(new SmallButton("HOW TO PLAY", 20, canvasWidth/2, canvasHeight/2+120, 200, 50, function(){switch_game_state(new HowToPlayState())}))
  this.buttons.push(new SmallButton("ENEMIES", 20, canvasWidth/2, canvasHeight/2+170, 200, 50, function(){switch_game_state(new EnemiesInfoState())}))
  this.buttons.push(new SmallButton("CREDITS", 20, canvasWidth/2, canvasHeight/2+220, 200, 50, function(){switch_game_state(new CreditsState())}))
  this.buttons.push(new SmallButton("LEVEL EDITOR", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){switch_game_state(new LevelEditorState())}))
}
