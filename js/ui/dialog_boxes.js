var DialogBox = function() {

}

DialogBox.prototype.init = function(w, h) {
  this.w = w
  this.h = h
  this.x = canvasWidth/2
  this.y = canvasHeight/2
  this.buttons = []
  this.solid = true;
}
DialogBox.prototype.draw = function(ctx) {
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
}

DialogBox.prototype.additional_draw = function(ctx) {}

DialogBox.prototype.on_mouse_move = function(x, y) {}
DialogBox.prototype.on_mouse_down = function(x, y) {}
DialogBox.prototype.on_mouse_up = function(x, y) {}
DialogBox.prototype.on_click = function(x, y) {}
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
  this.shift_down_time = 0
  this.ctrl_down_time = 0
  this.bg_color = impulse_colors["world "+this.world_num +" dark"]
  this.color = impulse_colors["world "+this.world_num]
  this.lite_color = this.game_state.lite_color

  this.drawn_enemies = null

  if(this.is_boss_level) {
    this.drawn_enemies = {}
    //this.drawn_enemies[impulse_level_data[this.level_name].dominant_enemy] = null
    this.num_enemy_type = 0
  }
  else {
    this.drawn_enemies = impulse_level_data[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in impulse_level_data[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40
  this.add_buttons()

}

PauseMenu.prototype.add_buttons = function() {

  this.buttons = []
  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {

    if(!this.level.main_game) {

      this.restart_button = new SmallButton("RETRY", 24, this.x - 173, this.y - this.h/2 + 530, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.restart_practice()
      }}(this))
      this.buttons.push(this.restart_button)

      if(player_data.options.control_hand == "right") {
        this.restart_button.underline_index = 0
      } else {
        this.restart_button.extra_text= "LEFT ARROW"
      }

      this.quit_button = new SmallButton("EXIT", 24, this.x + 180, this.y - this.h/2 + 530, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.quit_practice()
      }}(this))

      this.buttons.push(this.quit_button)
      if(player_data.options.control_hand == "right") {
        this.quit_button.underline_index = 0
      } else {
        this.quit_button.extra_text = "RIGHT ARROW"
      }


    } else {
      if(this.game_numbers.seconds < 5) {
        this.save_and_quit_button = new SmallButton("SAVE & QUIT", 24, this.x - 140, this.y - this.h/2 + 530, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
          _this.save_and_quit_main_game()
        }}(this))
        if(player_data.options.control_hand == "right") {
          this.save_and_quit_button.underline_index = 0
        } else {
          this.save_and_quit_button.extra_text = "LEFT ARROW"
        }
      } else {
        this.save_and_quit_button = new SmallButton("SAVE & QUIT", 24, this.x - 140, this.y - this.h/2 + 530, 200, 50, "gray", "gray", function(_this) { return function() {
        }}(this))
      }

      this.buttons.push(this.save_and_quit_button)

      this.quit_button = new SmallButton("QUIT", 24, this.x + 177, this.y - this.h/2 + 530, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.quit_main_game()
      }}(this))
      this.buttons.push(this.quit_button)
      if(player_data.options.control_hand == "right") {
        this.quit_button.underline_index = 0
        this.quit_button.extra_text= "SHIFT+"
      } else {
        this.quit_button.extra_text = "CTRL + RIGHT ARROW"
      }
    }
  } else {
    this.quit_button = new SmallButton("QUIT", 24, this.x, this.y - this.h/2 + 530, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.quit_tutorial()
      }}(this))
      this.buttons.push(this.quit_button)
      if(player_data.options.control_hand == "right") {
        this.quit_button.underline_index = 0
        this.quit_button.extra_text= "SHIFT+"
      } else {
        this.quit_button.extra_text = "CTRL + RIGHT ARROW"
      }
  }


   this.option_button = new SmallButton("     OPTIONS     ", 20, this.x, this.y - this.h/2 + 470, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
    set_dialog_box(new OptionsMenu(_this))
  }}(this))
  //this.option_button.underline = true
  this.buttons.push(this.option_button)

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
    var cur_y = this.y - this.h/2 + 250 + this.enemy_image_size * h_diff
    var _this = this
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, this.level.lite_color, function() {
      set_dialog_box(new EnemyBox(this.enemy_name, _this))

    }))

    i+=1
  }

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
  ctx.shadowBlur = 10;
  ctx.shadowColor = this.lite_color;
  ctx.fillStyle = this.lite_color;
  ctx.fillText("PAUSED", this.x, this.y - this.h/2 + 50)

  draw_level_obstacles_within_rect(ctx, this.level_name, this.x, this.y - this.h/2 + 150, 150, 112, this.level.lite_color)

  draw_agents_within_rect(ctx, this.game_state.player, this.game_state.level, this.x, this.y - this.h/2 + 150, 150, 112, this.level.lite_color)

  if(this.num_enemy_type > 0) {
    ctx.font = '12px Muli';
    ctx.fillText("CLICK FOR INFO", this.x, this.y - this.h/2 + 290)
  }


    var temp_colors = [this.lite_color, 'silver', 'gold']
    var score_names = ['GATEWAY SCORE', "SILVER SCORE", "GOLD SCORE"]
    var score_rewards = ['(UNLOCKS NEXT LEVEL)', "(+1 LIFE)", "(5 LIVES OR +1 LIFE)"]
    if(!this.is_boss_level) {
      for(var i = 0; i < 3; i++) {
        ctx.font = '24px Muli';
        ctx.textAlign = "right"
        ctx.fillStyle = impulse_colors[temp_colors[i]]
        ctx.shadowColor = ctx.fillStyle
        ctx.font = '25px Muli';
        ctx.fillText(impulse_level_data[this.level_name].cutoff_scores[player_data.difficulty_mode][i], this.x + 200, this.y - this.h/2 + 330 + 40 * i + 7)
        ctx.textAlign = "left"
        ctx.font = '20px Muli';
        ctx.fillText(score_names[i], this.x - 200, this.y - this.h/2 + 330 + 40 * i)
        ctx.font = '12px Muli'
        ctx.fillText(score_rewards[i], this.x - 200, this.y - this.h/2 + 330 + 40 * i+15)
      }
    }
    ctx.textAlign = "center";
    //var score_color = 0

    /*if(!this.is_boss_level) {
      while(impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].high_score > impulse_level_data[this.level_name].cutoff_scores[player_data.difficulty_mode][score_color]) {
        score_color+=1
      }
    }*/

    /*ctx.font = '20px Muli';
    ctx.fillStyle = score_color > 0 ? impulse_colors[temp_colors[score_color - 1]] : "gray"
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("HIGH SCORE "+impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].high_score, this.x, this.y - this.h/2 + 250)*/
  ctx.beginPath()
  ctx.font = '16px Muli'
  ctx.fillStyle = this.lite_color
  ctx.shadowColor = ctx.fillStyle
  if(player_data.options.control_hand == "right") {
    ctx.fillText("'Q' TO RESUME", this.x, this.y - this.h/2 + 585)
  } else {
    ctx.fillText("'SHIFT' TO RESUME", this.x, this.y - this.h/2 + 585)
  }

  draw_gear(ctx, this.x + 60, this.y - this.h/2 + 463, 8, this.lite_color, this.bg_color)
  draw_gear(ctx, this.x - 60, this.y - this.h/2 + 463, 8, this.lite_color, this.bg_color)

  if(this.game_numbers.seconds >= 5 && this.level.main_game) {
    ctx.font = '12px Muli'
    ctx.fillStyle = "gray"
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("ONLY BEFORE 0:05", this.x - 140, this.y - this.h/2 + 548)
  }


  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  this.check_redraw_icons(ctx)
  ctx.restore()
}

