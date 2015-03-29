var audioData = require('../data/audio_data.js');
var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var controls = require('../core/controls.js');
var debugVars = require('../data/debug.js');
var enemyData = require('../data/enemy_data.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var GameState = require('../game_states/game_state.js');
var Player = require('../player/player.js');
var PauseMenu = require('../ui/dialog_boxes.js').PauseMenu;
var TutorialOverlayManager = require('../ui/tutorial_overlay.js').Manager;

ImpulseGameState.prototype = new GameState

ImpulseGameState.prototype.constructor = ImpulseGameState

ImpulseGameState.prototype.isImpulseGameState = true;

function ImpulseGameState(opts) {
  // world
  // level
  // visibility_graph
  // hive_numbers
  // main_game
  if(opts.world == null || opts.world == undefined) return

  this.init(opts.world, opts.level, opts.visibility_graph, opts.hive_numbers, opts.main_game);
}

ImpulseGameState.prototype.init = function(world, level, visibility_graph, hive_numbers, main_game) {
  this.hive_numbers = hive_numbers
  this.main_game = main_game

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
  this.boss_intro_text_activated = false
  this.boss_after_death_actions = false;

  // Is the multiplier mechanic enabled in this game?
  this.combo_enabled = saveData.difficultyMode == "normal";

  this.world_num = world

  this.progress_bar_prop = 0
  this.progress_bar_adjust = 3000
  var gravity = new box_2d.b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new box_2d.b2World(gravity, doSleep);
  this.hive0bg_transition = false;

  if(level) {
    this.level = level
    this.level.impulse_game_state = this
    this.level.reset() //we re-use the level
    this.level_name = this.level.level_name
    this.is_level_zero = (parseInt(this.level_name.substring(7, 8)) === 0);
    this.is_boss_level = this.level_name.slice(0,4) == "BOSS"
    this.is_tutorial_level = this.world_num == 0;
    this.make_player()
    if(this.level_name == "BOSS 4") {
      music_player.play_bg(audioData.songs["Final Tessellation"])
    }
    else if(this.level_name.slice(0, 4) == "BOSS")
      music_player.play_bg(audioData.songs["Tessellation"])
    else if (!this.is_tutorial_level&& !this.is_level_zero) {
      music_player.play_bg(audioData.songs["Hive "+this.world_num])
    } else {
      music_player.play_bg(audioData.songs["Menu"]);
    }
    // Set up game numbers for level.
    if(!this.hive_numbers.game_numbers.hasOwnProperty(this.level.level_name)) {
      this.hive_numbers.game_numbers[this.level.level_name] = {}
      this.hive_numbers.game_numbers[this.level.level_name].visited = true
      this.hive_numbers.game_numbers[this.level.level_name].deaths = 0
    }
    this.game_numbers = this.hive_numbers.game_numbers[this.level.level_name];
    this.reset_game_numbers();
  }

  if (this.hive_numbers.total_time[this.level_name] === undefined) {
    this.hive_numbers.total_time[this.level_name] = 0;
  }

  this.visibility_graph = visibility_graph
  this.color = this.is_boss_level ? constants.colors["boss "+this.world_num] : constants.colors["world "+this.world_num+" lite"]
  this.dark_color = constants.colors["world "+this.world_num +" dark"];
  this.lite_color = constants.colors["world "+this.world_num +" lite"];
  this.bright_color = constants.colors["world "+this.world_num +" bright"];

  this.boss_intro_text_interval = 6000
  this.boss_intro_text_duration = 0

  this.processed_death = false
  //add walls

  this.addWalls()

  var contactListener = new box_2d.b2ContactListener;
  contactListener.BeginContact = this.handle_collisions
  contactListener.PreSolve = this.filter_collisions
  contactListener.EndContact = this.handle_collisions_on_end_contact
  this.world.SetContactListener(contactListener);
  this.pause = false
  if (this.level)
    this.ready = true

  this.bg_visible = false

  this.world_visible = true

  this.world_visibility = 1

  this.shaking = false;
  this.shaking_timer = 0;
  this.shaking_interval = 0;
  this.shaking_intensity_max = 2;

  this.camera_center = {x: constants.levelWidth/2, y: constants.levelHeight/2}
  //this.zoom = 0.1

  this.slow_zoom_transition_period = 1500;
  this.fast_zoom_transition_period = 750
  this.zoom_transition_timer = 0;
  this.zoom_state = "none";
  this.zoom_start_pt = {x:constants.levelWidth, y:constants.levelHeight}
  this.zoom_target_pt = {x:constants.levelWidth, y:constants.levelHeight}
  this.zoom_start_scale = 0.1
  this.zoom_target_scale = 1
  this.zoom = 0.1
  this.zoom_bg_switch = true;
  this.first_time = true;
  this.zoom_in({x:constants.levelWidth/2, y:constants.levelHeight/2}, 1, this.slow_zoom_transition_period)

  this.fade_state = "in"
  this.victory = false
  this.gateway_unlocked = false

  this.draw_interface_interval = 100
  this.draw_interface_timer = this.draw_interface_interval

  this.level_redraw_bg = false

  this.message_canvas = document.createElement('canvas');
  this.message_canvas.width = 120
  this.message_canvas.height = 160
  this.message_ctx = this.message_canvas.getContext('2d');

  this.hive0bg_canvas = document.createElement('canvas');

  if(level) {
    this.check_new_enemies()
  }

  // if this is world zero. show the tutorial.
  this.show_tutorial = (this.is_tutorial_level ||
    saveData.tutorialsShown.length < TutorialOverlayManager.prototype.on_demand_overlays.length)

  // if we've never beaten the first boss, show the tutorial
  if (this.is_boss_level && this.world_num == 1 && saveData.difficultyMode == "easy" &&
    !saveData.hasBeatenLevel(this.level_name)) {
    this.show_tutorial = true
  }


  if (this.show_tutorial) {
    this.tutorial_overlay_manager = new TutorialOverlayManager(this);
    this.tutorial_signals = {};
    this.tutorial_signal_timeouts = {};
    this.tutorial_signal_timeout = 500
  }

  if (!this.is_boss_level && this.level) {
    this.check_cutoffs();
  }
}

ImpulseGameState.prototype.reset = function() {
  this.reset_game_numbers();
  this.processed_death = false;
  this.first_time = false;
  var gravity = new box_2d.b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new box_2d.b2World(gravity, doSleep);
  this.addWalls()

  var contactListener = new box_2d.b2ContactListener;
  contactListener.BeginContact = this.handle_collisions
  contactListener.PreSolve = this.filter_collisions
  this.world.SetContactListener(contactListener);

  this.gateway_unlocked = false
  this.victory = false
  this.level.reset()
  if(this.level) {
    this.check_new_enemies()
  }
  layers.bgCtx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
  this.level.draw_bg(layers.bgCtx)
  layers.bgCtx.translate(-constants.sideBarWidth, 0)
  this.progress_bar_prop = 0
  this.boss_intro_text_activated = false

  if (this.is_boss_level && this.show_tutorial) {
    this.tutorial_overlay_manager = new TutorialOverlayManager(this);
    this.tutorial_signals = {};
    this.tutorial_signal_timeouts = {};
    this.tutorial_signal_timeout = 500
  }

  if (!this.is_boss_level && this.level) {
    this.check_cutoffs();
  }

  this.boss_after_death_actions = false;
}

ImpulseGameState.prototype.reset_game_numbers = function () {
  this.game_numbers.score = 0;
  this.game_numbers.combo = 1;
  this.game_numbers.base_combo = 1;
  this.game_numbers.seconds = 0;
  this.game_numbers.kills = 0;
  this.game_numbers.game_length = 0;
  this.game_numbers.last_time = null;
  this.game_numbers.impulsed = false;
}

ImpulseGameState.prototype.check_new_enemies = function() {
  if (this.is_tutorial_level) return;
  for(var enemy in levelData.levels[this.level_name].enemies) {
    if(!enemyData[enemy].is_boss && saveData.enemiesSeen.indexOf(enemy) === -1) {
      game_engine.set_popup_message("enemy_" + enemy, 5000, this.bright_color, this.world_num)
      saveData.enemiesSeen.push(enemy);
      saveData.saveGame()
    }
  }
}

ImpulseGameState.prototype.make_player = function() {
  this.player = new Player(this.world, this.level.get_starting_loc().x/constants.drawFactor, this.level.get_starting_loc().y/constants.drawFactor, this)
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
  ctx.font = '30px Open Sans'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("LOADING", constants.levelWidth/2, (constants.levelHeight)/2)
  ctx.fill()
}

ImpulseGameState.prototype.transition_to_hive0bg = function (dur) {
  this.hive0bg_transition = true;
  this.hive0bg_transition_interval = dur;
  this.hive0bg_transition_timer = dur;
  this.hive0bg_canvas.width = constants.levelWidth;
  this.hive0bg_canvas.height = constants.levelHeight;
  var hive0bg_ctx = this.hive0bg_canvas.getContext('2d');
  uiRenderUtils.tessellateBg(hive0bg_ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive 0")
}

ImpulseGameState.prototype.check_pause = function() {
  if(document.webkitHidden) {
    this.pause = true
    game_engine.set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
  }
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

  // We don't want any tutorial overlay to trigger way after the event has happened. So we timeout the tutorial signals after a short period.
  for (var signal in this.tutorial_signal_timeouts) {
    this.tutorial_signal_timeouts[signal] -= dt;
    if (this.tutorial_signal_timeouts[signal] < 0) {
      this.tutorial_signals[signal] = "timeout"
    }
  }
  if(!this.pause)
  {
    if (this.shaking_timer > 0) {
      this.shaking = true;
      this.shaking_timer -= dt;
    }
    if (this.hive0bg_transition_timer > 0) {
      this.hive0bg_transition_timer -= dt;
    } else if (this.hive0bg_transition) {
      this.hive0bg_transition = false;
      uiRenderUtils.tessellateBg(layers.bgCtx,
        constants.sideBarWidth, 0, constants.levelWidth + constants.sideBarWidth, constants.levelHeight, "Hive 0")
    }
    if (this.show_tutorial) {
      this.tutorial_overlay_manager.process(dt);
      if(this.gateway_unlocked && utils.pDist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
        this.add_tutorial_signal("moved_to_gateway")
      }
    }
    this.check_pause()
    this.draw_interface_timer -= dt

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
          //utils.bezierInterpolate(0.9, 0.9, (this.zoom_transition_timer) / (this.zoom_transition_period))
          this.zoom = 1/(1/(this.zoom_start_scale) * prop + 1/(this.zoom_target_scale) * (1-prop))
          this.camera_center.x = this.zoom_start_pt.x * prop + this.zoom_target_pt.x * (1-prop)
          this.camera_center.y = this.zoom_start_pt.y * prop + this.zoom_target_pt.y * (1-prop)
          this.zoom_transition_timer -= dt;
        }
      }
    } else {
      this.camera_center = {x: this.player.body.GetPosition().x * constants.drawFactor,
                            y: this.player.body.GetPosition().y * constants.drawFactor}
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

    if (this.player.dying && this.player.dying_duration > 0 && !this.processed_death) {
      this.processed_death = true
      this.level.prepare_level_for_reset();
      this.game_numbers.score = 0;
      this.game_numbers.combo = 1;

      // Save the game when the player dies.
      if (this.main_game && this.world_num > 0) {
        this.hive_numbers.game_numbers[this.level.level_name].deaths += 1
        saveData.savePlayerGame(this.hive_numbers);
      }
    }

    if((this.player.dying && this.player.dying_duration < 0))
    {
      this.reset();
      this.make_player();
      return;
    }

    if(this.level.boss && this.level.boss.dying && this.level.boss.dying_duration < 0 &&
        this.level.boss.dying != "fade" && !this.player.dying && !this.boss_after_death_actions) {
      this.boss_after_death_actions = true;
      this.level.open_gateway()
      this.gateway_unlocked = true;
    }

    if(this.victory)
    {
      if(this.zoom_state == "none" && this.zoom == 1) {
        this.zoom_out({x: this.player.body.GetPosition().x * constants.drawFactor, y: this.player.body.GetPosition().y * constants.drawFactor}, 10, this.slow_zoom_transition_period)
        this.fade_state = "out"
      } else if(this.zoom_state == "none"){
        this.ready = false
        this.level_defeated();
      }
      return;
    }

    if(!this.is_boss_level) {

      var prop = Math.min(this.game_numbers.score/this.level.cutoff_scores[0], 1)
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
    if (this.combo_enabled) {
      this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
    }
    this.game_numbers.last_time = utils.convertSecondsToTimeString(this.game_numbers.seconds);

    this.game_numbers.game_length += dt;
    if (this.world_num > 0 && !this.is_level_zero)
      this.hive_numbers.speed_run_countdown -= dt
    this.hive_numbers.total_time[this.level.level_name] += dt;

    this.game_numbers.seconds = Math.floor(this.game_numbers.game_length/1000)
    this.game_numbers.total_time += dt;
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
      var prop = utils.bezierInterpolate(0.1, 0.5, (this.zoom_transition_timer) / (this.zoom_transition_period))
      ctx.globalAlpha = Math.min(1-prop,1)
  } else if(this.fade_state == "out"){
    var prop = utils.bezierInterpolate(0.1, 0.5, (this.zoom_transition_timer) / (this.zoom_transition_period))
    ctx.globalAlpha = Math.max(prop,0)
  }
}

ImpulseGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.ready) return

  this.additional_draw(ctx, bg_ctx)
  ctx.save();
  ctx.translate(constants.sideBarWidth, 0)//allows us to have a topbar

  if(this.zoom_state != "none" ) {
    ctx.rect(0, 0, constants.levelWidth, constants.levelHeight);
    ctx.clip()
  }

  ctx.fillStyle = this.dark_color

  ctx.scale(this.zoom, this.zoom)
  ctx.translate((constants.levelWidth/2 - this.camera_center.x*this.zoom)/this.zoom, (constants.levelHeight/2 - this.camera_center.y*this.zoom)/this.zoom);

  if (this.shaking_timer > 0) {
    var prog = Math.max(0, this.shaking_timer / this.shaking_interval);
    var s = this.shaking_intensity_max * prog;
    var x = Math.ceil(2 * s * Math.random() - s);
    var y = Math.ceil(2 * s * Math.random() - s);
    ctx.translate(x, y);
    bg_canvas.style.left = x + 'px';
    bg_canvas.style.top = y + 'px';
  } else if (this.shaking) {
    this.shaking = false;
    bg_canvas.style.left = '0px';
    bg_canvas.style.top = '0px';
  }

  ctx.beginPath();
  if(this.zoom_state != "none" ) {
    ctx.rect(2, 2, constants.levelWidth-4, constants.levelHeight-4);
    ctx.clip();
  }

  this.set_zoom_transparency(ctx);
  if(this.zoom_state != "none") {
    ctx.drawImage(bg_canvas, constants.sideBarWidth, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)
  }

  if (this.hive0bg_transition) {
    ctx.save();
    ctx.globalAlpha *= 1 - this.hive0bg_transition_timer / this.hive0bg_transition_interval;
    ctx.drawImage(this.hive0bg_canvas, 0, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)
    ctx.restore();
  }

  this.level.pre_draw(ctx, constants.drawFactor )
  this.player.pre_draw(ctx)

  if(this.boss_intro_text_duration > 0 && this.boss_intro_text_duration < this.boss_intro_text_interval &&
      this.main_game && this.zoom == 1 && this.world_num <= 4 && this.first_time) {
    this.draw_boss_text(ctx)
  }

  this.level.draw(ctx, constants.drawFactor)

  if(this.zoom != 1 && this.victory) {
    ctx.save()

    ctx.translate(this.player.body.GetPosition().x * constants.drawFactor, this.player.body.GetPosition().y * constants.drawFactor)
    ctx.scale(1/this.zoom, 1/this.zoom)
    ctx.translate(-this.player.body.GetPosition().x * constants.drawFactor, -this.player.body.GetPosition().y * constants.drawFactor)
    this.player.draw(ctx)
    ctx.restore();
  } else {
    this.player.draw(ctx)
  }

  this.level.final_draw(ctx, constants.drawFactor)

  if(this.level_redraw_bg) {
    this.level.open_gateway()
    this.level_redraw_bg = false
  }

  ctx.beginPath()

  if(this.zoom_state == "none") {
    ctx.rect(2, 2, constants.levelWidth-4, constants.levelHeight-4);
    ctx.clip();
  }



  if(!this.is_boss_level) {
    this.draw_score_labels(ctx)
  }

  ctx.restore()


  ctx.clearRect(0, 0, constants.sideBarWidth, constants.canvasHeight);
  ctx.clearRect(constants.canvasWidth - constants.sideBarWidth, 0, constants.sideBarWidth, constants.canvasHeight);


  if(this.zoom == 1 && this.zoom_state == "none") {
    if(this.draw_interface_timer < 0) {
      this.draw_interface(bg_ctx)
      this.draw_interface_timer = this.draw_interface_interval
    }
  } else {
    this.draw_interface(ctx)
  }

  this.draw_score_bar(ctx)

  ctx.save();
  this.set_zoom_transparency(ctx);
  for(var i=0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  ctx.restore();

  ctx.save();
  ctx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
  this.set_zoom_transparency(ctx);
  // Draw the tutorial if applicable.
  if (this.show_tutorial) {
    this.tutorial_overlay_manager.draw(ctx);
  }
  ctx.restore();

  this.bg_transition()

  /*for(var i = 0; i < this.visibility_graph.vertices.length; i++)
  {
      ctx.beginPath()
    	ctx.fillStyle = 'green';
    	ctx.arc(this.visibility_graph.vertices[i].x*constants.drawFactor, this.visibility_graph.vertices[i].y*constants.drawFactor, 2, 0, 2*Math.PI, true)
      ctx.font = 'italic 10px sans-serif'
      ctx.fillText(i, this.visibility_graph.vertices[i].x*constants.drawFactor, this.visibility_graph.vertices[i].y*constants.drawFactor)
    	ctx.fill()
  }*/

  /*for(var i = 0; i < this.visibility_graph.poly_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 1
    	ctx.strokeStyle = '#ccc';
      ctx.moveTo(this.visibility_graph.poly_edges[i].p1.x*constants.drawFactor +constants.sideBarWidth, this.visibility_graph.poly_edges[i].p1.y*constants.drawFactor)
      ctx.lineTo(this.visibility_graph.poly_edges[i].p2.x*constants.drawFactor + constants.sideBarWidth, this.visibility_graph.poly_edges[i].p2.y*constants.drawFactor)
    	ctx.stroke()
  }

  /*for(var i = 0; i < this.level.obstacle_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 3
    	ctx.strokeStyle = 'brown';
      ctx.moveTo(this.level.obstacle_edges[i].p1.x*constants.drawFactor + constants.sideBarWidth, this.level.obstacle_edges[i].p1.y*constants.drawFactor)
      ctx.lineTo(this.level.obstacle_edges[i].p2.x*constants.drawFactor + constants.sideBarWidth, this.level.obstacle_edges[i].p2.y*constants.drawFactor)
    	ctx.stroke()
  }

  ctx.save()
  ctx.translate(constants.sideBarWidth, 0)
  for(var i = 0; i < this.visibility_graph.edges.length; i++)
  {
      ctx.beginPath()
    	ctx.strokeStyle = 'red';
      ctx.moveTo(this.visibility_graph.edges[i].p1.x*draw_factor, this.visibility_graph.edges[i].p1.y*draw_factor)
      ctx.lineTo(this.visibility_graph.edges[i].p2.x*draw_factor, this.visibility_graph.edges[i].p2.y*draw_factor)
    	ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = 'red'
      ctx.fillText(Math.round(utils.pDist(this.visibility_graph.edges[i].p1, this.visibility_graph.edges[i].p2)), (this.visibility_graph.edges[i].p1.x*constants.drawFactor+this.visibility_graph.edges[i].p2.x*constants.drawFactor)/2, (this.visibility_graph.edges[i].p1.y*constants.drawFactor+this.visibility_graph.edges[i].p2.y*constants.drawFactor)/2)
      ctx.fill()
  }
  ctx.restore()*/
  /*ctx.globalAlpha = 0.5*/


  /*ctx.save();

  var split_size = 50
  ctx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
  ctx.beginPath()
  for(var i = 0; i < constants.levelWidth; i += split_size) {
    ctx.moveTo(i, 0)
    ctx.lineTo(i, constants.levelHeight)
  }
  for(var j = 0; j < constants.levelHeight; j += split_size) {
    ctx.moveTo(0, j)
    ctx.lineTo(constants.levelWidth, j)
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
        ctx.moveTo(this.level.enemies[j].body.GetPosition().x*constants.drawFactor + constants.sideBarWidth, this.level.enemies[j].body.GetPosition().y*constants.drawFactor)
        for(var i = 0; i < this_path.length; i++)
        {
            ctx.lineTo(this_path[i].x*constants.drawFactor + constants.sideBarWidth, this_path[i].y*constants.drawFactor)
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
      ctx.font = this.score_labels[i].size+'px Open Sans'
      var prog = this.score_labels[i].duration / this.score_labels[i].max_duration

      ctx.globalAlpha *= prog
      ctx.fillStyle = this.score_labels[i].color
      ctx.textAlign = 'center'
      ctx.fillText(this.score_labels[i].text, this.score_labels[i].x * constants.drawFactor, this.score_labels[i].y * constants.drawFactor - (1 - prog) * this.score_label_rise)
      ctx.restore()
    }
}

ImpulseGameState.prototype.draw_boss_text = function(ctx) {
  ctx.save();
  var prog = (this.boss_intro_text_duration)/(this.boss_intro_text_interval)

  ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)

  ctx.beginPath()

  ctx.fillStyle = constants.colors["boss "+this.world_num];
  ctx.textAlign = 'right'

  ctx.font = '24px Open Sans'
  ctx.fillText(this.hive_numbers.boss_name, constants.levelWidth - 50, constants.levelHeight - 50)
  ctx.fill()
  ctx.restore();
}

ImpulseGameState.prototype.draw_interface = function(context) {
  if (this.is_level_zero) {
    return;
  }

  context.save()
  context.globalAlpha = 1;
  context.beginPath()
  context.fillStyle = "black"
  context.clearRect(0, 0, constants.sideBarWidth, constants.canvasHeight);
  context.clearRect(constants.canvasWidth - constants.sideBarWidth, 0, constants.sideBarWidth, constants.canvasHeight);

  this.set_zoom_transparency(context);
  // draw the level name

  context.fillStyle = this.color;
  context.textAlign = 'center'

  var titleTextY = 0;

  var showHardMode = this.world_num != 0 && saveData.difficultyMode == "normal" &&
    !this.is_boss_level;

  var showLevelName = !this.is_boss_level && (
    this.world_num != 0 || levelData.levels[this.level_name].show_full_interface);

  var showMenuHint = !this.is_boss_level && (
    this.world_num != 0 || levelData.levels[this.level_name].show_full_interface);

  var showGameTime = this.world_num != 0 ||
    levelData.levels[this.level_name].show_full_interface;

  var showScoreLabels = !this.is_boss_level && (!this.is_tutorial_level ||
    levelData.levels[this.level_name].show_full_interface ||
    levelData.levels[this.level_name].show_score_interface);

  if (showHardMode) {
    context.font = "20px Open Sans"
    context.save()
    context.globalAlpha *= 1
    context.fillText("HARD MODE", constants.sideBarWidth/2, titleTextY + 170)
    context.restore()
  }

  // Draw the level name.
  if (showLevelName) {
    if (this.is_tutorial_level) {
      context.font = '40px Open Sans'
      context.fillText("TUTORIAL", constants.sideBarWidth/2, titleTextY + 70)
    } else {
      context.font = '64px Open Sans'
      type = this.level_name.split(" ")[0]
      context.fillText(type, constants.sideBarWidth/2, titleTextY + 70)

      context.font = '80px Open Sans'
      if(type == "BOSS") {
        context.fillText(this.world_num, constants.sideBarWidth/2, titleTextY + 140)
      } else if(type == "HOW") {
        context.font = '60px Open Sans'
        context.fillText("PLAY", constants.sideBarWidth/2, titleTextY + 130)
      } else {
        context.fillText(this.level_name.slice(5, this.level_name.length), constants.sideBarWidth/2, titleTextY + 140)
      }
    }
  }

  var menuY = constants.canvasHeight - 15;//constants.canvasHeight / 2 - 70;

  if (showMenuHint) {
    var w = 190;
    var h = 30;
    context.fillStyle = this.bright_color;
    context.font = '18px Open Sans';
    context.save();
    context.globalAlpha *= 0.4;
    if(saveData.optionsData.control_hand == "right") {
      context.fillText("Q FOR MENU", constants.sideBarWidth/2, menuY);
    } else {
      context.fillText("ENTER FOR MENU", constants.sideBarWidth/2, menuY);
    }
    context.restore();
  }

  var timeY = constants.canvasHeight/2 - 20;
  // draw the game time
  if (showGameTime) {
    // Show speed run countdown, even if in boss.
    if (saveData.difficultyMode == "normal" && this.world_num > 0 &&
      this.main_game && saveData.optionsData.speed_run_countdown) {
      context.fillStyle = "white"
      context.font = '16px Open Sans';
      context.fillText("SPEED RUN", constants.sideBarWidth/2, timeY - 30);
      context.fillText("TIME LEFT", constants.sideBarWidth/2, timeY - 10);
      context.font = '32px Open Sans';
      var total_time = utils.convertSecondsToTimeString(Math.max(0, Math.ceil(this.hive_numbers.speed_run_countdown / 1000)));
      context.fillText(total_time, constants.sideBarWidth/2, timeY + 22);
    } else if (!this.is_boss_level) {
      context.fillStyle = this.color;
      context.font = '16px Open Sans';
      context.fillText("LEVEL TIME", constants.sideBarWidth/2, timeY - 10);
      context.font = '32px Open Sans';
      context.fillText(this.game_numbers.last_time, constants.sideBarWidth/2, timeY + 22);
    }
  }

  if(showScoreLabels) {
    // draw score
    context.font = '21px Open Sans'
    context.fillText("SCORE", constants.canvasWidth - constants.sideBarWidth/2, constants.canvasHeight - 10)
    context.font = '40px Open Sans'
    context.fillText(this.game_numbers.score, constants.canvasWidth - constants.sideBarWidth/2, constants.canvasHeight - 35)

    if (this.gateway_unlocked)  {
      context.fillStyle = this.bright_color
      context.font = '21px Open Sans'
      context.fillText("GATEWAY", constants.canvasWidth - constants.sideBarWidth/2, 45)
      context.font = '42px Open Sans'
      context.fillText("OPEN", constants.canvasWidth - constants.sideBarWidth/2, 85)
    } else {
      context.fillStyle = this.lite_color
      context.font = '21px Open Sans'
      context.fillText("GOAL", constants.canvasWidth - constants.sideBarWidth/2, 45)
      context.font = '42px Open Sans'
      context.fillText(this.level.cutoff_scores[0], constants.canvasWidth - constants.sideBarWidth/2, 85)
    }
  }
  context.restore()
}

ImpulseGameState.prototype.draw_score_bar = function(ctx) {
  if (this.is_tutorial_level && !levelData.levels[this.level_name].show_full_interface &&
    !levelData.levels[this.level_name].show_score_interface) {
    return;
  }

  if (this.is_level_zero) {
    return;
  }

  ctx.save()
  this.set_zoom_transparency(ctx)

  if(!this.is_boss_level) {
    uiRenderUtils.drawVProgressBar(ctx, constants.canvasWidth - constants.sideBarWidth/2, constants.canvasHeight/2,
      40, constants.canvasHeight * 3/4 - 50, this.progress_bar_prop, this.color, true)
    ctx.textAlign = 'center'
    ctx.font = '72px Open Sans'
    ctx.fillStyle = "white"
    if (this.combo_enabled) {
      if (this.world_num != 0 || levelData.levels[this.level_name].show_full_interface) {
        ctx.fillText("x"+this.game_numbers.combo, constants.canvasWidth - constants.sideBarWidth/2, constants.canvasHeight/2)
      }
    }
  }
  ctx.restore()
}

ImpulseGameState.prototype.transform_to_zoomed_space = function(pt) {

  var new_point = {x: (pt.x - (constants.levelWidth/2 - this.camera_center.x*this.zoom))/this.zoom,
    y: (pt.y - (constants.levelHeight/2 - this.camera_center.y*this.zoom))/this.zoom};
  return new_point
}

ImpulseGameState.prototype.on_mouse_move = function(x, y) {
  if(!this.ready) return
  for(var i = 0; i <this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x, y)
  }
  if(!this.pause) {
    this.player.mouseMove(this.transform_to_zoomed_space({x: x - constants.sideBarWidth, y: y}))
  }
}

ImpulseGameState.prototype.on_mouse_down = function(x, y) {

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  if(!this.pause) {
    this.player.mouse_down(this.transform_to_zoomed_space({x: x - constants.sideBarWidth, y: y}))
    //this.last_loc = {x: x - constants.sideBarWidth, y: y}
  }
}


ImpulseGameState.prototype.on_right_mouse_down = function(x, y) {

  if(!this.pause) {
    this.player.right_mouse_down(this.transform_to_zoomed_space({x: x - constants.sideBarWidth, y: y}))
    //this.last_loc = {x: x - constants.sideBarWidth, y: y}
  }
}

ImpulseGameState.prototype.reset_player_state = function() {
  this.player.keyDown(controls.keys.PAUSE)
  this.player.mouse_up(null)
}

ImpulseGameState.prototype.on_mouse_up = function(x, y) {
  if(this.pause) return

  this.player.mouse_up(this.transform_to_zoomed_space({x: x - constants.sideBarWidth, y: y}))
}

ImpulseGameState.prototype.on_right_mouse_up = function(x, y) {
  if(!this.pause) {
    this.player.right_mouse_up(this.transform_to_zoomed_space({x: x - constants.sideBarWidth, y: y}))
  }
}

ImpulseGameState.prototype.toggle_pause = function() {
  this.pause = !this.pause
  if(this.pause) {
    this.reset_player_state()
    game_engine.set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
  } else {
    game_engine.clear_dialog_box()
  }
}

ImpulseGameState.prototype.on_key_down = function(keyCode) {
  if(!this.ready) return

  if(keyCode == 90 && (debugVars.dev || debugVars.instant_victory_enabled)) {//Z - insta-victory if debug is on.
    this.victory = true
    if (!this.is_boss_level) {
      this.game_numbers.score = this.level.cutoff_scores[2];
    }
    this.on_victory();
  }
  if(keyCode == controls.keys.PAUSE || keyCode == controls.keys.SECONDARY_PAUSE) {
    if ((this.is_boss_level && this.victory)) {
      // Do not allow player to pause if they've beaten the boss.
    } else {
      this.toggle_pause()
    }
  } else if(keyCode == controls.keys.GATEWAY_KEY && this.gateway_unlocked && utils.pDist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
    //if(this.game_numbers.score >= this.level.cutoff_scores[saveData.difficultyMode]["bronze"]) {
    this.on_victory();
  }
  // USED FOR TRAILER RECORDING
  else if (keyCode == 69 && debugVars.dev) { // E KEY
    this.zoom_to_player = !this.zoom_to_player
    if (this.zoom_to_player) {
      this.zoom = 1.7
      this.zoom_state = "player"
    } else {
      this.zoom = 1
      this.camera_center = {x: constants.levelWidth/2, y: constants.levelHeight/2}
      this.zoom_state = "none"
      this.fade_state = "none"
      this.zoom_bg_switch = false
    }
  } else
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

    wall_dim = [{x: constants.levelWidth/constants.drawFactor/2, y: 2},
      {x: constants.levelWidth/constants.drawFactor/2, y: 2},
      {x: 2, y: (constants.levelHeight)/constants.drawFactor/2},
      {x: 2, y: (constants.levelHeight)/constants.drawFactor/2}]

    wall_pos = [{x: constants.levelWidth/constants.drawFactor/2, y: -2},
      {x: constants.levelWidth/constants.drawFactor/2, y: (constants.levelHeight)/constants.drawFactor+2},
      {x: -2, y: (constants.levelHeight)/constants.drawFactor/2},
      {x: constants.levelWidth/constants.drawFactor+2, y: (constants.levelHeight)/constants.drawFactor/2}]


  for(var i = 0; i < 4; i++) {
    var fixDef = new box_2d.b2FixtureDef;
    fixDef.filter.categoryBits = box_2d.WALL_BIT
    fixDef.filter.maskBits = box_2d.PLAYER_BIT
    var bodyDef = new box_2d.b2BodyDef;
    bodyDef.type = box_2d.b2Body.b2_staticBody;
    fixDef.shape = new box_2d.b2PolygonShape;
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
        if((second_object.type == "boss_four_spawner" || second_object.type == "boss_four_attacker") && !second_object.spawned) continue
        if(utils.pDist(first_object.body.GetPosition(), second_object.body.GetPosition()) < first_object.effective_radius + second_object.effective_radius) {
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

ImpulseGameState.prototype.addScoreLabel = function(str, color, x, y, font_size, duration) {
  var this_duration = duration ? duration : this.score_label_duration
  var max_duration = duration ? duration : this.score_label_duration
  var temp_score_label = {text: str, color: color, x: x, y: y, duration: this_duration, max_duration: max_duration, size: font_size}
  this.score_labels.push(temp_score_label)
}

ImpulseGameState.prototype.check_cutoffs = function() {

  // Pulse the gateway every time an enemy is killed after reaching the score.
  if(this.game_numbers.score >= this.level.cutoff_scores[0]) {
    this.gateway_unlocked = true
    this.level_redraw_bg = true
    if (this.show_tutorial) {
      this.add_tutorial_signal("gateway_opened")
    }
  }
}

ImpulseGameState.prototype.increment_combo = function() {
  if (this.combo_enabled) {
    this.game_numbers.base_combo += 1
    this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
  }
}

ImpulseGameState.prototype.reset_combo = function() {
  this.hive_numbers.hit = true;
  if (!this.combo_enabled) return;
  if (this.show_tutorial && !this.level.is_boss_level) {
    this.add_tutorial_signal("multiplier_reset")
  }
  this.game_numbers.base_combo = 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

ImpulseGameState.prototype.level_defeated = function() {
  if (this.main_game) {
    game_engine.switch_game_state(gsKeys.MAIN_GAME_TRANSITION_STATE, {
      world_num: this.world_num,
      last_level: this.level,
      visibility_graph: this.visibility_graph,
      hive_numbers: this.hive_numbers,
      loading_saved_game: false
    });

  } else {
    game_engine.switch_game_state(gsKeys.REWARD_GAME_STATE, {
      hive_numbers: this.hive_numbers,
      main_game: this.main_game,
      game_args: {
        game_numbers: this.game_numbers,
        level: this.level,
        world_num: this.world_num,
        visibility_graph: this.visibility_graph,
        victory: this.victory
      }
    });
  }
}

ImpulseGameState.prototype.on_victory = function() {
  // Check if high score and best time. If so, save.
  if (!this.is_tutorial_level && !this.is_level_zero) {
    this.update_save_data_for_level();
  }
  this.victory = true
  if(this.is_boss_level) {
    this.level.boss_victory = true
  }
  if (this.main_game) {
    if (!this.is_boss_level && !(this.world_num == 0
        && this.level.level_name === levelData.lastTutorialLevel)) {
      // Advance the level to the next level.
      this.hive_numbers.current_level = utils.getNextLevelName(this.level, this.world_num);
      if (!this.is_tutorial_level) {
        saveData.savePlayerGame(this.hive_numbers);
        game_engine.set_popup_message("saved_alert", 1000, "white", this.world_num)
      }
    } else {
      // Clear the game data.
      saveData.clearSavedPlayerGame();
    }
  }
}

ImpulseGameState.prototype.update_save_data_for_level = function () {
  var new_time = this.game_numbers.seconds;

  if (!saveData.hasBeatenLevel(this.level.level_name) ||
    new_time < saveData.getBestTimeForLevel(this.level.level_name)) {
    this.game_numbers.best_time = true;
    saveData.setBestTimeForLevel(this.level.level_name, new_time);
    saveData.saveGame()
  } else {
    this.game_numbers.best_time = false;
  }
}

ImpulseGameState.prototype.shake_level = function (dur) {
  this.shaking_timer = dur;
  this.shaking_interval = dur;
}

ImpulseGameState.prototype.add_tutorial_signal = function(signal) {
  if (this.show_tutorial) {
    this.tutorial_signals[signal] = "fresh";
    this.tutorial_signal_timeouts[signal] = this.tutorial_signal_timeout
  }
}

ImpulseGameState.prototype.dispose = function() {
  this.level.dispose();
}

module.exports = ImpulseGameState;
