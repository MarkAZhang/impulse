    // ENEMY BOX BUG IS NOT RESOLVED...

var DialogBox = function() {

}

DialogBox.prototype.init = function(w, h) {
  this.w = w
  this.h = h
  this.x = dom.canvasWidth/2
  this.y = dom.canvasHeight/2
  this.buttons = []
  this.solid = true;

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });

}

DialogBox.prototype.process = function(dt) {
  this.fader.process(dt);
}

DialogBox.prototype.draw = function(ctx) {
  if (imp_params.debug.hide_pause_menu) return;
  ctx.save();
  ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
  ctx.fillRect(dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight)
  ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num ? this.world_num : 0)
  ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight)
  ctx.restore();
  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  if(this.solid) {
    ctx.beginPath()
    ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.stroke()
  }
  this.additional_draw(ctx)

  ctx.restore();
}

DialogBox.prototype.draw_bg = function() {}

DialogBox.prototype.additional_draw = function(ctx) {}

DialogBox.prototype.on_mouse_move = function(x, y) {}
DialogBox.prototype.on_mouse_down = function(x, y) {}
DialogBox.prototype.on_mouse_up = function(x, y) {}
DialogBox.prototype.on_click = function(x, y) {}
DialogBox.prototype.on_right_mouse_down = function(x, y) {}
DialogBox.prototype.on_right_mouse_up = function(x, y) {}
DialogBox.prototype.on_right_click = function(x, y) {}
DialogBox.prototype.on_key_down = function(x, y) {}
DialogBox.prototype.on_key_up = function(x, y) {}

PauseMenu.prototype = new DialogBox()

PauseMenu.prototype.constructor = PauseMenu

function PauseMenu(level, world_num, game_numbers, game_state, visibility_graph) {
  this.level = level
  this.game_numbers = game_numbers
  this.game_state = game_state
  this.world_num = world_num
  this.level_name = this.level.level_name
  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  this.visibility_graph = visibility_graph
  this.init(800, 600)
  this.solid = false;
  this.bg_color = "black"//impulse_colors["world "+this.world_num +" dark"]
  this.bright_color = impulse_colors["world "+this.world_num +" bright"]
  this.color = impulse_colors["world "+this.world_num]
  this.lite_color = this.game_state.lite_color

  this.drawn_enemies = null

  if(this.is_boss_level) {
    this.drawn_enemies = {}
    //this.drawn_enemies[levelData[this.level_name].dominant_enemy] = null
    this.num_enemy_type = 0
  }
  else {
    this.drawn_enemies = levelData[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in levelData[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40
  this.add_buttons()
  //this.draw_bg();
}

PauseMenu.prototype.draw_bg = function() {
}

PauseMenu.prototype.add_buttons = function() {

  this.buttons = []
  var resume_x_location = 0;
  var first_row_y = 350;
  var second_row_y = 500;
  var hover_color = "white";
  if (this.world_num == 0 || this.world_num == undefined) {
    hover_color = impulse_colors["impulse_blue"];
  }
  if(this.world_num != 0) {

    if(!this.level.main_game) {
      this.restart_button = new IconButton("RETRY", 16, this.x - 173, this.y - this.h/2 + second_row_y, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
        _this.restart_practice()
      }}(this), "retry")
      this.buttons.push(this.restart_button)
      this.restart_button.keyCode = controls.keys.RESTART_KEY;

      if(saveData.optionsData.control_hand == "right") {
        this.restart_button.extra_text = "R KEY"
      } else {
        this.restart_button.extra_text = "SHIFT KEY"
      }

      this.quit_button = new IconButton("QUIT", 16, this.x + 180, this.y - this.h/2 + second_row_y, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
        _this.quit_practice()
      }}(this), "quit")
      this.buttons.push(this.quit_button)

    } else {
        this.save_and_quit_button = new IconButton("SAVE & QUIT", 16, this.x + 170, this.y - this.h/2 + second_row_y, 120, 65, this.bright_color, hover_color, function(_this) { return function() {
          _this.save_and_quit_main_game()
        }}(this), "save")

      this.buttons.push(this.save_and_quit_button)

      this.quit_button = new IconButton("QUIT", 16, this.x - 170, this.y - this.h/2 + second_row_y, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
        _this.quit_main_game()
      }}(this), "quit")
      this.buttons.push(this.quit_button)
    }
    this.options_button = new IconButton("OPTIONS", 16, this.x, this.y - this.h/2 + second_row_y, 100, 65, this.bright_color, hover_color, function(_this) { return function() {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new OptionsMenu(_this))
      });
    }}(this), "options")
    this.options_button.bg_color = this.bg_color
    this.buttons.push(this.options_button)

  } else {
    this.quit_button = new IconButton(this.world_num == 0 && saveData.firstTime ? "SKIP TUTORIAL" : "QUIT",
        16, this.x + 100, this.y - this.h/2 + second_row_y, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
      _this.quit_tutorial()
    }}(this), "quit")
    this.buttons.push(this.quit_button)

    this.options_button = new IconButton("OPTIONS", 16, this.x - 100, this.y - this.h/2 + second_row_y, 100, 65, this.bright_color, hover_color, function(_this) { return function() {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new OptionsMenu(_this))
      });
    }}(this), "options")
    this.options_button.bg_color = this.bg_color
    this.buttons.push(this.options_button)

  }

  // resume button.
  this.resume_button = new IconButton("RESUME", 24, this.x, this.y - this.h/2 + first_row_y, 150, 100, this.bright_color, hover_color, function(_this) { return function() {

    _this.game_state.toggle_pause()
  }}(this), "resume")
  this.resume_button.keyCode = controls.keys.PAUSE;
  this.resume_button.sKeyCode = controls.keys.SECONDARY_PAUSE;

  if(saveData.optionsData.control_hand == "right") {
    this.resume_button.extra_text = "Q KEY"
  } else {
    this.resume_button.extra_text = "ENTER KEY"
  }
  this.buttons.push(this.resume_button)



  var num_row = 12

  var i = 0

  for(var j in this.drawn_enemies) {

    var k = 0
    var num_in_this_row = 0

    while(k < i+1 && k < this.num_enemy_type) {
      k+=num_row
    }

    if(k <= this.num_enemy_type) {
      num_in_this_row = num_row
    }
    else {
      num_in_this_row = this.num_enemy_type - (k - num_row)
    }
    var diff = (i - (k - num_row)) - (num_in_this_row - 1)/2

    var h_diff = Math.floor(i/num_row) - (Math.ceil(this.num_enemy_type/num_row) - 1)/2

    var cur_x =  this.x + (this.enemy_image_size+10) * diff
    var cur_y = this.y - this.h/2 + 200 + this.enemy_image_size * h_diff
    var _this = this
    var enemy_button = new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size,
      this.level.lite_color, (function(enemy, _this) { return function() {
        _this.fader.set_animation("fade_out", function() {
          game_engine.set_dialog_box(new EnemyBox(enemy, _this))
        });
      }})(j, this)
    );
    enemy_button.bcolor = this.bright_color;
    this.buttons.push(enemy_button);
    i+=1
  }
  var fullscreenButton = new IconButton("", 20, this.x + this.w /2 - 20, this.y - this.h/2 + 20, 30, 30, this.bright_color, hover_color, function() {
    dom.toggleFullScreen();
  }, "fullscreen_in_game");
  this.buttons.push(fullscreenButton);
  var muteButton = new IconButton("", 20, this.x + this.w / 2 - 50, this.y - this.h/2 + 20, 30, 30, this.bright_color, hover_color, function() {
     game_engine.toggleMute();
  }, "mute_in_game");
  this.buttons.push(muteButton);
}

