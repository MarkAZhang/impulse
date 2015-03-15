var DarkOne = function(x, y, impulse_game_state, msg, radius, fade_in) {
  this.msg = msg;
  this.loc = {
    x: x / imp_params.draw_factor,
    y: y / imp_params.draw_factor
  };
  this.impulse_game_state = impulse_game_state;
  this.aura_radius = radius;

  this.display_msg = false;
  this.fade_ratio = 1;
  this.fade_time = 1000;
  this.visited = false;
  this.fade_out = false;
  this.explode_out = false;
  this.fade_in = fade_in;
  if (this.fade_in) {
    this.fade_ratio = 0;
  }
  this.new_loc = null;
  this.moving = false;
  this.moving_interval = 0;
  this.moving_timer = 0;
  this.opacity = 1;
  this.explode = false;
};

DarkOne.prototype.draw = function (ctx) {

}

DarkOne.prototype.move_to = function (x, y, dur) {
  this.moving = true;
  this.moving_interval = dur;
  this.moving_timer = dur;
  this.old_loc = {
    x: this.loc.x,
    y: this.loc.y
  };
  this.new_loc = {
    x: x / imp_params.draw_factor,
    y: y / imp_params.draw_factor
  };
}

DarkOne.prototype.final_draw = function (ctx) {
  if (this.fade_out && this.fade_ratio < 0 ) return;
  if (this.explode_out) return;
  ctx.save();

  var ratio = this.fade_out || this.fade_in ? bezier_interpolate(0.15, 0.85, this.fade_ratio) : 1;
  ctx.globalAlpha *= this.opacity;
  drawSprite(ctx, this.loc.x * imp_params.draw_factor,
    this.loc.y * imp_params.draw_factor,
    0, this.aura_radius * ratio, this.aura_radius * ratio, "dark_aura")

  ctx.restore();
  if (this.display_msg) {
    ctx.save();
    ctx.globalAlpha *= 0.8;
    ctx.rect(0, 0, imp_params.levelWidth, imp_params.levelHeight);
    ctx.fillStyle = "#000";
    ctx.fill();
    if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 4) {
      ctx.globalAlpha *= 0.1;
      ctx.rect(0, 0, imp_params.levelWidth, imp_params.levelHeight);
      ctx.fillStyle = "#f00";
      ctx.fill();
    }
    ctx.restore();
    this.draw_message(ctx);
  }
}

DarkOne.prototype.draw_message = function (ctx) {
  ctx.save();
  ctx.globalAlpha *= 0.3;
  drawSprite(ctx, 400, 300, 0, 400, 200, "white_glow")
  ctx.restore();
  ctx.save();
  ctx.font = '20px Muli';
  ctx.textAlign = 'center';
  ctx.fillStyle = "black";
  if (this.msg == "one") {
    ctx.fillText('I\'ve told you a thousand times.', 400, 285);
    ctx.fillText('I don\'t need to be saved.', 400, 315);
    //ctx.fillText('Spare yourself the pain.', 400, 315);
    //ctx.fillText('Just leave me be.', 400, 345);
  }
  /* if (this.msg == "two") {
    ctx.fillText('Spare yourself the pain.', 400, 285);
    ctx.fillText('Just leave me be.', 400, 315);
  } */
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
    ctx.fillText('I don\'t need to be saved.', 400, 300);
  }
  if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 4) {
    ctx.fillStyle = "red";
    ctx.fillText('I will crush you into the Void.', 400, 300);
  }
  if (this.msg == "hive_one_open") {
    ctx.fillText('I\'m not scared, I swear.', 400, 285);
    ctx.fillText('I\'m fine with how things are.', 400, 315);
  }
  if (this.msg == "hive_one_close") {
    ctx.save();
    ctx.globalAlpha *= 0.3;
    ctx.fillText('Are you who I could have been?', 400, 300);
    ctx.restore();
  }
  if (this.msg == "hive_two_open") {
    ctx.fillText('A little more can\'t hurt, right?', 400, 285);
    ctx.fillText('It will bring me joy.', 400, 315);
  }

  if (this.msg == "hive_two_close") {
    ctx.save();
    ctx.globalAlpha *= 0.3;
    ctx.fillText('Where has all my time gone?', 400, 300);
    ctx.restore();
  }

  if (this.msg == "hive_three_open") {
    ctx.fillText('Oh, I\'m aware.', 400, 285);
    ctx.fillText('I just don\'t care enough.', 400, 315);
  }

  if (this.msg == "hive_three_close") {
    ctx.save();
    ctx.globalAlpha *= 0.3;
    ctx.fillText('Why do I feel so hollow?', 400, 300);
    ctx.restore();
  }

  if (this.msg == "hive_four_open") {
    ctx.fillText('I\'m not wrong. You\'re wrong.', 400, 285);
    ctx.fillText('And I will make you vanish.', 400, 315);
  }

  if (this.msg == "hive_four_close") {
    ctx.save();
    ctx.globalAlpha *= 0.3;
    ctx.fillText('???', 400, 300);
    ctx.restore();
  }
  ctx.restore();
};

DarkOne.prototype.process = function (dt) {
  if (this.fade_out && this.fade_ratio < 0) return;
  if (this.explode_out) return;
  if (!this.moving && p_dist(this.impulse_game_state.player.body.GetPosition(), this.loc) < this.aura_radius / imp_params.draw_factor * this.fade_ratio * 0.4) {
    this.display_msg = true;
    imp_params.dark_one_speaks = true;
    if (!this.visited) {
      this.visited = true;
      this.impulse_game_state.level.dark_ones_visited += 1;
      var volume;
      if (this.msg.substring(this.msg.length - 5, this.msg.length) === "close") {
        volume = 50;
      }
      if (this.msg == "four" && this.impulse_game_state.level.dark_ones_visited == 4) {
        imp_params.impulse_music.play_sound("dark_anger", volume);
      } else {
        imp_params.impulse_music.play_sound("dark_diag", volume);
      }
      this.bg_volume = imp_params.player_data.options.bg_music_volume;
      imp_params.impulse_music.change_bg_volume(this.bg_volume * 0.1, false);
    }
  } else if (this.display_msg == true) {
    if (!this.explode) {
      this.fade_out = true;
    } else {
      this.explode_out = true;
      this.impulse_game_state.level.add_fragments(
        "dark_one", this.loc, {x: 0, y: 0} /* velociy */);
    }
    this.display_msg = false;
    imp_params.dark_one_speaks = false;
    imp_params.impulse_music.change_bg_volume(this.bg_volume, false);
  }

  if (this.fade_out && this.fade_ratio > 0) {
    this.fade_ratio -= dt / this.fade_time;
  }
  if (this.fade_in && this.fade_ratio < 1) {
    this.fade_ratio += dt / this.fade_time;
    if (this.fade_ratio >= 1) {
      this.fade_ratio = 1;
      this.fade_in = false;
    }
  }

  if (this.moving) {
    this.moving_timer -= dt;
    var prog = bezier_interpolate(0.15, 0.3, Math.max(0, this.moving_timer / this.moving_interval));
    this.loc = {
      x: this.old_loc.x * prog + this.new_loc.x * (1 - prog),
      y: this.old_loc.y * prog + this.new_loc.y * (1 - prog)
    };
    if (this.moving_timer < 0) {
      this.moving = false;
    }

  }
}

DarkOne.prototype.dispose = function () {
  if (this.display_msg == true) {
    imp_params.impulse_music.change_bg_volume(this.bg_volume, false);
  }
}