PauseMenu.prototype.check_redraw_icons = function(ctx) {
  if(this.redraw_icons) {
    if(this.game_state.zoom == 1 && this.game_state.zoom_state == "none") {

      draw_music_icon(bg_ctx, sidebarWidth/2, canvasHeight - 20, 15, this.lite_color, true)
      draw_pause_icon(bg_ctx, sidebarWidth/2 - 40, canvasHeight - 20, 15, this.lite_color, true)
      draw_fullscreen_icon(bg_ctx, sidebarWidth/2 + 40, canvasHeight - 20, 15, this.lite_color, true)
    } else {
      this.game_state.set_zoom_transparency(ctx);
      draw_music_icon(ctx, sidebarWidth/2, canvasHeight - 20, 15, this.lite_color, true)
      draw_pause_icon(ctx, sidebarWidth/2 - 40, canvasHeight - 20, 15, this.lite_color, true)
      draw_fullscreen_icon(ctx, sidebarWidth/2 + 40, canvasHeight - 20, 15, this.lite_color, true)
    }
    this.redraw_icons = false
  }
}

PauseMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    if(this.game_numbers.seconds >= 5 && this.buttons[i] == this.save_and_quit_button)
      continue
    this.buttons[i].on_mouse_move(x,y)
  }
}

PauseMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}