PauseMenu.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.beginPath()
  ctx.textAlign = "center";

  if(this.level.main_game && this.game_state.hive_numbers.continues > 0) {
    ctx.font = '14px Muli'
    ctx.fillStyle = "red"
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("CONTINUES: "+this.game_state.hive_numbers.continues,this.x, this.y - this.h/2 + 70)
  }

  ctx.font = '32px Muli';
  ctx.shadowBlur = 0;
  ctx.shadowColor = this.bright_color;
  ctx.fillStyle = this.bright_color;
  ctx.fillText("MENU", this.x, this.y - this.h/2 + 100)

  ctx.font = '16px Muli';
  if(this.num_enemy_type > 0) {
    ctx.fillText("DETAILED ENEMY INFO", this.x, this.y - this.h/2 + 165)
  }

  ctx.textAlign = "center";
  ctx.shadowBlur = 0

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  ctx.restore()
}

PauseMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }
}

PauseMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}

PauseMenu.prototype.quit_practice = function() {
  game_engine.switch_game_state(new RewardGameState(this.game_state.hive_numbers, this.game_state.main_game, {
      game_numbers: this.game_state.game_numbers,
      level: this.game_state.level,
      world_num: this.game_state.world_num,
      visibility_graph: this.game_state.visibility_graph,
      victory: false
    }))
  game_engine.clear_dialog_box()
}
PauseMenu.prototype.restart_practice = function() {
  layers.bgCtx.translate(dom.sideBarWidth, 0)//allows us to have a topbar
  this.level.impulse_game_state= null
  this.level.draw_bg(layers.bgCtx)
  layers.bgCtx.translate(-dom.sideBarWidth, 0)
  var hive_numbers = new HiveNumbers(this.game_state.world_num, false)
  game_engine.switch_game_state(new ImpulseGameState(this.game_state.world_num, this.level, this.visibility_graph, hive_numbers, false /*is_main_game*/, false /*first_time*/))
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.quit_main_game = function() {
  saveData.clearSavedPlayerGame();
  game_engine.switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null))
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.quit_tutorial = function() {
   game_engine.switch_game_state(new RewardGameState(this.game_state.hive_numbers, this.game_state.main_game, {
      game_numbers: this.game_state.game_numbers,
      level: this.game_state.level,
      world_num: this.game_state.world_num,
      visibility_graph: this.game_state.visibility_graph,
      is_tutorial: true,
      first_time_tutorial: saveData.firstTime,
      victory: true,
      skipped: true
    }))
   game_engine.clear_dialog_box()
}

