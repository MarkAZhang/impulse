var constants = require('../data/constants.js');
var controls = require('../core/controls.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');
var spriteData = require('../data/sprite_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var Fader = require('../game_states/fader_util.js');
var GameState = require('../game_states/game_state.js');
var HiveNumbers = require('../load/hive_numbers.js');
var IconButton = require('../ui/icon_button.js');

GameOverState.prototype = new GameState

GameOverState.prototype.constructor = GameOverState

function GameOverState(opts) {
  // final_game_numbers
  // level
  // world_num
  // visibility_graph
  // args

  this.game_numbers = opts.final_game_numbers
  this.level = opts.level
  this.level_name = this.level.level_name
  this.buttons = []
  this.world_num = opts.world_num
  this.visibility_graph = opts.visibility_graph
  this.bg_drawn = false
  this.victory = opts.args.victory
  this.color = constants.colors['world '+ this.world_num + ' bright']
  this.restart_button = new IconButton("RETRY", 16, constants.levelWidth - 70, constants.levelHeight - 40, 60, 65, this.color, "white", function(_this){
    return function(){
      var hive_numbers = new HiveNumbers(_this.world_num, false)
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.IMPULSE_GAME_STATE, {
          world: _this.world_num,
          level: _this.level,
          visibility_graph: _this.visibility_graph,
          hive_numbers: hive_numbers,
          main_game: false
        });
      });
    }
  }(this), "start")
  this.buttons.push(this.restart_button);

  this.restart_button.keyCode = controls.keys.RESTART_KEY;
  if(saveData.optionsData.control_hand == "right") {
    this.restart_button.extra_text = "R KEY"
  } else {
    this.restart_button.extra_text = "SHIFT KEY"
  }

 this.buttons.push(new IconButton("MENU", 16, 70, constants.levelHeight/2+260, 60, 65, this.color, "white", function(_this){return function(){
    if(_this.world_num) {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.WORLD_MAP_STATE, {
          world: _this.world_num,
          is_practice_mode: true
        });
        if (saveData.difficultyMode == "normal") {
          game_engine.setBg("Title Alt" + _this.world_num, uiRenderUtils.getWorldMapBgOpacity(_this.world_num))
        } else {
          game_engine.setBg("Hive 0", spriteData.hive0_bg_opacity)
        }
      });
    }
    else {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
        game_engine.setBg("Hive 0", spriteData.hive0_bg_opacity)
      });
    }
  }}(this), "back"))


  if(!this.level.is_boss_level) {
    this.high_score = opts.args.high_score
    this.best_time = opts.args.best_time ? opts.args.best_time : 0
  } else {
    this.best_time = opts.args.best_time ? opts.args.best_time : 0
  }

  saveData.totalKills += this.game_numbers.kills

  saveData.saveGame()

  music_player.stop_bg()

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
}

GameOverState.prototype.process = function(dt) {
  this.fader.process(dt);
}

