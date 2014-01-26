var DialogBox = function() {

}

DialogBox.prototype.init = function(w, h) {
  this.w = w
  this.h = h
  this.x = imp_vars.canvasWidth/2
  this.y = imp_vars.canvasHeight/2
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
  this.bg_drawn = false

  this.drawn_enemies = null

  if(this.is_boss_level) {
    this.drawn_enemies = {}
    //this.drawn_enemies[imp_params.impulse_level_data[this.level_name].dominant_enemy] = null
    this.num_enemy_type = 0
  }
  else {
    this.drawn_enemies = imp_params.impulse_level_data[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in imp_params.impulse_level_data[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40
  this.add_buttons()

}

PauseMenu.prototype.add_buttons = function() {

  this.buttons = []
  var resume_x_location = 0;
  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    resume_x_location = this.x;

    if(!this.level.main_game) {
      this.restart_button = new IconButton("RETRY", 16, this.x - 173, this.y - this.h/2 + 530, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
        _this.restart_practice()
      }}(this), "retry")
      this.buttons.push(this.restart_button)
      this.restart_button.keyCode = imp_params.keys.RESTART_KEY;

      if(imp_vars.player_data.options.control_hand == "right") {
        this.restart_button.extra_text = "R KEY"
      } else {
        this.restart_button.extra_text = "SHIFT KEY"
      }

      this.quit_button = new IconButton("QUIT", 16, this.x + 180, this.y - this.h/2 + 530, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
        _this.quit_practice()
      }}(this), "quit")
      this.buttons.push(this.quit_button)

    } else {
      if(this.game_numbers.seconds < 5) {
        this.save_and_quit_button = new IconButton("SAVE & QUIT", 16, this.x - 170, this.y - this.h/2 + 530, 120, 65, this.bright_color, this.bright_color, function(_this) { return function() {
          _this.save_and_quit_main_game()
        }}(this), "save")

      } else {
        this.save_and_quit_button = new IconButton("SAVE & QUIT", 16, this.x - 170, this.y - this.h/2 + 530, 120, 65, "gray", "gray", function(_this) { return function() {
        }}(this), "save")
        this.save_and_quit_button.extra_text = "ONLY BEFORE 0:05";
      }

      this.buttons.push(this.save_and_quit_button)

      this.quit_button = new IconButton("QUIT", 16, this.x + 170, this.y - this.h/2 + 530, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
        _this.quit_main_game()
      }}(this), "quit")
      this.buttons.push(this.quit_button)
    }

  } else {
    this.quit_button = new IconButton("QUIT", 16, this.x + 157, this.y - this.h/2 + 530, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
      _this.quit_tutorial()
    }}(this), "quit")
    this.buttons.push(this.quit_button)

    resume_x_location = this.x - 157
  }

  // resume button.
  this.resume_button = new IconButton("RESUME", 16, resume_x_location, this.y - this.h/2 + 530, 100, 65, this.bright_color, this.bright_color, function(_this) { return function() {

    _this.game_state.toggle_pause()
  }}(this), "start")
  this.resume_button.keyCode = imp_params.keys.PAUSE;

  if(imp_vars.player_data.options.control_hand == "right") {
    this.resume_button.extra_text = "Q KEY"
  } else {
    this.resume_button.extra_text = "ENTER KEY"
  }
  this.buttons.push(this.resume_button)

  this.options_button = new IconButton("OPTIONS", 16, this.x, this.y - this.h/2 + 460, 100, 65, this.bright_color, this.bright_color, function(_this) { return function() {
    set_dialog_box(new OptionsMenu(_this))
  }}(this), "options")
  this.options_button.bg_color = this.bg_color
  this.buttons.push(this.options_button)

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

  if(!this.bg_drawn) {
    var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
    draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
    this.bg_drawn = true
    imp_vars.world_menu_bg_canvas.setAttribute("style", "")
  } 
  ctx.save()
  ctx.globalAlpha /= 5
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()

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
        ctx.fillText(imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][i], this.x + 200, this.y - this.h/2 + 330 + 40 * i + 7)
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
      while(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score > imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][score_color]) {
        score_color+=1
      }
    }*/

    /*ctx.font = '20px Muli';
    ctx.fillStyle = score_color > 0 ? impulse_colors[temp_colors[score_color - 1]] : "gray"
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("HIGH SCORE "+imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score, this.x, this.y - this.h/2 + 250)*/
  
  ctx.shadowBlur = 0

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  ctx.restore()
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

  switch_game_state(new RewardGameState(this.game_state.hive_numbers, this.game_state.main_game, {
      game_numbers: this.game_state.game_numbers,
      level: this.game_state.level, 
      world_num: this.game_state.world_num,
      visibility_graph: this.game_state.visibility_graph
    }))
  clear_dialog_box()
}
PauseMenu.prototype.restart_practice = function() {
  imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
  this.level.impulse_game_state= null
  this.level.draw_bg(imp_vars.bg_ctx)
  imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)
  var hive_numbers = new HiveNumbers(this.game_state.world_num, false)
  switch_game_state(new ImpulseGameState(this.game_state.world_num, this.level, this.visibility_graph, hive_numbers, false /*is_main_game*/, false /*first_time*/))
  clear_dialog_box()
}