PauseMenu.prototype.save_and_quit_main_game = function() {
  saveData.savePlayerGame(this.game_state.hive_numbers);
  game_engine.switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null, true, true))
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.on_key_down = function(keyCode) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_key_down(keyCode)
  }

}

OptionsMenu.prototype = new DialogBox()

OptionsMenu.prototype.constructor = OptionsMenu

function OptionsMenu(previous_menu) {
  this.init(800, 600)
  this.game_state = previous_menu.game_state
  this.solid = false;
  this.world_num = previous_menu.world_num

  this.options_y_line_up = 133

  var hover_color = "white";
  if (this.world_num == 0 || this.world_num == undefined) {
    hover_color = impulse_colors["impulse_blue"];
  }

  this.previous_menu = previous_menu
  if (this.previous_menu instanceof PauseMenu) {
    this.bg_color = this.previous_menu.bg_color
    this.color = this.previous_menu.color
    this.lite_color = this.previous_menu.lite_color
    this.bright_color = this.previous_menu.bright_color
  } else {
    this.bg_color = impulse_colors["world 0 dark"]
    this.color = impulse_colors["world 0"]
    this.lite_color = impulse_colors["world 0 lite"]
    this.bright_color = impulse_colors["world 0 bright"]
    this.draw_bg();
  }

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
  _this.fader.set_animation("fade_out", function() {
    if(_this.previous_menu instanceof PauseMenu) {
      _this.previous_menu.add_buttons()
      game_engine.set_dialog_box(_this.previous_menu)
      _this.previous_menu.fader.set_animation("fade_in");
    } else {
      if (_this.previous_menu instanceof TitleState) {
        _this.previous_menu.fader.set_animation("fade_in");
      }
      game_engine.clear_dialog_box()
    }
  });

  }}(this), "back");

  var controls_x_value = this.x
  if (this.previous_menu instanceof TitleState) {
    this.delete_button= new IconButton("DELETE GAME DATA", 20, this.x + 150, this.y + 120, 200, 100, this.bright_color, "red", function(_this) { return function() {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new DeleteDataDialog(_this))
      });
    }}(this), "delete")
    this.buttons.push(this.delete_button)
    controls_x_value = this.x - 150
  }
  this.buttons.push(this.back_button)
  this.controls_button = new IconButton("CHANGE CONTROLS", 20, controls_x_value, this.y + 120, 200, 100, this.bright_color, hover_color, function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      game_engine.set_dialog_box(new ControlsMenu(_this))
    });
  }}(this), "controls")
  this.buttons.push(this.controls_button)

  this.current_help_text = ""

  var button_width = 300;

  this.music_button = new SliderOptionButton("GAME MUSIC", this.x, this.y - this.h/2 + this.options_y_line_up, button_width, 30, this.bright_color, "white", function(value) {
    imp_params.impulse_music.change_bg_volume(Math.ceil(Math.pow(value, 2) * 100), true) // sqrt it to get a better curve
  }, Math.pow(saveData.optionsData.bg_music_volume / 100, 0.5));
  this.music_button.special_mode = imp_params.impulse_music.mute
  this.music_button.add_hover_overlay(new MessageBox("option_game_music", "white", this.world_num))
  this.buttons.push(this.music_button)

  this.effects_button = new SliderOptionButton("SOUND EFFECTS", this.x, this.y - this.h/2 + this.options_y_line_up + 30, button_width, 30, this.bright_color, "white", function(value) {
    imp_params.impulse_music.change_effects_volume(Math.ceil(Math.pow(value, 3) * 100)) // sqrt it to get a better curve
  }, Math.pow(saveData.optionsData.effects_volume / 100, 0.333));
  this.effects_button.special_mode = imp_params.impulse_music.mute
  this.effects_button.add_hover_overlay(new MessageBox("option_sound_effects", "white", this.world_num))
  this.buttons.push(this.effects_button)

  this.fullscreen_button = new CheckboxOptionButton("FULLSCREEN", this.x, this.y - this.h/2 + this.options_y_line_up + 60, button_width, 30, this.bright_color, "white", function(on) {
    dom.toggleFullScreen();
  }, function() {
    return dom.IsInFullScreen()
  });
  this.fullscreen_button.add_hover_overlay(new MessageBox("option_fullscreen", "white", this.world_num))
  this.fullscreen_button.change_checkbox_on_click = false;
  this.buttons.push(this.fullscreen_button)

  button = new CheckboxOptionButton("PARTICLE EFFECTS", this.x, this.y - this.h/2 + this.options_y_line_up + 90, button_width, 30, this.bright_color, "white", function(on) {
    saveData.optionsData.explosions = !saveData.optionsData.explosions
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.explosions;
  });
  button.add_hover_overlay(new MessageBox("option_particle_effects", "white", this.world_num))
  this.buttons.push(button)

  button = new CheckboxOptionButton("SCORE LABELS", this.x, this.y - this.h/2 + this.options_y_line_up + 120, button_width, 30, this.bright_color, "white", function(on) {
    saveData.optionsData.score_labels = !saveData.optionsData.score_labels
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.score_labels;
  });
  button.add_hover_overlay(new MessageBox("option_score_labels", "white", this.world_num))
  this.buttons.push(button)

  button = new CheckboxOptionButton("MULTIPLIER DISPLAY", this.x, this.y - this.h/2 + this.options_y_line_up + 150, button_width, 30, this.bright_color, "white", function(on) {
    saveData.optionsData.multiplier_display = !saveData.optionsData.multiplier_display
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.multiplier_display;
  });
  button.add_hover_overlay(new MessageBox("option_multiplier_display", "white", this.world_num))
  this.buttons.push(button)

  button = new CheckboxOptionButton("IMPULSE SHADOW", this.x, this.y - this.h/2 + this.options_y_line_up + 180, button_width, 30, this.bright_color, "white", function(on) {
    saveData.optionsData.impulse_shadow = !saveData.optionsData.impulse_shadow
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.impulse_shadow;
  });
  button.add_hover_overlay(new MessageBox("option_impulse_shadow", "white", this.world_num))
  this.buttons.push(button)
  var me = this;
  if(this.game_state instanceof ImpulseGameState && this.game_state.level.main_game && this.world_num > 0 && saveData.difficultyMode == "normal") {
    button = new CheckboxOptionButton("SPEED RUN COUNTDOWN", this.x, this.y - this.h/2 + this.options_y_line_up + 210, button_width, 30, this.bright_color, "white", function(on) {
      saveData.optionsData.speed_run_countdown = !saveData.optionsData.speed_run_countdown;
      saveData.saveGame();
    }, function() {
      return saveData.optionsData.speed_run_countdown;
    });
    button.add_hover_overlay(new MessageBox("option_speed_run", "white", this.world_num))
    this.buttons.push(button)
  }

  this.fader.set_animation("fade_in");
}

