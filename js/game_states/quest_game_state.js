QuestGameState.prototype = new GameState

QuestGameState.prototype.constructor = QuestGameState

function QuestGameState() {
  this.cur_start_lives = calculate_lives()
  this.cur_start_ult = calculate_ult()
  this.cur_start_spark_val = calculate_spark_val()
  this.has_ult = has_ult();
  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });  
  this.fader.set_animation("fade_in");
  this.buttons = [];
  this.buttons.push(new IconButton("BACK", 16, 70, imp_vars.levelHeight/2+260, 60, 65, "white", impulse_colors["impulse_blue"], function(_this){return function(){
    _this.fader.set_animation("fade_out", function() {
      switch_game_state(new TitleState(true))
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

  var first_row_x = 150;
  var first_row_gap = 150;
  this.buttons.push(new QuestButton("beat_hive", imp_vars.levelWidth/2 - 2 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("final_boss", imp_vars.levelWidth/2 - 1 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("first_gold", imp_vars.levelWidth/2 + 0 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("pacifist", imp_vars.levelWidth/2 + 1 * first_row_gap, first_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("high_roller", imp_vars.levelWidth/2 + 2 * first_row_gap, first_row_x, quest_size, quest_size));
  
  var second_row_x = 300;
  var second_row_gap = 150;
  this.buttons.push(new QuestButton("blitz_hive1", imp_vars.levelWidth/2 - 1.5 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive2", imp_vars.levelWidth/2 - 0.5 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive3", imp_vars.levelWidth/2 + 0.5 * second_row_gap, second_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("blitz_hive4", imp_vars.levelWidth/2 + 1.5 * second_row_gap, second_row_x, quest_size, quest_size));


  var third_row_x = 450;
  var third_row_gap = 150;

  this.buttons.push(new QuestButton("1star", imp_vars.levelWidth/2 - 1 * third_row_gap, third_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("2star", imp_vars.levelWidth/2 + 0 * third_row_gap, third_row_x, quest_size, quest_size));
  this.buttons.push(new QuestButton("3star", imp_vars.levelWidth/2 + 1 * third_row_gap, third_row_x, quest_size, quest_size));
}


QuestGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    imp_vars.bg_canvas.setAttribute("style", "")
    set_bg("Hive 0", imp_vars.bg_opacity);
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

  ctx.fillText("CHALLENGES", imp_vars.levelWidth/2, 50)
  ctx.font = '12px Muli'
  ctx.fillText("MOUSE OVER TO VIEW", imp_vars.levelWidth/2, 75)
  draw_lives_and_sparks(ctx,
    this.cur_start_lives, this.cur_start_spark_val, this.cur_start_ult,
    imp_vars.levelWidth / 2, 
    imp_vars.levelHeight - 50, 
    15, 
    {labels: true, ult: this.has_ult, lives: true, sparks: true, starting_values: true})
  /*drawSprite(ctx, imp_vars.levelWidth/2, 210, 0, 60, 60, "ultimate_icon")
  ctx.font = '18px Muli'
  ctx.fillText("CHALLENGE MODE IS A HARDER VERSION OF IMPULSE", imp_vars.levelWidth/2, 300);
  ctx.fillText("FOR EXPERIENCED PLAYERS.", imp_vars.levelWidth/2, 325);
  
  ctx.fillText("IF THIS IS YOUR FIRST TIME,", imp_vars.levelWidth/2, 400);
  ctx.fillText("YOU MAY WANT TO TRY NORMAL MODE FIRST.", imp_vars.levelWidth/2, 425);*/
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