PauseMenu.prototype.quit_main_game = function() {
  switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null))
  clear_dialog_box()
}

PauseMenu.prototype.quit_tutorial = function() {
   switch_game_state(new RewardGameState(this.game_state.hive_numbers, this.game_state.main_game, {
      game_numbers: this.game_state.game_numbers,
      level: this.game_state.level, 
      world_num: this.game_state.world_num,
      visibility_graph: this.game_state.visibility_graph,
      is_tutorial: true,
      tutorial_first_time: this.game_state.mode == "first_time_tutorial"
    }))
   clear_dialog_box()
}

PauseMenu.prototype.save_and_quit_main_game = function() {
  this.game_state.hive_numbers.sparks = this.game_state.hive_numbers.last_sparks
  this.game_state.hive_numbers.lives = this.game_state.hive_numbers.last_lives
  this.game_state.hive_numbers.ultimates = this.game_state.hive_numbers.last_ultimates
  imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode] = this.game_state.hive_numbers
  save_game()
  switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null, true, true))
  clear_dialog_box()
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

  this.options_y_line_up = 170

  this.previous_menu = previous_menu
  if (this.previous_menu instanceof PauseMenu) {
    this.bg_color = this.previous_menu.bg_color
    this.color = this.previous_menu.color
    this.lite_color = this.previous_menu.lite_color
    this.bright_color = this.previous_menu.bright_color  
    this.bg_drawn = true
  } else {
    this.bg_color = impulse_colors["world 0 dark"]
    this.color = impulse_colors["world 0"]
    this.lite_color = impulse_colors["world 0 lite"]
    this.bright_color = impulse_colors["world 0 bright"]
    this.bg_drawn = false
  }
  
  
  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
  if(_this.previous_menu instanceof PauseMenu)    {
    _this.previous_menu.add_buttons()
    set_dialog_box(_this.previous_menu)  
  } else {
    clear_dialog_box()
  }
  
  }}(this), "back")

  var controls_x_value = this.x
  if (this.previous_menu instanceof TitleState) {
    this.delete_button= new IconButton("DELETE GAME DATA", 20, this.x + 150, this.y + 120, 200, 80, this.bright_color, "red", function(_this) { return function() {
      set_dialog_box(new DeleteDataDialog(_this))
    }}(this), "quit")
    this.buttons.push(this.delete_button)
    controls_x_value = this.x - 150
  }
  this.buttons.push(this.back_button)
  this.controls_button = new IconButton("CHANGE CONTROLS", 20, controls_x_value, this.y + 120, 200, 100, this.bright_color, this.bright_color, function(_this) { return function() {
    set_dialog_box(new ControlsMenu(_this))
  }}(this), "controls")
  this.buttons.push(this.controls_button)

  this.current_help_text = ""

  this.checkboxes = []
  //this.back_button.underline_index = 0
  /*this.music_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 115, 200, 5, this.lite_color)
  this.music_volume_slider.value = Math.log(imp_vars.impulse_music.bg_music_volume)/Math.log(100.0)

  this.effects_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 145, 200, 5, this.lite_color)
  this.effects_volume_slider.value = Math.log(imp_vars.impulse_music.effects_volume)/Math.log(100.0)*/

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + this.options_y_line_up - 7, 20, 20, this.bright_color, function(on) {
    imp_vars.impulse_music.mute_effects(!on)
  }, !imp_vars.impulse_music.effects_mute))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + this.options_y_line_up + 23, 20, 20, this.bright_color, function() {
    imp_vars.player_data.options.explosions = !imp_vars.player_data.options.explosions
    save_game()
  }, imp_vars.player_data.options.explosions))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + this.options_y_line_up + 53, 20, 20, this.bright_color, function() {
    imp_vars.player_data.options.score_labels = !imp_vars.player_data.options.score_labels
    save_game()
  }, imp_vars.player_data.options.score_labels))

  /*this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + 288, 20, 20, this.lite_color, function() {
    imp_vars.player_data.options.progress_circle = !imp_vars.player_data.options.progress_circle
    save_game()
  }, imp_vars.player_data.options.progress_circle))*/
  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + this.options_y_line_up + 83, 20, 20, this.bright_color, function() {
  imp_vars.player_data.options.multiplier_display = !imp_vars.player_data.options.multiplier_display
    save_game()
  }, imp_vars.player_data.options.multiplier_display))

  this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + this.options_y_line_up + 113, 20, 20, this.bright_color, function() {
  imp_vars.player_data.options.impulse_shadow = !imp_vars.player_data.options.impulse_shadow
    save_game()
  }, imp_vars.player_data.options.impulse_shadow))

  if(this.game_state instanceof ImpulseGameState && this.game_state.level.main_game) {
    this.checkboxes.push(new CheckBox(this.x + 120, this.y - this.h/2 + this.options_y_line_up + 143, 20, 20, this.bright_color, function() {
    imp_vars.player_data.options.show_transition_screens = !imp_vars.player_data.options.show_transition_screens
      save_game()
    }, imp_vars.player_data.options.show_transition_screens))
  }



}