GameOverState.prototype.draw = function(ctx, bg_ctx) {

  if(!this.bg_drawn) {
    this.level.impulse_game_state= null
    bg_canvas.setAttribute("style", "display:none" )

    bg_ctx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    var world_bg_ctx = layers.worldMenuBgCanvas.getContext('2d')
    uiRenderUtils.tessellateBg(world_bg_ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive "+this.world_num)
    this.bg_drawn = true
    bg_ctx.translate(-constants.sideBarWidth, 0)
    this.bg_drawn = true
  }
  ctx.save()
  ctx.fillStyle = constants.colors["world "+this.world_num+" dark"]
  ctx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)
  ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num);
  ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)
  ctx.restore()

  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  if(!this.level.is_boss_level) {
    ctx.globalAlpha /= 3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, 230, 80, true)
    ctx.globalAlpha *= 3

    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = "white"
    ctx.font = '20px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.textAlign = 'center'
      ctx.fillText("HARD MODE", constants.levelWidth/2, 180)
    }
    ctx.restore();

    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.font = '42px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.level_name, constants.levelWidth/2, 240)
    ctx.fill()
    ctx.font = '36px Muli';
    if(this.victory) {
      ctx.fillStyle = "white"
      ctx.fillText("VICTORY", constants.levelWidth/2, 300)
    } else {
      ctx.fillStyle = "red"
      ctx.fillText("GAME OVER", constants.levelWidth/2, 300)
    }

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.color
    ctx.font = '20px Muli'
    ctx.fillText("GAME TIME ", constants.levelWidth/2 + 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.last_time, constants.levelWidth/2 + 100, score_label_y)
    ctx.fillStyle = this.color
    ctx.font = '20px Muli'
    ctx.fillText("SCORE", constants.levelWidth/2 - 100, score_y)

    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.score, constants.levelWidth/2 - 100, score_label_y)

    var line_y = 440
    if (!this.high_score) {
      ctx.beginPath();
      ctx.moveTo(250, line_y);
      ctx.lineTo(350, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }

    if (!this.best_time) {
      ctx.beginPath();
      ctx.moveTo(450, line_y);
      ctx.lineTo(550, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }

    var high_score_y = 445;
    var best_score_y = 500;
    var best_score_label_y = 470;

    if(this.high_score) {
      ctx.fillStyle = this.color
      ctx.font = '16px Muli'
      ctx.fillText("NEW HIGH SCORE!", constants.levelWidth/2 - 100, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.color
      ctx.font = '12px Muli'
      ctx.fillText("HIGH SCORE", constants.levelWidth/2  - 100, best_score_label_y)
      ctx.font = '28px Muli'
      ctx.fillText(saveData.getLevelData(this.level_name).high_score,
       constants.levelWidth/2 - 100, best_score_y)
      ctx.restore();
    }

    if(this.best_time) {
      ctx.fillStyle = this.color
      ctx.font = '16px Muli'
      ctx.fillText("NEW BEST TIME!", constants.levelWidth/2 + 100, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.color
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", constants.levelWidth/2 + 100, best_score_label_y)
      ctx.font = '28px Muli'
      if (saveData.getLevelData(this.level_name).best_time < 1000) {
        ctx.font = '28px Muli'
        ctx.fillText(utils.convertSecondsToTimeString(saveData.getLevelData(this.level_name).best_time),
          constants.levelWidth/2 + 100, best_score_y)
      } else {
        ctx.font = '24px Muli'
        ctx.fillText("UNDEFEATED",
          constants.levelWidth/2 + 100, best_score_y)
      }
      ctx.restore();
    }
  } else {


    ctx.globalAlpha /= 3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, 230, 80, true)
    ctx.globalAlpha *= 3

    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = "white"
    ctx.font = '20px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.textAlign = 'center';
      ctx.fillText("HARD MODE", constants.levelWidth/2, 180)
    }
    ctx.restore();

    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.textAlign = 'center'

    ctx.font = '32px Muli'
    ctx.fillText(levelData.bossNames[this.world_num], constants.levelWidth/2, 240)

    ctx.fill()
    ctx.font = '48px Muli';
    if (this.level.boss_victory) {
      ctx.fillStyle = "white"
      ctx.fillText("VICTORY", constants.levelWidth/2, 300)
    } else {
      ctx.fillStyle = "red"
      ctx.fillText("GAME OVER", constants.levelWidth/2, 300)
    }

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.color
    ctx.font = '20px Muli'
    ctx.fillText("GAME TIME ", constants.levelWidth/2, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.last_time, constants.levelWidth/2, score_label_y)

    var line_y = 440

    if (!this.best_time) {
      ctx.beginPath();
      ctx.moveTo(350, line_y);
      ctx.lineTo(450, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }

    var high_score_y = 445;
    var best_score_y = 500;
    var best_score_label_y = 470;

    if(this.best_time) {
      ctx.fillStyle = this.color
      ctx.font = '16px Muli'
      ctx.fillText("NEW BEST TIME!", constants.levelWidth/2, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.color
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", constants.levelWidth/2, best_score_label_y)
      ctx.font = '28px Muli'
      if (saveData.getLevelData(this.level_name).best_time < 1000) {
        ctx.font = '28px Muli'
        ctx.fillText(utils.convertSecondsToTimeString(saveData.getLevelData(this.level_name).best_time),
          constants.levelWidth/2, best_score_y)
      } else {
        ctx.font = '24px Muli'
        ctx.fillText("UNDEFEATED",
          constants.levelWidth/2, best_score_y)
      }
      ctx.restore();
    }
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.restore();
}

GameOverState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

GameOverState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

GameOverState.prototype.on_key_down = function(keyCode) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_key_down(keyCode)
  }
}

module.exports = GameOverState;
