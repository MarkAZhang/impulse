var constants = require('../data/constants.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var layers = require('../core/layers.js');
var spriteData = require('../data/sprite_data.js');

var Background = require('../render/background.js');
var Fader = require('../game_states/fader_util.js');
var GameState = require('../game_states/game_state.js');
var IconButton = require('../ui/icon_button.js');
var QuestButton = require('../ui/quest_button.js');

QuestGameState.prototype = new GameState

QuestGameState.prototype.constructor = QuestGameState

function QuestGameState() {
  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
  this.buttons = [];
  this.buttons.push(new IconButton("BACK", 16, constants.levelWidth/2, constants.levelHeight/2+260, 60, 65, "white", constants.colors["impulse_blue"], function(_this){return function(){
    _this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
    });
  }}(this), "back"));
  this.set_up_quests();
}


QuestGameState.prototype.process = function(dt) {
  this.fader.process(dt);
  this.trailer_fade_in += dt
}

QuestGameState.prototype.set_up_quests = function() {
  var quest_size = 50;

  var first_row_x = 200;
  var first_row_gap = 150;
  this.buttons.push(new QuestButton("beat_hive", constants.levelWidth/2 - 2 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("final_boss", constants.levelWidth/2 - 1 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("high_roller", constants.levelWidth/2 + 0 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("pacifist", constants.levelWidth/2 + 1 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("untouchable", constants.levelWidth/2 + 2 * first_row_gap, first_row_x, quest_size, quest_size));

  var second_row_x = 350;
  var second_row_gap = 150;
  this.buttons.push(new QuestButton("beat_hard", constants.levelWidth/2 - 2 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive1", constants.levelWidth/2 - 1 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive2", constants.levelWidth/2 - 0 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive3", constants.levelWidth/2 + 1 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive4", constants.levelWidth/2 + 2 * second_row_gap, second_row_x, quest_size, quest_size));
}


QuestGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    layers.bgCanvas.setAttribute("style", "")
    game_engine.setBg(new Background(constants.colors['menuBg'], "Hive 0", spriteData.menuBgOpacity));
    this.bg_drawn = true
  }

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  ctx.textAlign = "center"
  ctx.font = '24px Muli'
  ctx.fillStyle = "white"

  ctx.fillText("ACHIEVEMENTS", constants.levelWidth/2, 50)
  ctx.font = '12px Muli'
  ctx.fillText("MOUSE OVER TO VIEW", constants.levelWidth/2, 75)

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].post_draw(ctx)
  }
}

QuestGameState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

QuestGameState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

module.exports = QuestGameState;