OptionsMenu.prototype.additional_draw = function(ctx) {
  if(!this.bg_drawn) {
    var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
    draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive 0")
    this.bg_drawn = true
  }
  ctx.save()
  ctx.globalAlpha /= 5
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()
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

  ctx.font = '18px Muli';
  ctx.textAlign = "left"
  ctx.fillText("SOUND EFFECTS", this.x - 130, this.y - this.h/2 + this.options_y_line_up )
  ctx.fillText("PARTICLE EFFECTS", this.x - 130, this.y - this.h/2 + this.options_y_line_up + 30)
  ctx.fillText("SCORE LABELS", this.x - 130, this.y - this.h/2  + this.options_y_line_up + 60)
  //ctx.fillText("PROGRESS CIRCLE", this.x - 130, this.y - this.h/2 + 295)
  ctx.fillText("MULTIPLIER DISPLAY", this.x - 130, this.y - this.h/2 + this.options_y_line_up + 90)
  ctx.fillText("IMPULSE SHADOW", this.x - 130, this.y - this.h/2 + this.options_y_line_up + 120)
  if(this.game_state instanceof ImpulseGameState && this.game_state.level.main_game )
    ctx.fillText("SHOW DEFEAT SCREENS", this.x - 130, this.y - this.h/2 + this.options_y_line_up + 150)

  ctx.textAlign = 'center'
  if(this.current_help_text) {
    ctx.font = '14px Muli'
    ctx.globalAlpha = 1
    if (this.game_state instanceof ImpulseGameState && this.game_state.level.main_game ) {
      ctx.fillText(this.current_help_text, this.x, this.y - this.h/2 + this.options_y_line_up + 180)  
    } else {
      ctx.fillText(this.current_help_text, this.x, this.y - this.h/2 + this.options_y_line_up + 150)  
    }
    
  }

  ctx.globalAlpha = 1
  //this.music_volume_slider.draw(ctx)
  //this.effects_volume_slider.draw(ctx)

  for(var index in this.checkboxes) {
    this.checkboxes[index].draw(ctx)
  }
  ctx.restore()
}


OptionsMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }


  if(Math.abs(y - (this.y - this.h/2 + this.options_y_line_up)) < 15) {
    this.current_help_text = "SOUND EFFECTS ARE PLAYED"
  }
  else if(Math.abs(y - (this.y - this.h/2 + this.options_y_line_up + 30)) < 15) {
    this.current_help_text = "ENEMIES EXPLODE ON DEATH. MAY SLOW GAMEPLAY"
  }
  else if(Math.abs(y - (this.y - this.h/2 + this.options_y_line_up + 60)) < 15) {
    this.current_help_text = "DISPLAY SCORE VALUE OF ENEMY ON DEATH. MAY SLOW GAMEPLAY"
  }
  /*else if(Math.abs(y - (this.y - this.h/2 + 295)) < 15) {
    this.current_help_text = "DISPLAYS PROGRESS TOWARDS SCORE GOAL AS CIRCULAR METER AROUND PLAYER"
  }*/
  else if(Math.abs(y - (this.y - this.h/2 + this.options_y_line_up + 90)) < 15) {
    this.current_help_text = "DISPLAYS CURRENT MULTIPLIER BELOW PLAYER"
  }
  else if(Math.abs(y - (this.y - this.h/2 + this.options_y_line_up + 120)) < 15) {
    this.current_help_text = "DISPLAYS AIMING SHADOW FOR IMPULSE"
  }
  else if(this.game_state instanceof ImpulseGameState && this.game_state.level.main_game && Math.abs(y - (this.y - this.h/2 + this.options_y_line_up + 150)) < 15) {
    this.current_help_text = "SHOWS DEFEAT SCREEN ON DEATH"
  } else {
    this.current_help_text = ""
  }
  //this.music_volume_slider.on_mouse_move(x,y)
  //this.effects_volume_slider.on_mouse_move(x,y)
}

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
}

OptionsMenu.prototype.on_mouse_down = function(x, y) {
  //this.music_volume_slider.on_mouse_down(x,y)
  //this.effects_volume_slider.on_mouse_down(x,y)
}
OptionsMenu.prototype.on_mouse_up = function(x, y) {
  //this.music_volume_slider.on_mouse_up(x,y)
  //this.effects_volume_slider.on_mouse_up(x,y)
  //imp_vars.impulse_music.change_bg_volume(this.convert_slider_value(this.music_volume_slider.value))
  //imp_vars.impulse_music.change_effects_volume(this.convert_slider_value(this.effects_volume_slider.value))
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

  this.current_hand = imp_vars.player_data.options.control_hand
  this.current_scheme = imp_vars.player_data.options.control_scheme

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
    set_dialog_box(_this.previous_menu)
  }}(this), "back")


  this.control_buttons = {}

  this.control_buttons["left mouse"] = new IconButton("LEFT-HAND MOUSE", 16, this.x - 200, this.y - this.h/2 + 135, 200, 100, this.bright_color, this.bright_color, function(_this) { return function() {
    imp_vars.player_data.options.control_hand = "left"
    imp_vars.player_data.options.control_scheme = "mouse"
    save_game()
    set_key_bindings()
  }}(this), "left_mouse")

  this.control_buttons["right keyboard"] = new IconButton("KEYBOARD-ONLY", 16, this.x, this.y - this.h/2 + 135, 200, 100, this.bright_color, this.bright_color, function(_this) { return function() {
    imp_vars.player_data.options.control_hand = "right"
    imp_vars.player_data.options.control_scheme = "keyboard"
    save_game()
    set_key_bindings()
  }}(this), "keyboard")

  this.control_buttons["right mouse"] = new IconButton("RIGHT-HAND MOUSE", 16, this.x + 200, this.y - this.h/2 + 135, 200, 100, this.bright_color, this.bright_color, function(_this) { return function() {
    imp_vars.player_data.options.control_hand = "right"
    imp_vars.player_data.options.control_scheme = "mouse"
    save_game()
    set_key_bindings()
  }}(this), "right_mouse")

  this.buttons.push(this.control_buttons["left mouse"])
  this.buttons.push(this.control_buttons["right mouse"])
  this.buttons.push(this.control_buttons["right keyboard"])
  this.has_ult = has_ult()
  /*this.buttons.push(new SmallButton("RIGHT-HANDED KEYBOARD-ONLY", 16, this.x + 200, this.y - this.h/2 + 175, 200, 30, this.lite_color, this.lite_color, function(_this) { return function() {
    imp_vars.player_data.options.control_hand = "right"
    imp_vars.player_data.options.control_scheme = "keyboard"
    save_game()
    _this.adjust_underlines()
  }}(this)))*/

  this.buttons.push(this.back_button)

  this.checkboxes = []
  /*this.music_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 115, 200, 5, this.lite_color)
  this.music_volume_slider.value = Math.log(imp_vars.impulse_music.bg_music_volume)/Math.log(100.0)

  this.effects_volume_slider = new Slider(this.x + 170, this.y - this.h/2 + 145, 200, 5, this.lite_color)
  this.effects_volume_slider.value = Math.log(imp_vars.impulse_music.effects_volume)/Math.log(100.0)*/
  this.adjust_colors()
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
    this.control_buttons[imp_vars.player_data.options.control_hand +" "+imp_vars.player_data.options.control_scheme].color = this.bright_color
  }
  this.control_buttons[imp_vars.player_data.options.control_hand +" "+imp_vars.player_data.options.control_scheme].border = true
}