OptionsMenu.prototype.draw_bg = function() {
  var world_bg_ctx = layers.worldMenuBgCanvas.getContext('2d')
  draw_bg(world_bg_ctx, 0, 0, dom.levelWidth, dom.levelHeight, "Hive 0")
}

OptionsMenu.prototype.additional_draw = function(ctx) {

  ctx.save()
  ctx.textAlign = "center"
  ctx.font = '32px Muli';
  ctx.shadowBlur = 0;
  ctx.shadowColor = this.bright_color;
  ctx.fillStyle = this.bright_color;
  ctx.fillText("OPTIONS", this.x, this.y - this.h/2 + 100)
  ctx.shadowBlur = 0
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].post_draw(ctx)
  }

  ctx.textAlign = 'center'
  if(this.current_help_text) {
    ctx.font = '14px Muli'
    if (this.game_state instanceof ImpulseGameState && this.game_state.level.main_game ) {
      ctx.fillText(this.current_help_text, this.x, this.y - this.h/2 + this.options_y_line_up + 180)
    } else {
      ctx.fillText(this.current_help_text, this.x, this.y - this.h/2 + this.options_y_line_up + 150)
    }

  }

  //this.music_volume_slider.draw(ctx)
  //this.effects_volume_slider.draw(ctx)

  ctx.restore()
}

OptionsMenu.prototype.sendFullscreenSignal = function(isFullscreen) {
  this.fullscreen_button.checkbox.checked = isFullscreen;
}

OptionsMenu.prototype.sendMuteSignal = function(isMute) {
  this.effects_button.special_mode = isMute;
  this.music_button.special_mode = isMute;
}


OptionsMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }

  //this.music_volume_slider.on_mouse_move(x,y)
  //this.effects_volume_slider.on_mouse_move(x,y)
}

OptionsMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
  //this.music_volume_slider.on_click(x,y)
  //this.effects_volume_slider.on_click(x,y)
}

OptionsMenu.prototype.on_key_down = function(keyCode) {
  /*if(keyCode == 66 || keyCode == 79) {
    game_engine.set_dialog_box(this.previous_menu)
  }*/
}

