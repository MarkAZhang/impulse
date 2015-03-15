ChallengeModeIntroState.prototype = new GameState

ChallengeModeIntroState.prototype.constructor = ChallengeModeIntroState

function ChallengeModeIntroState() {
  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
  this.buttons = [];
  this.buttons.push(new IconButton("BACK", 16, 70, imp_params.levelHeight/2+260, 60, 65, "white", impulse_colors["impulse_blue"], function(_this){return function(){
    _this.fader.set_animation("fade_out", function() {
      switch_game_state(new TitleState(true))
    });
  }}(this), "back"));
  this.buttons.push(new IconButton("CONTINUE", 16, imp_params.levelWidth - 70, imp_params.levelHeight/2+260, 60, 65,  "white", impulse_colors["impulse_blue"], function(_this){return function(){
    var i = 1;
    while(i < 4 && imp_params.player_data.world_rankings[imp_params.player_data.difficulty_mode]["world "+i]) {
      i += 1
    }
    if(imp_params.player_data.save_data[imp_params.player_data.difficulty_mode].game_numbers) {
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new MainGameSummaryState(null, null, null, null, null, true));
      });
    } else {
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new WorldMapState(i));
      });
    }
  }}(this), "start"));
}


ChallengeModeIntroState.prototype.process = function(dt) {
  this.fader.process(dt);
  this.trailer_fade_in += dt
}


ChallengeModeIntroState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    imp_params.bg_canvas.setAttribute("style", "")
    draw_image_on_bg_ctx(bg_ctx, imp_params.title_bg_canvas, imp_params.bg_opacity)
    this.bg_drawn = true
  }

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  ctx.textAlign = "center"
  ctx.font = '32px Muli'
  ctx.fillStyle = "white"

  ctx.fillText("CHALLENGE MODE", imp_params.levelWidth/2, 150)
  drawSprite(ctx, imp_params.levelWidth/2, 210, 0, 60, 60, "white_flower")
  ctx.font = '18px Muli'
  ctx.fillText("CHALLENGE MODE IS A HARDER VERSION OF IMPULSE", imp_params.levelWidth/2, 300);
  ctx.fillText("FOR EXPERIENCED PLAYERS.", imp_params.levelWidth/2, 325);

  ctx.fillText("IF THIS IS YOUR FIRST TIME,", imp_params.levelWidth/2, 400);
  ctx.fillText("YOU MAY WANT TO TRY NORMAL MODE FIRST.", imp_params.levelWidth/2, 425);
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
}

ChallengeModeIntroState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

ChallengeModeIntroState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}
