WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world, is_practice_mode) {

  this.is_practice_mode = is_practice_mode;

  this.bg_drawn = false
  this.color = "white"//impulse_colors["impulse_blue"]

  this.world_num = world
  this.next_world = null;

  this.cur_difficulty_mode = saveData.difficultyMode;
  this.next_difficulty_mode = null;
  this.transition_to_world_num = null;

  this.buttons = []
  var _this = this

  this.buttons.push(new IconButton("BACK", 16, 70, imp_params.levelHeight/2+260, 60, 65, this.color, impulse_colors["impulse_blue"], function(){
    _this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(new TitleState(_this));
    });
    switch_bg("Hive 0", 250, imp_params.hive0_bg_opacity)
  }, "back"));

  this.difficulties = ["easy", "normal"];

  if (true) {
    this.select_difficulty_button = new SelectDifficultyButton(16, 730, imp_params.levelHeight/2+260, 100, 65, this.color, impulse_colors["impulse_blue"], this)
    this.buttons.push(this.select_difficulty_button);
  }

  this.num_mode_buttons = 5

  this.requirements = {
    2: "DEFEAT HIVE 1 TO UNLOCK",
    3: "DEFEAT HIVE 2 TO UNLOCK",
    4: "DEFEAT HIVE 3 TO UNLOCK"
  }

  this.offsets = {
    1: 23,
    2: 18,
    3: 20,
    4: 20
  }


  this.world_button_y = imp_params.levelHeight/2;
  this.set_up_buttons();

  imp_params.impulse_music.play_bg(audioData.songs["Menu"])

  this.fade_out_interval_main = 500
  this.fade_out_interval_practice = 250
  this.fade_out_interval = null
  this.fade_out_duration = null

  this.fader = new Fader({
    "fade_in": 250,
    "fade_across": 250,
    "fade_out": 250
  });

  this.fader.set_animation("fade_in");

  // This uses methods from level.js
  this.gateway_particles = []
  this.gateway_particle_gen_interval = 1000
  this.gateway_particle_gen_timer = this.gateway_particle_gen_interval
  this.gateway_particle_duration = 2000
  // We need to divide by draw_factor due to the implementation in level.js
  this.gateway_loc = {x: imp_params.levelWidth/2/imp_params.draw_factor, y: this.world_button_y/imp_params.draw_factor}
  this.gateway_size = 5
  this.gateway_particles_per_round = 8

  // If this is the first time, take the player to the tutorial.
  if (saveData.firstTime) {
    // If we don't set timeout, the click event will set world map state back to the game state.
    setTimeout(function() {
      game_engine.switch_game_state(new MainGameTransitionState(0, null, null, null, false))
    });
  }
}

WorldMapState.prototype.set_up_buttons = function() {

  this.world_unlocked = {};

  for (var i = 0; i < this.difficulties.length; i++) {
    var difficulty = this.difficulties[i];
    this.world_unlocked[difficulty] = {
      0: true,
      1: true,
      2: saveData.worldRankings[difficulty]["world 1"] || imp_params.debug.dev || imp_params.debug.god_mode,
      3: saveData.worldRankings[difficulty]["world 2"] || imp_params.debug.dev || imp_params.debug.god_mode,
      4: saveData.worldRankings[difficulty]["world 3"] || imp_params.debug.dev || imp_params.debug.god_mode,
    }
  }

  this.world_buttons = {}
  // the things you select at the bottom
  this.mode_buttons = {}

  this.practice_buttons = {}

  for (var i = 0; i < this.difficulties.length; i++) {
    this.world_buttons[this.difficulties[i]] = {};
    this.mode_buttons[this.difficulties[i]] = [];
    this.practice_buttons[this.difficulties[i]] = {};
    this.set_up_mode_buttons(this.difficulties[i])
    if (!this.is_practice_mode) {
      this.set_up_world_map(this.difficulties[i])
    } else {
      this.set_up_practice_buttons(this.difficulties[i])
      this.set_up_world_icon(0, imp_params.levelWidth/2, this.world_button_y, true, this.difficulties[i])
    }
  }
}