OptionsMenu.prototype.on_mouse_down = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_down(x,y)
  }
  //this.music_volume_slider.on_mouse_down(x,y)
  //this.effects_volume_slider.on_mouse_down(x,y)
}
OptionsMenu.prototype.on_mouse_up = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_up(x,y)
  }
  //this.music_volume_slider.on_mouse_up(x,y)
  //this.effects_volume_slider.on_mouse_up(x,y)
  //imp_params.impulse_music.change_bg_volume(this.convert_slider_value(this.music_volume_slider.value))
  //imp_params.impulse_music.change_effects_volume(this.convert_slider_value(this.effects_volume_slider.value))
}

OptionsMenu.prototype.convert_slider_value = function(value) {
  return Math.pow(Math.E, value * Math.log(100))
}

ControlsMenu.prototype = new DialogBox()

ControlsMenu.prototype.constructor = ControlsMenu

function ControlsMenu(previous_menu) {
  this.init(800, 600)
  this.game_state = previous_menu.game_state
  this.solid = false;
  this.previous_menu = previous_menu

  this.bg_color = this.previous_menu.bg_color
  this.lite_color = this.previous_menu.lite_color
  this.bright_color = this.previous_menu.bright_color
  this.color = this.previous_menu.color

  this.world_num = previous_menu.world_num

  var hover_color = "white";
  if (this.world_num == 0 || this.world_num == undefined) {
    hover_color = impulse_colors["impulse_blue"];
  }

  this.current_hand = saveData.optionsData.control_hand
  this.current_scheme = saveData.optionsData.control_scheme
  var _this = this;
  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      game_engine.set_dialog_box(_this.previous_menu)
      _this.previous_menu.fader.set_animation("fade_in");
    });
  }}(this), "back")


  this.control_buttons = {}

  this.control_buttons["left mouse"] = new IconButton("LEFT-HAND MOUSE", 16, this.x - 200, this.y - this.h/2 + 135, 200, 100, this.bright_color, hover_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "left"
    saveData.optionsData.control_scheme = "mouse"
    saveData.saveGame()
    setKeyBindings()
  }}(this), "left_mouse")

  this.control_buttons["right keyboard"] = new IconButton("KEYBOARD-ONLY", 16, this.x, this.y - this.h/2 + 135, 200, 100, this.bright_color, hover_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "right"
    saveData.optionsData.control_scheme = "keyboard"
    saveData.saveGame()
    setKeyBindings()
  }}(this), "keyboard")

  this.control_buttons["right mouse"] = new IconButton("RIGHT-HAND MOUSE", 16, this.x + 200, this.y - this.h/2 + 135, 200, 100, this.bright_color, hover_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "right"
    saveData.optionsData.control_scheme = "mouse"
    saveData.saveGame()
    setKeyBindings()
  }}(this), "right_mouse")

  this.buttons.push(this.control_buttons["left mouse"])
  this.buttons.push(this.control_buttons["right mouse"])
  this.buttons.push(this.control_buttons["right keyboard"])
  /*this.buttons.push(new SmallButton("RIGHT-HANDED KEYBOARD-ONLY", 16, this.x + 200, this.y - this.h/2 + 175, 200, 30, this.lite_color, this.lite_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "right"
    saveData.optionsData.control_scheme = "keyboard"
    saveData.saveGame()
    _this.adjust_underlines()
  }}(this)))*/

  this.buttons.push(this.back_button)

  /*this.music_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 115, 200, 5, this.lite_color)
  this.music_volume_slider.value = Math.log(imp_params.impulse_music.bg_music_volume)/Math.log(100.0)

  this.effects_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 145, 200, 5, this.lite_color)
  this.effects_volume_slider.value = Math.log(imp_params.impulse_music.effects_volume)/Math.log(100.0)*/
  this.adjust_colors()

  this.fader.set_animation("fade_in");
}


ControlsMenu.prototype.on_mouse_move = function(x, y) {
  this.current_hover = null
  for(var i in this.control_buttons) {
    this.control_buttons[i].on_mouse_move(x,y)
    if (this.control_buttons[i].mouseOver) {
      this.current_hover = i
    }
  }
  this.back_button.on_mouse_move(x, y)
  this.adjust_colors()
}

ControlsMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}



ControlsMenu.prototype.adjust_colors = function() {
  for(var i in this.control_buttons) {
    this.control_buttons[i].color = this.bright_color
    this.control_buttons[i].border = false
  }
  if (this.current_hover) {
    this.control_buttons[this.current_hover].color = this.bright_color
  } else {
    this.control_buttons[saveData.optionsData.control_hand +" "+saveData.optionsData.control_scheme].color = this.bright_color
  }
  this.control_buttons[saveData.optionsData.control_hand +" "+saveData.optionsData.control_scheme].border = true
}

