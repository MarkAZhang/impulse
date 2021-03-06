var audioData = require('../data/audio_data.js');
var constants = require('../data/constants.js');
var controls = require('../core/controls.js');
var debugVars = require('../data/debug.js');
var game_engine = require('../core/game_engine.js');
var graphics = require('../core/graphics.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');
var spriteData = require('../data/sprite_data.js');
var uiRenderUtils = require('../render/ui.js');

var Background = require('../render/background.js');
var Fader = require('../game_states/fader_util.js');
var GameState = require('../game_states/game_state.js');
var IconButton = require('../ui/icon_button.js');
var Level = require('../level/level.js');
var SelectDifficultyButton = require('../ui/select_difficulty_button.js');

WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(opts) {
  // is_practice_mode
  // world

  this.is_practice_mode = opts.is_practice_mode;
  this.world_num = opts.world

  this.bg_drawn = false
  this.color = "white"//constants.colors["impulse_blue"]

  this.next_world = null;

  this.cur_difficulty_mode = saveData.difficultyMode;
  this.next_difficulty_mode = null;
  this.transition_to_world_num = null;

  this.buttons = []
  var _this = this

  this.buttons.push(new IconButton("BACK", 16, 70, constants.levelHeight/2+260, 60, 65, this.color, constants.colors["impulse_blue"], function(){
    _this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
    });
    game_engine.setBg(graphics.menuBackground);
  }, "back"));

  this.difficulties = ["easy", "normal"];

  if (saveData.isHardModeUnlocked() || debugVars.dev || debugVars.god_mode) {
    this.select_difficulty_button = new SelectDifficultyButton(16, 730, constants.levelHeight/2+260, 100, 65, this.color, constants.colors["impulse_blue"], this)
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


  this.world_button_y = constants.levelHeight/2;
  this.set_up_buttons();

  music_player.play_bg(audioData.songs["Menu"])

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
  this.gateway_loc = {x: constants.levelWidth/2/constants.drawFactor, y: this.world_button_y/constants.drawFactor}
  this.gateway_size = 5
  this.gateway_particles_per_round = 8

  // If this is the first time, take the player to the tutorial.
  if (saveData.firstTime) {
    // If we don't set timeout, the click event will set world map state back to the game state.
    setTimeout(function() {
      game_engine.switch_game_state(gsKeys.MAIN_GAME_TRANSITION_STATE, {
        world_num: 0,
        last_level: null,
        visibility_graph: null,
        hive_numbers: null,
        loading_saved_game: false
      });
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
      2: saveData.hasBeatenWorldForDifficulty(1, difficulty) || debugVars.dev || debugVars.god_mode,
      3: saveData.hasBeatenWorldForDifficulty(2, difficulty) || debugVars.dev || debugVars.god_mode,
      4: saveData.hasBeatenWorldForDifficulty(3, difficulty) || debugVars.dev || debugVars.god_mode,
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
      this.set_up_world_icon(0, constants.levelWidth/2, this.world_button_y, true, this.difficulties[i])
    }
  }
}

WorldMapState.prototype.set_up_world_map = function(difficulty) {
    var _this = this;
    for (var i = 0; i <= 4; i++) {
      this.set_up_world_icon(i, constants.levelWidth/2, this.world_button_y, this.world_unlocked[difficulty][i], difficulty)
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
  var cur_x =  constants.levelWidth/2 - ((num_buttons_to_show - 1) * 0.5) * diff

  for(var i = 0; i < num_buttons_to_show; i++) {
    var _this = this;
    var callback = (function(index) {
      return function() {
        if (_this.world_num != index) {
          _this.fader.set_animation("fade_across", function() {
            _this.world_num = index;
          });
          _this.next_world = index;
          _this.next_difficulty_mode = _this.cur_difficulty_mode;
        }
      };
    })(i)
    this.mode_buttons[difficulty].push(new IconButton(text[i], 16, cur_x + (i)*diff, constants.levelHeight/2+250, 60, 60, constants.colors["world "+i+" bright"], constants.colors["impulse_blue"], callback, "world"+i))
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

    this.next_world = i;
    this.next_difficulty_mode = difficulty
  }
};

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
      var this_color = constants.colors["world "+i+" bright"];
      var callback = (function(level, index) {
        return function() {
          _this.fade_out_interval = _this.fade_out_interval_practice
          _this.fade_out_duration = _this.fade_out_interval;
          _this.fade_out_color = constants.colors["world "+ index +" dark"];
          _this.transition_to_world_num = index;
          var world_bg_ctx = layers.worldMenuBgCanvas.getContext('2d')
          _this.draw_world_bg(world_bg_ctx)
          setTimeout(function(){
            game_engine.switch_game_state(gsKeys.LEVEL_INTRO_STATE, {
              level_name: level,
              world: index
            });
          }, _this.fade_out_interval_practice)
        }

      })(level_name, i)
      var x = constants.levelWidth/2 + ((-1.5 + (j % 4)) * 150);
      var y = j >= 4 ? constants.levelHeight/2+100  : constants.levelHeight/2

      var new_button = new IconButton(j+1, 30, x, y, 75, 75, this_color, this_color, callback, "practice"+i);
      new_button.underline_on_hover = false
      new_button.level_name = level_name
      this.practice_buttons[difficulty][i].push(new_button)
      new_button.active = saveData.hasBeatenLevel(level_name) ||
        (j == 0 && this.world_unlocked[difficulty][i]) || (debugVars.dev || debugVars.god_mode)
      if(!new_button.active) {
        new_button.color = "gray"
      }
    }
  }
}