PauseMenu.prototype.quit_practice = function() {
  switch_game_state(new GameOverState(this.game_numbers, this.level, this.game_state.world_num, this.visibility_graph))
  clear_dialog_box()
}
PauseMenu.prototype.restart_practice = function() {
  bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
  this.level.impulse_game_state.gateway_unlocked = false
  this.level.draw_bg(bg_ctx)
  bg_ctx.translate(-sidebarWidth, 0)

  switch_game_state(new ImpulseGameState(this.game_state.world_num, this.level, this.visibility_graph))
  clear_dialog_box()
}

PauseMenu.prototype.quit_main_game = function() {
  switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null))
  clear_dialog_box()
}

PauseMenu.prototype.quit_tutorial = function() {
  switch_game_state(new TitleState(true))
  clear_dialog_box()
}

PauseMenu.prototype.save_and_quit_main_game = function() {

  this.game_state.hive_numbers.sparks = this.game_state.hive_numbers.last_sparks
  this.game_state.hive_numbers.lives = this.game_state.hive_numbers.last_lives
  player_data.save_data[player_data.difficulty_mode] = this.game_state.hive_numbers
  save_game()
  switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null, true, true))
  clear_dialog_box()
}

PauseMenu.prototype.on_key_down = function(keyCode) {
   if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    if(!this.level.main_game) {
      if(keyCode == imp_vars.keys.EXIT_KEY) { //E = EXIT
        this.quit_practice()
      }
      if(keyCode == imp_vars.keys.RESTART_KEY) { //R = RESTART
        this.restart_practice()
      }
    } else {
      if(keyCode == imp_vars.keys.QUIT_KEY && this.shift_down()) { //Q = QUIT
        this.quit_main_game()
      } else if(keyCode == imp_vars.keys.SAVE_AND_QUIT_KEY) { //S = SAVE AND QUIT
        this.save_and_quit_main_game()
      }
    }

    /*if(keyCode == 79) { // O = OPTIONS MENU
      set_dialog_box(new OptionsMenu(this))
    }*/
  } else {
    if(keyCode == imp_vars.keys.QUIT_KEY && this.shift_down()) { //Q = QUIT
      this.quit_tutorial()
    }
  }

  if(keyCode == imp_vars.keys.PAUSE && !this.shift_down()) {
    clear_dialog_box()
    this.game_state.pause = false
  }
  if(keyCode == 16) {
    this.shift_down_time = (new Date()).getTime()
  }
  if(keyCode == 17) {
    this.ctrl_down_time = (new Date()).getTime()
  }

  if(keyCode == imp_vars.keys.MUTE_KEY) {
    this.redraw_icons = true
  }

}
PauseMenu.prototype.shift_down = function() {
  return (new Date()).getTime() - this.shift_down_time < 1000
}

PauseMenu.prototype.ctrl_down = function() {
  return (new Date()).getTime() - this.ctrl_down_time < 1000
}

PauseMenu.prototype.on_key_up = function(keyCode) {
  /*if(keyCode == 16) {
    this.shift_down = false
  }
  if(keyCode == 17) {
    this.ctrl_down = false
  }*/
}


OptionsMenu.prototype = new DialogBox()

OptionsMenu.prototype.constructor = OptionsMenu

