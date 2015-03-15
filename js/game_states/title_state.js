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

  imp_params.impulse_music.play_bg(imp_params.songs["Menu"])

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
  process_and_draw_bg(dt);
}

TitleState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
   imp_params.bg_canvas.setAttribute("style", "")
   set_bg("Hive 0", imp_params.hive0_bg_opacity)
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
    draw_logo(ctx,imp_params.levelWidth/2, 200, "BETA")
  } else {
    draw_logo(ctx,imp_params.levelWidth/2, 200, "")
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
    this.buttons["menu"].push(new SmallButton("MAIN GAME", 20, imp_params.levelWidth/2 - 100, imp_params.levelHeight/2-30, 200, 100, button_color, "blue",
    function(){
      var i = 1;
      while(i < 4 && imp_params.player_data.world_rankings[imp_params.player_data.difficulty_mode]["world "+i]) {
        i += 1
      }
      if(imp_params.player_data.save_data[imp_params.player_data.difficulty_mode].game_numbers) {
        switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
      } else {
        switch_game_state(new WorldMapState(i))
      }
    }))
    this.buttons["menu"].push(new SmallButton("PRACTICE", 20, imp_params.levelWidth/2 - 100, imp_params.levelHeight/2+20, 200, 50, button_color, "blue",
      function(){
        var i = 1;
        while(i < 4 && imp_params.player_data.world_rankings[imp_params.player_data.difficulty_mode]["world "+i]) {
          i += 1
        }
        switch_game_state(new WorldMapState(i, true));
      }));
    this.buttons["menu"].push(new SmallButton("OPTIONS", 20, imp_params.levelWidth/2 - 100, imp_params.levelHeight/2+120, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "options"}, 50)}))
    this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, imp_params.levelWidth/2 - 100, imp_params.levelHeight/2+170, 200, 50, button_color, "blue",function(){switch_game_state(new MusicPlayerState())}))
    this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, imp_params.levelWidth/2 - 100, imp_params.levelHeight/2+270, 200, 50, button_color, "blue",function(){switch_game_state(new LevelEditorState())}))
    this.buttons["menu"].push(new SmallButton("QUESTS", 20, imp_params.levelWidth/2 - 100, imp_params.levelHeight/2+70, 200, 50, button_color, "blue",function(){switch_game_state(new QuestGameState())}))
  } else {
    var button_y = imp_params.levelHeight/2 + 50
    var _this = this;
    this.buttons["menu"].push(new IconButton("START GAME", 20, imp_params.player_data.first_time ? imp_params.levelWidth/2 : imp_params.levelWidth/2 - 130, button_y, 210, 100, button_color, impulse_colors["impulse_blue"],
    function(){

      //_this.fade_out_duration = _this.fade_interval;

      if(imp_params.player_data.save_data[imp_params.player_data.difficulty_mode] &&
         imp_params.player_data.save_data[imp_params.player_data.difficulty_mode].game_numbers) {
        //setTimeout(function(){
          _this.fader.set_animation("fade_out", function() {
            switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
          });
        //}, _this.fade_interval)
      } else {
        var i = 1;
        while(i < 4 && imp_params.player_data.world_rankings[imp_params.player_data.difficulty_mode]["world "+i]) {
          i += 1
        }

        if (_this.fader.animation == null && imp_params.player_data.difficulty_mode == "normal" && !imp_params.player_data.first_time) {
          switch_bg("Title Alt" + i, 250, get_world_map_bg_opacity(i))
        } else if (imp_params.player_data.first_time) {
          switch_bg(impulse_colors["world 0 dark"], 150, 1)
        }
        _this.fader.set_animation("fade_out", function() {
          switch_game_state(new WorldMapState(i, false))
        });
      }
    }, "player"));

    if (!imp_params.player_data.first_time) {
      this.buttons["menu"].push(new IconButton("PRACTICE", 20, imp_params.levelWidth/2 + 130, button_y, 210, 100, button_color, impulse_colors["impulse_blue"],
      function(){
        //_this.fade_out_duration = _this.fade_interval;
        var i = 1;
        while(i < 4 && imp_params.player_data.world_rankings[imp_params.player_data.difficulty_mode]["world "+i]) {
          i += 1
        }

        if (_this.fader.animation == null && imp_params.player_data.difficulty_mode == "normal") {
          switch_bg("Title Alt" + i, 250, get_world_map_bg_opacity(i))
        }
        _this.fader.set_animation("fade_out", function() {
          switch_game_state(new WorldMapState(i, true))
        });

        /*if(imp_params.player_data.save_data[imp_params.player_data.difficulty_mode].game_numbers) {
          _this.fader.set_animation("fade_out", function() {
            switch_game_state(new MainGameSummaryState(null, null, null, null, null, true))
          });
        } else {
          if (!imp_params.impulse_level_data["HIVE 1-1"].save_state["normal"].high_score) {
            _this.fader.set_animation("fade_out", function() {
              switch_game_state(new ChallengeModeIntroState());
            });
          } else {
          var i = 1;
            while(i < 4 && imp_params.player_data.world_rankings[imp_params.player_data.difficulty_mode]["world "+i]) {
              i += 1
            }
            _this.fader.set_animation("fade_out", function() {
              switch_game_state(new WorldMapState(i))
            });
          }
        }*/
      }, "normal_mode"))
  }

    this.buttons["menu"].push(new IconButton("OPTIONS", 16, imp_params.levelWidth/2 - 240, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        set_dialog_box(new OptionsMenu(_this))
      });
    }, "gear"))

    this.buttons["menu"].push(new IconButton("ACHIEVEMENTS", 16,
      imp_params.levelWidth/2,
      button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new QuestGameState(_this))
      });
    }, "quest"))

    this.buttons["menu"].push(new IconButton("CREDITS", 16, imp_params.levelWidth/2 + 240, button_y + 130, 100, 70, button_color, impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new CreditsState())
      });
    }, "credit"))



    /*this.buttons["menu"].push(new IconButton("SHARE", 16, imp_params.levelWidth - 50, imp_params.levelHeight - 50, 100, 70, impulse_colors["impulse_blue"], impulse_colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        set_dialog_box(new OptionsMenu(_this))
      });
    }, "fb"))*/
  }


  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, imp_params.levelWidth/2, imp_params.levelHeight/2+150, 200, 50, button_color, "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
  this.easy_mode_button = new SmallButton("NORMAL MODE", 20, imp_params.levelWidth/2-100, imp_params.levelHeight/2+120, 200, 50, button_color, "blue", function(){_this.change_mode("easy")})

  this.buttons["options"].push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("CHALLENGE MODE", 20, imp_params.levelWidth/2+100, imp_params.levelHeight/2+120, 200, 50, button_color, "blue",function(){_this.change_mode("normal")})
  this.buttons["options"].push(this.normal_mode_button)
  this.set_difficulty_button_underline();
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, imp_params.levelWidth/2, imp_params.levelHeight/2+170, 200, 50, button_color, "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, imp_params.levelWidth/2, imp_params.levelHeight/2+220, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "menu"}, 50)}))

  /*if (imp_params.player_data.difficulty_mode == "easy") {
    var difficulty_change_button = new IconButton("NORMAL MODE", 16, imp_params.levelWidth/2, 100, 100, 70, button_color, impulse_colors["impulse_blue"], function() {

    }, "normal_mode")
  } else {
    var difficulty_change_button = new IconButton("CHALLENGE MODE", 16, imp_params.levelWidth/2, 100, 100, 70, button_color, impulse_colors["impulse_blue"], function() {

    }, "challenge_mode")
  }

  this.buttons["menu"].push(difficulty_change_button)*/
  var fullscreenButton = new IconButton("", 20, imp_params.levelWidth - 20, 20, 30, 30, button_color, impulse_colors["impulse_blue"], function() {
    toggleFullScreen();
  }, "fullscreen_in_game");
  fullscreenButton.add_hover_overlay(new MessageBox("fullscreen_msg", impulse_colors["world 0 bright"], 0))
  this.buttons["menu"].push(fullscreenButton);
  var muteButton = new IconButton("", 20, imp_params.levelWidth - 50, 20, 30, 30, button_color, impulse_colors["impulse_blue"], function() {
     toggle_mute();
  }, "mute_in_game");
  muteButton.add_hover_overlay(new MessageBox("mute_msg", impulse_colors["world 0 bright"], 0))
  this.buttons["menu"].push(muteButton);
}

TitleState.prototype.change_mode = function(type) {
  imp_params.player_data.difficulty_mode = type;

  save_game();
  this.set_difficulty_button_underline();
}

TitleState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (imp_params.player_data.difficulty_mode == "easy");
  this.normal_mode_button.underline = (imp_params.player_data.difficulty_mode == "normal");
}
