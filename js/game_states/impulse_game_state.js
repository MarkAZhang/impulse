ImpulseGameState.prototype = new GameState

ImpulseGameState.prototype.constructor = ImpulseGameState

function ImpulseGameState(world, level, visibility_graph, hive_numbers, main_game, first_time) {

  if(world == null || world == undefined) return

  this.init(world, level, visibility_graph, first_time, hive_numbers, main_game)
}

ImpulseGameState.prototype.init = function(world, level, visibility_graph, first_time, hive_numbers, main_game) {

  this.game_numbers = {score: 0, combo: 1, base_combo: 1, seconds: 0, kills: 0, game_length: 0, last_time: null, impulsed: false}
  this.hive_numbers = hive_numbers

  this.main_game = main_game
  if(this.main_game) {
    this.hive_numbers.sparks = Math.floor(this.hive_numbers.sparks);
    this.hive_numbers.lives = Math.floor(this.hive_numbers.lives);
  }

  this.pause = true
  this.ready = false
  this.buttons = []
  this.last_fps_time = 0
  this.fps_counter = null
  this.fps = 0
  this.score_labels = []
  this.score_label_duration = 1000
  this.score_label_rise = 30
  this.buffer_radius = 1 //primarily for starting player location
  this.bg_drawn = false
  this.has_ult = has_ult()
  this.boss_intro_text_activated = false
  

  this.stars = 0
  this.world_num = world
  this.cutoff_messages = ["BRONZE SCORE ACHIEVED", "SILVER SCORE ACHIEVED", "GOLD SCORE ACHIEVED"]
  this.score_goal_messages = ["BRONZE: ", "SILVER: ", "GOLD: "]
  this.star_colors =  ["world "+this.world_num+ " lite", "silver", "gold"]

  this.progress_bar_prop = 0
  this.progress_bar_adjust = 3000
  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new b2World(gravity, doSleep);

  if(level) {
    this.level = level
    this.level.impulse_game_state = this
    this.level.reset() //we re-use the level
    this.level_name = this.level.level_name
    this.is_boss_level = this.level_name.slice(0,4) == "BOSS"
    this.make_player()
    if(this.level_name == "BOSS 4") {
      imp_vars.impulse_music.play_bg(imp_params.songs["Final Tessellation"])
    }
    else if(this.level_name.slice(0, 4) == "BOSS")
      imp_vars.impulse_music.play_bg(imp_params.songs["Tessellation"])
    else if (this.world_num != 0)
      imp_vars.impulse_music.play_bg(imp_params.songs["Hive "+this.world_num])
  }

  this.visibility_graph = visibility_graph
  this.color = this.is_boss_level ? impulse_colors["boss "+this.world_num] : impulse_colors["world "+this.world_num+" lite"]
  this.dark_color = impulse_colors["world "+this.world_num +" dark"];
  this.lite_color = impulse_colors["world "+this.world_num +" lite"];
  this.bright_color = impulse_colors["world "+this.world_num +" bright"];

  this.boss_intro_text_interval = 6000
  this.boss_intro_text_duration = 0

  //add walls

  this.addWalls()

  var contactListener = new b2ContactListener;
  contactListener.BeginContact = this.handle_collisions
  contactListener.PreSolve = this.filter_collisions
  contactListener.EndContact = this.handle_collisions_on_end_contact
  this.world.SetContactListener(contactListener);
  this.pause = false
  this.ready = true

  this.bg_visible = false

  this.world_visible = true

  this.world_visibility = 1

  this.camera_center = {x: imp_vars.levelWidth/2, y: imp_vars.levelHeight/2}
  //this.zoom = 0.1

  this.slow_zoom_transition_period = 1500;
  this.fast_zoom_transition_period = 750
  this.zoom_transition_timer = 0;
  this.zoom_state = "none";
  this.zoom_start_pt = {x:imp_vars.levelWidth, y:imp_vars.levelHeight}
  this.zoom_target_pt = {x:imp_vars.levelWidth, y:imp_vars.levelHeight}
  this.zoom_start_scale = 0.1
  this.zoom_target_scale = 1
  this.zoom = 0.1
  this.zoom_bg_switch = true;
  this.first_time = first_time;
  if(this.first_time) {
    this.zoom_in({x:imp_vars.levelWidth/2, y:imp_vars.levelHeight/2}, 1, this.slow_zoom_transition_period)
  } else {
    this.zoom_in({x:imp_vars.levelWidth/2, y:imp_vars.levelHeight/2}, 1, this.fast_zoom_transition_period)
  }


  this.fade_state = "in"
  this.victory = false
  this.gateway_unlocked = false

  this.draw_interface_interval = 100
  this.draw_interface_timer = this.draw_interface_interval

  this.level_redraw_bg = false

  this.new_enemy_duration = 30000
  this.new_enemy_timer = 0
  this.new_enemy_type = null

  this.score_achieve_duration = 5000
  this.score_achieve_timer = 0
  this.score_achieve_type = null
  this.score_achieve_color = null
  this.score_achieve_size = null

  this.message_canvas = document.createElement('canvas');
  this.message_canvas.width = 120
  this.message_canvas.height = 160
  this.message_ctx = this.message_canvas.getContext('2d');

  if(level && !(this instanceof HowToPlayState)) {
    this.check_new_enemies()
  }

  // Manually set the current colors for the game button.
  for( var i = 0; i < imp_params.game_buttons.length; i++) {
    imp_params.game_buttons[i].color = this.color
    imp_params.game_buttons[i].hover_color = this.bright_color
  }

  // if this is world zero. show the tutorial.
  this.show_tutorial = (this.world_num == 0 || 
    imp_vars.player_data.tutorial_shown.length < TutorialOverlayManager.prototype.on_demand_overlays.length)
  if (this.show_tutorial) {
    this.tutorial_overlay_manager = new TutorialOverlayManager(this);
    this.tutorial_signals = {};
  }

  if (!this.is_boss_level && this.level) {
    this.check_cutoffs();
  }

  if (this.world_num == 0 && this.hive_numbers) {
    this.hive_numbers.lives = 99;
  }
}

