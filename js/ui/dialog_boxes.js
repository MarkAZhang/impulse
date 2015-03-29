var _ = require('lodash');
var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var controls = require('../core/controls.js');
var debugVars = require('../data/debug.js');
var dom = require('../core/dom.js');
var enemyData = require('../data/enemy_data.js');
var enemyRenderUtils = require('../render/enemy.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var music_player = require('../core/music_player.js');
var renderUtils = require('../render/utils.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var CheckboxOptionButton = require('../ui/checkbox_option_button.js');
var Fader = require('../game_states/fader_util.js');
var HiveNumbers = require('../load/hive_numbers.js');
var IconButton = require('../ui/icon_button.js');
var MessageBox = require('../ui/message_box.js');
var SliderOptionButton = require('../ui/slider_option_button.js');
var SmallButton = require('../ui/small_button.js');
var SmallEnemyButton = require('../ui/small_enemy_button.js');

var DialogBox = function() {

}

DialogBox.prototype.isDialogBox = true;

DialogBox.prototype.init = function(w, h) {
  this.w = w
  this.h = h
  this.x = constants.canvasWidth/2
  this.y = constants.canvasHeight/2
  this.buttons = []
  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.solid = false;
}

DialogBox.prototype.process = function(dt) {
  this.fader.process(dt);
}

DialogBox.prototype.draw = function(ctx) {
  if (debugVars.hide_pause_menu) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h);

  if (this.solid) {
    ctx.fillStyle = constants.colors['menuBg'];
  } else {
    ctx.globalAlpha *= 0.8;
    ctx.fillStyle = "#000000";
  }
  ctx.fill();
  ctx.restore();
  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  this.additional_draw(ctx)

  ctx.restore();
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

PauseMenu.prototype.isPauseMenu = true;

function PauseMenu(level, world_num, game_numbers, game_state, visibility_graph) {
  this.level = level
  this.game_numbers = game_numbers
  this.game_state = game_state
  this.world_num = world_num
  this.level_name = this.level.level_name
  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  this.visibility_graph = visibility_graph
  this.init(800, 600)
  this.button_color = "#999";
  this.hover_color = "#fff";
  this.buttons = []

  this.add_buttons()
}

PauseMenu.prototype.add_buttons = function() {
  var buttons_to_add = [];

  buttons_to_add.push({
    text: "OPTIONS",
    action: function () {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new OptionsMenu(_this))
      });
    }
  });

  buttons_to_add.push({
    text: "CONTROLS",
    action: function () {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new ControlsMenu(_this))
      });
    }
  });

  if(this.world_num != 0) {

    if(!this.level.main_game) {
      buttons_to_add.push({
        text: "RETRY",
        action: function () {
          _this.restart_practice();
        }
      });

      buttons_to_add.push({
        text: "QUIT",
        action: function () {
          _this.quit_practice()
        }
      });
    } else {
      buttons_to_add.push({
        text: "SAVE & QUIT",
        action: function () {
          _this.save_and_quit_main_game()
        }
      });

      buttons_to_add.push({
        text: "QUIT",
        action: function () {
          _this.quit_main_game()
        }
      });
    }
  } else {
    buttons_to_add.push({
      text: this.world_num == 0 && saveData.firstTime ? "SKIP TUTORIAL" : "QUIT",
      action: function () {
        _this.quit_tutorial()
      }
    });
  }

  var _this = this;
  _.forEach(buttons_to_add, function(button_data, i) {
    var height = 292 + 36 * i;
    _this.buttons.push(new SmallButton(button_data.text, 24,  _this.x, height, 200, 36, _this.button_color, _this.hover_color,
      button_data.action));
  });

  // resume button.
  this.resume_button = new IconButton("CLOSE", 18, this.x + this.w / 2 - 20, this.y - this.h/2 + 30,
    150, 100, this.button_color, this.hover_color, function(_this) { return function() {
    _this.game_state.toggle_pause()
  }}(this), "close")

  this.buttons.push(this.resume_button)
}

