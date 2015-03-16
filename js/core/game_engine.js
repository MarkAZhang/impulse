
var GameEngine = function() {
    this.cur_game_state = null;
    this.cur_dialog_box = null;
    this.cur_popup_message = null;
};

GameEngine.prototype.switch_game_state = function (game_state) {
  if (this.cur_game_state) {
    this.cur_game_state.dispose();
  }
  this.cur_game_state = game_state
};


GameEngine.prototype.step = function () {
  var cur_time = (new Date()).getTime()
  imp_params.ctx.globalAlpha = 1;
  dt = cur_time - imp_params.last_time
  if (this.cur_dialog_box != null) {
    this.cur_dialog_box.process(dt);
  }
  if (this.cur_popup_message != null) {
    this.process_popup_message(dt)
  }

  if(!(this.cur_game_state instanceof ImpulseGameState)) {
    imp_params.ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if(this.cur_game_state instanceof ImpulseGameState &&  this.cur_game_state.ready) {
    if(this.cur_game_state.zoom != 1) {
      imp_params.ctx.fillStyle= this.cur_game_state.dark_color;
      imp_params.ctx.fillRect(imp_params.sidebarWidth, 0, imp_params.levelWidth, imp_params.levelHeight);
    } else {
      imp_params.ctx.clearRect(imp_params.sidebarWidth, 0, imp_params.levelWidth, imp_params.levelHeight);
    }

  }

  if (this.cur_game_state) {
    this.cur_game_state.process(dt)
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      imp_params.ctx.fillStyle = "black"
      imp_params.ctx.fillRect(0, 0, imp_params.sidebarWidth, imp_params.canvasHeight);
      imp_params.ctx.fillRect(imp_params.canvasWidth - imp_params.sidebarWidth, 0, imp_params.sidebarWidth, imp_params.canvasHeight);
      imp_params.ctx.translate(imp_params.sidebarWidth, 0)//allows us to have a topbar
      this.cur_game_state.draw(imp_params.ctx, imp_params.bg_ctx);
      imp_params.ctx.translate(-imp_params.sidebarWidth, 0)//allows us to have a topbar
    } else {
      this.cur_game_state.draw(imp_params.ctx, imp_params.bg_ctx);
      imp_params.ctx.save()
      this.cur_game_state.set_zoom_transparency(imp_params.ctx)
      imp_params.ctx.restore()
    }
  }


  if(this.cur_dialog_box!=null) {
    imp_params.ctx.save();
    imp_params.ctx.globalAlpha = 1
    this.cur_dialog_box.draw(imp_params.ctx)
    imp_params.ctx.restore();
  }

  if (this.cur_popup_message != null) {
    this.draw_popup_message(imp_params.ctx)
  }

  imp_params.last_time = cur_time
  var temp_dt = (new Date()).getTime() - cur_time
  var _this = this;
  imp_params.step_id = setTimeout(function () {
    _this.step()
  }, Math.max(33 - temp_dt, 1))
};


GameEngine.prototype.set_dialog_box = function(box) {
  this.cur_dialog_box = box
};

GameEngine.prototype.clear_dialog_box = function() {
  this.cur_dialog_box = null
};

GameEngine.prototype.set_popup_message = function(type, duration, color, world_num) {
  this.cur_popup_message = new MessageBox(type, color ? color : "white", world_num ? world_num : 0);
  this.cur_popup_message.set_position(imp_params.canvasWidth/2, imp_params.canvasHeight - 10 - this.cur_popup_message.h)
  this.cur_popup_message.set_visible(true)
  this.cur_popup_duration = duration;
  this.cur_popup_timer = duration;
};

GameEngine.prototype.process_popup_message = function(dt) {
  this.cur_popup_timer -= dt;
  if (this.cur_popup_timer < 0) {
    this.cur_popup_message = null;
  }
};

GameEngine.prototype.draw_popup_message = function(ctx) {
  ctx.save();
  var prog = this.cur_popup_timer / this.cur_popup_duration;
  if (prog < 0.2) {
    ctx.globalAlpha *= prog * 5;
  } else if (prog > 0.9) {
    ctx.globalAlpha *= 10 * (1 - prog)
  } else {
    ctx.globalAlpha = 1
  }
  this.cur_popup_message.draw(ctx);
  ctx.restore();
};

GameEngine.prototype.toggle_pause = function () {
  if (this.cur_game_state instanceof ImpulseGameState) {
    this.cur_game_state.toggle_pause()
  }
}

GameEngine.prototype.on_mouse_move = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_mouse_move(mPos.x, mPos.y)
  }

  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_mouse_move(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_mouse_move(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_mouse_down = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_mouse_down(mPos.x, mPos.y)
    return
  }
  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_mouse_down(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_mouse_down(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_right_mouse_down = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_right_mouse_down(mPos.x, mPos.y)
    return
  }
  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_right_mouse_down(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_right_mouse_down(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_mouse_up = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_mouse_up(mPos.x, mPos.y)
    return
  }
  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_mouse_up(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_mouse_up(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_right_mouse_up = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_right_mouse_up(mPos.x, mPos.y)
    return
  }
  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_right_mouse_up(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_right_mouse_up(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_click = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_click(mPos.x, mPos.y)
    return
  }
  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_click(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_click(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_right_click = function(mPos) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_right_click(mPos.x, mPos.y)
    return
  }
  if (this.cur_game_state) {
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      this.cur_game_state.on_right_click(mPos.x - imp_params.sidebarWidth, mPos.y)
    } else {
      this.cur_game_state.on_right_click(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_key_down = function(keyCode) {
  if(keyCode == controls.keys.GOD_MODE_KEY && imp_params.debug.god_mode_enabled) { //G = god mode
    if (imp_params.debug.god_mode == false) {
      imp_params.debug.god_mode = true
      this.set_popup_message("god_mode_alert", 2500, "white", 0)
      if (this.cur_game_state) {
        if (this.cur_game_state instanceof WorldMapState) {
          this.cur_game_state.set_up_buttons();
        }
      }
    }
  }

  if(keyCode == controls.keys.MUTE_KEY) { //X = mute/unmute
    toggle_mute()
  }

  if(keyCode == controls.keys.FULLSCREEN_KEY) {
    toggleFullScreen()
  }

  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_key_down(keyCode)
    return
  }
  if (this.cur_game_state) {
    this.cur_game_state.on_key_down(keyCode)
  }
};

GameEngine.prototype.on_key_up = function(keyCode) {
  if(this.cur_dialog_box) {
    this.cur_dialog_box.on_key_up(keyCode)
    //do not return immediately. Allows player to disengage movement
  }
  if (this.cur_game_state) {
    this.cur_game_state.on_key_up(keyCode)
  }
};

game_engine = new GameEngine();