ImpulseGameState.prototype.reset = function() {
  this.game_numbers = {score: 0, combo: 1, base_combo: 1, seconds: 0, kills: 0, game_length: 0, last_time: null}
  this.new_enemy_duration = 10000
  this.new_enemy_timer = 0
  this.new_enemy_type = null
  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new b2World(gravity, doSleep);
  this.addWalls()

  var contactListener = new b2ContactListener;
  contactListener.BeginContact = this.handle_collisions
  contactListener.PreSolve = this.filter_collisions
  this.world.SetContactListener(contactListener);

  this.score_achieve_duration = 10000
  this.score_achieve_timer = 0
  this.score_achieve_type = null
  this.score_achieve_color = null
  this.score_achieve_size = null
  this.stars = 0
  this.gateway_unlocked = false
  this.victory = false
  this.level.reset()
  if(this.level && !(this instanceof HowToPlayState)) {
    this.check_new_enemies()
  }
  imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
  this.level.draw_bg(imp_vars.bg_ctx)
  imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)
  this.progress_bar_prop = 0
  this.boss_intro_text_activated = false
  
  if (!this.is_boss_level && this.level) {
    this.check_cutoffs();
  }
 // draw_music_icon(context, imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 20, 15, this.color, true, imp_vars.player_data.options.music_mute))
 // draw_pause_icon(context, imp_vars.sidebarWidth/2 - 40, imp_vars.canvasHeight - 20, 15, this.color, true)
 // draw_fullscreen_icon(context, imp_vars.sidebarWidth/2 + 40, imp_vars.canvasHeight - 20, 15, this.color, true)
}

ImpulseGameState.prototype.check_new_enemies = function() {
  for(var enemy in imp_params.impulse_level_data[this.level_name].enemies) {
    imp_params.impulse_enemy_stats[enemy].seen += 1
    save_game()
    var difficulty_level = imp_vars.player_data.difficulty_mode
    if(!imp_params.impulse_enemy_stats[enemy].is_boss &&
        (imp_params.impulse_enemy_stats[enemy].seen <= 1 ||
         imp_params.impulse_enemy_stats[enemy].seen <= 5 && imp_params.impulse_level_data[this.level.level_name].save_state[difficulty_level].stars == 0)) {
      this.clear_message()
      this.new_enemy_type = enemy
      this.new_enemy_timer = this.new_enemy_duration
      draw_new_enemy_button(this.message_ctx, 60, 80, 120, 160, this.bright_color, this.new_enemy_type)
     //set_dialog_box(new NewEnemyDialog())
    }
  }
}

ImpulseGameState.prototype.make_player = function() {
  if(this.level.get_starting_loc()) {
    this.player = new Player(this.world, this.level.get_starting_loc().x/imp_vars.draw_factor, this.level.get_starting_loc().y/imp_vars.draw_factor, this)
  }
  else {
    var r_p = getRandomValidLocation({x: -10, y: -10}, this.buffer_radius, imp_vars.draw_factor)
    this.player = new Player(this.world, r_p.x, r_p.y, this)
  }
}

ImpulseGameState.prototype.zoom_in = function(center, target, interval) {
  this.zoom_state = "in"
  this.zoom_transition_period = interval
  this.zoom_transition_timer = interval
  this.zoom_target_pt = center;
  this.zoom_target_scale = target;
  this.zoom_start_pt = {x:this.camera_center.x, y:this.camera_center.y};
  this.zoom_start_scale = this.zoom;
  this.zoom_bg_switch = false;
}

ImpulseGameState.prototype.zoom_out = function(center, target, interval) {
  this.zoom_state = "out"
  this.zoom_transition_period = interval
  this.zoom_transition_timer = interval;
  this.zoom_target_pt = center;
  this.zoom_target_scale = target;
  this.zoom_start_pt = {x:this.camera_center.x, y:this.camera_center.y};
  this.zoom_start_scale = this.zoom;
  this.zoom_bg_switch = false;
}

ImpulseGameState.prototype.loading_screen = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath()
  ctx.font = '30px Muli'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("LOADING", imp_vars.levelWidth/2, (imp_vars.levelHeight)/2)
  ctx.fill()
}

ImpulseGameState.prototype.check_pause = function() {
  if(document.webkitHidden) {
    this.pause = true
    set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
  }
}

ImpulseGameState.prototype.clear_message = function() {
  this.new_enemy_type = null
  this.score_achieve_text= null
}

