ChallengeModeIntroState.prototype = new GameState

ChallengeModeIntroState.prototype.constructor = ChallengeModeIntroState

function ChallengeModeIntroState() {
  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
  this.buttons = [];
  this.buttons.push(new IconButton("BACK", 16, 70, dom.levelHeight/2+260, 60, 65, "white", impulse_colors["impulse_blue"], function(_this){return function(){
    _this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(new TitleState(true))
    });
  }}(this), "back"));
  this.buttons.push(new IconButton("CONTINUE", 16, dom.levelWidth - 70, dom.levelHeight/2+260, 60, 65,  "white", impulse_colors["impulse_blue"], function(_this){return function(){
    var i = 1;
    while(i < 4 && saveData.worldRankings[saveData.difficultyMode]["world "+i]) {
      i += 1
    }
    if(saveData.savedGame.game_numbers) {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new MainGameSummaryState(null, null, null, null, null, true));
      });
    } else {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new WorldMapState(i));
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
    layers.bgCanvas.setAttribute("style", "")
    draw_image_on_bg_ctx(bg_ctx, layers.titleBgCanvas, imp_params.bg_opacity)
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

  ctx.fillText("CHALLENGE MODE", dom.levelWidth/2, 150)
  renderUtils.drawSprite(ctx, dom.levelWidth/2, 210, 0, 60, 60, "white_flower")
  ctx.font = '18px Muli'
  ctx.fillText("CHALLENGE MODE IS A HARDER VERSION OF IMPULSE", dom.levelWidth/2, 300);
  ctx.fillText("FOR EXPERIENCED PLAYERS.", dom.levelWidth/2, 325);

  ctx.fillText("IF THIS IS YOUR FIRST TIME,", dom.levelWidth/2, 400);
  ctx.fillText("YOU MAY WANT TO TRY NORMAL MODE FIRST.", dom.levelWidth/2, 425);
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
