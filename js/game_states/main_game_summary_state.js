var constants = require('../data/constants.js');
var controls = require('../core/controls.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var logging = require('../core/logging.js');
var music_player = require('../core/music_player.js');
var questData = require('../data/quest_data.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var GameState = require('../game_states/game_state.js');
var IconButton = require('../ui/icon_button.js');

MainGameSummaryState.prototype = new GameState

MainGameSummaryState.prototype.constructor = MainGameSummaryState

function MainGameSummaryState(opts) {
  // world_num
  // victory
  // hive_numbers
  // visibility_graph
  // save_screen
  // just_saved

  this.world_num = opts.world_num
  this.victory = opts.victory
  this.hive_numbers = opts.hive_numbers
  this.visibility_graph = opts.visibility_graph
  this.save_screen = opts.save_screen
  this.just_saved = opts.just_saved

  this.buttons = []
  this.bg_drawn = false

  if(opts.save_screen) {
    this.hive_numbers = saveData.savedGame
    saveData.saveGame()
    this.world_num = this.hive_numbers.world
    this.victory = null
  }

  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.buttons = []

  this.shift_down_time = 0
  this.ctrl_down_time = 0

  this.color = constants.colors["world "+this.world_num]
  this.lite_color = constants.colors["world "+this.world_num+" lite"]
  this.bright_color = constants.colors["world "+this.world_num+" bright"]
  this.dark_color = constants.colors["world "+this.world_num+" dark"]

  this.is_first_victory_over_world = false;

  if (this.world_num > 0) {
    this.total_time = Math.ceil((questData["blitz_hive" + this.world_num].time_cutoff * 1000 - this.hive_numbers.speed_run_countdown) / 1000);
    this.total_deaths = 0;
  }

  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)
    if(this.hive_numbers.game_numbers[title]) {
      this.total_deaths += this.hive_numbers.game_numbers[title].deaths
    }
  }

  if(this.victory) {
    this.calculate_deaths()
    this.send_logging();
    this.victory_text = levelData.hiveNames[this.world_num]+" DEFEATED";

    if (!saveData.hasBeatenWorld(this.world_num)) {
      this.is_first_victory_over_world = true;
    }

    if (!saveData.hasBeatenWorld(this.world_num) ||
        this.total_time < saveData.getBestTimeForWorld(this.world_num)) {
      saveData.setBestTimeForWorld(this.world_num, this.total_time);
      saveData.saveGame()
    }
  }

  var _this = this;

  if(this.save_screen && !this.just_saved) {
    this.resume_button = new IconButton("RESUME", 16, 730, constants.levelHeight/2+260, 100, 65, this.bright_color, this.bright_color, function(_this){return function(){
      _this.resume_game()
    }}(this), "start")
    this.resume_button.shadow = false
    this.buttons.push(this.resume_button)

    this.delete_button = new IconButton("START NEW GAME", 16, constants.levelWidth/2, constants.levelHeight/2+260, 100, 65, this.bright_color, this.bright_color, function(_this){return function(){
      _this.delete_game()
    }}(this), "delete_small")
    this.buttons.push(this.delete_button)
    this.delete_button.shadow = false
    this.return_to_main_button = new IconButton("EXIT", 16, 70, constants.levelHeight/2 + 260, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
      _this.exit_game()
    }}(this), "back")

    this.buttons.push(this.return_to_main_button)
  }

  if (this.world_num != 0) {
    music_player.stop_bg()
  }


  if (!this.save_screen && this.victory)
    this.check_quests();
}

MainGameSummaryState.prototype.send_logging = function () {
  // Logging for world 0 occurs in Reward Game State, since user can quit tutorial with pause menu.
  if (this.world_num === 0) return;
  // Determine first-victory by checking world_rankings.
  var first_victory = saveData.hasBeatenWorld(this.world_num);

  logging.send_logging_to_server('BEAT WORLD ' + this.world_num, {
    first_victory: first_victory,
    difficulty_mode: saveData.difficultyMode,
    hive_numbers: this.hive_numbers
  });
};

MainGameSummaryState.prototype.calculate_deaths = function() {
  var deaths = 0;
  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

    if(this.hive_numbers.game_numbers[title]) {
      deaths += this.hive_numbers.game_numbers[title].deaths;
    }
  }
  this.total_deaths = deaths
}