ImpulseGameState.prototype.process = function(dt) {
  if(!this.ready) return
  if(this.fps_counter == null)
  {
    this.last_fps_time = (new Date()).getTime()
    this.fps_counter = 0
    this.fps = "???"
  }
  else if(this.fps_counter == 100)
  {
    this.fps_counter = 0
    var a = (new Date()).getTime()
    this.fps = Math.round(100000/(a-this.last_fps_time))
    this.last_fps_time = a
  }
  this.fps_counter+=1
  if(!this.pause)
  {
    if (this.show_tutorial) {
      this.tutorial_overlay_manager.process(dt);
      if(this.gateway_unlocked && p_dist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
        this.add_tutorial_signal("moved_to_gateway")
      }
    }
    this.check_pause()
    this.draw_interface_timer -= dt

    if(this.new_enemy_timer > 0) {
      this.new_enemy_timer -= dt
    } else if (this.new_enemy_type) {
      this.clear_message()
    }

    if(this.score_achieve_timer > 0) {
      this.score_achieve_timer -= dt
    } else if (this.score_achieve_text) {
      this.clear_message()
    }

    /*if (this.game_numbers.seconds >= 4) {
      this.zoom_to_player = true
      this.zoom = 1.7
      this.zoom_state = "player"
    }*/

    // ZOOM TO PLAYER, WAS USED DURING TRAILER RECORDING
    if (!this.zoom_to_player) {
      if(this.zoom_state != "none") {
        if(this.zoom_transition_timer <= 0) {
          this.zoom_state = "none"
          this.zoom = this.zoom_target_scale;
          this.camera_center = this.zoom_target_pt;
          this.zoom_bg_switch = false;
        } else {
          var prop = (this.zoom_transition_timer) / (this.zoom_transition_period)
          //bezier_interpolate(0.9, 0.9, (this.zoom_transition_timer) / (this.zoom_transition_period))
          this.zoom = 1/(1/(this.zoom_start_scale) * prop + 1/(this.zoom_target_scale) * (1-prop))
          this.camera_center.x = this.zoom_start_pt.x * prop + this.zoom_target_pt.x * (1-prop)
          this.camera_center.y = this.zoom_start_pt.y * prop + this.zoom_target_pt.y * (1-prop)
          this.zoom_transition_timer -= dt;
        }
      }
    } else {
      this.camera_center = {x: this.player.body.GetPosition().x * imp_vars.draw_factor,
                            y: this.player.body.GetPosition().y * imp_vars.draw_factor}
    }

    if(this.zoom_state == "none" && this.zoom == 1 && this.is_boss_level && !this.boss_intro_text_activated) {
      this.boss_intro_text_duration = this.boss_intro_text_interval
      if(this.world_num == 4) {
        this.boss_intro_text_duration /= 2
        this.boss_intro_text_interval /= 2
      }
      this.boss_intro_text_activated = true
    }

    if(this.boss_intro_text_duration > 0) {
      this.boss_intro_text_duration -= dt
    }

    if (this.player.dying && this.player.dying_duration > 0 && !this.level.restarting_level && this.hive_numbers.lives > 0) {
      this.level.prepare_level_for_reset();
      this.game_numbers.score = 0;
      this.game_numbers.combo = 1;
      this.stars = 0;
    }

    if((this.player.dying && this.player.dying_duration < 0) || this.exit_tutorial)
    {
      if (this.main_game && !this.world_num == 0 && this.zoom_state == "none" && this.zoom == 1) {
        if (imp_vars.player_data.difficulty_mode == "normal") {
          this.hive_numbers.lives -= 1  
        }
        this.hive_numbers.game_numbers[this.level.level_name].deaths += 1
      }

      if (this.exit_tutorial || (this.hive_numbers.lives < 0 && this.main_game)) {
        if(this.zoom_state == "none" && this.zoom == 1) {
          this.zoom_out({x:imp_vars.levelWidth/2, y:imp_vars.levelHeight/2}, 0.1, this.fast_zoom_transition_period)
          this.fade_state = "out"
        } else if(this.zoom_state == "none"){
          this.ready = false
          this.game_over();
        }
      } else {
        this.reset();
        this.make_player();  
      }
      return;
    }


    if(this.level.boss && this.level.boss.dying && this.level.boss.dying_duration < 0) {
      if(this.zoom_state == "none" && this.zoom == 1) {
        this.zoom_in({x:imp_vars.levelWidth/2, y:imp_vars.levelHeight/2}, 10, this.slow_zoom_transition_period)
        this.fade_state = "out"
        this.victory = true
        this.level.boss_victory = true
      } else if(this.zoom_state == "none"){
        this.ready = false
        this.game_over();
      }
      return;
    }

    if(this.victory)
    {
      if(this.zoom_state == "none" && this.zoom == 1) {
        this.zoom_out({x: this.player.body.GetPosition().x * imp_vars.draw_factor, y: this.player.body.GetPosition().y * imp_vars.draw_factor}, 10, this.slow_zoom_transition_period)
        this.fade_state = "out"
      } else if(this.zoom_state == "none"){
        this.ready = false
        this.game_over(true);
      }
      return;
    }

    if(!this.is_boss_level) {

      var temp_stars = this.stars < 3 ? this.stars : 2
      var prop = Math.min(this.game_numbers.score/this.level.cutoff_scores[temp_stars], 1)
      var adjust_time = this.progress_bar_adjust;
      if (this.player.dying) {
        adjust_time /= 3
      }
      if(this.progress_bar_prop > prop) {
        this.progress_bar_prop  = Math.max(this.progress_bar_prop - dt/adjust_time, prop)
      }
      else if(this.progress_bar_prop < prop) {
        this.progress_bar_prop  = Math.min(this.progress_bar_prop + dt/adjust_time, prop)
      }
    }


    if(this.world_visible && this.world_visibility < 1)
    {
      this.world_visibility = Math.min(1, this.world_visibility + dt/1000)
    }
    else if(!this.world_visible && this.world_visibility > 0)
    {
      this.world_visibility = Math.max(0, this.world_visibility - dt/1000)
    }
    this.player.process(dt)
    this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)

    this.game_numbers.game_length += dt

    this.game_numbers.seconds = Math.round(this.game_numbers.game_length/1000)
    this.level.process(dt)
    for(var i = this.score_labels.length - 1; i >= 0; i--) {
      this.score_labels[i].duration -= dt
      if(this.score_labels[i].duration <= 0) {
        this.score_labels.splice(i, 1)
      }
    }

    this.world.Step(1.0/60, 1, 10);

    this.additional_processing(dt)
  } else {

  }
}

ImpulseGameState.prototype.additional_processing = function(dt) {}

ImpulseGameState.prototype.bg_transition = function() {
  if(this.zoom_bg_switch) return
  if(this.zoom == 1 && this.zoom_state == "none") {
    bg_canvas.setAttribute("style","");//make background visible*/
    this.bg_visible = true
  } else {
    bg_canvas.setAttribute("style","display: none");//make background invisible*/
    this.bg_visible = false
  }
  this.zoom_bg_switch = true


}

ImpulseGameState.prototype.set_zoom_transparency = function(ctx) {
  if(this.fade_state == "in") {
      var prop = bezier_interpolate(0.1, 0.5, (this.zoom_transition_timer) / (this.zoom_transition_period))
      ctx.globalAlpha = Math.min(1-prop,1)
  } else if(this.fade_state == "out"){
    var prop = bezier_interpolate(0.1, 0.5, (this.zoom_transition_timer) / (this.zoom_transition_period))
    ctx.globalAlpha = Math.max(prop,0)
  }
}

ImpulseGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.ready) return
  if(this.pause) return
  /*context.save();*/

  /*ctx.scale(this.zoom, this.zoom)
  ctx.translate((canvasWidth/2 - (this.camera_center.x)*this.zoom)/this.zoom, (canvasHeight/2 - this.camera_center.y*this.zoom)/this.zoom);
  ctx.drawImage(bg_canvas, imp_vars.sidebarWidth*this.zoom, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0);*/

  this.additional_draw(ctx, bg_ctx)
  ctx.save();
  ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar

  if(this.zoom_state != "none" ) {
    ctx.rect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    ctx.clip()
  }

  ctx.fillStyle = this.dark_color

  ctx.scale(this.zoom, this.zoom)
  ctx.translate((imp_vars.levelWidth/2 - this.camera_center.x*this.zoom)/this.zoom, (imp_vars.levelHeight/2 - this.camera_center.y*this.zoom)/this.zoom);
  /*ctx.translate(this.camera_center.x * (1-this.zoom) * 2, this.camera_center.y * (1-this.zoom) * 2);*/
  /*ctx.translate(this.camera_center.x * this.zoom, this.camera_center.y * this.zoom)*/
  ctx.beginPath();
  if(this.zoom_state != "none" ) {
    ctx.rect(2, 2, imp_vars.levelWidth-4, imp_vars.levelHeight-4);
    ctx.clip();
  }

  this.set_zoom_transparency(ctx);
  if(this.zoom_state != "none") {
    ctx.drawImage(bg_canvas, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  }

  this.level.pre_draw(ctx, imp_vars.draw_factor )
  this.player.pre_draw(ctx)

  this.level.draw(ctx, imp_vars.draw_factor)

  if(this.zoom != 1 && this.victory) {
    ctx.save()

    ctx.translate(this.player.body.GetPosition().x * imp_vars.draw_factor, this.player.body.GetPosition().y * imp_vars.draw_factor)
    ctx.scale(1/this.zoom, 1/this.zoom)
    ctx.translate(-this.player.body.GetPosition().x * imp_vars.draw_factor, -this.player.body.GetPosition().y * imp_vars.draw_factor)
    this.player.draw(ctx)
    ctx.restore();
  } else {
    this.player.draw(ctx)
  }


  if(this.level_redraw_bg) {

    this.level.open_gateway()
    this.level_redraw_bg = false
  }

  ctx.beginPath()

  if(this.zoom_state == "none") {
    ctx.rect(2, 2, imp_vars.levelWidth-4, imp_vars.levelHeight-4);
    ctx.clip();
  }

  if(this.boss_intro_text_duration > 0 && this.boss_intro_text_duration < this.boss_intro_text_interval && this.main_game && this.zoom == 1 && this.world_num <= 4 && this.first_time) {
    this.draw_boss_text(ctx)
  }  

  // if it's the first boss and they've never beaten it, show the arrow.
  if(this.boss_intro_text_duration > 0 && this.boss_intro_text_duration < this.boss_intro_text_interval && 
    this.main_game && this.zoom == 1 && this.world_num == 1 && imp_vars.player_data.difficulty_mode == "easy" &&
    imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].stars < 3) {
      this.draw_boss_hint(ctx)
  }

  /*ctx.translate(-(imp_vars.levelWidth/2 - this.camera_center.x*this.zoom)/this.zoom, -(imp_vars.levelHeight/2 - this.camera_center.y*this.zoom)/this.zoom);
  /*ctx.translate(-this.camera_center.x * (1-this.zoom) * 2, -this.camera_center.y * (1-this.zoom) * 2);*/
  /*ctx.scale(1/this.zoom, 1/this.zoom)*/

  /*ctx.translate(-imp_vars.sidebarWidth, 0)*/
  if(!this.is_boss_level) {
    this.draw_score_labels(ctx)
  }

  // Draw the tutorial if applicable.
  if (this.show_tutorial) {
    this.tutorial_overlay_manager.draw(ctx);
  }

  ctx.restore()

  ctx.clearRect(0, 0, imp_vars.sidebarWidth, imp_vars.canvasHeight);
  ctx.clearRect(imp_vars.canvasWidth - imp_vars.sidebarWidth, 0, imp_vars.sidebarWidth, imp_vars.canvasHeight);
  if(this.zoom == 1 && this.zoom_state == "none") {
    if(this.draw_interface_timer < 0) {
      this.draw_interface(bg_ctx)
      this.draw_interface_timer = this.draw_interface_interval
    }
  } else {
    this.draw_interface(ctx)
  }
  if (!this.world_num == 0 || imp_params.impulse_level_data[this.level_name].show_full_interface) { 
    if(this.new_enemy_type != null) {
      ctx.save()
      this.set_zoom_transparency(ctx)
      if (this.new_enemy_timer < 500) {
        ctx.globalAlpha *= Math.max(0, this.new_enemy_timer / 500) 
      } else if (this.new_enemy_timer > this.new_enemy_duration - 500) {
        ctx.globalAlpha *= Math.max(0, (this.new_enemy_duration - this.new_enemy_timer) / 500) 
      }
      ctx.drawImage(this.message_canvas, 0, 0, 120, 160, imp_vars.sidebarWidth/2 - 60, imp_vars.canvasHeight/2, 120, 160)
      ctx.restore()
    }

    if(this.score_achieve_text != null) {
      ctx.save()
      this.set_zoom_transparency(ctx)
      if (this.score_achieve_timer < 500) {
        ctx.globalAlpha *= Math.max(0, this.score_achieve_timer / 500) 
      } else if (this.score_achieve_timer > this.score_achieve_duration - 500) {
        ctx.globalAlpha *= Math.max(0, (this.score_achieve_duration - this.score_achieve_timer) / 500) 
      }
      ctx.drawImage(this.message_canvas, 0, 0, 120, 160, imp_vars.sidebarWidth/2 - 60, imp_vars.canvasHeight/2 - 30, 120, 160)
      ctx.restore()
    }
  }

  this.draw_score_bar(ctx)

  for(var i=0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }

  this.bg_transition()

  /*for(var i = 0; i < this.visibility_graph.vertices.length; i++)
  {
      ctx.beginPath()
    	ctx.fillStyle = 'green';
    	ctx.arc(this.visibility_graph.vertices[i].x*imp_vars.draw_factor, this.visibility_graph.vertices[i].y*imp_vars.draw_factor, 2, 0, 2*Math.PI, true)
      ctx.font = 'italic 10px sans-serif'
      ctx.fillText(i, this.visibility_graph.vertices[i].x*imp_vars.draw_factor, this.visibility_graph.vertices[i].y*imp_vars.draw_factor)
    	ctx.fill()
  }*/

  /*for(var i = 0; i < this.visibility_graph.poly_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 1
    	ctx.strokeStyle = '#ccc';
      ctx.moveTo(this.visibility_graph.poly_edges[i].p1.x*imp_vars.draw_factor +imp_vars.sidebarWidth, this.visibility_graph.poly_edges[i].p1.y*imp_vars.draw_factor)
      ctx.lineTo(this.visibility_graph.poly_edges[i].p2.x*imp_vars.draw_factor + imp_vars.sidebarWidth, this.visibility_graph.poly_edges[i].p2.y*imp_vars.draw_factor)
    	ctx.stroke()
  }

  /*for(var i = 0; i < this.level.obstacle_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 3
    	ctx.strokeStyle = 'brown';
      ctx.moveTo(this.level.obstacle_edges[i].p1.x*imp_vars.draw_factor + imp_vars.sidebarWidth, this.level.obstacle_edges[i].p1.y*imp_vars.draw_factor)
      ctx.lineTo(this.level.obstacle_edges[i].p2.x*imp_vars.draw_factor + imp_vars.sidebarWidth, this.level.obstacle_edges[i].p2.y*imp_vars.draw_factor)
    	ctx.stroke()
  }

  ctx.save()
  ctx.translate(imp_vars.sidebarWidth, 0)
  for(var i = 0; i < this.visibility_graph.edges.length; i++)
  {
      ctx.beginPath()
    	ctx.strokeStyle = 'red';
      ctx.moveTo(this.visibility_graph.edges[i].p1.x*draw_factor, this.visibility_graph.edges[i].p1.y*draw_factor)
      ctx.lineTo(this.visibility_graph.edges[i].p2.x*draw_factor, this.visibility_graph.edges[i].p2.y*draw_factor)
    	ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = 'red'
      ctx.fillText(Math.round(p_dist(this.visibility_graph.edges[i].p1, this.visibility_graph.edges[i].p2)), (this.visibility_graph.edges[i].p1.x*imp_vars.draw_factor+this.visibility_graph.edges[i].p2.x*imp_vars.draw_factor)/2, (this.visibility_graph.edges[i].p1.y*imp_vars.draw_factor+this.visibility_graph.edges[i].p2.y*imp_vars.draw_factor)/2)
      ctx.fill()
  }
  ctx.restore()*/
  /*ctx.globalAlpha = 0.5*/


  /*ctx.save();

  var split_size = 50
  ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
  ctx.beginPath()
  for(var i = 0; i < imp_vars.levelWidth; i += split_size) {
    ctx.moveTo(i, 0)
    ctx.lineTo(i, imp_vars.levelHeight)
  }
  for(var j = 0; j < imp_vars.levelHeight; j += split_size) {
    ctx.moveTo(0, j)
    ctx.lineTo(imp_vars.levelWidth, j)
  }
  ctx.lineWidth = 2
  ctx.strokeStyle = "#ccc"
  ctx.stroke()

  if(this.last_loc) {
    var visible_vertices = this.visibility_graph.visible_vertices[Math.floor(this.last_loc.x/split_size)*split_size+" "+Math.floor(this.last_loc.y/split_size)*split_size]
    ctx.beginPath()
    for(var i = 0; i < visible_vertices.length; i++) {
      ctx.moveTo(this.last_loc.x, this.last_loc.y)

      ctx.lineTo(this.visibility_graph.vertices[visible_vertices[i]].x * draw_factor, this.visibility_graph.vertices[visible_vertices[i]].y * draw_factor)
    }
    ctx.stroke()
  }

  ctx.restore()*/



  /*for(var j = 0; j < Math.min(this.level.enemies.length, 10); j++)
  {
    if(this.level.enemies[j])
    {
      var this_path = this.level.enemies[j].path
      if(this_path)
      {

        ctx.beginPath()
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3
        ctx.moveTo(this.level.enemies[j].body.GetPosition().x*imp_vars.draw_factor + imp_vars.sidebarWidth, this.level.enemies[j].body.GetPosition().y*imp_vars.draw_factor)
        for(var i = 0; i < this_path.length; i++)
        {
            ctx.lineTo(this_path[i].x*imp_vars.draw_factor + imp_vars.sidebarWidth, this_path[i].y*imp_vars.draw_factor)
        }
        ctx.stroke()
        ctx.lineWidth = 1
      }
    }
  }*/


}