PauseMenu.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.beginPath()
  ctx.textAlign = "center";

  ctx.font = '48px Open Sans Bold';
  ctx.shadowBlur = 0;
  ctx.shadowColor = this.button_color;
  ctx.fillStyle = this.button_color;
  ctx.fillText("PAUSED", this.x, this.y - this.h/2 + 130)

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
  game_engine.switch_game_state(gsKeys.REWARD_GAME_STATE, {
    hive_numbers: this.game_state.hive_numbers,
    main_game: this.game_state.main_game,
    game_args: {
      game_numbers: this.game_state.game_numbers,
      level: this.game_state.level,
      world_num: this.game_state.world_num,
      visibility_graph: this.game_state.visibility_graph,
      victory: false
    }
  });
  game_engine.clear_dialog_box()
}
PauseMenu.prototype.restart_practice = function() {
  layers.bgCtx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
  this.level.impulse_game_state= null
  this.level.draw_bg(layers.bgCtx)
  layers.bgCtx.translate(-constants.sideBarWidth, 0)
  var hive_numbers = new HiveNumbers(this.game_state.world_num, false)
  game_engine.switch_game_state(gsKeys.IMPULSE_GAME_STATE, {
    world: this.game_state.world_num,
    level: this.level,
    visibility_graph: this.visibility_graph,
    hive_numbers: hive_numbers,
    main_game: false
  });
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.quit_main_game = function() {
  saveData.clearSavedPlayerGame();
  game_engine.switch_game_state(gsKeys.MAIN_GAME_SUMMARY_STATE, {
    world_num: this.game_state.world_num,
    victory: false,
    hive_numbers: this.game_state.hive_numbers,
    visibility_graph: null,
    save_screen: false,
    just_saved: false
  });
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.quit_tutorial = function() {
  game_engine.switch_game_state(gsKeys.REWARD_GAME_STATE, {
    hive_numbers: this.game_state.hive_numbers,
    main_game: this.game_state.main_game,
    game_args: {
      game_numbers: this.game_state.game_numbers,
      level: this.game_state.level,
      world_num: this.game_state.world_num,
      visibility_graph: this.game_state.visibility_graph,
      is_tutorial: true,
      first_time_tutorial: saveData.firstTime,
      victory: true,
      skipped: true
    }
  });
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.save_and_quit_main_game = function() {
  saveData.savePlayerGame(this.game_state.hive_numbers);
  game_engine.switch_game_state(gsKeys.MAIN_GAME_SUMMARY_STATE, {
    world_num: this.game_state.world_num,
    victory: false,
    hive_numbers: this.game_state.hive_numbers,
    visibility_graph: null,
    save_screen: true,
    just_saved: true
  });
  game_engine.clear_dialog_box()
}

PauseMenu.prototype.on_key_down = function(keyCode) {
  if(keyCode == controls.keys.PAUSE || keyCode == controls.keys.SECONDARY_PAUSE) {
    this.game_state.toggle_pause()
  }
}

OptionsMenu.prototype = new DialogBox()

OptionsMenu.prototype.constructor = OptionsMenu
OptionsMenu.prototype.isOptionsMenu = true;

function OptionsMenu(previous_menu) {
  this.init(800, 600)
  this.game_state = previous_menu.game_state
  this.world_num = previous_menu.world_num
  this.previous_menu = previous_menu;

  this.options_y_line_up = 153
  this.button_color = "#999";
  this.hover_color = "#fff";

  if (this.previous_menu.isTitleState) {
    this.solid = true;
  }

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.button_color, this.hover_color, function(_this) { return function() {
  _this.fader.set_animation("fade_out", function() {
    if(_this.previous_menu.isPauseMenu) {
      _this.previous_menu.add_buttons()
      game_engine.set_dialog_box(_this.previous_menu)
      _this.previous_menu.fader.set_animation("fade_in");
    } else {
      if (_this.previous_menu.isTitleState) {
        _this.previous_menu.fader.set_animation("fade_in");
      }
      game_engine.clear_dialog_box()
    }
  });

  }}(this), "back");

  var controls_x_value = this.x
  if (this.previous_menu.isTitleState) {
    this.delete_button= new IconButton("DELETE GAME DATA", 20, this.x + 150, this.y + 120, 200, 100, this.button_color, this.hover_color, function(_this) { return function() {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new DeleteDataDialog(_this))
      });
    }}(this), "delete")
    this.buttons.push(this.delete_button)
    this.controls_button = new IconButton("CHANGE CONTROLS", 20, this.x - 150, this.y + 120, 200, 100, this.button_color, this.hover_color, function(_this) { return function() {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new ControlsMenu(_this))
      });
    }}(this), "controls")
    this.buttons.push(this.controls_button)
  }
  this.buttons.push(this.back_button)

  this.current_help_text = ""

  var button_width = 300;

  this.music_button = new SliderOptionButton("GAME MUSIC", this.x, this.y - this.h/2 + this.options_y_line_up, button_width, 30, this.button_color, this.hover_color, function(value) {
    music_player.change_bg_volume(Math.ceil(Math.pow(value, 2) * 100), true) // sqrt it to get a better curve
  }, Math.pow(saveData.optionsData.bg_music_volume / 100, 0.5));
  this.music_button.special_mode = music_player.mute
  this.music_button.add_hover_overlay(new MessageBox("option_game_music", "white", this.world_num))
  this.buttons.push(this.music_button)

  this.effects_button = new SliderOptionButton("SOUND EFFECTS", this.x, this.y - this.h/2 + this.options_y_line_up + 30, button_width, 30, this.button_color, this.hover_color, function(value) {
    music_player.change_effects_volume(Math.ceil(Math.pow(value, 3) * 100)) // sqrt it to get a better curve
  }, Math.pow(saveData.optionsData.effects_volume / 100, 0.333));
  this.effects_button.special_mode = music_player.mute
  this.effects_button.add_hover_overlay(new MessageBox("option_sound_effects", "white", this.world_num))
  this.buttons.push(this.effects_button)

  this.fullscreen_button = new CheckboxOptionButton("FULLSCREEN", this.x, this.y - this.h/2 + this.options_y_line_up + 60, button_width, 30, this.button_color, this.hover_color, function(on) {
    game_engine.toggleFullScreen();
  }, function() {
    return dom.IsInFullScreen()
  });
  this.fullscreen_button.add_hover_overlay(new MessageBox("option_fullscreen", "white", this.world_num))
  this.fullscreen_button.change_checkbox_on_click = false;
  this.buttons.push(this.fullscreen_button)

  button = new CheckboxOptionButton("PARTICLE EFFECTS", this.x, this.y - this.h/2 + this.options_y_line_up + 90, button_width, 30, this.button_color, this.hover_color, function(on) {
    saveData.optionsData.explosions = !saveData.optionsData.explosions
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.explosions;
  });
  button.add_hover_overlay(new MessageBox("option_particle_effects", "white", this.world_num))
  this.buttons.push(button)

  button = new CheckboxOptionButton("SCORE LABELS", this.x, this.y - this.h/2 + this.options_y_line_up + 120, button_width, 30, this.button_color, this.hover_color, function(on) {
    saveData.optionsData.score_labels = !saveData.optionsData.score_labels
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.score_labels;
  });
  button.add_hover_overlay(new MessageBox("option_score_labels", "white", this.world_num))
  this.buttons.push(button)

  button = new CheckboxOptionButton("MULTIPLIER DISPLAY", this.x, this.y - this.h/2 + this.options_y_line_up + 150, button_width, 30, this.button_color, this.hover_color, function(on) {
    saveData.optionsData.multiplier_display = !saveData.optionsData.multiplier_display
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.multiplier_display;
  });
  button.add_hover_overlay(new MessageBox("option_multiplier_display", "white", this.world_num))
  this.buttons.push(button)

  button = new CheckboxOptionButton("IMPULSE SHADOW", this.x, this.y - this.h/2 + this.options_y_line_up + 180, button_width, 30, this.button_color, this.hover_color, function(on) {
    saveData.optionsData.impulse_shadow = !saveData.optionsData.impulse_shadow
    saveData.saveGame();
  }, function() {
    return saveData.optionsData.impulse_shadow;
  });
  button.add_hover_overlay(new MessageBox("option_impulse_shadow", "white", this.world_num))
  this.buttons.push(button)
  var me = this;
  if(this.game_state && this.game_state.isImpulseGameState && this.game_state.level.main_game && this.world_num > 0 && saveData.difficultyMode == "normal") {
    button = new CheckboxOptionButton("SPEED RUN COUNTDOWN", this.x, this.y - this.h/2 + this.options_y_line_up + 210, button_width, 30, this.button_color, this.hover_color, function(on) {
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

OptionsMenu.prototype.additional_draw = function(ctx) {

  ctx.save()
  ctx.textAlign = "center"
  ctx.font = '48px Open Sans Bold';
  ctx.shadowBlur = 0;
  ctx.shadowColor = this.button_color;
  ctx.fillStyle = this.button_color;
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
    ctx.font = '14px Open Sans'
    if (this.game_state.isImpulseGameState && this.game_state.level.main_game ) {
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
  if(keyCode == controls.keys.PAUSE || keyCode == controls.keys.SECONDARY_PAUSE) {
    this.game_state.toggle_pause()
  }
};

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
  //music_player.change_bg_volume(this.convert_slider_value(this.music_volume_slider.value))
  //music_player.change_effects_volume(this.convert_slider_value(this.effects_volume_slider.value))
}

OptionsMenu.prototype.convert_slider_value = function(value) {
  return Math.pow(Math.E, value * Math.log(100))
}

ControlsMenu.prototype = new DialogBox()

ControlsMenu.prototype.constructor = ControlsMenu

function ControlsMenu(previous_menu) {
  this.init(800, 600)
  this.game_state = previous_menu.game_state
  this.previous_menu = previous_menu

  this.button_color = "#999";
  this.hover_color = "#fff";

  this.world_num = previous_menu.world_num

  var hover_color = "white";
  if (this.world_num == 0 || this.world_num == undefined) {
    hover_color = constants.colors["impulse_blue"];
  }

  if (this.previous_menu.solid) {
    this.solid = true;
  }

  this.current_hand = saveData.optionsData.control_hand
  this.current_scheme = saveData.optionsData.control_scheme
  var _this = this;
  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.button_color, this.hover_color, function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      game_engine.set_dialog_box(_this.previous_menu)
      _this.previous_menu.fader.set_animation("fade_in");
    });
  }}(this), "back")


  this.control_buttons = {}

  this.control_buttons["left mouse"] = new IconButton("LEFT-HAND MOUSE", 16, this.x - 200, this.y - this.h/2 + 135, 200, 100, this.button_color, this.hover_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "left"
    saveData.optionsData.control_scheme = "mouse"
    saveData.saveGame()
    controls.setKeyBindings()
  }}(this), "left_mouse")

  this.control_buttons["right keyboard"] = new IconButton("KEYBOARD-ONLY", 16, this.x, this.y - this.h/2 + 135, 200, 100, this.button_color, this.hover_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "right"
    saveData.optionsData.control_scheme = "keyboard"
    saveData.saveGame()
    controls.setKeyBindings()
  }}(this), "keyboard")

  this.control_buttons["right mouse"] = new IconButton("RIGHT-HAND MOUSE", 16, this.x + 200, this.y - this.h/2 + 135, 200, 100, this.button_color, this.hover_color, function(_this) { return function() {
    saveData.optionsData.control_hand = "right"
    saveData.optionsData.control_scheme = "mouse"
    saveData.saveGame()
    controls.setKeyBindings()
  }}(this), "right_mouse")

  this.buttons.push(this.control_buttons["left mouse"])
  this.buttons.push(this.control_buttons["right mouse"])
  this.buttons.push(this.control_buttons["right keyboard"])

  this.buttons.push(this.back_button)

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
    this.control_buttons[i].color = this.button_color
    this.control_buttons[i].border = false
  }
  if (this.current_hover) {
    this.control_buttons[this.current_hover].color = this.button_color
  } else {
    this.control_buttons[saveData.optionsData.control_hand +" "+saveData.optionsData.control_scheme].color = this.button_color
  }
  this.control_buttons[saveData.optionsData.control_hand +" "+saveData.optionsData.control_scheme].border = true
}