WorldMapState.prototype.set_up_world_icon = function(world_num, x, y, unlocked, difficulty) {
  var text = unlocked ? "START" : "LOCKED";
  var _this = this
  this.world_buttons[difficulty][world_num] = new IconButton(text, 50, x, y, 150, 150, constants.colors["world "+world_num+" bright"], constants.colors["world "+world_num+" bright"],
    function(){
      _this.fade_out_interval = _this.fade_out_interval_main
      _this.fade_out_duration = _this.fade_out_interval;
      _this.fade_out_color = constants.colors["world "+world_num+" dark"];
      _this.transition_to_world_num = world_num;
      var world_bg_ctx = layers.worldMenuBgCanvas.getContext('2d')
      _this.draw_world_bg(world_bg_ctx)
      setTimeout(function(){
        game_engine.switch_game_state(gsKeys.MAIN_GAME_TRANSITION_STATE, {
          world_num: world_num,
          last_level: null,
          visibility_graph: null,
          hive_numbers: null,
          loading_saved_game: false
        });
      }, _this.fade_out_interval_main)}, "world"+world_num)
  this.world_buttons[difficulty][world_num].active = unlocked
}

WorldMapState.prototype.draw_world_bg = function(ctx) {
  uiRenderUtils.tessellateBg(ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive "+this.world_num)
}

WorldMapState.prototype.draw = function(ctx, bg_ctx) {
  if (saveData.firstTime) {
    return
  }
  if(this.fade_out_color) {
    ctx.save()
    ctx.globalAlpha = 1-(this.fade_out_duration/this.fade_out_interval)
    ctx.fillStyle = this.fade_out_color
    ctx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)
    ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num)
    if (!saveData.shouldShowLevelZero(this.transition_to_world_num) &&
      !debugVars.show_zero_level) {
      ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)
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
    this.draw_gateway_particles(ctx, constants.drawFactor);
  }


  ctx.font = '13px Open Sans'
  ctx.fillStyle = "white"
  ctx.fillText("SELECT HIVE", constants.levelWidth/2, constants.levelHeight/2 + 215)

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
      ctx.font = "20px Open Sans"
      ctx.fillText("PRACTICE MODE", constants.levelWidth/2, this.world_button_y - 170)
    } else if (saveData.difficultyMode == "normal") {
      ctx.fillStyle = "white"
      ctx.font = "24px Open Sans"
      ctx.fillText("HARD MODE", constants.levelWidth/2, this.world_button_y - 170)
    }
  }

  // draw hive name
  ctx.fillStyle = constants.colors["world "+index+" bright"]
  ctx.font = "42px Open Sans"
  ctx.textAlign = "center"
  if (index > 0) {
    ctx.fillText(levelData.hiveNames[index], constants.levelWidth/2, this.world_button_y - 125)
  } else {
    ctx.fillText("TUTORIAL", constants.levelWidth/2, this.world_button_y - 125)
  }

  // mode buttons
  for(var i = 0; i < this.mode_buttons[difficulty].length; i++) {
    this.mode_buttons[difficulty][i].draw(ctx)
    if(this.mode_buttons[difficulty][i].mouseOver) {
      ctx.textAlign = "center"
      ctx.font = '15px Open Sans'
      if (i == 0) {
        ctx.fillStyle = constants.colors['world '+(i)+" bright"]
        ctx.fillText("TUTORIAL", constants.levelWidth/2, constants.levelHeight - 8)
      } else if(this.mode_buttons[difficulty][i].active) {
        ctx.fillStyle = constants.colors['world '+(i)+" bright"]
        ctx.fillText(levelData.hiveNames[i], constants.levelWidth/2, constants.levelHeight - 8)
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

  game_engine.processAndDrawBg(dt);
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

WorldMapState.prototype.on_key_down = function(keyCode) {
  if(keyCode == controls.keys.GOD_MODE_KEY && debugVars.god_mode_enabled) { //G = god mode
    this.set_up_buttons();
  }
};
WorldMapState.prototype.process_gateway_particles = Level.prototype.process_gateway_particles;
WorldMapState.prototype.generate_gateway_particles = Level.prototype.generate_gateway_particles;
WorldMapState.prototype.draw_gateway_particles = Level.prototype.draw_gateway_particles;

module.exports = WorldMapState;