ControlsMenu.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.globalAlpha /= 5
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()
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
    if(imp_vars.player_data.options.control_hand == "right" && imp_vars.player_data.options.control_scheme == "mouse") {
      currentControls = "right mouse"
    }
    if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
      currentControls = "left mouse"
    }
    if(imp_vars.player_data.options.control_hand == "right" && imp_vars.player_data.options.control_scheme == "keyboard") {
      currentControls = "right keyboard"
    }
  }
  ctx.globalAlpha *= 0.6
  if(currentControls == "right mouse") {
    draw_arrow_keys(ctx, this.x - 200, this.y - this.h/2 + 300, 50, this.bright_color, ["W", "A", "S", "D"])
    ctx.fillText("MOVE", this.x - 200, this.y - this.h/2 + 360)
    if(this.has_ult) {
      draw_mouse(ctx, this.x, this.y - this.h/2 + 270, 75, 100, this.bright_color)
      ctx.fillText("IMPULSE", this.x, this.y - this.h/2 + 360)  
      draw_right_mouse(ctx, this.x + 200, this.y - this.h/2 + 270, 75, 100, this.bright_color)
      ctx.fillText("ULTIMATE", this.x + 200, this.y - this.h/2 + 360)  
    } else {
      draw_mouse(ctx, this.x + 200, this.y - this.h/2 + 270, 75, 100, this.bright_color)
      ctx.fillText("IMPULSE", this.x + 200, this.y - this.h/2 + 360)  
    }
    
    draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.bright_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(currentControls == "left mouse") {
    if(this.has_ult) {
      draw_mouse(ctx, this.x - 200, this.y - this.h/2 + 270,  75, 100, this.bright_color)
      ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)
      draw_right_mouse(ctx, this.x, this.y - this.h/2 + 270,  75, 100, this.bright_color)
      ctx.fillText("ULTIMATE", this.x, this.y - this.h/2 + 360)  
    } else {
      draw_mouse(ctx, this.x - 200, this.y - this.h/2 + 270,  75, 100, this.bright_color)
      ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)
    }

    draw_arrow_keys(ctx, this.x + 200, this.y - this.h/2 + 300, 50, this.bright_color)
    ctx.fillText("MOVE", this.x + 200, this.y - this.h/2 + 360)
    
    draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 430, 120, 40, 10, this.bright_color)
    ctx.fillText("SHIFT", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(currentControls == "right keyboard") {
    draw_arrow_keys(ctx, this.x - 200, this.y - this.h/2 + 300, 50, this.bright_color, ["W", "A", "S", "D"])
    ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)

    if(this.has_ult) {
      draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 280, 45, 45, 10, this.bright_color)
      ctx.font = "18px Muli"
      ctx.fillText("F", this.x, this.y - this.h/2 + 286)
      ctx.fillText("ULTIMATE", this.x, this.y - this.h/2 + 360)    
    }
    

    draw_arrow_keys(ctx, this.x + 200, this.y - this.h/2 + 300, 50, this.bright_color)
    ctx.fillText("MOVE", this.x + 200, this.y - this.h/2 + 360)
    draw_rounded_rect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.bright_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  ctx.restore()
}

