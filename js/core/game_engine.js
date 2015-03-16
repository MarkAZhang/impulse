
var GameEngine = function() {
  this.cur_game_state = null;
  this.cur_dialog_box = null;
  this.cur_popup_message = null;
  this.stepId = 0;

  this.bgFile = null;
  this.bgAlpha = 0;
  this.switchBgDuration = null;
  this.switchBgTimer = 0;
  this.altBgAlpha = 0;
  this.altBgFile = null;
  this.lastTime = (new Date()).getTime();
};

GameEngine.prototype.switch_game_state = function (game_state) {
  if (this.cur_game_state) {
    this.cur_game_state.dispose();
  }
  this.cur_game_state = game_state
};


GameEngine.prototype.step = function () {
  var cur_time = (new Date()).getTime()
  layers.mainCtx.globalAlpha = 1;
  dt = cur_time - this.lastTime
  if (this.cur_dialog_box != null) {
    this.cur_dialog_box.process(dt);
  }
  if (this.cur_popup_message != null) {
    this.process_popup_message(dt)
  }

  if(!(this.cur_game_state instanceof ImpulseGameState)) {
    layers.mainCtx.clearRect(0, 0, canvas.width, canvas.height);
  } else if(this.cur_game_state instanceof ImpulseGameState &&  this.cur_game_state.ready) {
    if(this.cur_game_state.zoom != 1) {
      layers.mainCtx.fillStyle= this.cur_game_state.dark_color;
      layers.mainCtx.fillRect(dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight);
    } else {
      layers.mainCtx.clearRect(dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight);
    }

  }

  if (this.cur_game_state) {
    this.cur_game_state.process(dt)
    if(!(this.cur_game_state instanceof ImpulseGameState)) {
      layers.mainCtx.fillStyle = "black"
      layers.mainCtx.fillRect(0, 0, dom.sideBarWidth, dom.canvasHeight);
      layers.mainCtx.fillRect(dom.canvasWidth - dom.sideBarWidth, 0, dom.sideBarWidth, dom.canvasHeight);
      layers.mainCtx.translate(dom.sideBarWidth, 0)//allows us to have a topbar
      this.cur_game_state.draw(layers.mainCtx, layers.bgCtx);
      layers.mainCtx.translate(-dom.sideBarWidth, 0)//allows us to have a topbar
    } else {
      this.cur_game_state.draw(layers.mainCtx, layers.bgCtx);
      layers.mainCtx.save()
      this.cur_game_state.set_zoom_transparency(layers.mainCtx)
      layers.mainCtx.restore()
    }
  }


  if(this.cur_dialog_box!=null) {
    layers.mainCtx.save();
    layers.mainCtx.globalAlpha = 1
    this.cur_dialog_box.draw(layers.mainCtx)
    layers.mainCtx.restore();
  }

  if (this.cur_popup_message != null) {
    this.draw_popup_message(layers.mainCtx)
  }

  this.lastTime = cur_time
  var temp_dt = (new Date()).getTime() - cur_time
  var _this = this;
  this.stepId = setTimeout(function () {
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
  this.cur_popup_message.set_position(dom.canvasWidth/2, dom.canvasHeight - 10 - this.cur_popup_message.h)
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
      this.cur_game_state.on_mouse_move(mPos.x - dom.sideBarWidth, mPos.y)
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
      this.cur_game_state.on_mouse_down(mPos.x - dom.sideBarWidth, mPos.y)
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
      this.cur_game_state.on_right_mouse_down(mPos.x - dom.sideBarWidth, mPos.y)
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
      this.cur_game_state.on_mouse_up(mPos.x - dom.sideBarWidth, mPos.y)
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
      this.cur_game_state.on_right_mouse_up(mPos.x - dom.sideBarWidth, mPos.y)
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
      this.cur_game_state.on_click(mPos.x - dom.sideBarWidth, mPos.y)
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
      this.cur_game_state.on_right_click(mPos.x - dom.sideBarWidth, mPos.y)
    } else {
      this.cur_game_state.on_right_click(mPos.x, mPos.y)
    }
  }
};

