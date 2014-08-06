WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world) {
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
  }, "back"));
  this.world_buttons = {

  }
  // the things you select at the bottom
  this.mode_buttons = []

  this.practice_buttons = {}

  this.num_mode_buttons = 4

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

  this.set_up_world_map()
  this.set_up_mode_buttons()
  this.set_up_practice_buttons()

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
  this.gateway_loc = {x: imp_vars.levelWidth/2/imp_vars.draw_factor, y: (imp_vars.levelHeight/2 - 125)/imp_vars.draw_factor}
  this.gateway_size = 5
  this.gateway_particles_per_round = 8
}

WorldMapState.prototype.set_up_world_map = function() {
    var _this = this;
    /*this.world_buttons[1] = new SmallButton("I. HIVE IMMUNITAS", 20, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2-100, 200, 200, impulse_colors["boss 1"], impulse_colors["boss 1"],
     function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world 1 dark"];
      setTimeout(function(){
        switch_game_state(new MainGameTransitionState(1, null, null, null, null))
      }, 500)})*/

    this.set_up_world_icon(1, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "START", true)
    this.set_up_world_icon(2, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "START", imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 1"])
    this.set_up_world_icon(3, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "START", imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 2"])
    this.set_up_world_icon(4, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "START", imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 3"])


}

WorldMapState.prototype.set_up_mode_buttons = function() {
  var diff = 75
  var cur_x =  imp_vars.levelWidth/2 - ((this.num_mode_buttons - 1) * 0.5) * diff
  var button_color = "white"
  for(var i = 1; i <= 4; i++) {
    var _this = this;
    var callback = (function(index) {
      return function() {
        if (_this.world_num != index) {
          _this.fader.set_animation("fade_across", function() {
            _this.world_num = index;
          }); 
          _this.next_world = index;
        }
      };
    })(i)
    this.mode_buttons.push(new IconButton("", 16, cur_x + (i-1)*diff, imp_vars.levelHeight/2+250, 60, 60, impulse_colors["world "+i+" bright"], impulse_colors["impulse_blue"], callback, "world"+i))  
    if(i > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(i-1)] && !imp_vars.dev) {
      this.mode_buttons[i-1].active = false
      this.mode_buttons[i-1].color = "gray"
    }
  }
}

WorldMapState.prototype.set_up_practice_buttons = function() {

  var diff = 85

  for(var i = 0; i < 4; i++) {
    this.practice_buttons[i+1] = []
    var colors = ["world "+(i+1)+" bright", "world "+(i+1)+" bright", "silver", "gold"]
    for(var j = 0; j < 8; j++) {

      var level_name = "HIVE "+(i+1)+"-"+(j+1);
      if(j == 7) {
        level_name = "BOSS "+(i+1)
      }
      var _this = this;
      var this_color = impulse_colors[colors[imp_params.impulse_level_data[level_name].save_state[imp_vars.player_data.difficulty_mode].stars]]
      var callback = (function(level, index) {
        return function() {
          _this.fade_out_interval = _this.fade_out_interval_practice
          _this.fade_out_duration = _this.fade_out_interval; 
          _this.fade_out_color = impulse_colors["world "+ (index + 1) +" dark"];
          var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
          _this.draw_world_bg(world_bg_ctx)
          setTimeout(function(){
            switch_game_state(new LevelIntroState(level, index + 1));
          }, _this.fade_out_interval_practice)
        }

      })(level_name, i)
      var new_button = new IconButton(j == 7 ? "BOSS" : j+1, 20, imp_vars.levelWidth/2 + ((-3.5 + j) * diff), imp_vars.levelHeight/2+130, 50, 50,
      this_color, this_color, callback, "practice"+(i+1))
      new_button.underline_on_hover = false
      new_button.level_name = level_name
      this.practice_buttons[i+1].push(new_button)
      new_button.active = imp_params.impulse_level_data[level_name].save_state[imp_vars.player_data.difficulty_mode].seen || j == 0 || imp_vars.dev
      if(!new_button.active) {
        new_button.color = "gray"
      }

    }
  }
}

WorldMapState.prototype.set_up_world_icon = function(world_num, x, y, name, unlocked) {
  var _this = this
  if(unlocked) {
      this.world_buttons[world_num] = new SmallButton(name, 32, x, y, 150, 100, impulse_colors["world "+world_num+" bright"], impulse_colors["world "+world_num+" bright"],
      function(){
        _this.fade_out_interval = _this.fade_out_interval_main
        _this.fade_out_duration = _this.fade_out_interval; 
        _this.fade_out_color = impulse_colors["world "+world_num+" dark"];
        var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
        _this.draw_world_bg(world_bg_ctx)
        setTimeout(function(){
          switch_game_state(new MainGameTransitionState(world_num, null, null, null, null))
        }, _this.fade_out_interval_main)})
  } else {
    this.world_buttons[world_num] = new SmallButton(this.requirements[world_num], 16, x, y, 200, 200, impulse_colors["boss "+world_num], impulse_colors["boss "+world_num],
     function(){})
    this.world_buttons[world_num].active = false
  }
}

WorldMapState.prototype.draw_world_bg = function(ctx) {
  draw_bg(ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
}

WorldMapState.prototype.draw = function(ctx, bg_ctx) {

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
    draw_image_on_bg_ctx(bg_ctx, imp_vars.title_bg_canvas, imp_vars.bg_opacity)
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
      if(this.mode_buttons[i].active) {
        ctx.fillStyle = impulse_colors['world '+(i+1)+" bright"]
        ctx.fillText("HIVE "+imp_params.tessellation_names[i+1], imp_vars.levelWidth/2, imp_vars.levelHeight - 8)  
      } else if(this.mode_buttons[i-1].active) {
        ctx.fillStyle = "gray"
        ctx.fillText(this.requirements[i+1], imp_vars.levelWidth/2, imp_vars.levelHeight - 8)  
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
  this.draw_gateway_particles(ctx, imp_vars.draw_factor);
  
  ctx.font = '13px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("SELECT HIVE", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 215)

  draw_lives_and_sparks(ctx, this.cur_start_lives, this.cur_start_spark_val, this.cur_start_ult,
   imp_vars.levelWidth/2, imp_vars.levelHeight/2, 15, {labels: true, starting_values: true, ult: this.has_ult})

  

  ctx.font = '15px Muli'
  ctx.textAlign = 'center'
  ctx.fillStyle = "white";
  ctx.fillText(imp_vars.player_data.difficulty_mode == "normal" ? "CHALLENGE MODE" : "STANDARD MODE", imp_vars.levelWidth/2, 30)
  ctx.restore()
}

// Draw everything associated with a particular hive.
WorldMapState.prototype.draw_world = function(ctx, index) {

  ctx.save()
  if(this.world_buttons[index].hover) {
    if(index == 3) {
      ctx.globalAlpha *= 0.5  
    } else {
      ctx.globalAlpha *= 0.7  
    }
  } else {
    if(index == 3) {
      ctx.globalAlpha *= 0.3  
    } else {
      ctx.globalAlpha *= 0.4
    }
  }
  if(index > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(index-1)]) {
    draw_gray_tessellation_sign(ctx, index, this.world_buttons[index].x, this.world_buttons[index].y - 10, 100,this.world_buttons[index].hover)
  } else {
    draw_tessellation_sign(ctx, index, this.world_buttons[index].x, this.world_buttons[index].y - 10, 100,this.world_buttons[index].hover)
  }

  ctx.restore()
  this.world_buttons[index].draw(ctx)

  if(imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode].hasOwnProperty("world "+index)) {
    ctx.save()
    ctx.textAlign = "center"
    ctx.fillStyle = MainGameSummaryState.prototype.get_victory_color(
      imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["victory_type"], 
      index,
      imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["deaths"])
    ctx.font = '12px Muli'
    ctx.fillText('RANK', this.world_buttons[index].x, this.world_buttons[index].y + 30)
    ctx.font = '36px Muli'
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = 100
    ctx.save()
    var victory_type = imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["victory_type"]
    draw_victory_type_icon(ctx, this.world_buttons[index].x, this.world_buttons[index].y + 50, index, victory_type, 1)
    ctx.restore()
    if(victory_type == "half") {
      ctx.font = '11px Muli'
      ctx.fillText("CONTINUES USED: "+imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["continues"]
        , this.world_buttons[index].x, this.world_buttons[index].y + 80)
    }
    /*if(victory_type == "gold") {
      ctx.font = '11px Muli'
      ctx.fillText("DEATHS: "+imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["deaths"]
        , this.world_buttons[index].x, this.world_buttons[index].y + 80)
    }*/
    ctx.restore()
  }

  ctx.save()
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
  ctx.restore()
  for(var i = 0; i < this.practice_buttons[index].length; i++) {
    this.practice_buttons[index][i].draw(ctx)
  }

  ctx.textAlign = 'center'
  ctx.font = '16px Muli'
  ctx.fillStyle = impulse_colors["world "+index+" bright"]
  ctx.fillText("PRACTICE", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 80)
  ctx.font = '10px Muli'
  ctx.fillText("SELECT A LEVEL", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 95)

  ctx.save()
  ctx.fillStyle = impulse_colors["world "+index+" bright"]
  ctx.font = "30px Muli"
  ctx.textAlign = "center"
  ctx.fillText("HIVE "+imp_params.tessellation_names[index], imp_vars.levelWidth/2, 70)
  ctx.restore()

};

WorldMapState.prototype.process = function(dt) {
  if(this.fade_out_duration != null) {
    this.fade_out_duration -= dt
  }
  this.process_gateway_particles(dt);
  this.fader.process(dt);
}

WorldMapState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  this.world_buttons[this.world_num].on_mouse_move(x, y)
  for(var i = 0; i < this.mode_buttons.length; i++) {
    this.mode_buttons[i].on_mouse_move(x, y)
  }
  for(var i = 0; i < this.practice_buttons[this.world_num].length; i++) {
    this.practice_buttons[this.world_num][i].on_mouse_move(x, y)
  }
}

WorldMapState.prototype.on_click = function(x, y) {
  if (this.fade_out_duration != null) return
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  this.world_buttons[this.world_num].on_click(x, y)
  for(var i = 0; i < this.mode_buttons.length; i++) {
    this.mode_buttons[i].on_click(x, y)
  }
  for(var i = 0; i < this.practice_buttons[this.world_num].length; i++) {
    this.practice_buttons[this.world_num][i].on_click(x, y)
  }
}

WorldMapState.prototype.process_gateway_particles = Level.prototype.process_gateway_particles;
WorldMapState.prototype.generate_gateway_particles = Level.prototype.generate_gateway_particles;
WorldMapState.prototype.draw_gateway_particles = Level.prototype.draw_gateway_particles;