ImpulseGameState.prototype.additional_draw = function(ctx, bg_ctx) {

}

ImpulseGameState.prototype.draw_score_labels = function(ctx) {
  for(var i = 0; i < this.score_labels.length; i++)
    {
      ctx.save()
      ctx.beginPath()
      ctx.font = this.score_labels[i].size+'px Muli'
      var prog = this.score_labels[i].duration / this.score_labels[i].max_duration

      ctx.globalAlpha *= prog
      ctx.fillStyle = this.score_labels[i].color
      if (this.score_labels[i].is_sparks) {
        ctx.textAlign = 'left'
        drawSprite(ctx, this.score_labels[i].x * imp_vars.draw_factor + 20,
            this.score_labels[i].y * imp_vars.draw_factor - (1 - prog) * this.score_label_rise - 7
            , 0, this.score_labels[i].size * 0.8, this.score_labels[i].size * 0.8, "spark")
        ctx.fillText(this.score_labels[i].text, this.score_labels[i].x * imp_vars.draw_factor - 25, this.score_labels[i].y * imp_vars.draw_factor - (1 - prog) * this.score_label_rise)
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(this.score_labels[i].text, this.score_labels[i].x * imp_vars.draw_factor, this.score_labels[i].y * imp_vars.draw_factor - (1 - prog) * this.score_label_rise)
      } 
      ctx.restore()
    }
}

ImpulseGameState.prototype.draw_boss_text = function(ctx) {
  var prog = (this.boss_intro_text_duration)/(this.boss_intro_text_interval)

  ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)

  ctx.beginPath()

  ctx.fillStyle = impulse_colors["boss "+this.world_num];
  ctx.textAlign = 'center'

  ctx.font = '42px Muli'
  //ctx.shadowBlur = 20;
  //ctx.shadowColor = "black"

  ctx.fillText(this.hive_numbers.boss_name, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 150)
  ctx.fill()

  //ctx.shadowBlur = 0

}

ImpulseGameState.prototype.draw_boss_hint = function(ctx) {
  ctx.save()
  var prog = 0
  if (this.first_time && this.boss_intro_text_duration > 0 && this.boss_intro_text_duration < this.boss_intro_text_interval/2) {
    prog = (this.boss_intro_text_duration)/(this.boss_intro_text_interval/2)  
  } else if (!this.first_time && this.boss_intro_text_duration > this.boss_intro_text_interval/2 && this.boss_intro_text_duration < this.boss_intro_text_interval) {
    prog = (this.boss_intro_text_duration - this.boss_intro_text_interval/2)/(this.boss_intro_text_interval/2)
  }

  ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)


  ctx.beginPath()
  ctx.moveTo(this.level.boss.body.GetPosition().x * imp_vars.draw_factor, (this.level.boss.body.GetPosition().y - this.level.boss.effective_radius)* imp_vars.draw_factor - 5)
  ctx.lineTo(this.level.boss.body.GetPosition().x * imp_vars.draw_factor, 2 * imp_vars.draw_factor + 15)
  ctx.strokeStyle = impulse_colors["impulse_blue"]//this.level.boss.color
  ctx.lineWidth = 10;
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(this.level.boss.body.GetPosition().x* imp_vars.draw_factor, this.level.boss.body.GetPosition().y* imp_vars.draw_factor,
    this.level.boss.effective_radius * imp_vars.draw_factor, 0, 2* Math.PI, false)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(this.level.boss.body.GetPosition().x * imp_vars.draw_factor + 30 * Math.cos(Math.PI*3/2), 2 * imp_vars.draw_factor + 30 * Math.sin(Math.PI*3/2))
  ctx.lineTo(this.level.boss.body.GetPosition().x * imp_vars.draw_factor + 30 * Math.cos(Math.PI*1/6), 2 * imp_vars.draw_factor + 30 * Math.sin(Math.PI*1/6))
  ctx.lineTo(this.level.boss.body.GetPosition().x * imp_vars.draw_factor + 30 * Math.cos(Math.PI*5/6), 2 * imp_vars.draw_factor + 30 * Math.sin(Math.PI*5/6))
  ctx.fillStyle = impulse_colors["impulse_blue"]//this.level.boss.color
  ctx.fill()
  ctx.restore()
}

