var constants = require('../data/constants.js');
var game_engine = require('../core/game_engine.js');
var graphics = require('../core/graphics.js');
var gsKeys = constants.gsKeys;
var spriteData = require('../data/sprite_data.js');
var uiRenderUtils = require('../render/ui.js');

var Background = require('../render/background.js');
var Fader = require('../game_states/fader_util.js');
var GameState = require('../game_states/game_state.js');
var IconButton = require('../ui/icon_button.js');

CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState(opts) {
  // after_main_game
  // main_game_hive_numbers
  // main_game_args

  this.after_main_game = opts.after_main_game;
  this.main_game_hive_numbers = opts.main_game_hive_numbers;
  this.main_game_args = opts.main_game_args;
  this.bg_drawn = false
  this.start_clicked = false
  this.buttons = []
  var _this = this


  this.buttons.push(new IconButton("KEVIN MACLEOD", 16, constants.levelWidth/2 - 250, constants.levelHeight/2, 150, 70, "white", constants.colors["impulse_blue"], function(){window.open("http://incompetech.com")}, "note"))
  this.buttons.push(new IconButton("MATT MCFARLAND", 16, constants.levelWidth/2, constants.levelHeight/2, 150, 70, "white", constants.colors["impulse_blue"], function(){window.open("http://www.mattmcfarland.com")}, "note"))
  this.buttons.push(new IconButton("SUBTLE PATTERNS", 16, constants.levelWidth/2 + 250, constants.levelHeight/2, 150, 70, "white", constants.colors["impulse_blue"], function(){window.open("http://www.subtlepatterns.com")}, "texture"))
  this.buttons.push(new IconButton("JAY SALVAT", 16, constants.levelWidth/2 - 150, constants.levelHeight/2+130, 150, 70, "white", constants.colors["impulse_blue"], function(){window.open("http://buzz.jaysalvat.com/")}, "audio"))
  this.buttons.push(new IconButton("ERIN CATTO", 16, constants.levelWidth/2 + 150, constants.levelHeight/2+130, 150, 70, "white", constants.colors["impulse_blue"], function(){window.open("http://box2d.org/")}, "physics_engine"))
  this.buttons[0].extra_text = "MAIN MENU MUSIC"
  this.buttons[1].extra_text = "ALL OTHER MUSIC"
  this.buttons[2].extra_text = "TEXTURES"
  this.buttons[3].extra_text = "AUDIO API"
  this.buttons[4].extra_text = "PHYSICS ENGINE"

  if (!this.after_main_game) {
    this.buttons.push(new IconButton("BACK", 16, constants.levelWidth/2, constants.levelHeight/2 + 260, 60, 65, "white", constants.colors["impulse_blue"], function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
      });
    }, "back"))
  }

  this.fader = new Fader({
    "fade_in": 250,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
}

CreditsState.prototype.process = function(dt) {
  this.fader.process(dt);
}

CreditsState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    game_engine.setBg(graphics.menuBackground);
    this.bg_drawn = true
  }

  ctx.save()

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  ctx.font = '32px Open Sans'
  ctx.fillStyle = 'white'
  ctx.textAlign = "center"
  ctx.shadowColor = ctx.fillStyle
  ctx.fillText("CREATED BY MARK ZHANG", constants.levelWidth/2, 150)
  ctx.font = '16px Open Sans'
  ctx.fillText("WITH CREDIT TO", constants.levelWidth/2, 230)
  if (this.after_main_game) {
    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.font = '16px Open Sans'
    ctx.fillStyle = constants.colors["impulse_blue"];
    ctx.fillText("PRESS ANY KEY TO CONTINUE", constants.levelWidth/2, constants.levelHeight - 30);
    ctx.restore();
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.restore();
}

CreditsState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

CreditsState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

CreditsState.prototype.on_key_down = function (keyCode) {
  if (this.after_main_game) {
    var _this = this;
    this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(gsKeys.REWARD_GAME_STATE, {
        hive_numbers: _this.main_game_hive_numbers,
        main_game: true,
        game_args: _this.main_game_args
      });
    });
  }
}

module.exports = CreditsState;