ControlsMenu.prototype.additional_draw = function(ctx) {

  ctx.save()
  ctx.textAlign = "center"
  ctx.font = '32px Muli';
  //ctx.shadowBlur = 10;
  ctx.shadowColor = this.bright_color;
  ctx.fillStyle = this.bright_color;
  ctx.fillText("CONTROLS", this.x, this.y - this.h/2 + 50)

  ctx.font = '18px Muli';
  ctx.fillText("SELECT SCHEME", this.x, this.y - this.h/2 + 75)
  ctx.shadowBlur = 0
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }

  var currentControls = this.current_hover;

  if (currentControls == null) {
    if(saveData.optionsData.control_hand == "right" && saveData.optionsData.control_scheme == "mouse") {
      currentControls = "right mouse"
    }
    if(saveData.optionsData.control_hand == "left" && saveData.optionsData.control_scheme == "mouse") {
      currentControls = "left mouse"
    }
    if(saveData.optionsData.control_hand == "right" && saveData.optionsData.control_scheme == "keyboard") {
      currentControls = "right keyboard"
    }
  }
  ctx.globalAlpha *= 0.6
  if(currentControls == "right mouse") {
    uiRenderUtils.drawArrowKeys(ctx, this.x - 200, this.y - this.h/2 + 300, 50, this.bright_color, ["W", "A", "S", "D"])
    ctx.fillText("MOVE", this.x - 200, this.y - this.h/2 + 360)
    uiRenderUtils.drawMouse(ctx, this.x + 200, this.y - this.h/2 + 270, 75, 100, this.bright_color)
    ctx.fillText("IMPULSE", this.x + 200, this.y - this.h/2 + 360)

    renderUtils.drawRoundedRect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.bright_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(currentControls == "left mouse") {
    uiRenderUtils.drawMouse(ctx, this.x - 200, this.y - this.h/2 + 270,  75, 100, this.bright_color)
    ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)

    uiRenderUtils.drawArrowKeys(ctx, this.x + 200, this.y - this.h/2 + 300, 50, this.bright_color)
    ctx.fillText("MOVE", this.x + 200, this.y - this.h/2 + 360)

    renderUtils.drawRoundedRect(ctx, this.x, this.y - this.h/2 + 430, 120, 40, 10, this.bright_color)
    ctx.fillText("SHIFT", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(currentControls == "right keyboard") {
    uiRenderUtils.drawArrowKeys(ctx, this.x - 200, this.y - this.h/2 + 300, 50, this.bright_color, ["W", "A", "S", "D"])
    ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)

    uiRenderUtils.drawArrowKeys(ctx, this.x + 200, this.y - this.h/2 + 300, 50, this.bright_color)
    ctx.fillText("MOVE", this.x + 200, this.y - this.h/2 + 360)
    renderUtils.drawRoundedRect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.bright_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  ctx.restore()
}

ControlsMenu.prototype.on_key_down = function(keyCode) {
  /*if(keyCode == 66 || keyCode == 79) {
    game_engine.set_dialog_box(this.previous_menu)
  }*/
}


EnemyBox.prototype = new DialogBox()

EnemyBox.prototype.constructor = EnemyBox

function EnemyBox(enemy_name, previous_menu) {
  this.init(800, 600)

  this.solid = false;
  if(previous_menu instanceof DialogBox){
    this.game_state = previous_menu.game_state
    this.bg_color = previous_menu.bg_color
    this.color = previous_menu.color

    this.lite_color = previous_menu.lite_color
    this.bright_color = previous_menu.bright_color
    this.world_num = this.game_state.world_num
  } else if(previous_menu instanceof GameState) {
    this.bg_color = "black"//impulse_colors["world "+previous_menu.world_num+" dark"]
    this.lite_color = impulse_colors["world "+previous_menu.world_num+" lite"]
    this.bright_color = impulse_colors["world "+previous_menu.world_num +" bright"]
    this.color = impulse_colors["world "+previous_menu.world_num]
    this.world_num = previous_menu.world_num
  }

  var hover_color = "white";
  if (this.world_num == 0 || this.world_num == undefined) {
    hover_color = impulse_colors["impulse_blue"];
  }

  this.previous_menu = previous_menu

  this.enemy_name = enemy_name

  this.true_name = enemy_name

  if(enemyData[this.enemy_name].true_name) {
    this.true_name = enemyData[this.enemy_name].true_name
  }
  this.max_enemy_d = 50
  this.special_ability = null
  this.other_notes = null

  this.w = 600
  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.bright_color, hover_color, function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      if(_this.previous_menu instanceof DialogBox) {
        game_engine.set_dialog_box(_this.previous_menu)
        _this.previous_menu.fader.set_animation("fade_in");
      } else if(_this.previous_menu instanceof GameState) {
        //game_engine.switch_game_state(_this.previous_menu)
        game_engine.clear_dialog_box()
        _this.previous_menu.fader.set_animation("fade_in");
      }
    });
  }}(this), "back")

  this.buttons.push(this.back_button)


  this.color = impulse_colors["world "+this.world_num]
  this.text_width = 500

  this.enemy_info = enemyData[this.enemy_name].enemy_info

  this.current_lines = null

  this.num_pages = this.enemy_info.length

  this.cur_page = 0
  /*var gravity = new box_2d.b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  var world = new box_2d.b2World(gravity, doSleep);

  /*var temp_enemy = new (enemyData[this.enemy_name].className)(world, 0, 0, 0, 0)

  this.def_value = Math.min(temp_enemy.body.m_mass/5.5, 1)

  this.atk_value = enemyData[this.enemy_name].attack_rating/10

  this.spd_value = ((enemyData[this.enemy_name].force/temp_enemy.body.m_mass)/enemyData[this.enemy_name].lin_damp)/.35*/

  if(this.enemy_name == "spear") this.spd_value = 1

  this.fader.set_animation("fade_in");
}

