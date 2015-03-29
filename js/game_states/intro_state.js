var audioData = require('../data/audio_data.js');
var constants = require('../data/constants.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var music_player = require('../core/music_player.js');
var spriteData = require('../data/sprite_data.js');
var uiRenderUtils = require('../render/ui.js');

var Background = require('../render/background.js');
var Fader = require('../game_states/fader_util.js');
var GameState = require('../game_states/game_state.js');

IntroState.prototype = new GameState

IntroState.prototype.constructor = IntroState

function IntroState() {
  music_player.play_bg(audioData.songs["Menu"])
  this.bg_drawn = false;
  this.fader = new Fader({
    "fade_in": 1000,
    "pause": 500,
    "fade_out": 1000
  });
  this.fade_states = ["fade_in", "pause", "fade_out"]
  this.fade_state_index = 0;
  this.fader.set_animation(this.fade_states[this.fade_state_index]);
}

IntroState.prototype.process = function(dt) {
  this.fader.process(dt);
  if(this.fader.animation === null) {
    this.fade_state_index += 1;
    if (this.fade_state_index >= this.fade_states.length) {
      game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
    }
    this.fader.set_animation(this.fade_states[this.fade_state_index]);
  }
}

IntroState.prototype.draw = function(ctx, bg_ctx) {
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
  ctx.font = '16px Muli'
  ctx.fillStyle = constants.colors["impulse_blue"]
  ctx.textAlign = "center"
  ctx.shadowColor = ctx.fillStyle
  ctx.fillText("CREATED BY", constants.levelWidth/2, 200)
  uiRenderUtils.drawPorcelainLogo(ctx, 400, 300);
  ctx.restore()
}

module.exports = IntroState;