WorldMapState.prototype.set_up_world_map = function(difficulty) {
    var _this = this;
    for (var i = 0; i <= 4; i++) {
      this.set_up_world_icon(i, imp_params.levelWidth/2, this.world_button_y, this.world_unlocked[difficulty][i], difficulty)
    }
}

WorldMapState.prototype.set_up_mode_buttons = function(difficulty) {
  var diff = 75
  var button_color = "white"
  var text = ["T", "1", "2", "3", "4"]
  var num_buttons_to_show = 2; // always show world 1 and tutorial
  // Get the number of buttons to show.
  for(var i = 2; i < this.num_mode_buttons; i++) {
    if(i > 1 && !this.world_unlocked[difficulty][i]) {
      break;
    } else {
      num_buttons_to_show += 1;
    }
  }
  var cur_x =  imp_params.levelWidth/2 - ((num_buttons_to_show - 1) * 0.5) * diff

  for(var i = 0; i < num_buttons_to_show; i++) {
    var _this = this;
    var callback = (function(index) {
      return function() {
        if (_this.world_num != index) {
          _this.fader.set_animation("fade_across", function() {
            _this.world_num = index;
          });
          _this.update_bg(index, _this.cur_difficulty_mode);
          _this.next_world = index;
          _this.next_difficulty_mode = _this.cur_difficulty_mode;
        }
      };
    })(i)
    this.mode_buttons[difficulty].push(new IconButton(text[i], 16, cur_x + (i)*diff, imp_params.levelHeight/2+250, 60, 60, impulse_colors["world "+i+" bright"], impulse_colors["impulse_blue"], callback, "world"+i))
  }
}

// Update background based on index and current difficulty.
WorldMapState.prototype.update_on_difficulty_change = function(difficulty) {
  if (this.cur_difficulty_mode != difficulty) {
    var _this = this;
    // If the current world isn't unlocked in the new difficulty, change to the latest that is unlocked.
    var i = this.world_num;
    while (i > 1 && !this.world_unlocked[difficulty][i]) {
      i -= 1;
    }
    this.fader.set_animation("fade_across", function() {
      _this.cur_difficulty_mode = _this.next_difficulty_mode;
      _this.world_num = i;
    });
    this.update_bg(i, difficulty);

    this.next_world = i;
    this.next_difficulty_mode = difficulty
  }
};

WorldMapState.prototype.update_bg = function(index, difficulty) {
  if (index == undefined) {
    index = this.world_num;
  }
  if (index != 0 && difficulty == "normal") {
    switch_bg("Title Alt" + index, 250, get_world_map_bg_opacity(index))
  } else {
    switch_bg("Hive 0", 250, imp_params.hive0_bg_opacity)
  }
}

WorldMapState.prototype.set_up_practice_buttons = function(difficulty) {

  var diff = 85

  for(var i = 1; i <= 4; i++) {
    this.practice_buttons[difficulty][i] = []
    // var colors = ["world "+i+" bright", "world "+i+" bright", "silver", "gold"]
    for(var j = 0; j < 8; j++) {

      var level_name = "HIVE "+i+"-"+(j+1);
      if(j == 7) {
        level_name = "BOSS "+i
      }
      var _this = this;
      var this_color = impulse_colors["world "+i+" bright"];
      var callback = (function(level, index) {
        return function() {
          _this.fade_out_interval = _this.fade_out_interval_practice
          _this.fade_out_duration = _this.fade_out_interval;
          _this.fade_out_color = impulse_colors["world "+ index +" dark"];
          _this.transition_to_world_num = index;
          var world_bg_ctx = imp_params.world_menu_bg_canvas.getContext('2d')
          _this.draw_world_bg(world_bg_ctx)
          setTimeout(function(){
            game_engine.switch_game_state(new LevelIntroState(level, index));
          }, _this.fade_out_interval_practice)
        }

      })(level_name, i)
      var x = imp_params.levelWidth/2 + ((-1.5 + (j % 4)) * 150);
      var y = j >= 4 ? imp_params.levelHeight/2+100  : imp_params.levelHeight/2

      var new_button = new IconButton(j+1, 30, x, y, 75, 75, this_color, this_color, callback, "practice"+i);
      new_button.underline_on_hover = false
      new_button.level_name = level_name
      this.practice_buttons[difficulty][i].push(new_button)
      new_button.active = saveData.getLevelData(level_name).seen ||
        (j == 0 && this.world_unlocked[difficulty][i]) || (imp_params.debug.dev || imp_params.debug.god_mode)
      if(!new_button.active) {
        new_button.color = "gray"
      }
    }
  }
}