EnemyBox.prototype.additional_draw = function(ctx) {

  ctx.save()
  if(this.current_lines == null) {
    this.current_lines = utils.getLines(ctx, this.enemy_info[this.cur_page].toUpperCase(), this.text_width, '20px Muli')
  }

  /*if(this.special_ability == null) {
    this.special_ability = utils.getLines(ctx, enemyData[this.enemy_name].special_ability, this.w - 20, '20px Muli')
  }
  if(this.other_notes == null && enemyData[this.enemy_name].other_notes != "") {
    this.other_notes = utils.getLines(ctx, enemyData[this.enemy_name].other_notes, this.w - 20, '20px Muli')
  }

  if(this.special_ability != null && !this.h) {
    this.w = 600
    this.h = 340 + 25 * this.special_ability.length + this.other_notes.length * 25
    this.x = dom.canvasWidth/2
    this.y = 50 + this.h/2
    this.buttons = []
  }*/


  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.fillStyle = this.bright_color
  ctx.font = '16px Muli'
  ctx.fillText("ENEMY INFO", this.x, this.y - this.h/2 + 70)
  ctx.font = '30px Muli'

  ctx.fillText(this.true_name.toUpperCase(), this.x, this.y - this.h/2 + 120)


  ctx.globalAlpha /= 3
  uiRenderUtils.drawTessellationSign(ctx, this.world_num, this.x, this.y - this.h/2 + 215, 80)
  ctx.globalAlpha *= 3
  enemyRenderUtils.drawEnemyRealSize(ctx, this.enemy_name, this.x, this.y - this.h/2 + 215, 1.5)

  ctx.font = '12px Muli'
  ctx.fillText("BASE POINTS", this.x, this.y - this.h/2 + 310)
  ctx.font = '24px Muli'
  ctx.fillText(enemyData[this.enemy_name].score_value, this.x, this.y - this.h/2 + 335)

  ctx.font = '20px Muli'

   for(var i = 0; i < this.current_lines.length; i++) {
    var offset = i - (this.current_lines.length-1)/2
    ctx.fillText(this.current_lines[i], this.x, this.y - this.h/2 + 427 + 25 * offset)
  }
  if (this.num_pages > 1) {
    uiRenderUtils.drawArrow(ctx, this.x - 300, this.y - this.h/2 + 420, 20, "left", this.bright_color, false)
    ctx.font = '10px Muli'
    ctx.fillStyle = this.bright_color
    ctx.fillText("NEXT", this.x + 302, this.y - this.h/2 + 450)
    ctx.fillText("PREV", this.x - 302, this.y - this.h/2 + 450)
    uiRenderUtils.drawArrow(ctx, this.x + 300, this.y - this.h/2 + 420, 20, "right", this.bright_color, false)
    for(var i = 0; i < this.num_pages; i++) {
      var offset = (this.num_pages-1)/2 - i
      ctx.beginPath()
      ctx.shadowBlur = 5
      ctx.arc(this.x - 25 * offset, this.y - this.h/2 + 515, 4, 0, 2*Math.PI, true)

      if(this.cur_page == i) {
        ctx.fillStyle = this.bright_color
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
      } else {
        ctx.save()
        ctx.globalAlpha *= 0.5
        ctx.fillStyle = this.color
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
        ctx.restore()
      }
    }
  }

  //ctx.fillText("ATK", this.x - this.w/4, this.y - this.h/2 + 155)
  //uiRenderUtils.drawProgressBar(ctx, this.x, this.y - this.h/2 + 150, this.x/2, 15, this.atk_value, enemyData[this.enemy_name].color)
  //ctx.fillStyle = "black"
  //ctx.fillText("DEF", this.x - this.w/4, this.y - this.h/2 + 180)
  //uiRenderUtils.drawProgressBar(ctx, this.x, this.y - this.h/2 + 175, this.x/2, 15, this.def_value, enemyData[this.enemy_name].color)
  //ctx.fillStyle = "black"
  //ctx.fillText("SPD", this.x - this.w/4, this.y - this.h/2 + 205)
  //uiRenderUtils.drawProgressBar(ctx, this.x, this.y - this.h/2 + 200, this.x/2, 15, this.spd_value, enemyData[this.enemy_name].color)
  /*ctx.fillStyle = "black"
  ctx.fillText("DIES UPON PLAYER COLLISION", this.x - this.w * .30, this.y - this.h/2 + 245)
  ctx.textAlign = 'center'
  ctx.fillText("SPECIAL ABILITY", this.x, this.y - this.h/2 + 280)
  if (this.other_notes != null)
    ctx.fillText("OTHER NOTES", this.x, this.y - this.h/2 + 315 + 25 * this.special_ability.length)
  ctx.textAlign = 'right'
  ctx.fillText(enemyData[this.enemy_name].dies_on_impact, this.x + this.w * .30, this.y - this.h/2 + 245)
  ctx.beginPath()
  ctx.textAlign = 'center'
  ctx.font = '20px Muli'
  ctx.fillStyle = "black"
  for(var i = 0; i < this.special_ability.length; i++) {
    ctx.fillText(this.special_ability[i], this.x, this.y - this.h/2 + 305 + 25 * i)
  }
  if (this.other_notes != null) {
    for(var i = 0; i < this.other_notes.length; i++) {
      ctx.fillText(this.other_notes[i], this.x, this.y - this.h/2 + 340 + 25 * this.special_ability.length + 25 * i)
    }
  }*/
  ctx.shadowBlur = 0

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  ctx.restore()
}