ControlsMenu.prototype.additional_draw = function(ctx) {

  ctx.save()
  ctx.textAlign = "center"
  ctx.font = '32px Open Sans';
  //ctx.shadowBlur = 10;
  ctx.shadowColor = this.button_color;
  ctx.fillStyle = this.button_color;
  ctx.fillText("CONTROLS", this.x, this.y - this.h/2 + 50)

  ctx.font = '18px Open Sans';
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
    uiRenderUtils.drawArrowKeys(ctx, this.x - 200, this.y - this.h/2 + 300, 50, this.button_color, ["W", "A", "S", "D"])
    ctx.fillText("MOVE", this.x - 200, this.y - this.h/2 + 360)
    uiRenderUtils.drawMouse(ctx, this.x + 200, this.y - this.h/2 + 270, 75, 100, this.button_color)
    ctx.fillText("IMPULSE", this.x + 200, this.y - this.h/2 + 360)

    renderUtils.drawRoundedRect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.button_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(currentControls == "left mouse") {
    uiRenderUtils.drawMouse(ctx, this.x - 200, this.y - this.h/2 + 270,  75, 100, this.button_color)
    ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)

    uiRenderUtils.drawArrowKeys(ctx, this.x + 200, this.y - this.h/2 + 300, 50, this.button_color)
    ctx.fillText("MOVE", this.x + 200, this.y - this.h/2 + 360)

    renderUtils.drawRoundedRect(ctx, this.x, this.y - this.h/2 + 430, 120, 40, 10, this.button_color)
    ctx.fillText("SHIFT", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  if(currentControls == "right keyboard") {
    uiRenderUtils.drawArrowKeys(ctx, this.x - 200, this.y - this.h/2 + 300, 50, this.button_color, ["W", "A", "S", "D"])
    ctx.fillText("IMPULSE", this.x - 200, this.y - this.h/2 + 360)

    uiRenderUtils.drawArrowKeys(ctx, this.x + 200, this.y - this.h/2 + 300, 50, this.button_color)
    ctx.fillText("MOVE", this.x + 200, this.y - this.h/2 + 360)
    renderUtils.drawRoundedRect(ctx, this.x, this.y - this.h/2 + 430, 300, 40, 10, this.button_color)
    ctx.fillText("SPACEBAR", this.x, this.y - this.h/2 + 436)
    ctx.shadowBlur = 0
    ctx.fillText("ENTER GATEWAY", this.x, this.y - this.h/2 + 490)
  }

  ctx.restore()
}

ControlsMenu.prototype.on_key_down = function(keyCode) {
  if(keyCode == controls.keys.PAUSE || keyCode == controls.keys.SECONDARY_PAUSE) {
    this.game_state.toggle_pause()
  }
};


EnemyBox.prototype = new DialogBox()

EnemyBox.prototype.constructor = EnemyBox

function EnemyBox(enemy_name, previous_menu) {
  this.init(800, 600)

  this.button_color = "#999";
  this.hover_color = "#fff";
  if(previous_menu.isDialogBox){
    this.game_state = previous_menu.game_state
    this.world_num = this.game_state.world_num
  } else if(previous_menu.isGameState) {
    this.world_num = previous_menu.world_num
    this.game_state = previous_menu;
  }

  var hover_color = "white";
  if (this.world_num == 0 || this.world_num == undefined) {
    hover_color = constants.colors["impulse_blue"];
  }

  this.previous_menu = previous_menu

  this.enemy_name = enemy_name

  this.true_name = enemy_name

  if(enemyData[this.enemy_name].true_name) {
    this.true_name = enemyData[this.enemy_name].true_name
  }
  this.max_enemy_d = 50
  this.other_notes = null

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, this.button_color, this.hover_color, function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      if(_this.previous_menu.isDialogBox) {
        game_engine.set_dialog_box(_this.previous_menu)
        _this.previous_menu.fader.set_animation("fade_in");
      } else if(_this.previous_menu.isGameState) {
        game_engine.clear_dialog_box()
        _this.previous_menu.fader.set_animation("fade_in");
      }
    });
  }}(this), "back")

  this.buttons.push(this.back_button)


  this.color = constants.colors["world "+this.world_num]
  this.text_width = 500

  this.enemy_info = enemyData[this.enemy_name].enemy_info

  this.current_lines = null

  this.num_pages = this.enemy_info.length

  this.cur_page = 0

  if(this.enemy_name == "spear") this.spd_value = 1

  this.fader.set_animation("fade_in");
}

