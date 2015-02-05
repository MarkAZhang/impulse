IntroState.prototype = new GameState

IntroState.prototype.constructor = IntroState

function IntroState(last_state) {

  imp_vars.impulse_music.play_bg(imp_params.songs["Menu"])
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
      switch_game_state(new TitleState());
    }
    this.fader.set_animation(this.fade_states[this.fade_state_index]);
  }
}

IntroState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    imp_vars.bg_canvas.setAttribute("style", "")
    set_bg("Hive 0", imp_vars.hive0_bg_opacity)
    this.bg_drawn = true
  }

  ctx.save()

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }
  ctx.font = '16px Muli'
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.textAlign = "center"
  ctx.shadowColor = ctx.fillStyle
  ctx.fillText("CREATED BY", imp_vars.levelWidth/2, 200)
  draw_porcelain_logo(ctx, 400, 300);
  ctx.restore()
}