EnemyBox.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x, y)
  }
}

EnemyBox.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }

  if(x < this.x - this.text_width/2) {
    this.set_page(this.cur_page - 1)
  } else if(x > this.x + this.text_width/2) {
    this.set_page(this.cur_page + 1)
  }

  if(y > 500 && y < 530) {
    var index = Math.round((this.num_pages-1)/2 - (this.x - x)/25)

    if(index >= 0 && index < this.num_pages)
      this.set_page(index)
  }

}

EnemyBox.prototype.set_page = function(page) {
  this.cur_page = page
  if(this.cur_page < 0) {
    this.cur_page += this.num_pages
  }
  if(this.cur_page >= this.num_pages) {
    this.cur_page -= this.num_pages
  }
  this.current_lines = null
}

EnemyBox.prototype.on_key_down = function(keyCode) {

}

DeleteDataDialog.prototype = new DialogBox()

DeleteDataDialog.prototype.constructor = DeleteDataDialog

function DeleteDataDialog(previous_menu) {
  this.init(800, 600)
  this.previous_menu = previous_menu
  this.solid = false;
  this.lite_color = previous_menu.lite_color
  this.bright_color = previous_menu.bright_color

  this.deleted = false

  this.buttons = []
  this.delete_button= new IconButton("DELETE GAME DATA", 20, this.x, this.y + 90, 200, 100, "white", "red", function(_this) { return function() {
    _this.clear_data()
    _this.deleted = true
  }}(this), "delete")

  this.buttons.push(this.delete_button)

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, "white", "white" ,function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      game_engine.set_dialog_box(_this.previous_menu)
      _this.previous_menu.draw_bg();
      _this.previous_menu.fader.set_animation("fade_in");
    });
  }}(this), "back")
  this.buttons.push(this.back_button)

  this.fader.set_animation("fade_in");
}

DeleteDataDialog.prototype.additional_draw = function(ctx) {

  if (!this.deleted) {
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.font = "24px Muli"

    ctx.fillText("ARE YOU SURE", this.x, 200)
    ctx.font = "24px Muli"
    ctx.fillText(" YOU WANT TO DELETE ALL YOUR GAME DATA?", this.x, 230)
    ctx.font = "16px Muli"
    ctx.fillText("THIS ACTION CANNOT BE UNDONE.", this.x, 290)
    for(var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(ctx)
    }

  } else {
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.font = "24px Muli"
    ctx.fillText("ALL GAME DATA HAS BEEN DELETED", this.x, 210)
    this.back_button.draw(ctx)
  }
}

DeleteDataDialog.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }
}

DeleteDataDialog.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}

DeleteDataDialog.prototype.clear_data = function() {
  localStorage.removeItem(imp_params.save_name);
  var old_player_options = saveData.optionsData;
  var old_tutorial_shown = saveData.tutorialsShown;
  saveData.loadGame();
  saveData.optionsData = old_player_options
  saveData.tutorialsShown = old_tutorial_shown;
  saveData.firstTime = false
  saveData.saveGame();
}

NewEnemyDialog.prototype = new DialogBox()

NewEnemyDialog.prototype.constructor = NewEnemyDialog

function NewEnemyDialog(previous_menu) {
  this.init(400, 300)
}

NewEnemyDialog.prototype.additional_draw = function(ctx) {
  ctx.font = "28px Muli"
  ctx.fillStyle = "red"
  ctx.textAlign = 'center'
  ctx.fillText("WOULD YOU LIKE TO SEE ENEMY INFO?", this.x, this.y)

}