WorldMapState.prototype.set_up_world_icon = function(world_num, x, y, unlocked, difficulty) {
  var text = unlocked ? "START" : "LOCKED";
  var _this = this
  this.world_buttons[difficulty][world_num] = new IconButton(text, 50, x, y, 150, 150, impulse_colors["world "+world_num+" bright"], impulse_colors["world "+world_num+" bright"],
    function(){
      _this.fade_out_interval = _this.fade_out_interval_main
      _this.fade_out_duration = _this.fade_out_interval;
      _this.fade_out_color = impulse_colors["world "+world_num+" dark"];
      _this.transition_to_world_num = world_num;
      var world_bg_ctx = imp_params.world_menu_bg_canvas.getContext('2d')
      _this.draw_world_bg(world_bg_ctx)
      setTimeout(function(){
        game_engine.switch_game_state(new MainGameTransitionState(world_num, null, null, null, false))
      }, _this.fade_out_interval_main)}, "world"+world_num)
  this.world_buttons[difficulty][world_num].active = unlocked
}

WorldMapState.prototype.draw_world_bg = function(ctx) {
  uiRenderUtils.tessellateBg(ctx, 0, 0, imp_params.levelWidth, imp_params.levelHeight, "Hive "+this.world_num)
}

WorldMapState.prototype.draw = function(ctx, bg_ctx) {
  if (saveData.firstTime) {
    return
  }
  if(this.fade_out_color) {
    ctx.save()
    ctx.globalAlpha = 1-(this.fade_out_duration/this.fade_out_interval)
    ctx.fillStyle = this.fade_out_color
    ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight)
    ctx.globalAlpha *= get_bg_opacity(this.world_num)
    if (!should_show_level_zero(this.transition_to_world_num) &&
      !imp_params.debug.show_zero_level) {
      ctx.drawImage(imp_params.world_menu_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, 0, 0, imp_params.levelWidth, imp_params.levelHeight)
    }
    ctx.restore()
  }
  ctx.save()

  if(this.fade_out_duration != null) {
    ctx.globalAlpha *= Math.max((this.fade_out_duration/this.fade_out_interval), 0)
  }

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }


  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    this.bg_drawn = true
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  // Only draw gateway particles if the current world is active.
  if (!this.is_practice_mode && this.world_unlocked[saveData.difficultyMode][this.world_num] ) {
    this.draw_gateway_particles(ctx, imp_params.draw_factor);
  }


  ctx.font = '13px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("SELECT HIVE", imp_params.levelWidth/2, imp_params.levelHeight/2 + 215)

  if (this.fader.get_current_animation() == "fade_across") {
    ctx.save();
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
    this.draw_world(ctx, this.world_num, this.cur_difficulty_mode);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= this.fader.get_animation_progress();
    this.draw_world(ctx, this.next_world, this.next_difficulty_mode);
    ctx.restore();
  } else {
    this.draw_world(ctx, this.world_num, this.cur_difficulty_mode);
  }
}