GameEngine.prototype.on_key_down = function(keyCode) {
  if(keyCode == controls.keys.GOD_MODE_KEY && debugVars.god_mode_enabled) { //G = god mode
    if (debugVars.god_mode == false) {
      debugVars.god_mode = true
      this.set_popup_message("god_mode_alert", 2500, "white", 0)
      if (this.cur_game_state) {
        if (this.cur_game_state instanceof WorldMapState) {
          this.cur_game_state.set_up_buttons();
        }
      }
    }
  }

  if(keyCode == controls.keys.MUTE_KEY) { //X = mute/unmute
    game_engine.toggleMute()
  }

  if(keyCode == controls.keys.FULLSCREEN_KEY) {
    dom.toggleFullScreen()
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

// Send logging to server with Raven.
GameEngine.prototype.send_logging_to_server = function(msg, tags) {
  if (window.location.host === 'localhost') {
    window.console.log('LOGGING');
    window.console.log(msg);
    window.console.log(tags);
  } else {
    window["Raven"]["captureMessage"](msg, tags);
  }
};

GameEngine.prototype.toggleMute = function () {
  if(!music_player.mute) {
    music_player.mute_bg()
    music_player.mute_effects(true);
  } else {
    music_player.unmute_bg()
    music_player.mute_effects(false)
  }
  if (this.cur_dialog_box && this.cur_dialog_box instanceof OptionsMenu) {
    this.cur_dialog_box.sendMuteSignal(music_player.mute);
  }
};

GameEngine.prototype.switchBg = function(bg_file, duration, alpha) {
  // Only perform the switch if the bg_file is different.
  if (this.bgFile != bg_file) {
    this.switchBgDuration = duration;
    this.switchBgTimer = duration;
    var alt_title_bg_ctx = layers.altTitleBgCanvas.getContext('2d');
    // bg_file can also be a color.
    if (bg_file.substring(0, 1) == "#") {
      alt_title_bg_ctx.fillStyle = bg_file;
      alt_title_bg_ctx.fillRect(0, 0, dom.levelWidth, dom.levelHeight);
    } else {
      uiRenderUtils.tessellateBg(alt_title_bg_ctx, 0, 0, dom.levelWidth, dom.levelHeight, bg_file)
    }

    this.altBgAlpha = alpha;
    this.altBgFile = bg_file;
  }
}

// Will immediately draw the new bg onto the bg_ctx.
GameEngine.prototype.setBg = function(bg_file, alpha) {
  var title_bg_ctx = layers.titleBgCanvas.getContext('2d');
  if (bg_file.substring(0, 1) == "#") {
    title_bg_ctx.fillStyle = bg_file;
    title_bg_ctx.fillRect(0, 0, dom.levelWidth, dom.levelHeight);
  } else {
    uiRenderUtils.tessellateBg(title_bg_ctx, 0, 0, dom.levelWidth, dom.levelHeight, bg_file)
  }
  this.bgAlpha = alpha;
  this.bgFile = bg_file;

  layers.bgCtx.clearRect(0, 0, canvas.width, canvas.height);
  layers.bgCtx.fillStyle = "#000"
  layers.bgCtx.fillRect(0, 0, canvas.width, canvas.height);
  layers.bgCtx.globalAlpha = this.bgAlpha;

  layers.bgCtx.drawImage(layers.titleBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight);
  layers.bgCtx.globalAlpha = 1
}

GameEngine.prototype.processAndDrawBg = function(dt) {
  if (this.switchBgTimer > 0) {
    var prog = this.switchBgTimer / this.switchBgDuration;

    layers.bgCtx.clearRect(0, 0, canvas.width, canvas.height);
    layers.bgCtx.fillStyle = "#000"
    layers.bgCtx.fillRect(0, 0, canvas.width, canvas.height);
    layers.bgCtx.globalAlpha = prog * this.bgAlpha
    layers.bgCtx.drawImage(layers.titleBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight);
    layers.bgCtx.globalAlpha = (1 - prog) * this.altBgAlpha
    layers.bgCtx.drawImage(layers.altTitleBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, dom.sideBarWidth, 0, dom.levelWidth, dom.levelHeight);
    layers.bgCtx.globalAlpha = 1

    this.switchBgTimer -= dt;
  } else if (this.switchBgDuration != null) {
    // At the end of the transition, directly set the bg.
    this.switchBgDuration = null;
    this.setBg(this.altBgFile, this.altBgAlpha);
  }
}

game_engine = new GameEngine();