MainGameSummaryState.prototype.draw = function(ctx, bg_ctx) {
  if (this.world_num == 0 && !this.save_screen) {
    return;
  }
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none")
    this.bg_drawn = true
    uiRenderUtils.tessellateBg(layers.worldMenuBgCanvas.getContext('2d'), 0, 0, constants.levelWidth, constants.levelHeight, "Hive "+this.world_num)
  }

  ctx.save()
  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    if(this.transition_state == "out") {
      this.go_to_next_state();
    }
  }

  ctx.fillStyle = this.dark_color
  ctx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)

  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }

  ctx.save()
  ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num);

  ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)

  ctx.restore();
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  ctx.shadowBlur = 0;

  ctx.textAlign = 'center'


  ctx.font = '20px Open Sans'
  if(this.victory) {
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, 100, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = this.bright_color
    ctx.font = '40px Open Sans'
    ctx.fillText(this.victory_text, constants.levelWidth/2, 130)
  }
  else if(this.save_screen) {
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, 220, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = "white"
    ctx.fillText("GAME SAVED" , constants.levelWidth/2, 190)
    ctx.fillStyle = this.bright_color;
    ctx.font = '60px Open Sans'
    ctx.fillText(this.hive_numbers.current_level, constants.levelWidth/2, 250)

    ctx.textAlign = 'center'

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.bright_color
    ctx.font = '20px Open Sans'
    ctx.fillText("TOTAL TIME ", constants.levelWidth/2 - 100, score_y)
    ctx.font = '42px Open Sans'
    ctx.fillText(utils.convertSecondsToTimeString(this.total_time), constants.levelWidth/2 - 100, score_label_y)
    ctx.fillStyle = this.bright_color
    ctx.font = '20px Open Sans'
    ctx.fillText("DEATHS", constants.levelWidth/2 + 100, score_y)
    ctx.font = '42px Open Sans'
    ctx.fillText(this.total_deaths, constants.levelWidth/2 + 100, score_label_y)

  } else {
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, 100, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = 'red'
    ctx.fillText("GAME OVER", constants.levelWidth/2, 80)
    ctx.fillStyle = this.bright_color
    ctx.font = '40px Open Sans'
    ctx.fillText(this.hive_numbers.hive_name, constants.levelWidth/2, 130)
  }

  if(this.victory) {
    ctx.fillStyle = this.bright_color
    ctx.font = '14px Open Sans'
    ctx.fillText("TOTAL TIME", constants.levelWidth/2, 167)
    ctx.font = '24px Open Sans'
    ctx.fillText(utils.convertSecondsToTimeString(this.total_time), constants.levelWidth/2, 190)

  }

  if(!this.save_screen) {
    ctx.shadowBlur = 0

    ctx.font = '18px Open Sans'
    ctx.textAlign = 'center'

    var start_y = 250
    ctx.fillStyle = this.bright_color;

    ctx.fillText("LEVEL",260, start_y)
    //ctx.fillText("SCORE", 270, start_y)
    ctx.fillText("TIME", 400, start_y)
    //ctx.fillText("COMBO", 510, start_y)
    ctx.fillText("DEATHS", 540, start_y)

    for(var i = 0; i < 8; i++) {
      var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

      var real_title = title;
      if(i==7) {
        real_title = this.hive_numbers.boss_name;
      }
      var gn;
      if(this.hive_numbers.game_numbers[title]) {
        gn = this.hive_numbers.game_numbers[title];
      } else {
        gn = {}
      }
      ctx.fillStyle = gn.visited ? this.bright_color : "#666";
      var y = start_y + 30 + 27 * i;
      ctx.fillText(real_title,260, y)

      ctx.fillStyle = gn.visited ? this.bright_color : "#666";
      if(this.hive_numbers.total_time[title] != undefined)
        ctx.fillText(utils.convertSecondsToTimeString(Math.floor(this.hive_numbers.total_time[title] / 1000)), 400, y)
      else {
        ctx.fillText('---', 400, y)
      }

      if(gn.deaths != undefined)
        ctx.fillText(gn.deaths, 540, y)
      else {
        ctx.fillText('---', 540, y)
      }
    }
  }

  ctx.font = '16px Open Sans'
  ctx.fillStyle = this.lite_color
  if(this.save_screen) {
    if(this.just_saved)
      ctx.fillText("PRESS ANY KEY FOR MAIN MENU", constants.levelWidth/2, constants.levelHeight - 30)
  } else if(this.victory) {
    ctx.fillText("PRESS ANY KEY TO CONTINUE", constants.levelWidth/2, constants.levelHeight - 30)
  } else {
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", constants.levelWidth/2, constants.levelHeight - 30)
  }

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].post_draw(ctx)
  }
  ctx.restore()

}

