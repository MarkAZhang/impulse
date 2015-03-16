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
  this.bg_drawn = false
  this.visibility = 0;

  this.state = "menu"

  this.setup_main_menu()

  imp_params.impulse_music.play_bg(audioData.songs["Menu"])

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
  this.trailer_fade_in = 0;
  this.trailer_fade_total = 8000;
  this.trailer_fade_delay = 7000;

  if (imp_params.debug.is_beta) {
    this.feedback_button = new SmallButton(
    "HELP US IMPROVE THE BETA", 20, 400, 570, 200, 50, impulse_colors["impulse_blue_dark"],
      impulse_colors["impulse_blue"], function() {
        window.open('http://goo.gl/forms/dmZlmtpJd0');
    });
    this.buttons["menu"].push(this.feedback_button);
  }
}

TitleState.prototype.process = function(dt) {
  this.fader.process(dt);
  this.trailer_fade_in += dt
  game_engine.processAndDrawBg(dt);
}

TitleState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
   layers.bgCanvas.setAttribute("style", "")
   game_engine.setBg("Hive 0", imp_params.hive0_bg_opacity)
   this.bg_drawn = true
  }

  ctx.save()

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }
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
  ctx.shadowBlur = 0
  if (imp_params.debug.is_beta) {
    uiRenderUtils.drawLogo(ctx,dom.levelWidth/2, 200, "BETA")
  } else {
    uiRenderUtils.drawLogo(ctx,dom.levelWidth/2, 200, "")
  }

  // TEXT FOR TRAILER
  /*ctx.save()
  ctx.globalAlpha = Math.min(1, (this.trailer_fade_in > this.trailer_fade_delay ? this.trailer_fade_in - this.trailer_fade_delay : 0)/ (this.trailer_fade_total - this.trailer_fade_delay))
  ctx.textAlign = 'center'
  ctx.font = '24px Muli'
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.fillText('PLAY FOR FREE AT', 400, 420)

  ctx.font = '20px Muli'
  ctx.fillText("www.play-impulse.com", 400, 450)
  ctx.font = '12px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("'Half Past Nothing' by Schemawound", 400, 550)
  ctx.restore()*/

  //ctx.shadowBlur = 5
  for(var i = 0; i < this.buttons[this.state].length; i++)
  {
    this.buttons[this.state][i].draw(ctx)
  }

  for(var i = 0; i < this.buttons[this.state].length; i++)
  {
    this.buttons[this.state][i].post_draw(ctx)
  }

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
  _this = this;
  this.buttons["menu"] = []
  var button_color = "white"//impulse_colors["impulse_blue"]

  if(imp_params.debug.dev && imp_params.debug.old_menu) {
    this.buttons["menu"].push(new SmallButton("MAIN GAME", 20, dom.levelWidth/2 - 100, dom.levelHeight/2-30, 200, 100, button_color, "blue",
    function(){
      var i = 1;
      while(i < 4 && saveData.worldRankings[saveData.difficultyMode]["world "+i]) {
        i += 1
      }
      if(saveData.savedGame.game_numbers) {
        game_engine.switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
      } else {
        game_engine.switch_game_state(new WorldMapState(i))
      }
    }))
    this.buttons["menu"].push(new SmallButton("PRACTICE", 20, dom.levelWidth/2 - 100, dom.levelHeight/2+20, 200, 50, button_color, "blue",
      function(){
        var i = 1;
        while(i < 4 && saveData.worldRankings[saveData.difficultyMode]["world "+i]) {
          i += 1
        }
        game_engine.switch_game_state(new WorldMapState(i, true));
      }));
    this.buttons["menu"].push(new SmallButton("OPTIONS", 20, dom.levelWidth/2 - 100, dom.levelHeight/2+120, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "options"}, 50)}))
    this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, dom.levelWidth/2 - 100, dom.levelHeight/2+170, 200, 50, button_color, "blue",function(){game_engine.switch_game_state(new MusicPlayerState())}))
    this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, dom.levelWidth/2 - 100, dom.levelHeight/2+270, 200, 50, button_color, "blue",function(){game_engine.switch_game_state(new LevelEditorState())}))
    this.buttons["menu"].push(new SmallButton("QUESTS", 20, dom.levelWidth/2 - 100, dom.levelHeight/2+70, 200, 50, button_color, "blue",function(){game_engine.switch_game_state(new QuestGameState())}))
  } else {
    var button_y = dom.levelHeight/2 + 50
    var _this = this;
    this.buttons["menu"].push(new IconButton("START GAME", 20, saveData.firstTime ? dom.levelWidth/2 : dom.levelWidth/2 - 130, button_y, 210, 100, button_color, impulse_colors["impulse_blue"],
    function(){

      //_this.fade_out_duration = _this.fade_interval;

      if(saveData.savedGame &&
         saveData.savedGame.game_numbers) {
        //setTimeout(function(){
          _this.fader.set_animation("fade_out", function() {
            game_engine.switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
          });
        //}, _this.fade_interval)
      } else {
        var i = 1;
        while(i < 4 && saveData.worldRankings[saveData.difficultyMode]["world "+i]) {
          i += 1
        }

        if (_this.fader.animation == null && saveData.difficultyMode == "normal" && !saveData.firstTime) {
          game_engine.switchBg("Title Alt" + i, 250, uiRenderUtils.getWorldMapBgOpacity(i))
        } else if (saveData.firstTime) {
          game_engine.switchBg(impulse_colors["world 0 dark"], 150, 1)
        }
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(new WorldMapState(i, false))
        });
      }
    }, "player"));

    if (!saveData.firstTime) {
      this.buttons["menu"].push(new IconButton("PRACTICE", 20, dom.levelWidth/2 + 130, button_y, 210, 100, button_color, impulse_colors["impulse_blue"],
      function(){
        //_this.fade_out_duration = _this.fade_interval;
        var i = 1;
        while(i < 4 && saveData.worldRankings[saveData.difficultyMode]["world "+i]) {
          i += 1
        }

        if (_this.fader.animation == null && saveData.difficultyMode == "normal") {
          game_engine.switchBg("Title Alt" + i, 250, uiRenderUtils.getWorldMapBgOpacity(i))
        }
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(new WorldMapState(i, true))
        });

      }, "normal_mode"))
  }

    this.buttons["menu"].push(new IconButton("OPTIONS", 16, dom.levelWidth/2 - 240, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new OptionsMenu(_this))
      });
    }, "gear"))

    this.buttons["menu"].push(new IconButton("ACHIEVEMENTS", 16,
      dom.levelWidth/2,
      button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new QuestGameState(_this))
      });
    }, "quest"))

    this.buttons["menu"].push(new IconButton("CREDITS", 16, dom.levelWidth/2 + 240, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new CreditsState())
      });
    }, "credit"))
  }


  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, dom.levelWidth/2, dom.levelHeight/2+150, 200, 50, button_color, "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
  this.easy_mode_button = new SmallButton("NORMAL MODE", 20, dom.levelWidth/2-100, dom.levelHeight/2+120, 200, 50, button_color, "blue", function(){_this.change_mode("easy")})

  this.buttons["options"].push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("CHALLENGE MODE", 20, dom.levelWidth/2+100, dom.levelHeight/2+120, 200, 50, button_color, "blue",function(){_this.change_mode("normal")})
  this.buttons["options"].push(this.normal_mode_button)
  this.set_difficulty_button_underline();
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, dom.levelWidth/2, dom.levelHeight/2+170, 200, 50, button_color, "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, dom.levelWidth/2, dom.levelHeight/2+220, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "menu"}, 50)}))

  /*if (saveData.difficultyMode == "easy") {
    var difficulty_change_button = new IconButton("NORMAL MODE", 16, dom.levelWidth/2, 100, 100, 70, button_color, impulse_colors["impulse_blue"], function() {

    }, "normal_mode")
  } else {
    var difficulty_change_button = new IconButton("CHALLENGE MODE", 16, dom.levelWidth/2, 100, 100, 70, button_color, impulse_colors["impulse_blue"], function() {

    }, "challenge_mode")
  }

  this.buttons["menu"].push(difficulty_change_button)*/
  var fullscreenButton = new IconButton("", 20, dom.levelWidth - 20, 20, 30, 30, button_color, impulse_colors["impulse_blue"], function() {
    dom.toggleFullScreen();
  }, "fullscreen_in_game");
  fullscreenButton.add_hover_overlay(new MessageBox("fullscreen_msg", impulse_colors["world 0 bright"], 0))
  this.buttons["menu"].push(fullscreenButton);
  var muteButton = new IconButton("", 20, dom.levelWidth - 50, 20, 30, 30, button_color, impulse_colors["impulse_blue"], function() {
     game_engine.toggleMute();
  }, "mute_in_game");
  muteButton.add_hover_overlay(new MessageBox("mute_msg", impulse_colors["world 0 bright"], 0))
  this.buttons["menu"].push(muteButton);
}

TitleState.prototype.change_mode = function(type) {
  saveData.difficultyMode = type;

  saveData.saveGame();
  this.set_difficulty_button_underline();
}

TitleState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (saveData.difficultyMode == "easy");
  this.normal_mode_button.underline = (saveData.difficultyMode == "normal");
}
