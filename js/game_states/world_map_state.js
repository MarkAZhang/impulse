WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world, is_practice_mode) {

  this.is_practice_mode = is_practice_mode;

  this.bg_drawn = false
  this.color = "white"//impulse_colors["impulse_blue"]

  this.cur_start_lives = calculate_lives()
  this.cur_start_ult = calculate_ult()
  this.cur_start_spark_val = calculate_spark_val()
  this.has_ult = has_ult()

  this.world_num = world
  this.next_world = null;

  this.buttons = []
  var _this = this

  this.buttons.push(new IconButton("BACK", 16, 70, imp_vars.levelHeight/2+260, 60, 65, this.color, impulse_colors["impulse_blue"], function(){
    _this.fader.set_animation("fade_out", function() {
      switch_game_state(new TitleState(_this));
    });
    switch_bg("Hive 0", 250, imp_vars.bg_opacity)      
  }, "back"));

  this.select_difficulty_button = new SelectDifficultyButton(16, 730, imp_vars.levelHeight/2+260, 100, 65, this.color, impulse_colors["impulse_blue"], this)

  this.buttons.push(this.select_difficulty_button);

  this.world_buttons = {
  }
  // the things you select at the bottom
  this.mode_buttons = []

  this.practice_buttons = {}

  this.num_mode_buttons = 5

  this.requirements = {
    2: "DEFEAT "+imp_params.tessellation_names[1] + " TO UNLOCK",
    3: "DEFEAT "+imp_params.tessellation_names[2] + " TO UNLOCK",
    4: "DEFEAT "+imp_params.tessellation_names[3] + " TO UNLOCK"  
  }

  this.offsets = {
    1: 23,
    2: 18,
    3: 20,
    4: 20
  }

  this.world_unlocked = {
    0: true,
    1: true,
    2: imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 1"],
    3: imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 2"],
    4: imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 3"],
  }

  this.world_button_y = imp_vars.levelHeight/2;

  this.set_up_mode_buttons()

  if (!this.is_practice_mode) {
    this.set_up_world_map()
  } else {
    this.set_up_practice_buttons()
  }

  imp_vars.impulse_music.play_bg(imp_params.songs["Menu"])

  this.fade_out_interval_main = 500
  this.fade_out_interval_practice = 250
  this.fade_out_interval = null
  this.fade_out_duration = null

  this.cur_rating = calculate_current_rating()
  this.next_upgrade = calculate_next_upgrade()

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
  this.gateway_loc = {x: imp_vars.levelWidth/2/imp_vars.draw_factor, y: this.world_button_y/imp_vars.draw_factor}
  this.gateway_size = 5
  this.gateway_particles_per_round = 8

  if (imp_vars.player_data.first_time) {
    // If we don't set timeout, the click event will set world map state back to the game state.
    setTimeout(function() {
      switch_game_state(new MainGameTransitionState(0, null, null, null, null, null, false, true))
    });
  }

}

WorldMapState.prototype.set_up_world_map = function() {
    var _this = this;
    /*this.world_buttons[1] = new SmallButton("I. HIVE IMMUNITAS", 20, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2-100, 200, 200, impulse_colors["boss 1"], impulse_colors["boss 1"],
     function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world 1 dark"];
      setTimeout(function(){
        switch_game_state(new MainGameTransitionState(1, null, null, null, null))
      }, 500)})*/
    for (var i = 0; i <= 4; i++) {
      this.set_up_world_icon(i, imp_vars.levelWidth/2, this.world_button_y, this.world_unlocked[i])  
    }
}