function OptionsMenu(previous_menu) {
  this.init(800, 600)
  this.game_state = previous_menu.game_state
  this.solid = false;
  this.previous_menu = previous_menu
  this.bg_color = this.previous_menu.bg_color
  this.lite_color = this.previous_menu.lite_color
  this.back_button = new SmallButton("BACK", 20, this.x, this.y - this.h/2 + 560, 200, 50, this.lite_color, this.lite_color, function(_this) { return function() {
    _this.previous_menu.add_buttons()
    set_dialog_box(_this.previous_menu)
  }}(this))
  this.buttons.push(this.back_button)
  this.controls_button = new SmallButton("CONTROLS", 20, this.x, this.y - this.h/2 + 125, 200, 50, this.lite_color, this.lite_color, function(_this) { return function() {
    set_dialog_box(new ControlsMenu(_this))
  }}(this))
  this.buttons.push(this.controls_button)

  this.current_help_text = ""

  this.checkboxes = []
  //this.back_button.underline_index = 0
  /*this.music_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 115, 200, 5, this.lite_color)
  this.music_volume_slider.value = Math.log(impulse_music.bg_music_volume)/Math.log(100.0)

  this.effects_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 145, 200, 5, this.lite_color)
  this.effects_volume_slider.value = Math.log(impulse_music.effects_volume)/Math.log(100.0)*/


  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 198, 20, 20, this.lite_color, function(on) {
    impulse_music.mute_effects(!on)
  }, !impulse_music.effects_mute))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 228, 20, 20, this.lite_color, function() {
    player_data.options.explosions = !player_data.options.explosions
    save_game()
  }, player_data.options.explosions))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 258, 20, 20, this.lite_color, function() {
    player_data.options.score_labels = !player_data.options.score_labels
    save_game()
  }, player_data.options.score_labels))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 288, 20, 20, this.lite_color, function() {
    player_data.options.progress_circle = !player_data.options.progress_circle
    save_game()
  }, player_data.options.progress_circle))
  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 318, 20, 20, this.lite_color, function() {
  player_data.options.multiplier_display = !player_data.options.multiplier_display
    save_game()
  }, player_data.options.multiplier_display))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 348, 20, 20, this.lite_color, function() {
  player_data.options.impulse_shadow = !player_data.options.impulse_shadow
    save_game()
  }, player_data.options.impulse_shadow))

  if(this.game_state.level.main_game) {
    this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 378, 20, 20, this.lite_color, function() {
    player_data.options.show_transition_screens = !player_data.options.show_transition_screens
      save_game()
    }, player_data.options.show_transition_screens))
  }

}

OptionsMenu.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.textAlign = "center"
  ctx.font = '32px Muli';
  ctx.shadowBlur = 10;
  ctx.shadowColor = this.lite_color;
  ctx.fillStyle = this.lite_color;
  ctx.fillText("OPTIONS", this.x, this.y - this.h/2 + 50)
  ctx.shadowBlur = 0
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }

  ctx.font = '18px Muli';
  ctx.textAlign = "left"
  ctx.fillText("SOUND EFFECTS", this.x - 130, this.y - this.h/2 + 205)
  ctx.fillText("PARTICLE EFFECTS", this.x - 130, this.y - this.h/2 + 235)
  ctx.fillText("SCORE LABELS", this.x - 130, this.y - this.h/2 + 265)
  ctx.fillText("PROGRESS CIRCLE", this.x - 130, this.y - this.h/2 + 295)
  ctx.fillText("MULTIPLIER DISPLAY", this.x - 130, this.y - this.h/2 + 325)
  ctx.fillText("IMPULSE SHADOW", this.x - 130, this.y - this.h/2 + 355)
  if(this.game_state.level.main_game)
    ctx.fillText("SHOW DEFEAT SCREENS", this.x - 130, this.y - this.h/2 + 385)

  ctx.font = '12px Muli';
  ctx.textAlign = "center"
  ctx.globalAlpha = 0.5
  if(player_data.options.control_hand == "right" && player_data.options.control_scheme == "mouse") {
    ctx.fillText("RIGHT-HANDED KEYBOARD-MOUSE", this.x, this.y - this.h/2 + 150)
  }
  if(player_data.options.control_hand == "left" && player_data.options.control_scheme == "mouse") {
    ctx.fillText("LEFT-HANDED KEYBOARD-MOUSE", this.x, this.y - this.h/2 + 150)
  }
  if(player_data.options.control_hand == "right" && player_data.options.control_scheme == "keyboard") {
    ctx.fillText("KEYBOARD-ONLY", this.x, this.y - this.h/2 + 150)
  }

  if(this.current_help_text) {
    ctx.font = '14px Muli'
    ctx.globalAlpha = 1
    ctx.fillText(this.current_help_text, this.x, this.y + 150)
  }


  ctx.globalAlpha = 1
  //this.music_volume_slider.draw(ctx)
  //this.effects_volume_slider.draw(ctx)

  for(var index in this.checkboxes) {
    this.checkboxes[index].draw(ctx)
  }
  this.check_redraw_icons(ctx)
  ctx.restore()
}


OptionsMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }


  if(Math.abs(y - (this.y - this.h/2 + 205)) < 15) {
    this.current_help_text = "SOUND EFFECTS ARE PLAYED"
  }
  else if(Math.abs(y - (this.y - this.h/2 + 235)) < 15) {
    this.current_help_text = "ENEMIES EXPLODE ON DEATH. MAY SLOW GAMEPLAY"
  }
  else if(Math.abs(y - (this.y - this.h/2 + 265)) < 15) {
    this.current_help_text = "DISPLAY SCORE VALUE OF ENEMY ON DEATH. MAY SLOW GAMEPLAY"
  }
  else if(Math.abs(y - (this.y - this.h/2 + 295)) < 15) {
    this.current_help_text = "DISPLAYS PROGRESS TOWARDS SCORE GOAL AS CIRCULAR METER AROUND PLAYER"
  }
  else if(Math.abs(y - (this.y - this.h/2 + 325)) < 15) {
    this.current_help_text = "DISPLAYS CURRENT MULTIPLIER BELOW PLAYER"
  }
  else if(Math.abs(y - (this.y - this.h/2 + 355)) < 15) {
    this.current_help_text = "DISPLAYS AIMING SHADOW FOR IMPULSE"
  }
  else if(this.game_state.level.main_game && Math.abs(y - (this.y - this.h/2 + 385)) < 15) {
    this.current_help_text = "SHOWS DEFEAT SCREEN ON DEATH"
  } else {
    this.current_help_text = ""
  }
  //this.music_volume_slider.on_mouse_move(x,y)
  //this.effects_volume_slider.on_mouse_move(x,y)
}

OptionsMenu.prototype.check_redraw_icons = PauseMenu.prototype.check_redraw_icons

OptionsMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
  for(var i = 0; i < this.checkboxes.length; i++) {
    this.checkboxes[i].on_click(x,y)
  }
  //this.music_volume_slider.on_click(x,y)
  //this.effects_volume_slider.on_click(x,y)
}

OptionsMenu.prototype.on_key_down = function(keyCode) {
  /*if(keyCode == 66 || keyCode == 79) {
    set_dialog_box(this.previous_menu)
  }*/
  if(keyCode == imp_vars.keys.MUTE_KEY) {
    this.redraw_icons = true
  }
}

