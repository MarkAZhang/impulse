QuestGameState.prototype = new GameState

QuestGameState.prototype.constructor = QuestGameState

function QuestGameState() {
  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
  this.buttons = [];
  this.buttons.push(new IconButton("BACK", 16, dom.levelWidth/2, dom.levelHeight/2+260, 60, 65, "white", impulse_colors["impulse_blue"], function(_this){return function(){
    _this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(new TitleState(true))
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
  this.buttons.push(new QuestButton("beat_hive", dom.levelWidth/2 - 2 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("final_boss", dom.levelWidth/2 - 1 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("high_roller", dom.levelWidth/2 + 0 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("pacifist", dom.levelWidth/2 + 1 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("untouchable", dom.levelWidth/2 + 2 * first_row_gap, first_row_x, quest_size, quest_size));

  var second_row_x = 350;
  var second_row_gap = 150;
  this.buttons.push(new QuestButton("beat_hard", dom.levelWidth/2 - 2 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive1", dom.levelWidth/2 - 1 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive2", dom.levelWidth/2 - 0 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive3", dom.levelWidth/2 + 1 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive4", dom.levelWidth/2 + 2 * second_row_gap, second_row_x, quest_size, quest_size));
}


QuestGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    layers.bgCanvas.setAttribute("style", "")
    game_engine.setBg("Hive 0", spriteData.hive0_bg_opacity);
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

  ctx.fillText("ACHIEVEMENTS", dom.levelWidth/2, 50)
  ctx.font = '12px Muli'
  ctx.fillText("MOUSE OVER TO VIEW", dom.levelWidth/2, 75)

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