WorldMapState.prototype.set_up_mode_buttons = function() {
  var diff = 75
  var cur_x =  imp_vars.levelWidth/2 - ((this.num_mode_buttons - 1) * 0.5) * diff
  var button_color = "white"
  var text = ["T", "1", "2", "3", "4"]
  for(var i = 0; i <= 4; i++) {
    var _this = this;
    var callback = (function(index) {
      return function() {
        if (_this.world_num != index) {
          _this.fader.set_animation("fade_across", function() {
            _this.world_num = index;
          });
          _this.update_bg(index);
          _this.next_world = index;
        }
      };
    })(i)
    this.mode_buttons.push(new IconButton(text[i], 16, cur_x + (i)*diff, imp_vars.levelHeight/2+250, 60, 60, impulse_colors["world "+i+" bright"], impulse_colors["impulse_blue"], callback, "world"+i))  
    if(i > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(i-1)] && !imp_vars.dev) {
      this.mode_buttons[i].active = false
      this.mode_buttons[i].color = "gray"
    }
  }
}

// Update background based on index and current difficulty.
WorldMapState.prototype.update_bg = function(index) {
  if (index == undefined) {
    index = this.world_num;
  }
  if (index != 0 && imp_vars.player_data.difficulty_mode == "normal") {
    switch_bg("Title Alt" + index, 250, imp_vars.bg_opacity * 0.5)      
  } else {
    switch_bg("Hive 0", 250, imp_vars.bg_opacity * 0.5)      
  }
};

WorldMapState.prototype.set_up_practice_buttons = function() {

  var diff = 85

  for(var i = 1; i <= 4; i++) {
    this.practice_buttons[i] = []
    var colors = ["world "+i+" bright", "world "+i+" bright", "silver", "gold"]
    for(var j = 0; j < 8; j++) {

      var level_name = "HIVE "+i+"-"+(j+1);
      if(j == 7) {
        level_name = "BOSS "+i
      }
      var _this = this;
      var this_color = impulse_colors[colors[imp_params.impulse_level_data[level_name].save_state[imp_vars.player_data.difficulty_mode].stars]]
      var callback = (function(level, index) {
        return function() {
          _this.fade_out_interval = _this.fade_out_interval_practice
          _this.fade_out_duration = _this.fade_out_interval; 
          _this.fade_out_color = impulse_colors["world "+ index +" dark"];
          var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
          _this.draw_world_bg(world_bg_ctx)
          setTimeout(function(){
            switch_game_state(new LevelIntroState(level, index));
          }, _this.fade_out_interval_practice)
        }

      })(level_name, i)
      /*var x = imp_vars.levelWidth/2 + ((-3.5 + j) * diff);
      var y = imp_vars.levelHeight/2+130;*/
      var x = imp_vars.levelWidth/2 + ((-1.5 + (j % 4)) * 150);
      var y = j >= 4 ? imp_vars.levelHeight/2+100  : imp_vars.levelHeight/2 

      var new_button = new IconButton(j+1, 30, x, y, 75, 75, this_color, this_color, callback, "practice"+i);
      new_button.underline_on_hover = false
      new_button.level_name = level_name
      this.practice_buttons[i].push(new_button)
      new_button.active = imp_params.impulse_level_data[level_name].save_state[imp_vars.player_data.difficulty_mode].seen || 
        (j == 0 && this.world_unlocked[i]) || imp_vars.dev
      if(!new_button.active) {
        new_button.color = "gray"
      }

    }
  }
}

WorldMapState.prototype.set_up_world_icon = function(world_num, x, y, unlocked) {
  var text = unlocked ? "START" : "LOCKED";
  var _this = this
  this.world_buttons[world_num] = new IconButton(text, 50, x, y, 150, 150, impulse_colors["world "+world_num+" bright"], impulse_colors["world "+world_num+" bright"],
    function(){
      _this.fade_out_interval = _this.fade_out_interval_main
      _this.fade_out_duration = _this.fade_out_interval; 
      _this.fade_out_color = impulse_colors["world "+world_num+" dark"];
      var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
      _this.draw_world_bg(world_bg_ctx)
      setTimeout(function(){
        switch_game_state(new MainGameTransitionState(world_num, null, null, null, null, null, false, true))
      }, _this.fade_out_interval_main)}, "world"+world_num)
  this.world_buttons[world_num].active = unlocked
}