MainGameSummaryState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

MainGameSummaryState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MainGameSummaryState.prototype.on_key_down = function(keyCode) {
  if(this.transition_state=="none" && (!this.save_screen || this.just_saved)) {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }

}
MainGameSummaryState.prototype.on_key_up = function(keyCode) {
  if(keyCode == 16) {
    this.shift_held= false
  }
  if(keyCode == 17) {
    this.ctrl_held = false
  }
}

MainGameSummaryState.prototype.shift_down = function() {
  return (new Date()).getTime() - this.shift_down_time < 1000
}

MainGameSummaryState.prototype.ctrl_down = function() {
  return (new Date()).getTime() - this.ctrl_down_time < 1000
}

MainGameSummaryState.prototype.process = function(dt) {
  if (this.world_num == 0 && !this.save_screen) {
    this.go_to_next_state();
  }
}

MainGameSummaryState.prototype.resume_game = function() {
  saveData.clearSavedPlayerGame();
  game_engine.switch_game_state(gsKeys.MAIN_GAME_TRANSITION_STATE, {
    world_num: this.world_num,
    last_level: null,
    visibility_graph: null,
    hive_numbers: this.hive_numbers,
    loading_saved_game: true
  });
}

MainGameSummaryState.prototype.delete_game = function() {
  saveData.clearSavedPlayerGame();
  game_engine.switch_game_state(gsKeys.MAIN_GAME_TRANSITION_STATE, {
    world_num: 1,
    last_level: null,
    visibility_graph: null,
    hive_numbers: null,
    loading_saved_game: false
  });
}

MainGameSummaryState.prototype.check_quests = function() {
  if (this.world_num <= 0) return;

  if (saveData.difficultyMode == "normal" && this.hive_numbers.speed_run_countdown > 0) {
    saveData.setQuestCompleted("blitz_hive" + this.world_num);
  }

  if (!this.hive_numbers.hit) {
    saveData.setQuestCompleted("untouchable");
  }

  if(this.is_first_victory_over_world) {
    if (this.hive_numbers.world < 4) {
      saveData.setQuestCompleted("beat_hive")
    }

    if (this.hive_numbers.world == 4) {
      saveData.setQuestCompleted("final_boss")
    }
  }
}

MainGameSummaryState.prototype.exit_game = function() {
  game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
}

MainGameSummaryState.prototype.go_to_next_state = function() {
  if(this.victory) {
    if (this.world_num === 4 && this.is_first_victory_over_world) {
      game_engine.switch_game_state(gsKeys.CREDITS_STATE, {
        after_main_game: true,
        main_game_hive_numbers: this.hive_numbers,
        main_game_args: {
          victory: true,
          is_tutorial: this.world_num == 0,
          first_time_tutorial: saveData.firstTime,
          skipped: false,
          just_saved: this.just_saved
        }
      });
    } else {
      game_engine.switch_game_state(gsKeys.REWARD_GAME_STATE, {
        hive_numbers: this.hive_numbers,
        main_game: true,
        game_args: {
          victory: true,
          is_tutorial: this.world_num == 0,
          first_time_tutorial: saveData.firstTime,
          skipped: false,
          just_saved: this.just_saved
        }
      });
    }
  } else {
    game_engine.switch_game_state(gsKeys.REWARD_GAME_STATE, {
      hive_numbers: this.hive_numbers,
      main_game: true,
      game_args: {
        victory: false,
        is_tutorial: this.world_num == 0,
        first_time_tutorial: saveData.firstTime,
        skipped: false,
        just_saved: this.just_saved
      }
    });
  }
}

module.exports = MainGameSummaryState;