ControlsMenu.prototype.on_key_down = function(keyCode) {
  /*if(keyCode == 66 || keyCode == 79) {
    set_dialog_box(this.previous_menu)
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

  this.previous_menu = previous_menu

  this.enemy_name = enemy_name

  this.true_name = enemy_name

  if(imp_params.impulse_enemy_stats[this.enemy_name].true_name) {
    this.true_name = imp_params.impulse_enemy_stats[this.enemy_name].true_name
  }
  this.max_enemy_d = 50
  this.special_ability = null
  this.other_notes = null

  this.seen = imp_params.impulse_enemy_stats[this.enemy_name].seen

  this.w = 600
  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
    setTimeout(function() {
      if(_this.previous_menu instanceof DialogBox) {
        set_dialog_box(_this.previous_menu)
      } else if(_this.previous_menu instanceof GameState) {
        //switch_game_state(_this.previous_menu)
        set_dialog_box(null)
      }
    }, 50)
  }}(this), "back")

  this.buttons.push(this.back_button)


  this.color = impulse_colors["world "+this.world_num]
  this.text_width = 500

  this.enemy_info = imp_params.impulse_enemy_stats[this.enemy_name].enemy_info

  this.current_lines = null

  this.num_pages = this.enemy_info.length

  this.cur_page = 0
  /*var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  var world = new b2World(gravity, doSleep);

  /*var temp_enemy = new (imp_params.impulse_enemy_stats[this.enemy_name].className)(world, 0, 0, 0, 0)

  this.def_value = Math.min(temp_enemy.body.m_mass/5.5, 1)

  this.atk_value = imp_params.impulse_enemy_stats[this.enemy_name].attack_rating/10

  this.spd_value = ((imp_params.impulse_enemy_stats[this.enemy_name].force/temp_enemy.body.m_mass)/imp_params.impulse_enemy_stats[this.enemy_name].lin_damp)/.35*/

  if(this.enemy_name == "spear") this.spd_value = 1

}