WorldMapState.prototype.draw_world_bg = function(ctx) {
  draw_bg(ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
}

WorldMapState.prototype.draw = function(ctx, bg_ctx) {
  if (imp_vars.player_data.first_time) {
    return
  }
  if(this.fade_out_color) {
    ctx.save()
    ctx.globalAlpha = 1-(this.fade_out_duration/this.fade_out_interval)
    ctx.fillStyle = this.fade_out_color
    ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    ctx.globalAlpha *= get_bg_opacity(this.world_num)
    ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
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
    //switch_bg("Title Alt1", 500, imp_vars.bg_opacity / 2)
    this.bg_drawn = true
  }

  if (this.fader.get_current_animation() == "fade_across") {
    ctx.save();
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
    this.draw_world(ctx, this.world_num);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= this.fader.get_animation_progress();
    this.draw_world(ctx, this.next_world);
    ctx.restore();
  } else {
    this.draw_world(ctx, this.world_num);
  }

  for(var i = 0; i < this.mode_buttons.length; i++) {
    this.mode_buttons[i].draw(ctx)
    if(this.mode_buttons[i].mouseOver) {
      ctx.textAlign = "center"
      ctx.font = '15px Muli'
      if (i == 0) {
        ctx.fillStyle = impulse_colors['world '+(i)+" bright"]
        ctx.fillText("TUTORIAL", imp_vars.levelWidth/2, imp_vars.levelHeight - 8)  
      } else if(this.mode_buttons[i].active) {
        ctx.fillStyle = impulse_colors['world '+(i)+" bright"]
        ctx.fillText("HIVE "+imp_params.tessellation_names[i], imp_vars.levelWidth/2, imp_vars.levelHeight - 8)  
      } else if(this.mode_buttons[i-1].active) {
        ctx.fillStyle = "gray"
        ctx.fillText(this.requirements[i], imp_vars.levelWidth/2, imp_vars.levelHeight - 8)  
      } else {
        ctx.fillStyle = "gray"
        ctx.fillText("???", imp_vars.levelWidth/2, imp_vars.levelHeight - 8)  
      }
    }
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  // Only draw gateway particles if the current world is active.
  if (!this.is_practice_mode && this.world_unlocked[this.world_num] ) {
    this.draw_gateway_particles(ctx, imp_vars.draw_factor);
  }
  
  ctx.font = '13px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("SELECT HIVE", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 215)


}

// Draw everything associated with a particular hive.
WorldMapState.prototype.draw_world = function(ctx, index) {

  if (!this.is_practice_mode) {
    this.world_buttons[index].draw(ctx)
  }

  if (index > 0) {
    if (!this.is_practice_mode) {
      // draw stuff like rank and continues below the world button
      if(imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode].hasOwnProperty("world "+index)) {
        ctx.save()
        ctx.textAlign = "center"
        ctx.fillStyle = MainGameSummaryState.prototype.get_victory_color(
          imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["victory_type"], 
          index,
          imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["deaths"])
        ctx.font = '18px Muli'
        ctx.fillText('RANK', this.world_buttons[index].x, this.world_buttons[index].y + 100)
        ctx.font = '36px Muli'
        ctx.save()
        var victory_type = imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["victory_type"]
        draw_victory_type_icon(ctx, this.world_buttons[index].x, this.world_buttons[index].y + 120, index, victory_type, 1)
        ctx.restore()
        if(victory_type == "half") {
          ctx.font = '11px Muli'
          ctx.fillText("CONTINUES USED: "+imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["continues"]
            , this.world_buttons[index].x, this.world_buttons[index].y + 150)
        }
        /*if(victory_type == "gold") {
          ctx.font = '11px Muli'
          ctx.fillText("DEATHS: "+imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["deaths"]
            , this.world_buttons[index].x, this.world_buttons[index].y + 80)
        }*/
        ctx.restore()
      }
    } else {
      /*ctx.font = '13px Muli'
      ctx.fillStyle = "white"
      ctx.fillText("SELECT A PRACTICE LEVEL", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 50)*/
      // draw the practice buttons
      /*ctx.save()
      ctx.globalAlpha *= 0.3
      for(var i = 0; i < this.practice_buttons[index].length; i++) {
        if(!this.practice_buttons[index][i].active) continue
        if(i > 0) {

          ctx.beginPath()
          ctx.moveTo(this.practice_buttons[index][i-1].x + this.offsets[index], this.practice_buttons[index][i-1].y)
          ctx.lineTo(this.practice_buttons[index][i].x - this.offsets[index], this.practice_buttons[index][i].y)
          ctx.lineWidth = 6
          ctx.strokeStyle = impulse_colors['boss '+(index)]
          ctx.stroke()
        }
      }
      ctx.restore()*/
      for(var i = 0; i < this.practice_buttons[index].length; i++) {
        this.practice_buttons[index][i].draw(ctx)
      }
    }

    // draw labels.
    /*ctx.textAlign = 'center'
    ctx.font = '16px Muli'
    ctx.fillStyle = impulse_colors["world "+index+" bright"]
    ctx.fillText("PRACTICE", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 80)
    ctx.font = '10px Muli'
    ctx.fillText("SELECT A LEVEL", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 95)*/
  }

  if(index != 0) {
    if (this.is_practice_mode) {
      ctx.fillStyle = "white"
      ctx.font = "24px Muli"
      ctx.fillText("PRACTICE MODE", imp_vars.levelWidth/2, this.world_button_y - 170)  
    } else if (imp_vars.player_data.difficulty_mode == "normal") {
      ctx.fillStyle = "white"
      ctx.font = "24px Muli"
      ctx.fillText("HARD MODE", imp_vars.levelWidth/2, this.world_button_y - 170)  
    }
  }

  // draw hive name
  ctx.fillStyle = impulse_colors["world "+index+" bright"]
  ctx.font = "42px Muli"
  ctx.textAlign = "center"
  if (index > 0) {
    ctx.fillText("HIVE "+imp_params.tessellation_names[index], imp_vars.levelWidth/2, this.world_button_y - 125)
  } else {
    ctx.fillText("TUTORIAL", imp_vars.levelWidth/2, this.world_button_y - 125)  
  }
};

WorldMapState.prototype.process = function(dt) {
  if (imp_vars.player_data.first_time) {
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
  if (!this.is_practice_mode) {
    this.world_buttons[this.world_num].on_mouse_move(x, y)  
  } else {
    if (this.world_num != 0) {
      for(var i = 0; i < this.practice_buttons[this.world_num].length; i++) {
        this.practice_buttons[this.world_num][i].on_mouse_move(x, y)
      }
    }
  }
  
  for(var i = 0; i < this.mode_buttons.length; i++) {
    this.mode_buttons[i].on_mouse_move(x, y)
  }
  
}

WorldMapState.prototype.on_click = function(x, y) {
  if (this.fade_out_duration != null) return
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  if (!this.is_practice_mode) {
    this.world_buttons[this.world_num].on_click(x, y)  
  } else {
    if (this.world_num != 0) {
      for(var i = 0; i < this.practice_buttons[this.world_num].length; i++) {
        this.practice_buttons[this.world_num][i].on_click(x, y)
      }
    }  
  }
  
  for(var i = 0; i < this.mode_buttons.length; i++) {
    this.mode_buttons[i].on_click(x, y)
  }
}

WorldMapState.prototype.process_gateway_particles = Level.prototype.process_gateway_particles;
WorldMapState.prototype.generate_gateway_particles = Level.prototype.generate_gateway_particles;
WorldMapState.prototype.draw_gateway_particles = Level.prototype.draw_gateway_particles;
