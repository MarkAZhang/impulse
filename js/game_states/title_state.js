TitleState.prototype = new GameState

TitleState.prototype.constructor = TitleState

function TitleState(start_clicked) {
  this.start_clicked = true
  this.buttons = {
    "menu" : [],
    "enter" : [],
    "options" : []
  }
  var _this = this
  this.image = new Image()
  this.bg_drawn = false
  this.state = "enter"

  if(this.start_clicked) {
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
    bg_ctx.fillStyle = "black"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }
  ctx.globalAlpha = .3
  /*ctx.drawImage(this.image, levelWidth/2 - this.image.width/2, levelHeight/2 - 100 - this.image.height/2 - 15)*/
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = '72px Muli'
  ctx.shadowColor = impulse_colors["impulse_blue"]
  ctx.shadowBlur = 20
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", levelWidth/2, levelHeight/2 - 100)

    for(var i = 0; i < this.buttons[this.state].length; i++)
    {
      this.buttons[this.state][i].draw(ctx)
    }

  ctx.font = '20px Muli'
  draw_empty_star(ctx, levelWidth - 20, levelHeight - 15, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(player_data.stars[player_data.difficulty_mode], levelWidth - 40, levelHeight - 10)

  if(player_data.difficulty_mode == "easy") {
    ctx.textAlign = 'left'
    ctx.fillText("EASY MODE", 10, levelHeight - 10)
  }
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
  var button_color = impulse_colors["impulse_blue"]
  this.buttons["menu"].push(new SmallButton("MAIN GAME", 20, levelWidth/2, levelHeight/2-30, 200, 50, button_color, "blue",function(){switch_game_state(new WorldMapState())}))
  this.buttons["menu"].push(new SmallButton("PRACTICE", 20, levelWidth/2, levelHeight/2+20, 200, 50, button_color, "blue",function(){switch_game_state(new ClassicSelectState())}))
  this.buttons["menu"].push(new SmallButton("CREDITS", 20, levelWidth/2, levelHeight/2+70, 200, 50, button_color, "blue",function(){switch_game_state(new CreditsState())}))
  //this.buttons["menu"].push(new SmallButton("FIFTEEN SECOND GAME", 20, levelWidth/2,
  //      levelHeight/2+70, 200, 50, function(){switch_game_state(new
  //        ImpulseGameState(ctx, "SURVIVAL"))}))
  //this.buttons["menu"].push(new SmallButton("HOW TO PLAY", 20, levelWidth/2, levelHeight/2+70, 200, 50, function(){switch_game_state(new HowToPlayState())}))
  //this.buttons["menu"].push(new SmallButton("ENCYCLOPEDIA", 20, levelWidth/2, levelHeight/2+220, 200, 50, button_color, "blue",function(){switch_game_state(new EnemiesInfoState())}))
  this.buttons["menu"].push(new SmallButton("OPTIONS", 20, levelWidth/2, levelHeight/2+120, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "options"}, 50)}))
  this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, levelWidth/2, levelHeight/2+170, 200, 50, button_color, "blue",function(){switch_game_state(new MusicPlayerState())}))
if(dev){this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, levelWidth/2, levelHeight/2+270, 200, 50, button_color, "blue",function(){switch_game_state(new LevelEditorState())}))}

  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, levelWidth/2, levelHeight/2+150, 200, 50, button_color, "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
"blue",
  this.easy_mode_button = new SmallButton("EASY MODE", 20, levelWidth/2-100, levelHeight/2+20, 200, 50, button_color, "blue", function(){_this.change_mode("easy")})
  this.buttons["options"].push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("NORMAL MODE", 20, levelWidth/2+100, levelHeight/2+20, 200, 50, button_color, "blue",function(){_this.change_mode("normal")})
  this.buttons["options"].push(this.normal_mode_button)
  this.set_difficulty_button_underline();
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, levelWidth/2, levelHeight/2+70, 200, 50, button_color, "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, levelWidth/2, levelHeight/2+120, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "menu"}, 50)}))

}

TitleState.prototype.change_mode = function(type) {
  player_data.difficulty_mode = type;

  save_game();
  this.set_difficulty_button_underline();
  calculate_stars(player_data.difficulty_mode)
}

TitleState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (player_data.difficulty_mode == "easy");
  this.normal_mode_button.underline = (player_data.difficulty_mode == "normal");
}

TitleState.prototype.clear_data = function() {
  localStorage.removeItem(save_name);
  this.clear_data_button.text = "DATA CLEARED";
  this.clear_data_button.color = "red";
  load_game();
}