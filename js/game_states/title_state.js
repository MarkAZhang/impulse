var audioData = require('../data/audio_data.js');
var constants = require('../data/constants.js');
var debugVars = require('../data/debug.js');
var game_engine = require('../core/game_engine.js');
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

function TitleState() {
  this.buttons = {
    "menu" : [],
    "enter" : [],
    "options" : []
  }
  var _this = this
  this.bg_drawn = false
  this.visibility = 0;

  this.state = "menu"

  this.setup_main_menu()

  music_player.play_bg(audioData.songs["Menu"])

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
  this.trailer_fade_in = 0;
  this.trailer_fade_total = 8000;
  this.trailer_fade_delay = 7000;

  if (debugVars.is_beta) {
    this.feedback_button = new SmallButton(
    "HELP US IMPROVE THE BETA", 20, 400, 570, 200, 50, constants.colors["impulse_blue_dark"],
      constants.colors["impulse_blue"], function() {
        window.open('http://goo.gl/forms/dmZlmtpJd0');
    });
    this.buttons["menu"].push(this.feedback_button);
  }
}

TitleState.prototype.process = function(dt) {
  this.fader.process(dt);
  this.trailer_fade_in += dt
  game_engine.processAndDrawBg(dt);
}

TitleState.prototype.draw = function(ctx) {
  if(!this.bg_drawn) {
    layers.bgCanvas.setAttribute("style", "")
    game_engine.setBg(new Background(constants.colors['menuBg'], "Hive 0", spriteData.menuBgOpacity))
    this.bg_drawn = true
  }

  ctx.save()

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  ctx.shadowColor = constants.colors["impulse_blue"]
  ctx.shadowBlur = 0
  if (debugVars.is_beta) {
    uiRenderUtils.drawLogo(ctx,constants.levelWidth/2, 200, "BETA")
  } else {
    uiRenderUtils.drawLogo(ctx,constants.levelWidth/2, 200, "")
  }

  // TEXT FOR TRAILER
  /*ctx.save()
  ctx.globalAlpha = Math.min(1, (this.trailer_fade_in > this.trailer_fade_delay ? this.trailer_fade_in - this.trailer_fade_delay : 0)/ (this.trailer_fade_total - this.trailer_fade_delay))
  ctx.textAlign = 'center'
  ctx.font = '24px Muli'
  ctx.fillStyle = constants.colors["impulse_blue"]
  ctx.fillText('PLAY FOR FREE AT', 400, 420)

  ctx.font = '20px Muli'
  ctx.fillText("www.play-impulse.com", 400, 450)
  ctx.font = '12px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("'Half Past Nothing' by Schemawound", 400, 550)
  ctx.restore()*/

  //ctx.shadowBlur = 5
  for(var i = 0; i < this.buttons[this.state].length; i++)
  {
    this.buttons[this.state][i].draw(ctx)
  }

  for(var i = 0; i < this.buttons[this.state].length; i++)
  {
    this.buttons[this.state][i].post_draw(ctx)
  }

  ctx.restore()

}

TitleState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons[this.state].length; i++)
  {
    this.buttons[this.state][i].on_mouse_move(x, y)
  }
}

TitleState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons[this.state].length; i++) {
    this.buttons[this.state][i].on_click(x, y)
  }
}