EnemyBox.prototype.additional_draw = function(ctx) {

  ctx.save()
  if(this.current_lines == null) {
    this.current_lines = utils.getLines(ctx, this.enemy_info[this.cur_page].toUpperCase(), this.text_width, '20px Open Sans')
  }

  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.fillStyle = this.button_color
  ctx.font = '16px Open Sans'
  ctx.fillText("ENEMY INFO", this.x, this.y - this.h/2 + 70)
  ctx.font = '30px Open Sans'

  ctx.fillText(this.true_name.toUpperCase(), this.x, this.y - this.h/2 + 120)


  ctx.globalAlpha /= 3
  uiRenderUtils.drawTessellationSign(ctx, this.world_num, this.x, this.y - this.h/2 + 215, 80)
  ctx.globalAlpha *= 3
  enemyRenderUtils.drawEnemyRealSize(ctx, this.enemy_name, this.x, this.y - this.h/2 + 215, 1.5)

  ctx.font = '12px Open Sans'
  ctx.fillText("BASE POINTS", this.x, this.y - this.h/2 + 310)
  ctx.font = '24px Open Sans'
  ctx.fillText(enemyData[this.enemy_name].score_value, this.x, this.y - this.h/2 + 335)

  ctx.font = '20px Open Sans'

   for(var i = 0; i < this.current_lines.length; i++) {
    var offset = i - (this.current_lines.length-1)/2
    ctx.fillText(this.current_lines[i], this.x, this.y - this.h/2 + 427 + 25 * offset)
  }
  if (this.num_pages > 1) {
    uiRenderUtils.drawArrow(ctx, this.x - 300, this.y - this.h/2 + 420, 20, "left", this.button_color, false)
    ctx.font = '10px Open Sans'
    ctx.fillStyle = this.button_color
    ctx.fillText("NEXT", this.x + 302, this.y - this.h/2 + 450)
    ctx.fillText("PREV", this.x - 302, this.y - this.h/2 + 450)
    uiRenderUtils.drawArrow(ctx, this.x + 300, this.y - this.h/2 + 420, 20, "right", this.button_color, false)
    for(var i = 0; i < this.num_pages; i++) {
      var offset = (this.num_pages-1)/2 - i
      ctx.beginPath()
      ctx.shadowBlur = 5
      ctx.arc(this.x - 25 * offset, this.y - this.h/2 + 515, 4, 0, 2*Math.PI, true)

      if(this.cur_page == i) {
        ctx.fillStyle = this.button_color
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
  if(keyCode == controls.keys.PAUSE || keyCode == controls.keys.SECONDARY_PAUSE) {
    this.game_state.toggle_pause()
  }
};

DeleteDataDialog.prototype = new DialogBox()

DeleteDataDialog.prototype.constructor = DeleteDataDialog

function DeleteDataDialog(previous_menu) {
  this.init(800, 600)
  this.previous_menu = previous_menu
  this.lite_color = previous_menu.lite_color
  this.button_color = previous_menu.button_color

  this.deleted = false

  this.solid = true;

  this.buttons = []
  this.delete_button= new IconButton("DELETE GAME DATA", 20, this.x, this.y + 90, 200, 100, "white", "red", function(_this) { return function() {
    _this.clear_data()
    _this.deleted = true
  }}(this), "delete")

  this.buttons.push(this.delete_button)

  this.back_button = new IconButton("BACK", 16, this.x, this.y - this.h/2 + 560, 60, 65, "white", "white" ,function(_this) { return function() {
    _this.fader.set_animation("fade_out", function() {
      game_engine.set_dialog_box(_this.previous_menu)
      _this.previous_menu.fader.set_animation("fade_in");
    });
  }}(this), "back")
  this.buttons.push(this.back_button)

  this.fader.set_animation("fade_in");
}

DeleteDataDialog.prototype.additional_draw = function(ctx) {

  if (!this.deleted) {
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.font = "32px Open Sans Bold"

    ctx.fillText("ARE YOU SURE", this.x, 190)
    ctx.font = "24px Open Sans"
    ctx.fillText(" YOU WANT TO DELETE ALL YOUR GAME DATA?", this.x, 230)
    ctx.font = "16px Open Sans"
    ctx.fillText("THIS ACTION CANNOT BE UNDONE.", this.x, 290)
    for(var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(ctx)
    }

  } else {
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.font = "24px Open Sans"
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
  saveData.clearData();
}

var dialogBoxes = {
  EnemyBox: EnemyBox,
  OptionsMenu: OptionsMenu,
  PauseMenu: PauseMenu
};

module.exports = dialogBoxes;
