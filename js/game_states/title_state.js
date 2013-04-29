TitleState.prototype = new GameState

TitleState.prototype.constructor = TitleState

function TitleState(start_clicked) {
  this.start_clicked = start_clicked
  this.buttons = {
    "menu" : [],
    "enter" : [],
    "options" : []
  }
  var _this = this
  this.image = new Image()
  this.bg_drawn = false
  this.state = "enter"

  if(start_clicked) {
    this.state = "menu"
  }

  this.image.src = 'impulse_logo.png'
  this.setup_main_menu()

  impulse_music.play_bg(imp_vars.songs["Menu"])
}

TitleState.prototype.process = function(dt) {

}

TitleState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "white"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }
  ctx.globalAlpha = .3
  ctx.drawImage(this.image, levelWidth/2 - this.image.width/2, levelHeight/2 - 100 - this.image.height/2 - 15)
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = '40px Century Gothic'
  ctx.fillStyle = 'blue'
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", levelWidth/2, levelHeight/2 - 100)

    for(var i = 0; i < this.buttons[this.state].length; i++)
    {
      this.buttons[this.state][i].draw(ctx)
    }

  ctx.font = '20px Century Gothic'
  draw_empty_star(ctx, levelWidth - 20, levelHeight - 15, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(player_data.stars, levelWidth - 40, levelHeight - 10)

  ctx.textAlign = 'left'
  ctx.fillText("ver "+version_num, 10, levelHeight - 10)
}

TitleState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons[this.state].length; i++)
  {
    this.buttons[this.state][i].on_mouse_move(x, y)
  }
}

TitleState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons[this.state].length; i++) {
    this.buttons[this.state][i].on_click(x, y)
  }
}

TitleState.prototype.setup_main_menu = function() {
/*  if(player_data.first_time) {
    switch_game_state(new HowToPlayState())
  }*/
  _this = this;
  this.buttons["menu"] = []
  this.buttons["menu"].push(new SmallButton("CLASSIC", 20, levelWidth/2, levelHeight/2+20, 200, 50, "black", "blue",function(){switch_game_state(new ClassicSelectState())}))
  //this.buttons["menu"].push(new SmallButton("FIFTEEN SECOND GAME", 20, levelWidth/2,
  //      levelHeight/2+70, 200, 50, function(){switch_game_state(new
  //        ImpulseGameState(ctx, "SURVIVAL"))}))
  //this.buttons["menu"].push(new SmallButton("HOW TO PLAY", 20, levelWidth/2, levelHeight/2+70, 200, 50, function(){switch_game_state(new HowToPlayState())}))
  this.buttons["menu"].push(new SmallButton("ENEMIES", 20, levelWidth/2, levelHeight/2+70, 200, 50, "black", "blue",function(){switch_game_state(new EnemiesInfoState())}))
  this.buttons["menu"].push(new SmallButton("OPTIONS", 20, levelWidth/2, levelHeight/2+120, 200, 50, "black", "blue",function(){_this.state="options"}))
  this.buttons["menu"].push(new SmallButton("CREDITS", 20, levelWidth/2, levelHeight/2+170, 200, 50, "black", "blue",function(){switch_game_state(new CreditsState())}))
  this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, levelWidth/2, levelHeight/2+220, 200, 50, "black", "blue",function(){switch_game_state(new LevelEditorState())}))
  this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, levelWidth/2, levelHeight/2+270, 200, 50, "black", "blue",function(){switch_game_state(new MusicPlayerState())}))

  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, levelWidth/2, levelHeight/2+150, 200, 50, "black", "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, levelWidth/2, levelHeight/2+20, 200, 50, "black", "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, levelWidth/2, levelHeight/2+70, 200, 50, "black", "blue",function(){_this.state="menu"}))

}

TitleState.prototype.clear_data = function() {
  localStorage.removeItem(save_name);
  this.clear_data_button.text = "DATA CLEARED";
  this.clear_data_button.color = "red";
  load_game();
}