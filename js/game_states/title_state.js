TitleState.prototype = new GameState

TitleState.prototype.constructor = TitleState

function TitleState(last_state) {
  this.last_state = last_state
  this.buttons = {
    "menu" : [],
    "enter" : [],
    "options" : []
  }
  var _this = this
  this.image = new Image()
  this.bg_drawn = false

  this.state = "menu"

  this.image.src = 'impulse_logo.png'
  this.setup_main_menu()

  imp_vars.impulse_music.play_bg(imp_params.songs["Menu"])

  if(imp_vars.player_data.first_time) {
    imp_vars.player_data.first_time = false
    save_game()
  }
  /*this.fade_in_duration = null;
  if(last_state == null) {
    this.fade_in_duration = -250  
  } else if(last_state instanceof WorldMapState) {
    this.fade_in_duration = 0
  }
  
  this.fade_interval = 250
  this.fade_out_duration = null*/
}


TitleState.prototype.process = function(dt) {
  /*if(this.fade_out_duration) {
    this.fade_out_duration -= dt;
  }
  if(this.fade_in_duration != null && this.fade_in_duration < this.fade_interval) {
    this.fade_in_duration += dt
  } else {
    this.fade_in_duration = null
  }*/
}



TitleState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    draw_image_on_bg_ctx(bg_ctx, imp_vars.title_bg_canvas, 0.2)
    this.bg_drawn = true
  }

  //ctx.globalAlpha = .3
  //ctx.drawImage(this.image, imp_vars.levelWidth/2 - this.image.width/2, imp_vars.levelHeight/2 - 100 - this.image.height/2 - 15)*/
  //ctx.globalAlpha = 1
  ctx.save()
  /*if(this.fade_out_duration != null) {
    ctx.globalAlpha = Math.max((this.fade_out_duration/this.fade_interval), 0)
    this.draw_bg(bg_ctx, (ctx.globalAlpha * 0.07 + 0.03))

  } else if(this.fade_in_duration != null) {

    if(this.last_state == null) {
      ctx.globalAlpha = Math.min(Math.max(this.fade_in_duration/this.fade_interval, 0), 1)
      bg_canvas.setAttribute("style", "opacity:"+ctx.globalAlpha)  
    } else if(this.last_state instanceof WorldMapState) {
      ctx.globalAlpha = Math.min(Math.max(this.fade_in_duration/this.fade_interval, 0), 1)
      this.draw_bg(bg_ctx, (ctx.globalAlpha * 0.07 + 0.03))
    }
    
  }*/
  ctx.shadowColor = impulse_colors["impulse_blue"]
  ctx.shadowBlur = 20
  draw_logo(ctx,imp_vars.levelWidth/2, 150, "MARK ZHANG")

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

  /*ctx.font = '15px Muli'
  ctx.globalAlpha = 0.9
  ctx.textAlign = 'center'
  ctx.fillStyle = "white"
  ctx.fillText(imp_vars.player_data.difficulty_mode == "normal" ? "CHALLENGE MODE" : "NORMAL MODE", imp_vars.levelWidth/2, 70)*/
  
  ctx.restore()

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
    this.buttons["menu"].push(new SmallButton("MAIN GAME", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2-30, 200, 100, button_color, "blue",
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
    this.buttons["menu"].push(new SmallButton("TUTORIAL", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+220, 200, 50, button_color, "blue", function(){switch_game_state(new HowToPlayState("normal_tutorial"))}))
    //this.buttons["menu"].push(new SmallButton("ENCYCLOPEDIA", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+220, 200, 50, button_color, "blue",function(){switch_game_state(new EnemiesInfoState())}))
    this.buttons["menu"].push(new SmallButton("OPTIONS", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+120, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "options"}, 50)}))
    this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+170, 200, 50, button_color, "blue",function(){switch_game_state(new MusicPlayerState())}))
    this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+270, 200, 50, button_color, "blue",function(){switch_game_state(new LevelEditorState())}))
  } else {
    var button_y = imp_vars.levelHeight/2 + 50
    this.buttons["menu"].push(new IconButton("START GAME", 20, imp_vars.levelWidth/2 - 130, button_y, 210, 100, button_color, impulse_colors["impulse_blue"],
    function(){
      //_this.fade_out_duration = _this.fade_interval;
      imp_vars.player_data.difficulty_mode = "easy"
      save_game()
      
      if(imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode].game_numbers) {
        //setTimeout(function(){
          switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
        //}, _this.fade_interval)
      } else {
        var i = 1;
        while(i < 4 && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+i]) {
          i += 1
        }
        //setTimeout(function(){
          switch_game_state(new WorldMapState(i))
        //}, _this.fade_interval)
      }
    }, "player"))

    this.buttons["menu"].push(new IconButton("CHALLENGE", 20, imp_vars.levelWidth/2 + 130, button_y, 210, 100, button_color, impulse_colors["impulse_blue"],
    function(){
      //_this.fade_out_duration = _this.fade_interval;
      imp_vars.player_data.difficulty_mode = "normal"
      save_game()
      
      if(imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode].game_numbers) {
        //setTimeout(function(){
          switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
        //}, _this.fade_interval)
      } else {
        var i = 1;
        while(i < 4 && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+i]) {
          i += 1
        }
        //setTimeout(function(){
          switch_game_state(new WorldMapState(i))
        //}, _this.fade_interval)
      }
    }, "normal_mode"))

    //this.buttons["menu"].push(new SmallButton("PRACTICE", 20, imp_vars.levelWidth/2 - 100, imp_vars.levelHeight/2+20, 200, 50, button_color, "blue",function(){switch_game_state(new ClassicSelectState())}))
    this.buttons["menu"].push(new IconButton("TUTORIAL", 16, imp_vars.levelWidth/2 + 185, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState("normal_tutorial"))}, "tutorial"))
    this.buttons["menu"].push(new IconButton("CREDITS", 16, imp_vars.levelWidth/2, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){switch_game_state(new CreditsState())}, "credit"))
    this.buttons["menu"].push(new IconButton("OPTIONS", 16, imp_vars.levelWidth/2 - 185, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){setTimeout(function(){ set_dialog_box(new OptionsMenu(_this))}, 50)}, "gear"))

  }

  
  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+150, 200, 50, button_color, "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
  this.easy_mode_button = new SmallButton("NORMAL MODE", 20, imp_vars.levelWidth/2-100, imp_vars.levelHeight/2+120, 200, 50, button_color, "blue", function(){_this.change_mode("easy")})

  this.buttons["options"].push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("CHALLENGE MODE", 20, imp_vars.levelWidth/2+100, imp_vars.levelHeight/2+120, 200, 50, button_color, "blue",function(){_this.change_mode("normal")})
  this.buttons["options"].push(this.normal_mode_button)
  this.set_difficulty_button_underline();
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+170, 200, 50, button_color, "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+220, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "menu"}, 50)}))

  /*if (imp_vars.player_data.difficulty_mode == "easy") {
    var difficulty_change_button = new IconButton("NORMAL MODE", 16, imp_vars.levelWidth/2, 100, 100, 70, button_color, impulse_colors["impulse_blue"], function() {

    }, "normal_mode")  
  } else {
    var difficulty_change_button = new IconButton("CHALLENGE MODE", 16, imp_vars.levelWidth/2, 100, 100, 70, button_color, impulse_colors["impulse_blue"], function() {

    }, "challenge_mode")  
  }
  
  this.buttons["menu"].push(difficulty_change_button)*/
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