EnemyBox.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.globalAlpha /= 5
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()

  ctx.save()
  if(this.current_lines == null) {
    this.current_lines = getLines(ctx, this.enemy_info[this.cur_page].toUpperCase(), this.text_width, '20px Muli')
  }

  /*if(this.special_ability == null) {
    this.special_ability = getLines(ctx, imp_params.impulse_enemy_stats[this.enemy_name].special_ability, this.w - 20, '20px Muli')
  }
  if(this.other_notes == null && imp_params.impulse_enemy_stats[this.enemy_name].other_notes != "") {
    this.other_notes = getLines(ctx, imp_params.impulse_enemy_stats[this.enemy_name].other_notes, this.w - 20, '20px Muli')
  }

  if(this.special_ability != null && !this.h) {
    this.w = 600
    this.h = 340 + 25 * this.special_ability.length + this.other_notes.length * 25
    this.x = imp_vars.canvasWidth/2
    this.y = 50 + this.h/2
    this.buttons = []
  }*/


  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.fillStyle = this.bright_color
  ctx.font = '12px Muli'
  ctx.globalAlpha /= 0.5
  ctx.fillText("ENEMY INFO", this.x, this.y - this.h/2 + 70)
  ctx.globalAlpha *= 2
  ctx.font = '30px Muli'

  ctx.fillText(this.true_name.toUpperCase(), this.x, this.y - this.h/2 + 120)


  ctx.globalAlpha /= 3
  draw_tessellation_sign(ctx, this.world_num, this.x, this.y - this.h/2 + 215, 80)
  ctx.globalAlpha *= 3
  draw_enemy_real_size(ctx, this.enemy_name, this.x, this.y - this.h/2 + 215, 1.5)

  ctx.font = '12px Muli'
  ctx.fillText("BASE POINTS", this.x, this.y - this.h/2 + 310)
  ctx.font = '24px Muli'
  ctx.fillText(imp_params.impulse_enemy_stats[this.enemy_name].score_value, this.x, this.y - this.h/2 + 335)

  ctx.font = '20px Muli'

   for(var i = 0; i < this.current_lines.length; i++) {
    var offset = i - (this.current_lines.length-1)/2
    ctx.fillText(this.current_lines[i], this.x, this.y - this.h/2 + 427 + 25 * offset)
  }
  if (this.num_pages > 1) {
    draw_arrow(ctx, this.x - 300, this.y - this.h/2 + 420, 20, "left", this.bright_color, false)
    ctx.font = '10px Muli'
    ctx.fillStyle = this.bright_color
    ctx.fillText("NEXT", this.x + 302, this.y - this.h/2 + 450)
    ctx.fillText("PREV", this.x - 302, this.y - this.h/2 + 450)
    draw_arrow(ctx, this.x + 300, this.y - this.h/2 + 420, 20, "right", this.bright_color, false)
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
  }

 

  //ctx.fillText("ATK", this.x - this.w/4, this.y - this.h/2 + 155)
  //draw_progress_bar(ctx, this.x, this.y - this.h/2 + 150, this.x/2, 15, this.atk_value, imp_params.impulse_enemy_stats[this.enemy_name].color)
  //ctx.fillStyle = "black"
  //ctx.fillText("DEF", this.x - this.w/4, this.y - this.h/2 + 180)
  //draw_progress_bar(ctx, this.x, this.y - this.h/2 + 175, this.x/2, 15, this.def_value, imp_params.impulse_enemy_stats[this.enemy_name].color)
  //ctx.fillStyle = "black"
  //ctx.fillText("SPD", this.x - this.w/4, this.y - this.h/2 + 205)
  //draw_progress_bar(ctx, this.x, this.y - this.h/2 + 200, this.x/2, 15, this.spd_value, imp_params.impulse_enemy_stats[this.enemy_name].color)
  /*ctx.fillStyle = "black"
  ctx.fillText("DIES UPON PLAYER COLLISION", this.x - this.w * .30, this.y - this.h/2 + 245)
  ctx.textAlign = 'center'
  ctx.fillText("SPECIAL ABILITY", this.x, this.y - this.h/2 + 280)
  if (this.other_notes != null)
    ctx.fillText("OTHER NOTES", this.x, this.y - this.h/2 + 315 + 25 * this.special_ability.length)
  ctx.textAlign = 'right'
  ctx.fillText(imp_params.impulse_enemy_stats[this.enemy_name].dies_on_impact, this.x + this.w * .30, this.y - this.h/2 + 245)
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
  this.delete_button= new IconButton("DELETE GAME DATA", 20, this.x, this.y, 200, 80, "red", "red", function(_this) { return function() {
    _this.clear_data()
    _this.deleted = true
  }}(this), "quit")

  this.buttons.push(this.delete_button)

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, "red", "red",function(_this) { return function() {
  set_dialog_box(_this.previous_menu)
  
  }}(this), "back")
  this.buttons.push(this.back_button)

  if(!this.bg_drawn) {
    var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
    draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive 4")
    this.bg_drawn = true
    this.previous_menu.bg_drawn = false
  }

}

DeleteDataDialog.prototype.additional_draw = function(ctx) {

  ctx.save()
  ctx.globalAlpha *= .6
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()

  if (!this.deleted) {
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.font = "40px Muli"
        
    ctx.fillText("ARE YOU SURE", this.x, 100)
    ctx.font = "24px Muli"
    ctx.fillText(" YOU WANT TO DELETE ALL YOUR GAME DATA?", this.x, 140)
    ctx.font = "16px Muli"
    ctx.fillText("THIS ACTION CANNOT BE UNDONE.", this.x, 200)
    for(var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(ctx)
    }

  } else {
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.font = "32px Muli"
    ctx.fillText("ALL GAME DATA HAS BEEN DELETED", this.x, 120)    
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
  localStorage.removeItem(imp_vars.save_name);
  var old_player_options = imp_vars.player_data.options
  load_game();
  imp_vars.player_data.options = old_player_options
  imp_vars.player_data.first_time = false
  save_game();
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