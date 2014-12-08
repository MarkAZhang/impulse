var DarkOne = function(x, y, impulse_game_state, msg) {
  this.msg = msg;
  this.loc = {
    x: x / imp_vars.draw_factor,
    y: y / imp_vars.draw_factor
  };
  this.impulse_game_state = impulse_game_state;
  if (msg == "one") {
    this.aura_radius = 250;
  } else {
    this.aura_radius = 125;
  }

  this.display_msg = false;
  this.fade_ratio = 1;
  this.fade_time = 1000;
  this.visited = false;
};

DarkOne.prototype.final_draw = function (ctx) {
  if (this.fade && this.fade_ratio < 0) return;
  ctx.save();

  var ratio = this.fade ? bezier_interpolate(0.15, 0.85, this.fade_ratio) : 1;
  drawSprite(ctx, this.loc.x * imp_vars.draw_factor,
    this.loc.y * imp_vars.draw_factor,
    0, this.aura_radius * ratio, this.aura_radius * ratio, "dark_aura")
  if (this.msg === "one") {
    ctx.globalAlpha *= 0.1 * this.fade_ratio;
    drawSprite(ctx, this.loc.x * imp_vars.draw_factor,
      this.loc.y * imp_vars.draw_factor,
      0, 25, 25, "pink_one")
  }

  ctx.restore();
  if (this.display_msg) {
    ctx.save();
    ctx.globalAlpha *= 0.8;
    ctx.rect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    ctx.fillStyle = "#000";
    ctx.fill();
    if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 4) {
      ctx.globalAlpha *= 0.2;
      ctx.rect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight);
      ctx.fillStyle = "#f00";
      ctx.fill();
    }
    ctx.restore();
    this.draw_message(ctx);
  }
}

DarkOne.prototype.draw_message = function (ctx) {
  ctx.save();
  ctx.font = '20px Muli';
  ctx.textAlign = 'center';
  ctx.fillStyle = impulse_colors["rose"];
  if (this.msg == "one") {
    ctx.fillText('I\'ve told you a thousand times.', 400, 285);
    ctx.fillText('I don\'t need to be saved.', 400, 315);
  }
  if (this.msg == "two") {
    ctx.fillText('Spare yourself the pain.', 400, 285);
    ctx.fillText('Just leave me be.', 400, 315);
  }
  if (this.msg == "three" && this.impulse_game_state.level.dark_ones_visited == 1) {
    ctx.fillText('It\'s nice and numb here.', 400, 285);
    ctx.fillText('And everything is perfect.', 400, 315);
  }
  if (this.msg == "three" && this.impulse_game_state.level.dark_ones_visited == 2) {
    ctx.fillText('Get out. Don\'t bother me', 400, 285);
    ctx.fillText('with those naive Impulses.', 400, 315);
  }
  if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 1) {
    ctx.fillText('I don\'t need to be saved.', 400, 300);
  }
  if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 2) {
    ctx.fillText('I don\'t need to be saved.', 400, 300);
  }
  if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 3) {
    ctx.fillText('I DON\'T NEED TO BE SAVED', 400, 300);
  }
  if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 4) {
    ctx.fillStyle = "red";
    ctx.fillText('I will crush you into the Void.', 400, 300);
  }
  ctx.restore();
};

DarkOne.prototype.process = function (dt) {
  if (this.fade && this.fade_ratio < 0) return;
  if (p_dist(this.impulse_game_state.player.body.GetPosition(), this.loc) < this.aura_radius / imp_vars.draw_factor * this.fade_ratio * 0.4) {
    this.display_msg = true;
    imp_vars.dark_one_speaks = true;
    if (!this.visited) {
      this.visited = true;
      this.impulse_game_state.level.dark_ones_visited += 1;
    }
  } else if (this.display_msg == true) {
    this.fade = true;
    this.display_msg = false;
    imp_vars.dark_one_speaks = false;
  }

  if (this.fade && this.fade_ratio > 0) {
    this.fade_ratio -= dt / this.fade_time;
  }
}