ImpulseGameState.prototype.draw_interface = function(context) {

  context.save()
  context.globalAlpha = 1;
  context.beginPath()
  context.fillStyle = "black"
  context.clearRect(0, 0, imp_vars.sidebarWidth, imp_vars.canvasHeight);
  context.clearRect(imp_vars.canvasWidth - imp_vars.sidebarWidth, 0, imp_vars.sidebarWidth, imp_vars.canvasHeight);

  this.set_zoom_transparency(context);
  // draw the level name

  context.fillStyle = this.color;
  context.textAlign = 'center'

  if (!(this instanceof HowToPlayState) && !this.world_num == 0) {
    context.font = "14px Muli"
    context.save()
    context.globalAlpha *= 1
    context.fillText(imp_vars.player_data.difficulty_mode == "normal" ? "CHALLENGE MODE" : "STANDARD MODE", imp_vars.sidebarWidth/2, 15)
    context.restore()
  }

  // Draw the level name.
  if (this.world_num != 0) {
    context.font = '64px Muli'

    type = this.level_name.split(" ")[0]
    if(type != "HOW") {
      context.fillText(type, imp_vars.sidebarWidth/2, 70)
    } else {
      context.font = '40px Muli'
      context.fillText("HOW TO", imp_vars.sidebarWidth/2, 70)
    }

    context.font = '80px Muli'
    if(type == "BOSS") {
      context.fillText(this.world_num, imp_vars.sidebarWidth/2, 140)
    } else if(type == "HOW") {
      context.font = '60px Muli'
      context.fillText("PLAY", imp_vars.sidebarWidth/2, 130)
    } else {
      context.fillText(this.level_name.slice(5, this.level_name.length), imp_vars.sidebarWidth/2, 140)
    }
  } else if(imp_params.impulse_level_data[this.level_name].show_full_interface) {
    context.font = '40px Muli'
    context.fillText("TUTORIAL", imp_vars.sidebarWidth/2, 70)
  }



  // draw the game time
  if (this.world_num != 0) {
    context.fillStyle = this.color;
    context.font = '32px Muli'
    var a =  this.game_numbers.seconds % 60
    a = a < 10 ? "0"+a : a
    this.game_numbers.last_time = Math.floor(this.game_numbers.seconds/60)+":"+a
    context.fillText(this.game_numbers.last_time, imp_vars.sidebarWidth/2, imp_vars.canvasHeight/2 - 80)
  }

  if(!this.is_boss_level) {
    if (!this.world_num == 0 || imp_params.impulse_level_data[this.level_name].show_full_interface) {
      // draw score
      context.font = '40px Muli'
      context.fillText(this.game_numbers.score, imp_vars.canvasWidth - imp_vars.sidebarWidth/2, 46)

      if(this.stars < 3) {
        context.fillStyle = impulse_colors[this.star_colors[this.stars]]
        //context.shadowColor = context.fillStyle;
        context.font = '21px Muli'
        context.fillText("GOAL", imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 15)
        context.font = '42px Muli'
        context.fillText(this.level.cutoff_scores[this.stars], imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 40)
      }
      else {
        /*context.fillStyle = impulse_colors[this.star_colors[2]]
        context.shadowColor = context.fillStyle;
        context.font = '60px Muli'
        context.fillText("WIN", canvasWidth - imp_vars.sidebarWidth/2, canvasHeight - 40)*/
      }
    }
  } else {
    context.fillStyle = impulse_colors["boss "+this.world_num]
    //context.shadowColor = context.fillStyle;
    context.font = '36px Muli'
    context.fillText("DISTANCE",imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 55)
    context.fillText("LEFT", imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 20)
  }


  /*draw_star(context, 150, 22, 15, impulse_colors[this.star_colors[temp_stars]])*/

  /*context.beginPath()

  context.rect(350, 2, 100, topbarHeight-4)
  context.fillStyle = "white"
  context.globalAlpha = .6
  context.fill()
  context.globalAlpha = 1*/



 
  /*context.beginPath()
  context.fillStyle = "white"
  context.font = '20px Muli'
  context.fillText("FPS: "+this.fps, imp_vars.sidebarWidth/2, imp_vars.canvasHeight/2)
  context.fill()
  context.shadowBlur = 0;
  context.save()*/
  if (!this.world_num == 0 || imp_params.impulse_level_data[this.level_name].show_full_interface) {
    draw_lives_and_sparks(
      context, this.hive_numbers.lives, this.hive_numbers.sparks, this.hive_numbers.ultimates, 
      imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 60, 24, {
        labels: true, 
        ult: this.has_ult, 
        sparks: imp_vars.player_data.difficulty_mode == "normal",
        lives: imp_vars.player_data.difficulty_mode == "normal",
      })
  }
  //context.font = '12px Muli'
  //context.fillText("ESC TO PAUSE", imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 20);

  context.restore()
}

ImpulseGameState.prototype.draw_score_bar = function(ctx) {
  if (this.world_num == 0 && !imp_params.impulse_level_data[this.level_name].show_full_interface) {
    return;
  }
  ctx.save()
  this.set_zoom_transparency(ctx)

  draw_vprogress_bar(ctx, imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight/2 - 15, 40, imp_vars.canvasHeight*3/4 - 30, this.progress_bar_prop, this.color)

  if(!this.is_boss_level) {
    ctx.textAlign = 'center'
    ctx.font = '72px Muli'
    ctx.fillStyle = this.get_combo_color(this.game_numbers.combo)
    //ctx.shadowColor = this.get_combo_color(this.game_numbers.combo);
    //ctx.shadowBlur = 10;
    ctx.fillText("x"+this.game_numbers.combo, imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight/2)
  } else {
    if(this.level.boss)
      draw_vprogress_bar(ctx, imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight/2 - 15, 40, imp_vars.canvasHeight*3/4 - 30, this.level.boss.getLife(), this.level.boss.color)
    else
      draw_vprogress_bar(ctx, imp_vars.canvasWidth - imp_vars.sidebarWidth/2, imp_vars.canvasHeight/2 - 15, 40, imp_vars.canvasHeight*3/4 - 30, 1, impulse_colors["boss "+this.world_num])
  }
  ctx.restore()
}

