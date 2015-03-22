var constants = require('../data/constants.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var iconRenderUtils = require('../render/icons.js');
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var levelPreviewRenderUtils = require('../render/level_preview.js');
var saveData = require('../load/save_data.js');
var spriteData = require('../data/sprite_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var EnemyBox = require('../ui/dialog_boxes.js').EnemyBox;
var Fader = require('../game_states/fader_util.js');
var HiveNumbers = require('../load/hive_numbers.js');
var IconButton = require('../ui/icon_button.js');
var LoaderGameState = require('../game_states/loader_game_state.js');
var SmallEnemyButton = require('../ui/small_enemy_button.js');

LevelIntroState.prototype = new LoaderGameState

LevelIntroState.prototype.constructor = LevelIntroState

function LevelIntroState(opts) {
  // level_name
  // world
  this.level_name = opts.level_name
  this.buttons = []
  this.world_num = opts.world
  this.bg_drawn = false

  this.color = constants.colors['world '+ this.world_num + ' lite']
  this.bright_color = constants.colors['world '+ this.world_num + ' bright']

  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"

  this.buttons.push(new IconButton("BACK", 16, 70, constants.levelHeight/2+260, 60, 65, this.bright_color, "white", function(_this){return function(){
    // When the back button is pressed, draw the world-specific background on the bg_ctx and show it.
    layers.bgCtx.fillStyle =  constants.colors["world "+_this.world_num+" dark"]
    layers.bgCtx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
    layers.bgCtx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)
    layers.bgCtx.globalAlpha *= uiRenderUtils.getBgOpacity(0);
    uiRenderUtils.tessellateBg(layers.bgCtx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive "+_this.world_num)
    layers.bgCtx.translate(-constants.sideBarWidth, 0)//allows us to have a topbar
    layers.bgCanvas.setAttribute("style", "")


    _this.fader.set_animation("fade_out_to_main", function() {
      if(_this.world_num) {
        game_engine.switch_game_state(gsKeys.WORLD_MAP_STATE, {
          world: _this.world_num,
          is_practice_mode: true
        });
      }
      else {
        game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
      }
      // TODO: transition the bg.
      if (saveData.difficultyMode == "normal") {
        game_engine.setBg("Title Alt" + _this.world_num, uiRenderUtils.getWorldMapBgOpacity(_this.world_num))
      } else {
        game_engine.setBg("Hive 0", spriteData.hive0_bg_opacity)
      }
    });
  }}(this), "back"))

  this.drawn_enemies = null

  if(this.is_boss_level) {
    this.drawn_enemies = {}
  }
  else {
    this.drawn_enemies = levelData[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in levelData[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40

  this.level = this.load_level(levelData[this.level_name])

  var num_row = 12

  var i = 0

  for(var j in this.drawn_enemies) {

    var k = 0
    var num_in_this_row = 0

    while(k < i+1 && k < this.num_enemy_type) {
      k+=num_row
    }

    if(k <= this.num_enemy_type) {
      num_in_this_row = num_row
    }
    else {
      num_in_this_row = this.num_enemy_type - (k - num_row)
    }
    var diff = (i - (k - num_row)) - (num_in_this_row - 1)/2

    var h_diff = Math.floor(i/num_row) - (Math.ceil(this.num_enemy_type/num_row) - 1)/2

    var cur_x =  constants.levelWidth/2 + (this.enemy_image_size+10) * diff
    var cur_y = 400 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, constants.colors["world "+this.world_num+" lite"],
      (function(enemy, _this) { return function() {
        _this.fader.set_animation("fade_out", function() {
          game_engine.set_dialog_box(new EnemyBox(enemy, _this))
        });
      }})(j, this)
      ))

    i+=1
  }

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250,
    "fade_out_to_main": 250
  });
  this.fader.set_animation("fade_in");
}

LevelIntroState.prototype.process = function(dt) {
  this.fader.process(dt);
  game_engine.processAndDrawBg(dt);
}


LevelIntroState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    var world_bg_ctx = layers.worldMenuBgCanvas.getContext('2d')
    world_bg_ctx.clearRect(0, 0, constants.levelWidth, constants.levelHeight);
    uiRenderUtils.tessellateBg(world_bg_ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive "+this.world_num)
    bg_ctx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    this.bg_drawn = true
    bg_ctx.translate(-constants.sideBarWidth, 0)
    bg_canvas.setAttribute("style", "display:none")
  }

  if (this.fader.get_current_animation() != "fade_out_to_main") {
    ctx.save()
    ctx.fillStyle = constants.colors["world "+this.world_num+" dark"]
    ctx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)
    ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num);
    ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)
    ctx.restore()
  } else {
    ctx.save()
    ctx.globalAlpha *= this.fader.get_animation_progress();
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)
    ctx.globalAlpha *= uiRenderUtils.getBgOpacity(0);
    ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, constants.levelWidth, constants.levelHeight, 0, 0, constants.levelWidth, constants.levelHeight)
    ctx.restore()
  }
  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out" || this.fader.get_current_animation() == "fade_out_to_main") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }
  if (!this.is_boss_level) {
    ctx.globalAlpha /= 3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, 130, 40, true)
    ctx.globalAlpha *= 3

    ctx.fillStyle = "white"
    ctx.font = '18px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.fillText("HARD MODE", constants.levelWidth/2, 100)
    }

    ctx.beginPath()
    ctx.fillStyle = constants.colors['world '+ this.world_num + ' bright']
    ctx.font = '30px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.level_name, constants.levelWidth/2, 140)
    ctx.fill()

    for(var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].draw(ctx)
    }

    levelPreviewRenderUtils.drawLevelObstaclesWithinRect(ctx, this.level_name, constants.levelWidth/2, 255, 200, 150, constants.colors['world '+ this.world_num + ' lite'])
    ctx.beginPath()
    ctx.rect(constants.levelWidth/2 - 100, 100, 250, 150)

    ctx.strokeStyle = "rgba(0, 0, 0, .3)"
    ctx.stroke()

    if (this.load_percentage < 1) {

      ctx.textAlign = 'center'
      iconRenderUtils.drawLoadingIcon(ctx, constants.levelWidth - 70, constants.levelHeight - 53, 20, "gray", this.load_percentage)
      ctx.font = '16px Muli'
      ctx.fillStyle = "gray"
      ctx.fillText("LOADING", constants.levelWidth - 70, constants.levelHeight - 19)
    }

    ctx.fillStyle = this.bright_color
    ctx.font = '12px Muli'
    ctx.fillText("ENEMIES",  constants.levelWidth/2, 370)

    ctx.fillStyle = this.bright_color
    ctx.textAlign = 'center'

    ctx.font = '12px Muli'
    ctx.fillText("HIGH SCORE", constants.levelWidth/2 - 100, 480)
    ctx.font = '28px Muli'
    ctx.fillText(saveData.getLevelData(this.level_name).high_score,
     constants.levelWidth/2 - 100, 505)


    ctx.fillStyle = this.bright_color
    ctx.font = '12px Muli'
    ctx.fillText("BEST TIME", constants.levelWidth/2 + 100, 480)
    if (saveData.getLevelData(this.level_name).best_time < 1000) {
      ctx.font = '28px Muli'
      ctx.fillText(utils.convertSecondsToTimeString(saveData.getLevelData(this.level_name).best_time),
       constants.levelWidth/2 + 100, 505)
    } else {
      ctx.font = '24px Muli'
      ctx.fillText("UNDEFEATED", constants.levelWidth/2 + 100, 505)
    }
  } else {

    ctx.fillStyle = constants.colors['world '+ this.world_num + ' bright']
    ctx.textAlign = 'center'

    ctx.font = '42px Muli'
    ctx.shadowBlur = 0;
    ctx.save();
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, constants.levelWidth/2, constants.levelHeight/2 - 50, 100)
    ctx.restore();
    ctx.font = '16px Muli'
    ctx.fillText(this.level.level_name, constants.levelWidth/2, constants.levelHeight/2 - 60)
    ctx.font = '40px Muli'
    ctx.fillText(levelData.bossNames[this.world_num], constants.levelWidth/2, constants.levelHeight/2 - 20)
    ctx.font = '24px Muli'

    if(saveData.getLevelData(this.level_name).best_time < 1000) {
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", constants.levelWidth/2, 390)
      ctx.font = '28px Muli'
      ctx.fillText(utils.convertSecondsToTimeString(saveData.getLevelData(this.level_name).best_time), constants.levelWidth/2, 415)
    } else {
      ctx.fillStyle = constants.colors['boss '+ this.world_num]
      ctx.fillText("UNDEFEATED",  constants.levelWidth/2, 400)
    }

    for(var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].draw(ctx)
    }
  }
  ctx.restore();
}

LevelIntroState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

LevelIntroState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

LevelIntroState.prototype.load_complete = function() {
  var hive_numbers = new HiveNumbers(this.world_num, false)
  this.buttons.push(new IconButton("START", 16, constants.levelWidth - 70, constants.levelHeight/2 + 260, 100, 65, this.bright_color, "white", function(_this){
    return function(){
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
  }(this), "start"))
}

module.exports = LevelIntroState;