TitleState.prototype.setup_main_menu = function() {
  _this = this;
  this.buttons["menu"] = []
  var button_color = "white"//constants.colors["impulse_blue"]

  if(debugVars.dev && debugVars.old_menu) {
    this.buttons["menu"].push(new SmallButton("MAIN GAME", 20, constants.levelWidth/2 - 100, constants.levelHeight/2-30, 200, 100, button_color, "blue",
    function(){
      var i = 1;
      while(i < 4 && saveData.hasBeatenWorld(i)) {
        i += 1
      }
      if(saveData.savedGame.game_numbers) {
        game_engine.switch_game_state(gsKeys.MAIN_GAME_SUMMARY_STATE, {
          world_num: null,
          victory: null,
          hive_numbers: null,
          visibility_graph: null,
          save_screen: true,
          just_saved: false
        });
      } else {
        game_engine.switch_game_state(gsKeys.WORLD_MAP_STATE, {
          world: i,
          is_practice_mode: false
        });
      }
    }))
    this.buttons["menu"].push(new SmallButton("PRACTICE", 20, constants.levelWidth/2 - 100, constants.levelHeight/2+20, 200, 50, button_color, "blue",
      function(){
        var i = 1;
        while(i < 4 &&saveData.hasBeatenWorld(i)) {
          i += 1
        }
        game_engine.switch_game_state(gsKeys.WORLD_MAP_STATE, {
          world: i,
          is_practice_mode: true
        });
      }));
    this.buttons["menu"].push(new SmallButton("OPTIONS", 20, constants.levelWidth/2 - 100, constants.levelHeight/2+120, 200, 50, button_color, "blue",
      function (){
        setTimeout(function(){_this.state = "options"}, 50)
      }));
    this.buttons["menu"].push(new SmallButton("JUKEBOX", 20, constants.levelWidth/2 - 100, constants.levelHeight/2+170, 200, 50, button_color, "blue",
      function(){
        game_engine.switch_game_state(gsKeys.MUSIC_PLAYER_STATE, {});
      }));
    this.buttons["menu"].push(new SmallButton("LEVEL EDITOR", 20, constants.levelWidth/2 - 100, constants.levelHeight/2+270, 200, 50, button_color, "blue",
      function(){
        game_engine.switch_game_state(gsKeys.LEVEL_EDITOR_STATE, {});
      }));
    this.buttons["menu"].push(new SmallButton("QUESTS", 20, constants.levelWidth/2 - 100, constants.levelHeight/2+70, 200, 50, button_color, "blue",
      function(){
        game_engine.switch_game_state(gsKeys.QUEST_GAME_STATE, {});
      }))
  } else {
    var button_y = constants.levelHeight/2 + 50
    var _this = this;
    this.buttons["menu"].push(new IconButton("START GAME", 20, saveData.firstTime ? constants.levelWidth/2 : constants.levelWidth/2 - 130, button_y, 210, 100, button_color, constants.colors["impulse_blue"],
    function(){

      //_this.fade_out_duration = _this.fade_interval;

      if(saveData.savedGame &&
         saveData.savedGame.game_numbers) {
        //setTimeout(function(){
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
        //}, _this.fade_interval)
      } else {
        var i = 1;
        while(i < 4 && saveData.hasBeatenWorld(i)) {
          i += 1
        }

        if (_this.fader.animation == null && saveData.difficultyMode == "normal" && !saveData.firstTime) {
          game_engine.switchBg(new Background(
            constants.colors["menuBg"], "Title Alt" + i, uiRenderUtils.getWorldMapBgOpacity(i)), 250);
        } else if (saveData.firstTime) {
          game_engine.switchBg(new Background(constants.colors["world 0 dark"]), 150)
        }
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(gsKeys.WORLD_MAP_STATE, {
            world: i,
            is_practice_mode: false
          });
        });
      }
    }, "player"));

    if (!saveData.firstTime) {
      this.buttons["menu"].push(new IconButton("PRACTICE", 20, constants.levelWidth/2 + 130, button_y, 210, 100, button_color, constants.colors["impulse_blue"],
      function(){
        //_this.fade_out_duration = _this.fade_interval;
        var i = 1;
        while(i < 4 && saveData.hasBeatenWorld(i)) {
          i += 1
        }

        if (_this.fader.animation == null && saveData.difficultyMode == "normal") {
          game_engine.switchBg(new Background(
            constants.colors["menuBg"], "Title Alt" + i, uiRenderUtils.getWorldMapBgOpacity(i)), 250);
        }
        _this.fader.set_animation("fade_out", function() {
          game_engine.switch_game_state(gsKeys.WORLD_MAP_STATE, {
            world: i,
            is_practice_mode: true
          });
        });

      }, "normal_mode"))
  }

    this.buttons["menu"].push(new IconButton("OPTIONS", 16, constants.levelWidth/2 - 240, button_y + 130, 100, 70, button_color, constants.colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.set_dialog_box(new OptionsMenu(_this))
      });
    }, "gear"))

    this.buttons["menu"].push(new IconButton("ACHIEVEMENTS", 16,
      constants.levelWidth/2,
      button_y + 130, 100, 70, button_color, constants.colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.QUEST_GAME_STATE, {});
      });
    }, "quest"))

    this.buttons["menu"].push(new IconButton("CREDITS", 16, constants.levelWidth/2 + 240, button_y + 130, 100, 70, button_color, constants.colors["impulse_blue"],function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.CREDITS_STATE, {});
      });
    }, "credit"))
  }

  this.buttons["enter"].push(new SmallButton("CLICK TO BEGIN", 20, constants.levelWidth/2, constants.levelHeight/2+150, 200, 50, button_color, "blue", function(){setTimeout(function(){_this.state = "menu"}, 20)}))
  this.easy_mode_button = new SmallButton("NORMAL MODE", 20, constants.levelWidth/2-100, constants.levelHeight/2+120, 200, 50, button_color, "blue", function(){_this.change_mode("easy")})

  this.buttons["options"].push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("CHALLENGE MODE", 20, constants.levelWidth/2+100, constants.levelHeight/2+120, 200, 50, button_color, "blue",function(){_this.change_mode("normal")})
  this.buttons["options"].push(this.normal_mode_button)
  this.set_difficulty_button_underline();
  this.clear_data_button = new SmallButton("CLEAR DATA", 20, constants.levelWidth/2, constants.levelHeight/2+170, 200, 50, button_color, "blue",function(){_this.clear_data()})
  this.buttons["options"].push(this.clear_data_button)
  this.buttons["options"].push(new SmallButton("BACK", 20, constants.levelWidth/2, constants.levelHeight/2+220, 200, 50, button_color, "blue",function(){setTimeout(function(){_this.state = "menu"}, 50)}))

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