// Draw everything associated with a particular hive.
WorldMapState.prototype.draw_world = function(ctx, index, difficulty) {

  if (!this.is_practice_mode || index == 0) {
    this.world_buttons[difficulty][index].draw(ctx)
  }

  if (index > 0) {
    if (this.is_practice_mode) {
      if (index != 0) {
        for(var i = 0; i < this.practice_buttons[difficulty][index].length; i++) {
          this.practice_buttons[difficulty][index][i].draw(ctx)
        }
      }
    }
  }

  if(index != 0) {
    if (this.is_practice_mode) {
      ctx.fillStyle = "white"
      ctx.font = "20px Muli"
      ctx.fillText("PRACTICE MODE", imp_params.levelWidth/2, this.world_button_y - 170)
    } else if (saveData.difficultyMode == "normal") {
      ctx.fillStyle = "white"
      ctx.font = "24px Muli"
      ctx.fillText("HARD MODE", imp_params.levelWidth/2, this.world_button_y - 170)
    }
  }

  // draw hive name
  ctx.fillStyle = impulse_colors["world "+index+" bright"]
  ctx.font = "42px Muli"
  ctx.textAlign = "center"
  if (index > 0) {
    ctx.fillText(levelData.hiveNames[index], imp_params.levelWidth/2, this.world_button_y - 125)
  } else {
    ctx.fillText("TUTORIAL", imp_params.levelWidth/2, this.world_button_y - 125)
  }

  // mode buttons
  for(var i = 0; i < this.mode_buttons[difficulty].length; i++) {
    this.mode_buttons[difficulty][i].draw(ctx)
    if(this.mode_buttons[difficulty][i].mouseOver) {
      ctx.textAlign = "center"
      ctx.font = '15px Muli'
      if (i == 0) {
        ctx.fillStyle = impulse_colors['world '+(i)+" bright"]
        ctx.fillText("TUTORIAL", imp_params.levelWidth/2, imp_params.levelHeight - 8)
      } else if(this.mode_buttons[difficulty][i].active) {
        ctx.fillStyle = impulse_colors['world '+(i)+" bright"]
        ctx.fillText(levelData.hiveNames[i], imp_params.levelWidth/2, imp_params.levelHeight - 8)
      }
    }
  }
  if (!this.is_practice_mode || index == 0) {
    this.world_buttons[difficulty][index].post_draw(ctx)
  }

  if (index > 0 && this.is_practice_mode) {
    for(var i = 0; i < this.practice_buttons[difficulty][index].length; i++) {
      this.practice_buttons[difficulty][index][i].post_draw(ctx)
    }
  }
};

WorldMapState.prototype.process = function(dt) {
  if (saveData.firstTime) {
    return
  }
  if(this.fade_out_duration != null) {
    this.fade_out_duration -= dt
  }
  if (!this.is_practice_mode)
  this.process_gateway_particles(dt);
  this.fader.process(dt);

  process_and_draw_bg(dt);
}

WorldMapState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  var difficulty = saveData.difficultyMode;
  if (!this.is_practice_mode) {
    this.world_buttons[difficulty][this.world_num].on_mouse_move(x, y)
  } else {
    if (this.world_num != 0) {
      for(var i = 0; i < this.practice_buttons[difficulty][this.world_num].length; i++) {
        this.practice_buttons[difficulty][this.world_num][i].on_mouse_move(x, y)
      }
    } else {
      this.world_buttons[difficulty][this.world_num].on_mouse_move(x, y)
    }
  }

  for(var i = 0; i < this.mode_buttons[difficulty].length; i++) {
    this.mode_buttons[difficulty][i].on_mouse_move(x, y)
  }
}

WorldMapState.prototype.on_click = function(x, y) {
  if (this.fade_out_duration != null) return
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  var difficulty = saveData.difficultyMode;
  if (!this.is_practice_mode) {
    this.world_buttons[difficulty][this.world_num].on_click(x, y)
  } else {
    if (this.world_num != 0) {
      for(var i = 0; i < this.practice_buttons[difficulty][this.world_num].length; i++) {
        this.practice_buttons[difficulty][this.world_num][i].on_click(x, y)
      }
    } else {
      this.world_buttons[difficulty][this.world_num].on_click(x, y)
    }
  }

  for(var i = 0; i < this.mode_buttons[difficulty].length; i++) {
    this.mode_buttons[difficulty][i].on_click(x, y)
  }
}

WorldMapState.prototype.process_gateway_particles = Level.prototype.process_gateway_particles;
WorldMapState.prototype.generate_gateway_particles = Level.prototype.generate_gateway_particles;
WorldMapState.prototype.draw_gateway_particles = Level.prototype.draw_gateway_particles;