ImpulseGameState.prototype.get_combo_color = function(combo) {
  return "white"
  /*var tcombo = 100;
  var hperiod = 400;
  if(combo < tcombo) {
    var prog = combo/tcombo;
    var red = Math.round(190*(1-prog) + 0*prog);
    var green = Math.round(190*(1-prog) + 128*prog);
    var blue= Math.round(190*(1-prog) + 255*prog);

    return "rgb("+red+","+green+","+blue+")";
  }

  return this.get_combo_color((tcombo-0.01)*(Math.abs(hperiod - this.game_numbers.game_length%(2*hperiod))/hperiod))*/
}

ImpulseGameState.prototype.transform_to_zoomed_space = function(pt) {

  var new_point = {x: (pt.x - (imp_vars.levelWidth/2 - this.camera_center.x*this.zoom))/this.zoom,
    y: (pt.y - (imp_vars.levelHeight/2 - this.camera_center.y*this.zoom))/this.zoom};
  return new_point
}

ImpulseGameState.prototype.on_mouse_move = function(x, y) {
  if(!this.ready) return
  for(var i = 0; i <this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x, y)
  }
  if(!this.pause) {
    this.player.mouseMove(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
  }
}

ImpulseGameState.prototype.on_mouse_down = function(x, y) {

  // Ignore mouse dowsn on the new enemy message box.
  /*if(this.new_enemy_type != null && Math.abs(x - imp_vars.sidebarWidth/2) < 120 && Math.abs(y - (imp_vars.canvasHeight/2 + 60)) < 160) {
    return
  }*/

  if(!this.pause) {
    this.player.mouse_down(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
    //this.last_loc = {x: x - imp_vars.sidebarWidth, y: y}
  }
}


ImpulseGameState.prototype.on_right_mouse_down = function(x, y) {

  if(!this.pause) {
    this.player.right_mouse_down(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
    //this.last_loc = {x: x - imp_vars.sidebarWidth, y: y}
  }
}

ImpulseGameState.prototype.reset_player_state = function() {
  this.player.keyDown(imp_params.keys.PAUSE)
  this.player.mouse_up(null)
}

ImpulseGameState.prototype.on_mouse_up = function(x, y) {
  if(this.pause) return

  // Process a click on the new enemy message box.
  /*if(this.new_enemy_type != null && Math.abs(x - imp_vars.sidebarWidth/2) < 120 && Math.abs(y - (imp_vars.canvasHeight/2 + 60)) < 160) {
      imp_params.impulse_enemy_stats[this.new_enemy_type].seen += 5 // do not show any more if this is clicked
      var _this = this
      setTimeout(function() {set_dialog_box(new EnemyBox(_this.new_enemy_type, new PauseMenu(_this.level, _this.world_num, _this.game_numbers, _this, _this.visibility_graph)))}, 50)
      this.pause = true
      this.reset_player_state()
      this.new_enemy_timer = 2000
  } else {*/
  this.player.mouse_up(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
  //}
}

ImpulseGameState.prototype.on_right_mouse_up = function(x, y) {
  if(!this.pause) {
    this.player.right_mouse_up(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
  }
}

ImpulseGameState.prototype.toggle_pause = function() {
  this.pause = !this.pause
  if(this.pause) {
    this.reset_player_state()
    set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
  } else {
    clear_dialog_box()
  }
}

ImpulseGameState.prototype.on_key_down = function(keyCode) {
  if(!this.ready) return

  if(keyCode == 90 && imp_vars.dev) {//Z - insta-victory if debug is on.
    this.victory = true
    if(this.is_boss_level) {
      this.level.boss_victory = true
    } else {
      this.game_numbers.score = this.level.cutoff_scores[0];
    }
  }
  if(keyCode == imp_params.keys.PAUSE || keyCode == imp_params.keys.SECONDARY_PAUSE) {
    this.toggle_pause()    
  } else if(keyCode == imp_params.keys.GATEWAY_KEY && this.gateway_unlocked && p_dist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
    //if(this.game_numbers.score >= this.level.cutoff_scores[imp_vars.player_data.difficulty_mode]["bronze"]) {
    this.victory = true
    if(this.is_boss_level)
      this.level.boss_victory = true
  } 
  // USED FOR TRAILER RECORDING
  /*else if (keyCode == 69) {
    this.zoom_to_player = !this.zoom_to_player
    if (this.zoom_to_player) {
      this.zoom = 1.7
      this.zoom_state = "player"
    } else {
      this.zoom = 1
      this.camera_center = {x: imp_vars.levelWidth/2, y: imp_vars.levelHeight/2}
      this.zoom_state = "none"
      this.fade_state = "none"
      this.zoom_bg_switch = false
    }
  } */else
    this.player.keyDown(keyCode)  //even if paused, must still process
}

ImpulseGameState.prototype.on_visibility_change = function() {


}

ImpulseGameState.prototype.on_key_up = function(keyCode) {
  if(!this.ready) return
  this.player.keyUp(keyCode)
}

ImpulseGameState.prototype.addWalls = function() {
  var wall_dim, wall_pos;

    wall_dim = [{x: imp_vars.levelWidth/imp_vars.draw_factor/2, y: 2},
      {x: imp_vars.levelWidth/imp_vars.draw_factor/2, y: 2},
      {x: 2, y: (imp_vars.levelHeight)/imp_vars.draw_factor/2},
      {x: 2, y: (imp_vars.levelHeight)/imp_vars.draw_factor/2}]

    wall_pos = [{x: imp_vars.levelWidth/imp_vars.draw_factor/2, y: -2},
      {x: imp_vars.levelWidth/imp_vars.draw_factor/2, y: (imp_vars.levelHeight)/imp_vars.draw_factor+2},
      {x: -2, y: (imp_vars.levelHeight)/imp_vars.draw_factor/2},
      {x: imp_vars.levelWidth/imp_vars.draw_factor+2, y: (imp_vars.levelHeight)/imp_vars.draw_factor/2}]


  for(var i = 0; i < 4; i++) {
    var fixDef = new b2FixtureDef;
    fixDef.filter.categoryBits = imp_params.WALL_BIT
    fixDef.filter.maskBits = imp_params.PLAYER_BIT
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(wall_dim[i].x, wall_dim[i].y)
  bodyDef.position.Set(wall_pos[i].x, wall_pos[i].y)
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
}

ImpulseGameState.prototype.handle_collisions = function(contact) {
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()

  if(!first || !second) return



  first["owner"].collide_with(second["owner"], first["body"], second["body"])
  second["owner"].collide_with(first["owner"], second["body"], first["body"])

  //contact.SetEnabled(false)

}

ImpulseGameState.prototype.handle_collisions_on_end_contact = function(contact) {
  // This method is a special case. Only run if both objects are tanks.
  // When tanks are already touching each other, we want them to explode if we impulse them.
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()

  if(!first || !second) return
  if (first["owner"].type != "tank" || second["owner"].type != "tank") {
    return;
  }

  first["owner"].collide_with(second["owner"], first["body"], second["body"])
  second["owner"].collide_with(first["owner"], second["body"], first["body"])

  //contact.SetEnabled(false)

}

ImpulseGameState.prototype.filter_collisions = function(contact) {
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()
  if(first == null || second == null) return

  var first_object = first["self"]
  var second_object = second["self"]

  if(first_object == null || second_object == null) return

  var harpoon_object = null

  var objects = [first_object, second_object]
  var other_objects =[second_object, first_object]

  for(var index in objects) {
    var first_object = objects[index]
    if(first_object.type == "harpoonhead" && first_object.harpoon.harpoon_state != "inactive") {
      var second_object = other_objects[index]

      if(second_object != first_object.harpoon && second_object.type != "harpoonhead" && !second_object.is_boss && !second["owner"].is_boss) {
        if((second_object.type == "boss four spawner" || second_object.type == "boss four attacker") && !second_object.spawned) continue
        if(p_dist(first_object.body.GetPosition(), second_object.body.GetPosition()) < first_object.effective_radius + second_object.effective_radius) {
          if(second_object.is_enemy)
          {
            second_object.open(3000)
          }
          first_object.harpoon.engage_harpoon(second_object)
        }
      }

      contact.SetEnabled(false)
    }
  }
}

ImpulseGameState.prototype.addScoreLabel = function(str, color, x, y, font_size, duration, is_sparks) {
  var this_duration = duration ? duration : this.score_label_duration
  var max_duration = duration ? duration : this.score_label_duration
  var temp_score_label = {text: str, color: color, x: x, y: y, duration: this_duration, max_duration: max_duration, size: font_size, is_sparks: is_sparks}
  this.score_labels.push(temp_score_label)
}

ImpulseGameState.prototype.set_score_achieve_text = function(text, color, size) {
  this.clear_message()
  this.score_achieve_text = text
  this.score_achieve_timer = this.score_achieve_duration
  this.score_achieve_color = color
  this.score_achieve_size = size
  draw_score_achieved_box(this.message_ctx, 60, 80, 120, 160, this.bright_color, this.score_achieve_text, this.score_achieve_color, this.score_achieve_size, this.world_num)
}

ImpulseGameState.prototype.check_cutoffs = function() {

  if(this.game_numbers.score >= this.level.cutoff_scores[this.stars])
  {

    while(this.game_numbers.score >= this.level.cutoff_scores[this.stars]) {
      this.stars+=1
      if(this.stars == 1) {
        this.gateway_unlocked = true
        this.level_redraw_bg = true
        //this.addScoreLabel("GATEWAY UNLOCKED", impulse_colors["world "+this.world_num+" bright"], imp_vars.levelWidth/2/draw_factor, imp_vars.levelHeight/2/draw_factor, 24, 3000)
        if (this.level.cutoff_scores[0] != 0) { // if this is a tutorial where the gateway is immediately unlocked, do not show.
          this.set_score_achieve_text("GATEWAY UNLOCKED", impulse_colors["world "+this.world_num+" bright"], 18)
        }
      } else if(this.stars == 2) {
        if(this.main_game) {
          this.hive_numbers.lives +=1
          this.addScoreLabel("1UP", impulse_colors["silver"], this.player.body.GetPosition().x, this.player.body.GetPosition().y - 1, 24, 3000)
        }
        this.set_score_achieve_text("SILVER SCORE", impulse_colors["silver"], 24)
      } else if(this.stars == 3 ) {
        if(this.main_game) {
          if(this.hive_numbers.lives < 5) {
            this.addScoreLabel((5 - this.hive_numbers.lives)+"UP", impulse_colors["gold"], this.player.body.GetPosition().x, this.player.body.GetPosition().y - 1, 24, 3000)
            this.hive_numbers.lives = 5
          } else {
            this.hive_numbers.lives += 1
            this.addScoreLabel("1UP", impulse_colors["gold"], this.player.body.GetPosition().x, this.player.body.GetPosition().y - 1, 24, 3000)
          }
        }

        this.set_score_achieve_text("GOLD SCORE", impulse_colors["gold"], 24)
      }

      if (this.stars > 0) {
        if (this instanceof HowToPlayState) {
          this.gateway_opened()
        }
        if (this.show_tutorial) {
          this.add_tutorial_signal("gateway_opened")
        }
      }
  }

    //this.addScoreLabel(this.cutoff_messages[this.stars-1], impulse_colors[this.star_colors[this.stars-1]], imp_vars.levelWidth/imp_vars.draw_factor/2, (imp_vars.levelHeight)/imp_vars.draw_factor/2, 40, 3000)
  }
}

ImpulseGameState.prototype.increment_combo = function() {
  this.game_numbers.base_combo += 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

ImpulseGameState.prototype.reset_combo = function() {
  if (this.player.ultimate) return
  if (this.show_tutorial) {
    this.add_tutorial_signal("multiplier_reset")
  }
  this.game_numbers.base_combo = 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

ImpulseGameState.prototype.game_over = function() {

  if (this.main_game) {
    switch_game_state(new MainGameTransitionState(this.world_num, this.level, this.victory || this.level.boss_victory, this.game_numbers, this.visibility_graph, this.hive_numbers))
  } else {
    switch_game_state(new RewardGameState(this.hive_numbers, this.main_game, {
      game_numbers: this.game_numbers,
      level: this.level,
      world_num: this.world_num,
      visibility_graph: this.visibility_graph,
      victory: this.victory
    }))
  }
}

ImpulseGameState.prototype.add_tutorial_signal = function(signal) {
  if (this.show_tutorial) {
    this.tutorial_signals[signal] = true;
  }
}