OptionsMenu.prototype.on_mouse_down = function(x, y) {
  //this.music_volume_slider.on_mouse_down(x,y)
  //this.effects_volume_slider.on_mouse_down(x,y)
}
OptionsMenu.prototype.on_mouse_up = function(x, y) {
  //this.music_volume_slider.on_mouse_up(x,y)
  //this.effects_volume_slider.on_mouse_up(x,y)
  //impulse_music.change_bg_volume(this.convert_slider_value(this.music_volume_slider.value))
  //impulse_music.change_effects_volume(this.convert_slider_value(this.effects_volume_slider.value))
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

  this.current_hand = player_data.options.control_hand
  this.current_scheme = player_data.options.control_scheme

  this.back_button = new SmallButton("BACK", 20, this.x, this.y - this.h/2 + 560, 200, 50, this.lite_color, this.lite_color, function(_this) { return function() {
    set_dialog_box(_this.previous_menu)
  }}(this))



  this.buttons.push(new SmallButton("LEFT-HANDED KEYBOARD-MOUSE", 16, this.x - 200, this.y - this.h/2 + 135, 200, 30, this.lite_color, this.lite_color, function(_this) { return function() {
    player_data.options.control_hand = "left"
    player_data.options.control_scheme = "mouse"
    save_game()
    set_key_bindings()
    _this.redraw_icons = true
    _this.adjust_underlines()
  }}(this)))
  this.buttons.push(new SmallButton("KEYBOARD-ONLY", 16, this.x, this.y - this.h/2 + 175, 200, 30, this.lite_color, this.lite_color, function(_this) { return function() {
    player_data.options.control_hand = "right"
    player_data.options.control_scheme = "keyboard"
    save_game()
    set_key_bindings()
    _this.redraw_icons = true
    _this.adjust_underlines()
  }}(this)))
  this.buttons.push(new SmallButton("RIGHT-HANDED KEYBOARD-MOUSE", 16, this.x + 200, this.y - this.h/2 + 135, 200, 30, this.lite_color, this.lite_color, function(_this) { return function() {
    player_data.options.control_hand = "right"
    player_data.options.control_scheme = "mouse"
    save_game()
    set_key_bindings()
    _this.redraw_icons = true
    _this.adjust_underlines()
  }}(this)))
  /*this.buttons.push(new SmallButton("RIGHT-HANDED KEYBOARD-ONLY", 16, this.x + 200, this.y - this.h/2 + 175, 200, 30, this.lite_color, this.lite_color, function(_this) { return function() {
    player_data.options.control_hand = "right"
    player_data.options.control_scheme = "keyboard"
    save_game()
    _this.adjust_underlines()
  }}(this)))*/

  this.control_buttons = {}
  this.control_buttons["left mouse"] = this.buttons[0]
  this.control_buttons["right keyboard"] = this.buttons[1]
  this.control_buttons["right mouse"] = this.buttons[2]

  this.buttons.push(this.back_button)

  this.checkboxes = []
  /*this.music_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 115, 200, 5, this.lite_color)
  this.music_volume_slider.value = Math.log(impulse_music.bg_music_volume)/Math.log(100.0)

  this.effects_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 145, 200, 5, this.lite_color)
  this.effects_volume_slider.value = Math.log(impulse_music.effects_volume)/Math.log(100.0)*/
  this.adjust_underlines()
}


ControlsMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }
}

ControlsMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}

ControlsMenu.prototype.adjust_underlines = function() {
  for(var i= 0; i < this.buttons.length; i++) {
    this.buttons[i].underline = false
  }
  this.control_buttons[player_data.options.control_hand +" "+player_data.options.control_scheme].underline = true
}

