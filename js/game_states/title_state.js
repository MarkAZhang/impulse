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

  imp_vars.impulse_music.play_bg(imp_params.songs["Menu"])

  if(imp_vars.player_data.first_time) {
    imp_vars.player_data.first_time = false
    save_game()
  }
}

TitleState.prototype.process = function(dt) {

}

TitleState.prototype.draw_bg = function(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#080808"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.1
  ctx.drawImage(imp_vars.title_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
  ctx.globalAlpha = 1
}

TitleState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    this.draw_bg(bg_ctx)
    this.bg_drawn = true
  }
  ctx.globalAlpha = .3
  /*ctx.drawImage(this.image, imp_vars.levelWidth/2 - this.image.width/2, imp_vars.levelHeight/2 - 100 - this.image.height/2 - 15)*/
  ctx.globalAlpha = 1

  draw_logo(ctx,imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 160, true)

  //ctx.shadowBlur = 5

    for(var i = 0; i < this.buttons[this.state].length; i++)
    {
      this.buttons[this.state][i].draw(ctx)
    }

  /*ctx.font = '20px Muli'
  draw_empty_star(ctx, imp_vars.levelWidth - 20, imp_vars.levelHeight - 15, 15, "black")
  ctx.textAlign = 'right'
  ctx.fillStyle = 'black'
  ctx.fillText(imp_vars.player_data.stars[imp_vars.player_data.difficulty_mode], imp_vars.levelWidth - 40, imp_vars.levelHeight - 10)*/

  if(imp_vars.player_data.difficulty_mode == "easy") {
    ctx.font = '12px Muli'
    ctx.textAlign = 'left'
    ctx.fillStyle = "white"
    ctx.fillText("EASY MODE", 10, imp_vars.levelHeight - 10)
  }

  /*ctx.font = '20px Muli'
  ctx.textAlign = 'right'
  ctx.fillStyle = "white"
  ctx.fillText("RATING", imp_vars.levelWidth/2 + 200, imp_vars.levelHeight/2 + 50)
  ctx.font = '72px Muli'
  ctx.fillText(this.cur_rating, imp_vars.levelWidth/2 + 200, imp_vars.levelHeight/2 + 120)
  if(this.next_upgrade != null) {
    ctx.font = '10px Muli'
    ctx.fillText("NEXT UPGRADE IN", imp_vars.levelWidth/2 + 200, imp_vars.levelHeight/2 + 155)
    ctx.font = '36px Muli'
    ctx.fillText((this.next_upgrade - this.cur_rating), imp_vars.levelWidth/2 + 200, imp_vars.levelHeight/2 + 193)
  }*/
  
  

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
/*  if(imp_vars.player_data.first_time) {
    switch_game_state(new HowToPlayState())
  }*/
  _this = this;
  this.buttons["menu"] = []
  var button_color = "white"//impulse_colors["impulse_blue"]

  if(imp_vars.dev) {
    this.buttons["menu"].push(new SmallButton("MAIN GAME", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2-30, 200, 50, button_color, "blue",
    function(){
      var i = 1;
      while(i < 4 && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+i]) {
        i += 1
      }
      if(imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode].game_numbers) {
        switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
      } else {
        switch_game_state(new WorldMapState(i))
      }
    }))
    this.buttons["menu"].push(new SmallButton("PRACTICE", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+20, 200, 50, button_color, "blue",function(){switch_game_state(new ClassicSelectState())}))
    this.buttons["menu"].push(new SmallButton("CREDITS", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+70, 200, 50, button_color, "blue",function(){switch_game_state(new CreditsState())}))
    //this.buttons["menu"].push(new SmallButton("FIFTEEN SECOND GAME", 20, imp_vars.levelWidth/2,
    //      imp_vars.levelHeight/2+70, 200, 50, function(){switch_game_state(new
    //        ImpulseGameState(ctx, "SURVIVAL"))}))
    this.buttons["menu"].push(new SmallButton("TUTORIAL", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+220, 200, 50, button_color, "blue", function(){switch_game_state(new HowToPlayState())}))
    //this.buttons["menu"].push(new SmallButton("ENCYCLOPEDIA", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+220, 200, 50, button_color, "blue",function(){switch_game_state(new EnemiesInfoState())}))
    this.buttons["menu"].push(new SmallButton("OPTIONS", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+120, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "options"}, 50)}))
    this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+170, 200, 50, button_color, "blue",function(){switch_game_state(new MusicPlayerState())}))
    this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+270, 200, 50, button_color, "blue",function(){switch_game_state(new LevelEditorState())}))
  } else {
    this.buttons["menu"].push(new IconButton("MAIN GAME", 24, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 130, 150, 150, button_color, impulse_colors["impulse_blue"],
    function(){
      var i = 1;
      while(i < 4 && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+i]) {
        i += 1
      }
      if(imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode].game_numbers) {
        switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
      } else {
        switch_game_state(new WorldMapState(i))
      }
    }, "player"))

    //this.buttons["menu"].push(new SmallButton("PRACTICE", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+20, 200, 50, button_color, "blue",function(){switch_game_state(new ClassicSelectState())}))
    this.buttons["menu"].push(new IconButton("TUTORIAL", 16, imp_vars.levelWidth/2 + 200, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState())}, "tutorial"))
    this.buttons["menu"].push(new IconButton("CREDITS", 16, imp_vars.levelWidth/2, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"],function(){switch_game_state(new CreditsState())}, "credit"))
    this.buttons["menu"].push(new IconButton("OPTIONS", 16, imp_vars.levelWidth/2 - 200, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"],function(){setTimeout(function(){_this.state = "options"}, 50)}, "gear"))

  }

  
  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+150, 200, 50, button_color, "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
  this.easy_mode_button = new SmallButton("EASY MODE", 20, imp_vars.levelWidth/2-100, imp_vars.levelHeight/2+120, 200, 50, button_color, "blue", function(){_this.change_mode("easy")})

  this.buttons["options"].push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("NORMAL MODE", 20, imp_vars.levelWidth/2+100, imp_vars.levelHeight/2+120, 200, 50, button_color, "blue",function(){_this.change_mode("normal")})
  this.buttons["options"].push(this.normal_mode_button)
  this.set_difficulty_button_underline();
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+170, 200, 50, button_color, "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+220, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "menu"}, 50)}))


}

TitleState.prototype.change_mode = function(type) {
  imp_vars.player_data.difficulty_mode = type;

  save_game();
  this.set_difficulty_button_underline();
  calculate_stars(imp_vars.player_data.difficulty_mode)
}

TitleState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (imp_vars.player_data.difficulty_mode == "easy");
  this.normal_mode_button.underline = (imp_vars.player_data.difficulty_mode == "normal");
}

TitleState.prototype.clear_data = function() {
  localStorage.removeItem(imp_vars.save_name);
  this.clear_data_button.text = "DATA CLEARED";
  this.clear_data_button.color = "red";
  var old_player_options = imp_vars.player_data.options
  load_game();
  imp_vars.player_data.options = old_player_options
  imp_vars.player_data.first_time = false
  save_game();
}