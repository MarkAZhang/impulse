var _ = require('lodash');
var audioData = require('../data/audio_data.js');
var constants = require('../data/constants.js');
var debugVars = require('../data/debug.js');
var game_engine = require('../core/game_engine.js');
var graphics = require('../core/graphics.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');
var spriteData = require('../data/sprite_data.js');
var uiRenderUtils = require('../render/ui.js');

var Background = require('../render/background.js');
var CreditsState = require('../game_states/credits_state.js');
var Fader = require('../game_states/fader_util.js');
var GameState = require('../game_states/game_state.js');
var IconButton = require('../ui/icon_button.js');
var LevelEditorState = require('../game_states/level_editor_state.js');
var MainGameSummaryState = require('../game_states/main_game_summary_state.js');
var MessageBox = require('../ui/message_box.js');
var MusicPlayerState = require('../game_states/music_player_state.js');
var OptionsMenu = require('../ui/dialog_boxes.js').OptionsMenu;
var QuestGameState = require('../game_states/quest_game_state.js');
var SmallButton = require('../ui/small_button.js');
var WorldMapState = require('../game_states/world_map_state.js');

TitleState.prototype = new GameState

TitleState.prototype.constructor = TitleState

TitleState.prototype.isTitleState = true;

function TitleState(options) {
  this.buttons = [];
  var _this = this
  this.bg_drawn = false
  this.visibility = 0;

  this.setup_main_menu()

  music_player.play_bg(audioData.songs["Menu"])

  if (options.initialLoad) {
    this.fader = new Fader({
      "pause": 250,
      "fade_in": 500,
      "fade_out": 250
    });
    this.fader.set_animation("pause");
    this.needToFadeIn = true
  } else {
    this.fader = new Fader({
      "fade_in": 500,
      "fade_out": 250
    });
    this.fader.set_animation("fade_in");
  }

  this.trailer_fade_in = 0;
  this.trailer_fade_total = 8000;
  this.trailer_fade_delay = 7000;
}

TitleState.prototype.process = function(dt) {
  // Hack to make the initial animation work.
  if (dt > 500) {
    return
  }
  this.fader.process(dt);
  this.trailer_fade_in += dt
  game_engine.processAndDrawBg(dt);
  if (this.fader.animation === null && this.needToFadeIn) {
    this.needToFadeIn = false
    this.fader.set_animation('fade_in')
  }
}

TitleState.prototype.draw = function(ctx) {
  if(!this.bg_drawn) {
    layers.bgCanvas.setAttribute("style", "")
    game_engine.setBg(graphics.menuBackground);
    this.bg_drawn = true
  }

  ctx.save()

  if (this.fader.get_current_animation() == "pause") {
    ctx.globalAlpha *= 0
  } else if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  ctx.shadowColor = constants.colors["impulse_blue"]
  ctx.shadowBlur = 0
  if (debugVars.is_beta) {
    uiRenderUtils.drawLogo(ctx,constants.levelWidth/2, 245, "BETA")
  } else {
    uiRenderUtils.drawLogo(ctx,constants.levelWidth/2, 245, "")
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].post_draw(ctx)
  }

  ctx.restore()

}

TitleState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

TitleState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

TitleState.prototype.setup_main_menu = function() {
  var buttons_to_add = [];

  buttons_to_add.push({
    text: 'START GAME',
    action: function () {
      if(saveData.savedGame && saveData.savedGame.game_numbers) {
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(gsKeys.MAIN_GAME_SUMMARY_STATE, {
            world_num: null,
            victory: null,
            hive_numbers: null,
            visibility_graph: null,
            save_screen: true,
            just_saved: false
          });
        });
      } else {
        var i = saveData.latestWorld();
        game_engine.setBg(graphics.menuBackground);
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(gsKeys.MAIN_GAME_TRANSITION_STATE, {
            world_num: 1,
            last_level: null,
            visibility_graph: null,
            hive_numbers: null,
            loading_saved_game: false
          });
        });
      }
    }
  });


  buttons_to_add.push({
    text: 'OPTIONS',
    action: function () {
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new OptionsMenu(_this))
      });
    }
  });

  buttons_to_add.push({
    text: 'CREDITS',
    action: function () {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.CREDITS_STATE, {});
      });
    }
  });

  if (debugVars.jukebox_enabled) {
    buttons_to_add.push({
      text: 'JUKEBOX',
      action: function () {
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(gsKeys.MUSIC_PLAYER_STATE, {});
        });
      }
    })
  }

  if (debugVars.dev) {
    buttons_to_add.push({
      text: 'LEVEL EDITOR',
      action: function () {
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(gsKeys.LEVEL_EDITOR_STATE, {});
          window.gs = game_engine.cur_game_state;
        });
      }
    })
  }

  var _this = this;
  _.forEach(buttons_to_add, function(button_data, i) {
    var height = 342 + 36 * i;
    _this.buttons.push(new SmallButton(button_data.text, 24, 400, height, 200, 36, "#999", "#fff",
      button_data.action));
  });

  return;
  _this = this;
  this.buttons["menu"] = []
  var button_color = "white"

  var fullscreenButton = new IconButton("", 20, constants.levelWidth - 20, 20, 30, 30, button_color, constants.colors["impulse_blue"], function() {
    game_engine.toggleFullScreen();
  }, "fullscreen_in_game");
  fullscreenButton.add_hover_overlay(new MessageBox("fullscreen_msg", constants.colors["world 0 bright"], 0))
  this.buttons["menu"].push(fullscreenButton);
  var muteButton = new IconButton("", 20, constants.levelWidth - 50, 20, 30, 30, button_color, constants.colors["impulse_blue"], function() {
     game_engine.toggleMute();
  }, "mute_in_game");
  muteButton.add_hover_overlay(new MessageBox("mute_msg", constants.colors["world 0 bright"], 0))
  this.buttons["menu"].push(muteButton);
}

TitleState.prototype.change_mode = function(type) {
  saveData.difficultyMode = type;

  saveData.saveGame();
  this.set_difficulty_button_underline();
}

TitleState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (saveData.difficultyMode == "easy");
  this.normal_mode_button.underline = (saveData.difficultyMode == "normal");
}

module.exports = TitleState;