ControlsMenu.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.textAlign = "center"
  ctx.font = '32px Muli';
  ctx.shadowBlur = 10;
  ctx.shadowColor = this.lite_color;
  ctx.fillStyle = this.lite_color;
  ctx.fillText("CONTROLS", this.x, this.y - this.h/2 + 50)

  ctx.font = '18px Muli';
  ctx.fillText("SELECT SCHEME", this.x, this.y - this.h/2 + 75)
  ctx.shadowBlur = 0
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }

  if(player_data.options.control_hand == "right" && player_data.options.control_scheme == "mouse") {
    draw_arrow_keys(ctx, this.x - 180, this.y - this.h/2 + 300, 50, this.lite_color, ["W", "A", "S", "D"])
    ctx.fillText("MOVE", this.x - 180, this.y - this.h/2 + 360)
    draw_mouse(ctx, this.x + 180, this.y - this.h/2 + 270, 83, 125, this.lite_color)
    ctx.fillText("IMPULSE", this.x + 180, this.y - this.h/2 + 360)
    ctx.shadowColor = this.lite_color
    ctx.shadowBlur = 10
    draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.lite_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(player_data.options.control_hand == "left" && player_data.options.control_scheme == "mouse") {
    draw_arrow_keys(ctx, this.x + 180, this.y - this.h/2 + 300, 50, this.lite_color)
    ctx.fillText("MOVE", this.x + 180, this.y - this.h/2 + 360)
    draw_mouse(ctx, this.x - 180, this.y - this.h/2 + 270, 83, 125, this.lite_color)
    ctx.fillText("IMPULSE", this.x - 180, this.y - this.h/2 + 360)
    ctx.shadowColor = this.lite_color
    ctx.shadowBlur = 10
    draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 430, 120, 40, 10, this.lite_color)
    ctx.fillText("ENTER", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(player_data.options.control_hand == "right" && player_data.options.control_scheme == "keyboard") {
    draw_arrow_keys(ctx, this.x - 180, this.y - this.h/2 + 300, 50, this.lite_color, ["W", "A", "S", "D"])
    ctx.fillText("MOVE", this.x - 180, this.y - this.h/2 + 360)
    draw_arrow_keys(ctx, this.x + 180, this.y - this.h/2 + 300, 50, this.lite_color)
    ctx.fillText("IMPULSE", this.x + 180, this.y - this.h/2 + 360)
    ctx.shadowColor = this.lite_color
    ctx.shadowBlur = 10
    draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.lite_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  ctx.restore()
  this.check_redraw_icons(ctx)

}

ControlsMenu.prototype.on_key_down = function(keyCode) {
  /*if(keyCode == 66 || keyCode == 79) {
    set_dialog_box(this.previous_menu)
  }*/
  if(keyCode == imp_vars.keys.MUTE_KEY) {
    this.redraw_icons = true
  }
}


ControlsMenu.prototype.check_redraw_icons = PauseMenu.prototype.check_redraw_icons

EnemyBox.prototype = new DialogBox()

EnemyBox.prototype.constructor = EnemyBox

function EnemyBox(enemy_name, previous_menu) {
  this.init(800, 600)
  this.game_state = previous_menu.game_state
  this.solid = false;
  this.previous_menu = previous_menu
  this.bg_color = this.previous_menu.bg_color
  this.lite_color = this.previous_menu.lite_color


  this.enemy_name = enemy_name

  this.true_name = enemy_name

  if(impulse_enemy_stats[this.enemy_name].true_name) {
    this.true_name = impulse_enemy_stats[this.enemy_name].true_name
  }
  this.max_enemy_d = 50
  this.special_ability = null
  this.other_notes = null

  this.seen = impulse_enemy_stats[this.enemy_name].seen

  this.w = 600
  this.back_button = new SmallButton("BACK", 20, this.x, this.y - this.h/2 + 560, 200, 50, this.lite_color, this.lite_color, function(_this) { return function() {
    setTimeout(function() { set_dialog_box(_this.previous_menu) }, 50)
  }}(this))

  this.buttons.push(this.back_button)

  this.world_num = this.game_state.world_num

  this.color = impulse_colors["world "+this.world_num]
  this.text_width = 500

  this.enemy_info = impulse_enemy_stats[this.enemy_name].enemy_info


  this.current_lines = null

  this.num_pages = this.enemy_info.length

  this.cur_page = 0
  /*var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  var world = new b2World(gravity, doSleep);

  /*var temp_enemy = new (impulse_enemy_stats[this.enemy_name].className)(world, 0, 0, 0, 0)

  this.def_value = Math.min(temp_enemy.body.m_mass/5.5, 1)

  this.atk_value = impulse_enemy_stats[this.enemy_name].attack_rating/10

  this.spd_value = ((impulse_enemy_stats[this.enemy_name].force/temp_enemy.body.m_mass)/impulse_enemy_stats[this.enemy_name].lin_damp)/.35*/

  if(this.enemy_name == "spear") this.spd_value = 1

}

EnemyBox.prototype.additional_draw = function(ctx) {
  ctx.save()

  if(this.current_lines == null) {
    this.current_lines = getLines(ctx, this.enemy_info[this.cur_page].toUpperCase(), this.text_width, '20px Muli')
  }

  /*if(this.special_ability == null) {
    this.special_ability = getLines(ctx, impulse_enemy_stats[this.enemy_name].special_ability, this.w - 20, '20px Muli')
  }
  if(this.other_notes == null && impulse_enemy_stats[this.enemy_name].other_notes != "") {
    this.other_notes = getLines(ctx, impulse_enemy_stats[this.enemy_name].other_notes, this.w - 20, '20px Muli')
  }

  if(this.special_ability != null && !this.h) {
    this.w = 600
    this.h = 340 + 25 * this.special_ability.length + this.other_notes.length * 25
    this.x = canvasWidth/2
    this.y = 50 + this.h/2
    this.buttons = []
  }*/


  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.fillStyle = this.lite_color
  ctx.font = '12px Muli'
  ctx.globalAlpha /= 0.5
  ctx.fillText("ENEMY INFO", this.x, this.y - this.h/2 + 70)
  ctx.globalAlpha *= 2
  ctx.font = '30px Muli'

  ctx.fillText(this.true_name.toUpperCase(), this.x, this.y - this.h/2 + 120)


  ctx.globalAlpha /= 3
  draw_tessellation_sign(ctx, this.world_num, this.x, this.y - this.h/2 + 215, 80)
  ctx.globalAlpha *= 3
  draw_enemy_real_size(ctx, this.enemy_name, this.x, this.y - this.h/2 + 215, this.max_enemy_d)

  ctx.font = '12px Muli'
  ctx.fillText("BASE POINTS", this.x, this.y - this.h/2 + 310)
  ctx.font = '24px Muli'
  ctx.fillText(impulse_enemy_stats[this.enemy_name].score_value, this.x, this.y - this.h/2 + 335)

  ctx.font = '20px Muli'

   for(var i = 0; i < this.current_lines.length; i++) {
    var offset = i - (this.current_lines.length-1)/2
    ctx.fillText(this.current_lines[i], this.x, this.y - this.h/2 + 427 + 25 * offset)
  }

  draw_arrow(ctx, this.x - 300, this.y - this.h/2 + 420, 20, "left", this.lite_color)
  draw_arrow(ctx, this.x + 300, this.y - this.h/2 + 420, 20, "right", this.lite_color)

  for(var i = 0; i < this.num_pages; i++) {
    var offset = (this.num_pages-1)/2 - i
    ctx.beginPath()
    ctx.shadowBlur = 5
    ctx.arc(this.x - 25 * offset, this.y - this.h/2 + 515, 4, 0, 2*Math.PI, true)
    ctx.fillStyle = this.color
    if(this.cur_page == i) {
      ctx.fillStyle = this.lite_color
      ctx.shadowColor = ctx.fillStyle
      ctx.fill()
    } else {
      ctx.globalAlpha /= 2
      ctx.shadowColor = ctx.fillStyle
      ctx.fill()
      ctx.globalAlpha *= 2
    }

  }

  //ctx.fillText("ATK", this.x - this.w/4, this.y - this.h/2 + 155)
  //draw_progress_bar(ctx, this.x, this.y - this.h/2 + 150, this.x/2, 15, this.atk_value, impulse_enemy_stats[this.enemy_name].color)
  //ctx.fillStyle = "black"
  //ctx.fillText("DEF", this.x - this.w/4, this.y - this.h/2 + 180)
  //draw_progress_bar(ctx, this.x, this.y - this.h/2 + 175, this.x/2, 15, this.def_value, impulse_enemy_stats[this.enemy_name].color)
  //ctx.fillStyle = "black"
  //ctx.fillText("SPD", this.x - this.w/4, this.y - this.h/2 + 205)
  //draw_progress_bar(ctx, this.x, this.y - this.h/2 + 200, this.x/2, 15, this.spd_value, impulse_enemy_stats[this.enemy_name].color)
  /*ctx.fillStyle = "black"
  ctx.fillText("DIES UPON PLAYER COLLISION", this.x - this.w * .30, this.y - this.h/2 + 245)
  ctx.textAlign = 'center'
  ctx.fillText("SPECIAL ABILITY", this.x, this.y - this.h/2 + 280)
  if (this.other_notes != null)
    ctx.fillText("OTHER NOTES", this.x, this.y - this.h/2 + 315 + 25 * this.special_ability.length)
  ctx.textAlign = 'right'
  ctx.fillText(impulse_enemy_stats[this.enemy_name].dies_on_impact, this.x + this.w * .30, this.y - this.h/2 + 245)
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

